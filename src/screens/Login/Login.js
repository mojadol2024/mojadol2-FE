import React, { useState } from 'react';
import { getAxiosInstance } from '../../lib/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import PasswordResetModal from './PasswordResetModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const axios = getAxiosInstance();
      const response = await axios.post(
        '/mojadol/api/v1/auth/login',
        {
          userLoginId,
          userPw: password,
        }
      );

      const token = response.headers['authorization'];
      if (!token) {
        alert('토큰이 응답 헤더에 없습니다.');
        return;
      }

      const accessToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      localStorage.setItem('accessToken', accessToken);

      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath || '/homepage');
    } catch (error) {
      if (error.response) {
        alert(
          error.response.data.message ||
          `로그인 실패 (status ${error.response.status})`
        );
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo" onClick={() => navigate('/homepage')} style={{ cursor: 'pointer' }}>
        면접의<span className="login-logo-highlight">정석</span>
      </div>
      <h3 className="login-title">로그인</h3>

      <input
        type="email"
        placeholder="아이디"
        value={userLoginId}
        onChange={e => setUserLoginId(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
        className="login-input"
      />

      <div className="login-password-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="login-input"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="login-toggle-button"
          type="button"
        >
          {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
        </button>
      </div>

      <button onClick={handleLogin} className="login-button">
        로그인
      </button>

      <div className="login-link-container">
        <div className="login-left-links">
          <span className="login-link" onClick={() => navigate('/find-id')}>
            아이디 찾기
          </span>
          <span className="login-divider">|</span>
          <span className="login-link"  onClick={() => navigate('/find-password')}>
            비밀번호 찾기
          </span>
        </div>
        <span className="login-link" onClick={() => navigate('/sign-up')}>
          회원가입
        </span>
      </div>

      {showResetModal && (
        <PasswordResetModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
}

export default Login;