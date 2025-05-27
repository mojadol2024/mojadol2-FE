import React, { useState, useEffect } from 'react';
import './TakeSelect.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';

function TakeSelect({ videoTakes, questions }) {
  const location = useLocation();
  const [selectedTake, setSelectedTake] = useState(null);
  const [takes, setTakes] = useState([]); // Array of video data (base64 or thumbnail URLs)
  const navigate = useNavigate();
  const questionIndex = new URLSearchParams(location.search).get('q');
  const coverLetterId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (videoTakes && videoTakes.length > 0) {
      setTakes(videoTakes);
    } else {
      const saved = JSON.parse(localStorage.getItem('videoTakes') || '[]');
      if (saved.length > 0) setTakes(saved);
    }
  }, [videoTakes]);

  const handleSelect = (index) => {
    setSelectedTake(index);
  };

  const handleUpload = async () => {
    if (selectedTake === null) return;

    const selected = takes[selectedTake];

    if (!coverLetterId) {
      alert('coverLetterId를 찾을 수 없습니다.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selected.file);       // ✅ 'video' 필드명
    formData.append('id', coverLetterId);          // ✅ 'id' 필드명

    try {
      const response = await axiosInstance.post(
        '/mojadol/api/v1/interview/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const interviewId = response.data.result.interviewId; // ✅ 응답 구조 반영
      navigate(`/interview/result/${interviewId}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('영상 업로드에 실패했습니다.');
    }
  };

  const handleNavigateToRecording = () => {
    navigate(`/RecordingPage?id=${coverLetterId}&q=${questionIndex}`, { // 재녹화
      state: { question: questions[questionIndex] }
    });
  };

  const handleNewQuestion = () => {
    navigate(`/ResumeQuestionPage?id=${coverLetterId}&q=${questionIndex}`, { // 새 질문 녹화하기
      state: { question: questions[questionIndex] }
    });
  };

  return (
    <div className="take-select-container">
      <main className="take-main">
        <div className="take-question">
          질문: 본인의 강점에 대해서 간단히 말해주세요
        </div>

        {takes.length < 3 && (
          <button className="take-rec-btn" onClick={handleNavigateToRecording}>
            Take {takes.length + 1} 녹화 시작
          </button>
        )}

        <div style={{ display: 'flex', gap: '20px' }}>
          {takes.map((take, index) => (
            <div key={index} className="take-box">
              <div
                className={`take-radio ${selectedTake === index ? 'selected' : ''}`}
                onClick={() => handleSelect(index)}
              ></div>
              <span>Take {index + 1}</span>
              <img
                src={take.imageUrl}
                alt={`Take ${index + 1}`}
                className="take-image"
              />
            </div>
          ))}
        </div>

        <div className="take-buttons">
          <button className="outline" onClick={handleNewQuestion}>
            새로운 질문 선택 (새 질문 선택시 녹화 결과는 누적됩니다)
          </button>
          <button
            className={selectedTake !== null ? 'active' : 'disabled'}
            onClick={handleUpload}
            disabled={selectedTake === null}
          >
            결과지 생성
          </button>
        </div>
      </main>
    </div>
  );
}

export default TakeSelect;
