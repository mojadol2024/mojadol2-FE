import React, { createElement as h } from 'react';

function Sidebar({ handleLogout }) {
  return h('aside', { className: 'sidebar' },
    h('div', { className: 'top-area' },
      h('div', { className: 'logo-container' },
        h('img', {
          src: 'https://via.placeholder.com/100x40?text=Logo',
          className: 'logo',
        })
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
  );
}

export default Sidebar;
