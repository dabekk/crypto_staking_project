const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

require("chai")
	.use(require("chai-as-promised"))
	.should()

function tokens(n) {
	return web3.utils.toWei(n, "ether")
}

contract("TokenFarm", ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm

	before(async () => {
		// load contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

		// transfer all Dapp tokens to token farm
		await dappToken.transfer(tokenFarm.address, tokens('1000000'))

		// send initial Dai tokens to investor
		await daiToken.transfer(investor, tokens('100'), { from: owner })

	})

	describe('Mock DAI token Deployment', async () => {
		it('has a name', async () => {
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Dapp token Deployment', async () => {
		it('has a name', async () => {
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe('TokenFarm Deployment', async () => {
		it('has a name', async () => {
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm')
		})

		it('contract has tokens', async () => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe("Farming tokens", async () => {

		let result

		it("validate investor staking of mDai tokens", async () => {
			// check mDai balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), "investor mock Dai balance correct before staking")

			// stake mock Dai tokens
			await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
			await tokenFarm.stakeTokens(tokens('100'), { from: investor })

			// check staking results
			result = await daiToken.balanceOf(investor)
			assert.equal(result, tokens('0'), "investor mDai wallet correct after staking")

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result, tokens('100'), "Token Farm received mDai from investor successfully")

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), "Staking balance of investor correctly set in Token Farm")

			result = await tokenFarm.hasStaked(investor)
			assert.equal(result, true, "investor has staked successfully")

			result = await tokenFarm.isStaking(investor)
			assert.equal(result, true, "investor currently staking successfully")

		})

		it("validate staking rewards issued correctly", async () => {
			await tokenFarm.issueTokens({ from: owner })

			// check balance after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), "investor staking rewarded correctly")

			// only owner can issue dapp tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected
		})

		it("validate investor unstaking", async () => {
			await tokenFarm.unstakeTokens({ from: investor })

			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), "investor received staked mDai tokens back")

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), "Token Farm no longer has staked")

			result = await tokenFarm.isStaking(investor)
			assert.equal(result, false, "investor no longer staking")

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), "investor staking balance 0")
		})

	})

})