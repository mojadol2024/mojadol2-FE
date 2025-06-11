import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import './PdfView.css'; // ✅ 스타일 import
import { FiDownload } from 'react-icons/fi';

function PdfView() {
  const { coverLetterId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      console.log('📦 accessToken:', localStorage.getItem('accessToken'));
      console.log("📌 coverLetterId:", coverLetterId);

      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/mojadol/api/v1/pdf/create/${coverLetterId}`,
          { responseType: 'blob' }
        );

        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        // ✅ 최초 생성 성공 시에만 저장 (이미 저장된 경우는 덮어쓰기 X)
        const storageKey = `pdfGenerated_${coverLetterId}`;
        if (!localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, 'true');
          console.log('✅ 결과지 생성 상태 저장 완료:', storageKey);
        }
        
      } catch (error) {
        console.error('PDF 불러오기 실패:', error);
        const status = error.response?.status;
        if (status === 400 || status === 404) {
          alert('결과지가 아직 생성되지 않았습니다.');
        } else {
          alert('결과지를 불러오는 데 실패했습니다.');
        }
        navigate('/InterviewMain');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [coverLetterId]);

  return (
    <div className="pdf-view-container">
      <div className="pdf-header">
        <h2>면접 결과 리포트</h2>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={`면접_결과지_${coverLetterId}.pdf`}
            className="download-button-p"
          >
            <FiDownload className="download-icon" /> 결과지 다운로드
          </a>
        )}
      </div>

      {loading ? ( // ✅ 로딩 상태에 따라 조건부 렌더링
        <div className="loading-state-container">
          <div className="spinner"></div>
          <p className="loading-message">결과지를 불러오는 중입니다...</p>
        </div>
      ) : pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="결과 리포트"
          className="pdf-frame"
        />
      ) : (
        // 로딩이 끝났지만 pdfUrl이 없는 경우 (예: 에러 발생 후 navigate 되기 전)
        <p className="loading-message">결과지를 불러오는 데 실패했습니다.</p> 
      )}
    </div>
  );
}

export default PdfView;
