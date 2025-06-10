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

      // 2. 각 자소서별로 화상 면접 영상 존재 여부 및 결과 확인 가능 여부 확인
      const resultsWithVideoStatus = await Promise.all(
        rawList.map(async (item) => {
          let hasVideo = false;
          let canCheckResult = false; // 새로 추가될 결과 확인 가능 여부
          let questionsForThisLetter = []; // 해당 자소서의 질문들을 저장할 변수

          try {
            // 해당 자소서의 면접 질문 목록과 영상 업로드 상태를 가져옵니다.
            const videoResponse = await axiosInstance.get(`/mojadol/api/v1/interview/list/${item.coverLetterId}`);
            // videoResponse.data.result가 배열이고, 그 안에 내용이 있으면 영상이 있는 것으로 판단
            questionsForThisLetter = videoResponse.data.result && Array.isArray(videoResponse.data.result) ? videoResponse.data.result : [];

            hasVideo = questionsForThisLetter.length > 0; // 영상이 하나라도 존재하면 true

            // ResumeQuestionPage의 로직을 여기에 적용
            const isUploaded = (q) => q.is_answered === 1;

            if (item.useVoucher === 'FREE') {
              // FREE 사용자는 모든 질문에 영상이 있어야 결과 확인 가능
              canCheckResult = questionsForThisLetter.every(isUploaded) && questionsForThisLetter.length > 0; // 질문이 없으면 false
            } else if (item.useVoucher === 'GOLD') {
              // GOLD 사용자는 최소 한 개 이상의 질문에 영상이 있어야 결과 확인 가능
              canCheckResult = questionsForThisLetter.some(isUploaded);
            }
            // 그 외 (null 또는 정의되지 않은 경우)는 hasVideo와 동일하게 처리하거나,
            // 기본값으로 canCheckResult를 false로 두거나, FREE와 동일하게 처리할 수 있습니다.
            // 현재 코드의 item.useVoucher ?? 'FREE' 로직을 따라 FREE와 동일하게 처리하겠습니다.
            else {
                canCheckResult = questionsForThisLetter.every(isUploaded) && questionsForThisLetter.length > 0;
            }

              const pdfGeneratedKey = `pdfGenerated_${item.coverLetterId}`;
              const pdfGenerated = localStorage.getItem(pdfGeneratedKey) === 'true';

            // console.log(`자소서 ID: ${item.coverLetterId}, 영상 존재 여부: ${hasVideo}, 결과 확인 가능: ${canCheckResult}`);

            return {
              coverLetterId: item.coverLetterId,
              title: item.title,
              useVoucher: item.useVoucher ?? 'FREE',
              hasVideo,
              canCheckResult,
              pdfGenerated, 
            };
          } catch (videoError) {
            //console.error(`자소서 ID ${item.coverLetterId}의 영상 정보를 불러오는데 실패했습니다:`, videoError);
            return {
              coverLetterId: item.coverLetterId,
              title: item.title,
              useVoucher: item.useVoucher ?? 'FREE',
              hasVideo: false, // 영상 정보 불러오기 실패 시 false
              canCheckResult: false, // 영상 정보 불러오기 실패 시 결과 확인 불가
              pdfGenerated: false,
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
    const pdfGeneratedKey = `pdfGenerated_${coverLetterId}`;
    const isPdfGenerated = localStorage.getItem(pdfGeneratedKey) === 'true';

    if (!isPdfGenerated) {
      alert('아직 결과지가 생성되지 않았습니다.');
      return;
    }

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
            <div key={data.coverLetterId} className={`card-container ${data.useVoucher === 'GOLD' ? 'gold-card' : ''}`}>
              <h4 className="card-title">{data.title || `결과지 ${index + 1}`}</h4>

              <ResultCard
                highlight={data.hasVideo} 
                useVoucher={data.useVoucher}
                canCheckResult={data.canCheckResult}
                pdfGenerated={data.pdfGenerated} 
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