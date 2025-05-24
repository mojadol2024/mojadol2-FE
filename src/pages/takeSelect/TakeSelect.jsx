import React, { useState } from 'react';
import './TakeSelect.css';

function TakeSelect() {
  const [selectedTake, setSelectedTake] = useState(null);

  const handleSelect = (take) => {
    setSelectedTake(take);
  };

  return (
    <div className="take-select-container">
      <main className="take-main">
        <div className="take-question">
          질문: 본인의 강점에 대해서 간단히 말해주세요
        </div>

        <button className="take-rec-btn">Take 2 녹화 시작</button>

        <div className="take-box">
          <div
            className={`take-radio ${selectedTake === 1 ? 'selected' : ''}`}
            onClick={() => handleSelect(1)}
          ></div>
          <span>Take 1</span>
          <div className="take-image">
            {/* 사용자 녹화 캡처 이미지가 들어갈 부분 */}
          </div>
        </div>

        <div className="take-buttons">
          <button className="outline">새로운 질문 선택</button>
          <button
            className={selectedTake ? 'active' : 'disabled'}
            disabled={!selectedTake}
          >
            바로 결과 확인
          </button>
        </div>
      </main>
    </div>
  );
}

export default TakeSelect;
