import React, { useState, useEffect } from 'react';
import './Payment.css';

const API_BASE_URL = 'https://myeonjub.store/api';

async function fetchPaymentData(page = 0, size = 10) {
  const accessToken = localStorage.getItem('accessToken');
  const apiUrl = `${API_BASE_URL}/mojadol/api/v1/payment/list?page=${page}&size=${size}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('결제 내역 API 요청 실패:', errorData);
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('결제 내역 API 호출 중 오류 발생:', error);
    return null;
  }
}

async function fetchSubscriptionData() {
  // TODO: 실제 구독 정보 API 호출 로직 구현 (API 명세가 아직 없습니다.)
  return [
    { content: '무료 이용권', usage: 0, expiry: '2022-01-31', free: 0 },
    { content: '유료 이용권', usage: 0, expiry: '2022-02-02', free: 1 },
    { content: '무료 이용권', usage: 1, expiry: '2023-03-03', free: 0 },
    { content: '공짜이용권', usage: 2, expiry: '2022-02-02', free: 0 },
    { content: '이용권(유료)', usage: 4, expiry: '2023-03-03', free: 1 },
  ];
}

async function requestPayment() {
  const accessToken = localStorage.getItem('accessToken');
  const apiUrl = `${API_BASE_URL}/mojadol/api/v1/payment/pay`;
  const paymentAmount = 9900; // 결제 금액 (일단 하드코딩)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify({ amount: paymentAmount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('결제 요청 실패:', errorData);
      alert(`결제 요청 실패: ${errorData.message || response.statusText}`);
      throw new Error(`결제 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('결제 요청 성공:', data);
    // TODO: 서버에서 결제창 URL을 받아서 리다이렉트 처리
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      alert('결제 요청 성공. 결제창 URL을 받지 못했습니다.');
    }
  } catch (error) {
    console.error('결제 요청 중 오류 발생:', error);
    alert(`결제 요청 중 오류 발생: ${error.message}`);
  }
}

function Payment() {
  const [currentPage, setCurrentPage] = useState(0);
  const [paymentsPerPage] = useState(9);
  const [paymentHistoryData, setPaymentHistoryData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const paymentResult = await fetchPaymentData(currentPage, paymentsPerPage);
        const subscriptionResult = await fetchSubscriptionData();

        if (paymentResult) {
          setPaymentHistoryData(paymentResult.content || []);
          setTotalElements(paymentResult.totalElements || 0);
        }

        if (subscriptionResult) {
          setSubscriptionData(subscriptionResult);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentPage, paymentsPerPage]);

  const freeSubscriptionsCount = subscriptionData.filter(sub => sub.free === 0).reduce((sum, sub) => sum + sub.usage, 0);
  const paidSubscriptionsCount = subscriptionData.filter(sub => sub.free === 1).reduce((sum, sub) => sum + sub.usage, 0);

  const totalPages = Math.ceil(totalElements / paymentsPerPage);
  const getPageNumbers = () => {
    const pageNumbers = [];
    const pagesToShow = 3;
    let startPage = Math.max(0, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages - 1, currentPage + Math.floor(pagesToShow / 2));

    if (totalPages <= pagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => setCurrentPage(0);
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const handleShowInfoPopup = () => {
    setShowInfoPopup(true);
  };

  const handleCloseInfoPopup = () => {
    setShowInfoPopup(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const indexOfLastPayment = (currentPage + 1) * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = paymentHistoryData.slice(indexOfFirstPayment, indexOfLastPayment);

  return (
    <div className="payment-container">
      {/* 상단 제목 및 구매 버튼 */}
      <div className="payment-header">
        <h1>이용권 관리</h1>
        <div className="button-group">
          <button className="buy-info-button" onClick={handleShowInfoPopup}>이용권 안내</button>
          <button className="buy-ticket-button" onClick={requestPayment}>이용권 구매</button> {/* 클릭 이벤트 핸들러 추가 */}
        </div>
      </div>

      {/* 이용권 안내내 팝업 */}
      {showInfoPopup && (
        <div className="info-popup-overlay">
          <div className="info-popup">
            <h2>이용권 안내</h2>
            <div className="info-popup-content">
              <p>이용권 1개 - 1회 사용 가능</p>
              <p>이용권 10개 묶음 - 9,900원\n이거되나?안되네요요<br />아 br을 쓰면되는구나~! <br />와신기해~</p>
              <p>이용권 1개 - 1회 사용 가능</p>
              <p>이용권 1개 - 1회 사용 가능<br />어쩌구어쩌구어쩌구어쩌구어쩌구<br />어쩌구어쩌구어쩌구어쩌구어쩌구<br />어쩌구어쩌구어쩌구어쩌구어쩌구<br />어쩌구어쩌구어쩌구어쩌구어쩌구<br />어쩌구어쩌구어쩌구어쩌구어쩌구<br />어쩌구어쩌구어쩌구어쩌구어쩌구</p>
              <p>이용권 안내문구가 너무길면어떻게될지보려고요<br />내용이 길어도 팝업창은 화면의 80%만 채우고<br />내용만 따로 스크롤 가능하게 했어요<br />스크롤바때문에 밀려서 글자 가운데정렬이 안돼요<br />패딩으로 최대한 맞췄는데 좀 치우친거같네요<br />와대박천재이우림짱짱ㅋㅋ<br />이우림최고!!</p>
            </div>
            <button onClick={handleCloseInfoPopup}>닫기</button>
          </div>
        </div>
      )}

      {/* 현재 이용권 정보 */}
      <div className="subscription-info">
        <h2>이용권 정보</h2>
        <div className="subscription-summary">
          <div className="subscription-box free">무료 이용권<span className="subscription-count">&nbsp;&nbsp;{freeSubscriptionsCount}</span></div>
          <div className="subscription-box paid">유료 이용권<span className="subscription-count">&nbsp;&nbsp;{paidSubscriptionsCount}</span></div>
        </div>
        {subscriptionData.length > 0 ? (
          <table className="subscription-table">
            <thead>
              <tr>
                <th>내용</th>
                <th>개수</th>
                <th>유효 기간</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionData
                .filter(sub => sub.usage > 0)
                .map((sub, index) => (
                  <tr key={index}>
                    <td>{sub.content}</td>
                    <td className="align-right">{sub.usage}</td>
                    <td className="align-right">{sub.expiry}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p>현재 이용권이 없습니다.</p>
        )}
      </div>

      {/* 결제 내역 테이블 */}
      <div className="payment-history">
        <h2>결제 내역</h2>
        {paymentHistoryData.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>일시</th>
                  <th>내용</th>
                  <th>이용권 횟수</th>
                  <th>결제 금액</th>
                  <th>결제 수단</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.date}</td>
                    <td>{payment.content}</td>
                    <td className="align-right">{payment.quantity}</td>
                    <td className="align-right">{payment.amount ? payment.amount.toLocaleString() : 0}</td>
                    <td>{payment.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={goToFirstPage} disabled={currentPage === 0}>
                  &lt;&lt;
                </button>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 0}>
                  &lt;
                </button>
                {getPageNumbers().map((number, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(number)}
                    className={currentPage === number ? 'active' : ''}
                  >
                    {number + 1}
                  </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                  &gt;
                </button>
                <button onClick={goToLastPage} disabled={currentPage === totalPages - 1}>
                  &gt;&gt;
                </button>
              </div>
            )}
          </>
        ) : (
          <p>이용 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Payment;