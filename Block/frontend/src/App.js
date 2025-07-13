import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Исправлено
import HomePage from './HomePage';
import TwoFactorAuth from './TwoFactorAuth';
import BiometricAuth from './BiometricAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />
        <Route path="/biometrics" element={<BiometricAuth />} />
      </Routes>
    </Router>
  );
}

export default App;