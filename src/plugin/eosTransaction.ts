import { hexToUint8Array } from 'eosjs/dist/eosjs-serialize'
import { Helpers, Models, Interfaces, Errors } from '@open-rights-exchange/chain-js'
import { EosAccount } from './eosAccount'
import { EosChainState } from './eosChainState'
import { getPublicKeyFromSignature, sign as cryptoSign } from './eosCrypto'
import { isValidEosSignature, isValidEosPrivateKey, toEosSignature, isArrayAndNotEmpty } from './helpers'
import {
  EosAuthorization,
  EosActionStruct,
  EosPublicKey,
  EosEntityName,
  EosSignature,
  EosPrivateKey,
  EosTransactionOptions,
  EosRawTransaction,
  EosSerializedTransaction,
  EosRequiredAuthorization,
  EosAuthorizationPerm,
  PermissionMapCache,
  EosTransactionResources,
  EosTxResult,
} from './models'

export class EosTransaction implements Interfaces.Transaction {
  private _publicKeyMap: PermissionMapCache[] = []

  private _cachedAccounts: EosAccount[] = []

  private _actions: EosActionStruct[]

  private _chainState: EosChainState

  private _header: any

  private _options: EosTransactionOptions

  private _signatures: Set<EosSignature> // A set keeps only unique values

  /** Transaction prepared for signing (raw transaction) */
  private _raw: EosRawTransaction

  private _sendReceipt: EosTxResult

  private _signBuffer: Buffer

  private _requiredAuthorizations: EosAuthorizationPerm[]

  private _isValidated: boolean

  private _transactionId: string

  private _actualCost: Models.ActualCost

  constructor(chainState: EosChainState, options?: EosTransactionOptions) {
    this._chainState = chainState
    let { blocksBehind, expireSeconds } = options || {}
    blocksBehind = blocksBehind ?? this._chainState?.chainSettings?.defaultTransactionSettings?.blocksBehind
    expireSeconds = expireSeconds ?? this._chainState?.chainSettings?.defaultTransactionSettings?.expireSeconds
    this._options = { blocksBehind, expireSeconds }
  }

  public async init(): Promise<void> {
    return null
  }

  // header

  /** The header that is included when the transaction is sent to the chain
   *  It is part of the transaction body (in the signBuffer) which is signed
   *  The header changes every time prepareToBeSigned() is called since it includes latest block time, etc.
   */
  get header() {
    return this._header
  }

  /** The options provided when the transaction class was created */
  get options() {
    return this._options
  }

  /** The transaction body in raw format (by prepareForSigning) */
  get raw() {
    this.assertHasRaw()
    return this._raw
  }

  /** Returns a parent transaction - not used for Eos */
  get parentTransaction() {
    return Helpers.notSupported(
      'Eos doesnt use a parent transaction - check requiresParentTransaction() before calling this',
    )
  }

  /** Whether parent transaction has been set yet - Not used for Eos */
  public get hasParentTransaction(): boolean {
    return false // Currently always false for Eos (multisig doesnt require it)
  }

  /** Whether the raw transaction has been prepared */
  get hasRaw(): boolean {
    return !!this._raw
  }

  /** Wether a transaction must be wrapped in a parent transaction */
  public get requiresParentTransaction(): boolean {
    return false // Currently always false for Eos (multisig doesnt require it)
  }

  get sendReceipt() {
    return this._sendReceipt
  }

  /** EOSIO provides the functionality to sign a transaction using multiple signatures */
  get supportsMultisigTransaction(): boolean {
    return true
  }

  /** Generate the raw transaction body using the actions attached
   *  Also adds a header to the transaction that is included when transaction is signed
   */
  public async prepareToBeSigned(): Promise<void> {
    this.assertIsConnected()
    // if prepared (raw) transaction already exists, then dont do it again
    if (this._raw) {
      return
    }
    this.assertNoSignatures()
    if (!this._actions) {
      Errors.throwNewError('Transaction serialization failure. Transaction has no actions.')
    }
    const { blocksBehind, expireSeconds } = this._options
    const transactOptions = { broadcast: false, sign: false, blocksBehind, expireSeconds }
    const { serializedTransaction: rawTransaction } = await this._chainState.api.transact(
      { actions: this._actions },
      transactOptions,
    )
    this._raw = this.rawToUint8Array(rawTransaction)
    this.setHeaderFromRaw(rawTransaction)
    this.setSignBuffer()
    // TODO: consider how to setTransactionId()
  }

  /** Extract header from raw transaction body (eosjs refers to raw as serialized) */
  private setHeaderFromRaw(rawTransaction: Uint8Array): void {
    // deserializeTransaction does not call the chain - just deserializes transation header and action names (not action data)
    const deRawified = this._chainState.api.deserializeTransaction(rawTransaction)
    delete deRawified.actions // remove parially deRawified actions
    this._header = deRawified
  }

  /** Accepts either a raw transaction or an array of actions
   */
  public async setTransaction(transactionOrActions: EosActionStruct[] | EosSerializedTransaction) {
    this.assertNoSignatures()
    if (Array.isArray(transactionOrActions)) {
      this.actions = transactionOrActions as EosActionStruct[]
      return
    }
    // if not actions array, assume value is a raw transaction
    try {
      await this.setFromRaw(transactionOrActions as EosSerializedTransaction)
    } catch (error) {
      Errors.throwNewError(
        `Failed trying to set transaction. Value must be either: array of actions OR serialized transaction object. Error: ${error.message}`,
      )
    }
  }

  /** Set the body of the transaction using Hex raw transaction data
   *  This is one of the ways to set the actions for the transaction
   *  Sets transaction data from raw transaction - supports both raw/serialized formats (JSON bytes array and hex)
   *  This is an ASYNC call since it fetches (cached) action contract schema from chain in order to deserialize action data */
  private async setFromRaw(raw: EosSerializedTransaction): Promise<void> {
    this.assertIsConnected()
    this.assertNoSignatures()
    if (raw) {
      // if raw is passed-in as a JSON array of bytes, convert it to Uint8Array
      const useRaw = this.rawToUint8Array(raw)
      const { actions: txActions, deRawifiedTransaction: txHeader } = await this.deRawifyWithActions(useRaw)
      this._header = txHeader
      this._actions = txActions
      this._raw = useRaw
      this._isValidated = false
      this.setSignBuffer()
    }
  }

  /** Creates a sign buffer using raw transaction body */
  private setSignBuffer() {
    this.assertIsConnected()
    this._signBuffer = Buffer.concat([
      Buffer.from(this._chainState?.chainId, 'hex'),
      Buffer.from(this._raw),
      Buffer.from(new Uint8Array(32)),
    ])
  }

  /** Deserializes the transaction header and actions - fetches from the chain to deserialize action data */
  private async deRawifyWithActions(rawTransaction: Uint8Array | string): Promise<any> {
    this.assertIsConnected()
    const { actions, ...deRawifiedTransaction } = await this._chainState.api.deserializeTransactionWithActions(
      rawTransaction,
    )
    return { actions, deRawifiedTransaction }
  }

  // actions

  /** The contract actions executed by the transaction */
  public get actions() {
    return this._actions
  }

  /** Sets the Array of actions */
  public set actions(actions: EosActionStruct[]) {
    this.assertNoSignatures()
    if (!isArrayAndNotEmpty(actions)) {
      Errors.throwNewError('actions must be an array and have at least one value')
    }
    actions.map(action => this.assertActionWellFormed(action)) // check all actions are well-formed
    this._actions = actions
    this._isValidated = false
  }

  /** Add one action to the transaction body
   *  Setting asFirstAction = true places the new transaction at the top */
  public addAction(action: EosActionStruct, asFirstAction: boolean = false): void {
    this.assertNoSignatures()
    this.assertActionWellFormed(action)
    let newActions = this._actions ?? []
    if (asFirstAction) {
      newActions = [action, ...(this._actions || [])]
    } else {
      newActions.push(action)
    }
    this._actions = newActions
    this._isValidated = false
  }

  // validation

  /** Verifies that all accounts and permisison for actions exist on chain.
   *  Throws if any problems */
  public async validate(): Promise<void> {
    this.assertHasRaw()
    // this will throw an error if an account in transaction body doesn't exist on chain
    this._requiredAuthorizations = await this.fetchAuthorizationsRequired()
    await this.assertTransactionNotExpired()
    this._isValidated = true
  }

  // ** Whether transaction has been validated - via vaidate() */
  get isValidated() {
    return this._isValidated
  }

  /** Throws if transction doesnt have a raw value */
  public assertHasRaw() {
    if (!this.hasRaw) {
      Errors.throwNewError(
        'Transaction has not been prepared to be signed yet. Call prepareToBeSigned() or use setTransaction(). Use transaction.hasRaw to check before using transaction.raw',
      )
    }
  }

  /** Throws if not validated */
  private assertIsValidated(): void {
    this.assertIsConnected()
    if (!this._isValidated) {
      Errors.throwNewError('Transaction not validated. Call transaction.validate() first.')
    }
  }

  /** Throws if transaction expired */
  public async assertTransactionNotExpired(): Promise<void> {
    const hasExpired = await this.isExpired()
    if (hasExpired) Errors.throwNewError('Transaction has expired')
  }

  /** Whether transaction has expired */
  public async isExpired(): Promise<boolean> {
    this.assertHasRaw()
    const { headBlockTime } = this._chainState.chainInfo
    const expirationDate = await this.expiresOn()
    return headBlockTime.getTime() > expirationDate.getTime()
  }

  /** Date (and time) when transaction can first be sent to the chain (before which the transaction will fail) */
  public async validOn(): Promise<Date> {
    Helpers.notSupported('Eos transactions dont have a valid from date')
    return null // quiets linter
  }

  /** Whether transaction has expired */
  public async expiresOn(): Promise<Date> {
    this.assertHasRaw()
    const { expiration } = await this._chainState.api.deserializeTransactionWithActions(this.raw)
    return new Date(`${expiration}Z`) // Add Z to specify GMT time
  }

  /** Throw if action is missing basic action fields */
  public assertActionWellFormed(action: EosActionStruct) {
    if (!action) Errors.throwNewError('action is missing')
    if (
      !(
        action?.account &&
        action?.name &&
        action?.data &&
        action?.authorization &&
        isArrayAndNotEmpty(action?.authorization) &&
        action?.authorization?.every(auth => auth?.actor && auth?.permission)
      )
    ) {
      Errors.throwNewError(
        'Transaction action not well-formed. Expecting: { account, name, authorization: { actor, permission }, data : {...} } .',
      )
    }
  }

  // signatures
  /** Signatures attached to transaction */
  get signatures(): EosSignature[] {
    if (Helpers.isNullOrEmpty(this._signatures)) return null
    return [...this._signatures]
  }

  /** Add a signature to the set of attached signatures. Automatically de-duplicates values. */
  async addSignatures(signatures: EosSignature[]): Promise<void> {
    if (Helpers.isNullOrEmpty(signatures)) return
    signatures.forEach(signature => {
      this.assertValidSignature(signature)
    })
    const newSignatures = new Set<EosSignature>()
    signatures.forEach(signature => {
      newSignatures.add(signature)
    })
    // add to existing collection of signatures
    this._signatures = new Set<EosSignature>([...(this._signatures || []), ...newSignatures])
  }

  /** Throws if signatures isn't properly formatted */
  private assertValidSignature = (signature: EosSignature) => {
    if (!isValidEosSignature(signature)) {
      Errors.throwAndLogError(`Not a valid signature : ${signature}`, 'signature_invalid')
    }
  }

  /** Throws if any signatures are attached */
  private assertNoSignatures() {
    if (this.hasAnySignatures) {
      Errors.throwNewError(
        'You cant modify the body of the transaction without invalidating the existing signatures. Remove the signatures first.',
      )
    }
  }

  /** Whether there are any signatures attached */
  get hasAnySignatures(): boolean {
    return !Helpers.isNullOrEmpty(this.signatures)
  }

  private checkAuthSigned(auth: EosRequiredAuthorization): boolean {
    const weights: number[] = []
    auth?.keys?.forEach(keyObj => weights.push(this.hasSignatureForPublicKey(keyObj.key) ? keyObj.weight : 0))
    const authAccountsToCheck = auth?.accounts?.filter(
      authAcc => authAcc.permission.permission !== Helpers.toChainEntityName('eosio.code'),
    )
    authAccountsToCheck?.map(async accObj => {
      const subWeights: number[] = []
      const { subAuth } = accObj
      const { threshold: subThreshold, keys: subKeys } = subAuth
      subKeys?.forEach(keyObj => subWeights.push(this.hasSignatureForPublicKey(keyObj.key) ? keyObj.weight : 0))
      const subSum = subWeights.reduce((partialSum, a) => partialSum + a, 0)
      if (subSum >= subThreshold) {
        weights.push(accObj?.weight || 0)
      }
    })
    const sum = weights.reduce((partialSum, a) => partialSum + a, 0)
    return sum >= auth.threshold
  }

  /** Whether there is an attached signature for every authorization (e.g. account/permission) in all actions */
  public get hasAllRequiredSignatures(): boolean {
    this.assertIsValidated()
    const hasAllSignatures = this._requiredAuthorizations?.every(auth =>
      this.checkAuthSigned(auth?.requiredAuthorization),
    )
    return hasAllSignatures
  }

  /** Throws if transaction is missing any signatures */
  private assertHasAllRequiredSignature(): void {
    if (!this.hasAllRequiredSignatures) {
      Errors.throwNewError('Missing at least one required Signature', 'transaction_missing_signature')
    }
  }

  /** An array of authorizations (e.g. account/permission) that do not have an attached signature
   *  Retuns null if no signatures are missing */
  public get missingSignatures(): EosAuthorizationPerm[] {
    this.assertIsValidated()
    const missing = this._requiredAuthorizations?.filter(auth => !this.checkAuthSigned(auth?.requiredAuthorization))
    return Helpers.isNullOrEmpty(missing) ? null : missing // if no values, return null instead of empty array
  }

  /** Whether there is an attached signature for the provided publicKey */
  public hasSignatureForPublicKey(publicKey: EosPublicKey): boolean {
    const sigsToLoop = this.signatures || []
    return sigsToLoop.some(signature => {
      const pk = getPublicKeyFromSignature(signature, this._signBuffer)
      return pk === publicKey
    })
  }

  /** Whether there is an attached signature for the publicKey for the authoization (e.g. account/permission)
   *  May need to call chain (async) to fetch publicKey(s) for authorization(s)
   * TODO support accounts not just keys */
  public async hasSignatureForAuthorization(authorization: EosAuthorization): Promise<boolean> {
    const { account, permission } = authorization

    const auth = await this.getAuthorizationForPermission(account, permission)
    let hasSig = true
    auth.keys.forEach((keyObj: any) => {
      if (!this.hasSignatureForPublicKey(keyObj.key)) hasSig = false
    })
    // await Promise.all(wait)
    return hasSig
  }

  /** The transaction data needed to create a transaction signature.
   *  It should be signed with a private key. */
  public get signBuffer(): Buffer {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    return this._signBuffer
  }

  public get isMultisig(): boolean {
    let requiresMoreSigs = false
    this._requiredAuthorizations?.forEach(auth => {
      if (auth.requiredAuthorization.keys.length > 1) requiresMoreSigs = true
    })
    return requiresMoreSigs
  }

  /** Sign the transaction body with private key(s) and add to attached signatures */
  public async sign(privateKeys: EosPrivateKey[]): Promise<void> {
    this.assertIsValidated()
    if (Helpers.isNullOrEmpty(privateKeys)) return
    privateKeys.forEach(pk => {
      if (!isValidEosPrivateKey(pk)) {
        Errors.throwNewError(`Sign Transaction Failure - Private key :${pk} is not valid EOS private key`)
      }
    })
    // sign the signBuffer using the private key
    await Helpers.asyncForEach(privateKeys, async pk => {
      const signature = cryptoSign(this._signBuffer, pk)
      await this.addSignatures([signature])
    })
  }

  private async setTransactionId(sendReceipt: EosTxResult) {
    this._transactionId = sendReceipt.transactionId
  }

  public get transactionId(): string {
    if (Helpers.isNullOrEmpty(this._transactionId)) {
      return null
      // throwNewError('Transaction has to be sent to chain to retrieve transactioId')
    }
    return this._transactionId
  }

  // authorizations

  /** An array of the unique set of account/permission/publicKey for all actions in transaction
   *  Also fetches the related accounts from the chain (to get public keys)
   *  NOTE: EOS requires async fecting, thus this getter requires validate() to be called
   *        call fetchAuthorizationsRequired() if needed before validate() */
  get requiredAuthorizations() {
    this.assertIsValidated()
    return this._requiredAuthorizations
  }

  /** Collect unique set of account/permission for all actions in transaction
   * Retrieves public keys from the chain by retrieving account(s) when needed */
  public async fetchAuthorizationsRequired(): Promise<EosAuthorizationPerm[]> {
    const requiredAuths = new Set<EosAuthorizationPerm>()
    const actions = this._actions
    if (actions) {
      actions
        .map(action => action.authorization)
        .forEach(auths => {
          auths.forEach(auth => {
            const { actor: account, permission } = auth
            if (permission !== Helpers.toChainEntityName('eosio.code')) {
              requiredAuths.add({ account, permission })
            }
          })
        })
    }
    // get the unique set of account/permissions
    const requiredAuthsArray = Helpers.getUniqueValues<EosAuthorizationPerm>(Array.from(requiredAuths))
    // attach public keys for each account/permission - fetches accounts from chain where necessary
    const uniqueRequiredAuths = await this.addAuthToPermissions(requiredAuthsArray)
    // Attach subAuth for each accountName/permission specified as Authorization.
    const uniqueRequiredAuthsWithSubAuthPromises = uniqueRequiredAuths?.map(async uAuth => {
      const { accounts } = uAuth?.requiredAuthorization || {}
      const accountsToGetSubAuths = accounts?.filter(
        account => account.permission.permission !== Helpers.toChainEntityName('eosio.code'),
      )
      if (accountsToGetSubAuths?.length > 0) {
        const accountsWithAuthPromises = accountsToGetSubAuths.map(async accObj => {
          const { permission } = accObj
          const { actor, permission: permissionName } = permission
          const permToGetAuth: EosAuthorizationPerm = {
            account: actor,
            permission: permissionName,
          }
          const [subAuthPerm] = await this.addAuthToPermissions([permToGetAuth])
          const { requiredAuthorization: subRequiredAuth } = subAuthPerm
          if (!Helpers.isNullOrEmpty(subRequiredAuth?.accounts)) {
            Errors.throwNewError('ChainJs doesnt support nested accounts permission')
          }
          return { ...accObj, subAuth: subRequiredAuth }
        })
        const accountsWithAuth = await Promise.all(accountsWithAuthPromises)
        return { ...uAuth, requiredAuthorization: { ...uAuth.requiredAuthorization, accounts: accountsWithAuth } }
      }
      return uAuth
    })
    const uniqueRequiredAuthsWithSubAuth = await Promise.all(uniqueRequiredAuthsWithSubAuthPromises)
    return uniqueRequiredAuthsWithSubAuth
  }

  // TODO: This code only works if the firstPublicKey is the only required Key
  // ... this function and hasSignatureForAuthorization must be rewritten to look for weights
  // ... and the publicKeyCache approach needs to handle multiple keys per permission
  /** Fetch the public key (from the chain) for the provided account and permission
   *  Also caches permission/publicKey mappings - the cache can be set externally via appendPublicKeyCache
   */
  private async getAuthorizationForPermission(accountName: EosEntityName, permissionName: EosEntityName) {
    let permission: EosRequiredAuthorization
    const cachedPermission = (
      this._publicKeyMap.find(m => m.accountName === accountName && m.permissionName === permissionName) || {}
    ).authorization
    if (cachedPermission) {
      // TODO only support keys at this time need to do the work for accounts to work
      permission = cachedPermission
    } else {
      const account = await this.getAccount(accountName)
      const perm = account?.permissions.find(p => p.name === permissionName)
      if (!perm?.requiredAuth) {
        Errors.throwNewError(`Account ${accountName} doesn't have a permission named ${permissionName}.`)
      }
      // set to requiredAuth keys
      permission = perm?.requiredAuth
      // save key to map cache
      this.appendPermissionCache([{ accountName, permissionName, authorization: permission }])
    }
    return permission
  }

  /** Fetches account names from the chain (and adds to private cache) */
  private async getAccount(accountName: EosEntityName) {
    let account = this._cachedAccounts.find(ca => accountName === ca.name)
    if (!account) {
      account = new EosAccount(this._chainState)
      await account.load(accountName)
      this._cachedAccounts.push(account)
    }
    return account
  }

  /** Use an already fetched account instead of trying to refect from the chain
   *  Can improve performance
   *  Also neccessary for creating an inline transaction for an new account which isnt yet on the chain */
  async appendAccountToCache(account: EosAccount) {
    this._cachedAccounts.push(account)
  }

  /** Use an already fetched map of account/permission to public keys
   *  Can improve performance - otherwise this class needs to retrieve accounts from the chain
   *  Also neccessary for creating a new account which isnt yet on the chain */
  appendPermissionCache(permissionMap: PermissionMapCache[]): void {
    this._publicKeyMap = [...this._publicKeyMap, ...permissionMap]
  }

  /** Fetches public keys (from the chain) for each account/permission pair
   *   Fetches accounts from the chain (if not already cached)
   */
  private async addAuthToPermissions(auths: EosAuthorizationPerm[]) {
    const returnedAuth: EosAuthorizationPerm[] = []

    const permsToGet = auths.map(async auth => {
      const requiredAuthorization = await this.getAuthorizationForPermission(auth.account, auth.permission)
      returnedAuth.push({ ...auth, requiredAuthorization })
    })
    await Promise.all(permsToGet)
    return returnedAuth
  }

  // send
  /** Broadcast a signed transaction to the chain
   *  waitForConfirm specifies whether to wait for a transaction to appear in a block (or irreversable block) before returning */
  public async send(
    waitForConfirm: Models.ConfirmType = Models.ConfirmType.None,
    communicationSettings?: Models.ChainSettingsCommunicationSettings,
  ): Promise<any> {
    this.assertIsValidated()
    this.assertHasAllRequiredSignature()
    const signedTransaction = { serializedTransaction: this._raw, signatures: this.signatures }

    // where can we find the shape of this._sendReceipt.chainRespone?
    // is this an EOS chain response? or a chain-js chain response
    // are these the docs? https://developers.eos.io/manuals/eos/latest/nodeos/plugins/chain_api_plugin/api-reference/index#operation/send_transaction
    // those would indicate the reponse is empty or null
    // it looks like we're expecting https://developers.eos.io/manuals/eosjs/latest/API-Reference/interfaces/_eosjs_api_interfaces_.transactiontrace
    this._sendReceipt = await this._chainState.sendTransaction(signedTransaction, waitForConfirm, communicationSettings)
    this.setTransactionId(this._sendReceipt)
    this.setActualCost()
    return this._sendReceipt
  }

  // helpers

  /** Throws if not yet connected to chain - via chain.connect() */
  private assertIsConnected(): void {
    if (!this._chainState?.isConnected) {
      Errors.throwNewError('Not connected to chain')
    }
  }

  /** JSON representation of transaction data */
  public toJson(): any {
    return { ...this._header, actions: this._actions, signatures: this.signatures }
  }

  /** Ensures that the value comforms to a well-formed EOS signature */
  public toSignature(value: any) {
    return toEosSignature(value)
  }

  /** Accepts either an object where each value is the uint8 array value
   *     ex: {'0': 24, ... '3': 93 } => [24,241,213,93]
   *  OR a packed transaction as a string of hex bytes
   * */
  private rawToUint8Array = (rawTransaction: any): Uint8Array => {
    // if the trasaction data is a JSON array of bytes, convert to Uint8Array
    if (Helpers.isAnObject(rawTransaction)) {
      const trxLength = Object.keys(rawTransaction).length
      let buf = new Uint8Array(trxLength)
      buf = Object.values(rawTransaction) as any // should be a Uint8Array in this value
      return buf
    }
    // if transaction is a packed transaction (string of bytes), convert it into an Uint8Array of bytes
    if (rawTransaction && Helpers.isAString(rawTransaction)) {
      const deRawifiedTransaction = hexToUint8Array(rawTransaction)
      return deRawifiedTransaction
    }
    throw Error('Missing or malformed rawTransaction (rawToUint8Array)')
  }

  public get supportsCancel() {
    return false
  }

  /** EOS requires chain resources for a transaction */
  public get supportsResources(): boolean {
    return true
  }

  /** Chain resources required for Transaction */
  public async resourcesRequired(): Promise<EosTransactionResources> {
    const netBytes = this._raw.length + 45
    return {
      estimationType: Models.ResourceEstimationType.Estimate,
      netBytes,
      cpuMicroseconds: null,
      ramBytes: null,
    }
  }

  public async setDesiredFee(): Promise<any> {
    Helpers.notSupported('EOS does not require transaction fees')
  }

  public async getSuggestedFee(): Promise<any> {
    Helpers.notSupported('EOS does not require transaction fees - see resourcesRequired()')
  }

  private setActualCost() {
    // where are the docs / source code that informs us of the contents of chainResponse?
    // could we strongly type this data?
    const { chainResponse } = this._sendReceipt
    const { action_traces: actionTraces, receipt, net_usage: netUsage } = chainResponse.processed
    const cpuUsage = receipt?.cpu_usage_us
    let ramDelta = 0
    actionTraces.forEach((trace: any) => {
      trace?.account_ram_deltas?.forEach((accountDelta: any) => {
        if (accountDelta?.delta) ramDelta += accountDelta.delta
      })
    })
    this._actualCost = {
      resources: {
        netUsage,
        cpuUsage,
        ramDelta,
      },
    }
  }

  public get actualCost(): Models.ActualCost {
    return this._actualCost
  }

  // ------------------------ EOS Specific functionality -------------------------------
  // Put any EOS chain specific feature that aren't included in the standard Transaction interface below here  */
  // calling code can access these functions by first casting the generic object into an eos-specific flavor
  // e.g.   let eosTransaction = (transaction as EosTransaction);
  //        eosTransaction.anyEosSpecificFunction();

  /** Placeholder */
  public anyEosSpecificFunction = () => {}
}
