// 비밀번호, 이메일 입력값이 유효성 검사 
// 아이디, 이름은 수정할 수 없게 
import React, { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './mypage.css';

const BASE_URL ='http://myeonjub.store/api';

function MyPage() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  const [emailDomain, setEmailDomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('직접입력');

  const [marketingAgreed, setMarketingAgreed] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [nicknameMsg, setNicknameMsg] = useState('');

  const handleEditClick = () => {
    setShowModal(true);
    setPassword('');
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/mojadol/api/v1/auth/signOut`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      alert('로그아웃 되었습니다.');
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const checkDuplicate = async (type, value, setMessage) => {
    try {
      const response = await axios.post(`${BASE_URL}/mojadol/api/v1/auth/signUpCheck`, {
        type,
        value,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const result = response.data;
      const label = type === 'username' ? '아이디' : type === 'nickname' ? '닉네임' : '이메일';

      if (result.duplicate) {
        setMessage(`중복된 ${label}입니다.`);
      } else {
        setMessage(`사용 가능한 ${label}입니다.`);
      }
    } catch (err) {
      setMessage('중복 확인 중 오류 발생');
    }
  };

  const handleConfirm = () => {
    if (password === '1234') {
      setIsEditable(true);
      setShowModal(false);
      alert('개인정보를 수정할 수 있습니다.');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };
 
  // 이 부분도 수정해야 함 
  // 현재 입력값 반영이 되지 않음 -> 로그인 완성 후 다시 진행 
  const inputRow = (label, type = 'text') =>
    h('div', { className: 'form-row' },
      h('div', { className: 'form-label' }, label),
      h('div', { className: 'form-input' },
        h('input', { type, disabled: !isEditable })
      )
    );

  return h('div', { className: 'container' },
    h('aside', { className: 'sidebar' },
      h('div', { className: 'top-area' },
        h('div', { className: 'logo-container' },
          h('img', { src: 'https://via.placeholder.com/100x40?text=Logo', className: 'logo' })
        ),
        h('ul', { className: 'menu-top' },
          ['자소서 검사', '첨삭 현황', '이용권 관리'].map((t, i) =>
            h('li', { key: i }, t)
          )
        )
      ),
      h('div', { className: 'menu-bottom' },
        h('ul', null,
          ['개인정보 관리', '고객센터', '로그아웃'].map((t, i) =>
            h('li', {
              key: i,
              className: t === '개인정보 관리' ? 'active' : '',
              onClick: t === '로그아웃' ? handleLogout : undefined,
            }, t)
          )
        )
      )
    ),

    h('main', { className: 'content' },
      h('h1', null, '개인정보 관리'),

      h('div', { className: 'top-buttons' },
        h('button', { className: 'date-button' }, '이용권 만료 일자 2025.03.01'),
        h('button', { className: 'edit-button', onClick: handleEditClick }, '개인정보수정')
      ),

      h('form', { className: 'form-table' },
        inputRow('이름'),

        h('div', { className: 'form-row' },
          h('div', { className: 'form-label' }, '별명'),
          h('div', { className: 'form-input row-flex' },
            h('input', {
              type: 'text',
              disabled: !isEditable,
              value: nickname,
              onChange: (e) => setNickname(e.target.value),
            }),
            h('button', {
              type: 'button',
              disabled: !isEditable,
              onClick: () => checkDuplicate('nickname', nickname, setNicknameMsg),
            }, '중복 확인')
          )
        ),
        h('div', { style: { fontSize: '13px', color: '#ef4444', marginBottom: '10px' } }, nicknameMsg),

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
            ),
            h('button', {
              type: 'button',
              disabled: !isEditable,
              onClick: () => {
                const fullEmail = `${email}@${emailDomain}`;
                checkDuplicate('email', fullEmail, setEmailMsg);
              }
            }, '중복 확인')
          )
        ),
        h('div', { style: { fontSize: '13px', color: '#ef4444', marginBottom: '10px' } }, emailMsg),

        h('div', { className: 'form-row' },
          h('div', { className: 'form-label' }, '아이디'),
          h('div', { className: 'form-input row-flex' },
            h('input', {
              type: 'text',
              disabled: !isEditable,
              value: username,
              onChange: (e) => setUsername(e.target.value),
            }),
            h('button', {
              type: 'button',
              disabled: !isEditable,
              onClick: () => checkDuplicate('username', username, setUsernameMsg),
            }, '중복 확인')
          )
        ),
        h('div', { style: { fontSize: '13px', color: '#ef4444', marginBottom: '10px' } }, usernameMsg),

        inputRow('비밀번호', 'password'),

        h('div', { className: 'form-row toggle-row' },
          h('div', { className: 'form-label' }, '마케팅 정보 수신'),
          h('div', { className: 'form-input' },
            h('label', { className: 'toggle-switch' },
              h('input', {
                type: 'checkbox',
                checked: marketingAgreed,
                onChange: () => setMarketingAgreed(!marketingAgreed),
              }),
              h('span', { className: 'toggle-slider' })
            )
          )
        )
      ),

      h('div', { className: 'fixed-withdraw' },
        h('button', { className: 'withdraw-button' }, '회원 탈퇴')
      )
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
    )
  );
}

const root = createRoot(document.getElementById('root'));
root.render(h(MyPage));

export default MyPage;
