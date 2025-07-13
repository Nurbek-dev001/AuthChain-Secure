import React from 'react';
import ReactDOM from 'react-dom'; // Исправленный импорт
import './index.css'; // Убедитесь, что этот файл существует
import App from './App'; // Убедитесь, что файл App.js существуе

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
