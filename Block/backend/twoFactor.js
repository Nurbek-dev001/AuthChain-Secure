const crypto = require('crypto');
const base32 = require('hi-base32');
const { WebAuthn } = require('@simplewebauthn/server');

class TwoFactorService {
    constructor() {
        this.rpID = process.env.RP_ID || 'localhost';
        this.rpName = 'AuthChain Secure';
        this.origin = process.env.ORIGIN || 'http://localhost:3000';
    }

    generateTOTP() {
        const secret = crypto.randomBytes(20);
        return {
            secret: base32.encode(secret).replace(/=/g, ''),
            qrCodeUrl: `otpauth://totp/${this.rpName}?secret=${base32.encode(secret)}&issuer=${this.rpName}`
        };
    }

    verifyTOTP(token, secret) {
        const key = base32.decode.asBytes(secret);
        const counter = Math.floor(Date.now() / 30000);
        
        const hmac = crypto.createHmac('sha1', Buffer.from(key));
        hmac.update(Buffer.alloc(8));
        
        const digest = hmac.digest();
        const offset = digest[digest.length - 1] & 0x0f;
        
        const code = (
            ((digest[offset] & 0x7f) << 24) |
            ((digest[offset + 1] & 0xff) << 16) |
            ((digest[offset + 2] & 0xff) << 8) |
            (digest[offset + 3] & 0xff)
        ) % 1000000;
        
        return String(code).padStart(6, '0') === token;
    }

    async generateWebAuthnOptions(user) {
        return WebAuthn.generateRegistrationOptions({
            rpName: this.rpName,
            rpID: this.rpID,
            userID: user.id,
            userName: user.email,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'required',
            },
        });
    }

    async verifyWebAuthnResponse(response, expectedChallenge) {
        return WebAuthn.verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: this.origin,
            expectedRPID: this.rpID,
            requireUserVerification: true,
        });
    }
}

module.exports = new TwoFactorService();