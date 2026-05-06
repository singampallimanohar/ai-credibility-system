"""
Credibility Analysis ML Model

This module provides functionality for analyzing the credibility of text content.
It uses various NLP techniques and heuristics to determine credibility scores.
"""

import re
import math
from collections import Counter


class CredibilityAnalyzer:
    """Analyzer for determining credibility of text content."""
    
    def __init__(self):
        self.credible_indicators = [
            'according to', 'research shows', 'studies show', 
            'data indicates', 'evidence suggests', 'official',
            'verified', 'confirmed', 'sources say', 'reportedly'
        ]
        
        self.non_credible_indicators = [
            'click here', 'act now', 'limited time', 'exclusive',
            'shocking', 'you won\'t believe', 'miracle', 'cure',
            'lose weight fast', 'make money fast', 'guaranteed'
        ]
    
    def analyze(self, text):
        """
        Analyze text and return credibility assessment.
        
        Args:
            text (str): The text content to analyze
            
        Returns:
            dict: Dictionary containing credibility score and factors
        """
        
        if not text or len(text.strip()) < 10:
            return {
                'score': 0.5,
                'confidence': 'low',
                'is_credible': None,
                'factors': {},
                'recommendations': 'Text is too short to analyze properly.'
            }
        
        # Calculate various factors
        factors = {
            'length_score': self._calculate_length_score(text),
            'sentiment_score': self._calculate_sentiment_score(text),
            'indicator_score': self._calculate_indicator_score(text),
            'structure_score': self._calculate_structure_score(text),
            'url_presence': bool(re.search(r'https?://', text)),
            'uppercase_ratio': self._calculate_uppercase_ratio(text),
            'special_chars_ratio': self._calculate_special_chars_ratio(text),
        }
        
        # Calculate weighted credibility score
        score = self._calculate_credibility_score(factors)
        
        # Determine confidence level
        confidence = self._determine_confidence(factors, text)
        
        # Determine if credible (threshold-based)
        is_credible = score >= 0.5
        
        # Generate recommendations
        recommendations = self._generate_recommendations(factors, text)
        
        return {
            'score': round(score, 2),
            'confidence': confidence,
            'is_credible': is_credible,
            'factors': factors,
            'recommendations': recommendations
        }
    
    def _calculate_length_score(self, text):
        """Calculate score based on text length."""
        length = len(text)
        
        if length < 100:
            return 0.3
        elif length < 300:
            return 0.5
        elif length < 1000:
            return 0.8
        else:
            return 1.0
    
    def _calculate_sentiment_score(self, text):
        """Calculate sentiment-related credibility indicators."""
        # Simple heuristic: balanced content is more credible
        positive_words = len(re.findall(r'\b(good|great|excellent|amazing|wonderful)\b', text.lower()))
        negative_words = len(re.findall(r'\b(bad|terrible|awful|horrible|worst)\b', text.lower()))
        
        if positive_words == 0 and negative_words == 0:
            return 0.5  # Neutral is neutral
        
        ratio = min(positive_words, negative_words) / max(positive_words, negative_words, 1)
        return min(ratio, 1.0)
    
    def _calculate_indicator_score(self, text):
        """Calculate score based on credibility indicators."""
        text_lower = text.lower()
        
        credible_count = sum(1 for indicator in self.credible_indicators if indicator in text_lower)
        non_credible_count = sum(1 for indicator in self.non_credible_indicators if indicator in text_lower)
        
        total = credible_count + non_credible_count
        if total == 0:
            return 0.5
        
        return credible_count / total
    
    def _calculate_structure_score(self, text):
        """Calculate score based on text structure."""
        # Check for proper punctuation
        has_periods = bool(re.search(r'\.', text))
        has_commas = bool(re.search(r',', text))
        
        # Check for paragraph structure
        paragraphs = text.split('\n\n')
        has_multiple_paragraphs = len(paragraphs) > 1
        
        # Check for proper capitalization
        sentences = re.split(r'[.!?]+', text)
        proper_capitalization = sum(1 for s in sentences if s and s[0].isupper()) / max(len(sentences), 1)
        
        score = 0
        if has_periods:
            score += 0.3
        if has_commas:
            score += 0.2
        if has_multiple_paragraphs:
            score += 0.3
        if proper_capitalization > 0.8:
            score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_uppercase_ratio(self, text):
        """Calculate ratio of uppercase characters."""
        alpha_chars = [c for c in text if c.isalpha()]
        if not alpha_chars:
            return 0
        
        uppercase_count = sum(1 for c in alpha_chars if c.isupper())
        ratio = uppercase_count / len(alpha_chars)
        
        # High uppercase ratio is suspicious
        if ratio > 0.7:
            return 0.2
        elif ratio > 0.5:
            return 0.5
        elif ratio > 0.3:
            return 0.8
        return 1.0
    
    def _calculate_special_chars_ratio(self, text):
        """Calculate ratio of special characters."""
        special_chars = re.findall(r'[!@#$%^&*()_+=\[\]{}|\\:;"\'<>,./?`-]', text)
        
        if not text:
            return 1.0
        
        ratio = len(special_chars) / len(text)
        
        # Too many special characters is suspicious
        if ratio > 0.2:
            return 0.2
        elif ratio > 0.1:
            return 0.5
        elif ratio > 0.05:
            return 0.8
        return 1.0
    
    def _calculate_credibility_score(self, factors):
        """Calculate weighted credibility score from factors."""
        weights = {
            'length_score': 0.15,
            'sentiment_score': 0.10,
            'indicator_score': 0.30,
            'structure_score': 0.25,
            'url_presence': 0.10,
            'uppercase_ratio': 0.05,
            'special_chars_ratio': 0.05,
        }
        
        score = 0
        for factor, weight in weights.items():
            score += factors.get(factor, 0.5) * weight
        
        # Adjust based on URL presence
        if factors.get('url_presence'):
            score += 0.05
        
        return min(max(score, 0), 1)
    
    def _determine_confidence(self, factors, text):
        """Determine confidence level based on available data."""
        length = len(text)
        
        if length < 100:
            return 'low'
        elif length < 300:
            return 'medium'
        else:
            return 'high'
    
    def _generate_recommendations(self, factors, text):
        """Generate recommendations based on analysis."""
        recommendations = []
        
        if factors['length_score'] < 0.5:
            recommendations.append('Provide more detailed content for better analysis.')
        
        if factors['indicator_score'] < 0.5:
            recommendations.append('Include sources and verified information.')
        
        if factors['structure_score'] < 0.5:
            recommendations.append('Improve text structure with proper punctuation and paragraphs.')
        
        if factors['uppercase_ratio'] < 0.5:
            recommendations.append('Avoid excessive use of capital letters.')
        
        if factors['special_chars_ratio'] < 0.5:
            recommendations.append('Reduce the use of special characters and symbols.')
        
        if not recommendations:
            recommendations.append('Content appears well-structured and credible.')
        
        return ' '.join(recommendations)


# Singleton instance for use across the application
analyzer = CredibilityAnalyzer()
