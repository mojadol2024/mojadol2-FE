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
  const [analysisResults, setAnalysisResults] = useState({});
  const [voucherType, setVoucherType] = useState(null);

  useEffect(() => {
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
  }, [location]);

  const fetchLetterDetail = async () => {
    try {
      const response = await axiosInstance.get(`/mojadol/api/v1/letter/detail/${coverLetterId}`);
      const result = response.data.result;
      setTitle(result.coverLetter?.title || '자소서 제목 없음');
      setVoucherType(result.coverLetter?.useVoucher || 'FREE');
      setQuestions(Array.isArray(result.questions) ? result.questions : []);
      if (result.analysisResults) {
        setAnalysisResults(result.analysisResults);
      }
    } catch (error) {
      console.error('자소서 정보 조회 실패:', error);
      alert('자소서 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (index) => {    {/*ㅇㅕㅇ상첨부*/}
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('video', file);
      formData.append('id', coverLetterId);

      try {
        const response = await axiosInstance.post(
          '/mojadol/api/v1/interview/upload',
          formData
        );

        setVideos((prev) => ({
          ...prev,
          [index]: {
            uploaded: true,
            url: response.data.result.videoUrl,
            interviewId: response.data.result.interviewId,
            confirmed: false,
          },
        }));

        alert('영상이 업로드되었습니다. 확인 후 "확인" 버튼을 눌러주세요.');
      } catch (error) {
        alert('영상 업로드에 실패했습니다.');
        console.error('업로드 오류:', error);
      }
    };

    fileInput.click();
  };

  const handleConfirmVideo = async (index) => {
    try {
      const interviewId = videos[index]?.interviewId;
      if (!interviewId) return alert('영상 정보가 없습니다.');

      const response = await axiosInstance.get(`/mojadol/api/v1/interview/detail/${interviewId}`);
      const result = response.data.result;

      if (result?.tracking) {
        setAnalysisResults((prev) => ({
          ...prev,
          [index]: { exists: true },
        }));
        setVideos((prev) => ({
          ...prev,
          [index]: { ...prev[index], confirmed: true },
        }));
        alert('AI 분석이 완료되었습니다.');
      } else {
        alert('AI 분석이 아직 완료되지 않았습니다.');
      }
    } catch (err) {
      console.error('AI 분석 확인 실패:', err);
      alert('AI 분석 확인 요청에 실패했습니다.');
    }
  };

  const handleDeleteVideo = async (index) => {
    try {
      const interviewId = videos[index]?.interviewId;
      if (!interviewId) return alert('삭제할 영상이 없습니다.');
      await axiosInstance.delete(`/mojadol/api/v1/interview/delete/${interviewId}`);
      setVideos((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setAnalysisResults((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      alert('영상이 삭제되었습니다.');
    } catch (err) {
      console.error('영상 삭제 실패:', err);
    }
  };

  const handleNavigateToRecord = (index) => {
    navigate(`/QuestionConfirmPage?id=${coverLetterId}&q=${index}`, {
      state: { question: questions[index] }
    });
  };

  const handleConfirm = () => {
    if (voucherType === 'FREE') {
      const allAnalyzed = questions.every((_, i) => analysisResults[i]?.exists);
      if (!allAnalyzed) {
        alert('모든 질문에 대해 영상이 등록되어야 결과 확인이 가능합니다.');
        return;
      }
    }
    navigate(`/results/${coverLetterId}`);
  };

  const handleSave = () => {
    alert('저장되었습니다. 이후에도 이어서 진행 가능합니다.');
  };

  return (
    <main className="resume-question-main">
      <div className="resume-header">
        <input className="resume-title" value={title} disabled />
        <div className="button-group-r">
          <button className="btn-confirm" onClick={handleConfirm} disabled={voucherType === 'FREE' && !questions.every((_, i) => analysisResults[i]?.exists)}>결과 확인</button>
          <button className="btn-save" onClick={handleSave}>저장</button>
        </div>
      </div>
      {loading ? (
        <p className="loading">질문을 불러오는 중입니다...</p>
      ) : (
        <div className="question-list">
          {questions.map((q, i) => (
            <div className="question-item" key={i}>
              <div className="question-text-r">
                <span className="play-icon">▶</span>
                질문 {i + 1}: "{q.content}"
              </div>
              <div className="question-actions">
                <button
                  className="btn-record"
                  onClick={() => handleNavigateToRecord(i)}
                  disabled={analysisResults[i]?.exists}
                >영상 녹화</button>
                {videos[i]?.uploaded && !videos[i]?.confirmed && !analysisResults[i]?.exists && (
                  <>
                    <span className="video-preview">첨부됨: {videos[i]?.url.split('/').pop()}</span>
                    <button className="btn-redo" onClick={() => handleDeleteVideo(i)}>재첨부</button>
                    <button className="btn-confirm" onClick={() => handleConfirmVideo(i)}>✓ 확인</button>
                  </>
                )}
              </div>
              {analysisResults[i]?.exists && (
                <div className="question-status done">분석 완료</div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default ResumeQuestionPage;
