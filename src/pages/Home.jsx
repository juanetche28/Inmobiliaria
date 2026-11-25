import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProps } from '../data.js';

export const precio = (p) => `${p.moneda} ${Number(p.precio).toLocaleString('es-AR')}`;

export default function Home() {
  const [props, setProps] = useState([]);
  const [estado, setEstado] = useState('cargando');
  useEffect(() => { listProps().then((l) => { setProps(l); setEstado('ok'); }).catch(() => setEstado('error')); }, []);
  const [op, setOp] = useState('Todas');
  const [amb, setAmb] = useState(0);
  const [q, setQ] = useState('');

  const lista = useMemo(() => props.filter((p) =>
    (op === 'Todas' || p.operacion === op) &&
    p.ambientes >= amb &&
    p.ubicacion.toLowerCase().includes(q.toLowerCase())
  ), [props, op, amb, q]);

  return (
    <>
      <section className="hero">
        <h1>Encontrá tu próximo hogar</h1>
        <p>Venta y alquiler de propiedades con el respaldo de Etcheverry Brothers.</p>
      </section>
      <section className="container">
        <div className="filters">
          <select value={op} onChange={(e) => setOp(e.target.value)}>
            <option>Todas</option><option>Venta</option><option>Alquiler</option>
          </select>
          <select value={amb} onChange={(e) => setAmb(Number(e.target.value))}>
            <option value={0}>Ambientes: todos</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ ambientes</option>)}
          </select>
          <input placeholder="Buscar por ubicación…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="grid">
          {lista.map((p) => {
            const foto = p.media.find((m) => m.type === 'image');
            return (
              <Link to={`/propiedad/${p.id}`} className="card" key={p.id}>
                <div className="thumb" style={foto ? { backgroundImage: `url(${foto.url})` } : {}}>
                  <span className="tag">{p.operacion}</span>
                </div>
                <div className="card-body">
                  <h3>{p.titulo}</h3>
                  <p className="muted">📍 {p.ubicacion}</p>
                  <p className="muted">{p.tipo} · {p.ambientes} ambientes</p>
                  <p className="price">{precio(p)}</p>
                </div>
              </Link>
            );
          })}
          {estado === 'cargando' && <p>Cargando propiedades…</p>}
          {estado === 'error' && <p className="error">No se pudieron cargar las propiedades.</p>}
          {estado === 'ok' && !lista.length && <p>No hay propiedades que coincidan.</p>}
        </div>
      </section>
    </>
  );
}
