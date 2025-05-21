import React, { useState, useEffect, useCallback } from 'react';
import './Payment.css';

const API_BASE_URL = 'https://myeonjub.store/api';

/**
 * 결제 내역 리스트 API 호출 함수
 * 이 함수는 전체 데이터를 가져올 수 있도록 size를 크게 요청합니다.
 * @param {number} size - 페이지당 항목 수 (전체 데이터를 위해 큰 값 사용)
 * @returns {Object|null} - API 응답의 result 객체 또는 오류 발생 시 null
 */
async function fetchAllPaymentData(size = 1000) {
  const accessToken = localStorage.getItem('accessToken');
  //const accessToken = ''; // 테스트용
  const apiUrl = `${API_BASE_URL}/mojadol/api/v1/payment/list?page=0&size=${size}`;

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

/**
 * 결제 요청 API 호출 함수
 * @param {number} amount - 결제 금액
 * @param {string} paymentMethod - 결제 수단
 * @param {string} title - 상품 제목
 * @param {number} quantity - 구매 수량 (이용권 개수)
 */
async function requestPayment(amount, paymentMethod, title, quantity) {
  const accessToken = localStorage.getItem('accessToken');
  //const accessToken = ''; // 테스트용
  const apiUrl = `${API_BASE_URL}/mojadol/api/v1/payment/pay`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify({
        amount: amount,
        paymentMethod: paymentMethod,
        title: title,
        quantity: quantity
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('결제 요청 실패:', errorData);
      alert(`결제 요청 실패: ${errorData.message || response.statusText}`);
      throw new Error(`결제 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('결제 요청 성공:', data);

    // 백엔드에서 redirectUrl을 내려주는 경우 해당 URL로 이동합니다.
    if (data.result && data.result.redirectUrl) {
      window.location.href = data.result.redirectUrl;
    } else {
      // redirectUrl이 없으면 (예: 백엔드가 아직 구현 중이거나 테스트 환경일 경우)
      alert('결제 요청 성공!');
      window.location.reload(); // 페이지 새로고침하여 데이터 다시 로드
    }
  } catch (error) {
    console.error('결제 요청 중 오류 발생:', error);
    alert(`결제 요청 중 오류 발생: ${error.message}`);
  }
}

function Payment() {
  const [currentPage, setCurrentPage] = useState(0);
  const [paymentsPerPage] = useState(5);

  const [allPaymentHistoryData, setAllPaymentHistoryData] = useState([]);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const paymentMethods = ['카드결제', '카카오페이', '네이버페이'];
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);

  const availableProducts = [
    { id: 1, title: '프리미엄 회원권 (10개)', amount: 9900, quantity: 1, voucherType: 'GOLD' },
    { id: 2, title: '프리미엄 회원권 (50개)', amount: 49000, quantity: 5, voucherType: 'GOLD' },
    { id: 3, title: '프리미엄 회원권 (100개)', amount: 98000, quantity: 10, voucherType: 'GOLD' },
  ];
  const [selectedProduct, setSelectedProduct] = useState(availableProducts[0]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllPaymentData();

      if (result && result.content) {
        const sortedPayments = [...result.content].sort((a, b) => {
          const dateA = new Date(a.paymentDate);
          const dateB = new Date(b.paymentDate);
          return dateB - dateA;
        });
        setAllPaymentHistoryData(sortedPayments);

        const now = new Date();
        const validVouchers = result.content
          .filter(item => item.completed === 1 && item.voucher !== null)
          .map(item => ({
            ...item.voucher,
            paymentTitle: item.title
          }))
          .filter(voucher => voucher && new Date(voucher.expiredAt) > now);

        const aggregatedVouchers = validVouchers.reduce((acc, voucher) => {
          const key = `${voucher.type}-${voucher.expiredAt}-${voucher.paymentTitle}`;
          if (!acc[key]) {
            acc[key] = {
              title: voucher.paymentTitle,
              type: voucher.type,
              totalCount: 0,
              expiry: voucher.expiredAt,
            };
          }
          acc[key].totalCount += voucher.totalCount;
          return acc;
        }, {});

        const sortedAvailableVouchers = Object.values(aggregatedVouchers).sort((a, b) => {
          return new Date(a.expiry) - new Date(b.expiry);
        }).map(voucher => ({
          ...voucher,
          expiry: voucher.expiry.split('T')[0]
        }));

        setAvailableVouchers(sortedAvailableVouchers);
      } else {
        setAllPaymentHistoryData([]);
        setAvailableVouchers([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const indexOfLastPayment = (currentPage + 1) * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = allPaymentHistoryData.slice(indexOfFirstPayment, indexOfLastPayment);

  const freeSubscriptionsCount = availableVouchers
    .filter(voucher => voucher.type === 'FREE')
    .reduce((sum, voucher) => sum + voucher.totalCount, 0);

  const paidSubscriptionsCount = availableVouchers
    .filter(voucher => voucher.type === 'GOLD')
    .reduce((sum, voucher) => sum + voucher.totalCount, 0);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    if (indexOfLastPayment < allPaymentHistoryData.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleShowInfoPopup = () => {
    setShowInfoPopup(true);
  };

  const handleCloseInfoPopup = () => {
    setShowInfoPopup(false);
  };

  const handleOpenPaymentPopup = () => {
    setShowPaymentPopup(true);
  };

  const handleClosePaymentPopup = () => {
    setShowPaymentPopup(false);
  };

  const handleConfirmPayment = () => {
    if (!selectedProduct) {
      alert('상품을 선택해주세요.');
      return;
    }
    requestPayment(
      selectedProduct.amount,
      selectedPaymentMethod,
      selectedProduct.title,
      selectedProduct.quantity
    );
    setShowPaymentPopup(false);
  };

  const handleProductChange = (e) => {
    const selectedId = Number(e.target.value);
    const product = availableProducts.find(p => p.id === selectedId);
    setSelectedProduct(product);
  };

  if (loading && allPaymentHistoryData.length === 0) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  return (
    <div className="payment-container">
      {/* 상단 제목 및 구매 버튼 */}
      <div className="payment-header">
        <h1>이용권 관리</h1>
        <div className="button-group">
          <button className="buy-info-button" onClick={handleShowInfoPopup}>이용권 안내</button>
          <button className="buy-ticket-button" onClick={handleOpenPaymentPopup}>이용권 구매</button>
        </div>
      </div>

      {/* 이용권 안내 팝업 */}
      {showInfoPopup && (
        <div className="info-popup-overlay">
          <div className="info-popup">
            <h2>이용권 안내</h2>
            <div className="info-popup-content">
              <p>프리미엄 회원권 (10개) - 9,900원<br />10개의 이용권을 한 번에 구매할 수 있는 상품입니다.</p>
              <p>프리미엄 회원권 (50개) - 49,000원<br />대량 구매 시 할인 혜택이 적용됩니다.</p>
              <p>프리미엄 회원권 (100개) - 98,000원<br />가장 큰 할인 혜택이 적용되는 대량 구매 상품입니다.</p>
              <p>
                모든 이용권은 구매일로부터 30일간 유효하며, 유효 기간이 지난 이용권은 자동으로 소멸됩니다.<br />
                무료 이용권은 이벤트 등을 통해 지급되며, 유료 이용권과 동일하게 사용됩니다.<br />
                자세한 내용은 고객센터에 문의해주세요.
              </p>
            </div>
            <button onClick={handleCloseInfoPopup}>닫기</button>
          </div>
        </div>
      )}

      {/* 이용권 구매 팝업 */}
      {showPaymentPopup && (
        <div className="payment-popup-overlay">
          <div className="payment-popup">
            <h2>이용권 구매</h2>
            <div className="payment-popup-content">
              <div className="form-group">
                <label htmlFor="product-select">상품 선택:</label>
                <select
                  id="product-select"
                  value={selectedProduct.id}
                  onChange={handleProductChange}
                >
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.title} ({product.amount.toLocaleString()}원, {product.quantity * 10}개)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="method-select">결제 수단:</label>
                <select
                  id="method-select"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <p className="summary-text">선택된 상품: <strong>{selectedProduct.title}</strong></p>
              <p className="summary-text">총 결제 금액: <strong>{selectedProduct.amount.toLocaleString()}원</strong></p>
              <p className="summary-text">획득 이용권 수: <strong>{selectedProduct.quantity * 10}개</strong></p>

            </div>
            <div className="payment-popup-buttons">
              <button className="confirm-button" onClick={handleConfirmPayment}>결제하기</button>
              <button className="cancel-button" onClick={handleClosePaymentPopup}>취소</button>
            </div>
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
        {availableVouchers.length > 0 ? (
          <table className="subscription-table">
            <thead>
              <tr>
                <th>내용</th>
                <th>유료/무료</th>
                <th>개수</th>
                <th>유효 기간</th>
              </tr>
            </thead>
            <tbody>
              {availableVouchers.map((voucher, index) => (
                <tr key={index}>
                  <td>{voucher.title}</td>
                  <td>{voucher.type === 'GOLD' ? '유료' : '무료'}</td>
                  <td className="align-right">{voucher.totalCount}</td>
                  <td className="align-right">{voucher.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>현재 사용 가능한 이용권이 없습니다.</p>
        )}
      </div>

      {/* 결제 내역 테이블 */}
      <div className="payment-history">
        <h2>결제 내역</h2>
        {allPaymentHistoryData.length > 0 ? (
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
                  <tr key={index}><td>{payment.paymentDate ? payment.paymentDate.split('T')[0] : ''}</td><td>{payment.title}</td><td className="align-right">{payment.voucher ? payment.voucher.totalCount : 0}</td><td className="align-right">{payment.amount ? payment.amount.toLocaleString() : 0}</td><td>{payment.paymentMethod}</td></tr>
                ))}
              </tbody>
            </table>

            {/* 페이지네이션처럼 보이는 UI */}
            <div className="pagination-controls">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0 || loading}
                    className="nav-button"
                >
                    &lt;
                </button>
                <span className="current-page-info">
                    {allPaymentHistoryData.length > 0 ?
                        `${indexOfFirstPayment + 1} - ${Math.min(indexOfLastPayment, allPaymentHistoryData.length)} / ${allPaymentHistoryData.length}` :
                        '0 / 0'
                    }
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={indexOfLastPayment >= allPaymentHistoryData.length || loading}
                    className="nav-button"
                >
                    &gt;
                </button>
            </div>
          </>
        ) : (
          <p>이용 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Payment;