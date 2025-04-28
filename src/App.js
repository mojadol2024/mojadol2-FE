import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import MyPage from './pages/mypage/mypage';
import Login from './screens/Login/Login';  
import Side from './components/side'; 


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
      </Routes>   
    </Router>
  );
}

export default App;
