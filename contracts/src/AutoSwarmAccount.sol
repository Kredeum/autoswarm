// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {ERC6551Account} from "@erc6551/examples/simple/ERC6551Account.sol";

import {AutoSwarmMarket} from "./AutoSwarmMarket.sol";
import {IAutoSwarmMarket} from "./interfaces/IAutoSwarmMarket.sol";
import {IAutoSwarmAccount} from "./interfaces/IAutoSwarmAccount.sol";

// import {console} from "forge-std/console.sol";

contract AutoSwarmAccount is IAutoSwarmAccount, ERC6551Account, ReentrancyGuard {
    bytes32 public swarmHash;
    uint256 public swarmSize;
    bytes32 public stampId;

    uint256 private constant _ERC6551_TBA_SIZE = 173;
    AutoSwarmMarket private _autoSwarmMarket; // only implementation can set this

    modifier onlyMarketOwner() {
        if (msg.sender != getMarketOwner()) revert NotMarketOwner();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender == owner()) revert NotOwner();
        _;
    }

    constructor(AutoSwarmMarket autoSwarmMarket_) {
        _setAutoSwarmMarket(autoSwarmMarket_);
    }

    function setAutoSwarmMarket(AutoSwarmMarket autoSwarmMarket_)
        external
        override(IAutoSwarmAccount)
        onlyMarketOwner
    {
        _setAutoSwarmMarket(autoSwarmMarket_);
    }

    function createStamp(bytes32 swarmHash_, uint256 swarmSize_, uint256 bzzAmount_)
        external
        override(IAutoSwarmAccount)
        nonReentrant
        returns (bytes32)
    {
        if (stampId != bytes32(0)) revert StampExists();
        if (swarmHash_ == bytes32(0)) revert SwarmHashNull();
        if (swarmSize_ == 0) revert SwarmSizeZero();

        AutoSwarmMarket autoSwarmMarket = getAutoSwarmMarket();

        swarmHash = swarmHash_;
        swarmSize = swarmSize_;

        SafeERC20.safeIncreaseAllowance(getBzzToken(), address(autoSwarmMarket), bzzAmount_);

        // slither-disable-next-line reentrancy-no-eth
        stampId = autoSwarmMarket.createStamp(swarmHash_, swarmSize_, bzzAmount_);

        emit CreateStamp(stampId, swarmHash_, swarmSize_, bzzAmount_);
        return stampId;
    }

    function updateStamp(bytes32 swarmHash_, uint256 swarmSize_) external override(IAutoSwarmAccount) onlyMarketOwner {
        if (swarmHash_ == bytes32(0)) revert SwarmHashNull();
        if (swarmSize_ == 0) revert SwarmSizeZero();

        swarmHash = swarmHash_;
        swarmSize = swarmSize_;

        emit UpdateStamp(stampId, swarmHash, swarmSize_);
        getAutoSwarmMarket().updateStamp(stampId, swarmHash_, swarmSize_);
    }

    function topUp(uint256 bzzAmount) external override(IAutoSwarmAccount) {
        if (bzzAmount == 0) revert AmountZero();

        AutoSwarmMarket autoSwarmMarket = getAutoSwarmMarket();

        SafeERC20.safeIncreaseAllowance(getBzzToken(), address(autoSwarmMarket), bzzAmount);
        autoSwarmMarket.topUpStamp(stampId, bzzAmount);

        emit TopUp(stampId, bzzAmount);
    }

    function withdraw(address token) external override(IAutoSwarmAccount) onlyMarketOwner returns (uint256 amount) {
        if (token == address(0)) {
            amount = address(this).balance;
            Address.sendValue(payable(owner()), amount);
        } else {
            amount = IERC20(token).balanceOf(address(this));
            SafeERC20.safeTransfer(IERC20(token), owner(), amount);
        }

        emit Withdraw(token, amount);
    }

    function getOneYearPrice() external view override(IAutoSwarmAccount) returns (uint256) {
        return getAutoSwarmMarket().getStampPriceOneYear(swarmSize);
    }

    function owner() public view override(ERC6551Account) returns (address) {
        address superOwner = super.owner();

        return (superOwner == address(0)) ? getMarketOwner() : superOwner;
    }

    function getBzzToken() public view override(IAutoSwarmAccount) returns (IERC20) {
        return getAutoSwarmMarket().bzzToken();
    }

    function getMarketOwner() public view override(IAutoSwarmAccount) returns (address) {
        return getAutoSwarmMarket().owner();
    }

    function isTba() public view override(IAutoSwarmAccount) returns (bool) {
        return address(this).code.length == _ERC6551_TBA_SIZE;
    }

    function getImplementation() public view override(IAutoSwarmAccount) returns (AutoSwarmAccount addr) {
        if (!isTba()) revert NotTba();

        addr = AutoSwarmAccount(payable(address(uint160(uint256(bytes32(address(this).code)) >> 16))));
    }

    function getAutoSwarmMarket() public view override(IAutoSwarmAccount) returns (AutoSwarmMarket) {
        return isTba() ? getImplementation().getAutoSwarmMarket() : _autoSwarmMarket;
    }

    function _setAutoSwarmMarket(AutoSwarmMarket autoSwarmMarket) private {
        if (address(autoSwarmMarket) == address(0)) revert AutoSwarmMarketNull();

        _autoSwarmMarket = autoSwarmMarket;

        emit SetAutoSwarmMarket(address(autoSwarmMarket));
    }
}
