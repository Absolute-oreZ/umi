import os
from functools import wraps
from dotenv import load_dotenv
from flask import request, jsonify


load_dotenv()

SERVICE_TOKEN = os.getenv('SERVICE_TOKEN')

def validate_service_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error":"Missing authorization header"}),401
        
        try:
            token_type,token = auth_header.split()
            if token_type.lower() != 'bearer' or token != SERVICE_TOKEN:
                raise ValueError
        except:
            return jsonify({"error":"Invalid token format"}), 401
        
        return f(*args, **kwargs)
    
    return decorated