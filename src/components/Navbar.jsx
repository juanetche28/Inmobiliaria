import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="navbar">
      <Link to="/" className="brand">Etcheverry <span>Brothers</span></Link>
      <nav>
        <Link to="/">Propiedades</Link>
        {user ? (
          <>
            <Link to="/admin">Panel</Link>
            <button className="btn btn-outline" onClick={() => { logout(); nav('/'); }}>Salir</button>
          </>
        ) : (
          <Link to="/login" className="btn">Ingresar</Link>
        )}
      </nav>
    </header>
  );
}
