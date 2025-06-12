import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAxiosInstance } from '../../lib/axiosInstance';
import { FaFileAlt, FaEdit, FaTicketAlt, FaUserCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo_h.png';
import './side.css';

function Sidebar({ onToggle }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

const handleLogout = async () => {
  const confirmLogout = window.confirm('정말 로그아웃하시겠습니까?');
  if (!confirmLogout) return;

  try {
    const axios = getAxiosInstance();
    const response = await axios.post('/mojadol/api/v1/auth/logout', {});

    if (response.data.isSuccess) {
      alert('로그아웃 성공!');
      localStorage.removeItem('accessToken');
      window.location.href = '/homepage';
    } else {
      alert('로그아웃 실패: ' + response.data.message);
      console.error('백엔드 로그아웃 실패:', response.data.message);
      localStorage.removeItem('accessToken');
      window.location.href = '/homepage';
    }
  } catch (error) {
    console.error('로그아웃 중 에러 발생:', error);
    if (error.response?.data?.message) {
      alert('로그아웃 실패: ' + error.response.data.message);
    } else {
      alert('로그아웃 실패: 네트워크 오류 또는 알 수 없는 오류가 발생했습니다.');
    }
    localStorage.removeItem('accessToken');
    window.location.href = '/homepage';
  }
};

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div className={`sidebar-wrapper ${isOpen ? '' : 'sidebar-collapsed'}`}>
      {/* 토글 버튼을 sidebar-wrapper의 직계 자식으로 배치 */}
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        {isOpen ? <FaTimes size={20} /> : <FaBars size={18} />}
      </button>

      <div className="sidebar-logo-section">
        <div
          className="sidebar-logo"
          onClick={() => navigate('/homepage')}
          style={{ cursor: 'pointer' }}
        >
          <img src={logo} alt="로고" className="sidebar-logo-image" />
        </div>
      </div>

      <ul className="sidebar-menu sidebar-top-menu">
        <li className="sidebar-menu-item" onClick={() => navigate('/InterviewMain')} style={{ cursor: 'pointer' }}>
          <FaFileAlt size={20} className="sidebar-menu-icon" />
          <div className="sidebar-menu-text-wrapper">
            <span className="sidebar-menu-text">면접 목록</span>
          </div>
        </li>

        <li className="sidebar-menu-item" onClick={() => navigate('/SpellingCorrection')} style={{ cursor: 'pointer' }}>
          <FaEdit size={20} className="sidebar-menu-icon" />
          <div className="sidebar-menu-text-wrapper">
            <span className="sidebar-menu-text">자기소개서 등록</span>
          </div>
        </li>

        <li className="sidebar-menu-item" onClick={() => navigate('/Payment')} style={{ cursor: 'pointer' }}>
          <FaTicketAlt size={20} className="sidebar-menu-icon" />
          <div className="sidebar-menu-text-wrapper">
            <span className="sidebar-menu-text">이용권 관리</span>
          </div>
        </li>
      </ul>

      <ul className="sidebar-menu sidebar-bottom-menu">
        <li className="sidebar-menu-item" onClick={() => navigate('/mypage')} style={{ cursor: 'pointer' }}>
          <FaUserCog size={20} className="sidebar-menu-icon" />
          <div className="sidebar-menu-text-wrapper">
            <span className="sidebar-menu-text">개인정보 관리</span>
          </div>
        </li>

        <li className="sidebar-menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <FaSignOutAlt size={20} className="sidebar-menu-icon" />
          <div className="sidebar-menu-text-wrapper">
            <span className="sidebar-menu-text">로그아웃</span>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;