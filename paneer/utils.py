
import os
import re
import json
import logging
from langchain_groq import ChatGroq

class RagProcessor:
    def __init__(self, api_keys):
        self.api_keys = api_keys
        self.current_key_idx = 0
        if not api_keys:
            env_keys = os.getenv("GROQ_API_KEYS")
            if env_keys:
                 self.api_keys = env_keys.split(",")
            else:
                 self.api_keys = []
        
        self.llm = self._setup_llm()

    def _setup_llm(self):
        if not self.api_keys:
            return None
            
        current_key = self.api_keys[self.current_key_idx]
        return ChatGroq(
            api_key=current_key, 
            model_name="llama-3.1-8b-instant", 
            temperature=0,
            max_retries=0
        )

    def _call_llm_safe(self, prompt):
        if not self.llm:
            raise ValueError("LLM not initialized. Check GROQ_API_KEYS.")

        max_attempts = len(self.api_keys) * 2 
        
        for attempt in range(max_attempts):
            try:
                return self.llm.invoke(prompt)
            except Exception as e:
                error_msg = str(e).lower()
                if "429" in error_msg or "rate_limit" in error_msg:
                    logging.warning(f"Rate Limit hit on Key #{self.current_key_idx}. Rotating...")
                    self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                    self.llm = self._setup_llm()
                    continue
                else:
                    raise e
        raise Exception("ALL API keys are currently rate-limited or exhausted.")

    def create_audit_prompt(self, doc_text, url):
        return f"""
        Analyze this document from the NIT Trichy website.
        
        INPUT:
        URL: {url}
        CONTENT (Markdown/Text): 
        {doc_text}
        
        TASK:
        1. **Filter**: Discard if it is navigational junk, old tenders (<2023), or empty.
        2. **Rewrite/Structure**: 
           - If the content is narrative, rewrite it into a clear, dense paragraph.
           - **CRITICAL**: If the content contains **TABLES, SCHEDULES, or DATES**, PRESERVE the tabular structure using Markdown tables or bulleted lists. DO NOT flatten tables into paragraphs if it loses meaning.
           - Include the Source URL context (e.g., "According to the schedule at [URL]...").
        3. **Questions**: Generate 5-7 potential search keywords that this document is about for efficient retrieval.
        
        OUTPUT format must be a strictly valid JSON (list of 1 object). 
        DO NOT include any explanation or markdown formatting. Output ONLY the raw JSON string.
        
        [
          {{
            "url": "{url}",
            "status": "keep", 
            "audience": "Student",
            "topic": "General",
            "rewritten_text": "The content summary or markdown table...",
            "questions": ["hostel fee", "hostel fee payment", "hostel fee payment last date", "hostel fee payment link", "hostel fee payment deadline", "hostel fee payment last date 2025", "hostel fee payment link 2026"]
          }}
        ]
        """

    def parse_json_response(self, content):
        try:
            match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            
            clean = content.strip()
            if clean.startswith("```json"):
                clean = clean.replace("```json", "").replace("```", "")
            return json.loads(clean)
        except Exception as e:
            logging.error(f"JSON Parsing Failed: {e}")
            return []

    def process_document(self, text, url):
        prompt = self.create_audit_prompt(text, url)
        response = self._call_llm_safe(prompt)
        audit_json = self.parse_json_response(response.content)
        
        if not audit_json:
            return None
            
        res = audit_json[0]
        if res.get("status") != "keep":
            return None
            
        content = res.get("rewritten_text", "")
        questions = res.get("questions", [])
        
        if questions:
            content += "\n\nPotential Questions:\n" + "\n".join([f"- {q}" for q in questions])
            
        return {
            "content": content,
            "metadata": {
                "source_url": url,
                "audience": res.get("audience", "General"),
                "topic": res.get("topic", "General")
            }
        }

class RotatingGroqChat:
    def __init__(self, api_keys, model_name="llama-3.1-8b-instant", temperature=0, tools=None):
        self.api_keys = list(api_keys) if api_keys else []
        self.model_name = model_name
        self.temperature = temperature
        self.tools = tools or []
        self.current_key_idx = 0
        
        if not self.api_keys:
            env_keys = os.getenv("GROQ_API_KEYS")
            if env_keys:
                 if isinstance(env_keys, str):
                    if env_keys.startswith('['):
                        self.api_keys = json.loads(env_keys)
                    else:
                        self.api_keys = env_keys.split(',')
                 else:
                    self.api_keys = []
    
    def bind_tools(self, tools):
        return RotatingGroqChat(
            api_keys=self.api_keys,
            model_name=self.model_name,
            temperature=self.temperature,
            tools=tools
        )

    def _get_llm(self):
        if not self.api_keys:
             raise ValueError("No Groq API keys provided.")
             
        current_key = self.api_keys[self.current_key_idx].strip()
        llm = ChatGroq(
            api_key=current_key,
            model_name=self.model_name,
            temperature=self.temperature,
            max_retries=0
        )
        
        if self.tools:
            return llm.bind_tools(self.tools)
        return llm

    def stream(self, input, config=None, **kwargs):
        if not self.api_keys:
             raise ValueError("No Groq API keys available to stream.")

        max_attempts = len(self.api_keys) * 2
        
        for attempt in range(max_attempts):
            try:
                llm = self._get_llm()
                for chunk in llm.stream(input, config=config, **kwargs):
                    yield chunk
                return
                
            except Exception as e:
                logging.warning(f"Error in stream attempt {attempt}: {e}")
                error_msg = str(e).lower()
                if "429" in error_msg or "rate_limit" in error_msg or "too many requests" in error_msg:
                    logging.warning(f"Rate Limit hit on Key #{self.current_key_idx}. Rotating...")
                    self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                    continue
                else:
                    raise e
                    
        raise Exception("ALL API keys are currently rate-limited or exhausted.")

    def invoke(self, input, config=None, **kwargs):
        if not self.api_keys:
             raise ValueError("No Groq API keys available to invoke.")

        max_attempts = len(self.api_keys) * 2
        
        for attempt in range(max_attempts):
            try:
                llm = self._get_llm()
                return llm.invoke(input, config=config, **kwargs)
                
            except Exception as e:
                logging.warning(f"Error in invoke attempt {attempt}: {e}")
                error_msg = str(e).lower()
                if "429" in error_msg or "rate_limit" in error_msg or "too many requests" in error_msg:
                    logging.warning(f"Rate Limit hit on Key #{self.current_key_idx}. Rotating...")
                    self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                    continue
                else:
                    raise e
        raise Exception("ALL API keys are currently rate-limited or exhausted.")
