import React, { useState } from 'react';
import { getAxiosInstance } from '../../lib/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './FindId.css';

function FindId() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
    const axios = getAxiosInstance(); // ✅ axios 인스턴스 선언
    const response = await axios.post('/mojadol/api/v1/mail/find-user-id', {
      email,
    });
      alert('메일 발송 성공');
      navigate('/login');
    } catch (err) {
      alert(
        err.response?.data?.message ||
        `메일 발송에 실패했습니다. (status: ${err.response?.status})`
      );
    } finally {
      setLoading(false);
    }
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
    <div className="findid-container">
      <div className="findid-logo" onClick={() => navigate('/homepage')} style={{ cursor: 'pointer' }}>
        면접의<span className="findid-logo-highlight">정석</span>
      </div>
      <h3 className="findid-title">아이디 찾기</h3>

      <div className="findid-input-wrapper">
        <input
          type="email"
          placeholder="예) 1234@gmail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="findid-input"
        />
      </div>

      <button onClick={handleFindId} className="findid-button">
        확인
      </button>

      <button className="findid-back-link" onClick={() => navigate('/login')}>
        ← 로그인으로 돌아가기
      </button>
    </div>
  );
}

export default FindId;
