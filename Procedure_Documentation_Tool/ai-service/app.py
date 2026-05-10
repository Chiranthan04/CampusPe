import os
import re
from dotenv import load_dotenv

# Load .env FIRST before anything else
load_dotenv()

from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.report import report_bp
from routes.health import health_bp

app = Flask(__name__)

# Rate limiting — 30 requests per minute per IP
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["30 per minute"],
    storage_uri="memory://"
)

# Register blueprints
app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(report_bp)
app.register_blueprint(health_bp)

# Global input sanitisation middleware
@app.before_request
def sanitise_input():
    if request.method == "POST" and request.is_json:
        data = request.get_json(silent=True)
        if data:
            content = data.get("content", "")
            injection_patterns = [
                "ignore previous",
                "forget instructions",
                "system:",
                "jailbreak"
            ]
            for pattern in injection_patterns:
                if pattern.lower() in content.lower():
                    return jsonify({"error": "Invalid input detected"}), 400

# Security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
