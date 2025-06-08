import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RecordingPage.css';

function RecordingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const questionObj = location.state?.question;
  const coverLetterId = location.state?.coverLetterId;
  const questions = location.state?.questions || [];
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
    const streamRef = { current: null };

    if (!coverLetterId || !questionObj) {
      alert('잘못된 접근입니다. 다시 질문을 선택해주세요.');
      navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
      return;
    }

    const checkDevices = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);
        streamRef.current = userStream;

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = userStream;
          }
        }, 100);
      } catch (err) {
        alert("카메라 또는 마이크에 접근할 수 없습니다.");
        navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
      }
    };

    checkDevices();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate, coverLetterId, questionObj]);

  const extractThumbnail = (blob) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(blob);
      video.currentTime = 0;
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 240, 240);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      video.onerror = () => resolve(null);
      video.load();
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
        const thumbnail = await extractThumbnail(blob);

        const newTake = {
          file: blob,
          imageUrl: thumbnail,
        };

        navigate(`/TakeSelect?id=${coverLetterId}&q=${questionIndex}`, {
          state: {
            coverLetterId,
            questionIndex,
            question: questionObj,
            takes: [newTake], // 반드시 전달
            questions,
          },
        });
      };

      mediaRecorder.start();
      setRecording(true);
      monitorSilence(userStream);
    } catch (err) {
      alert('녹화 시작에 실패했습니다.');
      navigate(`/ResumeQuestionPage?id=${coverLetterId}`);
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
