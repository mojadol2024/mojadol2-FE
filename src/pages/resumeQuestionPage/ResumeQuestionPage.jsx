import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAxiosInstance } from '../../lib/axiosInstance';
import './ResumeQuestionPage.css';
import { FaPlay } from 'react-icons/fa';

function ResumeQuestionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const questionIndex = new URLSearchParams(location.search).get('q');

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [videos, setVideos] = useState({});
  const [voucherType, setVoucherType] = useState(null);
  const [letterData, setLetterData] = useState('');
  const [showLetterData, setShowLetterData] = useState(false);

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

    const storageKey = `pdfGenerated_${coverLetterId}`;
    const isPdfAlreadyGenerated = localStorage.getItem(storageKey) === 'true';
    setPdfGenerated(isPdfAlreadyGenerated);

  }, [location, coverLetterId]);

  const fetchLetterDetail = async () => {
    setLoading(true);
    try {
      const axios = getAxiosInstance();
      const response = await axios.get(`/mojadol/api/v1/letter/detail/${coverLetterId}`);
      const result = response.data.result;

      setTitle(result.coverLetter?.title || '자소서 제목 없음');
      setVoucherType(result.coverLetter?.useVoucher || 'FREE');
      setQuestions(Array.isArray(result.questions) ? result.questions : []);
      setLetterData(result.coverLetter?.data || '');
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
      navigate(`/RecordingPage?id=${coverLetterId}&q=${index}`, {
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
        <div className="resume-title">{title}</div>
        <div className="button-group-r">
          <button
            className="btn-view-data"
            onClick={() => setShowLetterData(prev => !prev)}
          >
            {showLetterData ? '본문 닫기' : '본문 보기'}
          </button>
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={(voucherType === 'FREE' && !questions.every(q => q.is_answered === 1)) ||
                      (voucherType === 'GOLD' && !questions.some(q => q.is_answered === 1))}
          >
            결과 확인
          </button>
          <button className="btn-save" onClick={handleSave}>저장</button>
        </div>
      </div>

      {loading ? (
        <div>
                <div className="loading-state-container">
                    <div className="spinner"></div>
                    <p className="loading-message">데이터를 불러오는 중입니다...</p>
                </div>
            </div>
      ) : (
        <>
        {showLetterData && letterData && (
          <div className="letter-data-box">
            <pre className="letter-data-content">{letterData}</pre>
          </div>
        )} 
        <div className="question-list">
          {questions.map((q, i) => {
            const isUploaded = q.is_answered === 1;
            return (
              <div className="question-item" key={i}>
                <div className="question-text-r">
                  <span className="play-icon"><FaPlay /></span>
                  질문 {i + 1}: "{q.content}"
                </div>
                <div className="question-actions">
                  <button
                    className="btn-record"
                    onClick={() => handleNavigateToRecord(i)}
                    disabled={isUploaded || pdfGenerated}
                  >
                    {isUploaded ? '녹화 완료' : '영상 녹화'}
                  </button>
                </div>
                {/*{isUploaded && ( 이부분아예필요없다 영상첨부완료버튼 그런거같음 지워야돼돼
                  <div className="question-status done">녹화 완료</div>
                )}*/}
                
              </div>
            );
          })}
        </div>
        </>
      )}
    </main>
  );
}

export default ResumeQuestionPage;