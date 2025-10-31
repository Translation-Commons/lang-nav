import { useCallback, useEffect, useRef, useState } from 'react';

type UseCopyToClipboardOptions = {
  /**
   * How long (ms) `success` should remain true after a successful copy.
   * Set to 0 to never auto-reset.
   */
  successDuration?: number;
};

type UseCopyToClipboardReturn = {
  copy: (value: string) => Promise<boolean>;
  isSupported: boolean;
  isCopying: boolean;
  success: boolean;
  error: Error | null;
  reset: () => void;
};

export default function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { successDuration = 2000 } = options;
  const mountedRef = useRef(true);
  const timeoutRef = useRef<number | undefined>(undefined);

  const [isCopying, setIsCopying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isSupported =
    typeof navigator !== 'undefined' &&
    ((navigator.clipboard && typeof navigator.clipboard.writeText === 'function') ||
      (typeof document !== 'undefined' &&
        typeof document.queryCommandSupported === 'function' &&
        document.queryCommandSupported('copy')));

  const reset = useCallback(() => {
    if (!mountedRef.current) return;
    setSuccess(false);
    setError(null);
  }, []);

  const fallbackCopy = (text: string): boolean => {
    if (typeof document === 'undefined') return false;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling to bottom
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', 'true');
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    } finally {
      textarea.remove();
    }
    return ok;
  };

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      if (!isSupported) {
        setError(new Error('Clipboard copy is not supported in this environment.'));
        return false;
      }

      setIsCopying(true);
      setError(null);

      try {
        if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(value);
        } else {
          const ok = fallbackCopy(value);
          if (!ok) throw new Error('Fallback copy failed');
        }

        if (!mountedRef.current) return true;
        setSuccess(true);

        if (successDuration > 0) {
          // reset success after duration
          timeoutRef.current = window.setTimeout(() => {
            if (mountedRef.current) setSuccess(false);
          }, successDuration);
        }

        return true;
      } catch (err) {
        if (mountedRef.current) setError(err as Error);
        return false;
      } finally {
        if (mountedRef.current) setIsCopying(false);
      }
    },
    [isSupported, successDuration],
  );

  return {
    copy,
    isSupported,
    isCopying,
    success,
    error,
    reset,
  };
}
