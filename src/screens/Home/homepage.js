import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './homepage.css';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('homepage-body');
    return () => document.body.classList.remove('homepage-body');
  }, []);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="homepage-header">
        <div className="logo-section" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="logo-box">S</div>
          <span className="logo-text">면접의 정석</span>
        </div>
        <nav className="nav-menu">
          <button className="nav-button active" onClick={() => navigate('/')}>홈</button>
          <button className="nav-button" onClick={() => navigate('/SpellingCorrection')}>면접</button>
          <button className="nav-button" onClick={() => navigate('/Payment')}>이용권 확인</button>
          <button className="nav-button" onClick={() => navigate('/mypage')}>마이페이지</button>
        </nav>
        <button className="btn-primary" onClick={() => navigate('/login')}>로그인하기</button>
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
            면접의 정석은 당신이 쓴 자기소개서에 맞게 질문을 생성하고, 시선 목소리를 분석해 도와드립니다.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/ResumeQuestionPage')}>자기소개서 작성하기</button>
            <button className="btn-outline" onClick={() => navigate('/mypage')}>나의 활동</button>
          </div>
        </div>
      </section>

      {/* 유료 서비스 소개 */}
      <section className="deadline">
        <div className="deadline-header">
          <h2>AI 면접 코칭, 지금 시작하세요</h2>
          <button className="purchase-link" onClick={() => navigate('/Payment')}>이용권 결제하기</button>
        </div>
        <p className="section-title">🔥 단 9,900원으로 완성되는 AI 면접 코칭</p>
        <div className="half-circle-wrapper">
          {['자기소개서\n10개까지 등록', '질문만 골라\n실전 면접 연습', '모든 피드백\n영구 저장'].map((text, i) => (
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
          {[
            ['홈', '/'],
            ['면접', '/SpellingCorrection'],
            ['회사 소개', '/homepage'],
            ['마이 페이지', '/mypage']
          ].map(([label, path], i) => (
            <button className="footer-link" key={i} onClick={() => navigate(path)}>{label}</button>
          ))}
        </div>
        <div className="footer-copy">© MOJDADOL</div>
      </footer>
    </div>
  );
}

export default HomePage;
