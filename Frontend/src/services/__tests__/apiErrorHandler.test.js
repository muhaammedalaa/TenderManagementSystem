import apiErrorHandler from '../apiErrorHandler';

// Mock console.error and alert
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('apiErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockAlert.mockRestore();
  });

  it('should handle server response error with message', () => {
    const error = {
      response: {
        data: {
          message: 'User not found'
        },
        status: 404,
        statusText: 'Not Found'
      }
    };

    const result = apiErrorHandler(error);

    expect(result).toBe('User not found');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('User not found');
  });

  it('should handle server response error without message', () => {
    const error = {
      response: {
        status: 500,
        statusText: 'Internal Server Error'
      }
    };

    const result = apiErrorHandler(error);

    expect(result).toBe('Error 500: Internal Server Error');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('Error 500: Internal Server Error');
  });

  it('should handle network error (no response)', () => {
    const error = {
      request: {},
      message: 'Network Error'
    };

    const result = apiErrorHandler(error);

    expect(result).toBe('No response received from server. Please check your network connection.');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('No response received from server. Please check your network connection.');
  });

  it('should handle request setup error', () => {
    const error = {
      message: 'Request timeout'
    };

    const result = apiErrorHandler(error);

    expect(result).toBe('Request timeout');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('Request timeout');
  });

  it('should use custom message when provided', () => {
    const error = {
      response: {
        data: {
          message: 'Server error'
        }
      }
    };

    const customMessage = 'Custom error message';
    const result = apiErrorHandler(error, customMessage);

    expect(result).toBe('Server error'); // The function prioritizes server message over custom
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('Server error');
  });

  it('should use default message when no error details available', () => {
    const error = {};

    const result = apiErrorHandler(error);

    expect(result).toBe('An unexpected error occurred.');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('An unexpected error occurred.');
  });

  it('should handle 401 unauthorized error', () => {
    const error = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
        data: {
          message: 'Invalid credentials'
        }
      }
    };

    const result = apiErrorHandler(error);

    expect(result).toBe('Invalid credentials');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should handle 403 forbidden error', () => {
    const error = {
      response: {
        status: 403,
        statusText: 'Forbidden'
      }
    };

    const result = apiErrorHandler(error);

    expect(result).toBe('Error 403: Forbidden');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('Error 403: Forbidden');
  });

  it('should handle validation errors', () => {
    const error = {
      response: {
        status: 400,
        statusText: 'Bad Request',
        data: {
          message: 'Validation failed',
          errors: {
            email: ['Email is required'],
            password: ['Password must be at least 8 characters']
          }
        }
      }
    };

    const result = apiErrorHandler(error);

    expect(result).toBe('Validation failed');
    expect(mockConsoleError).toHaveBeenCalledWith('API Error:', error);
    expect(mockAlert).toHaveBeenCalledWith('Validation failed');
  });
});
