import { Models, Crypto } from '@open-rights-exchange/chain-js'
import { EosSignMessage } from '../plugin/eosSignMessage'
import { toEosPrivateKey } from '../plugin/helpers'
import { EosSignMethod } from '../plugin/models'

const privateKey = toEosPrivateKey('5KADGFLxMNNB3PGWo6eUCTeSFoJMCBzMoJCxtaWH4oPYcgb2THR') // EOS6ksjkowURRzUyDVp7UK26A6Xv3jZdsifnR1rjaLaBAqrLXixqk


describe('Eos SignMessage Tests', () => {
  it('Eos sign - validate passes when input is correct', async () => {
    const stringToSign = 'Something to sign here'
    const SignMessageOptions = { signMethod: EosSignMethod.Default }
    const SignMessage = new EosSignMessage(stringToSign, SignMessageOptions)
    const validateResult = await SignMessage.validate()
    expect(validateResult.valid).toBeTruthy()

    const result = await SignMessage.sign([
      privateKey as unknown as Models.PrivateKeyBrand,
    ])
    expect(result.signature).toBeDefined()
  })

  it('Eos validate - passes when input is correct and no options are provided', async () => {
    const stringToSign = 'Something to sign here'
    const SignMessage = new EosSignMessage(stringToSign)
    const validateResult = await SignMessage.validate()
    expect(validateResult.valid).toBeTruthy()
    const result = await SignMessage.sign([
      privateKey as unknown as Models.PrivateKeyBrand,
    ])
    expect(result.signature).toBeDefined()
  })
})
