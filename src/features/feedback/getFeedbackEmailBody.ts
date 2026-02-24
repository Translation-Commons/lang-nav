interface FeedbackEmailParams {
  type: string;
  message: string;
}

export function getFeedbackEmailBody({ type, message }: FeedbackEmailParams): string {
  return `Feedback type: ${type}
  
  Message: ${message}
  
  ---
  Context:
  URL: ${window.location.href}
  User agent: ${navigator.userAgent}
  Time: ${new Date().toISOString()}`;
}
