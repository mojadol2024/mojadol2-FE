// InterviewMain.jsx (리팩토링 버전)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResultCard from '../../components/resultCard/ResultCard';
import './InterviewMain.css';

const BASE_URL = 'http://myeonjub.store/api';

function InterviewMain() {
  const [results, setResults] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('전체');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchType, setSearchType] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);

  const totalPageCount = Math.ceil(results.length / perPage);
  const paginated = results.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/interviews`, {
        params: {
          period: selectedPeriod,
          startDate: dateRange.start,
          endDate: dateRange.end,
          searchType: searchType,
          keyword: searchKeyword,
        },
      });
      setResults(response.data); // 결과 데이터 배열이라고 가정
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchResults();
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    // 실제 각 카드의 선택 여부 관리는 카드 컴포넌트 수정 필요 (추후 추가)
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPageCount) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="interview-container">
      <main className="main-content">
        <div className="header">
          <h1 className="main-title">화상 면접</h1>
          <button className="upload-btn">자소서 등록</button>
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
              <option>검사명</option>
              <option>문서명</option>
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
          {paginated.map(data => (
            <ResultCard key={data.id} title={data.title || `결과지 ${data.id}`} highlight={false} />
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
    </div>
  );
}

export default InterviewMain;
