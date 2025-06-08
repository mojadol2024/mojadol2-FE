import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RecordingPage.css';

function RecordingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const coverLetterId = location.state?.coverLetterId;
  const questionIndex = location.state?.questionIndex;
  const questions = location.state?.questions || JSON.parse(localStorage.getItem('questions') || '[]');
  const realQuestion = location.state?.question || questions[questionIndex];

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [step, setStep] = useState('ready');
  const [timer, setTimer] = useState(0);
  const [silenceCount, setSilenceCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const maxRecordingSeconds = 300;

  const questionText = realQuestion?.content
    ? `질문 ${parseInt(questionIndex, 10) + 1}: "${realQuestion.content}"`
    : `질문 ${parseInt(questionIndex, 10) + 1}: "질문 내용을 불러올 수 없습니다."`;

  // 📸 카메라 초기화
  useEffect(() => {
    if (!coverLetterId || !realQuestion) {
      alert('잘못된 접근입니다. 다시 질문을 선택해주세요.');
      navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
      return;
    }

    const key = `videoTakes_${coverLetterId}_${questionIndex}`;
    const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');
    if (prevTakes.length >= 3) {
      alert('이 질문에 대해 이미 3개의 녹화를 완료했습니다.');
      navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
        state: {
          coverLetterId,
          questionIndex,
          question: realQuestion,
          questions,
        },
      });
      return;
    }

    const initCamera = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = userStream;
        if (videoRef.current) videoRef.current.srcObject = userStream;
        setCameraReady(true);
      } catch (err) {
        console.error('getUserMedia 실패:', err);
        alert('카메라 또는 마이크 접근 실패. 브라우저 설정을 확인해주세요.');
        navigate(-1);
      }
    };

    initCamera();

    return () => {
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
      video.onloadedmetadata = () => (video.currentTime = 0);
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 240, 240);
        resolve(canvas.toDataURL('image/png'));
      };
      video.onerror = () => resolve(null);
    });
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) {
      alert("카메라가 아직 준비되지 않았습니다. 새로고침 해주세요.");
      return;
    }

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

      const newTake = {
        takeNumber: Date.now(),
        file: blob,
        imageUrl: thumbnail,
      };

      // localStorage에 저장
      const key = `videoTakes_${coverLetterId}_${questionIndex}`;
      const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([...prevTakes, newTake]));

      navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
        state: {
          coverLetterId,
          questionIndex,
          question: realQuestion,
          questions,
          takes: [...prevTakes, newTake],
        },
      });
    };

    mediaRecorder.start();
    setRecording(true);
    monitorSilence(stream);
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
            <button
              className="record-button"
              onClick={() => setStep('countdown')}
              disabled={!cameraReady}
            >
              🎥 시작
            </button>
            {!cameraReady && <p>카메라 준비 중...</p>}
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
