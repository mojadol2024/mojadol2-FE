import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals'; 
import App from './App'; // ✅ 요게 정답!
// index.js 또는 App.js 상단에 있어야 함
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
