  import React, { useEffect } from 'react';
  import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
  // index.js 또는 App.js 상단에 있어야 함
  import './App.css';

import Home from './pages/home/home';
import MyPage from './pages/mypage/mypage';
import Login from './screens/Login/Login';
import Main from './pages/main/InterviewMain';
import PdfView from './pages/pdfView/PdfView';
import ResumeQuestionPage from './pages/resumeQuestionPage/ResumeQuestionPage';
import QuestionConfirmPage from './pages/questionConfirmPage/QuestionConfirmPage';
import RecordingPage from './pages/recordingPage/RecordingPage';
import TakeSelect from './pages/takeSelect/TakeSelect';
import Payment from './pages/Payment/Payment';
import SpellingCorrection from './pages/spellingCorrection/SpellingCorrection';
import SignUp from './screens/SignUp/SignUp';
import FindId from './screens/FindId/FindId';
import MainLayout from './components/layout/MainLayout';
import Homepage from './screens/Login/Home/homepage';
import InterviewMain from './pages/main/InterviewMain';


  // ✅ 페이지에 따라 body 클래스 다르게 적용하는 컨트롤러
  function BodyClassController() {
    const location = useLocation();

    useEffect(() => {
      const body = document.body;
      const path = location.pathname;

      // 로그인/회원가입/아이디 찾기 페이지에서는 auth-body
      if (['/login', '/sign-up', '/find-id'].includes(path)) {
        body.classList.add('auth-body');
        body.classList.remove('default-body');
      } else {
        // 그 외 페이지에서는 default-body
        body.classList.add('default-body');
        body.classList.remove('auth-body');
      }
    }, [location.pathname]);

    return null;
  }

  function App() {
    return (
      <Router>
        <BodyClassController />

<Routes>
  {/* ✅ 사이드바 없는 페이지들 */}
  <Route path="/" element={<Homepage />} />
  <Route path="/home" element={<Home />} />
  <Route path="/homepage" element={<Homepage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/sign-up" element={<SignUp />} />
  <Route path="/find-id" element={<FindId />} />

          {/* ✅ 사이드바 포함된 레이아웃 페이지들 */}
          <Route path="/mypage" element={<MainLayout><MyPage /></MainLayout>} />
          <Route path="/InterviewMain" element={<MainLayout><InterviewMain /></MainLayout>} />
          <Route path="/PdfView/:coverLetterId" element={<MainLayout><PdfView /></MainLayout>} />
          <Route path="/SpellingCorrection" element={<MainLayout><SpellingCorrection /></MainLayout>} />
          <Route path="/ResumeQuestionPage" element={<MainLayout><ResumeQuestionPage /></MainLayout>} />
          <Route path="/QuestionConfirmPage" element={<MainLayout><QuestionConfirmPage /></MainLayout>} />
          <Route path="/RecordingPage" element={<MainLayout><RecordingPage /></MainLayout>} />
          <Route path="/TakeSelect" element={<MainLayout><TakeSelect /></MainLayout>} />
          <Route path="/Payment" element={<MainLayout><Payment /></MainLayout>} />
          
        </Routes>
      </Router>
    );
  }

  export default App;
