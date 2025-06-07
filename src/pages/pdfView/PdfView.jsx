import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import './PdfView.css'; // ✅ 스타일 import

function PdfView() {
  const { coverLetterId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const res = await axiosInstance.post(
          `/mojadol/api/v1/pdf/create/${coverLetterId}`,
          {},
          { responseType: 'blob' }
        );

        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('PDF 불러오기 실패:', error);
        const status = error.response?.status;
        if (status === 400 || status === 404) {
          alert('결과지가 아직 생성되지 않았습니다.');
        } else {
          alert('결과지를 불러오는 데 실패했습니다.');
        }
        navigate(-1);
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
      <h2>📄 면접 결과 리포트</h2>

      {pdfUrl ? (
        <>
          <iframe
            src={pdfUrl}
            title="결과 리포트"
            className="pdf-frame"
          />
          <br />
          <a
            href={pdfUrl}
            download={`면접_결과지_${coverLetterId}.pdf`}
            className="download-button"
          >
            📥 결과지 다운로드
          </a>
        </>
      ) : (
        <p>결과지를 불러오는 중입니다...</p>
      )}
    </div>
  );
}

export default PdfView;
