import { create } from 'ipfs-http-client';
import crypto from 'crypto';

class IPFSService {
    constructor() {
        this.client = create({
            url: process.env.IPFS_API || 'https://ipfs.infura.io:5001',
            headers: {
                authorization: `Basic ${Buffer.from(`${process.env.IPFS_ID}:${process.env.IPFS_SECRET}`).toString('base64')}`
            }
        });
    }

  async encryptAndStore(data, encryptionKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Сохраняем IV вместе с данными
  const content = Buffer.from(encrypted, 'hex');
  const { cid } = await this.client.add({
    content: Buffer.concat([iv, content])
  });
  
  return cid.toString();
}

async retrieveAndDecrypt(cid, encryptionKey) {
  const chunks = [];
  for await (const chunk of this.client.cat(cid)) {
    chunks.push(chunk);
  }
  
  const encryptedData = Buffer.concat(chunks);
  const iv = encryptedData.subarray(0, 16);
  const data = encryptedData.subarray(16);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  let decrypted = decipher.update(data, null, 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}
}