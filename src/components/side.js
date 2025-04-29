import React from 'react';
import axios from 'axios';
import { FaFileAlt, FaEdit, FaTicketAlt, FaUserCog, FaHeadset, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logo.png'; // ✅ 로고 이미지 import
import './side.css'; // CSS 파일 연결

// 로그아웃 API 연결 함수
const handleLogout = async () => {
  const confirmLogout = window.confirm('정말 로그아웃하시겠습니까?');
  if (!confirmLogout) return;

  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인 정보가 없습니다.');
      return;
    }

    const response = await axios.post(
      'https://myeonjub.store/api/mojadol/api/v1/auth/signOut',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.isSuccess) {
      alert('로그아웃 성공!');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    } else {
      alert('로그아웃 실패: ' + response.data.message);
    }
  } catch (error) {
    console.error('로그아웃 중 에러 발생:', error);
    alert('로그아웃 실패');
  }
};

function Sidebar() {
  return (
    <div className="sidebar">
      {/* 로고 */}
      <div className="logo">
        <img src={logo} alt="로고" className="logo-image" />
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
        <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <FaSignOutAlt size={20} style={{ marginRight: '10px' }} /> 로그아웃
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
