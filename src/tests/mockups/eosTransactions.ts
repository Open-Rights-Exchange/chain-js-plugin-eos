import { chainConfig } from './chainConfig'

export const account1 = chainConfig.eos_jungle.account1
export const permission1 = chainConfig.eos_jungle.permission1
export const account2 = chainConfig.eos_jungle.account2
export const unusedAccountPublicKey = 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma'

export const actionRawTransactionExpired1 = JSON.parse(
  '{"serializedTransaction":{"0":46,"1":143,"2":11,"3":94,"4":147,"5":127,"6":71,"7":23,"8":9,"9":176,"10":0,"11":0,"12":0,"13":0,"14":1,"15":64,"16":99,"17":84,"18":173,"19":86,"20":67,"21":165,"22":74,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":128,"30":107,"31":1,"32":224,"33":214,"34":98,"35":117,"36":25,"37":27,"38":212,"39":165,"40":224,"41":98,"42":173,"43":134,"44":74,"45":149,"46":106,"47":53,"48":8,"49":224,"50":214,"51":98,"52":117,"53":25,"54":27,"55":212,"56":165,"57":0},"signatures":["SIG_K1_K7dahqzaYaZYCqvYFW2jEPMPZS5etQHAbgYu9CTFwvJy7xSzuZ3u7oAuSkrNEo4ZXUMqZpeAmpvqEbd3bfpCHdHHXRGavc"]}',
)

export const actionRawTransactionExpired2 = JSON.parse(
  '{"serializedTransaction":{"0":228,"1":27,"2":67,"3":94,"4":3,"5":53,"6":65,"7":218,"8":162,"9":122,"10":0,"11":0,"12":0,"13":0,"14":2,"15":192,"16":233,"17":69,"18":88,"19":169,"20":108,"21":212,"22":69,"23":0,"24":0,"25":0,"26":0,"27":0,"28":192,"29":166,"30":171,"31":1,"32":192,"33":166,"34":75,"35":83,"36":175,"37":228,"38":212,"39":165,"40":0,"41":0,"42":0,"43":0,"44":168,"45":237,"46":50,"47":50,"48":8,"49":160,"50":248,"51":120,"52":132,"53":13,"54":27,"55":212,"56":165,"57":64,"58":99,"59":84,"60":173,"61":86,"62":67,"63":165,"64":74,"65":0,"66":0,"67":0,"68":0,"69":0,"70":0,"71":128,"72":107,"73":1,"74":160,"75":248,"76":120,"77":132,"78":13,"79":27,"80":212,"81":165,"82":224,"83":98,"84":173,"85":134,"86":74,"87":149,"88":106,"89":53,"90":8,"91":160,"92":248,"93":120,"94":132,"95":13,"96":27,"97":212,"98":165,"99":0},"signatures":["SIG_K1_KaEoCVCqiK8BvicHXvEcKAV83AduPNUWxXTknyUGBAUF18tXG1SPQhCApjxPS7xEtxrAVXFFCa8WRPXn2PZ8beG5j5nHSL"]}',
)

export const actionDemoapphelloHi = (account: string, permission: string) =>
  JSON.parse(
    `{"account":"demoapphello","name": "hi", "authorization": [ { "actor": ${account}, "permission": ${permission} } ], "data": { "user": ${account} } }`,
  )

export const actionDemoapphelloPing = (account: string) =>
  JSON.parse(
    `{"account":"createbridge","name":"ping","authorization":[{"actor": ${account},"permission": "active"}],"data":{"from": ${account}}}`,
  )

export const actionUpdateAuth = (account: string, updateToPublicKey: string) =>
  JSON.parse(
    `{"account":"eosio","name":"updateauth","authorization":[{"actor":${account},"permission":"owner"}],"data":{"account":${account},"permission":"active","parent":"owner","auth":{"accounts":[],"keys":[{"key": ${updateToPublicKey},"weight":1}],"threshold":1,"waits":[]}}}`,
  )

export const actionSendTokenEos = (fromAccount: string, toAccount: string) => {
  return {
    account: 'eosio.token',
    name: 'transfer',
    authorization: [{ actor: fromAccount, permission: 'active' }],
    data: { from: fromAccount, to: toAccount, quantity: '0.0001 EOS', memo: 'memo' },
  }
}

export const actionTokenTransferStandard = (fromAccount: string, toAccount: string) => {
  return {
    contractName: 'eosio.token',
    fromAccountName: fromAccount,
    toAccountName: toAccount,
    amount: '0.0001',
    // amount: '1.1',  // OR use precision param
    // precision: 4,
    symbol: 'EOS',
    memo: 'memo',
    permission: 'active',
  }
}

export const valueTransferStandard = (fromAccount: string, toAccount: string) => {
  return {
    contractName: 'eosio.token',
    fromAccountName: fromAccount,
    toAccountName: toAccount,
    amount: '0.0001',
    // amount: '1.1',  // OR use precision param
    // precision: 4,
    symbol: 'EOS',
    memo: 'memo',
    permission: 'active',
  }
}
