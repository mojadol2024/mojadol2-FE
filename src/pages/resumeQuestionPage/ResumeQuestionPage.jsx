import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import './ResumeQuestionPage.css';

function ResumeQuestionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const questionIndex = new URLSearchParams(location.search).get('q');

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [videos, setVideos] = useState({});
  const [voucherType, setVoucherType] = useState(null);

  useEffect(() => {
    localStorage.setItem("shouldRefreshMainList", "true");

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!coverLetterId) {
      alert('자소서 ID가 없습니다.');
      return;
    }

    fetchLetterDetail();
  }, [location, coverLetterId]);

  const fetchLetterDetail = async () => {
    try {
      const response = await axiosInstance.get(`/mojadol/api/v1/letter/detail/${coverLetterId}`);
      const result = response.data.result;

      setTitle(result.coverLetter?.title || '자소서 제목 없음');
      setVoucherType(result.coverLetter?.useVoucher || 'FREE');
      setQuestions(Array.isArray(result.questions) ? result.questions : []);
    } catch (error) {
      console.error('자소서 정보 조회 실패:', error);
      alert('자소서 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRecord = (index) => {
    const isRecorded = videos[index]?.uploaded;

    if (isRecorded) {
      navigate(`/QuestionConfirmPage?id=${coverLetterId}&q=${index}`, {
        state: {
          question: questions[index],
          questions: questions,
          coverLetterId,
        }
      });
    } else {
      navigate(`/RecordingPage`, {
        state: {
          question: questions[index],
          questions: questions,
          coverLetterId,
          questionIndex: index,
        }
      });
    }
  };

  const handleConfirm = () => {
    const isUploaded = (q) => q.is_answered === 1;

    if (voucherType === 'FREE') {
      const allUploaded = questions.every(isUploaded);
      if (!allUploaded) {
        alert('모든 질문에 대해 영상이 등록되어야 결과 확인이 가능합니다.');
        return;
      }
    } else if (voucherType === 'GOLD') {
      const anyUploaded = questions.some(isUploaded);
      if (!anyUploaded) {
        alert('최소 한 개 이상의 질문에 대해 영상이 등록되어야 결과 확인이 가능합니다.');
        return;
      }
    }

    navigate(`/PdfView/${coverLetterId}`);
  };

  const handleSave = async () => {
    alert('저장되었습니다. 이후에도 이어서 진행 가능합니다.');
  };

  return (
    <main className="resume-question-main">
      <div className="resume-header">
        <input className="resume-title" value={title} disabled />
        <div className="button-group-r">
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={
              voucherType === 'FREE' &&
              !questions.every(q => q.is_answered === 1)
            }
          >
            결과 확인
          </button>
          <button className="btn-save" onClick={handleSave}>저장</button>
        </div>
      </div>

      {loading ? (
        <p className="loading">질문을 불러오는 중입니다...</p>
      ) : (
        <div className="question-list">
          {questions.map((q, i) => {
            const isUploaded = q.is_answered === 1;

            return (
              <div className="question-item" key={i}>
                <div className="question-text-r">
                  <span className="play-icon">▶</span>
                  질문 {i + 1}: "{q.content}"
                </div>
                <div className="question-actions">
                  <button
                    className="btn-record"
                    onClick={() => handleNavigateToRecord(i)}
                    disabled={isUploaded}
                  >
                    {isUploaded ? '녹화 완료' : '영상 녹화'}
                  </button>
                </div>
                {isUploaded && (
                  <div className="question-status done">녹화 완료</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default ResumeQuestionPage;
