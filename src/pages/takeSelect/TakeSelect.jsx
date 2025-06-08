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

    if (incoming.length > 0) {
      localStorage.setItem('questions', JSON.stringify(incoming));
      setQuestionList(incoming);
      if (!questionObj || !questionObj.id) {
        const fallback = incoming[questionIndex];
        if (fallback) {
          setQuestionObj({
            id: fallback.questionId, // ✅ 서버가 요구하는 필드명으로 매핑
            content: fallback.content,
          });
        }
      }
    } else if (stored.length > 0) {
      setQuestionList(stored);
      if (!questionObj || !questionObj.id) {
        const fallback = stored[questionIndex];
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
    formData.append('id', questionObj.id); // ✅ 서버 요구 key로 정확히 전송

    console.log("🟨 업로드 시도 중");
    console.log("questionObj.id:", questionObj?.id);
    console.log("video:", file);

    for (let [key, val] of formData.entries()) {
      console.log(`FormData: ${key} =>`, val);
    }

    try {
      const response = await axiosInstance.post(
        '/mojadol/api/v1/interview/upload',
        formData
      );
      const interviewId = response.data.result.interviewId;
      alert("업로드 성공! 결과지로 이동합니다.");
      navigate(`/interview/result/${interviewId}`);
    } catch (error) {
      console.error('Upload failed:', error.response || error);
      alert('영상 업로드에 실패했습니다.');
    }
  };

  const handleNewQuestion = async () => {
    if (!questionList || questionList.length === 0) {
      alert('질문을 찾을 수 없습니다.');
      return;
    }

    const nextIndex = questionIndex + 1;
    const nextQuestion = questionList[nextIndex];

    if (!nextQuestion) {
      alert('더 이상 남은 질문이 없습니다.');
      return;
    }

    if (selectedTake === null) {
      alert('새로운 질문으로 이동하려면 업로드할 영상을 선택하세요.');
      return;
    }

    const selected = takes[selectedTake];
    const file = new File([selected.file], `question_${questionIndex}.webm`, {
      type: 'video/webm',
    });

    const formData = new FormData();
    formData.append('video', file);
    formData.append('id', questionObj.id); // ✅ 정확한 id 사용

    console.log("🟩 새 질문 이동 직전 업로드");
    console.log("questionObj.id:", questionObj?.id);
    console.log("video:", file);

    try {
      await axiosInstance.post('/mojadol/api/v1/interview/upload', formData);
      alert('영상 업로드 성공. 다음 질문으로 이동합니다.');

      navigate(`/ResumeQuestionPage?id=${coverLetterId}&q=${nextIndex}`, {
        state: {
          question: {
            id: nextQuestion.questionId,
            content: nextQuestion.content,
          },
          questions: questionList,
        },
      });
    } catch (error) {
      console.error('Upload before new question failed:', error);
      alert('업로드에 실패했습니다. 새 질문으로 이동하지 않습니다.');
    }
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
