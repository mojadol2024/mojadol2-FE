import React, { useState, useEffect } from 'react';
import './TakeSelect.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';

function TakeSelect() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTake, setSelectedTake] = useState(null);
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const questionIndex = parseInt(new URLSearchParams(location.search).get('q'), 10);

  const [takes, setTakes] = useState(location.state?.takes || []);
  const [questionList, setQuestionList] = useState([]);
  const [questionObj, setQuestionObj] = useState(location.state?.question || null);

  useEffect(() => {
    if (!coverLetterId || isNaN(questionIndex)) {
      alert('잘못된 접근입니다. 홈으로 이동합니다.');
      navigate('/');
      return;
    }

    const incoming = location.state?.questions || [];
    const stored = JSON.parse(localStorage.getItem('questions') || '[]');

    const source = incoming.length > 0 ? incoming : stored;

    if (source.length > 0) {
      if (incoming.length > 0) {
        localStorage.setItem('questions', JSON.stringify(incoming));
      }
      setQuestionList(source);
      if (!questionObj || !questionObj.id) {
        const fallback = source[questionIndex];
        if (fallback) {
          setQuestionObj({
            id: fallback.questionId,
            content: fallback.content,
          });
        }
      }
    } else {
      console.warn("❌ 질문 리스트 없음 (state도 localStorage도 실패)");
    }
  }, [coverLetterId, questionIndex]);

  const questionText = questionObj?.content
    ? `질문 ${questionIndex + 1}: "${questionObj.content}"`
    : `질문 ${questionIndex + 1}: "질문 내용을 불러올 수 없습니다."`;

  const handleSelect = (index) => {
    setSelectedTake(index);
  };

  const uploadSelectedTake = async () => {
    if (selectedTake === null) {
      alert("업로드할 영상을 선택해주세요.");
      return null;
    }

    const selected = takes[selectedTake];
    const file = new File([selected.file], `question_${questionIndex}.webm`, {
      type: 'video/webm',
    });

    const formData = new FormData();
    formData.append('video', file);
    formData.append('id', questionObj.id);

    try {
      const response = await axiosInstance.post('/mojadol/api/v1/interview/upload', formData);
      return response.data.result?.interviewId || null;
    } catch (error) {
      console.error('❌ 업로드 실패:', error.response || error);
      alert('영상 업로드에 실패했습니다.');
      return null;
    }
  };

  const fetchAnalysisResults = async () => {
    try {
      const res = await axiosInstance.get(`/mojadol/api/v1/letter/detail/${coverLetterId}`);
      return res.data.result.analysisResults || {};
    } catch (err) {
      console.error("❌ 분석 결과 갱신 실패", err);
      return {};
    }
  };

  const handleUploadAndReturn = async () => {
    const interviewId = await uploadSelectedTake();
    if (!interviewId) return;

    const analysisResults = await fetchAnalysisResults();

    alert("영상 업로드 성공! 질문 선택 화면으로 돌아갑니다.");
    navigate(`/ResumeQuestionPage?id=${coverLetterId}`, {
      state: {
        questions: questionList,
        analysisResults,
      }
    });
  };

  const handleNavigateToRecording = () => {
    navigate(`/RecordingPage?id=${coverLetterId}&q=${questionIndex}`, {
      state: {
        coverLetterId,
        questionIndex,
        question: questionObj,
        takes,
        questions: questionList,
      },
    });
  };

  return (
    <div className="take-select-container">
      <main className="take-main">
        <div className="take-question">{questionText}</div>

        {takes.length < 3 ? (
          <button className="take-rec-btn" onClick={handleNavigateToRecording}>
            Take {takes.length + 1} 녹화 시작
          </button>
        ) : (
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
          <button
            className={selectedTake !== null ? 'active' : 'disabled'}
            onClick={handleUploadAndReturn}
            disabled={selectedTake === null}
          >
            업로드 완료하고 돌아가기
          </button>
        </div>
      </main>
    </div>
  );
}

export default TakeSelect;
