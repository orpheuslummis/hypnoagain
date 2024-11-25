# Audio to Image Generator

## Pages

- `/`: Recording page with a button to start/stop audio recording
- `/display`: Displays the latest generated image

## Functionality

- User can record audio on the home page
- Audio is sent to backend for processing
- Backend handles:
  1. Audio transcription
  2. Image generation based on transcription
- Generated image is displayed on the `/display` page

## Technical Details

- Uses Preact islands for interactive components
- Client-side audio recording
- API-driven transcription and image generation
