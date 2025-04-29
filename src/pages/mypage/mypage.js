import React, { createElement as h, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './mypage.css';

const BASE_URL = 'https://myeonjub.store/api'; // 

function MyPage() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  const [emailDomain, setEmailDomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('직접입력');
  const [marketingAgreed, setMarketingAgreed] = useState(true);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [name, setName] = useState('');         
  const [nickname, setNickname] = useState('');

  const [emailMsg, setEmailMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // 비밀번호 유효성 검사
  const validatePassword = (pw) => {
    const regex = /^[0-9]+$/;
    return regex.test(pw);
  };

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // 비밀번호 확인
  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(`${BASE_URL}/mojadol/api/v1/auth/signOut`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });


      const response = await axios.post(`${BASE_URL}/mojadol/api/v1/mypage/checkPassword`,
        { userPw: password },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSuccess) {
        setIsEditable(true);
        setShowModal(false);
        toast.success('개인정보를 수정할 수 있습니다.');
      } else {
        toast.error('비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 에러:', error);
      toast.error('비밀번호 확인 중 오류가 발생했습니다.');
    }
  };

  // 개인정보 수정 저장
  const handleUpdateProfile = async () => {
    if (!validatePassword(password)) {
      setPasswordMsg('비밀번호는 숫자만 포함해야 합니다.');
      return;
    }

    const fullEmail = `${email}@${emailDomain}`;
    if (!validateEmail(fullEmail)) {
      setEmailMsg('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${BASE_URL}/mojadol/api/v1/mypage/updateProfile`,
        {
          userPw: password,
          nickname: nickname,
          email: fullEmail,
          marketingAgree: marketingAgreed,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSuccess) {
        toast.success('개인정보 수정이 완료되었습니다.');
        setIsEditable(false);
      } else {
        toast.error('개인정보 수정 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('개인정보 수정 에러:', error);
      toast.error('개인정보 수정 중 오류가 발생했습니다.');
    }
  };

  // 회원 탈퇴
  const handleWithdraw = async () => {
    const confirmWithdraw = window.confirm('정말 회원 탈퇴하시겠습니까?');
    if (!confirmWithdraw) return;

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${BASE_URL}/mojadol/api/v1/mypage/resignUser`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.isSuccess) {
        toast.success('회원 탈퇴가 완료되었습니다.');
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        toast.error('회원 탈퇴 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('회원 탈퇴 에러:', error);
      toast.error('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };


  const inputRow = (label, value, setValue, type = 'text', disabled = false) =>
    h('div', { className: 'form-row' },
      h('div', { className: 'form-label' }, label),
      h('div', { className: 'form-input' },
        h('input', {
          type,
          value,
          disabled,
          onChange: (e) => setValue(e.target.value),
        })
      )
    );

  return h('main', { className: 'content' },
    h('h1', null, '개인정보 관리'),


    h('div', { className: 'top-buttons' },
      h('button', { className: 'date-button' }, '이용권 만료 일자 2025.03.01'),
      !isEditable && h('button', { className: 'edit-button', onClick: () => setShowModal(true) }, '개인정보수정'),
      isEditable && h('button', { className: 'save-button', onClick: handleUpdateProfile }, '저장하기')
    ),

    h('form', { className: 'form-table' },
      inputRow('이름', name, setName, 'text', true),
      inputRow('아이디', username, setUsername, 'text', true),
      inputRow('별명', nickname, setNickname, 'text', !isEditable),

      h('div', { className: 'form-row' },
        h('div', { className: 'form-label' }, '이메일'),
        h('div', { className: 'form-input row-flex' },
          h('input', {
            type: 'text',
            disabled: !isEditable,
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }),
          h('span', null, '@'),
          h('input', {
            type: 'text',
            disabled: !isEditable || selectedDomain !== '직접입력',
            value: emailDomain,
            onChange: (e) => setEmailDomain(e.target.value),
          }),
          h('select', {
            disabled: !isEditable,
            value: selectedDomain,
            onChange: (e) => {
              const value = e.target.value;
              setSelectedDomain(value);
              setEmailDomain(value !== '직접입력' ? value : '');
            }
          },
            ['직접입력', 'gmail.com', 'naver.com'].map((domain, idx) =>
              h('option', { key: idx, value: domain }, domain)
            )
          )
        )
      ),
      h('div', { style: { fontSize: '13px', color: '#ef4444', marginBottom: '10px' } }, emailMsg),

      inputRow('비밀번호', password, setPassword, 'password', !isEditable),
      h('div', { style: { fontSize: '13px', color: '#ef4444', marginBottom: '10px' } }, passwordMsg),

   

      h('div', { className: 'form-row toggle-row' },
        h('div', { className: 'form-label' }, '마케팅 정보 수신'),
        h('div', { className: 'form-input' },
          h('label', { className: 'toggle-switch' },
            h('input', {
              type: 'checkbox',
              checked: marketingAgreed,

              onChange: () => setMarketingAgreed(!marketingAgreed) 

            }),
            h('span', { className: 'toggle-slider' })
          )
        )
      )      
    ),
        
    h('div', { className: 'fixed-withdraw' },
      h('button', { className: 'withdraw-button', onClick: handleWithdraw }, '회원 탈퇴')
    ),

    showModal && h('div', { className: 'modal' },
      h('div', { className: 'modal-content' },
        h('p', null, '비밀번호를 입력하세요'),
        h('input', {
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: '비밀번호',
        }),
        h('div', { className: 'modal-actions' },
          h('button', { onClick: handleConfirm }, '확인'),
          h('button', { onClick: () => setShowModal(false) }, '취소')
        )
      )
    ),

    h(ToastContainer, { position: "top-right", autoClose: 3000 })
  );
}

export default MyPage;

