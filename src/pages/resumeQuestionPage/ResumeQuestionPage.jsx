import React, { useState } from 'react';
import './ResumeQuestionPage.css';

function ResumeQuestionPage() {
  const [questions] = useState(
    Array.from({ length: 10 }, (_, i) => `질문 ${i + 1}: "본인의 장점을 직무와 연관지어 설명해 보세요."`)
  );

  return (
    <div className="resume-question-container">
      <main className="resume-question-main">
        <div className="resume-header">
          <input className="resume-title" placeholder="자소서 이름" disabled />
          <div className="button-group">
            <button className="btn confirm">결과 확인</button>
            <button className="btn save">저장</button>
          </div>
        </div>

        <div className="question-list">
          {questions.map((q, i) => (
            <div className="question-item" key={i}>
              <div className="question-text">
                <span className="play-icon">▶</span>
                {q}
              </div>
              <div className="question-actions">
                <button className="btn attach">📷 영상 첨부</button>
                <button className="btn record">⏺ 영상 녹화</button>
              </div>
              {/* 조건에 따라 아래 표시가 달라질 예정 */}
              {/* <div className="question-status done">녹화 완료</div> */}
              {/* <div className="question-status select">
                <button className="btn redo">영상 재선택</button>
                <button className="btn confirm">✓ 녹화 완료</button>
              </div> */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ResumeQuestionPage;
