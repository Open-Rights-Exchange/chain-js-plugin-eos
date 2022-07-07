// How to use fetch mocks - https://www.npmjs.com/package/jest-fetch-mock
import { Models } from '@open-rights-exchange/chain-js'
import { composeAction } from '../plugin/eosCompose'
import { EosChainActionType } from '../plugin/models'
import {
  composedCreateEscrowDefine,
  composedCreateEscrowInit,
  composedCreateEscrowReclaim,
  composedCreateEscrowTransfer,
  composedCreateEscrowWhitelist,
  composedEosTokenApprove,
  composedEosTokenCreate,
  composedEosTokenIssue,
  composedEosTokenRetire,
  composedEosTokenTransfer,
  composedEosTokenTransferFrom,
  composedOreCreateAccount,
  composedOreUpsertRight,
} from './mockups/composedActions'

describe('Compose Chain Actions', () => {
  // sets fetchMock to throw an error on the next call to fetch (jsonRpc.get_abi calls fetch and triggers the error to be thrown)

  it('creates createEscrow define action object', async () => {
    const args = {
      accountName: 'accountname',
      airdrop: {
        contract: 'airdroper',
        tokens: '0.0000 AIR',
        limit: '0.0000 AIR',
      },
      appName: 'app',
      contractName: 'createescrow',
      cpu: '1.0000 EOS',
      permission: 'active',
      net: '1.0000 EOS',
      pricekey: '1',
      ram: '0',
      rex: {},
      useRex: false,
    }
    const actAction = await composeAction(EosChainActionType.CreateEscrowDefine, args)
    expect(actAction).toEqual(composedCreateEscrowDefine)
  })

  it('creates createEscrow init action object', async () => {
    const args = {
      contractName: 'createescrow',
      chainSymbol: 'EOS,4',
      newAccountContract: 'eosio',
      newAccountAction: 'newaccount',
      minimumRAM: '0',
      permission: 'active',
    }
    const actAction = await composeAction(EosChainActionType.CreateEscrowInit, args)
    expect(actAction).toEqual(composedCreateEscrowInit)
  })

  it('creates createEscrow reclaim action object', async () => {
    const args = {
      accountName: 'accountname',
      appName: 'app',
      contractName: 'createescrow',
      permission: 'active',
      symbol: 'EOS,4',
    }
    const actAction = await composeAction(EosChainActionType.CreateEscrowReclaim, args)
    expect(actAction).toEqual(composedCreateEscrowReclaim)
  })

  it('creates createEscrow transfer action object', async () => {
    const args = {
      accountName: 'accountname',
      amount: '10.0000 EOS',
      contractName: 'createescrow',
      createEscrowAccountName: 'escrowname',
      memo: 'memo',
      permission: 'active',
    }
    const actActions = await composeAction(EosChainActionType.CreateEscrowTransfer, args)
    expect(actActions).toEqual(composedCreateEscrowTransfer)
  })

  it('creates createEscrow whitelist action object', async () => {
    const args = {
      accountName: 'accountname',
      appName: 'app',
      contractName: 'createescrow',
      permission: 'active',
      whitelistAccount: 'whitelisted',
    }
    const actAction = await composeAction(EosChainActionType.CreateEscrowWhitelist, args)
    expect(actAction).toEqual(composedCreateEscrowWhitelist)
  })

  it('creates eosToken approve action object', async () => {
    const args = {
      contractName: 'eosio.token',
      memo: 'memo',
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      amount: '5.0000',
      symbol: 'EOS',
      permission: 'active',
    }
    const actAction = await composeAction(EosChainActionType.EosTokenApprove, args)
    expect(actAction).toEqual(composedEosTokenApprove)
  })

  it('creates eosToken create action object', async () => {
    const args = {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      toAccountName: 'eosio.token',
      amount: '10000.0000',
      symbol: 'EOS',
      permission: 'active',
    }
    const actAction = await composeAction(EosChainActionType.EosTokenCreate, args)
    expect(actAction).toEqual(composedEosTokenCreate)
  })

  it('creates eosToken issue action object', async () => {
    const args = {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      toAccountName: 'eosio.token',
      amount: '1000.0000',
      symbol: 'EOS',
      memo: 'memoo',
      permission: 'active',
    }
    const actAction = await composeAction(EosChainActionType.EosTokenIssue, args)
    expect(actAction).toEqual(composedEosTokenIssue)
  })

  it('creates eosToken retire action object', async () => {
    const args = {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      amount: '1000.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    }
    const actAction = await composeAction(EosChainActionType.EosTokenRetire, args)
    expect(actAction).toEqual(composedEosTokenRetire)
  })

  it('creates eosToken transfer action object', async () => {
    const args = {
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      contractName: 'eosio.token',
      amount: '100.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    }
    const actAction = await composeAction(EosChainActionType.EosTokenTransfer, args)
    expect(actAction).toEqual(composedEosTokenTransfer)
  })

  it('creates eosToken transferFrom action object', async () => {
    const args = {
      approvedAccountName: 'approved',
      contractName: 'eosio.token',
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      amount: '100.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    }
    const actAction = await composeAction(EosChainActionType.EosTokenTransferFrom, args)
    expect(actAction).toEqual(composedEosTokenTransferFrom)
  })

  it('creates ore createAccout action object', async () => {
    const args = {
      accountName: 'accountname',
      creatorAccountName: 'creator',
      creatorPermission: 'active',
      publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      tier: '1',
      referralAccountName: 'referral',
    }
    const actAction = await composeAction(EosChainActionType.OreCreateAccount, args)
    expect(actAction).toEqual(composedOreCreateAccount)
  })

  it('creates ore upsertRight action object', async () => {
    const args = {
      contractName: 'rights.ore',
      issuerWhitelist: ['accountname'],
      oreAccountName: 'accountname',
      rightName: 'test',
      urls: 'www.aikon.com',
    }
    const actAction = await composeAction(EosChainActionType.OreUpsertRight, args)
    expect(actAction).toEqual(composedOreUpsertRight)
  })
})
