import React from 'react';
import './ResultCard.css';
import { FaUserAlt } from 'react-icons/fa';

function ResultCard({ highlight, useVoucher, canCheckResult, pdfGenerated, onCheckQuestion, onCheckResult, onDelete }) {
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
        className={`interview-btn ${pdfGenerated ? 'active' : 'disabled'}`}
        onClick={onCheckResult}
        disabled={!pdfGenerated} // ❗결과지가 없으면 비활성화
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