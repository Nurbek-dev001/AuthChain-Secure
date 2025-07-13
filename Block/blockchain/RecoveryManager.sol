// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RecoveryManager is Ownable {
    struct RecoveryRequest {
        address newGuardian;
        uint256 initiateTime;
        bool executed;
    }
    
    mapping(address => RecoveryRequest) public recoveryRequests;
    mapping(address => address) public guardians;
    mapping(address => address) public pendingGuardians;
    
    uint256 public constant RECOVERY_DELAY = 3 days;
    
    event RecoveryInitiated(address indexed user, address newGuardian);
    event GuardianChanged(address indexed user, address newGuardian);
    
    function setGuardian(address guardian) external {
        require(guardian != address(0), "Invalid address");
        pendingGuardians[msg.sender] = guardian;
    }
    
    function initiateRecovery(address user) external {
        require(pendingGuardians[user] == msg.sender, "Not authorized");
        require(recoveryRequests[user].initiateTime == 0, "Recovery already initiated");
        
        recoveryRequests[user] = RecoveryRequest({
            newGuardian: msg.sender,
            initiateTime: block.timestamp,
            executed: false
        });
        
        emit RecoveryInitiated(user, msg.sender);
    }
    
    function executeRecovery(address user) external {
        RecoveryRequest storage request = recoveryRequests[user];
        require(!request.executed, "Already executed");
        require(block.timestamp > request.initiateTime + RECOVERY_DELAY, "Delay not passed");
        require(msg.sender == request.newGuardian, "Unauthorized");
        
        guardians[user] = request.newGuardian;
        delete recoveryRequests[user];
        
        emit GuardianChanged(user, request.newGuardian);
    }
    
    function cancelRecovery() external {
        delete recoveryRequests[msg.sender];
    }
}