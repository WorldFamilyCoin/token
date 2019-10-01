const MultiSigWalletWFC = artifacts.require('MultiSigWalletWFC')
const WorldFamilyCoinToken = artifacts.require('WorldFamilyCoinToken')
const TokenVestingWFCTeam = artifacts.require('TokenVestingTeamWFC')
const TokenVestingWFCSingle = artifacts.require('TokenVestingSingleWFC')
module.exports = async function (deployer, network, accounts) {
  var cliff, duration
  if (network === 'development') {
    cliff = 20
    duration = 120
  } else {
    cliff = 600
    duration = 1800
  }
  const initialamount = 2000000000
  const totaltokens = web3.utils.toWei(initialamount.toString(), 'ether')
  await deployer.deploy(WorldFamilyCoinToken, 'World Family Coin', 'WFC', 18, totaltokens, accounts[0], { from: accounts[9], gas: 1100000 })
  const owners = [accounts[1], accounts[2], accounts[3]]
  await deployer.deploy(MultiSigWalletWFC, owners, 2, { from: accounts[9], gas: 1900000 })
  var date = new Date()
  var secondsDate = Math.round(date.getTime() / 1000)
  await deployer.deploy(TokenVestingWFCTeam, MultiSigWalletWFC.address, secondsDate, cliff, duration, { from: accounts[9], gas: 880000 })
  date = new Date()
  secondsDate = Math.round(date.getTime() / 1000)
  await deployer.deploy(TokenVestingWFCSingle, accounts[4], secondsDate, cliff, duration, { from: accounts[9], gas: 880000 })
}
