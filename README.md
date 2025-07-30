# Heatmap Analytics Tool with AI Insights

A full-stack web analytics tool that tracks user clicks and mouse movements in real-time, visualizes heatmaps, and generates human-readable AI-powered insights about user behavior on your website.

## Features

- **Live Interaction Tracking**: Records all user clicks and mouse movements with throttling and batching.
- **Heatmap Visualization**: Displays transparent overlays showing hotspots of user activity.
- **AI-Powered Insights**: Uses machine learning clustering to analyze interactions and generates natural language summaries describing the most engaged page areas.
- **Simple Setup**: Full code for frontend React app and backend Flask server with MongoDB.
- **Page-specific Filtering**: Tracks interactions on a per-page basis for granular insight.
- **Batching & Throttling**: Efficient event batching and mousemove throttling for performance.

## Tech Stack

- **Frontend**: React.js, simpleheat.js (for heatmap overlay)
- **Backend**: Flask (Python), PyMongo
- **Database**: MongoDB
- **Machine Learning**: scikit-learn (KMeans clustering) and numpy

## Prerequisites

- Node.js (v14+ recommended)
- Python 3.8+
- MongoDB (running locally or accessible URI)
- `pip` Python package manager


## Installation & Setup

### 1. Clone the Repository

git clone https://github.com/PRODIGAL-AI-Team-05/new-code.git
cd heatmap-ai-analytics


### 2. Backend Setup

- Navigate to the backend directory (if split) or root if combined.

- Create a Python virtual environment (optional but recommended):

python -m venv venv
source venv/bin/activate # Linux/macOS
venv\Scripts\activate # Windows

- Install required Python packages:

pip install flask flask-cors pymongo scikit-learn numpy

- Ensure MongoDB is running locally (default port 27017) or update MongoDB URI in `app.py`.

- Run the Flask server:

python app.py


- API will be available at: `http://localhost:5000`

---

### 3. Frontend Setup

- Navigate to the frontend directory (e.g., `frontend` or root if combined).

- Install dependencies:

npm install


- Make sure `simpleheat.js` is present in `src/lib/simpleheat.js` (download from https://github.com/mourner/simpleheat).

- Start the frontend development server:

├── app.py # Flask backend with API routes and AI insights
├── frontend/ # React frontend app
│ ├── src/
│ │ ├── components/
│ │ │ ├── AIInsightsText.js
│ │ │ ├── HeatmapDashboardHeader.js
│ │ │ ├── InteractionTracker.js
│ │ │ ├── LiveHeatmapOverlay.js
│ │ ├── lib/
│ │ │ └── simpleheat.js
│ │ └── App.js
├── README.md # This file

---

## Configuration

- Modify `PAGE_REGIONS` in `app.py` to match your website’s layout with accurate x/y coordinate boundaries for meaningful AI textual insights.

---

## Notes & Tips

- The backend batches incoming user interaction events every 5 seconds for efficiency.

- The AI-powered `/api/ai-insights-text` endpoint generates summarized insights by grouping interactions per predefined page region.

- Make sure the frontend and backend use normalized page URLs (lowercase, no trailing slash) to ensure consistent filtering.

- MongoDB must be accessible and running before starting the backend.

- For production, consider securing API endpoints with authentication and enabling HTTPS.

---

## Future Improvements

- Add more detailed AI models for anomaly detection and predictive analysis.

- Support different device types and user segmentation for personalized insights.

- Store and visualize scroll depth and dwell time.

- Integrate with session recording tools and sentiment analysis.

---

## License

MIT License © [Krish Gupta]

---

## Contact

For questions, support, or contributions, open an issue or contact: [krishgupta24august@gmail.com]
