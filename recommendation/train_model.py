import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import pickle

def preprocess_data(df):
    
    # Clean column names
    df.columns = [col.split('\n')[0].strip() for col in df.columns]
    
    # Handle learning styles
    df['Learning Styles'] = df['Learning Styles (VARK)'].str.upper().str.replace(' ', '')
    df['Learning Styles'] = df['Learning Styles'].str.split(',')
    style_dummies = df['Learning Styles'].explode().str.get_dummies().groupby(level=0).max()
    style_dummies = style_dummies.reindex(columns=['V', 'A', 'R', 'K'], fill_value=0)
    
    # Process MBTI personality (binary encoding)
    mbti_mapping = [
        {'E': 1, 'I': 0},  # Orientation
        {'N': 1, 'S': 0},  # Perception
        {'T': 1, 'F': 0},  # Decision-making
        {'J': 1, 'P': 0}   # Lifestyle
    ]
    
    mbti_features = pd.DataFrame()
    for i, letter in enumerate(['Orientation', 'Perception', 'Decision', 'Lifestyle']):
        mbti_features[f'MBTI_{letter}'] = df['Personality (MBTI)'].str[i].map(mbti_mapping[i])
    
    # Process country (group rare)
    country_counts = df['Country'].value_counts()
    df['Country_Group'] = df['Country'].apply(
        lambda x: x if country_counts.get(x, 0) >= 5 else 'Other'
    )
    country_dummies = pd.get_dummies(df['Country_Group'], prefix='Country')
    
    # Combine all features
    return pd.concat([style_dummies, mbti_features, country_dummies], axis=1)

def train_and_save_model():
    # Load and preprocess data
    df = pd.read_csv('data/Data.csv')
    processed_df = preprocess_data(df)
    
    # Save feature names
    feature_names = processed_df.columns.tolist()
    
    # Scale features
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(processed_df)
    
    # Train model
    model = KMeans(n_clusters=5, random_state=42, n_init=10)
    clusters = model.fit_predict(scaled_data)
    
    # Evaluate
    silhouette = silhouette_score(scaled_data, clusters)
    print(f"Silhouette Score: {silhouette:.2f}")
    
    # Save artifacts
    with open('models/clustering_model.pkl', 'wb') as f:
        pickle.dump({
            'model': model,
            'scaler': scaler,
            'feature_names': feature_names,
            'silhouette_score': silhouette,
            'mbti_mapping': [
                'E=1/I=0', 
                'N=1/S=0', 
                'T=1/F=0', 
                'J=1/P=0'
            ]
        }, f)

if __name__ == '__main__':
    train_and_save_model()