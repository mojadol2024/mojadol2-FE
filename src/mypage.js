document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('edit-button');
    const modal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const confirmBtn = document.getElementById('confirm-password');
    const cancelBtn = document.getElementById('cancel-password');
  
    const formInputs = document.querySelectorAll('.form-input input, .form-input select');
  
    // 초기 폼 비활성화
    formInputs.forEach(input => {
      input.disabled = true;
    });
  
    // 개인정보수정 버튼 클릭 시 모달 표시
    editButton.addEventListener('click', () => {
      modal.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
    });
  
    // 모달 취소 버튼
    cancelBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  
    // 모달 확인 버튼
    confirmBtn.addEventListener('click', () => {
      const inputPwd = passwordInput.value;
  
      // 임시 비밀번호 검증
      if (inputPwd === '1234') {
        modal.classList.add('hidden');
  
        formInputs.forEach(input => {
          input.disabled = false;
        });
  
        alert('개인정보를 수정할 수 있습니다.');
      } else {
        alert('비밀번호가 올바르지 않습니다.');
      }
    });
  });
  