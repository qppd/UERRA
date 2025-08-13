import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { upsertUserProfile } from './useUserProfile';
import './UerraAuth.css';
import { CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Register = ({ onRegister, footer }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validate = () => {
    if (!email) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!agreeTerms) return 'Please agree to the terms and conditions.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const { data, error: supaError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (supaError) throw supaError;
      if (data.user) {
        await upsertUserProfile({
          id: data.user.id,
          email,
          role: 'citizen',
          agency_id: null,
        });
      }
      setSuccess('Account created successfully! Please check your email for verification.');
      // Don't call onRegister immediately - let useAuthSession handle the state change
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      // Get the correct redirect URL based on environment
      const redirectTo = window.location.hostname === 'localhost' 
        ? window.location.origin
        : window.location.origin;
      
      const { error: supaError } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (supaError) throw supaError;
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const redirectTo = window.location.hostname === 'localhost' 
        ? window.location.origin
        : window.location.origin;
      
      const { error: supaError } = await supabase.auth.signInWithOAuth({ 
        provider: 'github',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (supaError) throw supaError;
    } catch (err) {
      console.error('GitHub sign-up error:', err);
      setError(err.message || 'GitHub sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-main-card">
        {/* Welcome Section */}
        <div className="auth-login-section">
          <div className="auth-header">
            <div className="auth-logo">U</div>
            <h1 className="auth-title">Welcome to UERRA</h1>
            <p className="auth-subtitle">
              Unisan Emergency Reporting and Response App - Join our safety community
            </p>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Already have an account? Sign in to access emergency reporting, real-time alerts, and safety resources.
            </p>
            <button 
              className="auth-btn-primary auth-btn-login"
              onClick={() => window.location.href = '/login'}
              style={{ maxWidth: '200px' }}
            >
              Sign In
            </button>
          </div>
          
          {footer && <div style={{ marginTop: '2rem', textAlign: 'center' }}>{footer}</div>}
        </div>
        
        {/* Sign Up Section */}
        <div className="auth-signup-section">
          <div className="auth-header">
            <div className="auth-logo">U</div>
            <h1 className="auth-title">Sign up</h1>
            <p className="auth-subtitle">Register now to use all features of UERRA</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <input
                type="email"
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>
            
            <div className="auth-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
            
            <div className="auth-input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            
            <button 
              type="submit" 
              className={`auth-btn-primary auth-btn-register ${loading ? 'auth-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" style={{ marginRight: '8px' }} />
                  Creating account...
                </>
              ) : (
                'REGISTER'
              )}
            </button>
            
            <div className="auth-divider">
              <span>OR</span>
            </div>
            
            <button
              type="button"
              className="auth-oauth-btn google"
              onClick={handleGoogleRegister}
              disabled={loading}
            >
              <GoogleIcon fontSize="small" />
              Sign up with Google
            </button>
            
            <button
              type="button"
              className="auth-oauth-btn github"
              onClick={handleGitHubRegister}
              disabled={loading}
            >
              <GitHubIcon fontSize="small" />
              Sign up with GitHub
            </button>
            
            <div className="auth-footer">
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#666' }}>
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginRight: '8px' }} 
                />
                By signing up I agree with terms and conditions
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
