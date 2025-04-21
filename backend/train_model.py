import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
import os

def train_and_save_model():
    # Check if data file exists
    data_path = os.path.join("data/raw", "sonar_data.csv")
    if not os.path.exists(data_path):
        print(f"Error: Data file not found at {data_path}")
        return
    
    # Load data
    sonar_data = pd.read_csv(data_path, header=None)
    y = sonar_data[60].map({'R': 0, 'M': 1})  # 0 = Rock, 1 = Mine
    X = sonar_data.iloc[:, :-1]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.1, stratify=y, random_state=1)
    
    # Train model
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # Evaluate model
    X_test_prediction = model.predict(X_test)
    testing_data_accuracy = accuracy_score(X_test_prediction, y_test)
    print(f'Accuracy on test data: {int(testing_data_accuracy*100)}%')
    
    # Save model and scaler
    joblib.dump(model, "sonar_model.joblib")
    joblib.dump(scaler, "sonar_scaler.joblib")
    print("Model and scaler saved successfully.")

if __name__ == "__main__":
    train_and_save_model()