import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './ore_upsertRight'

const getComposedAction = () => ({
  account: toEosEntityName('rights.ore'),
  name: toEosEntityName('upsertright'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    issuer: toEosEntityName('accountname'),
    right_name: 'test',
    urls: 'www.aikon.com',
    issuer_whitelist: [toEosEntityName('accountname')],
  },
})

const getDefaultArgs = () => ({
  contractName: 'rights.ore',
  issuerWhitelist: ['accountname'],
  oreAccountName: 'accountname',
  rightName: 'test',
  urls: 'www.aikon.com',
})

test('Compose OreUpsertRight object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes OreUpsertRight object', () => {
  const expAction = {
    chainActionType: 'OreUpsertRight',
    args: {
      contractName: 'rights.ore',
      issuerWhitelist: ['accountname'],
      oreAccountName: 'accountname',
      rightName: 'test',
      urls: 'www.aikon.com',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose OreUpsertRight', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
