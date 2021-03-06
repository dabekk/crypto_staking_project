const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function(deployer, network, accounts) {
  // deploy mock DAI token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // deploy Dapp token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // transfer all 1 million dapp tokens to TokenFarm - for yielding
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // transfer 100 mock Dai tokens to an inverstor
  await daiToken.transfer(accounts[1], '100000000000000000000')
}
