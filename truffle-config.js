/* Uncommenting the defaults below
provides for an easier quick-start with Ganache.
You can also follow this format for other networks;
see <http://truffleframework.com/docs/advanced/configuration>
for more details on how to specify configuration options!
*/

var HDWalletProvider = require('truffle-hdwallet-provider')
var infura_apikey = '7feb421412a143508867b650f6209592'
var mnemonic = 'wonder glare also army glimpse hold this twist gaze energy page century'
module.exports = {
  mocha: {
    enableTimeouts: false
  },
  plugins: ['truffle-security'],
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 300000,
      gasPrice: 1000000000
    },
    /* ropsten: {
      host: '127.0.0.1',
      port: 8545,
      network_id: 3,
      gas:1000000,
      gasPrice: 20000000000,
    },*/
    ropsten_infura: {
      provider: () => new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/' + infura_apikey, 0, 10),
      network_id: 3,
      gas: 300000,
      gasPrice: 40000000000
    }
    /* ganache: {
      host: '127.0.0.1',
      port: 7545,
      network_id: 619,
      gas:1000000,
      gasPrice: 20000000000,
    }*/
  },
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true
        }
      }
    }
  }
}
