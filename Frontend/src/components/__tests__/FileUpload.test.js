import React from 'react';
import { render, screen } from '@testing-library/react';
import FileUpload from '../FileUpload';

// Mock the fileUploadService
jest.mock('../../services/fileUploadService', () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn()
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

describe('FileUpload Component', () => {
  const mockOnFileUploaded = jest.fn();
  const mockOnFileRemoved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders file upload component correctly', () => {
    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    expect(screen.getByText('Click to upload files')).toBeInTheDocument();
    expect(screen.getByText('Upload a single file')).toBeInTheDocument();
  });

  it('renders with multiple files option', () => {
    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        onFileRemoved={mockOnFileRemoved}
        multiple={true}
        maxFiles={5}
      />
    );

    expect(screen.getByText('Upload up to 5 files')).toBeInTheDocument();
  });

  it('displays existing files', () => {
    const existingFiles = [
      { id: '1', fileName: 'existing1.pdf', filePath: '/uploads/existing1.pdf' },
      { id: '2', fileName: 'existing2.jpg', filePath: '/uploads/existing2.jpg' }
    ];

    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        onFileRemoved={mockOnFileRemoved}
        existingFiles={existingFiles}
      />
    );

    expect(screen.getByText('existing1.pdf')).toBeInTheDocument();
    expect(screen.getByText('existing2.jpg')).toBeInTheDocument();
  });

  it('shows file type restrictions', () => {
    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        onFileRemoved={mockOnFileRemoved}
        acceptedTypes=".pdf,.doc,.docx"
      />
    );

    expect(screen.getByText(/Allowed types: PDF, DOC, DOCX/i)).toBeInTheDocument();
  });

  it('shows file size limit', () => {
    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        onFileRemoved={mockOnFileRemoved}
        maxSize={5}
      />
    );

    expect(screen.getByText(/Max size: 5 MB per file/i)).toBeInTheDocument();
  });
});