// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC20} from "./IERC20.sol";
import {IPostageStamp} from "./IPostageStamp.sol";

interface IAutoSwarmMarket {
    struct Stamp {
        bytes32 swarmHash;
        uint256 swarmSize;
        bytes32 batchId;
        uint256 normalisedBalance;
    }

    event BuyBatch(bytes32 indexed, uint256 indexed, uint8 indexed, uint256);
    event UpdateBatch(bytes32 indexed, uint8 indexed, uint256 indexed);
    event UpdateStampsUnitPrice(uint256);

    function bzzToken() external view returns (IERC20);
    function getStampsUnitPriceOneYear() external view returns (uint256);
    function getStampPriceOneYear(uint256) external view returns (uint256);
    function isStampActive(bytes32) external returns (bool);
    function getStampsCount() external view returns (uint256);
    function getStamps(bytes32[] memory) external view returns (Stamp[] memory);
    function getStampIdsToAttach(uint256, uint256) external view returns (bytes32[] memory);
    function getMbSize(uint256) external pure returns (uint256);
    function batchPrice() external view returns (uint256);

    function createStamp(bytes32, uint256, uint256) external returns (bytes32);
    function updateStamp(bytes32, bytes32, uint256) external;
    function topUpStamp(bytes32, uint256) external;

    function setBatch(address, bytes32, uint256) external;
    function extendsBatch(bytes32, uint8) external;

    function sync() external returns (bytes32);

    function stampsUnitPrice() external view returns (uint256);
    function stampsTotalOutPayment() external view returns (uint256);
    function setStampsUnitPrice(uint256) external;
    function setStampsSize(bytes32[] memory, uint256) external;
    function setStampsAttached(bytes32[] memory, bytes32) external;
    function newBatchNeeded() external view returns (bool);
}
