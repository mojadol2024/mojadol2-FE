import React, { useState } from 'react'; // useState import 추가
import Side from '../sideBar/side'; // Side 컴포넌트 경로 확인
import './layout.css'; // layout.css 경로 확인

const MainLayout = ({ children }) => {
  // 사이드바의 현재 열림/닫힘 상태를 MainLayout에서 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 초기 상태: 사이드바 열림

  // Side 컴포넌트로부터 상태 변경을 받을 콜백 함수
  const handleSidebarToggle = (newState) => {
    setIsSidebarOpen(newState);
  };

  return (
    <div className="layout-wrapper">
      {/* Side 컴포넌트에 onToggle prop과 isOpen prop 전달 */}
      <Side onToggle={handleSidebarToggle} isOpen={isSidebarOpen} />
      
      {/* isSidebarOpen 상태에 따라 page-content 클래스를 동적으로 적용 */}
      {/* 사이드바가 열려있으면 기본(250px 마진), 닫혀있으면 content-collapsed (80px 마진) */}
      <div className={`page-content ${isSidebarOpen ? '' : 'content-collapsed'}`}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
