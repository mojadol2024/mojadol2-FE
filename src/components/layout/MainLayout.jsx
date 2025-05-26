import React from 'react';
import Side from '../sideBar/side';
import './layout.css'; // 여기에 .page-content 클래스 정의

const MainLayout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Side />
      <div className="page-content">{children}</div>
    </div>
  );
};

export default MainLayout;
