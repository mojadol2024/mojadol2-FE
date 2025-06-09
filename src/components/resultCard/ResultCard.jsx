import React from 'react';
import './ResultCard.css';

function ResultCard({ highlight, useVoucher, onCheckQuestion, onCheckResult, onDelete }) {
  const isGold = useVoucher === 'GOLD'; 
  const isFree = useVoucher === 'FREE';

  console.log(`ResultCard - highlight for this card: ${highlight}`); 

  return (
    <div className={`result-card ${isGold ? 'gold-card' : ''}`}>
      <div className="card-header">
        <div className="user-icon">👤</div>
        {isGold && <span className="voucher-tag gold-tag">GOLD</span>}
        {isFree && <span className="voucher-tag free-tag">FREE</span>}
      </div>

      <button className="question-btn" onClick={onCheckQuestion}>
        자소서 질문 확인
      </button>

      {/* 화상 면접 결과 확인 버튼 */}
      <button
        className={`interview-btn ${highlight ? 'active' : 'disabled'}`}
        onClick={onCheckResult}
        disabled={!highlight}
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