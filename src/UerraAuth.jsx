import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { upsertUserProfile } from './useUserProfile';
import './UerraAuth.css';

// Icons (you can replace with your preferred icon library)
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const UerraAuth = ({ onLogin, onRegister, defaultTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthSuccess, setOauthSuccess] = useState(false);

  // Check for OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    if (urlParams.get('access_token')) {
      setOauthSuccess(true);
      setError('');
      setSuccess('Authentication successful! Redirecting...');
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;
    
    if (!email) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    
    if (activeTab === 'signup') {
      if (!confirmPassword) return 'Please confirm your password.';
      if (password !== confirmPassword) return 'Passwords do not match.';
    }
    
    return '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error: supaError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (supaError) throw supaError;
      
      setSuccess('Login successful! Redirecting to dashboard...');
      // Don't call onLogin immediately - let useAuthSession handle the state change
      
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error: supaError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      
      if (supaError) throw supaError;
      
      if (data.user) {
        await upsertUserProfile({
          id: data.user.id,
          email: formData.email,
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

  const handleOAuthLogin = async (provider) => {
    setError('');
    setSuccess('');
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
        provider,
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });
      
      if (supaError) throw supaError;
      
      // Don't set loading to false here - let the OAuth flow complete
      
    } catch (err) {
      const errorMessage = err.message || `${provider} sign-in failed. Please try again.`;
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
          
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-input-group">
              <input
                type="email"
                className="auth-input"
                placeholder="Username"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            
            <div className="auth-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            
            {error && activeTab === 'login' && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            {oauthSuccess && <div className="auth-success">✅ Authentication successful! Redirecting...</div>}
            
            <button 
              type="submit" 
              className={`auth-btn-primary auth-btn-login ${loading ? 'auth-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-loading-spinner"></span>
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
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
            >
              <GoogleIcon />
              Sign in with Google
            </button>
            
            <button
              type="button"
              className="auth-oauth-btn github"
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
            >
              <GitHubIcon />
              Sign in with GitHub
            </button>
            
            <div className="auth-footer">
              <a href="#forgot-password">Forgot password?</a>
            </div>
          </form>
        </div>
        
        {/* Sign Up Section */}
        <div className="auth-signup-section">
          <div className="auth-header">
            <div className="auth-logo">U</div>
            <h1 className="auth-title">Sign up</h1>
            <p className="auth-subtitle">Register now to use all features of the UERRA</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-input-group">
              <input
                type="text"
                className="auth-input"
                placeholder="Username"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            
            <div className="auth-input-group">
              <input
                type="email"
                className="auth-input"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div className="auth-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            
            <div className="auth-input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            
            {error && activeTab === 'signup' && <div className="auth-error">{error}</div>}
            
            <button 
              type="submit" 
              className={`auth-btn-primary auth-btn-register ${loading ? 'auth-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-loading-spinner"></span>
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
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
            >
              <GoogleIcon />
              Sign up with Google
            </button>
            
            <button
              type="button"
              className="auth-oauth-btn github"
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
            >
              <GitHubIcon />
              Sign up with GitHub
            </button>
            
            <div className="auth-footer">
              <label>
                <input type="checkbox" style={{ marginRight: '8px' }} />
                By signing up I agree with terms and conditions
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UerraAuth;
