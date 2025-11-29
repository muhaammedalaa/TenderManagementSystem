import api from './api';

const fileService = {
  /**
   * Upload files for a specific entity
   * @param {string} entityId - The ID of the entity
   * @param {string} entityType - The type of entity (e.g., 'tender', 'quotation', 'supplier')
   * @param {File[]} files - Array of files to upload
   * @param {string} description - Optional description for the files
   * @param {boolean} isPublic - Whether the files should be publicly accessible
   * @returns {Promise} - Promise resolving to the upload response
   */
  uploadFiles: async (entityId, entityType, files, description = '', isPublic = false, onProgress = null) => {
    const formData = new FormData();
    
    // Append each file to the form data
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    // Append metadata
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);
    formData.append('description', description);
    formData.append('isPublic', isPublic);
    
    return api.post('/api/files/batch-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  },
  
  /**
   * Get files for a specific entity
   * @param {string} entityId - The ID of the entity
   * @param {string} entityType - The type of entity
   * @returns {Promise} - Promise resolving to the files data
   */
  getFilesByEntity: async (entityId, entityType) => {
    return api.get(`/api/files?entityId=${entityId}&entityType=${entityType}`);
  },
  
  /**
   * Delete a file
   * @param {string} fileId - The ID of the file to delete
   * @returns {Promise} - Promise resolving to the deletion response
   */
  deleteFile: async (fileId) => {
    return api.delete(`/api/files/${fileId}`);
  }
};

export default fileService;