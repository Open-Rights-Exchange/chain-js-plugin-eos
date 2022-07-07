import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './createEscrow_define'

const getComposedAction = () => ({
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('define'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    owner: toEosEntityName('accountname'),
    dapp: 'app',
    ram_bytes: '0',
    net: '1.0000 EOS',
    cpu: '1.0000 EOS',
    pricekey: '1',
    airdrop: {
      contract: toEosEntityName('airdroper'),
      tokens: '0.0000 AIR',
      limit: '0.0000 AIR',
    },
    rex: {},
    use_rex: false,
  },
})

const getDefaultArgs = () => ({
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
})

test('Compose a action object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes action object', () => {
  const expAction = {
    chainActionType: 'CreateEscrowDefine',
    args: {
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
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
