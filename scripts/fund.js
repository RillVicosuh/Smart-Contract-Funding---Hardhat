//Just a simple script to fund the contract
//yarn hardhat run scripts/fund.js --network localhost    <---- to run the script
const { getNamedAccounts, ethers } = require("hardhat")


async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("funMe", deployer)
    console.log("Funding Contract....")
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEthers("0.1")
    })
    await transactionResponse.wait(1)
    console.log("Funded")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })