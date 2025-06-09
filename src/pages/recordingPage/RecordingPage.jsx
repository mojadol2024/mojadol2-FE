import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RecordingPage.css';

function RecordingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const incomingQuestions = location.state?.questions;
    const storedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');

    if (incomingQuestions && incomingQuestions.length > 0) {
      console.log('📦 RecordingPage에서 전달된 questions:', incomingQuestions);
      localStorage.setItem('questions', JSON.stringify(incomingQuestions));
    } else if (storedQuestions.length > 0) {
      console.log('📦 RecordingPage: localStorage fallback 사용');
    } else {
      console.warn('❌ RecordingPage: 질문 리스트 없음!');
    }
  }, []);
  
  const questionObj = location.state?.question;
  const coverLetterId = location.state?.coverLetterId;
  const questions = location.state?.questions || [];
  const questionIndex = location.state?.questionIndex;
  const prevTakes = location.state?.takes || [];

  const realQuestion = questions[questionIndex];
  const questionText = realQuestion?.content
    ? `질문 ${parseInt(questionIndex, 10) + 1}: "${realQuestion.content}"`
    : `질문 ${parseInt(questionIndex, 10) + 1}: "질문 내용을 불러올 수 없습니다."`;

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null); // ✅ stream을 ref로 관리
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [step, setStep] = useState('ready');
  const [timer, setTimer] = useState(0);
  const [silenceCount, setSilenceCount] = useState(0);
  const maxRecordingSeconds = 30;

  useEffect(() => {
    if (!coverLetterId || !realQuestion) {
      alert('잘못된 접근입니다. 다시 질문을 선택해주세요.');
      navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
      return;
    }
    const key = `videoTakes_${coverLetterId}_${questionIndex}`;
    const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');
    if (prevTakes.length >= 3) {
      const storedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');

      console.log("📦 questions from state:", questions);
      console.log("🗃️ questions from localStorage:", storedQuestions);
      console.log("➡️ TakeSelect로 navigate 시 전달할 questions:", questions.length > 0 ? questions : storedQuestions);

      alert('이 질문에 대한 최대 3개의 녹화가 이미 완료되었습니다.');

      navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
        state: {
          coverLetterId,
          questionIndex,
          question: questionObj,
          questions: questions.length > 0 ? questions : storedQuestions,  // ✅ fallback 처리까지
        },
      });

      return;
    }
    const checkDevices = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = userStream;

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = userStream;
          } else {
            console.warn('videoRef가 아직 렌더되지 않았습니다.');
          }
        }, 100);
      } catch (err) {
        console.error('getUserMedia 실패:', err);
        alert('카메라 또는 마이크에 접근할 수 없습니다.\n브라우저 설정 또는 장치를 확인해주세요.');
        navigate(-1);
      }
    };

    checkDevices(); // ✅ 여기서 한 번만 호출

    return () => {
      // ✅ 페이지 떠날 때 마이크/카메라 스트림 정지
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const extractThumbnail = (blob) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(blob);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = 0; // 영상 시작 시점으로 이동
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, 240, 240);
      const base64 = canvas.toDataURL('image/png');
      resolve(base64);
    };

    video.onerror = () => {
      console.error("❌ 썸네일 생성 실패");
      resolve(null);
    };
  });
};

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!stream) {
        alert("카메라 스트림이 없습니다. 새로고침 해주세요.");
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });

        if (blob.size === 0) {
          alert("녹화된 데이터가 없습니다. 다시 시도해주세요.");
          return;
        }

        const thumbnail = await extractThumbnail(blob);
        const key = `videoTakes_${coverLetterId}_${questionIndex}`;
        const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');

        const newTake = {
          takeNumber: Date.now(),
          file: blob,
          imageUrl: thumbnail,
        };

        localStorage.setItem(key, JSON.stringify([...prevTakes, newTake]));

        if (!coverLetterId || !questionIndex) {
          alert('녹화 데이터를 저장할 수 없습니다. 필수 정보 누락');
          return;
        }

        navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
          state: {
            coverLetterId,
            questionIndex,
            question: {
              id: realQuestion?.questionId,
              content: realQuestion?.content,
            },
            questions,
            takes: [...prevTakes, newTake],
          },
        });
      };

      mediaRecorder.start();
      setRecording(true);
      monitorSilence(stream);
    } catch (err) {
      console.error('카메라/마이크 접근 실패', err);
      alert("카메라 또는 마이크에 접근할 수 없습니다. 권한을 허용했는지 확인해주세요.");
      navigate(-1);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  const monitorSilence = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 2048;
    const buffer = new Uint8Array(analyser.fftSize);

    const interval = setInterval(() => {
      analyser.getByteTimeDomainData(buffer);
      const silent = buffer.every(val => Math.abs(val - 128) < 2);
      setSilenceCount(prev => silent ? prev + 1 : 0);
      setTimer(prev => {
        const next = prev + 1;
        if (next >= maxRecordingSeconds || silenceCount >= 3) {
          clearInterval(interval);
          stopRecording();
        }
        return next;
      });
    }, 1000);
  };
  
  useEffect(() => {
    if (step === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'countdown' && countdown === 0) {
      setStep('recording');
      setTimeout(() => {
        startRecording();
      }, 200);
    }
  }, [step, countdown]);

  return (
    <div className="recording-layout">
      <main className="recording-main">
        {step === 'ready' && (
          <div className="recorder-header">
            <button className="record-button" onClick={() => setStep('countdown')}>🎥 시작</button>
          </div>
        )}

        {step === 'countdown' && <div className="countdown-number">{countdown}</div>}

        {step === 'recording' && (
          <>
            <div className="recording-top-bar">
              <div className="question-text">{questionText}</div>

              <div className="timer-box">
                <button className="recording-stop-button" onClick={stopRecording}>⏹</button>
                <div className="timer-texts">
                  <div className="time-red">{new Date((maxRecordingSeconds - timer) * 1000).toISOString().substr(11, 8)}</div>
                  <div className="time-black">{new Date(timer * 1000).toISOString().substr(11, 8)}</div>
                </div>
              </div>
            </div>

            <div className="camera-box">
              <video ref={videoRef} autoPlay muted playsInline className="camera-feed" />
            </div>

            <div className="recording-notice">
              제한 시간이 끝나거나 소리가 3초 이상 녹음되지 않으면 자동 종료됩니다.
              직접 종료하려면 종료 버튼을 눌러주세요.
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default RecordingPage;