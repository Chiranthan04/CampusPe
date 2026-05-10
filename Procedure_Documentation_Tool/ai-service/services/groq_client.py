import os
import time
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)

def call_groq(messages: list, temperature: float = 0.3, max_tokens: int = 1024) -> dict:
    attempts = 0
    last_error = None

    while attempts < 3:
        try:
            client = get_client()
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return {
                "result": response.choices[0].message.content,
                "is_fallback": False
            }
        except Exception as e:
            last_error = e
            attempts += 1
            wait_time = 2 ** attempts
            logger.error(f"Attempt {attempts} failed: {e}. Retrying in {wait_time}s...")
            time.sleep(wait_time)

    logger.error(f"All 3 attempts failed. Last error: {last_error}")
    return {
        "result": "AI service is temporarily unavailable. Please try again later.",
        "is_fallback": True
    }
