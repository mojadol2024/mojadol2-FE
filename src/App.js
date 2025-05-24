// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './pages/home/home';
// import MyPage from './pages/mypage/mypage';
// import Login from './screens/Login/Login';  
// import Side from './components/side'; 
// import SignUp from './screens/SignUp/SignUp';  


// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/Login" element={<Login />} />
//         <Route path="/SignUp" element={<SignUp />} />
//         <Route path="/mypage" element={
//           <div className="container">
//             <Side />
//             <MyPage />
//           </div>
//         } />
//       </Routes>   
//     </Router>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import MyPage from './pages/mypage/mypage';
import Login from './screens/Login/Login';    
import Side from './components/sideBar/sideBar/side'; 
import Main from './pages/main/InterviewMain';
import ResumeQuestionPage from './pages/resumeQuestionPage/ResumeQuestionPage';
import QuestionConfirmPage from './pages/questionConfirmPage/QuestionConfirmPage';
import RecordingPage from './pages/recordingPage/RecordingPage';
import TakeSelect from './pages/takeSelect/TakeSelect';
import Payment from './pages/Payment/Payment';
import SpellingCorrection from './pages/spellingCorrection/SpellingCorrection';
import SignUp from './screens/SignUp/SignUp';   // SignUp 컴포넌트
import FindId from './screens/FindId/FindId';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />        

        <Route path="/Login" element={<Login />} />    
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/find-id" element={<FindId />} />    

        <Route path="/mypage" element={
          <div className="container">
            <Side />
            <MyPage />
          </div>
        } />

        <Route path="/InterviewMain" element={
          <div className="main-content">
            <Side />
            <Main />
          </div>
        } />

        <Route path="/SpellingCorrection" element={
          <div className="register-page">
            <Side />
            <SpellingCorrection />
          </div>
        } />

        <Route path="/ResumeQuestionPage" element={
          <div className="resume-question-container">
            <Side />
            <ResumeQuestionPage />
          </div>
        } />

        <Route path="/QuestionConfirmPage" element={
          <div className="resume-question-container">
            <Side />
            <QuestionConfirmPage />
          </div>
        } />        
        
        <Route path="/RecordingPage" element={
          <div className="recording-page-container">
            <Side />
            <RecordingPage />
          </div>
        } /> 
        
        <Route path="/TakeSelect" element={
          <div className="take-select-container">
            <Side />
            <TakeSelect />
          </div>
        } /> 

        <Route path="/Payment" element={
          <div className="container">
            <Side />
            <Payment />
          </div>
        } />

        <Route path="/InterviewMain" element={
          <div className="main-content">
            <Side />
            <Main />
          </div>
        } />

        <Route path="/SpellingCorrection" element={
          <div className="register-page">
            <Side />
            <SpellingCorrection />
          </div>
        } />

        <Route path="/ResumeQuestionPage" element={
          <div className="resume-question-container">
            <Side />
            <ResumeQuestionPage />
          </div>
        } />

        <Route path="/QuestionConfirmPage" element={
          <div className="resume-question-container">
            <Side />
            <QuestionConfirmPage />
          </div>
        } />        
        
        <Route path="/RecordingPage" element={
          <div className="recording-page-container">
            <Side />
            <RecordingPage />
          </div>
        } /> 
        
        <Route path="/TakeSelect" element={
          <div className="take-select-container">
            <Side />
            <TakeSelect />
          </div>
        } /> 

        <Route path="/Payment" element={
          <div className="container">
            <Side />
            <Payment />
          </div>
        } />
      </Routes>   
    </Router>
  );
}

export default App;