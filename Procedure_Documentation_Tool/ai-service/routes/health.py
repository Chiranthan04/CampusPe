import time
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)
start_time = time.time()
request_times = []

@health_bp.route('/health', methods=['GET'])
def health():
    uptime_seconds = int(time.time() - start_time)
    avg_response_time = (
        round(sum(request_times) / len(request_times), 3)
        if request_times else 0
    )
    return jsonify({
        "status": "ok",
        "model": "llama-3.3-70b-versatile",
        "uptime_seconds": uptime_seconds,
        "avg_response_time": avg_response_time,
        "port": 5000
    })
