import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login() {
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://myeonjub.store/api/mojadol/api/v1/auth/login", {
        userLoginId: userLoginId,
        userPw: password,
      });
      const data = response.data;

      // accessToken 저장
      localStorage.setItem("accessToken", data.accessToken);
      const token = localStorage.getItem("accessToken");
      
      alert("로그인 성공!");
      // 예: 페이지 이동은 navigate("/home") 같은 걸로 추가

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "로그인 실패");
      } else {
        alert("서버에 연결할 수 없습니다.");
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
        placeholder="예)1234@gmail.com"
        value={userLoginId}
        onChange={(e) => setUserLoginId(e.target.value)}
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
          {showPassword ? '🕶️' : ' 👀'}
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
