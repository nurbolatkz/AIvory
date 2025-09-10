import requests
import json

# Base URL for our API
BASE_URL = 'http://127.0.0.1:8000'

# Test getting effect categories
print("Testing effect categories endpoint...")
response = requests.get(f'{BASE_URL}/api/effects/categories/')
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print(f"Response: {response.json()}")
else:
    print(f"Response: {response.text}")

# Test getting effects
print("\nTesting effects endpoint...")
response = requests.get(f'{BASE_URL}/api/effects/effects/')
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print(f"Response: {response.json()}")
else:
    print(f"Response: {response.text}")

# Test getting images
print("\nTesting images endpoint...")
response = requests.get(f'{BASE_URL}/api/images/images/')
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print(f"Response: {response.json()}")
else:
    print(f"Response: {response.text}")

print("\nAPI tests completed.")