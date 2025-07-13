import { ethers } from 'ethers';

// Замените на реальные значения
const CONTRACT_ADDRESS = "0x1234...";
const CONTRACT_ABI = [
    "function authenticateUser(bytes32 biometricHash, bytes memory signature) public returns (bool)"
];

export const authenticateOnBlockchain = async (userAddress, biometricHash, signature) => {
    if (!window.ethereum) {
        throw new Error("Ethereum wallet not detected");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const authContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    try {
        // Хэшируем биометрические данные
        const hash = ethers.keccak256(ethers.toUtf8Bytes(biometricHash));
        const tx = await authContract.authenticateUser(hash, signature);
        
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Blockchain auth error:", error);
        return false;
    }
};