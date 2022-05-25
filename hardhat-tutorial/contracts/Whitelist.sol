//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {

    // Max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    //create a mapping of whitelistedAddresses
    //If an address is whitelisted, set it to true. It is false by default to other addresses

    mapping(address => bool) public whitelistedAddresses;

    uint8 public numAddressesWhitelisted;

    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addAddressToWhitelist() public {

        require(!whitelistedAddresses[msg.sender], "Sender has already been added to Whitelist. We're trying to get this going.");

        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses cant be added. Limit reached.");

        whitelistedAddresses[msg.sender] = true;

        numAddressesWhitelisted +=1;
    }
}