import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 处理URL路径问题
const basePath = window.location.pathname.endsWith('/Caifusi') ? 
  window.location.pathname.replace('/Caifusi', '') : 
  window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// 检测是否通过cpolar访问并处理重定向
if (window.location.hostname.includes('cpolar')) {
  if (window.location.pathname.includes('/Caifusi')) {
    window.location.replace(window.location.origin + '/#/');
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 