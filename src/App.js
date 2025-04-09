import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import Mypage from './pages/mypage/mypage';
import Login from './screens/Login/Login';   

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/Login" element={<Login />} />
      </Routes>   
    </Router>
  ); 
}

export default App;
