import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  async function enviar(e) {
  e.preventDefault();
  const err = await login(email, pass);
  if (!err) nav('/admin'); else setError('Error: ' + err);
}
  return (
    <div className="container narrow">
      <form className="panel" onSubmit={enviar}>
        <h2>Ingresar</h2>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">Entrar</button>
      </form>
    </div>
  );
}
