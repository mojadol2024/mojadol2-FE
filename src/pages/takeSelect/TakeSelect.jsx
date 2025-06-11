import React, { useState, useEffect } from 'react';
import './TakeSelect.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAxiosInstance } from '../../lib/axiosInstance';

function TakeSelect() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTake, setSelectedTake] = useState(null);
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const questionIndex = parseInt(new URLSearchParams(location.search).get('q'), 10);

  const [takes, setTakes] = useState(location.state?.takes || []);
  const [questionList, setQuestionList] = useState([]);
  const [questionObj, setQuestionObj] = useState(location.state?.question || null);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!coverLetterId || isNaN(questionIndex)) {
      alert('잘못된 접근입니다. 홈으로 이동합니다.');
      navigate('/');
      return;
    }
    
    // ✅ takes 복원
    if ((!takes || takes.length === 0)) {
      const key = `videoTakes_${coverLetterId}_${questionIndex}`;
      const restored = JSON.parse(localStorage.getItem(key) || '[]');
      if (restored.length > 0) {
        console.log("📦 localStorage에서 takes 복원:", restored);
        setTakes(restored);
      } else {
        console.warn("📭 takes를 복원할 수 없습니다.");
      }
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

    const axios = getAxiosInstance();
    if (!axios) {
      alert("인증 정보가 없습니다. 다시 로그인해주세요.");
      navigate('/login');
      return null;
    }

    try {
      const response = await axios.post('/mojadol/api/v1/interview/upload', formData);
      return response.data.result?.interviewId || null;
    } catch (error) {
      console.error('❌ 업로드 실패:', error.response || error);
      alert('영상 업로드에 실패했습니다.');
      return null;
    }
  };

  const fetchAnalysisResults = async () => {
    try {
      const axios = getAxiosInstance();
      const res = await axios.get(`/mojadol/api/v1/letter/detail/${coverLetterId}`);
      return res.data.result.analysisResults || {};
    } catch (err) {
      console.error("❌ 분석 결과 갱신 실패", err);
      return {};
    }
  };

  const handleUploadAndReturn = async () => {
    setIsUploading(true); 
    const interviewId = await uploadSelectedTake();
    //if (!interviewId) return;
    if (!interviewId) {
    setIsUploading(false); // 실패 시 로딩 종료
    return;
  }
    // ✅ 업로드 성공했으면 해당 영상만 삭제
    const storageKey = `videoTakes_${coverLetterId}_${questionIndex}`;
    localStorage.removeItem(storageKey);

    const analysisResults = await fetchAnalysisResults();
    setIsUploading(false);

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
        step: 'countdown',
      },
    });
  };

  if (isUploading) {
    return (
      <div className="loading-state-container">
        <div className="spinner"></div>
        <p className="loading-message">영상을 업로드 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="take-select-container">
      <main className="take-main">
        <div className="take-question">{questionText}</div>

        <div className="take-actions-container">
          {takes.length < 3 ? (
           <>
            <button className="take-rec-btn" onClick={handleNavigateToRecording}>
                Take {takes.length + 1} 녹화 시작
              </button>
              <p className="take-hint-text">
                녹화 시작 버튼을 누르면 카운트다운 후 <strong>바로 녹화</strong>가 시작됩니다.
              </p>
            </> 

          ) : (
            <p className="take-limit-warning">최대 3개의 영상을 녹화할 수 있습니다.</p>
          )}

          <div className="take-buttons">
            <button
              className={selectedTake !== null && !isUploading ? 'active' : 'disabled'}
              onClick={handleUploadAndReturn}
              disabled={selectedTake === null || isUploading} // 여기에 isUploading도 추가?
            >
              {isUploading ? '업로드 중...' : '영상 저장'}
            </button>
          </div>
        </div>

        <div className="take-thumbnails-container">
          {takes.map((take, index) => (
            <div key={index} className="take-box">
              {/* --- 기존 take-radio div 제거 ---ddd */}
              {/* <div
                className={`take-radio ${selectedTake === index ? 'selected' : ''}`}
                onClick={() => handleSelect(index)}
              ></div> */}
              <span>Take {index + 1}</span>
              <img
                src={take.imageUrl}
                alt={`Take ${index + 1}`}
                className={`take-image ${selectedTake === index ? 'selected' : ''}`} /* selected 클래스 조건부 추가 */
                onClick={() => handleSelect(index)} 
                onError={() => console.warn(`❗ 이미지 로드 실패: Take ${index + 1}`)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default TakeSelect;