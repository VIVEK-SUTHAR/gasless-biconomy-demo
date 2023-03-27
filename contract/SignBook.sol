//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

//Trusted Forwarder Contract: User signs txns and else is handles by biconomy
//NO need to write code for getting signature form user, biconomy handles all this
//No need to check r,s,v bytes of eth signature
//just populate txn

contract SignBook is ERC2771Context {
    struct Visitor {
        address from;
        string message;
        uint256 timestamp;
    }

    Visitor[] visitors;

    constructor(address trustedForwarder)
        ERC2771Context(address(trustedForwarder))
    {}

    function getVisitors() public view returns (Visitor[] memory) {
        return visitors;
    }

    function addVisitor(string calldata message_, address from) public {
        visitors.push(Visitor(from, message_, block.timestamp));
    }
}
