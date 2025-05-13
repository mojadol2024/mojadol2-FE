import React from 'react';
import './ResultCard.css';

function ResultCard({ title, highlight }) {
  return (
    <div className="result-card">
      <div className="user-icon">👤</div>
      <div className="bar-wrapper">
        <div className="bar blue" />
        <div className="bar green" />
      </div>
      <button className="question-btn">자소서 질문 확인</button>
      <button className={`interview-btn ${highlight ? 'active' : ''}`}>
        화상 면접 결과 확인
      </button>
      <button className="delete-btn">삭제하기</button>
    </div>
  );
}

export default ResultCard;
