import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import './QuestionConfirmPage.css';

function QuestionConfirmPage() {
  const navigate = useNavigate();
  const [videoInfo, setVideoInfo] = useState(null);

  const location = useLocation();
  const coverLetterId = new URLSearchParams(location.search).get('id');
  const questionIndex = new URLSearchParams(location.search).get('q');
  const questionText = location.state?.question?.content
    ? `질문 ${parseInt(questionIndex, 10) + 1}: "${location.state.question.content}"`
    : `질문 ${parseInt(questionIndex, 10) + 1}: "질문 내용을 불러올 수 없습니다."`;

  const handleNavigateBack = () => {
    navigate(`/ResumeQuestionPage?id=${coverLetterId}`); // 질문 재선택시 이동
  };

  const handleNavigateToRecording = () => {
    navigate(`/RecordingPage?id=${coverLetterId}&q=${questionIndex}`, {
      state: {
        coverLetterId,
        questionIndex,
        question: location.state?.question,
      },
    });
  };

  // // handleVideoUpload
  // const handleVideoUpload = async () => {
  //   const fileInput = document.createElement('input');
  //   fileInput.type = 'file';
  //   fileInput.accept = 'video/*';
  //   fileInput.onchange = async (event) => {
  //     const file = event.target.files[0];
  //     if (!file) return;

  //     const formData = new FormData();
  //     formData.append('video', file);
  //     formData.append('id', Number(coverLetterId));

  //     try {
  //       const response = await axiosInstance.post('/mojadol/api/v1/interview/upload', formData);

  //       // 서버에서 받은 interviewId 등 저장 (이건 상위에서 props로 받아야 할 수도 있음) - 이 코드가 필요한건지 고민해봐야할듯
  //       setVideoInfo({
  //         uploaded: true,
  //         interviewId: response.data.result.interviewId,
  //         url: response.data.result.videoUrl,
  //         confirmed: false,
  //       });

  //       alert('영상이 업로드되었습니다. 아래 확인 버튼을 눌러 AI 분석을 시작하세요.');
  //     } catch (error) {
  //       console.error('업로드 실패:', error.response?.data || error);
  //       alert('영상 업로드 실패');
  //     }
  //   };
  //   fileInput.click();
  // };

  // // handleDeleteVideo
  // const handleDeleteVideo = async () => {
  //   if (!videoInfo?.interviewId) return alert('삭제할 영상이 없습니다.');

  //   try {
  //     await axiosInstance.delete(`/mojadol/api/v1/interview/delete/${videoInfo.interviewId}`);
  //     setVideoInfo(null);
  //     alert('영상이 삭제되었습니다.');
  //   } catch (error) {
  //     console.error('영상 삭제 실패:', error);
  //   }
  // };

  return (
    <div className="question-confirm-container">
      <main className="question-confirm-main">
        <h1 className="question-title">{questionText}</h1>

        <div className="confirm-buttons">
          <button className="btn gray" onClick={handleNavigateBack}>질문 재선택</button>
          <button className="btn green" onClick={handleNavigateToRecording}>녹화 시작</button>
        </div>

        <div className="notice-text">
          <p>답변이 3초 이상 들리지 않으면 자동으로 종료됩니다.</p>
          <p>영상을 첨부할 수 있으니 틀려도 안심하세요.</p>
          <p>카메라, 녹음 권한을 확인하세요.</p>
          <p>확인 불가로 자동 종료가 되면 영상은 종료 전까지 녹화된 분량만 저장됩니다.</p>
          <p>녹화 시작 버튼 클릭 시 3초 카운트다운 후 녹화가 시작됩니다.</p>
        </div>

        {/* <div className="attach-wrapper">
          {!videoInfo?.url && (
            <button className="btn attach" onClick={handleVideoUpload}>영상 첨부</button>
          )}
          {videoInfo?.url && !videoInfo?.confirmed && (
            <>
              <span className="video-preview">첨부됨: {videoInfo.url.split('/').pop()}</span>
              <button className="btn redo" onClick={handleDeleteVideo}>재첨부</button>
            </>
          )}
          {videoInfo?.confirmed && (
            <div className="question-status done">분석 완료</div>
          )}
        </div> */}
      </main>
    </div>
  );
}

export default QuestionConfirmPage;
