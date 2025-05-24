// import React, { createElement as h } from 'react';
// import { useNavigate } from 'react-router-dom';

// function Home() {
//   const navigate = useNavigate();

//   return h('div', {
//     style: {
//       height: '100vh',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       flexDirection: 'column',
//       backgroundColor: '#f3f4f6',
//     } 
//   },
//     h('h1', { style: { marginBottom: '20px', fontSize: '24px' } }, '빈 페이지입니다'),

//     h('button', {
//       onClick: () => navigate('/mypage'),
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '마이페이지로 이동'),

//     h('button', {
//       onClick: () => navigate('/Login'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '로그인으로 이동'), 
    
//     h('button', {
//       onClick: () => navigate('/InterviewMain'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '메인으로 이동'),
    
//     h('button', {
//       onClick: () => navigate('/SpellingCorrection'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '맞춤법 교정기 이동'),

//     h('button', {
//       onClick: () => navigate('/ResumeQuestionPage'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '질문리스트페이지로 이동'),

//     h('button', {
//       onClick: () => navigate('/QuestionConfirmPage'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '녹화확인페이지로 이동'),

//     h('button', {
//       onClick: () => navigate('/RecordingPage'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '녹화시작페이지로 이동'),      

//     h('button', {
//       onClick: () => navigate('/TakeSelect'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, 'take선택지로 이동'),
    
//     h('button', {
//       onClick: () => navigate('/Payment'), 
//       style: {
//         padding: '10px 20px',
//         fontSize: '16px',
//         backgroundColor: '#10b981',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//       }
//     }, '결제관리로 이동')
//   );
// }

// export default Home;


// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// function Home() {
//   const navigate = useNavigate();

//   const btnStyle = {
//     padding: '10px 20px',
//     fontSize: '16px',
//     backgroundColor: '#10b981',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     marginBottom: '10px',
//   };

//   return (
//     <div
//       style={{
//         height: '100vh',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         flexDirection: 'column',
//         backgroundColor: '#f3f4f6',
//       }}
//     >
//       <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>빈 페이지입니다</h1>

//       <button style={btnStyle} onClick={() => navigate('/mypage')}>
//         마이페이지로 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/Login')}>
//         로그인으로 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/InterviewMain')}>
//         메인으로 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/SpellingCorrection')}>
//         맞춤법 교정기 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/ResumeQuestionPage')}>
//         질문리스트페이지로 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/QuestionConfirmPage')}>
//         녹화확인페이지로 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/RecordingPage')}>
//         녹화시작페이지로 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/TakeSelect')}>
//         take선택지로 이동
//       </button>

//       <button style={btnStyle} onClick={() => navigate('/Payment')}>
//         결제관리로 이동
//       </button>
//     </div>
//   );
// }

// export default Home;



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
      onClick: () => navigate('/SpellingCorrection'), 
      style: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }
    }, '맞춤법 교정기 이동'),

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
      onClick: () => navigate('/TakeSelect'), 
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
    }, '결제관리로 이동'),  
  );
}

export default Home;



