// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AuthManager is Ownable, Pausable {
    struct User {
        bytes32 biometricHash;
        bool is2FAEnabled;
        uint256 recoveryInitiated;
        address recoveryGuardian;
    }
    
    mapping(address => User) public users;
    mapping(address => uint256) public failedAttempts;
    mapping(address => bytes32) public recoveryHashes;
    
    uint256 public constant RECOVERY_DELAY = 2 days;
    uint256 public maxFailedAttempts = 5;
    
    event UserRegistered(address user);
    event AuthSuccess(address user, uint256 timestamp);
    event RecoveryInitiated(address user, uint256 timestamp);
    event BiometricUpdated(address user);

    constructor() {
        // Адрес владельца устанавливается автоматически
    }

    function registerUser(
        bytes32 biometricHash,
        bool enable2FA,
        address recoveryGuardian
    ) external whenNotPaused {
        require(users[msg.sender].biometricHash == 0, "User already registered");
        users[msg.sender] = User({
            biometricHash: biometricHash,
            is2FAEnabled: enable2FA,
            recoveryInitiated: 0,
            recoveryGuardian: recoveryGuardian
        });
        emit UserRegistered(msg.sender);
    }

    function authenticateUser(
        bytes32 biometricHash,
        bytes memory signature
    ) external whenNotPaused {
        User storage user = users[msg.sender];
        require(user.biometricHash != 0, "User not registered");
        
        // Проверка биометрического хеша
        if (user.biometricHash != biometricHash) {
            failedAttempts[msg.sender]++;
            if (failedAttempts[msg.sender] >= maxFailedAttempts) {
                _pause();
                revert("Too many failed attempts, contract paused");
            }
            revert("Biometric mismatch");
        }
        
        // Сброс счетчика ошибок
        failedAttempts[msg.sender] = 0;
        
        // Проверка 2FA
        if (user.is2FAEnabled) {
            bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, biometricHash));
            bytes32 ethSignedMessageHash = keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
            );
            require(isValidSignature(ethSignedMessageHash, signature), "Invalid 2FA signature");
        }
        
        emit AuthSuccess(msg.sender, block.timestamp);
    }

    function initiateRecovery(bytes32 newBioHash) external {
        require(users[msg.sender].biometricHash != 0, "User not registered");
        users[msg.sender].recoveryInitiated = block.timestamp;
        recoveryHashes[msg.sender] = newBioHash;
        emit RecoveryInitiated(msg.sender, block.timestamp);
    }

    function completeRecovery(address userAddress) external {
        User storage user = users[userAddress];
        require(
            user.recoveryGuardian == msg.sender, 
            "Only recovery guardian can complete"
        );
        require(
            user.recoveryInitiated > 0 && 
            block.timestamp > user.recoveryInitiated + RECOVERY_DELAY,
            "Recovery not initiated or delay not passed"
        );
        
        user.biometricHash = recoveryHashes[userAddress];
        user.recoveryInitiated = 0;
        emit BiometricUpdated(userAddress);
    }

    function isValidSignature(bytes32 messageHash, bytes memory signature) 
        internal 
        pure 
        returns (bool) 
    {
        if (signature.length != 65) return false;
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        if (v < 27) v += 27;
        if (v != 27 && v != 28) return false;
        
        address signer = ecrecover(messageHash, v, r, s);
        return signer == msg.sender;
    }

    function setMaxFailedAttempts(uint256 _max) external onlyOwner {
        maxFailedAttempts = _max;
    }
}
// Добавить в контракт
bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

bytes32 public constant AUTH_TYPEHASH = keccak256(
    "Auth(address user,bytes32 biometricHash,uint256 nonce)"
);

mapping(address => uint256) public nonces;

function getDomainSeparator() public view returns (bytes32) {
    return keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
        keccak256(bytes("AuthChain")),
        keccak256(bytes("1")),
        block.chainid,
        address(this)
    ));
}

function verifyEIP712Signature(
    address user,
    bytes32 biometricHash,
    bytes memory signature
) public returns (bool) {
    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        getDomainSeparator(),
        keccak256(abi.encode(
            AUTH_TYPEHASH,
            user,
            biometricHash,
            nonces[user]++
        ))
    ));
    
    (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
    address signer = ecrecover(digest, v, r, s);
    return signer == user;
}

// Обновить authenticateUser
if (user.is2FAEnabled) {
    require(verifyEIP712Signature(msg.sender, biometricHash, signature), "Invalid 2FA signature");
}