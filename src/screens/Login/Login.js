// //.env에서 됨됨
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';

// // ✅ 환경변수에서 API 주소 읽기
// const API_BASE_URL = process.env.REACT_APP_BASE_URL;

// function Login() {
//   const [userLoginId, setUserLoginId] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     const url = `${API_BASE_URL}/mojadol/api/v1/auth/login`;
//     console.log("▶ 로그인 요청 시작:", {
//       url,
//       payload: { userLoginId, userPw: password },
//     });

//     try {
//       const response = await axios.post(
//         url,
//         { userLoginId, userPw: password },
//         {
//           withCredentials: true,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

      
//       const { accessToken } = response.data;
//       localStorage.setItem('accessToken', accessToken);
//       alert('로그인 성공!');
//       navigate('/');
//     } catch (error) {
      
//       if (error.response) {
        
//         alert(
//           error.response.data.message ||
//           `로그인 실패 (status ${error.response.status})`
//         );
//       } else {
        
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
//   <div className="leftLinks">
//     <span className="link" onClick={() => navigate('/find-id')}>
//       아이디 찾기
//     </span>
//   </div>
//   <span className="signupLink" onClick={() => navigate('/sign-up')}>
//     회원가입
//   </span>
// </div>

//     </div>
//   );
// }

// export default Login;
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';

// const API_BASE_URL = process.env.REACT_APP_BASE_URL;

// function Login() {
//   const [userLoginId, setUserLoginId] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showResetModal, setShowResetModal] = useState(false);
//   const [resetEmail, setResetEmail] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/mojadol/api/v1/auth/login`,
//         { userLoginId, userPw: password },
//         {
//           withCredentials: true,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//       localStorage.setItem('accessToken', response.data.accessToken);
//       alert('로그인 성공!');
//       navigate('/');
//     } catch (error) {
//       alert(
//         error.response?.data?.message ||
//         `로그인 실패 (status ${error.response?.status})`
//       );
//     }
//   };

//   const handlePasswordReset = async () => {
//     if (!resetEmail) return alert('이메일을 입력해주세요.');
//     try {
//       await axios.post(
//         `${API_BASE_URL}/mojadol/api/v1/mail/temp-password`,
//         { email: resetEmail },
//         { headers: { 'Content-Type': 'application/json' } }
//       );
//       alert('임시 비밀번호가 이메일로 전송되었습니다.');
//       setShowResetModal(false);
//     } catch (err) {
//       alert(
//         err.response?.data?.message ||
//         `전송 실패 (status: ${err.response?.status})`
//       );
//     }
//   };

//   return (
//     <div className="container">
//       <div className="logo">면접의<span className="logoHighlight">정석</span></div>
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
//           placeholder="비밀번호"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           className="input"
//         />
//         <button onClick={() => setShowPassword(!showPassword)} className="toggleButton">
//           {showPassword ? '🕶️' : '👀'}
//         </button>
//       </div>

//       <button onClick={handleLogin} className="button">로그인</button>

//       <div className="linkContainer">
//         <div className="leftLinks">
//           <span className="link" onClick={() => navigate('/find-id')}>아이디 찾기</span>
//           <span className="divider">|</span>
//           <span className="link" onClick={() => setShowResetModal(true)}>비밀번호 찾기</span>
//         </div>
//         <span className="signupLink" onClick={() => navigate('/sign-up')}>회원가입</span>
//       </div>

//       {showResetModal && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h3 className="title">비밀번호 찾기</h3>
//             <p>가입한 이메일로 임시 비밀번호가 전송됩니다.</p>
//             <input
//               type="email"
//               className="input"
//               placeholder="이메일 입력"
//               value={resetEmail}
//               onChange={e => setResetEmail(e.target.value)}
//             />
//             <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
//               <button className="button" onClick={handlePasswordReset}>확인</button>
//               <button className="button" style={{ background: '#ccc' }} onClick={() => setShowResetModal(false)}>닫기</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Login;


// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import PasswordResetModal from './PasswordResetModal'; // ✅ 모달 컴포넌트 임포트

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

function Login() {
  const [userLoginId, setUserLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false); // ✅ 모달 상태
  const navigate = useNavigate();

  const handleLogin = async () => {
    const url = `${API_BASE_URL}/mojadol/api/v1/auth/login`;
    console.log("▶ 로그인 요청:", {
      url,
      payload: { userLoginId, userPw: password },
    });

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
      navigate('/');
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
        <span className="signupLink" onClick={() => navigate('/sign-up')}>
          회원가입
        </span>
      </div>

      {/* ✅ 비밀번호 찾기 모달 */}
      {showResetModal && (
        <PasswordResetModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
}

export default Login;
