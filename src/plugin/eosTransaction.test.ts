import { getChain } from '../tests/helpers'
import { ChainNetwork } from '../tests/mockups/chainConfig'
import { account1, account2, actionRawTransactionExpired1, actionSendTokenEos } from '../tests/mockups/eosTransactions'
import { Chain, Models, Transaction } from '@open-rights-exchange/chain-js'
import { startVCR, stopVCR } from '../tests/mockups/VCR'
import keys from '../tests/mockups/keys'
import nock from 'nock'

jest.setTimeout(100000)
nock.disableNetConnect()

describe('Transaction properties', () => {
  let chain: Chain
  let tx: Transaction
  let action: any

  beforeEach(async () => {
    await startVCR()
    chain = await getChain(ChainNetwork.EosKylin, true)
    tx = await chain.new.Transaction({})
    action = actionSendTokenEos(account1, account2)
    await tx.setTransaction([action])
  })
  afterEach(async () => {
    await stopVCR()
  })

  test('ExpiresOn throws before Tx prepareToBeSigned()', async () => {
    /** throws before prepared */
    await expect(tx.expiresOn()).rejects.toThrow('Transaction has not been prepared')
  })

  test('ExpiresOn and isExpired - valid transaction', async () => {
    await tx.prepareToBeSigned()
    expect(await tx.expiresOn()).toBeInstanceOf(Date)
    expect(await tx.isExpired()).toBeFalsy()

    await tx.validate()
    await tx.sign([keys.eos_kylin_privateKey])
    await tx.send()
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
    expect(true).toEqual(true)
  })
})
