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
    }, '로그인으로 이동')
  );
}

export default Home;