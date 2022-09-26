import { getChain } from '../tests/helpers'
import { ChainNetwork } from '../tests/mockups/chainConfig'
import { account1, account2, actionRawTransactionExpired1, actionSendTokenEos } from '../tests/mockups/eosTransactions'
import { Chain, Models, Transaction } from '@open-rights-exchange/chain-js'

describe('Transaction properties', () => {
  let chain: Chain
  let tx: Transaction
  let action: any

  beforeEach(async () => {
    chain = await getChain(ChainNetwork.EosJungle, true)
    tx = await chain.new.Transaction({})
    // const action = await chain.composeAction(Models.ChainActionType.TokenTransfer, actionTokenTransferStandard(account1, account2))
    action = actionSendTokenEos(account1, account2)
    await tx.setTransaction([action])
  })

  test('ExpiresOn throws before Tx prepareToBeSigned()', async () => {
    /** throws before prepared */
    await expect(tx.expiresOn()).rejects.toThrow('Transaction has not been prepared')
  })

  test('ExpiresOn and isExpired - valid transaction', async () => {
    await tx.prepareToBeSigned()
    expect(await tx.expiresOn()).toBeInstanceOf(Date)
    expect(await tx.isExpired()).toBeFalsy()
  })

  test('ExpiresOn and isExpired - expired transaction', async () => {
    await tx.setTransaction(actionRawTransactionExpired1.serializedTransaction)
    await tx.prepareToBeSigned()
    const expiredOn = await tx.expiresOn()
    expect(expiredOn.getTime() < Date.now()).toBeTruthy() // expiredOn in past
    expect(await tx.isExpired()).toBeTruthy()
  })

  test('calling fees functions throws `not supported`', async () => {
    await expect(tx.getSuggestedFee(Models.TxExecutionPriority.Fast)).rejects.toThrow('Not Supported')
    await expect(tx.setDesiredFee(null)).rejects.toThrow('Not Supported')
  })
})

describe('Transaction actions handling', () => {
  let chain: Chain
  let tx: Transaction
  let action: any
  let actionWithoutData: any
  let data: any // action.data property

  beforeEach(async () => {
    chain = await getChain(ChainNetwork.EosJungle, true)
    tx = await chain.new.Transaction({})
    action = actionSendTokenEos(account1, account2)
    ;({ data, ...actionWithoutData } = action)
  })

  test('ExpiresOn throws before Tx prepareToBeSigned()', async () => {
    /** throws before prepared */
    await expect(tx.expiresOn()).rejects.toThrow('Transaction has not been prepared')
  })

  test('transaction action setting works as expected', () => {
    expect(() => (tx.actions = [action])).not.toThrow()
    expect(() => (tx.actions = [action, action])).not.toThrow()
    // throws for bad values
    expect(() => (tx.actions = 'abc')).toThrow('actions must be an array and have at least one value')
    expect(() => (tx.actions = ['bad action'])).toThrow('Transaction action not well-formed')
    expect(() => (tx.actions = [actionWithoutData])).toThrow('Transaction action not well-formed')
  })

  test('transaction.addAction() works as expected', () => {
    expect(() => tx.addAction(action)).not.toThrow()
    // throws for bad values
    expect(() => tx.addAction(actionWithoutData)).toThrow('Transaction action not well-formed')
    expect(() => tx.addAction([actionWithoutData])).toThrow('Transaction action not well-formed')
  })

  test('setTransction works as expected', async () => {
    expect(() => tx.setTransaction([action, action])).not.toThrow()
    // throws for bad values
    await expect(() => tx.setTransaction([])).rejects.toThrow('actions must be an array and have at least one value')
    await expect(tx.setTransaction('abc')).rejects.toThrow(
      'Failed trying to set transaction. Value must be either: array of actions OR serialized transaction object. Error: Odd number of hex digits',
    )
  })
})
