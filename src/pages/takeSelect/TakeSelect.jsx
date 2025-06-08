import React, { useState, useEffect } from 'react';
import './TakeSelect.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';

function TakeSelect() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTake, setSelectedTake] = useState(null);
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const questionIndex = new URLSearchParams(location.search).get('q');
  const questionObj = location.state?.question;
  const initialTakes = location.state?.takes || [];
  const [takes, setTakes] = useState(initialTakes);
  const [questionList, setQuestionList] = useState(location.state?.questions || []);

  const questionText = questionObj?.content
    ? `질문 ${parseInt(questionIndex, 10) + 1}: "${questionObj.content}"`
    : `질문 ${parseInt(questionIndex, 10) + 1}: "질문 내용을 불러올 수 없습니다."`;

  useEffect(() => {
    if (!coverLetterId || !questionIndex || !questionObj) {
      alert('잘못된 접근입니다. 홈으로 이동합니다.');
      navigate('/');
    }
  }, []);

  const handleSelect = (index) => {
    setSelectedTake(index);
  };

  const handleUpload = async () => {
    if (selectedTake === null) {
      alert("업로드할 영상을 선택해주세요.");
      return;
    }

    const selected = takes[selectedTake];
    const file = new File([selected.file], `question_${questionIndex}.webm`, {
      type: 'video/webm',
    });

    const formData = new FormData();
    formData.append('video', file);
    formData.append('id', coverLetterId);

    try {
      const response = await axiosInstance.post(
        '/mojadol/api/v1/interview/upload',
        formData
      );

      const interviewId = response.data.result.interviewId;
      alert("업로드 성공! 결과지로 이동합니다.");
      navigate(`/interview/result/${interviewId}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('영상 업로드에 실패했습니다.');
    }
  };

  const handleNewQuestion = async () => {
    if (selectedTake === null) {
      alert("새 질문으로 이동하려면 업로드할 영상을 선택하세요.");
      return;
    }

    const selected = takes[selectedTake];
    const file = new File([selected.file], `question_${questionIndex}.webm`, {
      type: 'video/webm',
    });

    const formData = new FormData();
    formData.append('video', file);
    formData.append('id', coverLetterId);

    try {
      await axiosInstance.post('mojadol/api/v1/interview/upload', formData);
      alert('영상 업로드 성공. 새 질문으로 이동합니다.');
    } catch (error) {
      console.error('Upload before new question failed:', error);
      alert('업로드 실패. 이동 취소.');
      return;
    }

    navigate(`/ResumeQuestionPage?id=${coverLetterId}&q=${questionIndex}`, {
      state: { question: questionList[questionIndex], questions: questionList },
    });
  };

  const handleNavigateToRecording = () => {
    navigate(`/RecordingPage?id=${coverLetterId}&q=${questionIndex}`, {
      state: {
        coverLetterId,
        questionIndex,
        question: questionObj,
        takes: takes, // 기존 takes 유지
      },
    });
  };

  return (
    <div className="take-select-container">
      <main className="take-main">
        <div className="take-question">{questionText}</div>

        {takes.length < 3 && (
          <button className="take-rec-btn" onClick={handleNavigateToRecording}>
            Take {takes.length + 1} 녹화 시작
          </button>
        )}
        {takes.length >= 3 && (
          <p className="take-limit-warning">최대 3개의 영상을 녹화할 수 있습니다.</p>
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
                onError={() => console.warn(`❗ 이미지 로드 실패: Take ${index + 1}`)}
              />
            </div>
          ))}
        </div>

        <div className="take-buttons">
          <button className="outline" onClick={handleNewQuestion}>
            새로운 질문 선택 (녹화 영상은 자동 업로드됨)
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
