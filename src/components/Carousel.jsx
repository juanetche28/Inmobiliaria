import { useState } from 'react';

// Convierte links de YouTube/Vimeo al formato "embed" para poder mostrarlos en un iframe.
export function toEmbed(url) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

// Carrusel que muestra imágenes y videos (YouTube, Vimeo o archivos .mp4/.webm).
export default function Carousel({ media = [] }) {
  const [i, setI] = useState(0);
  if (!media.length) return <div className="carousel empty">Sin imágenes</div>;
  const m = media[i];
  const go = (d) => setI((i + d + media.length) % media.length);
  const embed = m.type === 'video' ? toEmbed(m.url) : null;
  return (
    <div className="carousel">
      <div className="slide">
        {m.type === 'image' && <img src={m.url} alt="" />}
        {m.type === 'video' && (embed
          ? <iframe src={embed} title="video" allowFullScreen />
          : <video src={m.url} controls />)}
      </div>
      {media.length > 1 && (
        <>
          <button className="nav prev" onClick={() => go(-1)} aria-label="Anterior">‹</button>
          <button className="nav next" onClick={() => go(1)} aria-label="Siguiente">›</button>
          <div className="dots">
            {media.map((_, k) => <span key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}
          </div>
        </>
      )}
    </div>
  );
}
