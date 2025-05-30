import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

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
  const [pwFormatError, setPwFormatError] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const navigate = useNavigate();

  const isValidPassword = (password) => {
    const lengthCheck = /^.{8,16}$/;
    const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const passedTypes = types.filter((regex) => regex.test(password)).length;
    return lengthCheck.test(password) && passedTypes >= 2;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'userLoginId') setIdChecked(false);
    if (name === 'nickname') setNicknameChecked(false);
    if (name === 'email') setEmailChecked(false);

    if (name === 'userPw') {
      if (value === '') {
        setPwFormatError('');
      } else if (!isValidPassword(value)) {
        setPwFormatError('8~16자리의 대소문자/숫자/특수문자 2종 이상을 조합하세요.');
      } else {
        setPwFormatError('');
      }
    }

    if (name === 'confirmPw') {
      setPasswordError(
        value !== formData.userPw
          ? '비밀번호가 일치하지 않습니다.'
          : '비밀번호가 일치합니다.'
      );
    }
  };

  const handleSignup = async () => {
    if (!formData.userLoginId || !formData.userPw || !formData.confirmPw || !formData.userName || !formData.nickname || !formData.phoneNumber || !formData.email) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    if (!idChecked || !nicknameChecked || !emailChecked) {
      alert('아이디, 닉네임, 이메일 중복 확인을 모두 완료해주세요.');
      return;
    }
    if (formData.userPw !== formData.confirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isValidPassword(formData.userPw)) {
      alert('비밀번호 조건을 만족하지 않습니다.');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.endsWith('.com')) {
      alert('유효하지 않은 이메일입니다.');
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/mojadol/api/v1/users/sign-up`,
        {
          userLoginId: formData.userLoginId,
          userPw: formData.userPw,
          userName: formData.userName,
          nickname: formData.nickname,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      alert('회원가입 성공!');
      navigate('/login');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.response?.data;
      alert(`회원가입 실패: 상태 ${status}\n메시지: ${message}`);
    }
  };

  const checkIdDuplicate = async () => {
    if (!formData.userLoginId) return alert('아이디를 입력해주세요.');
    const idRegex = /^[A-Za-z0-9]{4,12}$/;
    if (!idRegex.test(formData.userLoginId)) {
      return alert('아이디는 4~12자의 영문 또는 숫자만 사용할 수 있습니다.');
    }
    try {
      const { data } = await axios.get(`${API_BASE_URL}/mojadol/api/v1/users/check`, {
        params: { userLoginId: formData.userLoginId },
        withCredentials: true,
      });
      if (data.result === '중복되는 데이터가 없습니다.') {
        alert('사용 가능한 아이디입니다.');
        setIdChecked(true);
      } else {
        alert('이미 사용 중인 아이디입니다.');
        setIdChecked(false);
      }
    } catch {
      alert('아이디 중복 확인 중 오류가 발생했습니다.');
      setIdChecked(false);
    }
  };

  const checkNicknameDuplicate = async () => {
    if (!formData.nickname) return alert('닉네임을 입력해주세요.');
    try {
      const { data } = await axios.get(`${API_BASE_URL}/mojadol/api/v1/users/check`, {
        params: { nickname: formData.nickname },
        withCredentials: true,
      });
      if (data.result === '중복되는 데이터가 없습니다.') {
        alert('사용 가능한 닉네임입니다.');
        setNicknameChecked(true);
      } else {
        alert('이미 사용 중인 닉네임입니다.');
        setNicknameChecked(false);
      }
    } catch {
      alert('닉네임 중복 확인 중 오류가 발생했습니다.');
      setNicknameChecked(false);
    }
  };

  const checkEmailDuplicate = async () => {
    if (!formData.email) return alert('이메일을 입력해주세요.');
    if (!formData.email.includes('@') || !formData.email.endsWith('.com')) {
      return alert('유효하지 않은 이메일 형식 입니다.');
    }
    try {
      const { data } = await axios.get(`${API_BASE_URL}/mojadol/api/v1/users/check`, {
        params: { email: formData.email },
        withCredentials: true,
      });
      if (data.result === '중복되는 데이터가 없습니다.') {
        alert('사용 가능한 이메일입니다.');
        setEmailChecked(true);
      } else {
        alert('이미 사용 중인 이메일입니다.');
        setEmailChecked(false);
      }
    } catch {
      alert('이메일 중복 확인 중 오류가 발생했습니다.');
      setEmailChecked(false);
    }
  };

  return (
    <div className="container">
      <div className="logo">
        면접의<span className="logoHighlight">정석</span>
      </div>
      <h3 className="title">회원가입</h3>

      <div style={{ position: 'relative', width: '500px', marginBottom: '20px' }}>
        <input
          type="text"
          name="userLoginId"
          placeholder="로그인 아이디(4~12자의 영문,숫자만 가능)"
          value={formData.userLoginId}
          onChange={handleChange}
          className="input"
        />
        <button onClick={checkIdDuplicate} className="duplicate-check-button">
          중복 확인
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="password"
          name="userPw"
          placeholder="비밀번호"
          value={formData.userPw}
          onChange={handleChange}
          className="input"
        />
        {pwFormatError && (
          <div style={{ color: 'red', marginTop: '5px', fontSize: '13px' }}>{pwFormatError}</div>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="password"
          name="confirmPw"
          placeholder="비밀번호 확인"
          value={formData.confirmPw}
          onChange={handleChange}
          className="input"
        />
        {passwordError && (
          <div style={{ color: passwordError.includes('일치하지') ? 'red' : 'green', marginTop: '5px', fontSize: '13px' }}>
            {passwordError}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="userName"
          placeholder="이름"
          value={formData.userName}
          onChange={handleChange}
          className="input"
        />
      </div>

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

      <div style={{ marginBottom: '20px' }}>
        <input
          type="tel"
          name="phoneNumber"
          placeholder="휴대폰 번호 (예: 010-1234-5678)"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="input"
        />
      </div>

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

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '500px', gap: '16px' }}>
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
