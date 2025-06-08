import './ResultCard.css';

// ⭐ useVoucher prop 추가
function ResultCard({ highlight, useVoucher, onCheckQuestion, onCheckResult, onDelete }) {
  const isGold = useVoucher === 'GOLD'; // ⭐ GOLD 이용권인지 확인하는 변수

  return (
    <div className={`result-card ${isGold ? 'gold-card' : ''}`}> {/* ⭐ gold-card 클래스 추가 */}
      <div className="card-header"> {/* ⭐ 헤더를 감싸는 div 추가 */}
        <div className="user-icon">👤</div>
        {isGold && <span className="voucher-tag gold-tag">GOLD</span>} {/* ⭐ GOLD 태그 조건부 렌더링 */}
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