import { useEffect, useState, type RefObject } from 'react';
import { scrollProgress } from './state';
export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
export function useExperienceScroll(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      setProgress(scrollProgress(bounds.top, bounds.height, window.innerHeight));
      setActive(!document.hidden && bounds.bottom > 0 && bounds.top < window.innerHeight);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [ref]);
  return { progress, active };
}
