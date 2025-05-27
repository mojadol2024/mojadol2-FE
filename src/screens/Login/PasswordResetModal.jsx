import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

function PasswordResetModal({ onClose }) {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMatch, setPwMatch] = useState(null);

  const handleSendCode = async () => {
    try {
      await axios.post(`${API_BASE_URL}/mojadol/api/v1/mail/find-password`, {
        userLoginId: userId,
        email,
      });
      alert('인증번호가 이메일로 전송되었습니다.');
      setCodeSent(true);
    } catch (err) {
      alert(err.response?.data?.message || '인증번호 전송 실패');
    }
  };

  const handleVerifyCode = async () => {
    try {
      await axios.post(`${API_BASE_URL}/mojadol/api/v1/mail/mail-check`, {
        userLoginId: userId,
        email,
        code: authCode,
      });
      alert('인증 성공!');
      setVerified(true);
    } catch (err) {
      alert(err.response?.data?.message || '인증 실패');
    }
  };

  const handleResetPassword = async () => {
    if (newPw !== confirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/mojadol/api/v1/mail/update-password`, {
        userLoginId: userId,
        email,
        userPw: newPw,
      });
      alert('비밀번호가 변경되었습니다.');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || '비밀번호 변경 실패');
    }
  };

  const handlePwChange = (val) => {
    setNewPw(val);
    setPwMatch(val === confirmPw);
  };

  const handleConfirmPwChange = (val) => {
    setConfirmPw(val);
    setPwMatch(val === newPw);
  };

  return (
    <div className="modalOverlay">
      <div className="modalBox">
        <h3 className="title">비밀번호 찾기</h3>
        <input
          type="text"
          placeholder="로그인 아이디"
          className="input"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <input
          type="email"
          placeholder="가입된 이메일"
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {!codeSent ? (
          <button className="button" onClick={handleSendCode}>인증번호 전송</button>
        ) : !verified ? (
          <>
            <input
              type="text"
              placeholder="인증번호 입력"
              className="input"
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
            />
            <button className="button" onClick={handleVerifyCode}>인증 확인</button>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="새 비밀번호 입력"
              className="input"
              value={newPw}
              onChange={e => handlePwChange(e.target.value)}
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              className="input"
              value={confirmPw}
              onChange={e => handleConfirmPwChange(e.target.value)}
            />
            {pwMatch === false && (
              <p style={{ color: 'red', fontSize: '14px' }}>비밀번호가 일치하지 않습니다.</p>
            )}
            {pwMatch === true && (
              <p style={{ color: 'green', fontSize: '14px' }}>비밀번호가 일치합니다.</p>
            )}
            <button className="button" onClick={handleResetPassword}>비밀번호 변경</button>
          </>
        )}
        <button className="backLink" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default PasswordResetModal;
