import { Helpers, Models, Interfaces, Errors } from '@open-rights-exchange/chain-js'
import { EosChainState } from './eosChainState'
import {
  EosCreateAccountOptions,
  EosActionStruct,
  EosEntityName,
  EosPermissionStruct,
  EosGeneratedKeys,
  EosNewAccountType,
  EosPublicKeys,
  EosChainActionType,
  EosTransactionOptions,
  EosCreateAccountAuthorizations,
  EosPublicKey,
  MsigAuthOptions,
} from './models/index'
import { EosAccount } from './eosAccount'
import { EosTransaction } from './eosTransaction'
import {
  timestampEosBase32,
  randomEosBase32,
  toEosEntityName,
  toEosPublicKey,
  isValidEosAsset,
  publicKeyToAuth,
  msigOptionToAuth,
  isValidEosPublicKey,
} from './helpers'
import {
  ACCOUNT_NAME_MAX_LENGTH,
  DEFAULT_ACCOUNT_NAME_PREFIX,
  DEFAULT_CREATEESCROW_APPNAME,
  DEFAULT_CREATEESCROW_CONTRACT,
  DEFAULT_ORE_ACCOUNT_TIER,
} from './eosConstants'
import { generateNewAccountKeysAndEncryptPrivateKeys } from './eosCrypto'
import { composeAction, composeActions } from './eosCompose'
import { PermissionsHelper } from './eosPermissionsHelper'

/** Helper class to compose a transction for creating a new chain account
 *  Handles native, virtual, and createEscrow accounts
 *  Generates new account keys if not provide
 *  Supports reusing a recycled account and a wide range of other options */
export class EosCreateAccount implements Interfaces.CreateAccount {
  private _accountName: EosEntityName

  private _chainState: EosChainState

  private _didRecycleAccount: boolean = false

  private _transaction: EosTransaction

  private _accountType: EosNewAccountType

  private _options: EosCreateAccountOptions

  /** Either publicKeys or multisigOptions will  be converted and stored here */
  private _authorizations: EosCreateAccountAuthorizations = {}

  private _generatedKeys: Partial<EosGeneratedKeys>

  constructor(chainState: EosChainState, options?: EosCreateAccountOptions) {
    this._chainState = chainState
    this._options = this.applyDefaultOptions(options)
    this.assertValidOptionsAndSetAuth()
  }

  public async init(): Promise<void> {
    return null
  }

  // ---- Interface implementation

  /** Account name for the account to be created
   *  May be automatically generated (or otherwise changed) by composeTransaction() */
  get accountName(): EosEntityName {
    return this._accountName
  }

  /** Account type to be created */
  get accountType(): EosNewAccountType {
    return this._accountType
  }

  /** Account will be recycled (accountName must be specified via composeTransaction()
   * This is set by composeTransaction()
   * ... if the account name provided has the 'unused' key as its active public key */
  get didRecycleAccount() {
    return this._didRecycleAccount
  }

  /** The keys that were generated as part of the account creation process
   *  IMPORTANT: Be sure to always read and store these keys after creating an account
   *  This is the only way to retrieve the auto-generated private keys after an account is created */
  get generatedKeys() {
    if (this._generatedKeys) {
      return this._generatedKeys
    }
    return null
  }

  get isMultisig() {
    if (Helpers.isNullOrEmpty(this.options?.multisigOptions)) return false
    return true
  }

  assertValidOptionsAndSetAuth() {
    const { publicKeys, multisigOptions } = this.options
    // If authorizations passed, throw if any other auth options is passed (publicKeys or multisigOptions) and return
    if (!Helpers.isNullOrEmpty(publicKeys) && !Helpers.isNullOrEmpty(multisigOptions))
      Errors.throwNewError('Both publicKeys and multisigOptions can not be provided')

    if (!Helpers.isNullOrEmpty(publicKeys)) {
      this._authorizations.owner = publicKeys?.owner ? publicKeyToAuth(publicKeys.owner) : null
      this._authorizations.active = publicKeys?.active ? publicKeyToAuth(publicKeys.active) : null
      return
    }

    if (!Helpers.isNullOrEmpty(multisigOptions)) {
      const { owner, active } = multisigOptions
      if (Helpers.isNullOrEmpty(owner) && Helpers.isNullOrEmpty(active)) {
        Errors.throwNewError('If multisigOptions is provided, both active and owner has to be provided.')
      }
      this._authorizations.owner = isValidEosPublicKey(multisigOptions?.owner as EosPublicKey)
        ? publicKeyToAuth(multisigOptions.owner as EosPublicKey)
        : msigOptionToAuth(multisigOptions.owner as MsigAuthOptions)
      this._authorizations.active = isValidEosPublicKey(multisigOptions?.active as EosPublicKey)
        ? publicKeyToAuth(multisigOptions.active as EosPublicKey)
        : msigOptionToAuth(multisigOptions.active as MsigAuthOptions)
    }
  }

  /** Only available if NOT multisig */
  get activeAndOwnerPublicKeys(): EosPublicKeys {
    if (this.isMultisig) {
      Errors.throwNewError('activeAndOwnerPublicKeys can NOT be called if multisigOptions is provided.')
    }
    return {
      owner: this._authorizations?.owner?.keys[0]?.key,
      active: this._authorizations?.active?.keys[0]?.key,
    }
  }

  /** Account creation options */
  get options() {
    return this._options
  }

  /** EOS requires the chain to execute a createAccount transaction
   *  to create the account structure on-chain */
  get supportsTransactionToCreateAccount(): boolean {
    return true
  }

  /** The transaction with all actions needed to create the account
   *  This should be signed and sent to the chain to create the account */
  get transaction() {
    if (!this._transaction) {
      this._transaction = new EosTransaction(this._chainState)
    }
    return this._transaction
  }

  /** Compose a transaction to send to the chain to create a new account */
  async composeTransaction(accountType: EosNewAccountType, transactionOptions?: EosTransactionOptions): Promise<void> {
    this._accountType = accountType
    const { accountName, creatorAccountName, creatorPermission, oreOptions, createEscrowOptions, resourcesOptions } =
      this._options
    const { tier, referralAccountName } = oreOptions || {}
    const { contractName, appName } = createEscrowOptions || {}
    const { ramBytes, stakeNetQuantity, stakeCpuQuantity, transfer } = resourcesOptions || {}
    this.assertValidOptionNewKeys()

    // determine account name - generate account name if once wasn't provided
    const permissionHelper = new PermissionsHelper(this._chainState)
    const {
      alreadyExists,
      newAccountName,
      canRecycle: recycleAccount,
    } = await this.determineNewAccountName(accountName)

    if (alreadyExists) Errors.throwNewError(`Account name ${accountName} already in use`)

    this._accountName = newAccountName

    await this.generateKeysIfNeeded()
    const { publicKeys } = this.options
    // compose action - call the composeAction type to generate the right transaction action
    let createAccountActions: EosActionStruct[]
    const { active: publicKeyActive, owner: publicKeyOwner } = publicKeys || {}
    const { active: authActive, owner: authOwner } = this._authorizations
    const params = {
      accountName: newAccountName,
      contractName,
      appName,
      creatorAccountName,
      creatorPermission,
      tier,
      // For native account creation auth is provided to support multisig
      authOwner,
      authActive,
      // For createescrow only one publicKey for each permission needs to be provided.
      publicKeyActive,
      publicKeyOwner,
      referralAccountName,
      ramBytes,
      stakeNetQuantity,
      stakeCpuQuantity,
      transfer,
    }
    // To recycle an account, we dont create new account, just replace keys on an existing one
    if (recycleAccount) {
      // if recyclying an account, we don't want a generated owner key, we will expect it to be = unusedAccountPublicKey
      publicKeys.owner = null
      // we've already confirmed (in generateAccountName) that account can be recycled
      const parentAccount = new EosAccount(this._chainState)
      // replacing the keys of an existing account, so fetch it first
      await parentAccount.load(this._accountName)

      const replaceActivePermissionAction = await permissionHelper.composeReplacePermissionKeysAction(
        creatorAccountName,
        creatorPermission,
        {
          permissionName: toEosEntityName('active'),
          parentPermissionName: toEosEntityName('owner'),
          publicKeys: [toEosPublicKey(publicKeys.active)],
          accountPermissions: parentAccount.permissions,
          accountName: this._accountName,
        },
      )
      createAccountActions = [replaceActivePermissionAction]
      this._didRecycleAccount = true
    } else {
      switch (accountType) {
        case EosNewAccountType.Native:
          // check that we have account resource options for a native account (not needed if we are recycling)
          this.assertValidOptionsResources()
          // composeAction(s) retruns an array of actions - so we dont need to include it in an array here
          createAccountActions = await composeActions(Models.ChainActionType.AccountCreate, params)
          break
        case EosNewAccountType.NativeOre:
          createAccountActions = [await composeAction(EosChainActionType.OreCreateAccount, params)]
          break
        case EosNewAccountType.CreateEscrow:
          createAccountActions = [await composeAction(EosChainActionType.CreateEscrowCreate, params)]
          break
        case EosNewAccountType.VirtualNested:
          // For a virual 'nested' account, we don't have a create account action
          // instead, we will need to add permissions (below) to the parent account
          createAccountActions = await this.composeCreateVirtualNestedActions()
          break
        default:
          break
      }
    }

    // Create a transaction object to execute the updates
    const newTransaction = new EosTransaction(this._chainState, transactionOptions)
    // newTransaction.actions = [createAccountAction, updatePermissionsActions, linkPermissionsActions]
    let newActions: EosActionStruct[] = []
    if (!Helpers.isNullOrEmpty(createAccountActions)) newActions = [...newActions, ...createAccountActions]
    if (!Helpers.isNullOrEmpty(newActions)) newTransaction.actions = newActions

    // generate and validate the serialized tranasaction - ready to send to the chain
    await newTransaction.prepareToBeSigned()
    await newTransaction.validate()
    this._transaction = newTransaction
  }

  /** Determine if desired account name is usable for a new account.
   *  Generates a new account name if one isnt provided.
   *  Checks if provided account is unused and can be recycled */
  async determineNewAccountName(accountName: EosEntityName) {
    let eosAccount: EosAccount
    let alreadyExists = false
    let canRecycle = false
    let newAccountName = accountName
    const { accountNamePrefix } = this._options

    if (!accountName) {
      newAccountName = await this.generateAccountName(accountNamePrefix, true)
    } else {
      eosAccount = new EosAccount(this._chainState)
      try {
        await eosAccount.load(accountName)
        // check if this account is an unused, recyclable account
        canRecycle = await eosAccount.canBeRecycled
        if (!canRecycle) alreadyExists = true
      } catch (error) {
        alreadyExists = false
        // if account doesn't exist - don't do anything. Otherwise, rethrow error
        if (error.errorType !== Models.ChainErrorType.AccountDoesntExist) {
          throw error
        }
      }
    }
    return { alreadyExists, newAccountName, canRecycle }
  }

  /** Generates a random EOS compatible account name and checks chain to see if it is arleady in use.
   *  If already in use, this function is called recursively until a unique name is generated */
  async generateAccountName(prefix: string, checkIfNameUsedOnChain: boolean = true): Promise<EosEntityName> {
    const accountName = await this.generateAccountNameString(prefix)
    let exists = false
    if (checkIfNameUsedOnChain) {
      exists = await this.doesAccountExist(accountName)
    }
    if (exists) {
      return this.generateAccountName(prefix, checkIfNameUsedOnChain)
    }
    return toEosEntityName(accountName)
  }

  /** Generates a random EOS account name
    account names MUST be base32 encoded in compliance with the EOS standard (usually 12 characters)
    account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
    account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars
  */
  async generateAccountNameString(prefix: string = ''): Promise<EosEntityName> {
    return toEosEntityName((prefix + timestampEosBase32() + randomEosBase32()).substr(0, ACCOUNT_NAME_MAX_LENGTH))
  }

  /** Checks create options - if publicKeys are missing,
   *  autogenerate the public and private key pair and add them to options
   *  If multisigOptions provided, just returns */
  async generateKeysIfNeeded() {
    if (this.isMultisig) {
      return
    }
    const { owner, active } = this.activeAndOwnerPublicKeys
    if (!owner || !active) {
      await this.generateAccountKeys(this.activeAndOwnerPublicKeys)
    }
  }

  // ---- Chain-specific functions

  async doesAccountExist(accountName: EosEntityName): Promise<boolean> {
    const account = new EosAccount(this._chainState)
    return account.doesAccountExist(accountName)
  }

  // ---- Private functions

  /** merge default options and incoming options */
  private applyDefaultOptions = (options: EosCreateAccountOptions): EosCreateAccountOptions => {
    return {
      accountNamePrefix: DEFAULT_ACCOUNT_NAME_PREFIX,
      creatorPermission: 'active',
      oreOptions: {
        tier: DEFAULT_ORE_ACCOUNT_TIER,
        referralAccountName: null,
      },
      createEscrowOptions: {
        contractName: toEosEntityName(DEFAULT_CREATEESCROW_CONTRACT),
        appName: DEFAULT_CREATEESCROW_APPNAME, // TODO: reconsider whether we should default a value here
      },
      ...options,
    }
  }

  /** Generate new public and private key pair and stores them in class's generatedKeys
   *  Allows existing publicKeys to be retained via overridePublicKeys
   *  Also adds the new keys to the class's options.publicKeys */
  private async generateAccountKeys(overridePublicKeys: EosPublicKeys): Promise<void> {
    // generate new account owner/active keys if they weren't provided
    const { newKeysOptions } = this._options
    const { password, encryptionOptions } = newKeysOptions || {}
    const generatedKeys = await generateNewAccountKeysAndEncryptPrivateKeys(
      password,
      overridePublicKeys,
      encryptionOptions,
    )
    this._generatedKeys = {
      ...this._generatedKeys,
      accountKeys: generatedKeys,
    }
    // this._options.publicKeys = this._generatedKeys?.accountKeys?.publicKeys // replace working keys with new ones
    this._authorizations = {
      owner: publicKeyToAuth(this._generatedKeys?.accountKeys?.publicKeys.owner),
      active: publicKeyToAuth(this._generatedKeys?.accountKeys?.publicKeys.active),
    }
  }

  /** Compose an updateAuth command to add a permission to the virtual 'master' account */
  private async composeCreateVirtualNestedActions(): Promise<EosActionStruct[]> {
    const { createVirtualNestedOptions, creatorPermission: authPermission } = this._options
    const { parentAccountName, actionsToLink } = createVirtualNestedOptions || {}
    let actionsToReturn: EosActionStruct[]

    // add new 'nested' account permission at the bottom of the auth tree
    const newPermission = await this.composeNewVirualNestedAccountPermissionStructure()
    const updateAuthParams = {
      auth: newPermission.required_auth,
      authAccount: parentAccountName, // TODO: Consider removing parentAccountName as a seperate parameter
      authPermission,
      parent: newPermission.parent,
      permission: newPermission.perm_name,
    }
    // add the permission to the bottom of the linked chain of permissions
    const updateAuthAction = await composeAction(Models.ChainActionType.AccountUpdateAuth, updateAuthParams)
    actionsToReturn = [updateAuthAction]
    // add actions to link the contract actions to this new permission
    // ... this enables calling of these contract actions by this permission and any of its upstream parents (i.e. all the other nexted virtual accounts)
    if (actionsToLink) {
      const permissionHelper = new PermissionsHelper(this._chainState)
      const permissionsToLink = actionsToLink.map(a => ({
        permissionName: newPermission.perm_name,
        contract: a.contract,
        action: a.action,
      }))
      const linkAuthActions = await permissionHelper.composeLinkPermissionActions(
        parentAccountName,
        authPermission,
        permissionsToLink,
      )
      if (!Helpers.isNullOrEmpty(linkAuthActions)) {
        actionsToReturn = [...actionsToReturn, ...linkAuthActions]
      }
    }
    return actionsToReturn
  }

  /** For a virual nested account, we add the new account's permission on the bottom of the linked list of permissions */
  private async composeNewVirualNestedAccountPermissionStructure(): Promise<EosPermissionStruct> {
    const { publicKeys, createVirtualNestedOptions } = this._options
    const { parentAccountName, rootPermission } = createVirtualNestedOptions || {}
    const { active: publicKeyActive } = publicKeys || {}
    const parentAccount = new EosAccount(this._chainState)
    await parentAccount.load(parentAccountName)
    const permissionHelper = new PermissionsHelper(this._chainState)
    const { perm_name: deepestPermissionName } = permissionHelper.findDeepestPermission(
      parentAccount.value.permissions,
      rootPermission,
    )
    // create a new 'nested account' permission using the new account name as the permission name
    // ... and the currently deepest permission name as the parent
    const newVirtualAccountPermission = permissionHelper.composePermission(
      [publicKeyActive],
      this._accountName,
      deepestPermissionName,
    )
    return newVirtualAccountPermission
  }

  private assertValidOptionNewKeys() {
    // nothing to check
  }

  private assertValidOptionsResources() {
    const { resourcesOptions } = this._options || {}
    const { ramBytes, stakeNetQuantity, stakeCpuQuantity } = resourcesOptions || {}
    if (!isValidEosAsset(stakeNetQuantity) || !isValidEosAsset(stakeCpuQuantity) || !Helpers.isANumber(ramBytes)) {
      Errors.throwNewError(
        'Invalid Option - For this type of account, You must provide valid values for ramBytes(number), stakeNetQuantity(EOSAsset), stakeCpuQuantity(EOSAsset)',
      )
    }
  }
}
