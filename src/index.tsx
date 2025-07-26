import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 添加全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  // 忽略Service Worker相关的错误
  if (event.reason && typeof event.reason === 'string' && 
      event.reason.includes('message channel closed')) {
    event.preventDefault();
    console.warn('Ignored Service Worker message channel error:', event.reason);
    return;
  }
  
  // 其他错误正常处理
  console.error('Unhandled promise rejection:', event.reason);
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);