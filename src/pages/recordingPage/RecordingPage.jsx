import React, { useEffect, useRef, useState } from 'react';
import { getAxiosInstance } from '../../lib/axiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';
import './RecordingPage.css';

function RecordingPage() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const streamRef = useRef(null);
  
  // alert 중복 방지를 위한 ref 추가
  const alertShownRef = useRef({
    invalidAccess: false,
    maxTakes: false,
    deviceAccess: false,
    noData: false,
    saveError: false
  });

  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [step, setStep] = useState(location.state?.step || 'ready');
  const [timer, setTimer] = useState(0);
  const [silenceCount, setSilenceCount] = useState(0);
  const [hasHandledStop, setHasHandledStop] = useState(false);
   // 모바일 여부를 판단하는 상태 추가
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const maxRecordingSeconds = 30;
  
  useEffect(() => {
    const axios = getAxiosInstance();
    // 토큰이 있는지 여부만 점검
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
      navigate('/login');
    }
  }, []);

  const handleNavigateBack = () => {
    navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
  };

  // alert를 한 번만 보여주는 헬퍼 함수
  const showAlertOnce = (key, message, callback) => {
    if (!alertShownRef.current[key]) {
      alertShownRef.current[key] = true;
      alert(message);
      if (callback) callback();
    }
  };

  useEffect(() => {
    if (step === 'recording') {
      const handleKeyDown = (e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          stopRecording();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [step]);

  useEffect(() => {
    const incomingQuestions = location.state?.questions;
    if (incomingQuestions && incomingQuestions.length > 0) {
      localStorage.setItem('questions', JSON.stringify(incomingQuestions));
    }
  }, []);

  useEffect(() => {
    // 이미 alert가 표시된 경우 중복 실행 방지
    if (alertShownRef.current.invalidAccess || alertShownRef.current.maxTakes) {
      return;
    }

    if (!coverLetterId || !realQuestion) {
      showAlertOnce('invalidAccess', '잘못된 접근입니다. 다시 질문을 선택해주세요.', () => {
        navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
      });
      return;
    }

    const key = `videoTakes_${coverLetterId}_${questionIndex}`;
    const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');
    if (prevTakes.length >= 3) {
      showAlertOnce('maxTakes', '이 질문에 대한 최대 3개의 녹화가 이미 완료되었습니다.', () => {
        const storedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
        navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
          state: {
            coverLetterId,
            questionIndex,
            question: questionObj,
            questions: questions.length > 0 ? questions : storedQuestions,
          },
        });
      });
      return;
    }

    const checkDevices = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = userStream;
        setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = userStream;
        }, 100);
      } catch (err) {
        console.error('getUserMedia 실패:', err);
        showAlertOnce('deviceAccess', '카메라 또는 마이크에 접근할 수 없습니다.', () => {
          navigate(-1);
        });
      }
    };

    checkDevices();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행되도록 함

  const extractThumbnail = (blob) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(blob);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 0;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 240, 240);
        resolve(canvas.toDataURL('image/png'));
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
        if (hasHandledStop) return;
        setHasHandledStop(true);

        if (typeof coverLetterId === 'undefined' || typeof questionIndex === 'undefined' || !realQuestion) {
          showAlertOnce('saveError', '녹화 데이터를 저장할 수 없습니다. 필수 정보 누락', () => {
          navigate(-1);
        });
          return;
        }

        const blob = new Blob(chunks, { type: 'video/webm' });
        if (blob.size === 0) {
          showAlertOnce('noData', "녹화된 데이터가 없습니다.",() => {
          navigate(-1);
        });
          return;
        }

        const thumbnail = await extractThumbnail(blob);
        const key = `videoTakes_${coverLetterId}_${questionIndex}`;
        const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');
        const newTake = { takeNumber: Date.now(), file: blob, imageUrl: thumbnail };

        localStorage.setItem(key, JSON.stringify([...prevTakes, newTake]));

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
      showAlertOnce('deviceAccess', "카메라 또는 마이크에 접근할 수 없습니다.", () => {
        navigate(-1);
      });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
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
      const silent = buffer.every((val) => Math.abs(val - 128) < 2);
      setSilenceCount((prev) => silent ? prev + 1 : 0);
      setTimer((prev) => {
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
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
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
          <div className="question-confirm-container">
            <h1 className="question-title">{questionText}</h1>
            <div className="confirm-buttons">
              <button className="btn gray" onClick={handleNavigateBack}>질문 재선택</button>
              <button className="btn green" onClick={() => setStep('countdown')}>녹화 시작</button>
              <button className="btn yellow" onClick={() => {
                const storedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
                navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
                  state: {
                    coverLetterId,
                    questionIndex,
                    question: questionObj,
                    questions: questions.length > 0 ? questions : storedQuestions,
                  },
                });
              }}>Take 선택하기</button>
            </div>
            <div className="notice-text">
              <p>카메라, 녹음 권한을 확인하세요.
                <br />녹화 시작 버튼 클릭 시 3초 카운트다운 후 녹화가 시작됩니다.
                <br />제한 시간이 끝나면 자동 종료됩니다.
                <br />직접 종료하려면 종료 버튼 또는 스페이스바를 눌러주세요.</p>
            </div>
          </div>
        )}

        {step === 'countdown' && (
          <div className={`countdown-number ${countdown === 1 ? 'highlight-final' : ''}`}>
            {countdown}
          </div>
        )}

        {step === 'recording' && (
          <>
            <div className="question-text">{questionText}</div>
            <div className="camera-box">
              <video ref={videoRef} autoPlay muted playsInline className="camera-feed" />
              {/* 데스크톱일 때만 타이머 박스가 카메라 안에 위치 */}
              {!isMobile && (
                <div className="timer-box">
                  <button className="recording-stop-button" onClick={stopRecording}></button>
                  <div className="timer-texts">
                    <div className="time-red">{new Date((maxRecordingSeconds - timer) * 1000).toISOString().substr(11, 8)}</div>
                    <div className="time-black">{new Date(timer * 1000).toISOString().substr(11, 8)}</div>
                  </div>
                </div>
              )}
            </div>
            {/* 모바일일 때 타이머 박스가 카메라 박스 밖에 위치 */}
            {isMobile && (
              <div className="timer-box mobile-timer-box">
                <button className="recording-stop-button" onClick={stopRecording}></button>
                <div className="timer-texts">
                  <div className="time-red">{new Date((maxRecordingSeconds - timer) * 1000).toISOString().substr(11, 8)}</div>
                  <div className="time-black">{new Date(timer * 1000).toISOString().substr(11, 8)}</div>
                </div>
              </div>
            )}
            <div className="recording-notice">
              제한 시간이 끝나면 자동 종료됩니다.
              직접 종료하려면 <strong>종료 버튼</strong> 또는 <strong>스페이스바</strong>를 눌러주세요.
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default RecordingPage;