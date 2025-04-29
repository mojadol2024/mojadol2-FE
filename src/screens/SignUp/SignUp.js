import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css';

function Signup() {
  const [formData, setFormData] = useState({
    userLoginId: '',
    userPw: '',
    confirmPw: '',
    userName: '',
    nickname: '',
    phoneNumber: '',
    email: '',
  });

  const [passwordError, setPasswordError] = useState(''); // 비밀번호 확인 에러 메시지 상태

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 비밀번호 확인시 일치 여부 체크ㄹ
    if (name === 'confirmPw') {
      if (value !== formData.userPw) {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      } else {
        setPasswordError('비밀번호가 일치합니다.');
      }
    }
  };

  const handleSignup = async () => {
    if (formData.userPw !== formData.confirmPw) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.post("https://myeonjub.store/api/mojadol/api/v1/auth/signUp", {
        userLoginId: formData.userLoginId,
        userPw: formData.userPw,
        userName: formData.userName,
        nickname: formData.nickname,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      });
    
      alert("회원가입 성공!");
      // 예: navigate('/login') 등으로 로그인 페이지로 이동 가능

    } catch (error) {
      if (error.response) {
        console.log(error.response.data); 
        alert(error.response.data.message || "회원가입 실패");
      } else {
        alert("서버에 연결할 수 없습니다.");
      }
    }
  };
  console.log(formData);

  return (
    <div className="container">
      <div className="logo">
        면접의<span className="logoHighlight">정석</span>
      </div>
      <h3 className="title">회원가입</h3>

      <input
        type="text"
        name="userLoginId"
        placeholder="로그인 아이디"
        value={formData.userLoginId}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '10px' }}
      />

      <input
        type="password"
        name="userPw"
        placeholder="비밀번호"
        value={formData.userPw}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '10px' }}
      />

      <input
        type="password"
        name="confirmPw"
        placeholder="비밀번호 확인"
        value={formData.confirmPw}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '10px' }}
      />
      
      {passwordError && (
        <div style={{ color: passwordError.includes('일치하지 않') ? 'red' : 'green', marginBottom: '10px' }}>
          {passwordError}
        </div>
      )}

      <input
        type="text"
        name="userName"
        placeholder="이름"
        value={formData.userName}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '10px' }}
      />

      <input
        type="text"
        name="nickname"
        placeholder="닉네임"
        value={formData.nickname}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '10px' }}
      />

      <input
        type="tel"
        name="phoneNumber"
        placeholder="휴대폰 번호 (예: 010-1234-5678)"
        value={formData.phoneNumber}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '10px' }}
      />

      <input
        type="email"
        name="email"
        placeholder="이메일 주소"
        value={formData.email}
        onChange={handleChange}
        className="input"
        style={{ marginBottom: '10px' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '500px', marginTop: '20px' }}>
        <button
          className="button"
          style={{ backgroundColor: '#ccc', color: '#000',marginRight: '10px' }}
          onClick={() => {
            // 취소 버튼 클릭 시 동작 없음
          }}
        >
          취소
        </button>
        <button className="button" onClick={handleSignup}>가입하기</button>
      </div>
    </div>
  );
}

export default Signup;
