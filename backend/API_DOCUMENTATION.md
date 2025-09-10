# Photo Effects API Documentation

This document provides comprehensive documentation for the Photo Effects API, which allows frontend applications to interact with the backend for image processing and effect application.

## Base URL

All API endpoints are prefixed with: `http://localhost:8000/api`

## Authentication

Currently, the API allows anonymous access for testing purposes. In production, authentication will be required for certain endpoints.

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## 1. Effects API

### Get Effect Categories

**Endpoint:** `GET /effects/categories/`

**Description:** Retrieve all effect categories

**Response:**
```json
[
  {
    "id": 1,
    "name": "Vintage",
    "slug": "vintage",
    "description": "Vintage photo effects"
  }
]
```

### Get Effects

**Endpoint:** `GET /effects/effects/`

**Description:** Retrieve all active effects

**Query Parameters:**
- `category` (optional): Filter effects by category slug

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Vintage Photo",
    "slug": "vintage-photo",
    "category_name": "Vintage",
    "user_description": "Apply a vintage look to your photos",
    "thumbnail": "http://localhost:8000/media/effect_thumbnails/vintage.jpg",
    "is_premium": false
  }
]
```

## 2. Images API

### Upload Image

**Endpoint:** `POST /images/images/`

**Description:** Upload an image for processing

**Request:**
- Content-Type: `multipart/form-data`
- Form Data:
  - `image`: The image file to upload (JPEG, PNG, or WebP)

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "original_image": "http://localhost:8000/media/uploads/image.jpg",
  "original_filename": "my_photo.jpg",
  "file_size": 1024000,
  "image_width": 1920,
  "image_height": 1080,
  "uploaded_at": "2023-01-01T12:00:00Z"
}
```

### Apply Effect to Image

**Endpoint:** `POST /images/images/{image_id}/apply_effect/`

**Description:** Apply a specific effect to an uploaded image

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "effect_id": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "processed_image": "http://localhost:8000/media/processed/result.jpg",
  "effect_name": "Vintage Photo",
  "original_image_url": "http://localhost:8000/media/uploads/image.jpg",
  "processing_time": 2.5,
  "status": "completed",
  "created_at": "2023-01-01T12:05:00Z"
}
```

**Possible Status Values:**
- `processing`: The effect is being applied
- `completed`: The effect has been successfully applied
- `failed`: The effect application failed

## 3. Data Models

### Effect Category

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| name | String | Category name |
| slug | String | URL-friendly category identifier |
| description | Text | Category description |

### Effect

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Effect name |
| slug | String | URL-friendly effect identifier |
| category_name | String | Name of the category this effect belongs to |
| user_description | Text | Description shown to users |
| thumbnail | Image | Preview image for the effect |
| is_premium | Boolean | Whether this is a premium effect |

### Image Upload

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| original_image | Image | The uploaded image file |
| original_filename | String | Original filename of the uploaded image |
| file_size | Integer | Size of the image in bytes |
| image_width | Integer | Width of the image in pixels |
| image_height | Integer | Height of the image in pixels |
| uploaded_at | DateTime | When the image was uploaded |

### Processed Image

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| processed_image | Image | The resulting processed image |
| effect_name | String | Name of the effect applied |
| original_image_url | URL | URL to the original uploaded image |
| processing_time | Float | Time taken to process the image in seconds |
| status | String | Current processing status |
| created_at | DateTime | When the processed image record was created |

## 4. Usage Limits

Free users are limited to 5 effect applications per month. Premium effects are only available to premium users.

## 5. Example Usage Flow

1. **Get effect categories:** `GET /effects/categories/`
2. **Get effects:** `GET /effects/effects/`
3. **Upload an image:** `POST /images/images/`
4. **Apply an effect:** `POST /images/images/{image_id}/apply_effect/`
5. **View the result:** Use the `processed_image` URL from the response

## 6. Media Files

All uploaded and processed images are stored in the media directory and accessible via URLs in the API responses.