import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import ResultCard from '../../components/resultCard/ResultCard';
import './InterviewMain.css';

function InterviewMain() {
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const paginatedResults = useMemo(() => {
    return filteredResults.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [filteredResults, currentPage, perPage]);

  const totalPageCount = useMemo(() => {
    return Math.ceil(filteredResults.length / perPage);
  }, [filteredResults.length, perPage]);

  const fetchAllCoverLetters = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. 자소서 리스트 불러오기
      const listParams = {
        page: 0,
        size: 1000 // 모든 자소서를 불러오기 위함
      };
      const response = await axiosInstance.get('/mojadol/api/v1/letter/list', { params: listParams });
      
      const rawList = response.data.result?.content || [];

      // 2. 각 자소서별로 화상 면접 영상 존재 여부 확인
      const resultsWithVideoStatus = await Promise.all(
        rawList.map(async (item) => {
          try {
            const videoResponse = await axiosInstance.get(`/mojadol/api/v1/interview/list/${item.coverLetterId}`);
            // videoResponse.data.result가 배열이고, 그 안에 내용이 있으면 영상이 있는 것으로 판단
            const hasVideo = videoResponse.data.result && videoResponse.data.result.length > 0;
            
            // console.log(`자소서 ID: ${item.coverLetterId}, 영상 존재 여부: ${hasVideo}`);

            return {
              coverLetterId: item.coverLetterId,
              title: item.title,
              useVoucher: item.useVoucher ?? 'FREE', 
              hasVideo: hasVideo,
            };
          } catch (videoError) {
            //console.error(`자소서 ID ${item.coverLetterId}의 영상 정보를 불러오는데 실패했습니다:`, videoError);
            return {
              coverLetterId: item.coverLetterId,
              title: item.title,
              useVoucher: item.useVoucher ?? 'FREE', 
              hasVideo: false, // 영상 정보 불러오기 실패 시 false
            };
          }
        })
      );

      const mapped = resultsWithVideoStatus.reverse(); // 최신 항목이 먼저 오도록 역순 정렬
      
      setAllResults(mapped);
      setFilteredResults(mapped);
      setCurrentPage(1);
      //console.log('🔍 최종 매핑된 results (영상 상태 포함):', mapped);

    } catch (error) {
      //console.error('자소서 리스트 불러오기 실패:', error);
      setError(new Error('자소서 리스트를 불러오는 데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const shouldRefresh = localStorage.getItem("shouldRefreshMainList");
    if (shouldRefresh === "true") {
      fetchAllCoverLetters();
      localStorage.removeItem("shouldRefreshMainList");
    } else {
      fetchAllCoverLetters();
    }
  }, []);

  const handleDelete = async (coverLetterId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    setError(null);

    try {
      await axiosInstance.delete(`/mojadol/api/v1/letter/delete/${coverLetterId}`);
      // 삭제 후 다시 불러오는 대신, 상태를 직접 업데이트하여 최신화
      setAllResults(prev => prev.filter(item => item.coverLetterId !== coverLetterId));
      setFilteredResults(prev => prev.filter(item => item.coverLetterId !== coverLetterId));
      // 현재 페이지의 마지막 요소가 삭제되었을 때 페이지를 조정
      if (paginatedResults.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
      }
      alert('자소서가 성공적으로 삭제되었습니다.');
    } catch (error) {
      //console.error('삭제 실패:', error);
      setError(new Error('자소서 삭제에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToQuestions = (coverLetterId) => {
    navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
  };

  const handleNavigateToVideoResult = (coverLetterId) => {
    navigate(`/PdfView/${coverLetterId}`);
  };

  useEffect(() => {
    let tempResults = [...allResults];

    if (searchKeyword.trim() !== '') {
      const keyword = searchKeyword.toLowerCase();
      tempResults = tempResults.filter(item =>
        item.title?.toLowerCase().includes(keyword)
      );
    }

    setFilteredResults(tempResults);
    setCurrentPage(1);
  }, [searchKeyword, allResults]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPageCount) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="loading-state-container">
        <div className="spinner"></div>
        <p className="loading-message">자소서 리스트를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-container">
        <p className="error-message">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <main className="main-content">
      <div className="header">
        <h1 className="main-title">면접 목록</h1>
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
                // 엔터 키 입력 시 특별한 동작이 필요 없다면 비워두거나 삭제
              }
            }}
          />
          <span className="cover-letter-count">{filteredResults.length}개</span>
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
          <p className="no-results">표시할 자소서가 없습니다.</p>
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