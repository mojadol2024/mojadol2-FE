import './ResultCard.css';
function ResultCard({ highlight, onCheckQuestion, onCheckResult, onDelete }) {
  return (
    <div className="result-card">
      <div className="user-icon">👤</div>
      
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