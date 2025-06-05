// 면접 질문별 영상 업로드 및 분석 상태 관리 페이지 
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import './ResumeQuestionPage.css';

function ResumeQuestionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [videos, setVideos] = useState({}); // { index: { uploaded: boolean, url: string } }
  const [analysisResults, setAnalysisResults] = useState({}); // { index: { exists: true } }
  const [voucherType, setVoucherType] = useState(null); // 'FREE' or 'GOLD' 사용자 선택에 따라 달라짐
  const [pendingAI, setPendingAI] = useState({}); // { index: boolean }

  useEffect(() => {
    fetchCoverLetter();
    fetchQuestions();
  }, []);

  const fetchCoverLetter = async () => {
    try {
      const response = await axiosInstance.get(`/mojadol/api/v1/letter/detail/${coverLetterId}`);
      setTitle(response.data.result.title || '자소서 제목 없음');
      setVoucherType(response.data.result.voucherType); // 백엔드에서 받은 'FREE' 또는 'GOLD'
    } catch (error) {
      console.error('자소서 정보 조회 실패:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axiosInstance.get(`/mojadol/api/v1/letter/question-list/${coverLetterId}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('질문 불러오기 실패:', error);
      alert('질문 리스트를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (index) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.onchange = async (event) => { // 영상 첨부 버튼을 클릭하면 실행되는 핸들러 - 자동 실행
      const file = event.target.files[0]; // 파일 하나만 처리
      if (!file) return; // 파일 선택 안되면 바로 return
      const formData = new FormData(); // multipart/form-data 파일 형식으로 받을 준비
      formData.append('video', file);
      formData.append('id', coverLetterId);
      try {
        const response = await axiosInstance.post('/mojadol/api/v1/interview/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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
        alert('영상 업로드 실패');
        console.error(error);
      }
    };
    fileInput.click(); // 브라우저가 바로 파일 탐색기를 엶
  };

  const handleConfirmVideo = async (index) => {
    try {
      const interviewId = videos[index]?.interviewId;
      if (!interviewId) return alert('영상 정보가 없습니다.');
      
      // AI 분석 결과가 준비될 때까지 polling
      const maxRetries = 10;
      const intervalMs = 2000;
      let retryCount = 0;
      let isReady = false;

      // 폴링 시작 전 사용자에게 알림
      alert('AI 분석 중입니다. 잠시만 기다려주세요...');

      while (retryCount < maxRetries && !isReady) {
        try {
          const res = await axiosInstance.get(`/mojadol/api/v1/interview/detail/${interviewId}`);
          const result = res.data.result;

          // 영상 분석 완료 시 처리 로직
          if (result?.tracking?.text) {
            isReady = true;

            // 1. UI 상태 업데이트
            setAnalysisResults((prev) => ({
              ...prev,
              [index]: { exists: true },
            }));
            setVideos((prev) => ({
              ...prev,
              [index]: { ...prev[index], confirmed: true },
            }));

            // 2. 서버에 녹화 완료 상태 반영
            try {
              await axiosInstance.patch(`/mojadol/api/v1/interview/detail/${interviewId}`, {
                isRecorded: true,
              });
              alert('AI 분석이 완료되었습니다.');
            } catch (err) {
              console.error('녹화 상태 업데이트 실패:', err);
              alert('분석은 완료되었으나 서버 상태 업데이트에 실패했습니다.');
            }
            break;
          }

          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
          }
        } catch (pollError) {
          console.error(`폴링 ${retryCount + 1}차 시도 실패:`, pollError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
          }
        }
      }

      // 최대 재시도 횟수 초과 시
      if (!isReady) {
        alert('AI 분석이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
      }

    } catch (error) {
      console.error('영상 확인 처리 중 오류:', error);
      alert('영상 확인 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteVideo = async (index) => {
    try {
      const interviewId = videos[index]?.interviewId;
      if (!interviewId) return alert('삭제할 영상이 없습니다.');
      await axiosInstance.delete(`/mojadol/api/v1/interview/delete/${interviewId}`); //영상 삭제 후 재선택 기회
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

  const handleConfirm = async () => {
    if (voucherType === 'FREE') {
      const allAnalyzed = questions.every((_, i) => analysisResults[i]?.exists); // 모든 영상이 있는지를 확인하는 게 아니라, 그 영상이나 녹화를 기반으로 한 결과지가 db에 누적돼서 생성되고 있는지, 그에 대한 결과를 확인할거임
      if (!allAnalyzed) {
        alert('모든 질문에 대해 영상이 등록되어야 결과 확인이 가능합니다.');
        return;
      }
    }
    navigate(`/results/${coverLetterId}`); // 결과 확인 버튼을 누르면 pdf나 결과 페이지로 넘어가야 함 - 여기서 db 속에 저장된 내용을 불러오는 api가 필요할 것 같음
  };

  const handleSave = async () => {
    alert('저장되었습니다. 이후에도 이어서 진행 가능합니다.'); // 그냥 ux 보기 편하게 하는 것 | 결과지는 db에 저장이 될 거기 때문에 프론트에서 저장 요청 안 해도 이미 저장되어 있을 것임. -> 결과 확인 필요할 때, 전체 get하기(api)
  }

  return (


    <main className="resume-question-main">
      <div className="resume-header">
        <input className="resume-title" value={title} disabled />
        <div className="button-group">
          <button className="btn confirm" onClick={handleConfirm}>결과 확인</button>
          <button className="btn save" onClick={handleSave}>저장</button>
        </div>
      </div>
    {loading ? (
      <p style={{ textAlign: 'center', fontSize: '16px', padding: '40px' }}>
        질문을 불러오는 중입니다... ⏳
      </p>
    ) : (
      <div className="question-list">
        {questions.map((q, i) => (
          <div className="question-item" key={i}>
            <div className="question-text">
              <span className="play-icon">▶</span>
              질문 {i + 1}: "{q}"
            </div>
            <div className="question-actions">
              <button
                className="btn attach"
                onClick={() => handleVideoUpload(i)}
                disabled={analysisResults[i]?.exists}
              >📷 영상 첨부</button>
              <button
                className="btn record"
                onClick={() => handleNavigateToRecord(i)}
                disabled={analysisResults[i]?.exists}
              >⏺ 영상 녹화</button>
              {videos[i]?.uploaded && !videos[i]?.confirmed && !analysisResults[i]?.exists && (
                <>
                  <span className="video-preview">첨부됨: {videos[i]?.url.split('/').pop()}</span>
                  <button className="btn confirm" onClick={() => handleConfirmVideo(i)}>✓ 확인</button>
                  <button className="btn redo" onClick={() => handleDeleteVideo(i)}>재첨부</button>
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
