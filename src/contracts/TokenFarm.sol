pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";
// import "hardhat/console.sol";

contract TokenFarm {
	string public name = "Dapp Token Farm";

	address public owner;
	DappToken public dappToken;
	DaiToken public daiToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	// stake tokens (deposit)
	function stakeTokens(uint _amount) public {

		// transfer mock Dai tokens to this contract for staking
		daiToken.transferFrom(msg.sender, address(this), _amount);


		// update stakingBalance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		// add user as staker if they have not staked already
		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		// update staking status
		hasStaked[msg.sender] = true;
		isStaking[msg.sender] = true;
	}

	// Issuing tokens

	function issueTokens() public {
		// only owner can call this function
		require(msg.sender == owner, "caller must be owner");

		// issue dapp tokens to all stakers
		for (uint i = 0; i < stakers.length; i++) {
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			if (isStaking[recipient] && balance > 0) {
				dappToken.transfer(recipient, balance);
			}

		}
	}

	// unstake tokens (withdraw)
	function unstakeTokens() public {
		uint balance = stakingBalance[msg.sender];
		require(balance > 0, "no tokens being staked");

		// transfer mDai back to investor
		daiToken.transfer(msg.sender, balance);

		// set staking balance to 0 for investor
		stakingBalance[msg.sender] = 0;

		// update that investor no longer staking
		isStaking[msg.sender] = false;
	}
}