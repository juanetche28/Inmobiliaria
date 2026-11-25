import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, can } from '../auth.jsx';
import { listProps, addProp, updateProp, deleteProp, listUsers, createGestor, deleteProfile } from '../data.js';
import { toEmbed } from '../components/Carousel.jsx';

const VACIA = { titulo: '', operacion: 'Venta', tipo: 'Casa', ambientes: 1, ubicacion: '', precio: '', moneda: 'USD', descripcion: '', media: [] };
const tipoMedia = (url) => (toEmbed(url) || /\.(mp4|webm|ogg)(\?|$)/i.test(url) ? 'video' : 'image');
const falla = (e) => alert('No se pudo completar la acción: ' + (e.code || e.message));

function Propiedades({ user }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(null);
  const [link, setLink] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const recargar = () => listProps().then(setLista).catch(falla);
  useEffect(() => { recargar(); }, []);

  async function enviar(e) {
    e.preventDefault();
    const { id, ...resto } = form;
    const datos = { ...resto, ambientes: Number(form.ambientes), precio: Number(form.precio) };
    try {
      if (id) await updateProp(id, datos);
      else await addProp({ ...datos, creadoPor: user.nombre, fecha: new Date().toISOString() });
      setForm(null); recargar();
    } catch (err) { falla(err); }
  }
  const agregarLink = () => {
    if (!link.trim()) return;
    set('media', [...form.media, { type: tipoMedia(link.trim()), url: link.trim() }]); setLink('');
  };
  const borrar = async (p) => {
    if (!confirm('¿Eliminar propiedad?')) return;
    try { await deleteProp(p.id); recargar(); } catch (err) { falla(err); }
  };

  if (form) {
    return (
      <form className="panel" onSubmit={enviar}>
        <h3>{form.id ? 'Editar propiedad' : 'Nueva propiedad'}</h3>
        <label>Título<input value={form.titulo} onChange={(e) => set('titulo', e.target.value)} required /></label>
        <div className="row">
          <label>Operación<select value={form.operacion} onChange={(e) => set('operacion', e.target.value)}><option>Venta</option><option>Alquiler</option></select></label>
          <label>Tipo<select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>{['Casa', 'Departamento', 'PH', 'Terreno', 'Local', 'Oficina'].map((t) => <option key={t}>{t}</option>)}</select></label>
          <label>Ambientes<input type="number" min="1" value={form.ambientes} onChange={(e) => set('ambientes', e.target.value)} required /></label>
        </div>
        <label>Ubicación<input value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)} required /></label>
        <div className="row">
          <label>Moneda<select value={form.moneda} onChange={(e) => set('moneda', e.target.value)}><option>USD</option><option>ARS</option></select></label>
          <label>Precio<input type="number" min="0" value={form.precio} onChange={(e) => set('precio', e.target.value)} required /></label>
        </div>
        <label>Descripción<textarea rows="3" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} /></label>

        <h4>Imágenes y videos (por link)</h4>
        <div className="row">
          <input placeholder="Link de imagen o video (YouTube, Vimeo, .mp4)" value={link} onChange={(e) => setLink(e.target.value)} />
          <button type="button" className="btn btn-outline" onClick={agregarLink}>Agregar link</button>
        </div>
        <div className="media-list">
          {form.media.map((m, i) => (
            <div key={i} className="media-item">
              {m.type === 'image' ? <img src={m.url} alt="" /> : <div className="vid">▶ video</div>}
              <button type="button" onClick={() => set('media', form.media.filter((_, k) => k !== i))}>✕</button>
            </div>
          ))}
        </div>
        <div className="row">
          <button className="btn" type="submit">Guardar</button>
          <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancelar</button>
        </div>
      </form>
    );
  }

  return (
    <>
      {can(user, 'crearPropiedad') && <button className="btn" onClick={() => setForm(VACIA)}>+ Nueva propiedad</button>}
      <table className="table">
        <thead><tr><th>Propiedad</th><th>Amb.</th><th>Ubicación</th><th>Precio</th><th></th></tr></thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id}>
              <td><Link to={`/propiedad/${p.id}`}>{p.titulo}</Link></td>
              <td>{p.ambientes}</td><td>{p.ubicacion}</td><td>{p.moneda} {Number(p.precio).toLocaleString('es-AR')}</td>
              <td className="actions">
                {can(user, 'editarPropiedad') && <button onClick={() => setForm(p)}>Editar</button>}
                {can(user, 'eliminarPropiedad') && <button className="danger" onClick={() => borrar(p)}>Eliminar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const PERMISOS = { crearPropiedad: 'Crear propiedades', editarPropiedad: 'Editar propiedades', eliminarPropiedad: 'Eliminar propiedades' };
const NUEVO = { nombre: '', email: '', password: '', permissions: { crearPropiedad: true, editarPropiedad: true } };

function Usuarios({ user }) {
  const [lista, setLista] = useState([]);
  const [f, setF] = useState(NUEVO);
  const recargar = () => listUsers().then(setLista).catch(falla);
  useEffect(() => { recargar(); }, []);

  async function crear(e) {
    e.preventDefault();
    try { await createGestor(f); setF(NUEVO); recargar(); } catch (err) { falla(err); }
  }
  const borrar = async (u) => {
    if (!confirm('¿Eliminar usuario?')) return;
    try { await deleteProfile(u.id); recargar(); } catch (err) { falla(err); }
  };

  return (
    <>
      <form className="panel" onSubmit={crear}>
        <h3>Nuevo usuario gestor</h3>
        <div className="row">
          <label>Nombre<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></label>
          <label>Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></label>
          <label>Contraseña (mín. 6)<input type="password" minLength="6" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
        </div>
        <div className="checks">
          {Object.entries(PERMISOS).map(([k, t]) => (
            <label key={k}><input type="checkbox" checked={!!f.permissions[k]} onChange={(e) => setF({ ...f, permissions: { ...f.permissions, [k]: e.target.checked } })} /> {t}</label>
          ))}
        </div>
        <button className="btn" type="submit">Crear usuario</button>
      </form>
      <table className="table">
        <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th></th></tr></thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td><td>{u.email}</td><td>{u.role}</td>
              <td className="actions">
                {u.id !== user.id && <button className="danger" onClick={() => borrar(u)}>Eliminar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('props');
  const esAdmin = user.role === 'admin';
  return (
    <div className="container">
      <h2>Panel de gestión <small className="muted">({user.nombre} · {user.role})</small></h2>
      <div className="tabs">
        <button className={tab === 'props' ? 'on' : ''} onClick={() => setTab('props')}>Propiedades</button>
        {esAdmin && <button className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>Usuarios</button>}
      </div>
      {tab === 'props' ? <Propiedades user={user} /> : <Usuarios user={user} />}
    </div>
  );
}
