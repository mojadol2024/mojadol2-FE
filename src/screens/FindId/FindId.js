// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './FindId.css';

// const API_BASE_URL = process.env.REACT_APP_BASE_URL;

// function FindId() {
//   const [email, setEmail] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [sentCode, setSentCode] = useState(false); // 인증번호 전송 여부
//   const navigate = useNavigate();

//   const isValidEmail = address => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);

//   // ✅ 인증번호 전송
//   const handleSendVerificationCode = async () => {
//     if (!email) {
//       alert('이메일을 입력해주세요.');
//       return;
//     }
//     if (!isValidEmail(email)) {
//       alert('유효한 이메일 형식이 아닙니다.');
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/mojadol/api/v1/mail/mail-check`,
//         { email },
//         { headers: { 'Content-Type': 'application/json' } }
//       );
//       alert('인증번호가 전송되었습니다.');
//       setSentCode(true);
//     } catch (err) {
//       alert(
//         err.response?.data?.message ||
//         `인증번호 전송 실패 (status: ${err.response?.status})`
//       );
//     }
//   };

//   // ✅ 아이디 찾기
//   const handleFindId = async () => {
//     if (!email || !verificationCode) {
//       alert('이메일과 인증번호를 모두 입력해주세요.');
//       return;
//     }

//     try {
//       const url = `${API_BASE_URL}/mojadol/api/v1/mail/find-user-id`;

//       const response = await axios.post(
//         url,
//         {
//           email,
//           code: verificationCode,
//         },
//         {
//           headers: { 'Content-Type': 'application/json' },
//           withCredentials: true,
//         }
//       );
//       alert('아이디가 이메일로 발송되었습니다.');
//       navigate('/login');
//     } catch (err) {
//       alert(
//         err.response?.data?.message ||
//         `아이디 찾기 실패 (status: ${err.response?.status})`
//       );
//     }
//   };

//   return (
//     <div className="findid-container">
//       <div className="logo">
//         면접의<span className="logoHighlight">정석</span>
//       </div>
//       <h3 className="title">아이디 찾기</h3>

//       <div className="input-with-button">
//         <input
//           type="email"
//           placeholder="예) 1234@gmail.com"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           className="input"
//         />
//         <button onClick={handleSendVerificationCode} className="inline-button">
//           인증번호 전송
//         </button>
//       </div>

//       {sentCode && (
//         <input
//           type="text"
//           placeholder="인증번호 입력"
//           value={verificationCode}
//           onChange={e => setVerificationCode(e.target.value)}
//           className="input"
//         />
//       )}

//       <button onClick={handleFindId} className="button">
//         확인
//       </button>

//       <button className="backLink" onClick={() => navigate('/login')}>
//         ← 로그인으로 돌아가기
//       </button>
//     </div>
//   );
// }

// export default FindId;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FindId.css';

// ✅ 환경변수 사용
const API_BASE_URL = process.env.REACT_APP_BASE_URL;

function FindId() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const isValidEmail = address => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);

  const handleFindId = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!isValidEmail(email)) {
      alert('유효한 이메일 형식이 아닙니다.');
      return;
    }

    try {
      const url = `${API_BASE_URL}/mojadol/api/v1/mail/find-user-id`;
      console.log('❓ 아이디 찾기 요청 URL:', url);

      const response = await axios.post(
        url,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      console.log('✅ 아이디 찾기 응답:', response.data);
      alert('메일 발송 성공');
      navigate('/login');
    } catch (err) {
      console.group('⛔ FindId 에러 디버깅');
      console.error('HTTP status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.groupEnd();
      alert(
        err.response?.data?.message ||
        `메일 발송에 실패했습니다. (status: ${err.response?.status})`
      );
    }
  };

  return (
    <div className="findid-container">
      <div className="logo">
        면접의<span className="logoHighlight">정석</span>
      </div>
<h3 className="title">아이디 찾기</h3>

<div style={{ marginBottom: '16px' }}>
  <input
    type="email"
    placeholder="예) 1234@gmail.com"
    value={email}
    onChange={e => setEmail(e.target.value)}
    className="input"
  />
</div>

<button onClick={handleFindId} className="button">
  확인
</button>

      <button className="backLink" onClick={() => navigate('/login')}>
        ← 로그인으로 돌아가기
      </button>
    </div>
  );
}

export default FindId;