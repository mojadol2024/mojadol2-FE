import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RecordingPage.css';

function RecordingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const questionObj = location.state?.question;
  const coverLetterId = location.state?.coverLetterId;
  const questions = location.state?.questions || JSON.parse(localStorage.getItem('questions') || '[]');
  const questionIndex = location.state?.questionIndex;

  const questionText = questionObj?.content
    ? `질문 ${parseInt(questionIndex, 10) + 1}: "${questionObj.content}"`
    : `질문 ${parseInt(questionIndex, 10) + 1}: "질문 내용을 불러올 수 없습니다."`;

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [step, setStep] = useState('ready');
  const [timer, setTimer] = useState(0);
  const [silenceCount, setSilenceCount] = useState(0);
  const maxRecordingSeconds = 5;

  useEffect(() => {
    if (!coverLetterId || !questionObj) {
      alert('잘못된 접근입니다. 다시 질문을 선택해주세요.');
      navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
      return;
    }

    const key = `videoTakes_${coverLetterId}_${questionIndex}`;
    const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');
    if (prevTakes.length >= 3) {
      alert('이 질문에 대한 최대 3개의 녹화가 이미 완료되었습니다.');
      navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
        state: { coverLetterId, questionIndex, question: questionObj, questions },
      });
      return;
    }

    const checkDevices = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);
        if (videoRef.current) videoRef.current.srcObject = userStream;
      } catch (err) {
        console.error('getUserMedia 실패:', err);
        alert('카메라 또는 마이크 접근 실패. 브라우저 설정을 확인해주세요.');
        navigate(-1);
      }
    };

    checkDevices();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [navigate, coverLetterId, questionObj, questionIndex]);

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

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // base64 string
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(userStream);
      videoRef.current.srcObject = userStream;

      const mediaRecorder = new MediaRecorder(userStream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const base64 = await blobToBase64(blob); // ✅ base64 변환
        const thumbnail = await extractThumbnail(blob);

        const newTake = {
          takeNumber: Date.now(),
          file: base64, // ✅ base64로 저장
          imageUrl: thumbnail,
        };

        const key = `videoTakes_${coverLetterId}_${questionIndex}`;
        const prevTakes = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([...prevTakes, newTake]));

        navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
          state: { coverLetterId, questionIndex, question: questionObj, questions },
        });
      };

      mediaRecorder.start();
      setRecording(true);
      monitorSilence(userStream);
    } catch (err) {
      console.error('녹화 시작 실패:', err);
      alert('녹화를 시작할 수 없습니다.');
      navigate(-1);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    stream?.getTracks().forEach(track => track.stop());
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
      startRecording();
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
