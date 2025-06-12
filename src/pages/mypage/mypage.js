import React, { createElement as h, useState, useEffect } from 'react';
import './mypage.css';
import { getAxiosInstance } from '../../lib/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function MyPage() {
  const navigate = useNavigate(); 

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState(''); 
  const [isEditable, setIsEditable] = useState(false);
  const [email, setEmail] = useState(''); 
  const [marketingAgreed, setMarketingAgreed] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState(''); 

  const [passwordMsg, setPasswordMsg] = useState('');
  const [nicknameMsg, setNicknameMsg] = useState(''); // 닉네임 중복 체크 메시지

  const [showPassword, setShowPassword] = useState(false); // 비밀번호 토글
  const [showModalPassword, setShowModalPassword] = useState(false); // 모달 비밀번호 토글

  // 컴포넌트 마운트 시 사용자 정보 불러오기
useEffect(() => {
  let didCancel = false; // 중복 방지 플래그

  const fetchUserInfo = async () => {
    try {
      const axios = getAxiosInstance();
      const response = await axios.get('/mojadol/api/v1/mypage/profile');
      if (!didCancel) {
        if (response.data.isSuccess) {
          const userData = response.data.result;
          setName(userData.userName);
          setUsername(userData.userLoginId);
          setNickname(userData.nickname);
          setOriginalNickname(userData.nickname);
          setEmail(userData.email);
          setPhoneNumber(userData.phoneNumber);
        } else {
          alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      if (!didCancel) {
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

  fetchUserInfo();

  return () => {
    didCancel = true;
  };
}, []);


  // 닉네임 중복 체크 (debounce 적용)
  useEffect(() => {
    const debounceNicknameCheck = setTimeout(async () => {
      // isEditable 상태에서만 닉네임 중복 체크를 수행
      // 닉네임이 비어있거나 공백만 있는 경우 중복 체크를 하지 않음
      if (isEditable && nickname && nickname.trim() !== '') {
        if (nickname === originalNickname) {
          setNicknameMsg('');
          return; 
        }
        try {
          //const response = await axiosInstance.get(`${API_BASE_URL}/mojadol/api/v1/users/check`, {
          const axios = getAxiosInstance();
          const response = await axios.get('/mojadol/api/v1/users/check', {
            params: { nickname: nickname },
          });

          if (response.data.result === '중복되는 데이터가 없습니다.') {
            setNicknameMsg('사용 가능한 닉네임입니다.');
          } else {
            setNicknameMsg('이미 사용 중인 닉네임입니다.');
          }

        } catch (error) {
          setNicknameMsg('닉네임 중복 확인 중 오류가 발생했습니다.'); 
        }
      } else {
        setNicknameMsg(''); // 닉네임이 비어있거나 수정 모드가 아니면 메시지 초기화
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceNicknameCheck);
  }, [nickname, isEditable, originalNickname]); // isEditable이 변경될 때도 useEffect 재실행

  {/*const validatePassword = (pw) => {
    const lengthCheck = /^.{8,16}$/;
    const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/]; 
    const passedTypes = types.filter((regex) => regex.test(pw)).length; 
    return lengthCheck.test(pw) && passedTypes >= 2; 
  };*/}

  const validatePassword = (password) => { //signup 에서의 비밀번호
    const lengthCheck = /^.{8,16}$/;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password); // 특수문자

    const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;
    return lengthCheck.test(password) && hasSpecial && typeCount >= 2;
  };

  // 비밀번호 확인 (개인정보 수정 진입 전)
  const handleConfirm = async () => {
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      //const response = await axiosInstance.post(`${API_BASE_URL}/mojadol/api/v1/mypage/check-password`,
      const axios = getAxiosInstance();
      const response = await axios.post('/mojadol/api/v1/mypage/check-password',
        { userPw: password }
      );

      if (response.data.isSuccess && response.data.result === '비밀번호가 일치합니다.') {
        setIsEditable(true); // 수정 모드 활성화
        setShowModal(false); // 모달 닫기
        setPassword(''); // 비밀번호 확인 후 모달 비밀번호 필드 초기화 (수정 모드 진입 후 새 비밀번호 입력 위함)
      } else {
        alert('비밀번호가 올바르지 않습니다.');
        setPassword('');
      }
    } catch (error) {
      alert('비밀번호 확인 중 오류가 발생했습니다.');
    }
  };

  // 개인정보 수정 저장
  const handleUpdateProfile = async () => {
    if (nickname !== originalNickname && nicknameMsg === '이미 사용 중인 닉네임입니다.') {
        alert('이미 사용 중인 닉네임으로 변경할 수 없습니다.');
        return;
    }
    // 닉네임이 변경되었는데 비어있는 경우 (추가적인 유효성 검사)
    if (isEditable && nickname.trim() === '') {
        alert('닉네임을 입력해주세요.');
        return;
    }

    // 비밀번호 필수가 되었으므로, 비밀번호 유효성 검사
    if (!password) {
      setPasswordMsg('비밀번호를 반드시 입력해야 합니다.');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordMsg('비밀번호는 8~16자리의 대소문자/숫자/특수문자를 모두 조합해야 합니다.');
      return;
    } else {
      setPasswordMsg('');
    }

    const payload = {
      nickname: nickname,
      userPw: password, 
    };

    try {
      //const response = await axiosInstance.patch(`${API_BASE_URL}/mojadol/api/v1/mypage/update-profile`, payload);
      const axios = getAxiosInstance();
      const response = await axios.patch('/mojadol/api/v1/mypage/update-profile', payload);

      if (response.data.isSuccess) {
        setIsEditable(false); 
        setPassword(''); 
        setOriginalNickname(nickname); // 수정 성공하면 originalNickname도 업데이트
        await handleLogout(); 
      } else {
        alert('개인정보 수정 실패: ' + response.data.message);
      }
    } catch (error) {
      alert('개인정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('accessToken'); 

      window.location.href = '/homepage'; 

    } catch (error) {
      localStorage.removeItem('accessToken'); 
      window.location.href = '/homepage'; 
    }
  };

  // 회원 탈퇴
  const handleWithdraw = async () => {
    const confirmWithdraw = window.confirm('정말 회원 탈퇴하시겠습니까?');
    if (!confirmWithdraw) return;

    try {
      //const response = await axiosInstance.delete(`${API_BASE_URL}/mojadol/api/v1/mypage/resign`);
      const axios = getAxiosInstance();
      const response = await axios.delete('/mojadol/api/v1/mypage/resign');

      if (response.data.isSuccess) {
        alert('회원 탈퇴 예약이 완료되었습니다.');
        // 회원 탈퇴 성공 시, 변경된 로그아웃 함수 호출
        await handleLogout(); 
      } else {
        alert('회원 탈퇴 실패: ' + response.data.message);
      }
    } catch (error) {
      alert('회원 탈퇴 중 오류가 발생했습니다.');
      // 실패하더라도 일단 토큰 제거 및 리다이렉트 시도
      localStorage.removeItem('accessToken'); 
      window.location.href = '/homepage'; 
    }
  };

  function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, ''); // 숫자만 남기기
    if (cleaned.length === 11) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,7)}-${cleaned.slice(7,11)}`;
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
    }
    return phone; // 그 외는 그대로 반환
  }

  // input 행을 렌더링하는 헬퍼 함수
  const inputRow = (label, value, setValue, type = 'text', disabled = false, msg = '') =>
    h('div', { className: 'mypage-form-row' },
      h('div', { className: 'mypage-form-label' }, label),
      h('div', { className: 'mypage-form-input' },
        type === 'password'
          ? h('div', { className: 'mypage-password-input-wrapper' },
              h('input', {
                type: showPassword ? 'text' : 'password',
                value,
                disabled,
                onChange: (e) => setValue(e.target.value),
                
              }),
              isEditable && h('button', {
                type: 'button',
                onClick: () => setShowPassword(prev => !prev),
                className: 'mypage-password-toggle-main'
              }, showPassword ? h(FaEye) : h(FaEyeSlash))
            )
          : h('input', {
              type,
              value,
              disabled,
              onChange: (e) => setValue(e.target.value),
            }),
        msg && h('div', { 
            className: msg.includes('사용 가능한') ? 'my-success-message' : 'my-error-message' 
        }, msg)
      )
    );

  return h('main', { className: 'mypage-content' },
    h('h1', null, '개인정보 관리'),

    h('div', { className: 'mypage-top-buttons' },
      !isEditable && h('button', { className: 'mypage-edit-button', onClick: () => setShowModal(true) }, '개인정보수정'), // 클래스 이름 변경
      isEditable && h('button', { className: 'mypage-save-button', onClick: handleUpdateProfile }, '저장하기') // 클래스 이름 변경
    ),

    h('form', { className: 'mypage-form-table' },
      inputRow('이름', name, setName, 'text', true),
      inputRow('아이디', username, setUsername, 'text', true),
      inputRow('닉네임', nickname, setNickname, 'text', !isEditable, nicknameMsg),
      inputRow('휴대폰 번호', formatPhoneNumber(phoneNumber), setPhoneNumber, 'text', true), 
      inputRow('이메일', email, setEmail, 'text', true), 
      
      inputRow('비밀번호', password, setPassword, 'password', !isEditable, passwordMsg),

      h('div', { className: 'mypage-form-row mypage-toggle-row' },
        h('div', { className: 'mypage-form-label' }, '마케팅 정보 수신'),
        h('div', { className: 'mypage-form-input' },
          h('label', { className: 'mypage-toggle-switch' },
            h('input', {
              type: 'checkbox',
              checked: marketingAgreed,
              disabled: !isEditable,
              onChange: () => setMarketingAgreed(!marketingAgreed)
            }),
            h('span', { className: 'mypage-toggle-slider' })
          )
        )
      )
    ),

    h('div', { className: 'mypage-fixed-withdraw' },
      h('button', { className: 'mypage-withdraw-button', onClick: handleWithdraw }, '회원 탈퇴') 
    ),

    showModal && h('div', { className: 'mypage-modal' },
      h('div', { className: 'mypage-modal-content' },
        h('p', null, '개인정보 수정을 위해 비밀번호를 입력해주세요.'),
        h('div', { className: 'mypage-password-wrapper' },
          h('input', {
            type: showModalPassword ? 'text' : 'password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: '비밀번호',
            className: 'mypage-password-input',
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }
          }),
          h('button', {
            type: 'button',
            onClick: () => setShowModalPassword(prev => !prev),
            className: 'mypage-password-toggle-button'
          }, showModalPassword ? h(FaEye) : h(FaEyeSlash))
        ),
        h('div', { className: 'mypage-modal-actions' },
          h('button', { onClick: handleConfirm }, '확인'),
          h('button', { onClick: () => { setShowModal(false); setPassword(''); } }, '취소') // 취소 시 비밀번호 초기화
        )
      )
    )
  );
}

export default MyPage;