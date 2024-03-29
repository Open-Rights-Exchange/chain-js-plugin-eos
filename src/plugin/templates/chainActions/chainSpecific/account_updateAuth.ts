import { Models } from '@open-rights-exchange/chain-js'
import { EosAuthorizationStruct, EosEntityName, EosActionStruct, EosDecomposeReturn } from '../../../models'
// import { ChainActionType } from '../../../../../models'
import { toEosEntityName, getFirstAuthorizationIfOnlyOneExists, toEosEntityNameOrNull } from '../../../helpers'

const actionName = 'updateauth'

export interface UpdateAuthParams {
  auth: EosAuthorizationStruct
  authAccount: EosEntityName
  authPermission: EosEntityName
  parent: EosEntityName
  permission: EosEntityName
}

export const composeAction = ({
  auth,
  authAccount,
  authPermission,
  parent,
  permission,
}: UpdateAuthParams): EosActionStruct => ({
  account: toEosEntityName('eosio'),
  name: actionName,
  authorization: [
    {
      actor: authAccount,
      permission: authPermission,
    },
  ],
  data: {
    account: authAccount,
    permission,
    parent,
    auth,
  },
})

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.account && data?.permission && data?.parent && data?.auth) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    const returnData: Partial<UpdateAuthParams> = {
      auth: data.auth,
      authAccount: toEosEntityName(data.account),
      authPermission: toEosEntityNameOrNull(auth?.permission),
      parent: toEosEntityName(data?.parent),
      permission: toEosEntityNameOrNull(data?.permission),
    }
    const partial = !returnData?.permission
    return {
      chainActionType: Models.ChainActionType.AccountUpdateAuth,
      args: returnData,
      partial,
    }
  }

  return null
}
