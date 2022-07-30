//import
//The two lines below are the same as the third line
/* const helperConfig = require("../helper-hardhat-config")
   const networkConfig = helperConfig.networkConfig*/
const { networkConfig, developmentChains } = require("../helper-hardhat-config")//This can only be done because of the module.exports in helper-hardhat-config.js
//This is used to retrieve that chainId. It's not completely necessary as hardhat knows where to get it from, but best to be specific
const { network } = require("hardhat")
//impo
const { verify } = require("../utils/verify")

/*async function deployFunc(hre) {

}
//YES. NO paranthesis
module.exports.default = deployFunc*/

//The code below is nearly identical to the function above
//When we runa deploy script, this function is automatically called and the hardhat object is passed into it
/*module.exports = async (hre) => {
    //Simply pulls out the two variable from the hre object
    //Same as hre.getNamedAccounts and hredeployments
    const { getNamedAccounts, deployments } = hre */
//Code above is identical
module.exports = async ({ getNamedAccounts, deployments }) => {
    //Like we did with the hre object, we are pulling to things, functions, from deployments
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //gets the address defined in the helper-hardhat-config that gives the ethUsd price data for a ceratin chain
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPriceFeedAddress
    //if we are using localhost or hardhat chain we get the address of MockV3Aggregator to use instead of an actual price feed address
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }


    //When using a localhost or hardhat blockchain we want ot use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        //If no block confirmation is given, resort to just 1 block confirmations
        //We want to wait for a certain amount of block confirmations to give etherscan a chance to index the transaction
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundme.address, args)
    }
    log("----------------------")
}

//These tags can be used to indicate which scripts you want to run
// yarn hardhat deploy --tags all   <----This will run all scripts with the "mocks" tag
// yarn hardat deploy  <----This will still run all the scripts
module.exports.tags = ["all", "fundme"]
