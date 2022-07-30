require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
//Needed in order to add block number to tasks
//require("./tasks/block-number")
//This gas reporter will automaticall run when we run our tests
require("hardhat-gas-reporter")
//Solidity coverage will go through all code and let us know which lines of code aren't covered by tests
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */

//Some junk code is just put on the right side of the OR so that there isn't an error if the left side does not exist
//If the left doesn't exist, the right side will be used to initialize
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      //For each transaction when using this chain, wait 6 block confirmations
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //The localhost will always have the same chainId as hardhat
      //We also don't need to define the accounts
      chainId: 31337,
    }
  },
  //solidity: "0.8.7",
  solidity: {
    compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],

  },
  etherscan: {
    apikey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    //outputting the gas result for each function into a separate file, instead of the terminal
    outputFile: "gas-report.txt",
    //This will ensure that there is no color coding in the txt so things don't get messed up
    noColors: true,
    currency: "USD",
    //Makes an API call to coinmarketcap whenever the gas reporter is run, which will help show the actual usd price
    coinmarketcap: COINMARKETCAP_API_KEY,
    //You would include line below if you want to display the cost to deploy to matic
    //token: "MATIC",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
};
