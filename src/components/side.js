import React from 'react';
import { FaRegPaperPlane, FaFileAlt, FaEdit, FaTicketAlt, FaUserCog, FaHeadset, FaSignOutAlt } from 'react-icons/fa';
import './side.css';

function Sidebar() {
  return (
    <div className="sidebar">
      {/* 로고 */}
      <div className="logo">
        <FaRegPaperPlane size={30} style={{ marginRight: '10px' }} />
        <h2>로고</h2>
      </div>

      {/* 메뉴 상단 그룹 */}
      <ul className="menu top-menu">
        <li><FaFileAlt size={20} style={{ marginRight: '10px' }} /> 자소서 검사</li>
        <li><FaEdit size={20} style={{ marginRight: '10px' }} /> 첨삭현황</li>
        <li><FaTicketAlt size={20} style={{ marginRight: '10px' }} /> 이용권 관리</li>
      </ul>

      {/* 메뉴 하단 그룹 */}
      <ul className="menu bottom-menu">
        <li><FaUserCog size={20} style={{ marginRight: '10px' }} /> 개인정보 관리</li>
        <li><FaHeadset size={20} style={{ marginRight: '10px' }} /> 고객 센터</li>
        <li><FaSignOutAlt size={20} style={{ marginRight: '10px' }} /> 로그아웃</li>
      </ul>
    </div>
  );
}

export default Sidebar;
