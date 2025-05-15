import React, { createElement as h } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return h('div', {
    style: {
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: '#f3f4f6',
    } 
  },
    h('h1', { style: { marginBottom: '20px', fontSize: '24px' } }, '빈 페이지입니다'),
    h('button', {
      onClick: () => navigate('/mypage'),
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '마이페이지로 이동'),

    h('button', {
      onClick: () => navigate('/Login'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '로그인으로 이동'), 
    
    h('button', {
      onClick: () => navigate('/InterviewMain'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '메인으로 이동'),

    h('button', {
      onClick: () => navigate('/ResumeQuestionPage'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '질문리스트페이지로 이동'),

    h('button', {
      onClick: () => navigate('/QuestionConfirmPage'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '녹화확인페이지로 이동'),

    h('button', {
      onClick: () => navigate('/RecordingPage'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '녹화시작페이지로 이동'),    
    
    h('button', {
      onClick: () => navigate('/RecordingInProgress'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '녹화페이지로 이동'),    
    
    h('button', {
      onClick: () => navigate('/TakeSelect'), 
    }, '로그인으로 이동'),

    h('button', {
      onClick: () => navigate('/Payment'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, 'take선택지로 이동'),
    
    h('button', {
      onClick: () => navigate('/Payment'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '결제관리로 이동')
  );
}

export default Home;