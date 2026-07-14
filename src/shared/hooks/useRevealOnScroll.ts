import { useEffect, useRef, useState } from 'react';

type Options = {
  threshold?: number;
  rootMargin?: string;
  // Whether the reveal state should stick once true, instead of toggling
  // back to false each time the element leaves the viewport again.
  once?: boolean;
};

/**
 * Tracks whether an element is (partially) visible in the viewport, for
 * fade/slide-in-on-scroll effects. Respects prefers-reduced-motion by
 * skipping the observer entirely and reporting visible immediately, so
 * reduced-motion users never see an opacity-0 state.
 */
export function useRevealOnScroll<T extends HTMLElement>({
  threshold = 0.35,
  rootMargin = '0px',
  once = false,
}: Options = {}): { ref: React.RefObject<T | null>; isVisible: boolean } {
  const ref = useRef<T | null>(null);
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, prefersReducedMotion]);

  return { ref, isVisible };
}
