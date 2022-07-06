import { Models } from '@open-rights-exchange/chain-js'
import { EosEntityName, EosAsset, EosActionStruct, EosDecomposeReturn, EosAuthorizationStruct } from '../../../models'
import {
  toEosEntityName,
  getFirstAuthorizationIfOnlyOneExists,
  toEosEntityNameOrNull,
  EosAssetHelper,
} from '../../../helpers'

const actionName = 'newaccount'

export interface CreateAccountNativeParams {
  accountName: EosEntityName
  creatorAccountName: EosEntityName
  creatorPermission: EosEntityName
  authOwner: EosAuthorizationStruct
  authActive: EosAuthorizationStruct
  ramBytes: number
  stakeNetQuantity: EosAsset
  stakeCpuQuantity: EosAsset
  transfer: boolean
}
export const composeAction = ({
  accountName,
  creatorAccountName,
  creatorPermission,
  authOwner,
  authActive,
  ramBytes,
  stakeNetQuantity,
  stakeCpuQuantity,
  transfer,
}: CreateAccountNativeParams): EosActionStruct[] => {
  // Owner and Active authorizations are passed as parameters into EOS system contract's newaccount action
  // Ordering account's array under authorization alphabetically by accountName is required by the system contract.
  const ownerOrderedAuth = {
    ...authOwner,
    accounts: authOwner.accounts?.sort((left, right) =>
      left?.permission?.actor?.toLowerCase().localeCompare(right.permission?.actor?.toLowerCase()),
    ),
  }
  const activeOrderedAuth = {
    ...authActive,
    accounts: authActive.accounts?.sort((left, right) =>
      left?.permission?.actor?.toLowerCase().localeCompare(right.permission?.actor?.toLowerCase()),
    ),
  }
  const actions: EosActionStruct[] = [
    {
      account: toEosEntityName('eosio'),
      name: actionName,
      authorization: [
        {
          actor: creatorAccountName,
          permission: creatorPermission,
        },
      ],
      data: {
        creator: creatorAccountName,
        name: accountName,
        owner: ownerOrderedAuth,
        active: activeOrderedAuth,
      },
    },
    {
      account: toEosEntityName('eosio'),
      name: 'buyrambytes',
      authorization: [
        {
          actor: creatorAccountName,
          permission: creatorPermission,
        },
      ],
      data: {
        payer: creatorAccountName,
        receiver: accountName,
        bytes: ramBytes,
      },
    },
  ]

  // add delegatebw action to stake resources (if non-zero)
  const { amount: netAmount } = new EosAssetHelper(null, null, stakeNetQuantity)
  const { amount: cpuAmount } = new EosAssetHelper(null, null, stakeCpuQuantity)
  if (parseFloat(netAmount) !== 0 || parseFloat(cpuAmount) !== 0) {
    // Note: Float won't handle high precision numbers (which shouldnt be a problem with EOS)
    actions.push({
      account: toEosEntityName('eosio'),
      name: 'delegatebw',
      authorization: [
        {
          actor: creatorAccountName,
          permission: creatorPermission,
        },
      ],
      data: {
        from: creatorAccountName,
        receiver: accountName,
        stake_net_quantity: stakeNetQuantity,
        stake_cpu_quantity: stakeCpuQuantity,
        transfer,
      },
    })
  }

  return actions
}

export const decomposeAction = (action: EosActionStruct): EosDecomposeReturn => {
  const { name, data, authorization } = action

  if (name === actionName && data?.creator && data?.name && data?.owner && data?.active) {
    // If there's more than 1 authorization, we can't be sure which one is correct so we return null
    const auth = getFirstAuthorizationIfOnlyOneExists(authorization)
    // Only works if there's 1 key in the array otherwise we don't know which keys to return
    const authOwner: EosAuthorizationStruct = data?.owner
    const authActive: EosAuthorizationStruct = data?.active

    const returnData: Partial<CreateAccountNativeParams> = {
      accountName: toEosEntityName(data.name),
      creatorAccountName: toEosEntityName(data.creator),
      creatorPermission: toEosEntityNameOrNull(auth?.permission),
      authOwner,
      authActive,
    }
    const partial = !returnData?.creatorPermission || !returnData.authActive || !returnData.authOwner

    return {
      chainActionType: Models.ChainActionType.AccountCreate,
      args: returnData,
      partial,
    }
  }

  return null
}
