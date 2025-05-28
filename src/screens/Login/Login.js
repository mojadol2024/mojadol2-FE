
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import PasswordResetModal from './PasswordResetModal';
const API_BASE_URL = process.env.REACT_APP_BASE_URL;

function Login() {
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    const url = `${API_BASE_URL}/mojadol/api/v1/auth/login`;
    try {
      const response = await axios.post(
        url,
        { userLoginId, userPw: password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      alert('로그인 성공!');
      navigate('/InterviewMain');
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
    <div className="container">
      <div className="logo">
        면접의<span className="logoHighlight">정석</span>
      </div>
      <h3 className="title">로그인</h3>

      <input
        type="email"
        placeholder="예) 1234@gmail.com"
        value={userLoginId}
        onChange={e => setUserLoginId(e.target.value)}
        className="input"
      />

      <div className="passwordWrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="toggleButton"
          type="button"
        >
          {showPassword ? '🕶️' : '👀'}
        </button>
      </div>

      <button onClick={handleLogin} className="button">
        로그인
      </button>

      <div className="linkContainer">
        <div className="leftLinks">
          <span className="link" onClick={() => navigate('/find-id')}>
            아이디 찾기
          </span>
          <span className="divider">|</span>
          <span className="link" onClick={() => setShowResetModal(true)}>
            비밀번호 찾기
          </span>
        </div>
        <span className="link" onClick={() => navigate('/sign-up')}>
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
