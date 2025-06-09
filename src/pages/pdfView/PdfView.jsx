import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import './PdfView.css'; // ✅ 스타일 import
import { FiDownload } from 'react-icons/fi';

function PdfView() {
  const { coverLetterId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      console.log('📦 accessToken:', localStorage.getItem('accessToken'));
      console.log("📌 coverLetterId:", coverLetterId);

      try {
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
      <div className="pdf-header"> {/* 제목과 버튼을 위한 새로운 div */}
        <h2>면접 결과 리포트</h2>
        {pdfUrl && ( // pdfUrl이 있을 때만 다운로드 버튼 표시
          <a
            href={pdfUrl}
            download={`면접_결과지_${coverLetterId}.pdf`}
            className="download-button-p"
          >
            <FiDownload className="download-icon" /> 결과지 다운로드
          </a>
        )}
      </div>

      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="결과 리포트"
          className="pdf-frame"
        />
      ) : (
        <p>결과지를 불러오는 중입니다...</p>
      )}
    </div>
  );
}

export default PdfView;
