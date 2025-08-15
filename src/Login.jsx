import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './UerraAuth.css';
import { CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = ({ onLogin, footer }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthSuccess, setOauthSuccess] = useState(false);

  // Check for OAuth callback success
  React.useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get('access_token');
      const error = urlParams.get('error');
      
      if (error) {
        setError(`Authentication failed: ${error}`);
        setLoading(false);
        return;
      }
      
      if (accessToken) {
        console.log('OAuth callback detected, processing...');
        setOauthSuccess(true);
        setError('');
        setLoading(true);
        
        try {
          // Get the current session to ensure Supabase has processed the OAuth tokens
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }
          
          if (session?.user) {
            console.log('OAuth authentication successful:', session.user.email);
            // Clean the URL
            window.history.replaceState(null, null, window.location.pathname);
            // The useAuthSession hook will handle the redirect to dashboard
          } else {
            // If no session yet, wait a bit and try again
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession?.user) {
                console.log('OAuth authentication successful on retry:', retrySession.user.email);
                window.history.replaceState(null, null, window.location.pathname);
              }
              setLoading(false);
            }, 1000);
          }
        } catch (err) {
          console.error('OAuth callback error: ', err);
          setError('Authentication failed. Please try again.');
          setLoading(false);
        }
      }
    };
    
    handleOAuthCallback();
  }, []);

  const validate = () => {
    if (!email) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const { data, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (supaError) throw supaError;
      
      // Don't call onLogin immediately - let useAuthSession handle the state change
      // onLogin will be called by the useEffect in App.jsx when user state changes
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      console.log('Initiating Google OAuth...');
      
      // Determine the correct redirect URL
      let redirectTo;
      
      if (window.location.hostname === 'localhost') {
        // Development environment
        redirectTo = 'http://localhost:5173';
      } else if (window.location.hostname.includes('vercel.app')) {
        // Production environment - use the exact current origin
        redirectTo = window.location.origin;
      } else {
        // Fallback
        redirectTo = window.location.origin;
      }
      
      console.log('Redirect URL:', redirectTo);
      
      const { data, error: supaError } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });
      
      if (supaError) {
        throw supaError;
      }
      
      console.log('OAuth initiated successfully');
      // Don't set loading to false here - let the OAuth flow complete
      // The auth state change will be handled by the useAuthSession hook
      
    } catch (err) {
      console.error('Google OAuth error:', err);
      const errorMessage = err.message || 'Google sign-in failed. Please try again.';
      setError(`${errorMessage} (Code: ${err.code || 'unknown'})`);
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError('');
    setLoading(true);
    try {
      let redirectTo;
      
      if (window.location.hostname === 'localhost') {
        redirectTo = window.location.origin;
      } else if (window.location.hostname.includes('vercel.app')) {
        redirectTo = window.location.origin;
      } else {
        redirectTo = window.location.origin;
      }
      
      const { data, error: supaError } = await supabase.auth.signInWithOAuth({ 
        provider: 'github',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });
      
      if (supaError) {
        throw supaError;
      }
      
    } catch (err) {
      const errorMessage = err.message || 'GitHub sign-in failed. Please try again.';
      setError(`${errorMessage} (Code: ${err.code || 'unknown'})`);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-main-card">
        {/* Login Section */}
        <div className="auth-login-section">
          <div className="auth-header">
            <div className="auth-logo">U</div>
            <h1 className="auth-title">Login</h1>
            <p className="auth-subtitle">Enter your account details</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <input
                type="email"
                className="auth-input"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="username"
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
                autoComplete="current-password"
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
            
            {error && <div className="auth-error">{error}</div>}
            {oauthSuccess && <div className="auth-success">✅ Authentication successful! Redirecting...</div>}
            
            <button 
              type="submit" 
              className={`auth-btn-primary auth-btn-login ${loading ? 'auth-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" style={{ marginRight: '8px' }} />
                  Signing in...
                </>
              ) : (
                'LOG IN'
              )}
            </button>
            
            <div className="auth-divider">
              <span>OR</span>
            </div>
            
            <button
              type="button"
              className="auth-oauth-btn google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon fontSize="small" />
              Sign in with Google
            </button>
            
            <button
              type="button"
              className="auth-oauth-btn github"
              onClick={handleGitHubLogin}
              disabled={loading}
            >
              <GitHubIcon fontSize="small" />
              Sign in with GitHub
            </button>
            
            <div className="auth-footer">
              <a href="#forgot-password">Forgot password?</a>
            </div>
          </form>
        </div>
        
        {/* Sign Up Prompt Section */}
        <div className="auth-signup-section">
          <div className="auth-header">
            <div className="auth-logo">U</div>
            <h1 className="auth-title">Welcome to UERRA</h1>
            <p className="auth-subtitle">
              Unisan Emergency Reporting and Response App - Your safety is our priority
            </p>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Don't have an account? Join our emergency response community today.
            </p>
            <button 
              className="auth-btn-primary auth-btn-register"
              onClick={() => window.location.href = '/register'}
              style={{ maxWidth: '200px' }}
            >
              Create Account
            </button>
          </div>
          
          {footer && <div style={{ marginTop: '2rem', textAlign: 'center' }}>{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default Login;
