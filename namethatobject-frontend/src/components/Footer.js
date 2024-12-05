// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0">© 2024 Umut Şanlı. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="mb-0">
              Made with <span style={{ color: '#e25555' }}>♥</span> for mysteries
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
