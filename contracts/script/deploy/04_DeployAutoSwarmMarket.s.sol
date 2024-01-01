// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {DeployLite} from "@forge-deploy-lite/DeployLite.s.sol";
import {AutoSwarmMarket} from "@autoswarm/src/AutoSwarmMarket.sol";
import {console} from "forge-std/console.sol";

contract DeployAutoSwarmMarket is DeployLite {
    function deployAutoSwarmMarket() public returns (address autoSwarmMarketAddress) {
        address postageStamp = deploy("PostageStamp", false);
        address swarmNode = readAddress("SwarmNode");

        vm.startBroadcast(deployer);
        AutoSwarmMarket autoSwarmMarket = new AutoSwarmMarket(postageStamp, swarmNode);
        vm.stopBroadcast();

        autoSwarmMarketAddress = address(autoSwarmMarket);
    }

    function run() public virtual {
        deploy("AutoSwarmMarket");
    }
}
