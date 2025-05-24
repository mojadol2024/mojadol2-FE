// import React, { useState } from 'react';
// import axios from 'axios';
// import './SignUp.css';

// function Signup() {
//   const [formData, setFormData] = useState({
//     userLoginId: '',
//     userPw: '',
//     confirmPw: '',
//     userName: '',
//     nickname: '',
//     phoneNumber: '',
//     email: '',
//   });

//   const [passwordError, setPasswordError] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (name === 'confirmPw') {
//       if (value !== formData.userPw) {
//         setPasswordError('비밀번호가 일치하지 않습니다.');
//       } else {
//         setPasswordError('비밀번호가 일치합니다.');
//       }
//     }
//   };

//   const handleSignup = async () => {
//     if (formData.userPw !== formData.confirmPw) {
//       alert("비밀번호가 일치하지 않습니다.");
//       return;
//     }

//     try {
//       const response = await axios.post("https://myeonjub.store/api/mojadol/api/v1/users/sign-up", {
//         userLoginId: formData.userLoginId,
//         userPw: formData.userPw,
//         userName: formData.userName,
//         nickname: formData.nickname,
//         phoneNumber: formData.phoneNumber,
//         email: formData.email,
//       });

//       alert("회원가입 성공!");
//     } catch (error) {
//       if (error.response) {
//         console.log(error.response.data); 
//         alert(error.response.data.message || "회원가입 실패");
//       } else {
//         alert("서버에 연결할 수 없습니다.");
//       }
//     }
//   };

//   const checkIdDuplicate = async () => {
//     if (!formData.userLoginId) {
//       alert("아이디를 입력해주세요.");
//       return;
//     }
  
//     try {
//       const res = await axios.get(
//         `https://myeonjub.store/api/mojadol/api/v1/users/check?userLoginId=${formData.userLoginId}`
//       );
  
//       console.log("아이디 중복 확인 응답:", res.data);
  
//       if (res.data.result === "중복되는 데이터가 없습니다.") {
//         alert("사용 가능한 아이디입니다.");
//       } else {
//         alert("이미 사용 중인 아이디입니다.");
//       }
//     } catch (err) {
//       alert("아이디 중복 확인 중 오류가 발생했습니다.");
//       console.error("백엔드 응답:", err.response?.data || err.message);
//     }
//   };
  
  
  
  
  

//   const checkNicknameDuplicate = async () => {
//     if (!formData.nickname) {
//       alert("닉네임을 입력해주세요.");
//       return;
//     }
  
//     try {
//       const res = await axios.get(
//         `https://myeonjub.store/api/mojadol/api/v1/users/check?nickname=${formData.nickname}`
//       );
  
//       console.log("응답 데이터:", res.data);
  
//       if (res.data.result === "중복되는 데이터가 없습니다.") {
//         alert("사용 가능한 닉네임입니다.");
//       } else {
//         alert("이미 사용 중인 닉네임입니다.");
//       }
//     } catch (err) {
//       console.error("닉네임 중복 확인 중 오류:", err);
//       alert("닉네임 중복 확인 중 오류가 발생했습니다.");
//     }
//   };
  
  
  

//   const checkEmailDuplicate = async () => {
//     if (!formData.email) {
//       alert("이메일을 입력해주세요.");
//       return;
//     }
  
//     try {
//       const res = await axios.get(
//         `https://myeonjub.store/api/mojadol/api/v1/users/check?email=${formData.email}`
//       );
  
      
  
//       if (res.data.result === "중복되는 데이터가 없습니다.") {
//         alert("사용 가능한 이메일입니다.");
//         console.log("이메일 중복 확인 응답:", res.data);
//       } else {
//         alert("이미 사용 중인 이메일입니다.");
//         console.log("이메일 중복 확인 응답:", res.data);
//       }
//     } catch (err) {
//       alert("이메일 중복 확인 중 오류가 발생했습니다.");
//       console.error("백엔드 응답:", err.response?.data || err.message);
//     }
//   };
  
  
  

//   return (
//     <div className="container">
//       <div className="logo">
//         면접의<span className="logoHighlight">정석</span>
//       </div>
//       <h3 className="title">회원가입</h3>

//       {/* 로그인 아이디 + 중복 확인 버튼 */}
//       <div style={{ position: 'relative', width: '500px', marginBottom: '20px' }}>
//         <input
//           type="text"
//           name="userLoginId"
//           placeholder="로그인 아이디"
//           value={formData.userLoginId}
//           onChange={handleChange}
//           className="input"
//         />
//         <button
//           onClick={checkIdDuplicate}
//           className="duplicate-check-button"
//         >
//           중복 확인
//         </button>
//       </div>

//       <input
//         type="password"
//         name="userPw"
//         placeholder="비밀번호"
//         value={formData.userPw}
//         onChange={handleChange}
//         className="input"
//         style={{ marginBottom: '10px' }}
//       />

//       <input
//         type="password"
//         name="confirmPw"
//         placeholder="비밀번호 확인"
//         value={formData.confirmPw}
//         onChange={handleChange}
//         className="input"
//         style={{ marginBottom: '10px' }}
//       />
      
//       {passwordError && (
//         <div style={{ color: passwordError.includes('일치하지 않') ? 'red' : 'green', marginBottom: '10px' }}>
//           {passwordError}
//         </div>
//       )}

//       <input
//         type="text"
//         name="userName"
//         placeholder="이름"
//         value={formData.userName}
//         onChange={handleChange}
//         className="input"
//         style={{ marginBottom: '10px' }}
//       />

//       {/* 닉네임 + 중복 확인 버튼 */}
//       <div style={{ position: 'relative', width: '500px', marginBottom: '20px' }}>
//         <input
//           type="text"
//           name="nickname"
//           placeholder="닉네임"
//           value={formData.nickname}
//           onChange={handleChange}
//           className="input"
//         />
//         <button
//           onClick={checkNicknameDuplicate}
//           className="duplicate-check-button"
//         >
//           중복 확인
//         </button>
//       </div>

//       <input
//         type="tel"
//         name="phoneNumber"
//         placeholder="휴대폰 번호 (예: 010-1234-5678)"
//         value={formData.phoneNumber}
//         onChange={handleChange}
//         className="input"
//         style={{ marginBottom: '10px' }}
//       />

//       {/* 이메일 + 중복 확인 버튼 */}
//       <div style={{ position: 'relative', width: '500px', marginBottom: '20px' }}>
//         <input
//           type="email"
//           name="email"
//           placeholder="이메일 주소"
//           value={formData.email}
//           onChange={handleChange}
//           className="input"
//         />
//         <button
//           onClick={checkEmailDuplicate}
//           className="duplicate-check-button"
//         >
//           중복 확인
//         </button>
//       </div>

//       <div style={{ display: 'flex', justifyContent: 'space-between', width: '500px', marginTop: '20px' }}>
//         <button
//           className="button"
//           style={{ backgroundColor: '#ccc', color: '#000', marginRight: '10px' }}
//           onClick={() => {
//             // 취소 동작
//           }}
//         >
//           취소
//         </button>
//         <button className="button" onClick={handleSignup}>가입하기</button>
//       </div>
//     </div>
//   );
// }

// export default Signup;
// src/components/SignUp.js







//.env파일 BASE로 했을떄떄
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

function SignUp() {
  const [formData, setFormData] = useState({
    userLoginId: '',
    userPw: '',
    confirmPw: '',
    userName: '',
    nickname: '',
    phoneNumber: '',
    email: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'confirmPw') {
      setPasswordError(
        value !== formData.userPw
          ? '비밀번호가 일치하지 않습니다.'
          : '비밀번호가 일치합니다.'
      );
    }
  };

  const handleSignup = async () => {
    if (formData.userPw !== formData.confirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const res = await axios.post(
        'https://myeonjub.store/api/mojadol/api/v1/users/sign-up',
        {
          userLoginId: formData.userLoginId,
          userPw:       formData.userPw,
          userName:     formData.userName,
          nickname:     formData.nickname,
          phoneNumber:  formData.phoneNumber,
          email:        formData.email,
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log('✅ 회원가입 성공 응답:', res);
      alert('회원가입 성공!');
      navigate('/login');
    } catch (error) {
      console.error('⛔ 회원가입 실패 응답 전체:', error.response);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.response?.data;
      alert(`회원가입 실패: 상태 ${status}\n메시지: ${message}`);
    }
  };

  const checkIdDuplicate = async () => {
    if (!formData.userLoginId) {
      alert('아이디를 입력해주세요.');
      return;
    }
    try {
      const { data } = await axios.get(
        'https://myeonjub.store/api/mojadol/api/v1/users/check',
        {
          params: { userLoginId: formData.userLoginId },
          withCredentials: true,
        }
      );
      alert(
        data.result === '중복되는 데이터가 없습니다.'
          ? '사용 가능한 아이디입니다.'
          : '이미 사용 중인 아이디입니다.'
      );
    } catch (err) {
      console.error('⛔ 아이디 중복 확인 실패:', err.response || err);
      alert('아이디 중복 확인 중 오류가 발생했습니다.');
    }
  };

  const checkNicknameDuplicate = async () => {
    if (!formData.nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    try {
      const { data } = await axios.get(
        'https://myeonjub.store/api/mojadol/api/v1/users/check',
        {
          params: { nickname: formData.nickname },
          withCredentials: true,
        }
      );
      alert(
        data.result === '중복되는 데이터가 없습니다.'
          ? '사용 가능한 닉네임입니다.'
          : '이미 사용 중인 닉네임입니다.'
      );
    } catch (err) {
      console.error('⛔ 닉네임 중복 확인 실패:', err.response || err);
      alert('닉네임 중복 확인 중 오류가 발생했습니다.');
    }
  };

  const checkEmailDuplicate = async () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    try {
      const { data } = await axios.get(
        'https://myeonjub.store/api/mojadol/api/v1/users/check',
        {
          params: { email: formData.email },
          withCredentials: true,
        }
      );
      alert(
        data.result === '중복되는 데이터가 없습니다.'
          ? '사용 가능한 이메일입니다.'
          : '이미 사용 중인 이메일입니다.'
      );
    } catch (err) {
      console.error('⛔ 이메일 중복 확인 실패:', err.response || err);
      alert('이메일 중복 확인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container">
      <div className="logo">
        면접의<span className="logoHighlight">정석</span>
      </div>
      <h3 className="title">회원가입</h3>

      {/* 아이디 + 중복 확인 */}
      <div style={{ position: 'relative', width: '500px', marginBottom: '20px' }}>
        <input
          type="text"
          name="userLoginId"
          placeholder="로그인 아이디"
          value={formData.userLoginId}
          onChange={handleChange}
          className="input"
        />
        <button onClick={checkIdDuplicate} className="duplicate-check-button">
          중복 확인
        </button>
      </div>

      {/* 비밀번호 */}
      <input
        type="password"
        name="userPw"
        placeholder="비밀번호"
        value={formData.userPw}
        onChange={handleChange}
        className="input"
      />
      <input
        type="password"
        name="confirmPw"
        placeholder="비밀번호 확인"
        value={formData.confirmPw}
        onChange={handleChange}
        className="input"
      />
      {passwordError && (
        <div style={{ color: passwordError.includes('일치하지') ? 'red' : 'green', marginBottom: '10px' }}>
          {passwordError}
        </div>
      )}

      {/* 이름 */}
      <input
        type="text"
        name="userName"
        placeholder="이름"
        value={formData.userName}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '20px' }}
      />

      {/* 닉네임 + 중복 확인 */}
      <div style={{ position: 'relative', width: '500px', marginBottom: '20px' }}>
        <input
          type="text"
          name="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          className="input"
        />
        <button onClick={checkNicknameDuplicate} className="duplicate-check-button">
          중복 확인
        </button>
      </div>

      {/* 휴대폰 */}
      <input
        type="tel"
        name="phoneNumber"
        placeholder="휴대폰 번호 (예: 010-1234-5678)"
        value={formData.phoneNumber}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '20px' }}
      />

      {/* 이메일 + 중복 확인 */}
      <div style={{ position: 'relative', width: '500px', marginBottom: '20px' }}>
        <input
          type="email"
          name="email"
          placeholder="이메일 주소"
          value={formData.email}
          onChange={handleChange}
          className="input"
        />
        <button onClick={checkEmailDuplicate} className="duplicate-check-button">
          중복 확인
        </button>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '500px' }}>
        <button className="button" style={{ backgroundColor: '#ccc', color: '#000' }} onClick={() => navigate(-1)}>
          취소
        </button>
        <button className="button" onClick={handleSignup}>
          가입하기
        </button>
      </div>
    </div>
  );
}

export default SignUp;
  // import React, { useState } from 'react';
  // import axios from 'axios';
  // import { useNavigate } from 'react-router-dom';
  // import './SignUp.css';

  // function SignUp() {
  //   const [formData, setFormData] = useState({
  //     userLoginId: '',
  //     userPw: '',
  //     confirmPw: '',
  //     userName: '',
  //     nickname: '',
  //     phoneNumber: '',
  //     email: '',
  //   });
  //   const [passwordError, setPasswordError] = useState('');
  //   const navigate = useNavigate();

  //   const API_BASE = process.env.REACT_APP_API_BASE;

  //   const handleChange = (e) => {
  //     const { name, value } = e.target;
  //     setFormData(prev => ({ ...prev, [name]: value }));
  //     if (name === 'confirmPw') {
  //       setPasswordError(
  //         value !== formData.userPw
  //           ? '비밀번호가 일치하지 않습니다.'
  //           : '비밀번호가 일치합니다.'
  //       );
  //     }
  //   };

  //   const handleSignup = async () => {
  //     if (formData.userPw !== formData.confirmPw) {
  //       alert('비밀번호가 일치하지 않습니다.');
  //       return;
  //     }

  //     try {
  //       const res = await axios.post(
  //         `${API_BASE}/users/sign-up`,
  //         {
  //           userLoginId: formData.userLoginId,
  //           userPw:       formData.userPw,
  //           userName:     formData.userName,
  //           nickname:     formData.nickname,
  //           phoneNumber:  formData.phoneNumber,
  //           email:        formData.email,
  //         },
  //         {
  //           withCredentials: true,
  //           headers: { 'Content-Type': 'application/json' },
  //         }
  //       );
  //       console.log('✅ 회원가입 성공 응답:', res);
  //       alert('회원가입 성공!');
  //       navigate('/login');
  //     } catch (error) {
  //       console.error('⛔ 회원가입 실패 응답 전체:', error.response);
  //       const status = error.response?.status;
  //       const message = error.response?.data?.message || error.response?.data;
  //       alert(`회원가입 실패: 상태 ${status}\n메시지: ${message}`);
  //     }
  //   };

  //   const checkIdDuplicate = async () => {
  //     if (!formData.userLoginId) {
  //       alert('아이디를 입력해주세요.');
  //       return;
  //     }
  //     try {
  //       const { data } = await axios.get(
  //         `${API_BASE}/users/check`,
  //         {
  //           params: { userLoginId: formData.userLoginId },
  //           withCredentials: true,
  //         }
  //       );
  //       alert(
  //         data.result === '중복되는 데이터가 없습니다.'
  //           ? '사용 가능한 아이디입니다.'
  //           : '이미 사용 중인 아이디입니다.'
  //       );
  //     } catch (err) {
  //       console.error('⛔ 아이디 중복 확인 실패:', err.response || err);
  //       alert('아이디 중복 확인 중 오류가 발생했습니다.');
  //     }
  //   };

  //   const checkNicknameDuplicate = async () => {
  //     if (!formData.nickname) {
  //       alert('닉네임을 입력해주세요.');
  //       return;
  //     }
  //     try {
  //       const { data } = await axios.get(
  //         `${API_BASE}/users/check`,
  //         {
  //           params: { nickname: formData.nickname },
  //           withCredentials: true,
  //         }
  //       );
  //       alert(
  //         data.result === '중복되는 데이터가 없습니다.'
  //           ? '사용 가능한 닉네임입니다.'
  //           : '이미 사용 중인 닉네임입니다.'
  //       );
  //     } catch (err) {
  //       console.error('⛔ 닉네임 중복 확인 실패:', err.response || err);
  //       alert('닉네임 중복 확인 중 오류가 발생했습니다.');
  //     }
  //   };

  //   const checkEmailDuplicate = async () => {
  //     if (!formData.email) {
  //       alert('이메일을 입력해주세요.');
  //       return;
  //     }
  //     try {
  //       const { data } = await axios.get(
  //         `${API_BASE}/users/check`,
  //         {
  //           params: { email: formData.email },
  //           withCredentials: true,
  //         }
  //       );
  //       alert(
  //         data.result === '중복되는 데이터가 없습니다.'
  //           ? '사용 가능한 이메일입니다.'
  //           : '이미 사용 중인 이메일입니다.'
  //       );
  //     } catch (err) {
  //       console.error('⛔ 이메일 중복 확인 실패:', err.response || err);
  //       alert('이메일 중복 확인 중 오류가 발생했습니다.');
  //     }
  //   };

  //   // ... 나머지 UI 부분은 그대로 유지
  // }

  // export default SignUp;
