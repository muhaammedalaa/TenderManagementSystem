import api from './api';

const fileUploadService = {
  // Upload single file
  uploadFile: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/fileupload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload file',
        message: error.response?.data?.message || 'Upload failed'
      };
    }
  },

  // Upload multiple files
  uploadMultipleFiles: async (files, onProgress = null) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    try {
      const response = await api.post('/fileupload/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Multiple files upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload files',
        message: error.response?.data?.message || 'Upload failed'
      };
    }
  },

  // Download file
  downloadFile: async (fileName) => {
    try {
      const response = await api.get(`/fileupload/download/${fileName}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'File downloaded successfully'
      };
    } catch (error) {
      console.error('File download error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to download file',
        message: error.response?.data?.message || 'Download failed'
      };
    }
  },

  // Delete file
  deleteFile: async (fileName) => {
    try {
      const response = await api.delete(`/fileupload/delete/${fileName}`);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete file',
        message: error.response?.data?.message || 'Delete failed'
      };
    }
  },

  // Get file URL
  getFileUrl: (fileName) => {
    return `${api.defaults.baseURL}/fileupload/download/${fileName}`;
  },

  // Validate file
  validateFile: (file, maxSize = 10 * 1024 * 1024) => { // 10MB default
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.xlsx', '.xls'];

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, XLSX, XLS'
      };
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: 'File extension not allowed'
      };
    }

    return {
      valid: true,
      error: null
    };
  }
};

export default fileUploadService;
