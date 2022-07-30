//This is used to retrieve that chainId. It's not completely necessary as hardhat knows where to get it from, but best to be specific
const { network } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.names)) {//Includes function checks if the name of the network we are using is in the developmentChains array
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("---------------------------------------")//Just to indicate the end of the script
    }
}

//These tags can be used to indicate which scripts you want to run
// yarn hardhat deploy --tags mocks   <----This will run all scripts with the "mocks" tag
module.exports.tags = ["all", "mocks"]
