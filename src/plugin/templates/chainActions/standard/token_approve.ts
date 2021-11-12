//import { ActionDecomposeReturn, ChainActionType, TokenApproveParams } from '../../../../../models'
import { Models } from '@open-rights-exchange/chainjs'
import {
  composeAction as eosTokenApproveComposeAction,
  decomposeAction as eosTokenApproveDecomposeAction,
} from '../chainSpecific/eosToken_approve'

/** Calls EosTokenApprove as default token template for Ethereum */
export const composeAction = ({
  fromAccountName,
  toAccountName,
  amount,
  contractName,
  symbol,
  permission,
}: Models.TokenApproveParams) => ({
  ...eosTokenApproveComposeAction({
    contractName,
    fromAccountName,
    toAccountName,
    amount,
    symbol,
    permission,
  }),
})

export const decomposeAction = (action: any): Models.ActionDecomposeReturn => {
  const decomposed = eosTokenApproveDecomposeAction(action)
  if (decomposed) {
    return {
      ...decomposed,
      chainActionType: Models.ChainActionType.TokenApprove,
    }
  }
  return null
}
