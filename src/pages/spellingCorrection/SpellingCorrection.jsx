// src/pages/SelfIntroRegister.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import './SpellingCorrection.css';

function SelfIntroRegister() {
  const [title, setTitle] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionResult, setCorrectionResult] = useState(null);
  const [voucherType, setVoucherType] = useState('FREE'); // 기본값은 FREE
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [freeVouchers, setFreeVouchers] = useState([]);
  const [goldVouchers, setGoldVouchers] = useState([]);

  useEffect(() => {
    fetchVoucherList();
  }, []);

  const navigate = useNavigate();
  const sanitizeText = (text) => {
    return text
      .replace(/\uFEFF/g, '')  // BOM 제거
      .replace(/\u200B/g, '')  // zero-width space 제거
      .trim();                 // 앞뒤 공백 제거
  };

  const handleSaveClick = () => {
    setShowVoucherModal(true); // 모달 표시
  };

  const handleVoucherChoice = (type) => {
    if (type === 'FREE' && freeVouchers.length === 0) {
      alert("FREE 이용권이 없습니다. GOLD 이용권을 사용하거나 결제해주세요.");
      return;
    }
    if (type === 'GOLD' && goldVouchers.length === 0) {
      alert("GOLD 이용권이 없습니다. 결제 페이지로 이동합니다.");
      navigate('/payment'); // 결제 페이지 경로
      return;
    }
    setVoucherType(type);
  };

  const handleVoucherConfirm = async () => {
    setShowVoucherModal(false); // 모달 닫기
    await handleSaveCoverLetter(); // 실제 저장
  };
  
  const fetchVoucherList = async () => {
    try {
      const res = await axiosInstance.get('/mojadol/api/v1/payment/list?page=0&size=9');
      const list = res.data.result.content;

      const now = new Date();
      const validFree = list.filter(item => 
        item.voucher.type === 'FREE' &&
        new Date(item.voucher.expiredAt) > now &&
        item.voucher.totalCount > 0
      ).sort((a, b) => new Date(a.voucher.expiredAt) - new Date(b.voucher.expiredAt));

      const validGold = list.filter(item =>
        item.voucher.type === 'GOLD' &&
        new Date(item.voucher.expiredAt) > now &&
        item.voucher.totalCount > 0
      ).sort((a, b) => new Date(a.voucher.expiredAt) - new Date(b.voucher.expiredAt));

      setFreeVouchers(validFree);
      setGoldVouchers(validGold);
    } catch (e) {
      console.error('이용권 불러오기 실패', e);
    }
  };
  
  // 맞춤법 검사 API 호출
  const handleSpellCheck = async () => {
    const organizedText = sanitizeText(originalText);

    if (organizedText.length > 1200) {
      alert("맞춤법 검사는 1200자까지만 가능합니다.\n나눠서 검사하거나 원본 그대로 저장하실 수 있습니다.");
      return; // 여기서 중단
    }
    try {
      const response = await axiosInstance.post(
        '/mojadol/api/v1/letter/spell-checker',
        { data: organizedText }
      );
      setCorrectionResult(response.data.result); // 한 번에 저장
      setCorrectedText(response.data.result.notag_html); // 저장용 텍스트도 별도 보관
      setShowCorrection(true);
    } catch (error) {
      console.error('맞춤법 검사 오류:', error);
      alert('맞춤법 검사에 실패했습니다.');
    }
  };

  const waitForQuestions = async (id, timeout = 240000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const res = await axiosInstance.get(`/mojadol/api/v1/letter/detail/${id}`);
        if (Array.isArray(res.data.result.questions) && res.data.result.questions.length > 0) {
          return true; // 질문 생성 완료
        }
      } catch (e) {
        // 무시하고 재시도
      }
      await new Promise(r => setTimeout(r, 2000)); // 1.5초마다 확인
    }
    return false; // 타임아웃
  };

  // 자소서 저장 API 호출
  const handleSaveCoverLetter = async () => {
    if (!title.trim()) {
      alert("자소서 제목을 작성해주세요.");
      return;
    }

    if (!showCorrection) {
      const confirmContinue = window.confirm(
        "맞춤법 검사를 하지 않았습니다. 원본 자소서를 그대로 사용하시겠습니까?"
      );
      if (!confirmContinue) return;
    }

    try {
      const cleanedText = originalText;

      if (!cleanedText) {
        alert("내용이 비어있어 저장할 수 없습니다.");
        return;
      }      

      if (cleanedText.length > 1200) {
        alert("자소서는 최대 1200자까지만 저장할 수 있습니다. 내용을 줄여주세요.");
        return;
      }

      const response = await axiosInstance.post(
        '/mojadol/api/v1/letter/write',
        {
          title,
          data: originalText,
          useVoucher: voucherType,
        }
      );
      const savedId = response.data.result.coverLetterId; // ✅ 이렇게 수정
      alert('자소서가 저장되었습니다. 질문 생성을 기다리는 중입니다...'); // 나중에 자소서가 저장됨과 동시에 뜨는 거라 애매하네..

      const success = await waitForQuestions(savedId);
      if (!success) {
        alert('질문 생성에 실패했거나 시간이 초과되었습니다. 나중에 다시 시도해주세요.');
        return;
      }
      // 🔽 ✅ 메인 페이지가 새 자소서를 반영하도록 플래그 저장
      localStorage.setItem("shouldRefreshMainList", "true");

      // ✅ 질문 생성이 완료되면 이동
      navigate(`/ResumeQuestionPage?id=${savedId}`);
      
    } catch (error) {
      console.error('자소서 저장 오류:', error);
      alert('자소서 저장에 실패했습니다.');
    }
  };

  return (
    <div className="register-page">
      <h2>자소서 등록 및 맞춤법 검사</h2>
      <input
        type="text"
        placeholder="자소서 제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        
      />

      <div className="editor-section">
        <div className="editor-box">
          <h4>원본 자소서</h4>
            <textarea
              placeholder="자소서를 입력하세요"
              value={originalText}
              onChange={(e) => {
                const text = e.target.value;
                if (text.length <= 3000) {
                  setOriginalText(text);
                } else {
                  alert("자소서는 최대 1200자까지만 입력 가능합니다.");
                }
              }}
            />
            {/* ✅ 글자 수 표시 */}
            <p style={{ fontSize: '13.5px',color:'red', marginTop: '8px' }}>
              ※ 맞춤법 검사는 1200자까지만 가능하며, 실제 저장은 원본 자소서를 기준으로 합니다.
            </p>            
            <p style={{ fontSize: '13px'}}>
              글자 수: {sanitizeText(originalText).length} / 3000자
            </p>
            {originalText.length > 1200 && (
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                ⚠ 자소서가 1200자를 초과하여 저장이 불가능합니다.
              </p>
            )}
        </div>

        {correctionResult && (
          <>
            <div className="editor-box" style={{ marginLeft: '35px'}}>
            <h4>교정 결과</h4>
            <div
                className="correction-html-box"
                dangerouslySetInnerHTML={{ __html: correctionResult.origin_html }}
            />
            </div>

            <div className="editor-box">
                <h4>교정 결과 (색상 포함)</h4>
                <div
                    className="correction-html-box"
                    dangerouslySetInnerHTML={{ __html: correctionResult.html }}
                />
                <p className="correction-guide">
                    <span className="red_text">빨간색 오류 = 맞춤법</span><br />
                    <span className="blue_text">파란색 = 통계적 교정</span><br />
                    <span className="green_text">초록색 = 띄어쓰기</span><br />
                    <span className="purple_text">보라색 = 표준어 의심</span>
                </p>
            </div>

            <div className="editor-box">
              <h4>교정된 문장 (참고용)</h4>
              <textarea
                value={correctionResult.notag_html.replace(/<br\s*\/?>/gi, '\n')}
                readOnly
              />
              <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                ※ 이 내용은 참고용입니다.<br></br> 실제 저장은 원본 자소서를 기준으로 합니다.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="button-section">
        <button onClick={handleSpellCheck}>맞춤법 검사</button>
        <button onClick={handleSaveClick}>문서 평가 및 질문 생성</button>
      </div>

      {showVoucherModal && (
        <div className="voucher-modal">
          <div className="voucher-modal-content">
            <p>사용할 이용권을 선택하세요.</p>
            <div className="radio-group-container"> 
              <label className="radio-label">
                <input
                  type="radio"
                  name="voucher"
                  value="FREE"
                  checked={voucherType === 'FREE'}
                  onChange={(e) => handleVoucherChoice(e.target.value)}
                />
                FREE 이용권
              </label>
              <br />
              <label className="radio-label">
                <input
                  type="radio"
                  name="voucher"
                  value="GOLD"
                  checked={voucherType === 'GOLD'}
                  onChange={(e) => handleVoucherChoice(e.target.value)}
                />
                GOLD 이용권
              </label>
            </div>
            <br />
            <p style={{ fontWeight: 'bold' }}>
              현재 "{voucherType === 'FREE' ? 'FREE 이용권' : 'GOLD 이용권'}"을 선택하셨습니다.<br />
              이대로 진행하시겠습니까?
            </p>
            <button className="voucher-modal-b" onClick={handleVoucherConfirm}>확인</button>
            <button className="voucher-modal-c" onClick={() => setShowVoucherModal(false)} style={{ marginLeft: '10px' }}>
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelfIntroRegister;