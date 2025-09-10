from django.urls import get_resolver
from django.conf import settings

# Configure Django settings
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'photo_effects.settings')
django.setup()

# Get the URL resolver
resolver = get_resolver()

print("Available URL patterns:")
for pattern in resolver.url_patterns:
    print(f"  {pattern.pattern} -> {pattern.callback if hasattr(pattern, 'callback') else pattern}")
    
    # If it's an include, show the included patterns
    if hasattr(pattern, 'url_patterns'):
        for sub_pattern in pattern.url_patterns:
            print(f"    {pattern.pattern}{sub_pattern.pattern} -> {sub_pattern.callback if hasattr(sub_pattern, 'callback') else sub_pattern}")