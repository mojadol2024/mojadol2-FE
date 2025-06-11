import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAxiosInstance } from '../../lib/axiosInstance';
import { getEnv } from '../../lib/getEnv';
import './homepage.css';
import logo from '../../assets/logo_h.png'; 

//const API_BASE_URL = getEnv('BASE_URL');
//const AUTH_LOGOUT_URL = getEnv('AUTH_LOGOUT_URL') || '/mojadol/api/v1/auth/logout';

function HomePage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('accessToken');
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    document.body.classList.add('homepage-body');
    return () => document.body.classList.remove('homepage-body');
  }, []);

  const handleLogout = useCallback(async () => {
    const confirmLogout = window.confirm('정말 로그아웃하시겠습니까?');
    if (!confirmLogout) {
      return;
    }

    try {
      const axios = getAxiosInstance();
      const response = await axios.post('/mojadol/api/v1/auth/logout', {});

      if (response.data.isSuccess) {
        alert('로그아웃 성공!');
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        navigate('/HomePage');
      } else {
        alert('로그아웃 실패: ' + response.data.message);
        console.error('백엔드 로그아웃 실패:', response.data.message);
      }
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('로그아웃 실패: ' + error.response.data.message);
      } else {
        alert('로그아웃 실패: 네트워크 오류 또는 알 수 없는 오류가 발생했습니다.');
      }
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      navigate('/HomePage');
    }
  }, [navigate]);

  const navigateIfLoggedIn = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
      // 사용자가 가려던 경로를 로컬 스토리지에 저장
      localStorage.setItem('redirectAfterLogin', path);
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="homepage-header">
        <div className="logo-section" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logo} alt="면접의 정석" className="logo-image" /> 
          <span className="logo-text">면접의 정석</span>
        </div>
        <nav className="nav-menu">
          <button className="nav-button active" onClick={() => navigate('/HomePage')}>홈</button>
          <button className="nav-button" onClick={() => navigateIfLoggedIn('/InterviewMain')}>면접 목록</button>
          <button className="nav-button" onClick={() => navigateIfLoggedIn('/Payment')}>이용권 관리</button>
          {isLoggedIn ? (
            <button className="nav-button" onClick={() => navigateIfLoggedIn('/mypage')}>개인정보 관리</button>
          ) : (
            <button className="nav-button" onClick={() => navigate('/sign-up')}>회원가입</button>
          )}
        </nav>
        {isLoggedIn ? (
          <button className="btn-primary" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <button className="btn-primary" onClick={() => navigate('/login')}>
            로그인
          </button>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <span className="hero-sub">당신의 꿈에 더욱 가까워질 수 있도록</span>
          <h1>
            여러분에게 딱 맞는 <br />
            <span className="highlight">면접 기회</span>를 놓치지 마세요
          </h1>
          <p>
            면접의 정석은 당신의 자기소개서에 맞춤형 면접 질문을 생성하고,<br/>AI 모의 면접을 통해 면접 태도에 대한 피드백을 제공합니다.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigateIfLoggedIn('/SpellingCorrection')}>자기소개서 등록하기</button>
            <button className="btn-outline" onClick={() => navigateIfLoggedIn('/InterviewMain')}>면접 목록</button>
          </div>
        </div>
      </section>

      {/* 유료 서비스 소개 */}
      <section className="deadline">
        <div className="deadline-header">
          <h2>AI 면접 코칭, 지금 시작하세요</h2>
          <button className="purchase-link" onClick={() => navigateIfLoggedIn('/Payment')}>이용권 결제하기</button>
        </div>
        <p className="section-title">🔥 합리적인 가격의 AI 면접 코칭</p>
        <div className="half-circle-wrapper">
          {['자기소개서 맞춤법 \n검사', '맞춤형 면접 질문 생성', '각 질문에 대한 촬영 \n기회 3회 제공'].map((text, i) => (
            <div className="circle-group" key={i}>
              <div className="half-circle">✔</div>
              <div className="circle-label">{text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 통계 */}
      <section className="stats">
        <h3>더 스마트한 준비, 더 강력한 결과</h3>
        <p>면접의 정석은 AI 분석을 통해 시선·목소리·자기소개서를 종합 평가합니다.</p>
        <div className="stat-grid">
          <div className="stat">1,000+<br /><span>분석된 자기소개서</span></div>
          <div className="stat">10,000+<br /><span>생성된 면접 질문</span></div>
          <div className="stat">92%<br /><span>사용자 만족도</span></div>
          <div className="stat">60초 이내<br /><span>피드백 반영</span></div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="categories">
        <h2>면접의 핵심 요소를 한눈에</h2>
        <p>시선, 목소리, 자기소개서까지. AI가 분석하는 당신만의 면접 전략을 만나보세요.</p>
        <div className="category-grid">
          {[
            ['자기소개서 분석', '핵심 키워드와 논리 구조 평가'],
            ['면접 질문 추천', '내용 기반 AI 질문 생성'],
            ['시선 추적', '카메라 응시 및 흐름 분석'],
            ['목소리 분석', '속도·톤 등 음성 피드백'],
            ['실전 모의 면접', 'AI 기반 시뮬레이션 환경 적용'],
            ['종합 리포트', '면접 결과 리포트 요약 제공'],
            ['저렴한 가격', '가성비와 전문성'],
            ['안전', 'AI 분석 자료는 안전하게 처리']
          ].map(([title, desc], i) => (
            <div className="category" key={i}>
              {title}<br /><span>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo" onClick={() => navigate('/')}>면접의 정석</div>
        <p>모든 청춘들의 꿈을 응원합니다</p>
        <div className="footer-links">
          {isLoggedIn ? (
            <>
              <button className="footer-link" onClick={() => navigate('/homepage')}>홈</button>
              <button className="footer-link" onClick={() => navigateIfLoggedIn('/InterviewMain')}>면접</button>
              <button className="footer-link" onClick={() => navigate('/homepage')}>회사 소개</button>
              <button className="footer-link" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <button className="footer-link" onClick={() => navigate('/homepage')}>홈</button>
              <button className="footer-link" onClick={() => navigateIfLoggedIn('/InterviewMain')}>면접</button>
              <button className="footer-link" onClick={() => navigate('/homepage')}>회사 소개</button>
              <button className="footer-link" onClick={() => navigate('/sign-up')}>회원가입</button>
            </>
          )}
        </div>
        <div className="footer-copy">© MOJDADOL</div>
      </footer>
    </div>
  );
}

export default HomePage;