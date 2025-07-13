self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js');

self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch(type) {
        case 'HASH_BIOMETRIC':
            const hash = self.sha256(JSON.stringify(data));
            self.postMessage({ result: hash });
            break;
            
        case 'ENCRYPT_DATA':
            const encoder = new TextEncoder();
            const keyData = encoder.encode(data.key);
            
            crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            ).then(key => {
                const iv = crypto.getRandomValues(new Uint8Array(12));
                return crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    encoder.encode(data.value)
                ).then(encrypted => {
                    self.postMessage({
                        result: {
                            iv: Array.from(iv),
                            data: Array.from(new Uint8Array(encrypted))
                        }
                    });
                });
            });
            break;
            
        case 'GENERATE_KEYPAIR':
            crypto.subtle.generateKey(
                {
                    name: "ECDSA",
                    namedCurve: "P-256",
                },
                true,
                ["sign", "verify"]
            ).then(keyPair => {
                crypto.subtle.exportKey("jwk", keyPair.privateKey)
                .then(privateKey => {
                    crypto.subtle.exportKey("jwk", keyPair.publicKey)
                    .then(publicKey => {
                        self.postMessage({ 
                            result: { privateKey, publicKey } 
                        });
                    });
                });
            });
            break;
    }
};