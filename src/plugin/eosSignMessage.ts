/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interfaces, Models, Errors } from '@open-rights-exchange/chain-js'
import {
  EosSignDataInput,
  EosPrivateKey,
} from './models'
import { sign } from "./eosCrypto"

export class EosSignMessage implements Interfaces.SignMessage {
  constructor(data: any, options?: Models.SignMessageOptions ) {
    this.applyOptions(options)
    this.applyData(data)
    this.setSignMethod()
    this._isValidated = false
  }

  private _isValidated: boolean

  private _signMethod: string

  private _options: Models.SignMessageOptions

  private _data: any

  private applyOptions(options: Models.SignMessageOptions) {
    this._options = options ? options : { signMethod: 'eos-sign'}
  }

  private applyData(data: any) {
    this._data = data
  }

  /** Options provided when the SignMessage class was created */
  get options(): Models.SignMessageOptions {
    return this._options
  }

  /** Date provided when the SignMessage class was created */
  get data(): EosSignDataInput {
    return this._data;
  }

  /* Set the signMethod and ensure that is lowercase */
  private setSignMethod() {
    const signMethod = this.options?.signMethod.toLowerCase()
    this._signMethod = signMethod
  }

  get signMethod() {
    return this._signMethod
  }

  /** Whether data structure has been validated - via validate() */
  get isValidated() {
    return this._isValidated
  }

  /** Verifies that the structure of the signature request is valid.
   *  Throws if any problems */
  public async validate(): Promise<Models.SignMessageValidateResult> {
    if (this.signMethod !== 'eos-sign') {
      Errors.throwNewError(`signMethod not recognized. signMethod provided = ${this.signMethod}`)
    }
    const isValid = this.validateEosSignInput(this.data).valid
    this._isValidated = isValid
    return  {
      valid: isValid
    }
  }

  /** Throws if not validated */
  private assertIsValidated(): void {
    if (!this._isValidated) {
      Errors.throwNewError('SignMessage not validated. Call SignMessage.validate() first.')
    }
  }

  private validateEosSignInput(data: EosSignDataInput): Models.SignMessageValidateResult {
    let result: Models.SignMessageValidateResult
  
    let message = ''
    let valid = true
  
    // Check that the stringToSign property exists.
    if (!data || !data.stringToSign) {
      message += ' stringToSign property is missing.'
      valid = false
    }
  
    // Check that message is string
    if (typeof data.stringToSign !== 'string') {
      message += ' stringToSign property must be a string.'
      valid = false
    }
  
    /* If any part of the input is not valid then let's build an example to reply with */
    if (!valid) {
      const fullMessage = `The data supplied to personalSign is incorrectly formatted or missing: ${message}`
  
      const example = {
        stringToSign: 'The message you would like to sign here',
      }
  
      result = {
        valid,
        message: fullMessage,
        example,
      }
    } else {
      result = {
        valid: true,
        message: '',
        example: {},
      }
    }
  
    return result
  }
  

  /** Sign the string or structured data */
  public async sign(privateKeys: EosPrivateKey[]): Promise<Models.SignMessageResult> {
    this.assertIsValidated()
    let result: Models.SignMessageResult
    try {
      const privateKey = privateKeys[0]
      const signature = sign (this.data.stringToSign, privateKey)
      result = {
        signature,
      }
    } catch (error) {
      Errors.throwNewError('Erorr in SignMessage.sign() - ', error)
    }

    return result
  }
}
