import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Phone, Library, ShieldAlert } from 'lucide-react';

export const Login = ({ showToast }) => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'member'
  });
  const [loadingState, setLoadingState] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingState(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        showToast('Successfully signed in!', 'success');
      } else {
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.phone,
          formData.role
        );
        showToast('Account registered successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="flex-center" style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'radial-gradient(circle at 50% 50%, #161e33 0%, #0a0e17 100%)',
      zIndex: 999,
      padding: '1.5rem'
    }}>
      {/* Absolute floating glowing orb background */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(95, 85, 250, 0.15) 0%, rgba(95, 85, 250, 0) 70%)',
        top: '10%',
        left: '20%',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, rgba(0, 229, 255, 0) 70%)',
        bottom: '10%',
        right: '20%',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div className="glass" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'rgba(18, 25, 41, 0.75)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{
            margin: '0 auto 1rem auto',
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Library size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Lumina Library</h1>
          <p style={{ fontSize: '0.9rem' }}>
            {isLogin ? 'Welcome back! Sign in to access your dashboard' : 'Create an account to browse and borrow books'}
          </p>
        </div>

        {/* Form Error */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-glow)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="John Doe"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="you@example.com"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                name="password"
                id="password"
                required
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="role">Role (Testing Mode)</label>
                <select
                  name="role"
                  id="role"
                  className="form-input form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="member">Library Member</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loadingState} style={{ width: '100%', marginTop: '1rem', height: '46px' }}>
            {loadingState ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Tab switcher */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default Login;
