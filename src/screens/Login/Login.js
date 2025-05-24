// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';

// function Login() {
//   const [userLoginId, setUserLoginId] = useState('');
//   const [password, setPassword]   = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     console.log("▶ 로그인 요청 시작:", {
//       url: 'https://myeonjub.store/api/mojadol/api/v1/auth/login',
//       payload: { userLoginId, userPw: password },
//     });

//     try {
//       const response = await axios.post(
//         'https://myeonjub.store/api/mojadol/api/v1/auth/login',
//         { userLoginId, userPw: password },
//         {
//           withCredentials: true,            // 쿠키/세션 필요 시
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//       console.log("✅ 로그인 성공 응답:", response);
//       const { accessToken } = response.data;
//       localStorage.setItem('accessToken', accessToken);
//       alert('로그인 성공!');
//       navigate('/');
//     } catch (error) {
//       console.error('⛔ 로그인 실패:', error);
//       if (error.response) {
//         console.group('🚨 로그인 에러 디버깅');
//         console.error('HTTP status:', error.response.status);
//         console.error('Response data:', error.response.data);
//         console.error('Response headers:', error.response.headers);
//         console.groupEnd();
//         alert(
//           error.response.data.message ||
//           `로그인 실패 (status ${error.response.status})`
//         );
//       } else {
//         console.error('서버 연결 오류:', error.message);
//         alert('서버에 연결할 수 없습니다.');
//       }
//     }
//   };

//   return (
//     <div className="container">
//       <div className="logo">
//         면접의<span className="logoHighlight">정석</span>
//       </div>
//       <h3 className="title">로그인</h3>

//       <input
//         type="email"
//         placeholder="예) 1234@gmail.com"
//         value={userLoginId}
//         onChange={e => setUserLoginId(e.target.value)}
//         className="input"
//       />

//       <div className="passwordWrapper">
//         <input
//           type={showPassword ? 'text' : 'password'}
//           placeholder="영문, 숫자, 특수문자 포함 (8~20자)"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           className="input"
//         />
//         <button
//           onClick={() => setShowPassword(!showPassword)}
//           className="toggleButton"
//           type="button"
//         >
//           {showPassword ? '🕶️' : '👀'}
//         </button>
//       </div>

//       <button onClick={handleLogin} className="button">
//         로그인
//       </button>

//       <div className="linkContainer">
//         <div className="leftLinks">
//           <button className="link buttonLike">
//             비밀번호 찾기
//           </button>
//           <span className="divider">|</span>
//           <button
//             className="link buttonLike"
//             onClick={() => navigate('/find-id')}
//           >
//             아이디 찾기
//           </button>
//         </div>
//         <button
//           className="signupLink buttonLike"
//           onClick={() => navigate('/sign-up')}
//         >
//           회원가입
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Login;


//.env에서 됨됨
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("▶ 로그인 요청 시작:", {
      url: 'https://myeonjub.store/api/mojadol/api/v1/auth/login',
      payload: { userLoginId, userPw: password },
    });

    try {
      const response = await axios.post(
        'https://myeonjub.store/api/mojadol/api/v1/auth/login',
        { userLoginId, userPw: password },
        {
          withCredentials: true,            // 쿠키/세션 필요 시
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log("✅ 로그인 성공 응답:", response);
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      alert('로그인 성공!');
      navigate('/');
    } catch (error) {
      console.error('⛔ 로그인 실패:', error);
      if (error.response) {
        console.group('🚨 로그인 에러 디버깅');
        console.error('HTTP status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        console.groupEnd();
        alert(
          error.response.data.message ||
          `로그인 실패 (status ${error.response.status})`
        );
      } else {
        console.error('서버 연결 오류:', error.message);
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
          placeholder="영문, 숫자, 특수문자 포함 (8~20자)"
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
          <button className="link buttonLike">
            비밀번호 찾기
          </button>
          <span className="divider">|</span>
          <button
            className="link buttonLike"
            onClick={() => navigate('/find-id')}
          >
            아이디 찾기
          </button>
        </div>
        <button
          className="signupLink buttonLike"
          onClick={() => navigate('/sign-up')}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default Login;


// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';

// function Login() {
//   const [userLoginId, setUserLoginId] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const API_BASE = process.env.REACT_APP_API_BASE;

//   const handleLogin = async () => {
//     console.log("▶ 로그인 요청 시작:", {
//       url: `${API_BASE}/auth/login`,
//       payload: { userLoginId, userPw: password },
//     });

//     try {
//       const response = await axios.post(
//         `${API_BASE}/auth/login`,
//         { userLoginId, userPw: password },
//         {
//           withCredentials: true,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//       console.log("✅ 로그인 성공 응답:", response);
//       const { accessToken } = response.data;
//       localStorage.setItem('accessToken', accessToken);
//       alert('로그인 성공!');
//       navigate('/');
//     } catch (error) {
//       console.error('⛔ 로그인 실패:', error);
//       if (error.response) {
//         console.group('🚨 로그인 에러 디버깅');
//         console.error('HTTP status:', error.response.status);
//         console.error('Response data:', error.response.data);
//         console.error('Response headers:', error.response.headers);
//         console.groupEnd();
//         alert(
//           error.response.data.message ||
//           `로그인 실패 (status ${error.response.status})`
//         );
//       } else {
//         console.error('서버 연결 오류:', error.message);
//         alert('서버에 연결할 수 없습니다.');
//       }
//     }
//   };

//   return (
//     <div className="container">
//       <div className="logo">
//         면접의<span className="logoHighlight">정석</span>
//       </div>
//       <h3 className="title">로그인</h3>

//       <input
//         type="email"
//         placeholder="예) 1234@gmail.com"
//         value={userLoginId}
//         onChange={e => setUserLoginId(e.target.value)}
//         className="input"
//       />

//       <div className="passwordWrapper">
//         <input
//           type={showPassword ? 'text' : 'password'}
//           placeholder="영문, 숫자, 특수문자 포함 (8~20자)"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           className="input"
//         />
//         <button
//           onClick={() => setShowPassword(!showPassword)}
//           className="toggleButton"
//           type="button"
//         >
//           {showPassword ? '🕶️' : '👀'}
//         </button>
//       </div>

//       <button onClick={handleLogin} className="button">
//         로그인
//       </button>

//       <div className="linkContainer">
//         <div className="leftLinks">
//           <button className="link buttonLike">
//             비밀번호 찾기
//           </button>
//           <span className="divider">|</span>
//           <button
//             className="link buttonLike"
//             onClick={() => navigate('/find-id')}
//           >
//             아이디 찾기
//           </button>
//         </div>
//         <button
//           className="signupLink buttonLike"
//           onClick={() => navigate('/sign-up')}
//         >
//           회원가입
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Login;
