import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import MyPage from './pages/mypage/mypage';
import Login from './screens/Login/Login';  
import Side from './components/side';
import Payment from './pages/Payment/Payment';


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
