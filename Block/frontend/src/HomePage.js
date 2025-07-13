import React from 'react';
import { Link } from 'react-router-dom'; // Исправлено

const HomePage = () => {
  return (
    <div className="home-container">
      <header>
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="logo-text">AuthChain Secure</div>
        </div>
        
        <nav>
          <ul>
            <li><Link to="/"><i className="fas fa-home"></i> Главная</Link></li>
            <li><Link to="/biometrics"><i className="fas fa-fingerprint"></i> Биометрия</Link></li>
            <li><Link to="/2fa"><i className="fas fa-mobile-alt"></i> 2FA</Link></li>
          </ul>
        </nav>
      </header>

      {/* ... остальной код ... */}
    </div>
  );
};

export default HomePage;