# pipelines.py
import os
import json
import logging
from typing import List
from scrapy.exceptions import DropItem

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_classic.storage import LocalFileStore
from langchain_classic.retrievers.parent_document_retriever import ParentDocumentRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_groq import ChatGroq
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
        
from postgres_store import PostgresByteStore
from langchain_classic.storage import create_kv_docstore
from bs4 import BeautifulSoup
import re

    

class SmartRagPipeline:
    def aggressive_clean(self, text):
        """Reduces token count by stripping HTML overhead."""
        if not text: return ""
        if "<html" in text or "<div" in text:
            soup = BeautifulSoup(text, "lxml")
            for script in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
                script.extract()
            text = soup.get_text(separator=" ")
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'Page \d+ of \d+', '', text)
        text = re.sub(r'Copyright © \d+ National Institute of Technology', '', text)
        return text

    def __init__(self, groq_api_keys, pg_conn_str, chroma_host, chroma_port):
        self.groq_api_keys = groq_api_keys
        self.current_key_idx = 0
        
        self.pg_conn_str = pg_conn_str
        self.chroma_host = chroma_host
        self.chroma_port = chroma_port
        
        self.buffer = [] 
        self.BUFFER_SIZE = 5 
        
        self.llm = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            groq_api_keys=crawler.settings.get('GROQ_API_KEYS'),
            pg_conn_str=crawler.settings.get('POSTGRES_CONNECTION_STRING'),
            chroma_host=crawler.settings.get('CHROMA_HOST'),
            chroma_port=crawler.settings.get('CHROMA_PORT')
        )

    def _setup_llm(self):
        """Helper to initialize the LLM with the currently selected key"""
        current_key = self.groq_api_keys[self.current_key_idx]
        masked_key = current_key[:4] + "..." + current_key[-4:]
        logging.info(f"🔑 Initializing LLM with Key Index {self.current_key_idx} ({masked_key})")
        
        self.llm = ChatGroq(
            api_key=current_key, 
            model_name="llama-3.1-8b-instant", 
            temperature=0,
            max_retries=0
        )

    def open_spider(self, spider):
        logging.info("🚀 RAG Pipeline: Initializing Vector DB & LLM...")
        
        if not self.groq_api_keys or not isinstance(self.groq_api_keys, list):
            raise ValueError("⚠️ GROQ_API_KEYS must be a list in settings.py!")

        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        import chromadb
        client = chromadb.HttpClient(host=self.chroma_host, port=self.chroma_port)
        
        self.vectorstore = Chroma(
            client=client,
            collection_name="nitt_data",
            embedding_function=self.embeddings,
        )

        fs_store = PostgresByteStore(connection_string=self.pg_conn_str, table_name="doc_store")
        store = create_kv_docstore(fs_store)
        
        child_splitter = RecursiveCharacterTextSplitter(chunk_size=256, chunk_overlap=32)
        parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)

        self.retriever = ParentDocumentRetriever(
            vectorstore=self.vectorstore,
            docstore=store,
            child_splitter=child_splitter,
            parent_splitter=parent_splitter,
        )

        self._setup_llm()

    def close_spider(self, spider):
        if self.buffer:
            self.process_batch(self.buffer)
        logging.info("✅ RAG Pipeline: Ingestion complete.")

    def process_item(self, item, spider):
        if item['file_type'] == 'pdf':
            clean_text = item['raw_text'].strip()
        else:
            clean_text = self.aggressive_clean(item.get('raw_text', ''))
        
        if len(clean_text) < 100: 
            raise DropItem(f"Content empty: {item['url']}")
            
        item['cleaned_text'] = clean_text
        self.buffer.append(item)
        
        current_buffer_tokens = sum([len(i['cleaned_text']) for i in self.buffer]) / 4
        
        if current_buffer_tokens >= 3000:
            self.process_batch(self.buffer)
            self.buffer = []
            
        return item

    def _call_llm_safe(self, prompt):
        """
        Executes LLM call with Automatic Key Rotation on 429 Errors.
        """
        max_attempts = len(self.groq_api_keys) * 2 
        
        for attempt in range(max_attempts):
            try:
                return self.llm.invoke(prompt)
                
            except Exception as e:
                error_msg = str(e).lower()
                
                if "429" in error_msg or "rate_limit" in error_msg or "too many requests" in error_msg:
                    logging.warning(f"⚠️ Rate Limit hit on Key #{self.current_key_idx}. Rotating...")
                    
                    self.current_key_idx = (self.current_key_idx + 1) % len(self.groq_api_keys)
                    
                    self._setup_llm()
                    
                    continue
                else:
                    logging.error(f"❌ LLM Error (Non-RateLimit): {e}")
                    raise e
        
        raise Exception("❌ ALL API keys are currently rate-limited or exhausted.")

    def process_batch(self, items):
        logging.info(f"⚡ RAG Pipeline: Auditing batch of {len(items)} items...")
        
        batch_docs = []
        for it in items:
            batch_docs.append({
                "url": it['url'],
                "text": it['cleaned_text'][:3500],
                "type": it['file_type']
            })

        try:
            prompt = self._create_audit_prompt(batch_docs)
            
            response = self._call_llm_safe(prompt)
            logging.info(f"🤖 LLM Response: {response.content}")
            
            audit_json = self._parse_json_response(response.content)
            logging.info(f"🔍 Audit JSON Response: {json.dumps(audit_json, indent=2)}")
            
            cleaned_docs_to_index = []
            for res in audit_json:
                if res.get("status") == "keep":
                    original_item = next((x for x in items if x['url'] == res['url']), None)
                    if original_item:
                        # Append questions to content for better retrieval (HyDE approach)
                        content = res.get("rewritten_text", "")
                        questions = res.get("questions", [])
                        if questions:
                            content += "\n\nPotential Questions:\n" + "\n".join([f"- {q}" for q in questions])
                        
                        doc = Document(
                            page_content=content,
                            metadata={
                                "source_url": original_item['url'],
                                "title": original_item.get('title', ''),
                                "audience": res.get("audience", "General"),
                                "topic": res.get("topic", "General"),
                                "content_type": original_item['file_type']
                            }
                        )
                        cleaned_docs_to_index.append(doc)

            logging.info(f"📊 Documents to Index: {len(cleaned_docs_to_index)}")
            if cleaned_docs_to_index:
                self.retriever.add_documents(cleaned_docs_to_index)
                logging.info(f"💾 Indexed {len(cleaned_docs_to_index)} documents.")

        except Exception as e:
            logging.error(f"❌ Batch Processing Failed: {e}")

    def _create_audit_prompt(self, docs):
        docs_text = ""
        for i, d in enumerate(docs):
            docs_text += f"\n--- DOCUMENT {i} ---\nURL: {d['url']}\nCONTENT: {d['text']}\n"
            
        return f"""
        Analyze these documents from the NIT Trichy website.
        
        INPUTS:
        {docs_text}
        
        TASK:
        1. **Filter**: Discard if it is navigational junk, old tenders (<2023), or empty.
        2. **Rewrite**: If valid, rewrite the content into a clear, dense paragraph. 
           - **CRITICAL**: Include the Source URL and context (e.g., "According to the PhD regulations at [URL]...").
        3. **Questions**: Generate 5-7 potential search keywords that this document is about for efficient retrieval.
        
        OUTPUT format must be a strictly valid JSON list. 
        DO NOT include any explanation, preamble, or markdown formatting (no ```json). 
        Output ONLY the raw JSON string.
        
        [
          {{
            "url": "original_url_here",
            "status": "keep", 
            "audience": "Student",
            "topic": "Hostel Fees",
            "rewritten_text": "The hostel fees...",
            "questions": ["hostel fee", "hostel fee payment", "hostel fee payment last date", "hostel fee payment link", "hostel fee payment deadline", "hostel fee payment last date 2025", "hostel fee payment link 2026"]
          }}
        ]
        """

    def _parse_json_response(self, content):
        try:
            # Safer regex: look for list starting with object
            match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            if match:
                json_str = match.group(0)
                return json.loads(json_str)
            
            # Fallback
            clean = content.strip()
            if clean.startswith("```json"):
                clean = clean.replace("```json", "").replace("```", "")
            return json.loads(clean)
        except Exception as e:
            logging.error(f"❌ JSON Parsing Failed: {e}")
            logging.error(f"   Content was: {content[:500]}...") 
            return []       