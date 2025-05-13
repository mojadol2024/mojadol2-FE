import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import MyPage from './pages/mypage/mypage';
import Login from './screens/Login/Login';   
import Side from './components/sideBar/side'; 
import Main from './pages/main/InterviewMain';
import ResumeQuestionPage from './pages/resumeQuestionPage/ResumeQuestionPage';
import QuestionConfirmPage from './pages/questionConfirmPage/QuestionConfirmPage';
import RecordingPage from './pages/recordingPage/RecordingPage';
import RecordingInProgress from './pages/recordingInProgress/RecordingInProgress';
import TakeSelect from './pages/takeSelect/TakeSelect';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />        

        <Route path="/mypage" element={
          <div className="container">
            <Side />
            <MyPage />
          </div>
        } />

        <Route path="/InterviewMain" element={
          <div className="container">
            <Side />
            <Main />
          </div>
        } />

        <Route path="/ResumeQuestionPage" element={
          <div className="container">
            <Side />
            <ResumeQuestionPage />
          </div>
        } />

        <Route path="/QuestionConfirmPage" element={
          <div className="container">
            <Side />
            <QuestionConfirmPage />
          </div>
        } />        
        
        <Route path="/RecordingInProgress" element={
          <div className="container">
            <Side />
            <RecordingInProgress />
          </div>
        } /> 

        <Route path="/RecordingPage" element={
          <div className="container">
            <Side />
            <RecordingPage />
          </div>
        } /> 
        
        <Route path="/TakeSelect" element={
          <div className="container">
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
