import React, { useState, useEffect, useCallback } from 'react';
import './Payment.css';
// import axios from 'axios'; 
import { getAxiosInstance } from '../../lib/axiosInstance';
import { getEnv } from '../../lib/getEnv';

/* global BootPay, bootpaySDKLoaded */

//const API_BASE_URL = getEnv('BASE_URL');
//const BOOTPAY_WEB_APPLICATION_ID = getEnv('BOOTPAY_WEB_APPLICATION_ID');

async function fetchAllPaymentData(size = 1000) {
    const axios = getAxiosInstance();

    try {
        const response = await axios.get(`/mojadol/api/v1/payment/list?page=0&size=${size}`);
        return response.data.result;
    } catch (error) {
        if (error.response) {   
            throw new Error(`API 요청 실패: ${error.response.status} - ${error.response.data.message || error.message}`);
        } else {
            throw new Error(`API 요청 실패: ${error.message}`);
        }
    }
}

async function requestPaymentApprovalToBackend(amount, paymentMethod, title, quantity) {
    const axios = getAxiosInstance();
    const apiUrl = '/mojadol/api/v1/payment/pay';

    const requestBody = {
        amount: amount,
        paymentMethod: paymentMethod,
        title: title,
        quantity: quantity
    };

    try {
        const response = await axios.post(apiUrl, requestBody);
        return response.data.result;
    } catch (error) {
        let errorMessage = '결제 처리 중 오류 발생';
        if (error.response) {
            errorMessage = `백엔드 결제 승인 실패: ${error.response.status} - ${error.response.data.message || error.response.statusText}`;
        } else {
            errorMessage = `네트워크 오류: ${error.message}`;
        }
        sessionStorage.setItem('bootpay_backend_error_log', error.message || JSON.stringify(error));
        //alert(errorMessage);
        throw new Error(errorMessage);
    }
}

async function requestPaymentCancelToBackend(paymentId) {
    const axios = getAxiosInstance();
    const apiUrl = `/mojadol/api/v1/payment/cancel/${paymentId}`;

    try {
        const response = await axios.post(apiUrl);
        return response.data.result;
    } catch (error) {
        let errorMessage = '결제 취소 처리 중 오류 발생';
        if (error.response) {
            errorMessage = `${error.response.data.message || error.response.statusText}`;
        } else {
            errorMessage = `네트워크 오류: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
}

async function fetchUserProfile() {
    const axios = getAxiosInstance();
    const apiUrl = '/mojadol/api/v1/mypage/profile';
    try {
        const response = await axios.get(apiUrl);
        return response.data.result;
    } catch (error) {
        if (error.response) {
            throw new Error(`사용자 프로필 요청 실패: ${error.response.status} - ${error.response.data.message || error.message}`);
        } else {
            throw new Error(`사용자 프로필 요청 실패: ${error.message}`);
        }
    }
}

function Payment() {
    const [currentPage, setCurrentPage] = useState(0);
    const [paymentsPerPage] = useState(5);

    const [allPaymentHistoryData, setAllPaymentHistoryData] = useState([]);
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    const [freeSubscriptionsCount, setFreeSubscriptionsCount] = useState(0);
    const [paidSubscriptionsCount, setPaidSubscriptionsCount] = useState(0);

    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);

    const paymentMethodMap = {
        '계좌이체': 'bank',
        'ISP/앱카드결제': 'card',
        '카카오페이': 'kakaopay',
        '네이버페이': 'naverpay',
    };
    const paymentMethods = Object.keys(paymentMethodMap);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);

    const availableProducts = [
        { id: 1, title: 'GOLD 이용권 (10개)', amount: 9900, quantity: 1, voucherCount: 10, voucherType: 'GOLD' },
        { id: 2, title: 'GOLD 이용권 (50개)', amount: 49000, quantity: 5, voucherCount: 50, voucherType: 'GOLD' },
        { id: 3, title: 'GOLD 이용권 (100개)', amount: 98000, quantity: 10, voucherCount: 100, voucherType: 'GOLD' },
    ];
    const [selectedProduct, setSelectedProduct] = useState(availableProducts[0]);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [paymentResult, profileResult] = await Promise.all([
                fetchAllPaymentData(),
                fetchUserProfile()
            ]);

            if (paymentResult && paymentResult.content) {
                setFreeSubscriptionsCount(paymentResult.free || 0);
                setPaidSubscriptionsCount(paymentResult.gold || 0);
                
                const sortedPayments = [...paymentResult.content].sort((a, b) => {
                    const dateA = new Date(a.paymentDate);
                    const dateB = new Date(b.paymentDate);
                    return dateB - dateA;
                });
                setAllPaymentHistoryData(sortedPayments);

                const now = new Date();
                const validVouchers = paymentResult.content
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
                setFreeSubscriptionsCount(0); // 빈응답대비
                setPaidSubscriptionsCount(0);
            }

            if (profileResult) {
                setUserProfile(profileResult);
            } else {
                setError(new Error('사용자 프로필을 불러오지 못했습니다.'));
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

    //const freeSubscriptionsCount = availableVouchers 유효한 free gold 숫자세기
    //    .filter(voucher => voucher.type === 'FREE')
    //    .reduce((sum, voucher) => sum + voucher.totalCount, 0);
    //const paidSubscriptionsCount = availableVouchers
    //    .filter(voucher => voucher.type === 'GOLD')
    //    .reduce((sum, voucher) => sum + voucher.totalCount, 0);

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
        const BOOTPAY_WEB_APPLICATION_ID = getEnv('REACT_APP_BOOTPAY_WEB_APPLICATION_ID');
        if (!userProfile || !selectedProduct) {
            alert('사용자 정보 또는 상품 정보가 없습니다.');
            return;
        }

        if (typeof window.BootPay === 'undefined') {
            alert('BootPay SDK가 로드되지 않았습니다.');
            return;
        }
        //console.log('env:', window._env_);
        //console.log('BootPay App ID:', getEnv('BOOTPAY_WEB_APPLICATION_ID'));

        window.BootPay.request({
            price: selectedProduct.amount,
            application_id: BOOTPAY_WEB_APPLICATION_ID,
            name: selectedProduct.title,
            pg: 'kcp',
            method: paymentMethodMap[selectedPaymentMethod],
            order_id: `ORDER_${Date.now()}`,
            user_info: {
            username: userProfile.userName,
            email: userProfile.email,
            phone: userProfile.phoneNumber,
            },
            extra: {
            app_scheme: 'bootpayreactsample',
            card_quota: '0,2,3',
            },
        })
            .error(function(data) {
            alert(`결제 오류 발생: ${data.message || JSON.stringify(data)}`);
            setShowPaymentPopup(false);
            })
            .cancel(function(data) {
            alert('결제가 취소되었습니다.');
            setShowPaymentPopup(false);
            })
            .done(async function(data) {
            //alert('BootPay 결제 성공!');

            // 프론트에서 백엔드로 결제 승인 데이터 전송
            try {
                const backendResult = await requestPaymentApprovalToBackend(
                data.price,
                selectedPaymentMethod,
                selectedProduct.title,
                selectedProduct.quantity
                );

                alert('이용권 지급이 완료되었습니다.');
                await loadInitialData();

            } catch (error) {
                alert(`백엔드 결제 승인 실패: ${error.message}`);
            } finally {
                setShowPaymentPopup(false);
            }
            })
            .confirm(function(data) {
            this.transactionConfirm(data);
            })
            .close(function() {
            setShowPaymentPopup(false);
            });
        };

    const handleProductChange = (e) => {
        const selectedId = Number(e.target.value);
        const product = availableProducts.find(p => p.id === selectedId);
        setSelectedProduct(product);
    };

    const isCancellable = (payment) => {
        if (!payment.completed || !payment.voucher) return false;

        const { voucher } = payment;
        const isGoldType = voucher.type === 'GOLD';
        const hasRemainingVoucher = voucher.totalCount > 0;
        const isNotExpired = new Date(voucher.expiredAt) > new Date();

        return isGoldType && hasRemainingVoucher && isNotExpired;
    };

    const handleCancelPayment = async (paymentId, title, amount, voucher) => {
        // 버튼 자체가 disabled 되어 환불 불가한 경우 클릭되지 않으므로,
        // 여기서는 단순히 취소 의사를 다시 한번 확인하는 역할만 합니다.
        if (!window.confirm(`${title} (${amount.toLocaleString()}원) 결제를 취소하시겠습니까?`)) {
            return;
        }

        setLoading(true);
        try {
            await requestPaymentCancelToBackend(paymentId);
            alert('결제가 성공적으로 취소되었습니다.');
            loadInitialData(); 
        } catch (error) {
            alert(`결제 취소에 실패했습니다: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 로딩 중일 때 로딩 메시지와 스피너 표시
    if (loading) {
        return (
            <div>
                <div className="loading-state-container">
                    <div className="spinner"></div>
                    <p className="loading-message">데이터를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    // 에러 발생 시
    if (error) {
        return <div className="error-message">Error: {error.message}</div>;
    }

    // 데이터 로드 완료 및 에러 없을 시 정상 렌더링
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
                            <p>FREE 이용권이 매달 1개씩 제공되며,<br /> 유효 기간이 지나면 소멸됩니다.<br />
                            <strong>FREE 이용권</strong> 사용 시, 생성된 면접 질문을 전부<br />녹화해야만 분석 결과를 열람할 수 있습니다.</p>
                            <p><strong>GOLD 이용권</strong>은 면접 질문 1개 이상 녹화시<br />바로 결과 열람이 가능합니다.</p>
                            <p><strong>이미 자소서 분석을 시작한 경우 이용권 변경이 불가합니다.</strong><br />
                            (FREE 이용권으로 면접 질문을 생성한 경우,<br />도중에 GOLD 이용권으로 변경하는 것 불가)</p>
                            <p>모든 이용권은 구매일로부터 <strong>30일</strong>간 유효하며,<br />유효 기간이 지난 이용권은 자동으로 소멸됩니다.</p>
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
                                            {product.title} - {product.amount.toLocaleString()}원, {product.voucherCount}개
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
                        </div>
                        <div className="payment-popup-buttons">
                            <button className="confirm-button" onClick={handleConfirmPayment}>결제하기</button>
                            <button className="p-cancel-button" onClick={handleClosePaymentPopup}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 현재 이용권 정보 */}
            <div className="subscription-info">
                <h2>이용권 정보</h2>
                <div className="subscription-summary">
                    <div className="subscription-box free">FREE 이용권<span className="subscription-count">&nbsp;&nbsp;{freeSubscriptionsCount}</span></div>
                    <div className="subscription-box paid">GOLD 이용권<span className="subscription-count">&nbsp;&nbsp;{paidSubscriptionsCount}</span></div>
                </div>
                {availableVouchers.length > 0 ? (
                    <div className="table-responsive"> 
                    <table className="subscription-table">
                        <thead>
                            <tr>
                                <th>이용권 명</th>
                                <th>종류</th>
                                <th>잔여 개수</th>
                                <th>유효 기간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableVouchers.map((voucher, index) => (
                                <tr key={index}>
                                    <td>{voucher.title}</td>
                                    <td>{voucher.type === 'GOLD' ? 'GOLD' : 'FREE'}</td>
                                    <td className="align-right">{voucher.totalCount}</td>
                                    <td className="align-right">{voucher.expiry}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                ) : (
                    <p>현재 사용 가능한 이용권이 없습니다.</p>
                )}
            </div>

            {/* 결제 내역 테이블 */}
            <div className="payment-history">
                <h2>결제 내역</h2>
                {allPaymentHistoryData.length > 0 ? (
                    <>
                        <div className="table-responsive">
                            <table>
                            <thead>
                                <tr>
                                    <th>일시</th>
                                    <th>이용권 명</th>
                                    <th>결제 금액</th>
                                    <th>결제 수단</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPayments.map((payment, index) => (
                                    <tr key={index}>
                                        <td>{payment.paymentDate ? payment.paymentDate.split('T')[0] : ''}</td>
                                        <td>{payment.title}</td>
                                        {/*<td className="align-right">{payment.voucher ? payment.voucher.totalCount : 0}</td>*/}
                                        <td className="align-right">{payment.amount ? payment.amount.toLocaleString() : 0}원</td>
                                        <td>{payment.paymentMethod}</td>
                                        <td>
                                            {payment.completed === 0 ? (
                                                <span className="cancelled-text">취소됨</span>
                                            ) : (
                                                <button
                                                    className="cancel-payment-button"
                                                    onClick={() => handleCancelPayment(payment.paymentId, payment.title, payment.amount, payment.voucher)}
                                                    disabled={!isCancellable(payment)}>
                                                    취소
                                                </button> 
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>

                        {/* 페이지네이션 컨트롤 */}
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
                    <p>결제 내역이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default Payment;