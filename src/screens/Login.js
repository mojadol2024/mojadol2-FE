// import React, { useState } from 'react';
// import './Login.css'; // CSS 파일 불러오기

// function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = () => {
//     console.log('로그인 시도:', email, password);
//     // TODO: 로그인 API 연동
//   };

//   return (
//     <div className="container">
//       <div className="logo">
//         면접의<span className="logoHighlight">정석</span>
//       </div>
//       <h3 className="title">로그인</h3>

//       <input
//         type="email"
//         placeholder="예)1234@gmail.com"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="input"
//       />

//       <div className="passwordWrapper">
//         <input
//           type={showPassword ? 'text' : 'password'}
//           placeholder="영문,숫자,특수문자 포함 (8~20자)"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="input"
//         />
//         <button
//           onClick={() => setShowPassword(!showPassword)}
//           className="toggleButton"
//           type="button"
//         >
//           {showPassword ? '🙈' : '👁️'}
//         </button>
//       </div>

//       <button onClick={handleLogin} className="button">로그인</button>

//       <div className="linkContainer">
//         <div className="leftLinks">
//           <a href="#" className="link">비밀번호 찾기</a>
//           <span className="divider">|</span>
//           <a href="#" className="link">아이디 찾기</a>
//         </div>
//         <a href="#" className="signupLink">회원가입</a>
//       </div>
//     </div>
//   );
// }

// export default Login;
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login() {
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    console.log("🔘 로그인 버튼 클릭됨");
    try {
      const response = await axios.post("http://myeonjub.store/api/mojadol/api/v1/auth/signIn", {
        userLoginId: userLoginId,
        userPw: password,
      });
      console.log("✅ response:", response);
      console.log("✅ response.data:", response.data);
      const data = response.data;

      console.log("✅ 로그인 성공:", data);
      console.log("서버 응답:", data);
      // accessToken 저장
      localStorage.setItem("accessToken", data.accessToken);
      const token = localStorage.getItem("accessToken");
      console.log("📦 저장된 accessToken:", token);
      alert("로그인 성공!");
      // 예: 페이지 이동은 navigate("/home") 같은 걸로 추가

    } catch (error) {
      if (error.response) {
        console.error("❌ error.response:", error.response);
        console.error("❌ error.response.data:", error.response.data);
        console.warn("❌ 로그인 실패:", error.response.data.message);
        console.log("🔘 로그인 버튼 클릭됨");
        alert(error.response.data.message || "로그인 실패");
      } else {
        console.error("🚨 서버 연결 실패:", error);
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
