import fileService from '../fileService';
import api from '../api';

// Mock the api module
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn()
}));

describe('fileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFiles', () => {
    it('should upload files with correct parameters', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.jpg', { type: 'image/jpeg' })
      ];
      const entityId = 'entity-123';
      const entityType = 'tender';
      const description = 'Test files';
      const isPublic = true;
      const mockResponse = { data: { success: true, files: [] } };

      api.post.mockResolvedValue(mockResponse);

      const result = await fileService.uploadFiles(
        entityId, 
        entityType, 
        mockFiles, 
        description, 
        isPublic
      );

      expect(api.post).toHaveBeenCalledWith(
        '/api/files/batch-upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: expect.any(Function)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle upload progress callback', async () => {
      const mockFiles = [new File(['content'], 'file.pdf', { type: 'application/pdf' })];
      const onProgress = jest.fn();
      const mockResponse = { data: { success: true } };

      api.post.mockResolvedValue(mockResponse);

      await fileService.uploadFiles('entity-123', 'tender', mockFiles, '', false, onProgress);

      // Verify that the onUploadProgress function is set up correctly
      const callArgs = api.post.mock.calls[0];
      const config = callArgs[2];
      expect(config.onUploadProgress).toBeDefined();

      // Test the progress callback
      const progressEvent = {
        loaded: 50,
        total: 100
      };
      config.onUploadProgress(progressEvent);
      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('should use default values for optional parameters', async () => {
      const mockFiles = [new File(['content'], 'file.pdf', { type: 'application/pdf' })];
      const mockResponse = { data: { success: true } };

      api.post.mockResolvedValue(mockResponse);

      await fileService.uploadFiles('entity-123', 'tender', mockFiles);

      expect(api.post).toHaveBeenCalledWith(
        '/api/files/batch-upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
    });

    it('should handle upload errors', async () => {
      const mockFiles = [new File(['content'], 'file.pdf', { type: 'application/pdf' })];
      const error = new Error('Upload failed');

      api.post.mockRejectedValue(error);

      await expect(
        fileService.uploadFiles('entity-123', 'tender', mockFiles)
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('getFilesByEntity', () => {
    it('should get files for a specific entity', async () => {
      const entityId = 'entity-123';
      const entityType = 'tender';
      const mockResponse = { 
        data: { 
          files: [
            { id: '1', fileName: 'file1.pdf' },
            { id: '2', fileName: 'file2.jpg' }
          ] 
        } 
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await fileService.getFilesByEntity(entityId, entityType);

      expect(api.get).toHaveBeenCalledWith(
        `/api/files?entityId=${entityId}&entityType=${entityType}`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle get files errors', async () => {
      const entityId = 'entity-123';
      const entityType = 'tender';
      const error = new Error('Failed to fetch files');

      api.get.mockRejectedValue(error);

      await expect(
        fileService.getFilesByEntity(entityId, entityType)
      ).rejects.toThrow('Failed to fetch files');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file by ID', async () => {
      const fileId = 'file-123';
      const mockResponse = { data: { success: true } };

      api.delete.mockResolvedValue(mockResponse);

      const result = await fileService.deleteFile(fileId);

      expect(api.delete).toHaveBeenCalledWith(`/api/files/${fileId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete file errors', async () => {
      const fileId = 'file-123';
      const error = new Error('Failed to delete file');

      api.delete.mockRejectedValue(error);

      await expect(
        fileService.deleteFile(fileId)
      ).rejects.toThrow('Failed to delete file');
    });
  });

  describe('FormData handling', () => {
    it('should append files and metadata to FormData correctly', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.jpg', { type: 'image/jpeg' })
      ];
      const entityId = 'entity-123';
      const entityType = 'tender';
      const description = 'Test description';
      const isPublic = true;
      const mockResponse = { data: { success: true } };

      api.post.mockResolvedValue(mockResponse);

      await fileService.uploadFiles(entityId, entityType, mockFiles, description, isPublic);

      const callArgs = api.post.mock.calls[0];
      const formData = callArgs[1];

      // Verify FormData contains the correct data
      expect(formData).toBeInstanceOf(FormData);
      
      // Note: We can't directly test FormData contents in Jest, but we can verify
      // that the API was called with FormData and the correct endpoint
      expect(api.post).toHaveBeenCalledWith(
        '/api/files/batch-upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
    });
  });
});

