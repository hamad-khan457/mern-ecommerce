import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.isAdmin ? '/admin' : '/');
    } catch (err) { setError(err.response?.data?.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h2>Sign in</h2>
        <p className="auth-sub">Welcome back to DjEcommerce</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group"><label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="form-group"><label>Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="auth-footer">No account? <Link to="/register">Register here</Link></p>
        <p className="auth-footer" style={{marginTop:'.25rem',fontSize:'.8rem',color:'var(--muted)'}}>Demo: user@shop.com / user123</p>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const f = k => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });
  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h2>Create account</h2>
        <p className="auth-sub">Join DjEcommerce today</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="grid-2">
            <div className="form-group"><label>First name</label><input {...f('firstName')} /></div>
            <div className="form-group"><label>Last name</label><input {...f('lastName')} /></div>
          </div>
          <div className="form-group"><label>Username</label><input required {...f('username')} /></div>
          <div className="form-group"><label>Email</label><input type="email" required {...f('email')} /></div>
          <div className="form-group"><label>Password</label><input type="password" required minLength={6} {...f('password')} /></div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
