# Photo Effects Backend API

This is the backend API for the Photo Effects application, built with Django and Django REST Framework.

## API Documentation

For detailed API documentation, please see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Quick Start for Frontend Developers

### Base URL
All API endpoints are prefixed with: `http://localhost:8000/api`

### Key Endpoints

1. **Get effect categories**: `GET /effects/categories/`
2. **Get effects**: `GET /effects/effects/`
3. **Upload an image**: `POST /images/images/`
4. **Apply an effect**: `POST /images/images/{image_id}/apply_effect/`

### Example Integration

For a complete example of how to integrate with the API, see:
- [frontend_example.js](frontend_example.js) - JavaScript API client
- [frontend_example.html](frontend_example.html) - Complete HTML example

## Models

The API provides access to three main models:
1. **Effect Categories** - Grouping for effects
2. **Effects** - Individual photo effects that can be applied
3. **Images** - Uploaded images and their processed versions

## Usage Flow

1. Retrieve effect categories and effects to display to the user
2. Allow user to upload an image
3. Let user select an effect to apply
4. Apply the effect to the uploaded image
5. Display the processed result

## Authentication

Currently, the API allows anonymous access for testing purposes. In production, authentication will be required for image uploads and effect processing.

## Rate Limiting

Free users are limited to 5 effect applications per month. Premium effects are only available to premium users.

## Media Files

All uploaded and processed images are stored in the media directory and accessible via URLs in the API responses.

## Support

For questions about the API, please contact the development team.