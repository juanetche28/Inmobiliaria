import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, can } from '../auth.jsx';
import { getProps, saveProps, getUsers, saveUsers, uid, hash } from '../storage.js';
import { toEmbed } from '../components/Carousel.jsx';

const VACIA = { titulo: '', operacion: 'Venta', tipo: 'Casa', ambientes: 1, ubicacion: '', precio: '', moneda: 'USD', descripcion: '', media: [] };

// Adivina si un link es imagen o video.
const tipoMedia = (url) => (toEmbed(url) || /\.(mp4|webm|ogg)(\?|$)/i.test(url) ? 'video' : 'image');

// Reduce las fotos subidas para que entren en el almacenamiento del navegador.
function achicar(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 1000 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = img.width * s; c.height = img.height * s;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.7));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

function Propiedades({ user }) {
  const [lista, setLista] = useState(getProps());
  const [form, setForm] = useState(null);
  const [link, setLink] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const guardar = (nueva) => { if (saveProps(nueva)) setLista(nueva); };

  function enviar(e) {
    e.preventDefault();
    const datos = { ...form, ambientes: Number(form.ambientes), precio: Number(form.precio) };
    if (form.id) guardar(lista.map((p) => (p.id === form.id ? datos : p)));
    else guardar([{ ...datos, id: uid(), creadoPor: user.nombre, fecha: new Date().toISOString() }, ...lista]);
    setForm(null);
  }
  const agregarLink = () => {
    if (!link.trim()) return;
    set('media', [...form.media, { type: tipoMedia(link.trim()), url: link.trim() }]); setLink('');
  };
  async function subir(e) {
    const nuevas = [];
    for (const f of e.target.files) nuevas.push({ type: 'image', url: await achicar(f) });
    set('media', [...form.media, ...nuevas]); e.target.value = '';
  }

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

        <h4>Imágenes y videos</h4>
        <div className="row">
          <input placeholder="Link de imagen o video (YouTube, Vimeo, .mp4)" value={link} onChange={(e) => setLink(e.target.value)} />
          <button type="button" className="btn btn-outline" onClick={agregarLink}>Agregar link</button>
        </div>
        <label>O subir fotos desde tu equipo<input type="file" accept="image/*" multiple onChange={subir} /></label>
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
                {can(user, 'eliminarPropiedad') && <button className="danger" onClick={() => confirm('¿Eliminar propiedad?') && guardar(lista.filter((x) => x.id !== p.id))}>Eliminar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const PERMISOS = { crearPropiedad: 'Crear propiedades', editarPropiedad: 'Editar propiedades', eliminarPropiedad: 'Eliminar propiedades' };

function Usuarios({ user }) {
  const [lista, setLista] = useState(getUsers());
  const [f, setF] = useState({ nombre: '', email: '', password: '', permissions: { crearPropiedad: true, editarPropiedad: true } });

  async function crear(e) {
    e.preventDefault();
    if (lista.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) return alert('Ya existe ese email');
    const nuevo = { id: uid(), nombre: f.nombre, email: f.email, passHash: await hash(f.password), role: 'gestor', permissions: f.permissions };
    const todos = [...lista, nuevo];
    saveUsers(todos); setLista(todos);
    setF({ nombre: '', email: '', password: '', permissions: { crearPropiedad: true, editarPropiedad: true } });
  }
  const borrar = (id) => { const t = lista.filter((u) => u.id !== id); saveUsers(t); setLista(t); };

  return (
    <>
      <form className="panel" onSubmit={crear}>
        <h3>Nuevo usuario gestor</h3>
        <div className="row">
          <label>Nombre<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></label>
          <label>Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></label>
          <label>Contraseña<input type="password" minLength="6" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
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
                {u.id !== user.id && can(user, 'eliminarUsuario') && <button className="danger" onClick={() => confirm('¿Eliminar usuario?') && borrar(u.id)}>Eliminar</button>}
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
  // "gestionarUsuarios" y "eliminarUsuario" no se pueden asignar a gestores: solo el admin los tiene.
  const puedeUsuarios = user.role === 'admin';
  return (
    <div className="container">
      <h2>Panel de gestión <small className="muted">({user.nombre} · {user.role})</small></h2>
      <div className="tabs">
        <button className={tab === 'props' ? 'on' : ''} onClick={() => setTab('props')}>Propiedades</button>
        {puedeUsuarios && <button className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>Usuarios</button>}
      </div>
      {tab === 'props' ? <Propiedades user={user} /> : <Usuarios user={user} />}
    </div>
  );
}
