var ethers = require('ethers')
var Web3 = require('web3')

var PrivateKeyProvider = require('truffle-privatekey-provider')
var Web3HttpProvider = require('web3-providers-http');

var privateKey = undefined

var options = {
  keepAlive: true,
  timeout: 20000, // milliseconds,
  headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
  withCredentials: false
}

let provider, wallet

// if (process.env.PK || privateKey) {
//   if (process.env.xDAI) {
options.network_id = 100
// provider = new PrivateKeyProvider(privateKey, 'https://xdai.poanetwork.dev', options)

provider = new ethers.providers.JsonRpcProvider('https://xdai.poanetwork.dev', 100);
wallet = new ethers.Wallet(process.env.PK || '000000000000000000000000000000000000000000000000000000000000005b', provider);

//   } else {
//     provider = new PrivateKeyProvider(process.env.PK || privateKey, 'https://mainnet.infura.io/v3/138ae8d066a646a3a3e312b8f3a046f1', options)
//   }
// } else {
//   provider = new Web3HttpProvider('https://mainnet.infura.io/v3/138ae8d066a646a3a3e312b8f3a046f1', options);
// }

module.exports = new Web3(wallet)