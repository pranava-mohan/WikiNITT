import os
import json
import chromadb

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from sentence_transformers import CrossEncoder
from utils import RotatingGroqChat
from pydantic import BaseModel, Field
from langchain_core.tools import Tool
from langchain_classic.storage import create_kv_docstore
from langchain_classic.retrievers.parent_document_retriever import ParentDocumentRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter

from dotenv import load_dotenv
from postgres_store import PostgresByteStore

load_dotenv()

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
RERANKER_MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
try:
    print(f"Loading Reranker: {RERANKER_MODEL_NAME}...")
    RERANKER_INSTANCE = CrossEncoder(RERANKER_MODEL_NAME)
    print("Reranker loaded.")
except Exception as e:
    print(f"Failed to load Reranker: {e}")
    RERANKER_INSTANCE = None

GROQ_API_KEYS = os.getenv("GROQ_API_KEYS")

POSTGRES_CONNECTION_STRING = os.getenv('POSTGRES_CONNECTION_STRING', "postgresql://nitt_user:nitt_password@localhost:5432/nitt_rag_store")
CHROMA_HOST = os.getenv('CHROMA_HOST', "localhost")
CHROMA_PORT = int(os.getenv('CHROMA_PORT', 8001))


def format_docs(docs):
    formatted_docs = []
    for doc in docs:
        source = doc.metadata.get("source_url", "Unknown Source")
        content = doc.page_content.replace("\n", " ")
        formatted_docs.append(f"Content: {content}\nSource: {source}")
    return "\n\n".join(formatted_docs)


def get_retriever():
    print("Loading Embedding Model...")
    embedding_function = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    print(f"Connecting to Remote ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}...")
    try:
        client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
        vector_db = Chroma(
            client=client,
            embedding_function=embedding_function,
            collection_name="nitt_data"
        )
    except Exception as e:
        print(f"Error connecting to ChromaDB: {e}")
        return None
    
    print(f"Connecting to Parent Store (Postgres)...")
    try:
        fs_store = PostgresByteStore(connection_string=POSTGRES_CONNECTION_STRING, table_name="doc_store")
        store = create_kv_docstore(fs_store)
    except Exception as e:
        print(f"Error connecting to Postgres: {e}")
        return None
    
    child_splitter = RecursiveCharacterTextSplitter(chunk_size=256, chunk_overlap=32)
    parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)

    retriever = ParentDocumentRetriever(
        vectorstore=vector_db,
        docstore=store,
        child_splitter=child_splitter,
        parent_splitter=parent_splitter,
        search_kwargs={"k": 30}
    )
    return retriever

def get_chat_agent():
    api_keys = []
    if GROQ_API_KEYS:
        if GROQ_API_KEYS.startswith('['):
            api_keys = json.loads(GROQ_API_KEYS)
        else:
            api_keys = GROQ_API_KEYS.split(',')
            
    if not api_keys:
        print("Error: GROQ_API_KEYS not found. Please set it.")
        return None, []

    retriever = get_retriever()
    if not retriever:
        return None, []

    class SearchInput(BaseModel):
        query: str = Field(description="The query to search for information about NIT Trichy.")

    def search_nitt_func(query: str):
        print(f"SEARCH_DEBUG: Tool invoked with query: '{query}'")
        try:
            docs = retriever.invoke(query)
            print(f"SEARCH_DEBUG: Retrieved {len(docs) if docs else 0} documents.")
        except Exception as e:
            print(f"SEARCH_ERROR: Implementation failed: {e}")
            return f"INTERNAL ERROR: Search failed due to {e}"
            
        if not docs:
            print(f"SEARCH_DEBUG: No results found.")
            return f"No results found for query: '{query}'. The database does not contain information matching this query."
        
        if docs:
            print(f"SEARCH_DEBUG: Retrieved {len(docs)} documents. Reranking...")
            
            try:
                reranker = RERANKER_INSTANCE
                if not reranker:
                    print("SEARCH_WARNING: Reranker not initialized, using lazy load fallback.")
                    reranker = CrossEncoder(RERANKER_MODEL_NAME)
                
                pairs = [[query, doc.page_content] for doc in docs]
                
                scores = reranker.predict(pairs)
                
                scored_docs = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
                
                print(f"SEARCH_DEBUG: Top 3 Re-ranked Scores: {[s[1] for s in scored_docs[:3]]}")
                
                final_docs = [doc for doc, score in scored_docs[:15]]
                
                print(f"SEARCH_DEBUG: Top Result after re-ranking: {final_docs[0].page_content[:100]}...")
                return format_docs(final_docs)
                
            except Exception as e:
                print(f"SEARCH_WARNING: Re-ranking failed ({e}), falling back to original Top 15.")
                return format_docs(docs[:15])

        return format_docs(docs)

    tool = Tool(
        name="search_nitt_data",
        func=search_nitt_func,
        description="Searches for information about NIT Trichy. INPUT RULES: 1. Use specific proper nouns (e.g., 'Vasu', 'Uma', 'Hostel Opal'). 2. Do NOT infer context from previous queries unless explicitly asked. 3. If searching for a person, include their department or their other relevant information if known.",
        args_schema=SearchInput
    )
    tools = [tool]
    
    llm = RotatingGroqChat(
        api_keys=api_keys,
        model_name="llama-3.1-8b-instant",
        temperature=0.3
    )
    
    llm_with_tools = llm.bind_tools(tools)
    return llm_with_tools, tools
