"""
Utility functions for the credibility analysis system.
"""

import re
from datetime import datetime


def validate_text_input(text):
    """
    Validate text input for analysis.
    
    Args:
        text (str): The text to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    
    if not text:
        return False, "Text content is required."
    
    if len(text.strip()) < 10:
        return False, "Text must be at least 10 characters long."
    
    if len(text) > 50000:
        return False, "Text is too long. Maximum 50,000 characters allowed."
    
    return True, ""


def extract_urls(text):
    """
    Extract URLs from text.
    
    Args:
        text (str): The text to extract URLs from
        
    Returns:
        list: List of URLs found in the text
    """
    
    url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'
    return re.findall(url_pattern, text)


def calculate_text_stats(text):
    """
    Calculate various statistics about the text.
    
    Args:
        text (str): The text to analyze
        
    Returns:
        dict: Dictionary containing text statistics
    """
    
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s for s in sentences if s.strip()]
    
    return {
        'word_count': len(words),
        'sentence_count': len(sentences),
        'character_count': len(text),
        'avg_word_length': sum(len(w) for w in words) / max(len(words), 1) if words else 0,
        'avg_sentence_length': len(words) / max(len(sentences), 1) if sentences else 0,
    }


def format_credibility_result(result):
    """
    Format the credibility result for display.
    
    Args:
        result (dict): The raw result from the analyzer
        
    Returns:
        dict: Formatted result for display
    """
    
    score = result.get('score', 0)
    is_credible = result.get('is_credible')
    
    # Determine label based on score
    if score >= 0.8:
        label = "Highly Credible"
    elif score >= 0.6:
        label = "Credible"
    elif score >= 0.4:
        label = "Neutral"
    elif score >= 0.2:
        label = "Questionable"
    else:
        label = "Not Credible"
    
    # Color coding for display
    if score >= 0.7:
        color = "green"
    elif score >= 0.4:
        color = "yellow"
    else:
        color = "red"
    
    return {
        'score': score,
        'label': label,
        'color': color,
        'confidence': result.get('confidence', 'low'),
        'is_credible': is_credible,
        'factors': result.get('factors', {}),
        'recommendations': result.get('recommendations', ''),
    }


def get_timestamp():
    """Get current timestamp in a consistent format."""
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def sanitize_input(text):
    """
    Sanitize user input by removing potentially harmful content.
    
    Args:
        text (str): The text to sanitize
        
    Returns:
        str: Sanitized text
    """
    
    # Remove any HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()