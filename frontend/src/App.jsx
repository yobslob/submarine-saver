import { useState } from 'react';
import './index.css';

function App() {
  const [bulkInput, setBulkInput] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Change this to your backend URL when deploying
  const API_URL = "https://submarine-saver.onrender.com";

  const handleBulkInputChange = (e) => {
    setBulkInput(e.target.value);
    setError('');
  };

  const handleRandomSample = () => {
    // Generate random values similar to sonar data (typically between 0 and 1)
    const randomValues = Array(60).fill(0).map(() =>
      (Math.random() * 0.4 + 0.2).toFixed(4)
    );
    setBulkInput(randomValues.join(', '));
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError('');

      // Parse input
      const features = bulkInput.split(',').map(val => parseFloat(val.trim()));

      if (features.length !== 60 || features.some(isNaN)) {
        setError('Please provide exactly 60 valid numeric values separated by commas.');
        setLoading(false);
        return;
      }

      // Call API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setBulkInput('');
    setPrediction(null);
    setError('');
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Submarine Sonar: Rock vs Mine Prediction</h1>

      <div className="app-card">
        <p className="app-description">
          This app uses a logistic regression model to classify sonar signals as either a rock or a mine.
        </p>

        <div className="input-section">
          <h3 className="section-title">Input Data</h3>
          <p className="input-description">
            Enter 60 comma-separated values from your sonar dataset:
          </p>
          <textarea
            value={bulkInput}
            onChange={handleBulkInputChange}
            className="textarea-input"
            placeholder="e.g., 0.0123, 0.0456, 0.0789, ... (60 values total)"
          />

          <div className="button-group">
            <button
              onClick={handleRandomSample}
              className="button button-blue"
            >
              Generate Random Sample
            </button>
            <button
              onClick={handleClear}
              className="button button-gray"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handlePredict}
          className="button button-green predict-button"
          disabled={loading || !bulkInput.trim()}
        >
          {loading ? 'Processing...' : 'Predict'}
        </button>

        {prediction && (
          <div className="prediction-result">
            <h2 className="section-title">Prediction Result:</h2>
            <div className="prediction-header">
              <div className={`prediction-class ${prediction.prediction === 'Mine' ? 'prediction-mine' : 'prediction-rock'}`}>
                {prediction.prediction.toUpperCase()}
              </div>
              <div className="prediction-confidence">
                (Confidence: {Math.round(prediction.confidence * 100) / 100}%)
              </div>
            </div>

            <div className="prediction-bar-container">
              <div
                className={`prediction-bar ${prediction.prediction === 'Mine' ? 'bar-mine' : 'bar-rock'}`}
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
            <div className="prediction-labels">
              <span>Rock</span>
              <span>Mine</span>
            </div>
          </div>
        )}
      </div>

      <div className="app-card">
        <h2 className="section-title">How It Works</h2>
        <p className="info-text">
          This app demonstrates a machine learning model that classifies submarine sonar signals.
          The logistic regression model was trained on the Sonar dataset with 60 numerical features
          representing sonar signals bounced off either rocks or metal cylinders (mines).
        </p>
        <ul className="info-list">
          <li>Input 60 comma-separated sonar frequency values (typically values between 0 and 1)</li>
          <li>Click "Predict" to run these values through the trained model</li>
          <li>The model will classify the signal as either a rock or a mine with a confidence score</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
