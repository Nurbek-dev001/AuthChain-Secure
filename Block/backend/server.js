// В начале файла
const { ethers } = require('ethers');

// В роуте /api/authenticate
app.post('/api/authenticate', async (req, res) => {
    const { biometricHash, signature } = req.body;
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    
    try {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(biometricHash));
        const tx = await contract.authenticateUser(hash, signature);
        await tx.wait();
        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ error: "Authentication failed" });
    }
});