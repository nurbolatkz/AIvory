// src/hooks/useImageProcessor.js
import { useState } from 'react';
import fetchManager from '../api/FetchManager';

export const useImageProcessor = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (imageFile) => {
    try {
      // Log what we're receiving for debugging
      console.log('uploadImage called with:', imageFile);
      console.log('Type of imageFile:', typeof imageFile);
      if (imageFile && typeof imageFile === 'object') {
        console.log('imageFile constructor name:', imageFile.constructor.name);
        console.log('imageFile keys:', Object.keys(imageFile));
      }
      
      setProcessing(true);
      setError(null);
      
      // Handle the case where a string is passed (e.g., 'camera')
      if (typeof imageFile === 'string') {
        throw new Error('Camera capture not implemented. Please upload an image file.');
      }
      
      // Validate that we have a file
      if (!imageFile) {
        throw new Error('No image file provided');
      }
      
      // Handle FormData objects directly
      if (imageFile instanceof FormData) {
        console.log('Processing FormData object directly');
      } 
      // Additional validation for File objects
      else if (imageFile instanceof File) {
        // Check if it's actually an image
        if (!imageFile.type.startsWith('image/')) {
          throw new Error('Selected file is not an image. Please select an image file.');
        }
        
        // Check file size (e.g., 10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (imageFile.size > maxSize) {
          throw new Error('Image file is too large. Please select an image smaller than 10MB.');
        }
        
        console.log('Uploading file:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
      } else if (!(imageFile instanceof Blob)) {
        // If it's not a File, Blob, or FormData, it's invalid
        throw new Error('Invalid image file type. Expected File, Blob, or FormData object.');
      }
      
      const imageData = await fetchManager.uploadImage(imageFile);
      setUploadedImage(imageData);
      return imageData;
    } catch (err) {
      const errorMessage = err.message || 'Error uploading image';
      setError(errorMessage);
      console.error('Error uploading image:', err);
      
      // Provide more specific error messages based on error type
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (errorMessage.includes('HTTP error! status: 500')) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`Upload failed: ${errorMessage}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const applyEffect = async (imageId, effectId) => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log('Starting applyEffect with:', {
        imageId,
        effectId
      });
      
      // Validate inputs
      if (!imageId) {
        throw new Error('No image ID provided');
      }
      
      if (!effectId) {
        throw new Error('No effect ID provided');
      }
      
      // Start the effect application process
      console.log('Calling fetchManager.applyEffect');
      const processedData = await fetchManager.applyEffect(imageId, effectId);
      console.log('Received applyEffect response:', processedData);
      
      // Handle the response - it might be a string or object
      let processedResult;
      if (typeof processedData === 'string') {
        // Try to parse as JSON
        try {
          processedResult = JSON.parse(processedData);
          console.log('Parsed string response:', processedResult);
        } catch (parseError) {
          // If parsing fails, create a basic success response
          console.error('Failed to parse response:', parseError);
          processedResult = {
            status: 'processing',
            processed_image_url: null,
            id: `temp-${Date.now()}`
          };
        }
      } else {
        processedResult = processedData;
      }
      
      // Log the processed result
      console.log('Final processed result:', processedResult);
      console.log('Processed result status:', processedResult.status);
      console.log('Processed result ID:', processedResult.id);
      
      // Check if we have a valid ID to poll with
      const pollId = processedResult.id || processedResult.processed_image_id;
      console.log('Poll ID to use:', pollId);
      
      if (!pollId) {
        console.error('No valid ID found for polling');
        setProcessing(false); // Make sure to set processing to false
        throw new Error('Invalid response from server: No ID for polling');
      }
      
      // Always start polling when we have a valid ID, regardless of status
      // The backend returns status 'processing' but we should poll to get the final result
      console.log('Starting polling for:', pollId);
      
      // Add a small delay before starting polling to ensure server has time to set up
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await pollForProcessedResult(pollId);
      console.log('Polling completed with result:', result);
      setProcessedImage(result);
      setProcessing(false); // Make sure to set processing to false
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error applying effect';
      setError(errorMessage);
      console.error('Error applying effect:', err);
      setProcessing(false); // Make sure to set processing to false on error
      
      // Provide more specific error messages based on error type
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (errorMessage.includes('HTTP error! status: 500')) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`Effect application failed: ${errorMessage}`);
      }
    }
  };

  // Poll for processed result
  const pollForProcessedResult = async (processedId) => {
    console.log('Starting pollForProcessedResult with ID:', processedId);
    
    // Increase timeout for long-running operations
    const pollInterval = 3000; // 3 seconds
    const maxAttempts = 40; // 120 seconds max
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          console.log(`Polling attempt ${attempts} for processed image ${processedId}`);
          
          // Check if we've exceeded max attempts
          if (attempts > maxAttempts) {
            console.log('Polling timeout reached');
            reject(new Error('Image processing is taking longer than expected. Please try again.'));
            return;
          }
          
          // Get the processed image status
          console.log('Fetching status for:', processedId);
          const result = await fetchManager.getProcessedStatus(processedId);
          console.log(`Polling attempt ${attempts} result:`, result);
          
          if (!result) {
            console.error('Empty response from server');
            // Don't setProcessing here as it's handled in the calling function
            reject(new Error('Empty response from server'));
            return;
          }
          
          // Handle string responses
          let statusResult;
          if (typeof result === 'string') {
            try {
              statusResult = JSON.parse(result);
              console.log('Parsed status result:', statusResult);
            } catch (parseError) {
              console.error('Failed to parse status response:', parseError);
              statusResult = {
                status: 'failed',
                error_message: 'Invalid response format from server'
              };
            }
          } else {
            statusResult = result;
          }
          
          console.log('Status result:', statusResult);
          console.log('Status result status:', statusResult.status);
          
          // Make sure we're checking all possible status values
          if (statusResult.status === 'completed') {
            console.log('Processing completed:', statusResult);
            resolve(statusResult);
          } else if (statusResult.status === 'failed') {
            console.log('Processing failed:', statusResult);
            reject(new Error(statusResult.error_message || 'Image processing failed'));
          } else {
            // Continue polling for 'processing' or any other status
            console.log(`Scheduling next poll in ${pollInterval}ms`);
            setTimeout(poll, pollInterval);
          }
        } catch (err) {
          console.error('Error during polling:', err);
          reject(err);
        }
      };
      
      // Start polling
      console.log('Starting first poll');
      poll();
    });
  };

  const reset = () => {
    setUploadedImage(null);
    setProcessedImage(null);
    setError(null);
  };

  return {
    uploadedImage,
    processedImage,
    processing,
    error,
    uploadImage,
    applyEffect,
    reset
  };
};