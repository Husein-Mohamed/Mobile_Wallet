export const createResponse = (status, message, data = null) => {
    const response = { status, message };
    if (data !== null) {
      response.data = data;
    }
    return response;
  };
  