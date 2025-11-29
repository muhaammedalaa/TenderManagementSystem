import React, { useState, useRef } from 'react';
import { Button, ProgressBar, Alert, Card, Row, Col, Badge } from 'react-bootstrap';
import { 
  FaUpload, 
  FaFile, 
  FaDownload, 
  FaTrash, 
  FaCheck, 
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import fileUploadService from '../services/fileUploadService';

const FileUpload = ({ 
  onFileUploaded, 
  onFileRemoved, 
  multiple = false, 
  maxFiles = 5,
  acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls',
  maxSize = 10, // MB
  existingFiles = [],
  showPreview = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles || []);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    setError('');
    setSuccess('');

    if (files.length === 0) return;

    // Validate number of files
    if (!multiple && files.length > 1) {
      setError('Please select only one file');
      return;
    }

    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    for (const file of files) {
      const validation = fileUploadService.validateFile(file, maxSize * 1024 * 1024);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let result;
      if (multiple) {
        result = await fileUploadService.uploadMultipleFiles(files, setUploadProgress);
      } else {
        result = await fileUploadService.uploadFile(files[0], setUploadProgress);
      }

      if (result.success) {
        const newFiles = multiple ? result.data : [result.data];
        const updatedFiles = [...uploadedFiles, ...newFiles];
        setUploadedFiles(updatedFiles);
        setSuccess(result.message);
        
        if (onFileUploaded) {
          onFileUploaded(multiple ? newFiles : newFiles[0]);
        }
      } else {
        setError(result.error || result.message);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async (file) => {
    try {
      const result = await fileUploadService.deleteFile(file.savedFileName);
      if (result.success) {
        const updatedFiles = uploadedFiles.filter(f => f.savedFileName !== file.savedFileName);
        setUploadedFiles(updatedFiles);
        
        if (onFileRemoved) {
          onFileRemoved(file);
        }
        setSuccess('File removed successfully');
      } else {
        setError(result.error || result.message);
      }
    } catch (err) {
      setError('Failed to remove file');
      console.error('Remove file error:', err);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const result = await fileUploadService.downloadFile(file.savedFileName);
      if (!result.success) {
        setError(result.error || result.message);
      }
    } catch (err) {
      setError('Failed to download file');
      console.error('Download error:', err);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FaFilePdf className="text-danger" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className="text-primary" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel className="text-success" />;
    if (fileType.includes('image')) return <FaFileImage className="text-info" />;
    return <FaFile className="text-secondary" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Upload Area */}
      <Card className="mb-3">
        <Card.Body className="text-center">
          <div 
            className="upload-area border-2 border-dashed rounded p-4"
            style={{ 
              borderColor: uploading ? '#007bff' : '#dee2e6',
              backgroundColor: uploading ? '#f8f9fa' : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload className="fs-1 text-muted mb-3" />
            <h5 className="mb-2">
              {uploading ? 'Uploading...' : 'Click to upload files'}
            </h5>
            <p className="text-muted mb-3">
              {multiple ? `Upload up to ${maxFiles} files` : 'Upload a single file'}
            </p>
            <p className="small text-muted">
              Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, XLSX, XLS
              <br />
              Max size: {maxSize}MB per file
            </p>
            
            {uploading && (
              <div className="mt-3">
                <ProgressBar 
                  now={uploadProgress} 
                  label={`${uploadProgress}%`}
                  className="mb-2"
                />
                <small className="text-muted">Uploading files...</small>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </Card.Body>
      </Card>

      {/* Messages */}
      {error && (
        <Alert variant="danger" className="mb-3">
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-3">
          <FaCheck className="me-2" />
          {success}
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && showPreview && (
        <Card>
          <Card.Header>
            <h6 className="mb-0">
              Uploaded Files ({uploadedFiles.length})
            </h6>
          </Card.Header>
          <Card.Body className="p-0">
            {uploadedFiles.map((file, index) => (
              <div 
                key={index} 
                className="d-flex align-items-center p-3 border-bottom"
              >
                <div className="me-3">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold">{file.fileName}</div>
                  <div className="small text-muted">
                    {formatFileSize(file.fileSize)} • {file.fileType}
                  </div>
                  <div className="small text-muted">
                    Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
                    title="Download"
                  >
                    <FaDownload />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveFile(file)}
                    title="Remove"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* File URLs (for form submission) */}
      {uploadedFiles.length > 0 && (
        <div className="mt-3">
          <h6>File URLs:</h6>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="mb-2">
              <Badge bg="info" className="me-2">{file.fileName}</Badge>
              <code className="small">{file.fileUrl}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;