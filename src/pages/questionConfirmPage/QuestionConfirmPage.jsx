import React from 'react';
import './QuestionConfirmPage.css';

function QuestionConfirmPage() {
  const questionText = '질문 1: "본인의 장점을 직무와 연관지어 설명해 보세요."';

  return (
    <div className="question-confirm-container">
      <main className="question-confirm-main">
        <h1 className="question-title">{questionText}</h1>

        <div className="confirm-buttons">
          <button className="btn gray">질문 재선택</button>
          <button className="btn green">녹화 시작</button>
        </div>

        <div className="notice-text">
          <p>답변이 3초 이상 들리지 않으면 자동으로 종료됩니다.</p>
          <p>영상을 첨부할 수 있으니 틀려도 안심하세요.</p>
          <p>카메라, 녹음 권한을 확인하세요.</p>
          <p>녹화 시작 버튼 클릭 시 3초 카운트다운 후 녹화가 시작됩니다.</p>
        </div>

        <div className="attach-wrapper">
          <button className="btn attach">영상 첨부</button>
        </div>
      </main>
    </div>
  );
}

export default QuestionConfirmPage;