import React, { useState, useEffect } from 'react';
import './RecordingPage.css';

function RecordingPage() {
  const [countdown, setCountdown] = useState(null);
  const [recording, setRecording] = useState(false);
  const [question] = useState('질문: 본인의 강점에 대해서 간단히 말해주세요');

  const startRecording = () => {
    setRecording(true);
    setCountdown(3);
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // 실제 녹화 시작 로직 들어갈 자리
      setCountdown(null);
      console.log('녹화 시작!');
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="recording-page-container">
      <main className="recording-main">
        <div className="recorder-header">
          <button className="record-button" onClick={startRecording}>
            🎥 시작
          </button>
          <div className="timer-display">00:00:00</div>
        </div>

        <div className="question-box">{question}</div>

        {recording && countdown !== null && (
          <div className="countdown-number">{countdown}</div>
        )}
      </main>
    </div>
  );
}

export default RecordingPage;