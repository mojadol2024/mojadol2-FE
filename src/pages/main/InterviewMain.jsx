import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import ResultCard from '../../components/resultCard/ResultCard';
import './InterviewMain.css';

function InterviewMain() {
  const [results, setResults] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('전체');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchType, setSearchType] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();
  const totalPageCount = Math.ceil(results.length / perPage);
  const paginated = results.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    // ResumeQuestionPage에서 저장된 flag가 있으면 리스트 다시 불러오기
    const shouldRefresh = localStorage.getItem("shouldRefreshMainList");
    if (shouldRefresh === "true") {
      fetchCoverLetters(); // 다시 불러오기
      localStorage.removeItem("shouldRefreshMainList"); // 초기화
    } else {
      fetchCoverLetters();
    }
  }, []);

  const calculateDateFromPeriod = (period) => {
    const now = new Date();
    switch (period) {
      case '1 주일': return new Date(now.setDate(now.getDate() - 7));
      case '1 개월': return new Date(now.setMonth(now.getMonth() - 1));
      case '3 개월': return new Date(now.setMonth(now.getMonth() - 3));
      case '6 개월': return new Date(now.setMonth(now.getMonth() - 6));
      case '1 년': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return null;
    }
  };

  const fetchCoverLetters = async () => {
    try {
      const params = {
        page: 0,
        size: 9
      };
      const response = await axiosInstance.get('/mojadol/api/v1/letter/list', { params });
      
      // ✅ 응답 가공: result가 배열이고, 각 result는 coverLetter 정보를 포함하고 있음
      const list = response.data.content || [];
      const mapped = list.map(item => ({
        coverLetterId: item.coverLetter?.coverLetterId,
        title: item.coverLetter?.title,
        useVoucher: item.coverLetter?.useVoucher,
        hasVideo: item.hasVideo ?? false
      }));

      setResults(mapped);
    } catch (error) {
      console.error('자소서 리스트 불러오기 실패:', error);
    }
  };

  const handleDelete = async (coverLetterId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axiosInstance.delete(`/mojadol/api/v1/letter/delete/${coverLetterId}`);
      setResults(prev => prev.filter(item => item.coverLetterId !== coverLetterId));
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const handleNavigateToQuestions = (coverLetterId) => {
    navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
  };

  const handleNavigateToVideoResult = async (coverLetterId) => {
    try {
      const res = await axiosInstance.get(`/mojadol/api/v1/letter/detail/${coverLetterId}`);
      const data = res.data.result;

      if (!data.resultAvailable) {
        alert('결과지가 아직 생성되지 않았습니다. 모든 질문에 대한 영상 등록 후 결과 확인이 가능합니다.');
        return;
      }

      navigate(`/results/${coverLetterId}`);  // pdf 결과지 페이지가 따로 만들어지는건가요? api?를 받은 어떤 페이지가 생성이 되는건가..?
    } catch (error) {
      console.error('결과지 확인 오류:', error);
      alert('결과지를 확인하는 데 실패했습니다.');
    }
  };

  // const handleNavigateToVideoResult = async (coverLetterId) => {
  //   try {
  //     if (data.voucherType === 'FREE' || data.voucherType === 'GOLD') {
  //       const totalQuestions = data.questions.length;
  //       const totalAnalyzed = data.questions.filter(q => q.analyzed === true).length;

  //       if (totalAnalyzed < totalQuestions) {
  //         alert('결과지가 아직 생성되지 않았습니다. 모든 질문에 대한 영상 등록 후 결과 확인이 가능합니다.');
  //         return;
  //       }
  //     }
  //     navigate(`/results/${coverLetterId}`);  // pdf 결과지 페이지가 따로 만들어지는건가요? api?를 받은 어떤 페이지가 생성이 되는건가..?
  //   } catch (error) {
  //     console.error('결과지 확인 오류:', error);
  //     alert('결과지를 확인하는 데 실패했습니다.');
  //   }
  // };

  const handleSearch = async () => {
    try {
      const params = {
        page: currentPage - 1,
        size: perPage, // 유저가 선택한 값: 10, 50, 100 등
      };

      if (selectedPeriod !== '전체' && selectedPeriod !== '직접입력') {
        const from = calculateDateFromPeriod(selectedPeriod);
        params.startDate = from.toISOString().slice(0, 10);
        params.endDate = new Date().toISOString().slice(0, 10);
      } else if (selectedPeriod === '직접입력' && dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }

      if (searchType !== '전체' && searchKeyword) {
        params.searchType = searchType;
        params.keyword = searchKeyword;
      }

      const response = await axiosInstance.get('/mojadol/api/v1/letter/list', { params });
      setResults(response.data.content || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('검색 실패:', error);
    }
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPageCount) {
      setCurrentPage(newPage);
    }
  };

  return (
    <main className="main-content">
      <div className="header">
        <h1 className="main-title">화상 면접</h1>
        <button className="upload-btn" onClick={() => navigate('/SpellingCorrection')}> 
          자소서 등록
        </button>
      </div>

      <div className="filter-section">
        <div className="left-filters">
          <label>
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} /> 전체 선택
          </label>
        </div>

        <div className="right-filters">
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
            <option>전체</option>
            <option>1 주일</option>
            <option>1 개월</option>
            <option>3 개월</option>
            <option>6 개월</option>
            <option>1 년</option>
            <option>직접입력</option>
          </select>

          {(selectedPeriod === '직접입력') && (
            <>
              <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
              <span>-</span>
              <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
            </>
          )}

          <select value={searchType} onChange={e => setSearchType(e.target.value)}>
            <option>전체</option>
            <option value="검사명">검사명</option>
            <option value="문서명">문서명</option>
          </select>
          <input placeholder="검색어를 입력하세요." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />

          <button className="search-btn" onClick={handleSearch}>조회</button>

          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={10}>10 개</option>
            <option value={50}>50 개</option>
            <option value={100}>100 개</option>
          </select>
        </div>
      </div>

      <div className="results-list">
        {paginated.map((data, index) => (
          <div key={data.coverLetterId} className="card-container">
            <h4 className="card-title">{data.title || `결과지 ${index + 1}`}</h4>
            <ResultCard
              highlight={data.hasVideo}
              onCheckQuestion={() => handleNavigateToQuestions(data.coverLetterId)}
              onCheckResult={() => handleNavigateToVideoResult(data.coverLetterId, data.hasVideo)}
              onDelete={() => handleDelete(data.coverLetterId)}
            />
          </div>
        ))}
      </div>

      <div className="pagination">
        <span onClick={() => handlePageChange(1)}>&laquo;</span>
        <span onClick={() => handlePageChange(currentPage - 1)}>&lt;</span>
        <span className="current">{currentPage}</span>
        <span onClick={() => handlePageChange(currentPage + 1)}>&gt;</span>
        <span onClick={() => handlePageChange(totalPageCount)}>&raquo;</span>
      </div>
    </main>
  );
}

export default InterviewMain;