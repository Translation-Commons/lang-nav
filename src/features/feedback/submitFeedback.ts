const FEEDBACK_API_URL = import.meta.env.VITE_FEEDBACK_API_URL;

export interface FeedbackSubmission {
  type: string;
  message: string;
  turnstileToken?: string;
}

/**
 * Sends a feedback submission to the Cloudflare Worker backing the feedback
 * feature. The worker stores it in D1. Throws on any non-2xx response so the
 * caller can surface an error to the user.
 */
export async function submitFeedback({
  type,
  message,
  turnstileToken,
}: FeedbackSubmission): Promise<void> {
  if (!FEEDBACK_API_URL) {
    throw new Error('Feedback is not configured. Set VITE_FEEDBACK_API_URL.');
  }

  const res = await fetch(`${FEEDBACK_API_URL.replace(/\/$/, '')}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      message,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      ...(turnstileToken ? { turnstileToken } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }
}

async function readError(res: Response): Promise<string> {
  if (res.status === 429) return 'Too many submissions. Please try again later.';
  if (res.status === 403) return 'Could not verify your submission. Please try again.';
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // fall through to generic message
  }
  return 'Something went wrong. Please try again.';
}
