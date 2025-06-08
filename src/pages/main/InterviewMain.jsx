import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import ResultCard from '../../components/resultCard/ResultCard';
import './InterviewMain.css';

function InterviewMain() {
  const [allResults, setAllResults] = useState([]); // 모든 원본 데이터를 저장할 상태
  const [filteredResults, setFilteredResults] = useState([]); // 필터링된 데이터를 저장할 상태
  const [searchKeyword, setSearchKeyword] = useState(''); // 제목 검색 키워드
  
  const perPage = 10; // 한 페이지당 표시될 항목 수 (고정)
  const [currentPage, setCurrentPage] = useState(1);

  // ⭐ 로딩 상태 추가
  const [loading, setLoading] = useState(true); 
  // ⭐ 에러 상태 추가 (에러 발생 시 메시지 표시를 위함)
  const [error, setError] = useState(null); 

  const navigate = useNavigate();

  // 현재 페이지에 보여줄 데이터 (필터링된 데이터를 기반으로 페이지네이션)
  const paginatedResults = useMemo(() => {
    return filteredResults.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [filteredResults, currentPage, perPage]);

  // 총 페이지 수 (필터링된 데이터를 기반으로 계산)
  const totalPageCount = useMemo(() => {
    return Math.ceil(filteredResults.length / perPage);
  }, [filteredResults.length, perPage]);

  // 모든 데이터를 불러오는 함수 (초기 로드 및 삭제 후 데이터 갱신 시 사용)
  const fetchAllCoverLetters = async () => {
    // ⭐ 데이터 로딩 시작 시 loading 상태를 true로 설정
    setLoading(true);
    setError(null); // 새로운 요청 전에 에러 상태 초기화

    try {
      const params = {
        page: 0,
        size: 1000 // 백엔드에서 모든 데이터를 가져올 수 있도록 충분히 큰 사이즈 설정
      };
      const response = await axiosInstance.get('/mojadol/api/v1/letter/list', { params });
      console.log('📦 불러온 리스트:', response.data.content);

      const list = response.data.result?.content || [];
      const mapped = list.map(item => ({
        coverLetterId: item.coverLetterId,
        title: item.title,
        useVoucher: item.useVoucher ?? 'FREE',
        hasVideo: true, 
      })).reverse(); // 최신순 정렬 (필요하다면 백엔드에서 정렬하도록 요청하는 것이 효율적입니다)

      setAllResults(mapped); // 원본 데이터 저장
      setFilteredResults(mapped); // 초기에는 필터링되지 않은 모든 데이터를 표시
      setCurrentPage(1); // 데이터 로드 후 첫 페이지로 이동
      console.log('🔍 전체 results (원본):', mapped);

    } catch (error) {
      console.error('자소서 리스트 불러오기 실패:', error);
      // alert('자소서 리스트를 불러오는 데 실패했습니다.'); // 사용자에게 alert 대신 화면에 에러 표시
      setError(new Error('자소서 리스트를 불러오는 데 실패했습니다.'));
    } finally {
      // ⭐ 데이터 로딩 완료 (성공 또는 실패) 시 loading 상태를 false로 설정
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 또는 shouldRefreshMainList 플래그가 true일 때 데이터 로드
  useEffect(() => {
    const shouldRefresh = localStorage.getItem("shouldRefreshMainList");
    if (shouldRefresh === "true") {
      fetchAllCoverLetters();
      localStorage.removeItem("shouldRefreshMainList");
    } else {
      fetchAllCoverLetters();
    }
  }, []); // 의존성 배열에 빈 배열을 두어 컴포넌트 마운트 시 한 번만 실행

  // 삭제 기능
  const handleDelete = async (coverLetterId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    // ⭐ 삭제 시작 시에도 로딩 상태를 true로 설정 (선택 사항, 필요에 따라)
    setLoading(true); 
    setError(null);

    try {
      await axiosInstance.delete(`/mojadol/api/v1/letter/delete/${coverLetterId}`);
      // 원본 데이터와 필터링된 데이터 모두에서 삭제
      setAllResults(prev => prev.filter(item => item.coverLetterId !== coverLetterId));
      setFilteredResults(prev => prev.filter(item => item.coverLetterId !== coverLetterId));
      alert('자소서가 성공적으로 삭제되었습니다.'); // 삭제 성공 메시지 추가
    } catch (error) {
      console.error('삭제 실패:', error);
      // alert('삭제에 실패했습니다.'); // 사용자에게 alert 대신 화면에 에러 표시
      setError(new Error('자소서 삭제에 실패했습니다.'));
    } finally {
      // ⭐ 삭제 완료 시 loading 상태를 false로 설정
      setLoading(false);
    }
  };

  // 자소서 질문 페이지로 이동
  const handleNavigateToQuestions = (coverLetterId) => {
    navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
  };

  // 비디오 결과 페이지 (PDF 뷰어)로 이동
  const handleNavigateToVideoResult = (coverLetterId) => {
    navigate(`/PdfView/${coverLetterId}`);
  };

  // 검색 로직 (프론트엔드에서만 처리)
  // 검색 조건(키워드)이 변경될 때마다 자동으로 검색 실행
  useEffect(() => {
    let tempResults = [...allResults]; // 원본 데이터 복사

    // 제목(문서명) 검색어 필터링
    if (searchKeyword.trim() !== '') {
      const keyword = searchKeyword.toLowerCase();
      tempResults = tempResults.filter(item =>
        item.title?.toLowerCase().includes(keyword) // item.title이 없거나 null일 경우 오류 방지
      );
    }
    
    setFilteredResults(tempResults); // 필터링된 결과 업데이트
    setCurrentPage(1); // 검색 결과가 변경되었으므로 첫 페이지로 이동
  }, [searchKeyword, allResults]); 
  // allResults를 의존성에 포함하여, 초기 데이터 로드 또는 삭제 후에도 검색 로직이 다시 실행되도록 합니다.

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPageCount) {
      setCurrentPage(newPage);
    }
  };

  // ⭐ 로딩 중일 때 로딩 메시지와 스피너 표시
  if (loading) {
    return (
      <div className="loading-state-container">
        <div className="spinner"></div>
        <p className="loading-message">자소서 리스트를 불러오는 중입니다...</p>
      </div>
    );
  }

  // ⭐ 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="error-message-container">
        <p className="error-message">Error: {error.message}</p>
      </div>
    );
  }

  // 데이터 로드 완료 및 에러 없을 시 정상 렌더링
  return (
    <main className="main-content">
      <div className="header">
        <h1 className="main-title">화상 면접</h1>
        <button className="upload-btn" onClick={() => navigate('/SpellingCorrection')}>
          자소서 등록
        </button>
      </div>

      <div className="filter-section">
        <div className="right-filters">
          <input 
            placeholder="제목을 검색하세요." 
            value={searchKeyword} 
            onChange={e => setSearchKeyword(e.target.value)} 
            onKeyPress={(e) => { 
              if (e.key === 'Enter') {
                // 실시간 검색이므로 엔터 키 처리도 더 이상 특별히 필요 없습니다.
              }
            }}
          />
          
          {/* 자소서 개수 표시 */}
          <span className="cover-letter-count">총 {filteredResults.length}개</span>
        </div>
      </div>

      <div className="results-list">
        {paginatedResults.length > 0 ? (
          paginatedResults.map((data, index) => (
            <div key={data.coverLetterId} className="card-container">
              <h4 className="card-title">{data.title || `결과지 ${index + 1}`}</h4>
                
              <ResultCard
                highlight={data.hasVideo}
                useVoucher={data.useVoucher}
                onCheckQuestion={() => handleNavigateToQuestions(data.coverLetterId)}
                onCheckResult={() => handleNavigateToVideoResult(data.coverLetterId)}
                onDelete={() => handleDelete(data.coverLetterId)}
              />
            </div>
          ))
        ) : (
          <p className="no-results">검색 결과가 없습니다.</p>
        )}
      </div>

      <div className="pagination">
        <span 
          className={currentPage === 1 ? 'disabled' : ''} 
          onClick={() => handlePageChange(1)}
        >
          &laquo;
        </span>
        <span 
          className={currentPage === 1 ? 'disabled' : ''} 
          onClick={() => handlePageChange(currentPage - 1)}
        >
          &lt;
        </span>
        <span className="current">{currentPage} / {totalPageCount === 0 ? 1 : totalPageCount}</span> 
        <span 
          className={currentPage === totalPageCount || totalPageCount === 0 ? 'disabled' : ''} 
          onClick={() => handlePageChange(currentPage + 1)}
        >
          &gt;
        </span>
        <span 
          className={currentPage === totalPageCount || totalPageCount === 0 ? 'disabled' : ''} 
          onClick={() => handlePageChange(totalPageCount)}
        >
          &raquo;
        </span>
      </div>
    </main>
  );
}

export default InterviewMain;