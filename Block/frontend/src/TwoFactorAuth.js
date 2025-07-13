import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Исправленный импорт

const TwoFactorAuth = () => {
    const [secret, setSecret] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [token, setToken] = useState('');
    const [verified, setVerified] = useState(false);

    const generate2FA = async () => {
        const response = await fetch('/api/2fa/generate');
        const data = await response.json();
        setSecret(data.secret);
        setQrUrl(data.qrCodeUrl);
    };

    const verifyToken = async () => {
        const response = await fetch('/api/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, secret })
        });
        const result = await response.json();
        setVerified(result.success);
    };

    
    return (
        <div>
            {!secret ? (
                <button onClick={generate2FA}>Enable 2FA</button>
            ) : (
                <div>
                    <QRCodeSVG value={qrUrl} /> {/* Используем QRCodeSVG */}
                    {/* ... остальной код ... */}
                </div>
            )}
        </div>
    );
};

export default TwoFactorAuth;