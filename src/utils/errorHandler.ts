// Mock error handler for demo
export const handleError = (error: any) => {
  console.error('Error:', error);
};

export const logError = (error: any, context?: any) => {
  console.error('Error:', error, context);
};