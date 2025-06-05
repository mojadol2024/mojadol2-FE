import React, { useState, useEffect } from 'react';
import './TakeSelect.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';

function TakeSelect({ videoTakes, questions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTake, setSelectedTake] = useState(null);
  const [takes, setTakes] = useState([]); // Array of video data (base64 or thumbnail URLs)
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const questionIndex = new URLSearchParams(location.search).get('q');
  const questionObj = location.state?.question;
  const incomingQuestions = location.state?.questions;
  const storedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
  const [questionList, setQuestionList] = useState(questions || storedQuestions);
  const questionText = questionObj?.content
    ? `질문 ${parseInt(questionIndex, 10) + 1}: "${questionObj.content}"`
    : `질문 ${parseInt(questionIndex, 10) + 1}: "질문 내용을 불러올 수 없습니다."`;


  useEffect(() => {
    console.log('coverLetterId:', coverLetterId);
    console.log('questionIndex:', questionIndex);
    console.log('question:', questionObj);

    if (!coverLetterId || !questionIndex || !questionObj) {
      alert('잘못된 접근입니다. 홈으로 이동합니다.');
      navigate('/');
      return;
    }
    const saved = JSON.parse(
      localStorage.getItem(`videoTakes_${coverLetterId}_${questionIndex}`) || '[]'
    );
    if (incomingQuestions) {
      localStorage.setItem('questions', JSON.stringify(incomingQuestions));
      setQuestionList(incomingQuestions);
    }
    setTakes(saved);
    console.log('불러온 takes:', saved);
  }, [coverLetterId, questionIndex]);

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
    navigate(`/RecordingPage?id=${coverLetterId}&q=${questionIndex}`, {
      state: {
        coverLetterId,
        questionIndex,
        question: questionObj,  // 변수 이름도 정확히 맞춰야 TakeSelect에서 받을 수 있음
      },
    });
  };

  const handleNewQuestion = () => {
    if (!questionList  || !questionList [questionIndex]) {
      alert('질문을 찾을 수 없습니다.');
      return;
    }
    navigate(`/ResumeQuestionPage?id=${coverLetterId}&q=${questionIndex}`, { // 새 질문 녹화하기
      state: { question: questionList[questionIndex], questions: questionList }  // ✅ 함께 전달
    });
  };

  return (
    <div className="take-select-container">
      <main className="take-main">
        <div className="take-question">
          {questionText}
        </div>

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
              <img src={take.imageUrl} alt={`Take ${index + 1}`} className="take-image" onError={() => console.warn(`❗ 이미지 로드 실패: Take ${index + 1}`)}/>
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
