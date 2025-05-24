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
import Side from './components/side'; 
import SignUp from './screens/SignUp/SignUp';   // SignUp 컴포넌트
import FindId from './screens/FindId/FindId';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />  {/* /SignUp 경로에 SignUp 컴포넌트 연결 */}
        <Route path="/find-id" element={<FindId />} />
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
