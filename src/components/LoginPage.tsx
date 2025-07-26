import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../styles/LoginPage.scss';

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 验证用户名和密码
    if (username === 'admin' && password === 'Admin2025!') {
      // 登录成功，保存登录状态
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginTime', Date.now().toString());
      
      // 跳转到admin页面
      navigate('/admin');
    } else {
      setError('用户名或密码错误');
    }
    
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
        </div>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">{t('login.username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group password-field">
            <label htmlFor="password">{t('login.password')}</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? t('login.loggingIn') : t('login.login')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage; 