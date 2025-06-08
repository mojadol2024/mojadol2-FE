import React from 'react'; import { useNavigate } from 'react-router-dom'; // ✅ 추가 import axios from 'axios'; import { FaFileAlt, FaEdit, FaTicketAlt, FaUserCog, FaHeadset, FaSignOutAlt } from 'react-icons/fa'; import logo from '../../assets/logo.png'; import './side.css'; function Sidebar() { const navigate = useNavigate(); // ✅ 추가 const handleLogout = async () => { const confirmLogout = window.confirm('정말 로그아웃하시겠습니까?'); if (!confirmLogout) return; try { const token = localStorage.getItem('accessToken'); if (!token) { alert('로그인 정보가 없습니다.'); return; } const response = await axios.post( 'https://myeonjub.store/api/mojadol/api/v1/auth/logout', {}, { headers: { Authorization: `Bearer ${token}`, }, } ); if (response.data.isSuccess) { alert('로그아웃 성공!'); localStorage.removeItem('accessToken'); window.location.href = '/login'; } else { alert('로그아웃 실패: ' + response.data.message); } } catch (error) { console.error('로그아웃 중 에러 발생:', error); alert('로그아웃 실패'); } }; return ( <div className="sidebar"> <div className="logo" onClick={() => navigate('/InterviewMain')} style={{ cursor: 'pointer' }}> <img src={logo} alt="로고" className="logo-image" /> </div> <ul className="menu top-menu"> {/* ✅ 자소서 검사 → SpellingCorrection 이동 */} <li onClick={() => navigate('/SpellingCorrection')} style={{ cursor: 'pointer' }}> <FaFileAlt size={20} style={{ marginRight: '10px' }} /> 자소서 검사 </li> {/* <li><FaEdit size={20} style={{ marginRight: '10px' }} /> 첨삭현황</li>}    #우선 첨삭?은 저희가 하는게 없으니까 주석으로 없애놨습니다. {/* ✅ 이용권 관리 클릭 시 /Payment로 이동 */} <li onClick={() => navigate('/Payment')} style={{ cursor: 'pointer' }}> <FaTicketAlt size={20} style={{ marginRight: '10px' }} /> 이용권 관리 </li> </ul> <ul className="menu bottom-menu"> <li onClick={() => navigate('/mypage')} style={{ cursor: 'pointer' }}> <FaUserCog size={20} style={{ marginRight: '10px' }} /> 개인정보 관리     {/*근데 애는 안쓰는? 형태만 있고 기능은 없는거 같긴한데 일단 페이지는 있어서 연결은 했어요 안쓸거면 지우면 될거같아요*/} </li> {/* <li><FaHeadset size={20} style={{ marginRight: '10px' }} /> 고객 센터</li>    고객 센터도 일단 안쓰는거같아 주석처리 했습니다 */} <li onClick={handleLogout} style={{ cursor: 'pointer' }}> <FaSignOutAlt size={20} style={{ marginRight: '10px' }} /> 로그아웃 </li> </ul> </div> ); } export default Sidebar;import React from 'react';
import axios from 'axios';
import { FaFileAlt, FaEdit, FaTicketAlt, FaUserCog, FaHeadset, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import './side.css';

function Sidebar() {
  const navigate = useNavigate(); // ✅ 추가

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
        'https://myeonjub.store/api/mojadol/api/v1/auth/logout',
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

  return (
    <div className="sidebar">
      <div
        className="logo"
        onClick={() => navigate('/InterviewMain')}
        style={{ cursor: 'pointer' }}
      >
        <img src={logo} alt="로고" className="logo-image" />
      </div>

      <ul className="menu top-menu">
        {/* ✅ 자소서 검사 → SpellingCorrection 이동 */}
        <li onClick={() => navigate('/SpellingCorrection')} style={{ cursor: 'pointer' }}>
          <FaFileAlt size={20} style={{ marginRight: '10px' }} /> 자소서 검사
        </li>

        {/* <li><FaEdit size={20} style={{ marginRight: '10px' }} /> 첨삭현황</li> #우선 첨삭?은 저희가 하는게 없으니까 주석으로 없애놨습니다. */}

        {/* ✅ 이용권 관리 클릭 시 /Payment로 이동 */}
        <li onClick={() => navigate('/Payment')} style={{ cursor: 'pointer' }}>
          <FaTicketAlt size={20} style={{ marginRight: '10px' }} /> 이용권 관리
        </li>
      </ul>

      <ul className="menu bottom-menu">
        <li onClick={() => navigate('/mypage')} style={{ cursor: 'pointer' }}>
          <FaUserCog size={20} style={{ marginRight: '10px' }} /> 개인정보 관리
          {/*근데 애는 안쓰는? 형태만 있고 기능은 없는거 같긴한데 일단 페이지는 있어서 연결은 했어요 안쓸거면 지우면 될거같아요*/}
        </li>

        {/* <li><FaHeadset size={20} style={{ marginRight: '10px' }} /> 고객 센터</li> 고객 센터도 일단 안쓰는거같아 주석처리 했습니다 */}

        <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <FaSignOutAlt size={20} style={{ marginRight: '10px' }} /> 로그아웃
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
