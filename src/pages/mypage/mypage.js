import React, { createElement as h, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './mypage.css';
import axiosInstance from '../../lib/axiosInstance';
import { getEnv } from '../../lib/getEnv';

const API_BASE_URL = getEnv('REACT_APP_BASE_URL');

function MyPage() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState(''); // 개인정보 수정 시 사용될 새/현재 비밀번호
  const [isEditable, setIsEditable] = useState(false);
  const [email, setEmail] = useState(''); 
  const [marketingAgreed, setMarketingAgreed] = useState(true);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState(''); 

  const [passwordMsg, setPasswordMsg] = useState('');
  const [nicknameMsg, setNicknameMsg] = useState(''); // 닉네임 중복 체크 메시지

  // 컴포넌트 마운트 시 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/mojadol/api/v1/mypage/profile`);
        if (response.data.isSuccess) {
          const userData = response.data.result;
          setName(userData.userName);
          setUsername(userData.userLoginId);
          setNickname(userData.nickname);
          setOriginalNickname(userData.nickname);
          setEmail(userData.email); 
        } else {
          toast.error('사용자 정보를 불러오는데 실패했습니다: ' + response.data.message);
        }
      } catch (error) {
        console.error('사용자 정보 불러오기 에러:', error);
        toast.error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchUserInfo();
  }, []);

  // 닉네임 중복 체크 (debounce 적용)
  useEffect(() => {
    const debounceNicknameCheck = setTimeout(async () => {
      // isEditable 상태에서만 닉네임 중복 체크를 수행
      // 닉네임이 비어있거나 공백만 있는 경우 중복 체크를 하지 않음
      if (isEditable && nickname && nickname.trim() !== '') {
        if (nickname === originalNickname) {
          setNicknameMsg(''); // 메시지를 비워 유효한 상태로 만듭니다.
          return; // API 호출을 건너뜁니다.
        }
        try {
          const response = await axiosInstance.get(`${API_BASE_URL}/mojadol/api/v1/users/check`, {
            params: { nickname: nickname },
          });

          if (response.data.result === '중복되는 데이터가 없습니다.') {
            setNicknameMsg('사용 가능한 닉네임입니다.');
          } else {
            setNicknameMsg('이미 사용 중인 닉네임입니다.');
          }

        } catch (error) {
          console.error('닉네임 중복 확인 에러:', error);
          setNicknameMsg('닉네임 중복 확인 중 오류가 발생했습니다.'); 
        }
      } else {
        setNicknameMsg(''); // 닉네임이 비어있거나 수정 모드가 아니면 메시지 초기화
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceNicknameCheck);
  }, [nickname, isEditable, originalNickname]); // isEditable이 변경될 때도 useEffect 재실행

  const validatePassword = (pw) => {
    const lengthCheck = /^.{8,16}$/;
    const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/]; 
    const passedTypes = types.filter((regex) => regex.test(pw)).length; 
    return lengthCheck.test(pw) && passedTypes >= 2; 
  };

  // 비밀번호 확인 (개인정보 수정 진입 전)
  const handleConfirm = async () => {
    if (!password) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/mojadol/api/v1/mypage/check-password`,
        { userPw: password }
      );

      if (response.data.isSuccess && response.data.result === '비밀번호가 일치합니다.') {
        setIsEditable(true); // 수정 모드 활성화
        setShowModal(false); // 모달 닫기
        toast.success('개인정보를 수정할 수 있습니다.');
        setPassword(''); // 비밀번호 확인 후 모달 비밀번호 필드 초기화 (수정 모드 진입 후 새 비밀번호 입력 위함)
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
    // 닉네임이 변경되었고, 그 닉네임이 '이미 사용 중인 닉네임'이라는 메시지를 띄우고 있다면 저장 불가
    if (nickname !== originalNickname && nicknameMsg === '이미 사용 중인 닉네임입니다.') {
        toast.error('이미 사용 중인 닉네임으로 변경할 수 없습니다.');
        return;
    }
    // 닉네임이 변경되었는데 비어있는 경우 (추가적인 유효성 검사)
    if (isEditable && nickname.trim() === '') {
        toast.error('닉네임을 입력해주세요.');
        return;
    }

    // 비밀번호 필수가 되었으므로, 비밀번호 유효성 검사
    if (!password) {
      setPasswordMsg('비밀번호를 반드시 입력해야 합니다.');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordMsg('비밀번호는 8~16자리의 대소문자/숫자/특수문자 2종 이상을 조합해야 합니다.');
      return;
    } else {
      setPasswordMsg('');
    }

    const payload = {
      nickname: nickname,
      userPw: password, 
    };

    try {
      const response = await axiosInstance.patch(`${API_BASE_URL}/mojadol/api/v1/mypage/update-profile`, payload);

      if (response.data.isSuccess) {
        toast.success('개인정보 수정이 완료되었습니다.');
        setIsEditable(false); 
        setPassword(''); 
        setOriginalNickname(nickname); // 수정 성공하면 originalNickname도 업데이트트
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
      const response = await axiosInstance.delete(`${API_BASE_URL}/mojadol/api/v1/mypage/resign`);

      if (response.data.isSuccess) {
        toast.success('회원 탈퇴 예약이 완료되었습니다.');
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/'; // 홈으로 리다이렉트
        }, 1500);
      } else {
        toast.error('회원 탈퇴 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('회원 탈퇴 에러:', error);
      toast.error('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  // input 행을 렌더링하는 헬퍼 함수
  const inputRow = (label, value, setValue, type = 'text', disabled = false, msg = '') =>
    h('div', { className: 'form-row' },
      h('div', { className: 'form-label' }, label),
      h('div', { className: 'form-input' },
        h('input', {
          type,
          value,
          disabled,
          onChange: (e) => setValue(e.target.value),
        }),
        msg && h('div', { style: { fontSize: '13px', color: '#ef4444', marginTop: '5px' } }, msg)
      )
    );

  return h('main', { className: 'content' },
    h('h1', null, '개인정보 관리'),

    h('div', { className: 'top-buttons' },
      !isEditable && h('button', { className: 'edit-button', onClick: () => setShowModal(true) }, '개인정보수정'),
      isEditable && h('button', { className: 'save-button', onClick: handleUpdateProfile }, '저장하기')
    ),

    h('form', { className: 'form-table' },
      inputRow('이름', name, setName, 'text', true),
      inputRow('아이디', username, setUsername, 'text', true),
      inputRow('별명', nickname, setNickname, 'text', !isEditable, nicknameMsg),
      inputRow('이메일', email, setEmail, 'text', true), 
      
      inputRow('비밀번호', password, setPassword, 'password', !isEditable, passwordMsg),

      h('div', { className: 'form-row toggle-row' },
        h('div', { className: 'form-label' }, '마케팅 정보 수신'),
        h('div', { className: 'form-input' },
          h('label', { className: 'toggle-switch' },
            h('input', {
              type: 'checkbox',
              checked: marketingAgreed,
              disabled: !isEditable,
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
        h('p', null, '개인정보 수정을 위해 비밀번호를 입력해주세요.'),
        h('input', {
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: '비밀번호',
        }),
        h('div', { className: 'modal-actions' },
          h('button', { onClick: handleConfirm }, '확인'),
          h('button', { onClick: () => { setShowModal(false); setPassword(''); } }, '취소') // 취소 시 비밀번호 초기화
        )
      )
    ),

    h(ToastContainer, { position: "top-right", autoClose: 3000 })
  );
}

export default MyPage;