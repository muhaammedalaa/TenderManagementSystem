import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCustomTheme } from '../context/ThemeContext';
import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'Admin123!'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    

    try {
      // Check for admin credentials
      if ((formData.username === 'admin' && formData.password === 'Admin123!') || 
          (formData.username === 'mohamed.alaa' && formData.password === 'admin123')) {
        console.log('Admin credentials correct, logging in...');
        
        // Use AuthContext login
        await login({
          username: formData.username,
          password: formData.password
        });
        
        console.log('Login successful, navigating to dashboard...');
        // Navigate to dashboard
        navigate('/');
      } else {
        console.log('Invalid credentials');
        setError(t('auth.loginError'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic
  };

  return (
    <div className={`login-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <Container fluid className="h-100">
        <Row className="h-100 g-0">
          {/* Left Panel - Visual Section */}
          <Col lg={6} className="login-visual-panel">
            <div className="login-visual-content">
              {/* Logo */}
              <div className="login-logo">
                <div className="logo-icon">
                  <FaBuilding />
                </div>
                <span className="logo-text">UPF</span>
              </div>

              {/* Marketing Content */}
              <div className="login-marketing-content">
                <h1 className="marketing-title">Find your perfect tender</h1>
                <p className="marketing-subtitle">Manage tenders in just a few clicks</p>
                <p className="marketing-description">Streamline your tender management process</p>
              </div>

              {/* Navigation Dots */}
              <div className="login-dots">
                <div className="dot active"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </Col>

          {/* Right Panel - Login Form */}
          <Col lg={6} className="login-form-panel">
            <div className="login-form-container">
              {/* Top Navigation */}
              <div className="login-top-nav">
                <Button variant="outline-dark" className="sign-in-btn">
                  Sign in
                </Button>
              </div>

              {/* Login Form */}
              <div className="login-form-content">
                <div className="login-header">
                  <h2 className="login-title">Welcome Back to UPF!</h2>
                  <p className="login-subtitle">Sign in your account</p>
                </div>

                {error && (
                  <Alert variant="danger" className="login-alert">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} className="login-form">
                  <Form.Group className="mb-3">
                    <Form.Label>{t('auth.username')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="login-input"
                      placeholder="Enter your username"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('auth.password')}</Form.Label>
                    <div className="password-input-container">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="login-input"
                        required
                      />
                      <Button
                        type="button"
                        variant="link"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </Form.Group>

                  <div className="login-options">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label={t('auth.rememberMe')}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="remember-checkbox"
                    />
                    <Button variant="link" className="forgot-password">
                      {t('auth.forgotPassword')}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="login-btn"
                    disabled={loading}
                  >
                    {loading ? t('common.loading') : t('auth.login')}
                  </Button>
                </Form>

                {/* Social Login */}
                <div className="social-login">
                  <div className="social-separator">
                    <span>Instant Login</span>
                  </div>

                  <div className="social-buttons">
                    <Button
                      variant="outline"
                      className="social-btn google-btn"
                      onClick={() => handleSocialLogin('Google')}
                    >
                      <FaGoogle className="social-icon" />
                      Continue with Google
                    </Button>

                    <Button
                      variant="outline"
                      className="social-btn facebook-btn"
                      onClick={() => handleSocialLogin('Facebook')}
                    >
                      <FaFacebook className="social-icon" />
                      Continue with Facebook
                    </Button>
                  </div>
                </div>

                {/* Registration Link */}
                <div className="login-footer">
                  <p>
                    Don't have any account?{' '}
                    <Button variant="link" className="register-link">
                      Register
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;