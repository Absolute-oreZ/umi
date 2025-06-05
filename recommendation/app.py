import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from utils.auth import validate_service_token
from utils.preprocessor import preprocess_for_model

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load model
MODEL_PATH = os.getenv("MODEL_PATH", "models/clustering_model.pkl")


@app.route("/predict-cluster", methods=["POST"])
@validate_service_token
def predict_cluster():
    data = request.json

    try:
        # Load model artifacts
        with open(MODEL_PATH, "rb") as f:
            model_data = pickle.load(f)

        model = model_data["model"]
        scaler = model_data["scaler"]
        feature_names = model_data["feature_names"]

        # Preprocess input
        features = preprocess_for_model(
            {
                "learningStyles": data.get("learningStyles", []),
                "personality": data.get("personality", ""),
                "country": data.get("country", ""),
            },
            feature_names,
        )

        # Scale and predict
        scaled = scaler.transform([features])
        cluster_id = int(model.predict(scaled)[0])

        return jsonify(
            {
                "clusterId": cluster_id
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check model loading status
        model_loaded = False
        if os.path.exists(MODEL_PATH):
            print("path exists")
            with open(MODEL_PATH, "rb") as f:
                model_data = pickle.load(f)
                model_loaded = all(
                    key in model_data for key in ["model", "scaler", "feature_names"]
                )
                print(f"Model check: {model_loaded}")
        else:
            print("path not exists")

        return jsonify(
            {
                "status": "healthy",
                "model_loaded": model_loaded,
                "service": "recommendation",
                "version": "1.0.0",
            }
        )

    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500
