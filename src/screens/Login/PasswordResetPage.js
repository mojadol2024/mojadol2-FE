import React, { useState } from 'react';
import { getAxiosInstance } from '../../lib/axiosInstance';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function PasswordResetPage() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pwFormatError, setPwFormatError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidPassword = (password) => {
    const lengthCheck = /^.{8,16}$/;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password); // 특수문자

    const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;
    return lengthCheck.test(password) && hasSpecial && typeCount >= 2;
    };

  const handleSendCode = async () => {
    setLoading(true); 
    try {
      const axios = getAxiosInstance(); //여기 바꿈
      await axios.post('/mojadol/api/v1/mail/find-password', {
      userLoginId: userId,
      email,
    });
    alert('인증번호가 이메일로 전송되었습니다.');
    setCodeSent(true);
    } catch (err) {
      alert(err.response?.data?.message || '인증번호 전송 실패');
    }finally {
        setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const axios = getAxiosInstance(); // 여기 바꿈꿈
    await axios.post('/mojadol/api/v1/mail/mail-check', {
      userLoginId: userId,
      email,
      code: authCode,
    });
      setVerified(true);
    } catch (err) {
      alert(err.response?.data?.message || '인증 실패');
    }
  };

  const handleResetPassword = async () => {
    if (!isValidPassword(newPw)) {
        alert('비밀번호 조건을 만족하지 않습니다.');
        return;
    }

    if (newPw !== confirmPw) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
    const axios = getAxiosInstance(); // ✅ 인스턴스 선언
    await axios.patch('/mojadol/api/v1/mail/update-password', {
      userLoginId: userId,
      email,
      userPw: newPw,
    });

      alert('비밀번호가 변경되었습니다.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || '비밀번호 변경 실패');
    }
  };

  const getPasswordMatchMessage = () => {
    if (!newPw || !confirmPw) return '';
    return newPw === confirmPw
      ? '비밀번호가 일치합니다.'
      : '비밀번호가 일치하지 않습니다.';
  };

  if (loading) {
        return (
            <div className="loading-state-container">
            <div className="spinner"></div>
            <p className="loading-message">이메일을 전송 중입니다...</p>
            </div>
        );
    }

  return (
    <div className="login-container">
      <div className="login-logo" onClick={() => navigate('/homepage')} style={{ cursor: 'pointer' }}>
        면접의<span className="login-logo-highlight">정석</span>
      </div>
      <h3 className="login-title">비밀번호 재설정</h3>

      <input
        type="text"
        placeholder="아이디"
        className="login-input"
        value={userId}
        onChange={e => setUserId(e.target.value)}
      />
      <input
        type="email"
        placeholder="가입된 이메일"
        className="login-input"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      {!codeSent ? (
        <button className="login-button" onClick={handleSendCode}>
          인증번호 전송
        </button>
      ) : !verified ? (
        <>
          <input
            type="text"
            placeholder="인증번호 입력"
            className="login-input"
            value={authCode}
            onChange={e => setAuthCode(e.target.value)}
          />
          <button className="login-button" onClick={handleVerifyCode}>
            인증 확인
          </button>
        </>
      ) : (
        <>
        <div className="login-password-wrapper">
        <input
            type={showNewPassword ? 'text' : 'password'}
            placeholder="새 비밀번호 입력"
            className="login-input"
            value={newPw}
            onChange={e => {
            const value = e.target.value;
            setNewPw(value);
            if (value === '') {
                setPwFormatError('');
            } else if (!isValidPassword(value)) {
                setPwFormatError('8~16자리의 대소문자/숫자/특수문자를 조합하세요.');
            } else {
                setPwFormatError('');
            }
            }}
        />
        <button
            type="button"
            className="login-toggle-button"
            onClick={() => setShowNewPassword(prev => !prev)}
        >
            {showNewPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
        </div>
        {pwFormatError && (
        <div style={{ color: 'red', fontSize: '13px', marginBottom: '5px' }}>
            {pwFormatError}
        </div>
        )}


        <div className="login-password-wrapper">
            <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="새 비밀번호 확인"
            className="login-input"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            />
            <button
            type="button"
            className="login-toggle-button"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
        </div>

        <div
            style={{
            marginBottom: '10px',
            fontSize: '14px',
            color: newPw === confirmPw ? 'green' : 'red',
            }}
        >
            {getPasswordMatchMessage()}
        </div>

        <button className="login-button" onClick={handleResetPassword}>
            비밀번호 변경
        </button>
        </>
      )}

      <button className="findid-back-link" onClick={() => navigate('/login')}>
        ← 로그인으로 돌아가기
      </button>
    </div>
  );
}

export default PasswordResetPage;
