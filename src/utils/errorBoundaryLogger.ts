// Mock error boundary logger for demo
export const logErrorToBoundary = (error: any) => {
  console.error('Boundary error:', error);
};

export const logError = (error: any, context?: any) => {
  console.error('Error:', error, context);
};

export const errorLogger = {
  logErrorToBoundary,
  logError
};