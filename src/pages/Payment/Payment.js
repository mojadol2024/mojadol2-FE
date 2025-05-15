import React, { useState, useEffect } from 'react';
import './Payment.css';

function Payment() {
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 3; 
  const [paymentHistoryData, setPaymentHistoryData] = useState([
    { date: '2024.02.16', content: '카카오페이 라이트 이용권 (30일)', quantity: 1, amount: 9900, method: '카카오페이'},
    { date: '2024.02.16', content: '관리자 충전', quantity: 10, amount: 0, method: '-'},
    { date: '2024.01.20', content: '네이버페이 프리미엄 이용권 (60일)', quantity: 1, amount: 29900, method: '네이버페이'},
    { date: '2023.12.25', content: '기타 결제', quantity: 5, amount: 5000, method: '신용카드'},
  ]);
  const [subscriptionData, setSubscriptionData] = useState([
    { content: '무료 이용권', usage: 0, expiry: '2022-01-31', free: 0 }, // free: 0 이 무료 1이 유료라고 해놨는데 바꿔도돼요
    { content: '유료 이용권', usage: 0, expiry: '2022-02-02', free: 1 },
    { content: '무료 이용권', usage: 1, expiry: '2023-03-03', free: 0 },
    { content: '공짜이용권', usage: 2, expiry: '2022-02-02', free: 0 },
    { content: '이용권(유료)', usage: 4, expiry: '2023-03-03', free: 1 },
  ]);

  
  const freeSubscriptionsCount = subscriptionData.filter(sub => sub.free === 0).reduce((sum, sub) => sum + sub.usage, 0);
  const paidSubscriptionsCount = subscriptionData.filter(sub => sub.free === 1).reduce((sum, sub) => sum + sub.usage, 0);

  const totalPages = Math.ceil(paymentHistoryData.length / paymentsPerPage);
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = paymentHistoryData.slice(indexOfFirstPayment, indexOfLastPayment);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const pagesToShow = 3;
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, currentPage + Math.floor(pagesToShow / 2));

    if (totalPages <= pagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  useEffect(() => {
    // 이용권 정보 정렬 (유효 기간 임박 순)
    const sortedSubscriptions = [...subscriptionData].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    setSubscriptionData(sortedSubscriptions);

    // 결제 내역 정렬 (최근 결제 순)
    const sortedPayments = [...paymentHistoryData].sort((a, b) => new Date(b.date) - new Date(a.date));
    setPaymentHistoryData(sortedPayments);
  }, []);

  return (
    <div className="payment-container">
      {/* 상단 제목 및 구매 버튼 */}
      <div className="payment-header">
        <h1>이용권 관리</h1>
        <div className="button-group">
          <button className="buy-info-button">이용권 정보</button>
          <button className="buy-ticket-button">이용권 구매</button>
        </div>
      </div>

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
                .filter(sub => sub.usage > 0) // usage = 이용권 개수가 0보다 큰 경우만 보여주기 0 인 경우 (이용권 다 쓴 경우)는 우짜지..
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
                    <td className="align-right">{payment.amount.toLocaleString()}</td>
                    <td>{payment.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={goToFirstPage} disabled={currentPage === 1}>
                  &lt;&lt;
                </button>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                  &lt;
                </button>
                {getPageNumbers().map((number, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(number)}
                    className={currentPage === number ? 'active' : ''}
                  >
                    {number}
                  </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                  &gt;
                </button>
                <button onClick={goToLastPage} disabled={currentPage === totalPages}>
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