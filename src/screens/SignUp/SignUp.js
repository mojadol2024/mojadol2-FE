import React, { useState } from 'react';
import { getAxiosInstance } from '../../lib/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import { getEnv } from '../../lib/getEnv';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
  const [idMessage, setIdMessage] = useState('');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pwFormatError, setPwFormatError] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const navigate = useNavigate();

  // --- 추가된 부분 ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ---/ 추가된 부분 ---

  const isValidPassword = (password) => {
    const lengthCheck = /^.{8,16}$/;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;
    return lengthCheck.test(password) && hasSpecial && typeCount >= 2;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'userLoginId') {
      setIdChecked(false);
      checkIdDuplicate(value);
    }

    if (name === 'nickname') {
      setNicknameChecked(false);
      checkNicknameDuplicate(value);
    }
    if (name === 'email') {
      setEmailChecked(false);
      checkEmailDuplicate(value);
    }

    if (name === 'userPw') {
      if (value === '') {
        setPwFormatError('');
      } else if (!isValidPassword(value)) {
        setPwFormatError('8~16자리의 대소문자/숫자를 조합하세요(특수문자 포함).');
      } else {
        setPwFormatError('');
      }
    }

    if (name === 'confirmPw' || name === 'userPw') { // userPw 변경 시에도 확인 로직 실행
      setPasswordError(
        name === 'confirmPw' ? (value !== formData.userPw ? '비밀번호가 일치하지 않습니다.' : '비밀번호가 일치합니다.') : (formData.confirmPw && value !== formData.confirmPw ? '비밀번호가 일치하지 않습니다.' : (formData.confirmPw ? '비밀번호가 일치합니다.' : ''))
      );
    }
  };

  const handleSignup = async () => {
    if (!formData.userLoginId || !formData.userPw || !formData.confirmPw || !formData.userName || !formData.nickname || !formData.phoneNumber || !formData.email) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    if (!idChecked || !nicknameChecked || !emailChecked) {
      alert('아이디, 닉네임, 이메일 중복 확인을 완료해주세요.');
      return;
    }
    if (formData.userPw !== formData.confirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isValidPassword(formData.userPw)) {
      alert('비밀번호 형식이 올바르지 않습니다.');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.endsWith('.com')) {
      alert('이메일 형식이 올바르지 않습니다.');
      return;
    }

    try {
      const axios = getAxiosInstance();
      const res = await axios.post('/mojadol/api/v1/users/sign-up', {
        userLoginId: formData.userLoginId,
        userPw: formData.userPw,
        userName: formData.userName,
        nickname: formData.nickname,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      });

      navigate('/login');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.response?.data;
      alert(`회원가입 실패: 상태 ${status}\n메시지: ${message}`);
    }
  };

  const checkIdDuplicate = async (loginId) => {
    if (!loginId) {
      setIdMessage('');
      setIdChecked(false);
      return;
    }

    const idRegex = /^[A-Za-z0-9]{4,12}$/;
    if (!idRegex.test(loginId)) {
      setIdMessage('아이디는 4~12자의 영문 또는 숫자만 가능합니다.');
      setIdChecked(false);
      return;
    }

    try {
      const axios = getAxiosInstance();
      const { data } = await axios.get('/mojadol/api/v1/users/check', {
        params: { userLoginId: loginId },
      });

      if (data.result === '중복되는 데이터가 없습니다.') {
        setIdMessage('사용 가능한 아이디입니다.');
        setIdChecked(true);
      } else {
        setIdMessage('이미 사용 중인 아이디입니다.');
        setIdChecked(false);
      }
    } catch {
      setIdMessage('아이디 중복 확인 중 오류가 발생했습니다.');
      setIdChecked(false);
    }
  };

  const checkNicknameDuplicate = async (nickname) => {
    if (!nickname) {
      setNicknameMessage('');
      setNicknameChecked(false);
      return;
    }

    try {
      const axios = getAxiosInstance();
      const { data } = await axios.get('/mojadol/api/v1/users/check', {
        params: { nickname },
      });

      if (data.result === '중복되는 데이터가 없습니다.') {
        setNicknameMessage('사용 가능한 닉네임입니다.');
        setNicknameChecked(true);
      } else {
        setNicknameMessage('이미 사용 중인 닉네임입니다.');
        setNicknameChecked(false);
      }
    } catch {
      setNicknameMessage('닉네임 중복 확인 중 오류가 발생했습니다.');
      setNicknameChecked(false);
    }
  };

  const checkEmailDuplicate = async (email) => {
    if (!email) {
      setEmailMessage('');
      setEmailChecked(false);
      return;
    }

    if (!email.includes('@') || !email.endsWith('.com')) {
      setEmailMessage('유효하지 않은 이메일 형식입니다.');
      setEmailChecked(false);
      return;
    }

    try {
      const axios = getAxiosInstance();
      const { data } = await axios.get('/mojadol/api/v1/users/check', {
        params: { email },
      });

      if (data.result === '중복되는 데이터가 없습니다.') {
        setEmailMessage('사용 가능한 이메일입니다.');
        setEmailChecked(true);
      } else {
        setEmailMessage('이미 사용 중인 이메일입니다.');
        setEmailChecked(false);
      }
    } catch {
      setEmailMessage('이메일 중복 확인 중 오류가 발생했습니다.');
      setEmailChecked(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signuplogo">
        면접의<span className="signuplogoHighlight">정석</span>
      </div>
      <h3 className="signup-title">회원가입</h3>

      <div className="signup-field-wrapper">
        <input
          type="text"
          name="userLoginId"
          placeholder="로그인 아이디(4~12자의 영문,숫자만 가능)"
          value={formData.userLoginId}
          onChange={handleChange}
          className="signup-input"
        />
        {idMessage && (
          <div
            className="signup-id-message"
            style={{ color: idChecked ? 'green' : 'red'}}
          >
            {idMessage}
          </div>
        )}
      </div>

      {/* --- 변경된 비밀번호 입력 필드 --- */}
      <div className="signup-field-wrapper">
        <div className="signup-password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'} // 동적으로 타입 변경
            name="userPw"
            placeholder="비밀번호"
            value={formData.userPw}
            onChange={handleChange}
            className="signup-input"
          />
          <button
            type="button"
            className="signup-toggle-button-b"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        {pwFormatError && (
          <div className="signup-error-text red">{pwFormatError}</div>
        )}
      </div>
      {/* ---/ 변경된 비밀번호 입력 필드 --- */}

      {/* --- 변경된 비밀번호 확인 필드 --- */}
      <div className="signup-field-wrapper">
        <div className="signup-password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'} // 동적으로 타입 변경
            name="confirmPw"
            placeholder="비밀번호 확인"
            value={formData.confirmPw}
            onChange={handleChange}
            className="signup-input"
          />
          <button
            type="button"
            className="signup-toggle-button-b"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        {passwordError && (
          <div className={`signup-error-text ${passwordError.includes('일치하지') ? 'red' : 'green'}`}>
            {passwordError}
          </div>
        )}
      </div>
      {/* ---/ 변경된 비밀번호 확인 필드 --- */}

      <div className="signup-field-wrapper">
        <input
          type="text"
          name="userName"
          placeholder="이름"
          value={formData.userName}
          onChange={handleChange}
          className="signup-input"
        />
      </div>

      <div className="signup-field-wrapper">
        <input
          type="text"
          name="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          className="signup-input"
        />
        {nicknameMessage && (
          <div
            className="signup-nickname-message"
            style={{ color: nicknameChecked ? 'green' : 'red' }}
          >
            {nicknameMessage}
          </div>
        )}
      </div>

      <div className="signup-field-wrapper">
        <input
          type="tel"
          name="phoneNumber"
          placeholder="휴대폰 번호 (예: 010-1234-5678)"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="signup-input"
        />
      </div>

      <div className="signup-field-wrapper">
        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          className="signup-input"
        />
        {emailMessage && (
          <div
            className="signup-email-message"
            style={{ color: emailChecked ? 'green' : 'red'}}
          >
            {emailMessage}
          </div>
        )}
      </div>

      <div className="signup-flex-buttons">
        <button className="signup-cancel-button" onClick={() => navigate(-1)}>
          취소
        </button>
        <button className="signup-button" onClick={handleSignup}>
          가입하기
        </button>
      </div>
    </div>
  );
}

export default SignUp;