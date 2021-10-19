var providers = require('ethers').providers;

// Connect to Ropsten (the test network)

// You may specify any of:
// - boolean; true = ropsten, false = homestead
// - object; { name: 'ropsten', chainId: 3 } (see ethers.networks);
// - string; e.g. 'homestead', 'ropsten', 'rinkeby', 'kovan'
var network = providers.networks.ropsten;

// Connect to INFURA
var infuraProvider = new providers.InfuraProvider(network);

// Connect to Etherscan
var etherscanProvider = new providers.EtherscanProvider(network);

// Creating a provider to automatically fallback onto Etherscan
// if INFURA is down
var fallbackProvider = new providers.FallbackProvider([
    infuraProvider,
    etherscanProvider
]);

// This is equivalent to using the getDefaultProvider
var defaultProvider = providers.getDefaultProvider(network)

// Connect to a local Parity instance
var jsonRpcProvider = new providers.JsonRpcProvider('http://localhost:8545', network);

// Connect to an injected Web3's provider (e.g. MetaMask)
var web3Provider = new providers.Web3Provider(web3.currentProvider, network);

module.exports = {
  defaultProvider,
  infuraProvider,
  etherscanProvider,
  provider: jsonRpcProvider,
  web3Provider,
  fallbackProvider
}