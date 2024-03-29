// import { ChainActionType, TokenTransferFromParams, ActionDecomposeReturn } from '../../../../../models'
import { Models } from '@open-rights-exchange/chain-js'
import {
  composeAction as eosTokenTransferFromComposeAction,
  decomposeAction as eosTokenTransferFromDecomposeAction,
} from '../chainSpecific/eosToken_transferFrom'

/** Calls EosTokenTransferFrom as default token template for Ethereum */
export const composeAction = ({
  approvedAccountName,
  contractName,
  fromAccountName,
  toAccountName,
  amount,
  symbol,
  memo,
  permission,
}: Models.TokenTransferFromParams) => ({
  ...eosTokenTransferFromComposeAction({
    contractName,
    approvedAccountName,
    fromAccountName,
    toAccountName,
    amount,
    symbol,
    memo,
    permission,
  }),
})

export const decomposeAction = (action: any): Models.ActionDecomposeReturn => {
  const decomposed = eosTokenTransferFromDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: Models.ChainActionType.TokenTransferFrom,
    }
  }
  return null
}
