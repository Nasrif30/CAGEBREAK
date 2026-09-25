import { captions, colorStory, pulse } from './cinematography';
export function CinematicText({ progress }: { progress: number }) {
  const caption = captions.find(item => progress >= item.start && progress <= item.end);
  if (!caption) return null;
  const fade = .012;
  const opacity = pulse(progress, caption.start, caption.start + fade, caption.end) * Math.min(1, (caption.end - progress) / fade);
  return <div className={`cb-film-copy ${caption.large ? 'cb-film-question' : progress >= .78 ? 'cb-film-gesture' : ''}`} style={{ opacity, color: colorStory(progress).ink }}>
    <p>{caption.text}</p>
  </div>;
}

