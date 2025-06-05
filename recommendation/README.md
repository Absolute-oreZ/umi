# UMI Recommendation Engine

This module uses Python and Mean Shift clustering to intelligently group learners into study teams.

## 📊 What is Mean Shift Clustering?

Mean Shift is an unsupervised learning algorithm that:
- Does not require you to predefine the number of clusters
- Identifies dense areas of data (clusters) by shifting centroids
- Suitable for exploratory data analysis

## ✅ Why Use It?

UMI deals with diverse learners without predefined categories. Mean Shift naturally groups them based on characteristics like:
- Learning styles
- Time zone
- Interests
- Language preference

## 🔄 Clustering Flow

1. User profile data is collected and preprocessed  
2. Mean Shift algorithm clusters learners based on features  
3. Each cluster is assigned to a study group  
4. Backend fetches and assigns users to the appropriate group

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.9+
- pip

### 1. Create Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Flask App
```bash
python app.py
```

### 4. Endpoint
```
http://localhost:5000/recommend
```

## 🔗 Example Request (Via Backend)
```json
POST /recommend
{
  "learners": [
    {
      "id": 1,
      "learningStyle": "visual",
      "timezone": "+9",
      "interests": ["AI", "Math"]
    }
  ]
}
```

## 🔗 Example Response
```json
{
  "grouped": [[1, 3], [2]]
}
```
