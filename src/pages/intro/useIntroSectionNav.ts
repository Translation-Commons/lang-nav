import { useCallback, useEffect, useState } from 'react';

/**
 * Tracks which full-viewport section of a scroll-snap container is currently
 * active (by nearest snap point), and provides a way to scroll to a given
 * section by index — shared by the dot nav and the hero's "scroll down" cue.
 *
 * Sections aren't assumed to be exactly one viewport tall (IntroScrollSection
 * uses min-height, not height, so overflowing content — e.g. the hero's
 * paragraphs on a short/narrow viewport — can make a section taller than the
 * container's clientHeight). So both the active-section tracking and the
 * scroll target are computed from each section's actual DOM offsetTop via
 * the container's children, not from `index * clientHeight`.
 */
export function useIntroSectionNav(
  containerRef: React.RefObject<HTMLElement | null>,
  sectionCount: number,
) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      const scrollCenter = el.scrollTop + el.clientHeight / 2;
      // The last section whose top edge is at or above the viewport's
      // vertical center is the one currently "in view".
      let index = 0;
      for (let i = 0; i < children.length; i++) {
        if (children[i].offsetTop <= scrollCenter) index = i;
      }
      setActiveIndex(Math.min(sectionCount - 1, Math.max(0, index)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set the correct initial index rather than assuming 0
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef, sectionCount]);

  const scrollToSection = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      const target = el.children[index] as HTMLElement | undefined;
      if (!target) return;
      el.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    },
    [containerRef],
  );

  return { activeIndex, scrollToSection };
}
