import React from 'react';
import './RecordingInProgress.css';

function RecordingInProgress() {
  const question = '질문 1. 본인의 강점에 대해서 간단히 말해주세요.';
  const remainingTime = '01:25:00';
  const totalTime = '00:05:00';

  return (
    <div className="recording-progress-container">
      <main className="recording-main">
        <h1 className="recording-question">{question}</h1>

        <div className="camera-box">
          <div className="time-overlay">
            <div className="time-label">
              <span className="time-red">{remainingTime}</span>
              <span className="time-total">{totalTime}</span>
            </div>
          </div>
          <div className="camera-placeholder">
            <img src="/placeholder-camera.png" alt="camera view" />
          </div>
        </div>

        <div className="recording-notice">
          제한 시간이 끝나거나 소리가 3초 이상 녹음되지 않으면 자동으로 영상 녹화가 종료됩니다.<br />
          잡음 등으로 영상이 종료되지 않으면 종료 버튼으로 녹화를 중단해 주세요.
        </div>
      </main>
    </div>
  );
}

export default RecordingInProgress;