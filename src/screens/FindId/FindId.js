// src/components/FindId.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FindId.css';

function FindId() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // 1) 이메일 빈 값/포맷 검사
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
      // 풀 URL + POST body 로 호출
      const response = await axios.post(
        'https://myeonjub.store/api/mojadol/api/v1/mail/find-user-id',
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
      console.group('FindId 에러 디버깅');
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

      <input
        type="email"
        placeholder="예) 1234@gmail.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input"
      />

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





// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import '../Login/Login.css';

// function FindId() {
//   const [email, setEmail] = useState('');
//   const navigate = useNavigate();

//   const handleFindId = async () => {
//     try {
//       // ← 여기 경로를 /api/mojadol/... 로 수정
//       await axios.post('/api/mojadol/api/v1/mail/find-user-id', { email });
//       alert('입력하신 이메일로 아이디 안내 메일을 발송했습니다.');
//       navigate('/Login');
//     } catch (error) {
//       console.error(error);
//       if (error.response) {
//         // 405 외에도 다른 오류가 남아있다면
//         alert(error.response.data.message || '메일 발송에 실패했습니다.');
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
//       <h3 className="title">아이디 찾기</h3>

//       <input
//         type="email"
//         placeholder="예) 1234@gmail.com"
//         value={email}
//         onChange={e => setEmail(e.target.value)}
//         className="input"
//       />

//       <button onClick={handleFindId} className="button">
//         확인
//       </button>

//       <button
//         className="backLink buttonLike"
//         onClick={() => navigate('/Login')}
//       >
//         ← 로그인으로 돌아가기
//       </button>
//     </div>
//   );
// }

// export default FindId;
