import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './ore_createAccount'

const getComposedAction = () => ({
  account: toEosEntityName('system.ore'),
  name: toEosEntityName('createoreacc'),
  authorization: [
    {
      actor: toEosEntityName('creator'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    creator: toEosEntityName('creator'),
    newname: toEosEntityName('accountname'), // Some versions of the system contract are running a different version of the newaccount code
    ownerkey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    activekey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    tier: '1',
    referral: 'referral',
  },
})

const getDefaultArgs = () => ({
  accountName: 'accountname',
  creatorAccountName: 'creator',
  creatorPermission: 'active',
  publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  tier: '1',
  referralAccountName: 'referral',
})

test('Compose OreCreateAccount object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes OreCreateAccount object', () => {
  const expAction = {
    chainActionType: 'OreCreateAccount',
    args: {
      accountName: 'accountname',
      creatorAccountName: 'creator',
      creatorPermission: 'active',
      publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      tier: '1',
      referralAccountName: 'referral',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose OreCreateAccount', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
