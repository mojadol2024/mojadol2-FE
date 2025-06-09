import React from 'react';
import './ResultCard.css';
import { FaUserAlt } from 'react-icons/fa';

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
        // disabled 상태를 더 이상 canCheckResult prop에 의존하지 않고 항상 활성화
        className={`interview-btn active`} // 항상 'active' 클래스 적용
        onClick={onCheckResult}
        disabled={false} // ✨✨✨ 항상 false로 설정하여 버튼이 비활성화되지 않도록 함 ✨✨✨
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