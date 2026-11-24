// Capa de datos. HOY guarda todo en localStorage del navegador (modo demo, sin servidor).
// Para producción real, reemplazar estas funciones por llamadas a un backend (ver manual).
const K = { props: 'eb_properties', users: 'eb_users', session: 'eb_session' };

const ADMIN_EMAIL = 'juanetche28@gmail.com';
const ADMIN_PASS_INICIAL = 'admin'; // CAMBIAR antes de publicar (ver manual, sección Seguridad)

export async function hash(texto) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const read = (k, def) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
};
const write = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch { alert('No hay espacio de almacenamiento. Usá imágenes más chicas o links.'); return false; }
};
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const getUsers = () => read(K.users, []);
export const saveUsers = (u) => write(K.users, u);
export const getProps = () => read(K.props, []);
export const saveProps = (p) => write(K.props, p);
export const getSession = () => localStorage.getItem(K.session);
export const setSession = (id) => (id ? localStorage.setItem(K.session, id) : localStorage.removeItem(K.session));

export async function initData() {
  if (getUsers().length === 0) {
    saveUsers([{ id: 'admin-1', nombre: 'Administrador', email: ADMIN_EMAIL, passHash: await hash(ADMIN_PASS_INICIAL), role: 'admin', permissions: {} }]);
  }
  if (getProps().length === 0) {
    const u = (id) => `https://images.unsplash.com/${id}?w=1000&q=70`;
    saveProps([
      { id: uid(), titulo: 'Casa con jardín y pileta', operacion: 'Venta', tipo: 'Casa', ambientes: 5, ubicacion: 'Mar del Plata, Buenos Aires', precio: 185000, moneda: 'USD', descripcion: 'Amplia casa familiar con parque, pileta y cochera para dos autos.', media: [{ type: 'image', url: u('photo-1568605114967-8130f3a36994') }, { type: 'image', url: u('photo-1502672260266-1c1ef2d93688') }], creadoPor: 'Sistema', fecha: new Date().toISOString() },
      { id: uid(), titulo: 'Departamento luminoso en el centro', operacion: 'Alquiler', tipo: 'Departamento', ambientes: 3, ubicacion: 'Centro, Buenos Aires', precio: 650000, moneda: 'ARS', descripcion: 'Tres ambientes con balcón, a metros del transporte.', media: [{ type: 'image', url: u('photo-1545324418-cc1a3fa10c00') }], creadoPor: 'Sistema', fecha: new Date().toISOString() },
    ]);
  }
}
