import pandas as pd

def preprocess_for_model(data, feature_names):
    """Mirror exactly what train_model.py does for live predictions"""
    
    # Initialize all features with 0
    features = {fn: 0 for fn in feature_names}
    
    # 1. Learning Styles (VARK)
    styles = [s.strip().upper() for s in data.get('learningStyles', [])]
    for style in ['V', 'A', 'R', 'K']:
        features[style] = 1 if style in styles else 0
    
    # 2. MBTI Personality (binary encoding)
    personality = data.get('personality', '').upper().strip()
    if len(personality) == 4:
        # Orientation (E/I)
        features['MBTI_Orientation'] = 1 if personality[0] == 'E' else 0
        # Perception (N/S)
        features['MBTI_Perception'] = 1 if personality[1] == 'N' else 0
        # Decision (T/F)
        features['MBTI_Decision'] = 1 if personality[2] == 'T' else 0
        # Lifestyle (J/P)
        features['MBTI_Lifestyle'] = 1 if personality[3] == 'J' else 0
    
    # 3. Country (grouping)
    country = data.get('country', '').strip()
    country_key = f"Country_{country}" if f"Country_{country}" in feature_names else "Country_Other"
    features[country_key] = 1
    
    # Ensure correct order and existence of all features
    return [features[fn] for fn in feature_names]