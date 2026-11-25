import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProp } from '../data.js';
import Carousel from '../components/Carousel.jsx';
import { precio } from './Home.jsx';

export default function PropertyDetail() {
  const { id } = useParams();
  const [p, setP] = useState(undefined);
  useEffect(() => { getProp(id).then(setP).catch(() => setP(null)); }, [id]);
  if (p === undefined) return <div className="container">Cargando…</div>;
  if (!p) return <div className="container"><p>Propiedad no encontrada.</p><Link to="/">Volver</Link></div>;
  return (
    <div className="container detail">
      <Link to="/">← Volver</Link>
      <Carousel media={p.media} />
      <div className="detail-info">
        <span className="tag static">{p.operacion}</span>
        <h1>{p.titulo}</h1>
        <p className="price big">{precio(p)}</p>
        <ul className="facts">
          <li><b>Tipo:</b> {p.tipo}</li>
          <li><b>Ambientes:</b> {p.ambientes}</li>
          <li><b>Ubicación:</b> {p.ubicacion}</li>
        </ul>
        <p>{p.descripcion}</p>
      </div>
    </div>
  );
}
