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
  const [nicknameMsg, setNicknameMsg] = useState('');
  const [modalPasswordMsg, setModalPasswordMsg] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  useEffect(() => {
    let didCancel = false;

    const fetchUserInfo = async () => {
      try {
        const axios = getAxiosInstance();
        const response = await axios.get('/mojadol/api/v1/mypage/profile');
        if (!didCancel && response.data.isSuccess) {
          const userData = response.data.result;
          setName(userData.userName);
          setUsername(userData.userLoginId);
          setNickname(userData.nickname);
          setOriginalNickname(userData.nickname);
          setEmail(userData.email);
          setPhoneNumber(userData.phoneNumber);
        }
      } catch (error) {}
    };

    fetchUserInfo();
    return () => { didCancel = true; };
  }, []);

  useEffect(() => {
    const debounceNicknameCheck = setTimeout(async () => {
      if (isEditable && nickname && nickname.trim() !== '') {
        if (nickname === originalNickname) {
          setNicknameMsg('');
          return;
        }
        try {
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
        setNicknameMsg('');
      }
    }, 500);

    return () => clearTimeout(debounceNicknameCheck);
  }, [nickname, isEditable, originalNickname]);

  const validatePassword = (password) => {
    const lengthCheck = /^.{8,16}$/;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;
    return lengthCheck.test(password) && hasSpecial && typeCount >= 2;
  };

  const handleConfirm = async () => {
    if (!password) {
      setModalPasswordMsg('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const axios = getAxiosInstance();
      const response = await axios.post('/mojadol/api/v1/mypage/check-password', { userPw: password });

      if (response.data.isSuccess && response.data.result === '비밀번호가 일치합니다.') {
        setIsEditable(true);
        setShowModal(false);
        setPassword('');
        setModalPasswordMsg('');
      } else {
        setModalPasswordMsg('비밀번호가 올바르지 않습니다.');
        setPassword('');
      }
    } catch (error) {
      setModalPasswordMsg('비밀번호 확인 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateProfile = async () => {
    if (nickname !== originalNickname && nicknameMsg === '이미 사용 중인 닉네임입니다.') {
      setNicknameMsg('이미 사용 중인 닉네임으로 변경할 수 없습니다.');
      return;
    }
    if (isEditable && nickname.trim() === '') {
      setNicknameMsg('닉네임을 입력해주세요.');
      return;
    }

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
      const axios = getAxiosInstance();
      const response = await axios.patch('/mojadol/api/v1/mypage/update-profile', payload);

      if (response.data.isSuccess) {
        setIsEditable(false);
        setPassword('');
        setOriginalNickname(nickname);
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

  const handleWithdraw = async () => {
    const confirmWithdraw = window.confirm('정말 회원 탈퇴하시겠습니까?');
    if (!confirmWithdraw) return;

    try {
      const axios = getAxiosInstance();
      const response = await axios.delete('/mojadol/api/v1/mypage/resign');

      if (response.data.isSuccess) {
        alert('회원 탈퇴 예약이 완료되었습니다.');
        await handleLogout();
      } else {
        alert('회원 탈퇴 실패: ' + response.data.message);
      }
    } catch (error) {
      alert('회원 탈퇴 중 오류가 발생했습니다.');
      localStorage.removeItem('accessToken');
      window.location.href = '/homepage';
    }
  };

  function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,7)}-${cleaned.slice(7,11)}`;
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
    }
    return phone;
  }

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
      !isEditable && h('button', { className: 'mypage-edit-button', onClick: () => { setShowModal(true); setModalPasswordMsg(''); } }, '개인정보수정'),
      isEditable && h('button', { className: 'mypage-save-button', onClick: handleUpdateProfile }, '저장하기')
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
            onChange: (e) => {
              setPassword(e.target.value);
              setModalPasswordMsg('');
            },
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
        modalPasswordMsg && h('div', {
          className: modalPasswordMsg.includes('오류') || modalPasswordMsg.includes('않습니다') ? 'my-error-message' : 'my-info-message'
        }, modalPasswordMsg),
        h('div', { className: 'mypage-modal-actions' },
          h('button', { onClick: handleConfirm }, '확인'),
          h('button', { onClick: () => { setShowModal(false); setPassword(''); setModalPasswordMsg(''); } }, '취소')
        )
      )
    )
  );
}

export default MyPage;
