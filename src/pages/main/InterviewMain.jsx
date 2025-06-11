import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAxiosInstance } from '../../lib/axiosInstance';
import ResultCard from '../../components/resultCard/ResultCard';
import './InterviewMain.css';

function InterviewMain() {
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const perPage = 10;
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
      const axios = getAxiosInstance();
      const listParams = { page: 0, size: 1000 };
      const response = await axios.get('/mojadol/api/v1/letter/list', { params: listParams });
      const rawList = response.data.result?.content || [];

      const resultsWithVideoStatus = await Promise.all(
        rawList.map(async (item) => {
          let hasVideo = false;
          let canCheckResult = false;
          let questionsForThisLetter = [];

          try {
            const videoResponse = await axios.get(`/mojadol/api/v1/interview/list/${item.coverLetterId}`);
            questionsForThisLetter = Array.isArray(videoResponse.data.result) ? videoResponse.data.result : [];

            hasVideo = questionsForThisLetter.length > 0;
            const isUploaded = (q) => q.is_answered === 1;

            const voucher = item.useVoucher ?? 'FREE';

            if (voucher === 'FREE') {
              canCheckResult = questionsForThisLetter.every(isUploaded) && hasVideo;
            } else if (voucher === 'GOLD') {
              canCheckResult = questionsForThisLetter.some(isUploaded);
            } else {
              canCheckResult = questionsForThisLetter.every(isUploaded) && hasVideo;
            }

            const pdfGeneratedKey = `pdfGenerated_${item.coverLetterId}`;
            const pdfGenerated = localStorage.getItem(pdfGeneratedKey) === 'true';

            return {
              coverLetterId: item.coverLetterId,
              title: item.title,
              useVoucher: voucher,
              hasVideo,
              canCheckResult,
              pdfGenerated,
            };
          } catch (videoError) {
            return {
              coverLetterId: item.coverLetterId,
              title: item.title,
              useVoucher: item.useVoucher ?? 'FREE',
              hasVideo: false,
              canCheckResult: false,
              pdfGenerated: false,
            };
          }
        })
      );

      const mapped = resultsWithVideoStatus.reverse();
      setAllResults(mapped);
      setFilteredResults(mapped);
      setCurrentPage(1);
    } catch (error) {
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
      const axios = getAxiosInstance();
      await axios.delete(`/mojadol/api/v1/letter/delete/${coverLetterId}`);

      setAllResults(prev => prev.filter(item => item.coverLetterId !== coverLetterId));
      setFilteredResults(prev => prev.filter(item => item.coverLetterId !== coverLetterId));

      if (paginatedResults.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }

      alert('자소서가 성공적으로 삭제되었습니다.');
    } catch (error) {
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
          />
          <span className="cover-letter-count"><strong>{filteredResults.length}</strong>개</span>
        </div>
      </div>

      <p className="guide-text-m">※ 이미 <strong>생성된</strong> 면접 결과지를 확인할 수 있습니다. 면접 결과는 <strong>질문 확인</strong> 페이지에서 생성할 수 있습니다. </p>

      <div className="results-list">
        {paginatedResults.length > 0 ? (
          paginatedResults.map((data, index) => (
            <div
              key={data.coverLetterId}
              className={`card-container ${data.useVoucher === 'GOLD' ? 'gold-card' : ''}`}
            >
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
