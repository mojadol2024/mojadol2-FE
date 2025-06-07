import React from 'react';
//import axios from 'axios';
import { FaFileAlt, FaEdit, FaTicketAlt, FaUserCog, FaHeadset, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/logo.png'; // ✅ 로고 이미지 import
import './side.css'; // CSS 파일 연결
import { Link } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import { getEnv } from '../../lib/getEnv';

const API_BASE_URL = getEnv('BASE_URL');

// 로그아웃 API 연결 함수
const handleLogout = async () => {
  const confirmLogout = window.confirm('정말 로그아웃하시겠습니까?');
  if (!confirmLogout) return;

  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/mojadol/api/v1/auth/logout`,
      {}
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
    if (error.response && error.response.data && error.response.data.message) {
      alert('로그아웃 실패: ' + error.response.data.message);
    } else {
      alert('로그아웃 실패: 네트워크 오류 또는 알 수 없는 오류가 발생했습니다.');
    }
  }
};

function Sidebar() {
  return (
    <div className="sidebar">
      {/* 로고 */}
      <div className="logo">
        <Link to="/homepage">
          <img src={logo} alt="로고" className="logo-image" />
        </Link> 
      </div>
      {/* 메뉴 상단 그룹 */}
      <ul className="menu top-menu">
        <li>
          <Link to="/SpellingCorrection">
            <FaFileAlt size={20} style={{ marginRight: '10px' }} /> 자소서 검사
          </Link>
        </li>

        <li>
          <Link to="/InterviewMain">
            <FaEdit size={20} style={{ marginRight: '10px' }} /> 첨삭현황
          </Link>
        </li>

        <li>
          <Link to="/payment">
            <FaTicketAlt size={20} style={{ marginRight: '10px' }} /> 이용권 관리
          </Link>
        </li>
      </ul>

      {/* 메뉴 하단 그룹 */}
      <ul className="menu bottom-menu">
        <li>
          <Link to="/mypage">
            <FaUserCog size={20} style={{ marginRight: '10px' }} /> 개인정보 관리
          </Link>
        </li>

        <li>
            <Link to="">
              <FaHeadset size={20} style={{ marginRight: '10px' }} /> 고객 센터
            </Link>
        </li>
        
        <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <FaSignOutAlt size={20} style={{ marginRight: '10px' }} /> 로그아웃
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;