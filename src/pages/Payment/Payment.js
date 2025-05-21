import React, { useState, useEffect } from 'react';
import './Payment.css';

const API_BASE_URL = 'https://myeonjub.store/api';

/**
 * 결제 내역 리스트 API 호출 함수
 * 이 함수가 이용권 정보와 결제 내역을 모두 가져옵니다.
 * @param {number} page - 요청할 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지당 항목 수
 * @returns {Object|null} - API 응답의 result 객체 또는 오류 발생 시 null
 */
async function fetchPaymentDataAndVouchers(page = 0, size = 10) {
  const accessToken = localStorage.getItem('accessToken');
  //const accessToken = ''; //테스트용
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

/**
 * 결제 요청 API 호출 함수
 * @param {number} amount - 결제 금액
 * @param {string} paymentMethod - 결제 수단
 * @param {string} title - 상품 제목
 * @param {number} quantity - 구매 수량 (이용권 개수)
 */
async function requestPayment(amount, paymentMethod, title, quantity) {
  const accessToken = localStorage.getItem('accessToken');
  // const accessToken = ''; //테스트
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
    // TODO: 서버에서 결제창 URL을 받아서 리다이렉트 처리
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      alert('결제 요청 성공. 결제창 URL을 받지 못했습니다. (테스트 환경)');
      // 결제 성공 후 데이터 다시 불러오기
      window.location.reload(); // 간단하게 페이지 새로고침으로 처리
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
  const [availableVouchers, setAvailableVouchers] = useState([]); // 이용권 정보를 위한 새로운 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // 결제 팝업 관련 상태
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('신한카드');
  // 이용권 상품 목록
  const availableProducts = [
    { id: 1, title: '이용권 1개', amount: 1000, quantity: 1 },
    { id: 2, title: '프리미엄 회원권 (10개 묶음)', amount: 9900, quantity: 10 },
    { id: 3, title: '이용권 50개 묶음', amount: 45000, quantity: 50 },
  ];
  const [selectedProduct, setSelectedProduct] = useState(availableProducts[1]); // 기본값으로 10개 묶음 선택

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // fetchPaymentDataAndVouchers 하나로 모든 데이터 가져오기
        const result = await fetchPaymentDataAndVouchers(currentPage, paymentsPerPage);

        if (result) {
          setPaymentHistoryData(result.content || []); // 결제 내역 설정
          setTotalElements(result.totalElements || 0);

          // 현재 사용 가능한 이용권 집계 로직
          const now = new Date();
          const validVouchers = result.content
            .filter(item => item.completed === 1 && item.voucher !== null) // 결제 완료된 항목만
            .map(item => item.voucher) // voucher 객체만 추출
            .filter(voucher => voucher && new Date(voucher.expiredAt) > now && voucher.totalCount > 0); // 유효 기간이 지나지 않고, 개수가 0보다 큰 것만

          // 같은 종류, 같은 만료일의 이용권 합산
          const aggregatedVouchers = validVouchers.reduce((acc, voucher) => {
            const key = `${voucher.type}-${voucher.expiredAt}`; // type과 expiredAt으로 고유하게 식별
            if (!acc[key]) {
              acc[key] = {
                content: voucher.type === 'GOLD' ? '유료 이용권' : '무료 이용권', // 이용권 제목 설정
                totalCount: 0, // 초기 개수
                expiry: voucher.expiredAt.split('T')[0], // 날짜만 표시
                type: voucher.type,
              };
            }
            acc[key].totalCount += voucher.totalCount; // 이용권 개수 합산
            return acc;
          }, {});

          // 객체를 배열로 변환
          setAvailableVouchers(Object.values(aggregatedVouchers));

        } else {
          setPaymentHistoryData([]);
          setTotalElements(0);
          setAvailableVouchers([]);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentPage, paymentsPerPage]); // currentPage, paymentsPerPage가 변경될 때마다 데이터 다시 로드

  // 이용권 정보 요약 (무료/유료)
  const freeSubscriptionsCount = availableVouchers
    .filter(voucher => voucher.type === 'FREE')
    .reduce((sum, voucher) => sum + voucher.totalCount, 0);

  const paidSubscriptionsCount = availableVouchers
    .filter(voucher => voucher.type === 'GOLD')
    .reduce((sum, voucher) => sum + voucher.totalCount, 0);

  const totalPages = Math.ceil(totalElements / paymentsPerPage);
  const getPageNumbers = () => {
    const pageNumbers = [];
    const pagesToShow = 3;
    let startPage = Math.max(0, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages - 1, currentPage + Math.floor(pagesToShow / 2));

    // 페이지 번호가 totalPages를 넘어가지 않도록 조정
    if (endPage - startPage + 1 < pagesToShow) {
      if (startPage === 0) {
        endPage = Math.min(totalPages - 1, pagesToShow - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(0, totalPages - pagesToShow);
      }
    }
    // totalPages가 pagesToShow보다 작을 경우 모든 페이지 표시
    if (totalPages < pagesToShow) {
        startPage = 0;
        endPage = totalPages -1;
    }


    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
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

  const handleOpenPaymentPopup = () => {
    setShowPaymentPopup(true);
  };

  const handleClosePaymentPopup = () => {
    setShowPaymentPopup(false);
  };

  // 결제 실행 핸들러 (팝업 내에서 호출)
  const handleConfirmPayment = () => {
    if (!selectedProduct) {
      alert('상품을 선택해주세요.');
      return;
    }
    // requestPayment 함수 호출
    requestPayment(
      selectedProduct.amount,
      selectedPaymentMethod,
      selectedProduct.title,
      selectedProduct.quantity
    );
    setShowPaymentPopup(false); // 결제 요청 후 팝업 닫기
  };

  // 상품 선택 변경 핸들러
  const handleProductChange = (e) => {
    const selectedId = Number(e.target.value);
    const product = availableProducts.find(p => p.id === selectedId);
    setSelectedProduct(product);
  };

  if (loading) {
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
              <p>이용권 1개 - 1회 사용 가능</p>
              <p>이용권 10개 묶음 - 9,900원<br />10개의 이용권을 한 번에 구매할 수 있는 상품입니다.</p>
              <p>이용권 50개 묶음 - 45,000원<br />대량 구매 시 할인 혜택이 적용됩니다.</p>
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
                      {product.title} ({product.amount.toLocaleString()}원, {product.quantity}개)
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
                  <option value="신한카드">신한카드</option>
                  <option value="카카오페이">카카오페이</option>
                  <option value="네이버페이">네이버페이</option>
                </select>
              </div>

              <p className="summary-text">선택된 상품: <strong>{selectedProduct.title}</strong></p>
              <p className="summary-text">총 결제 금액: <strong>{selectedProduct.amount.toLocaleString()}원</strong></p>
              <p className="summary-text">획득 이용권 수: <strong>{selectedProduct.quantity}개</strong></p>

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
                <th>개수</th>
                <th>유효 기간</th>
              </tr>
            </thead>
            <tbody>
              {availableVouchers.map((voucher, index) => (
                <tr key={index}>
                  <td>{voucher.content}</td>
                  <td className="align-right">{voucher.totalCount}</td> {/* totalCount 사용 */}
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
                {paymentHistoryData.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.paymentDate ? payment.paymentDate.split('T')[0] : ''}</td> {/* 날짜만 표시 */}
                    <td>{payment.title}</td>
                    <td className="align-right">{payment.voucher ? payment.voucher.totalCount : 0}</td> {/* voucher.totalCount 사용 */}
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
                {getPageNumbers().map((number) => (
                  <button
                    key={number}
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