from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os

app = FastAPI(title="Sonar Rock vs Mine Prediction API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check if model files exist, if not, train the model
if not os.path.exists("sonar_model.joblib") or not os.path.exists("sonar_scaler.joblib"):
    print("Model files not found. Training model...")
    import train_model  # This will train and save the model

# Load model and scaler
model = joblib.load("sonar_model.joblib")
scaler = joblib.load("sonar_scaler.joblib")

class SonarData(BaseModel):
    features: list[float]

@app.post("/predict/")
async def predict(data: SonarData):
    """
    Make a prediction using the trained logistic regression model.
    Expects exactly 60 sonar frequency features.
    """
    if len(data.features) != 60:
        raise HTTPException(status_code=400, detail=f"Expected 60 features, got {len(data.features)}")
    
    try:
        # Convert to numpy array and reshape
        features = np.array(data.features).reshape(1, -1)
        
        # Scale features
        scaled_features = scaler.transform(features)
        
        # Get prediction and probability
        prediction = model.predict(scaled_features)[0]
        probability = model.predict_proba(scaled_features)[0][1]
        
        return {
            "prediction": "Mine" if prediction == 1 else "Rock",
            "probability": float(probability),
            "confidence": float(probability if prediction == 1 else 1 - probability) * 100
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Sonar Rock vs Mine Prediction API. Use /predict/ endpoint to make predictions."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)