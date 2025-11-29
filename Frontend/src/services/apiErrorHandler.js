const apiErrorHandler = (error, customMessage) => {
  let message = customMessage || 'An unexpected error occurred.';

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.response.status) {
      message = `Error ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    message = 'No response received from server. Please check your network connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message;
  }

  console.error("API Error:", error);
  alert(message);
  return message;
};

export default apiErrorHandler;