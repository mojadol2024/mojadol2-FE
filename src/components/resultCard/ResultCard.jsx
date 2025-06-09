// ResultCard.js 파일
import React from 'react';
import './ResultCard.css';
import { FaUserAlt } from 'react-icons/fa';

// canCheckResult prop을 추가합니다.
function ResultCard({ highlight, useVoucher, canCheckResult, onCheckQuestion, onCheckResult, onDelete }) {
  const isGold = useVoucher === 'GOLD';
  const isFree = useVoucher === 'FREE';

  // console.log(`ResultCard - highlight: ${highlight}, canCheckResult: ${canCheckResult}`);

  return (
    <div className={`result-card ${isGold ? 'gold-card' : ''}`}>
      <div className="card-header">
        <div className="user-icon">
          <FaUserAlt size={20} />
        </div>
        {isGold && <span className="voucher-tag gold-tag">GOLD</span>}
        {isFree && <span className="voucher-tag free-tag">FREE</span>}
      </div>

      <button className="question-btn" onClick={onCheckQuestion}>
        자소서 질문 확인
      </button>

      {/* 화상 면접 결과 확인 버튼 */}
      <button
        // disabled 상태를 canCheckResult prop으로 설정합니다.
        className={`interview-btn ${canCheckResult ? 'active' : 'disabled'}`}
        onClick={onCheckResult}
        disabled={!canCheckResult} // canCheckResult가 false일 때 비활성화
      >
        화상 면접 결과 확인
      </button>

      <button className="delete-btn" onClick={onDelete}>
        삭제하기
      </button>
    </div>
  );
}

export default ResultCard;