const WorldFamilyCoinToken = artifacts.require('WorldFamilyCoinToken')
const MultiSigWalletWFC = artifacts.require('MultiSigWalletWFC')
const TokenVestingWFCTeam = artifacts.require('TokenVestingTeamWFC')
const TokenVestingWFCSingle = artifacts.require('TokenVestingSingleWFC')
const truffleAssert = require('truffle-assertions')

contract('WFC testing', async (accounts) => {
  // Testing correct work of ERC20 contract
  it('ERC20 token testing', async () => {
    const firstaccount = accounts[0]
    const secondaccount = accounts[1]
    const thirdaccount = accounts[2]
    const fourthaccount = accounts[3]
    const InstanceWorldFamilyCoinToken = await WorldFamilyCoinToken.deployed()
    function getRandomInt (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min)) + min
    }
    const totalsupply = web3.utils.fromWei((await InstanceWorldFamilyCoinToken.totalSupply.call()).toString(), 'ether')
    const amount1 = getRandomInt(0, totalsupply)
    const erc20Transfer = await InstanceWorldFamilyCoinToken.transfer(secondaccount, web3.utils.toWei(amount1.toString()), { from: firstaccount, gas: 60000 })
    var secondAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(secondaccount))
    assert.equal(secondAccountWFMbalance, web3.utils.toWei(amount1.toString()), 'Wrong balance of receiver')
    truffleAssert.eventEmitted(erc20Transfer, 'Transfer', (ev) => {
      return ev.from == firstaccount && ev.to == secondaccount && web3.utils.fromWei(ev.value) == amount1
    })
    var randomamount = getRandomInt(0, 1000000000)
    await truffleAssert.reverts(InstanceWorldFamilyCoinToken.transfer(firstaccount, secondAccountWFMbalance + randomamount, { from: secondaccount, gas: 60000 }))
    var firstAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(firstaccount))
    assert.equal(firstAccountWFMbalance, web3.utils.toWei((totalsupply - amount1).toString()), 'Wrong balance of sender')
    const amount2 = getRandomInt(0, web3.utils.fromWei(secondAccountWFMbalance))
    const erc20Approve = await InstanceWorldFamilyCoinToken.approve(thirdaccount, web3.utils.toWei(amount2.toString()), { from: secondaccount, gas: 50000 })
    var allowancesecondthird = web3.utils.toBN(await InstanceWorldFamilyCoinToken.allowance.call(secondaccount, thirdaccount))
    assert.equal(allowancesecondthird, web3.utils.toWei(amount2.toString()), 'Wrong allowance between second and third account')
    truffleAssert.eventEmitted(erc20Approve, 'Approval', (ev) => {
      return ev.owner == secondaccount && ev.spender == thirdaccount && web3.utils.fromWei(ev.value) == amount2
    })
    const amount3 = getRandomInt(0, web3.utils.fromWei(secondAccountWFMbalance) - amount2)
    await InstanceWorldFamilyCoinToken.increaseAllowance(thirdaccount, web3.utils.toWei(amount3.toString()), { from: secondaccount, gas: 40000 })
    allowancesecondthird = web3.utils.toBN(await InstanceWorldFamilyCoinToken.allowance.call(secondaccount, thirdaccount))
    assert.equal(allowancesecondthird, web3.utils.toWei((amount2 + amount3).toString()), 'Wrong allowance between second and third account after increase')
    await truffleAssert.reverts(InstanceWorldFamilyCoinToken.decreaseAllowance(thirdaccount, secondAccountWFMbalance + 1000, { from: secondaccount, gas: 40000 }))
    const amount4 = getRandomInt(0, amount2 + amount3)
    await InstanceWorldFamilyCoinToken.decreaseAllowance(thirdaccount, web3.utils.toWei(amount4.toString()), { from: secondaccount, gas: 40000 })
    allowancesecondthird = web3.utils.toBN(await InstanceWorldFamilyCoinToken.allowance.call(secondaccount, thirdaccount))
    assert.equal(allowancesecondthird, web3.utils.toWei((amount2 + amount3 - amount4).toString()), 'Wrong allowance between second and third account after decrease')
    const amount5 = getRandomInt(0, web3.utils.fromWei(allowancesecondthird))
    var secondAccountWFMbalanceold = secondAccountWFMbalance
    var allowancesecondthirdold = allowancesecondthird
    await InstanceWorldFamilyCoinToken.transferFrom(secondaccount, fourthaccount, web3.utils.toWei(amount5.toString()), { from: thirdaccount, gas: 70000 })
    await truffleAssert.reverts(InstanceWorldFamilyCoinToken.transferFrom(secondaccount, fourthaccount, allowancesecondthird, { from: thirdaccount, gas: 70000 }))
    var fourthAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(fourthaccount))
    assert.equal(fourthAccountWFMbalance, web3.utils.toWei(amount5.toString()), 'Wrong balance of receiver with transfer from')
    secondAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(secondaccount))
    var diffsecondbalance = web3.utils.toWei((web3.utils.fromWei(secondAccountWFMbalanceold) - web3.utils.fromWei(secondAccountWFMbalance)).toString())
    assert.equal(diffsecondbalance, web3.utils.toWei(amount5.toString()), 'Wrong balance of sender with transfer from')
    allowancesecondthird = web3.utils.toBN(await InstanceWorldFamilyCoinToken.allowance.call(secondaccount, thirdaccount))
    var diffsecondthirdallowance = web3.utils.toWei((web3.utils.fromWei(allowancesecondthirdold) - web3.utils.fromWei(allowancesecondthird)).toString())
    assert.equal(diffsecondthirdallowance, web3.utils.toWei(amount5.toString()), 'Wrong allowance with transfer from')
    const amount6 = getRandomInt(0, web3.utils.fromWei(firstAccountWFMbalance))
    firstAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(firstaccount))
    var firstAccountWFMbalanceold = firstAccountWFMbalance
    await InstanceWorldFamilyCoinToken.burn(web3.utils.toWei(amount6.toString()), { from: firstaccount, gas: 40000 })
    await truffleAssert.reverts(InstanceWorldFamilyCoinToken.burn(firstAccountWFMbalance, { from: firstaccount, gas: 40000 }))
    firstAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(firstaccount))
    var diffirstbalance = web3.utils.toWei((web3.utils.fromWei(firstAccountWFMbalanceold) - web3.utils.fromWei(firstAccountWFMbalance)).toString())
    assert.equal(diffirstbalance, web3.utils.toWei(amount6.toString()), 'Wrong balance of sender with burn')
    const amount7 = getRandomInt(0, web3.utils.fromWei(allowancesecondthird))
    secondAccountWFMbalanceold = secondAccountWFMbalance
    allowancesecondthirdold = allowancesecondthird
    await InstanceWorldFamilyCoinToken.burnFrom(secondaccount, web3.utils.toWei(amount7.toString()), { from: thirdaccount, gas: 50000 })
    await truffleAssert.reverts(InstanceWorldFamilyCoinToken.burnFrom(secondaccount, allowancesecondthird, { from: thirdaccount, gas: 50000 }))
    secondAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(secondaccount))
    diffsecondbalance = web3.utils.toWei((web3.utils.fromWei(secondAccountWFMbalanceold) - web3.utils.fromWei(secondAccountWFMbalance)).toString())
    assert.equal(diffsecondbalance, web3.utils.toWei(amount7.toString()), 'Wrong balance of sender with transfer from')
    allowancesecondthird = web3.utils.toBN(await InstanceWorldFamilyCoinToken.allowance.call(secondaccount, thirdaccount))
    diffsecondthirdallowance = web3.utils.toWei((web3.utils.fromWei(allowancesecondthirdold) - web3.utils.fromWei(allowancesecondthird)).toString())
    assert.equal(diffsecondthirdallowance, web3.utils.toWei(amount7.toString()), 'Wrong allowance with transfer from')
    const logFlag = false
    if (logFlag === true) {
      const eventsWorldFamilyCoinToken = await InstanceWorldFamilyCoinToken.getPastEvents('allEvents', { fromBlock: 0 })
      console.log(eventsWorldFamilyCoinToken)
    }
  })
  // Testing correct work of vesting contract with EOA account like beneficiary
  it('Token vesting contract with EOA beneficiary', async () => {
    const firstaccount = accounts[0]
    const secondaccount = accounts[4]
    const InstanceWorldFamilyCoinToken = await WorldFamilyCoinToken.deployed()
    const InstanceMTokenVestingWFCSingle = await TokenVestingWFCSingle.deployed()
    function getRandomInt (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min)) + min
    }
    function timeout (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
    const beneficiary = await InstanceMTokenVestingWFCSingle.beneficiary.call()
    const cliff = web3.utils.toBN(await InstanceMTokenVestingWFCSingle.cliff.call())
    const start = web3.utils.toBN(await InstanceMTokenVestingWFCSingle.start.call())
    const duration = web3.utils.toBN(await InstanceMTokenVestingWFCSingle.duration.call())
    const effectivetimeinterval = (start.add(duration)).sub(cliff)
    const WFCtokenaddress = await InstanceWorldFamilyCoinToken.address
    assert.equal(secondaccount, beneficiary, 'wrong beneficiary')
    var firstAccountWFMbalance = await InstanceWorldFamilyCoinToken.balanceOf.call(firstaccount)
    const amount1 = getRandomInt(0, web3.utils.fromWei(firstAccountWFMbalance))
    const TokenVestingWFMaddress = await InstanceMTokenVestingWFCSingle.address
    await InstanceWorldFamilyCoinToken.transfer(TokenVestingWFMaddress, web3.utils.toWei(amount1.toString()), { from: firstaccount, gas: 60000 })
    var TokenVestingWFMbalancestandard = await InstanceWorldFamilyCoinToken.balanceOf.call(TokenVestingWFMaddress)
    assert.equal(web3.utils.toWei(amount1.toString()), TokenVestingWFMbalancestandard, 'wrong token vesting balance')
    var date = new Date()
    var actualtime = Math.round(date.getTime() / 1000)
    if (actualtime < cliff) {
      await timeout((cliff - actualtime) * 1000 + 30000)
    } else {
      await timeout(30000)
    }
    var TokenVestingWFMbalance = web3.utils.toBN(TokenVestingWFMbalancestandard)
    var TokenVestingWFMbalanceold = TokenVestingWFMbalance
    var secondAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(secondaccount))
    var secondAccountWFMbalanceold = secondAccountWFMbalance
    const transaction1 = await InstanceMTokenVestingWFCSingle.release(WFCtokenaddress, { from: accounts[9], gas: 90000 })
    secondAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(secondaccount))
    TokenVestingWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(TokenVestingWFMaddress))
    var diffsecondabalance = web3.utils.toBN(secondAccountWFMbalance.sub(secondAccountWFMbalanceold))
    var diffvestingWFMbalance = web3.utils.toBN(TokenVestingWFMbalanceold.sub(TokenVestingWFMbalance))
    var blocknumber = transaction1.receipt.blockNumber
    var blocktimestamp
    while (blocktimestamp === undefined) {
      await web3.eth.getBlock(blocknumber, function (error, result) {
        if (!error && result !== null) {
          blocktimestamp = result.timestamp
        }
      })
    }
    var released = web3.utils.toBN(web3.utils.toBN(TokenVestingWFMbalanceold.mul(web3.utils.toBN(blocktimestamp - start))).div(web3.utils.toBN(duration)))
    assert.equal(released.sub(diffsecondabalance), 0, 'wrong second balance')
    assert.equal(diffvestingWFMbalance.sub(diffsecondabalance), 0, 'wrong vesting balance')
    truffleAssert.eventEmitted(transaction1, 'TokensReleased', (ev) => {
      return ev.token == InstanceWorldFamilyCoinToken.address && web3.utils.fromWei(ev.amount) == web3.utils.fromWei(released)
    })
    secondAccountWFMbalanceold = secondAccountWFMbalance
    TokenVestingWFMbalanceold = TokenVestingWFMbalance
    var previousreleased = web3.utils.toBN(await InstanceMTokenVestingWFCSingle.released.call(WFCtokenaddress))
    const timeout2 = getRandomInt(effectivetimeinterval * 400, effectivetimeinterval * 500)
    await timeout(timeout2)
    const transaction2 = await InstanceMTokenVestingWFCSingle.release(WFCtokenaddress, { from: accounts[9], gas: 90000 })
    secondAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(secondaccount))
    TokenVestingWFMbalance = (await InstanceWorldFamilyCoinToken.balanceOf.call(TokenVestingWFMaddress))
    diffsecondabalance = web3.utils.toBN(secondAccountWFMbalance.sub(secondAccountWFMbalanceold))
    diffvestingWFMbalance = web3.utils.toBN(TokenVestingWFMbalanceold.sub(TokenVestingWFMbalance))
    var blocknumber2 = transaction2.receipt.blockNumber
    var blocktimestamp2
    while (blocktimestamp2 === undefined) {
      await web3.eth.getBlock(blocknumber2, function (error, result) {
        if (!error && result !== null) {
          blocktimestamp2 = result.timestamp
        }
      })
    }
    var totalreleased = web3.utils.toBN(((TokenVestingWFMbalanceold.add(previousreleased)).mul(web3.utils.toBN(blocktimestamp2 - start))).div(web3.utils.toBN(duration)))
    released = web3.utils.toBN(totalreleased.sub(previousreleased))
    assert.equal(diffsecondabalance.sub(released), 0, 'wrong second release to beneficiary')
    assert.equal(diffvestingWFMbalance.sub(diffsecondabalance), 0, released, 'wrong second release from vesting contract')
    truffleAssert.eventEmitted(transaction2, 'TokensReleased', (ev) => {
      return ev.token == InstanceWorldFamilyCoinToken.address && web3.utils.fromWei(ev.amount) == web3.utils.fromWei(released)
    })
    await timeout(effectivetimeinterval * 600)
    await InstanceMTokenVestingWFCSingle.release(WFCtokenaddress, { from: accounts[9], gas: 90000 })
    secondAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(secondaccount))
    TokenVestingWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(TokenVestingWFMaddress))
    assert.equal(TokenVestingWFMbalance, 0, 'wrong final vesting balance')
    assert.equal(secondAccountWFMbalance, web3.utils.toWei(amount1.toString()), 'wrong final vesting balance')
    await truffleAssert.reverts(InstanceMTokenVestingWFCSingle.release(WFCtokenaddress, { from: accounts[9], gas: 90000 }))
    const logFlag = false
    if (logFlag === true) {
      const eventsWorldFamilyCoinToken = await InstanceWorldFamilyCoinToken.getPastEvents('allEvents', { fromBlock: 0 })
      const eventsTokenVestingWFCSingle = await InstanceMTokenVestingWFCSingle.getPastEvents('allEvents', { fromBlock: 0 })
      console.log(eventsWorldFamilyCoinToken)
      console.log(eventsTokenVestingWFCSingle)
    }
  })
  // Testing multisig wallet like beneficiary of a vesting contract
  it('Token vesting with multisignature beneficiary', async () => {
    const firstaccount = accounts[0]
    const secondaccount = accounts[1]
    const thirdaccount = accounts[2]
    const fourthaccount = accounts[3]
    const fifthaccount = accounts[5]
    const sixthaccount = accounts[6]
    const seventhaccount = accounts[7]
    const InstanceMultiSigWalletWFC = await MultiSigWalletWFC.deployed()
    const InstanceWorldFamilyCoinToken = await WorldFamilyCoinToken.deployed()
    const InstanceMTokenVestingWFCTeam = await TokenVestingWFCTeam.deployed()
    function getRandomInt (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min)) + min
    }
    function timeout (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
    const beneficiary = await InstanceMTokenVestingWFCTeam.beneficiary.call()
    assert.equal(beneficiary, InstanceMultiSigWalletWFC.address, 'wrong beneficiary')
    const cliff = await InstanceMTokenVestingWFCTeam.cliff.call()
    const WFCtokenaddress = await InstanceWorldFamilyCoinToken.address
    var firstAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(firstaccount))
    const amount1 = getRandomInt(0, web3.utils.fromWei(firstAccountWFMbalance))
    const TokenVestingWFMaddress = await InstanceMTokenVestingWFCTeam.address
    await InstanceWorldFamilyCoinToken.transfer(TokenVestingWFMaddress, web3.utils.toWei(amount1.toString()), { from: firstaccount })
    var TokenVestingWFMbalancestandard = await InstanceWorldFamilyCoinToken.balanceOf.call(TokenVestingWFMaddress)
    assert.equal(web3.utils.toWei(amount1.toString()), TokenVestingWFMbalancestandard, 'wrong token vesting balance')
    var date = new Date()
    var actualtime = Math.round(date.getTime() / 1000)
    if (actualtime < cliff) {
      await timeout((cliff - actualtime) * 1000 + 10000)
    } else {
      await timeout(10000)
    }
    await InstanceMTokenVestingWFCTeam.release(WFCtokenaddress, { from: accounts[9] })
    var multisigbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(beneficiary))
    var released = web3.utils.toBN(await InstanceMTokenVestingWFCTeam.released.call(WFCtokenaddress))
    assert.equal(multisigbalance.sub(released), 0, 'wrong multisig balance')
    const amount2 = getRandomInt(0, web3.utils.fromWei(multisigbalance))
    var bytes = web3.eth.abi.encodeFunctionCall({
      name: 'transfer',
      type: 'function',
      inputs: [{
        type: 'address',
        name: 'recipient'
      }, {
        type: 'uint256',
        name: 'amount'
      }]
    }, [fifthaccount, web3.utils.toWei(amount2.toString())])
    var fifthAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(fifthaccount))
    const transactionSubmission = await InstanceMultiSigWalletWFC.submitTransaction(WFCtokenaddress, 0, bytes, { from: thirdaccount })
    var objecttransaction = await InstanceMultiSigWalletWFC.transactions.call(0).then(object => object)
    assert.equal(objecttransaction.data, bytes, 'wrong data')
    assert.equal(objecttransaction.destination, WFCtokenaddress, 'wrong destination')
    truffleAssert.eventEmitted(transactionSubmission, 'Submission', (ev) => {
      return ev.transactionId == 0
    })
    truffleAssert.eventEmitted(transactionSubmission, 'Confirmation', (ev) => {
      return ev.sender == thirdaccount && ev.transactionId == 0
    })
    await truffleAssert.reverts(InstanceMultiSigWalletWFC.submitTransaction(WFCtokenaddress, 0, bytes, { from: sixthaccount }))
    var numberofconfirmation = await InstanceMultiSigWalletWFC.getConfirmationCount.call(0)
    assert(numberofconfirmation, 1, 'wrong first number of confirmations')
    var confirmationaddresses = await InstanceMultiSigWalletWFC.getConfirmations.call(0)
    assert.equal(confirmationaddresses[0], thirdaccount, 'wrong first array of confirmation address')
    await truffleAssert.reverts(InstanceMultiSigWalletWFC.confirmTransaction(0, { from: thirdaccount }))
    await truffleAssert.reverts(InstanceMultiSigWalletWFC.confirmTransaction(1, { from: secondaccount }))
    await truffleAssert.reverts(InstanceMultiSigWalletWFC.executeTransaction(0, { from: secondaccount }))
    const TransactionConfirmation = await InstanceMultiSigWalletWFC.confirmTransaction(0, { from: secondaccount })
    numberofconfirmation = await InstanceMultiSigWalletWFC.getConfirmationCount.call(0)
    assert(numberofconfirmation, 2, 'wrong second number of confirmations')
    confirmationaddresses = await InstanceMultiSigWalletWFC.getConfirmations.call(0)
    assert.equal(confirmationaddresses[0], secondaccount, 'wrong second array of confirmation address-first address')
    assert.equal(confirmationaddresses[1], thirdaccount, 'wrong second array of confirmation address-second address')
    truffleAssert.eventEmitted(TransactionConfirmation, 'Execution', (ev) => {
      return ev.transactionId == 0
    })
    var multisigbalanceold = multisigbalance
    multisigbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(beneficiary))
    var fifthAccountWFMbalanceold = fifthAccountWFMbalance
    fifthAccountWFMbalance = web3.utils.toBN(await InstanceWorldFamilyCoinToken.balanceOf.call(fifthaccount))
    released = web3.utils.toBN(web3.utils.toWei(amount2.toString()))
    assert.equal(released.sub(multisigbalanceold.sub(multisigbalance)), 0, 'wrong balance of multisig wallet')
    assert.equal(released.sub(fifthAccountWFMbalance.sub(fifthAccountWFMbalanceold)), 0, 'wrong balance of multisig transaction beneficiary')
    await truffleAssert.reverts(InstanceMultiSigWalletWFC.executeTransaction(0, { from: secondaccount }))
    var bytes2 = web3.eth.abi.encodeFunctionCall({
      name: 'addOwner',
      type: 'function',
      inputs: [{
        type: 'address',
        name: 'owner'
      }]
    }, [sixthaccount])
    await InstanceMultiSigWalletWFC.submitTransaction(InstanceMultiSigWalletWFC.address, 0, bytes2, { from: fourthaccount })
    const TransactionaddOwner = await InstanceMultiSigWalletWFC.confirmTransaction(1, { from: thirdaccount })
    var owners = await InstanceMultiSigWalletWFC.getOwners.call()
    assert.equal(owners[0], secondaccount, 'wrong first owner')
    assert.equal(owners[1], thirdaccount, 'wrong second owner')
    assert.equal(owners[2], fourthaccount, 'wrong third owner')
    assert.equal(owners[3], sixthaccount, 'wrong fourth owner')
    truffleAssert.eventEmitted(TransactionaddOwner, 'OwnerAddition', (ev) => {
      return ev.owner == sixthaccount
    })
    var bytes3 = web3.eth.abi.encodeFunctionCall({
      name: 'changeRequirement',
      type: 'function',
      inputs: [{
        type: 'uint256',
        name: '_required'
      }]
    }, ['3'])
    await InstanceMultiSigWalletWFC.submitTransaction(InstanceMultiSigWalletWFC.address, 0, bytes3, { from: secondaccount })
    const transactionChangeReq = await InstanceMultiSigWalletWFC.confirmTransaction(2, { from: sixthaccount })
    var required = await InstanceMultiSigWalletWFC.required.call()
    assert.equal(required, 3, 'wrong required number')
    truffleAssert.eventEmitted(transactionChangeReq, 'RequirementChange', (ev) => {
      return ev.required == 3
    })
    var bytes4 = web3.eth.abi.encodeFunctionCall({
      name: 'replaceOwner',
      type: 'function',
      inputs: [{
        type: 'address',
        name: 'owner'
      }, {
        type: 'address',
        name: 'newOwner'
      }]
    }, [secondaccount, seventhaccount])
    await InstanceMultiSigWalletWFC.submitTransaction(InstanceMultiSigWalletWFC.address, 0, bytes4, { from: thirdaccount })
    await InstanceMultiSigWalletWFC.confirmTransaction(3, { from: sixthaccount })
    await InstanceMultiSigWalletWFC.confirmTransaction(3, { from: fourthaccount })
    owners = await InstanceMultiSigWalletWFC.getOwners.call()
    assert.equal(owners[0], seventhaccount, 'wrong first owner-second test')
    assert.equal(owners[1], thirdaccount, 'wrong second owner-second test')
    assert.equal(owners[2], fourthaccount, 'wrong third owner-second test')
    assert.equal(owners[3], sixthaccount, 'wrong fourth owner-second test')
    var bytes5 = web3.eth.abi.encodeFunctionCall({
      name: 'removeOwner',
      type: 'function',
      inputs: [{
        type: 'address',
        name: 'owner'
      }]
    }, [thirdaccount])
    await InstanceMultiSigWalletWFC.submitTransaction(InstanceMultiSigWalletWFC.address, 0, bytes5, { from: thirdaccount })
    await InstanceMultiSigWalletWFC.confirmTransaction(4, { from: fourthaccount })
    await InstanceMultiSigWalletWFC.confirmTransaction(4, { from: seventhaccount })
    owners = await InstanceMultiSigWalletWFC.getOwners.call()
    assert.equal(owners[0], seventhaccount, 'wrong first owner-third test')
    assert.equal(owners[1], sixthaccount, 'wrong second owner-third test')
    assert.equal(owners[2], fourthaccount, 'wrong third owner-third test')
    required = await InstanceMultiSigWalletWFC.required.call()
    assert.equal(required, 3, 'wrong required number-second test')
    var bytes6 = web3.eth.abi.encodeFunctionCall({
      name: 'removeOwner',
      type: 'function',
      inputs: [{
        type: 'address',
        name: 'owner'
      }]
    }, [fourthaccount])
    await InstanceMultiSigWalletWFC.submitTransaction(InstanceMultiSigWalletWFC.address, 0, bytes6, { from: seventhaccount })
    await InstanceMultiSigWalletWFC.confirmTransaction(5, { from: fourthaccount })
    const transactionOwnerRem = await InstanceMultiSigWalletWFC.confirmTransaction(5, { from: sixthaccount })
    owners = await InstanceMultiSigWalletWFC.getOwners.call()
    assert.equal(owners[0], seventhaccount, 'wrong first owner-fourth test')
    assert.equal(owners[1], sixthaccount, 'wrong second owner-fourth test')
    truffleAssert.eventEmitted(transactionOwnerRem, 'OwnerRemoval', (ev) => {
      return ev.owner == fourthaccount
    })
    required = await InstanceMultiSigWalletWFC.required.call()
    assert.equal(required, 2, 'wrong required number-third test')
    const logFlag = false
    if (logFlag === true) {
      const eventsWorldFamilyCoinToken = await InstanceWorldFamilyCoinToken.getPastEvents('allEvents', { fromBlock: 0 })
      const eventsTokenVestingWFCTeam = await InstanceMTokenVestingWFCTeam.getPastEvents('allEvents', { fromBlock: 0 })
      const eventsMultiSigWalletWFC = await InstanceMultiSigWalletWFC.getPastEvents('allEvents', { fromBlock: 0 })
      console.log(eventsWorldFamilyCoinToken)
      console.log(eventsTokenVestingWFCTeam)
      console.log(eventsMultiSigWalletWFC)
    }
  })
})
