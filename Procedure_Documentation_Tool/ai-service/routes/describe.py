import re
from flask import Blueprint, request, jsonify
from services.groq_client import call_groq
from datetime import datetime, timezone

describe_bp = Blueprint('describe', __name__)

@describe_bp.route('/describe', methods=['POST'])
def describe():
    data = request.get_json()

    if not data or not data.get('content'):
        return jsonify({"error": "content field is required"}), 400

    content = data['content'].strip()

    if len(content) < 10:
        return jsonify({"error": "content is too short (minimum 10 characters)"}), 400

    # Sanitise input
    content = re.sub(r'<[^>]+>', '', content)

    # Injection detection
    injection_patterns = ["ignore previous", "forget instructions", "system:", "jailbreak"]
    for pattern in injection_patterns:
        if pattern.lower() in content.lower():
            return jsonify({"error": "Invalid input detected"}), 400

    # Load prompt
    with open('prompts/describe.txt', 'r') as f:
        prompt = f.read().replace('{{content}}', content)

    messages = [
        {"role": "system", "content": "You are a professional procedure documentation assistant."},
        {"role": "user", "content": prompt}
    ]

    result = call_groq(messages, temperature=0.3, max_tokens=1024)

    return jsonify({
        "description": result["result"],
        "is_fallback": result["is_fallback"],
        "generated_at": datetime.now(timezone.utc).isoformat()
    })
