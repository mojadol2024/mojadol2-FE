import React, { useState } from 'react';
import './Login.css'; // CSS 파일 불러오기

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log('로그인 시도:', email, password);
    // TODO: 로그인 API 연동
  };

  return (
    <div className="container">
      <div className="logo">
        면접의<span className="logoHighlight">정석</span>
      </div>
      <h3 className="title">로그인</h3>

      <input
        type="email"
        placeholder="예)1234@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />

      <div className="passwordWrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="영문,숫자,특수문자 포함 (8~20자)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="toggleButton"
          type="button"
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      <button onClick={handleLogin} className="button">로그인</button>

      <div className="linkContainer">
        <div className="leftLinks">
          <a href="#" className="link">비밀번호 찾기</a>
          <span className="divider">|</span>
          <a href="#" className="link">아이디 찾기</a>
        </div>
        <a href="#" className="signupLink">회원가입</a>
      </div>
    </div>
  );
}

export default Login;
