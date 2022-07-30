//yarn hardhat deploy --network rinkeby    <---- run this before running the staging test
//yarn hardhat test --network rinkeby     <---- will only run the staging test and not the unit tests

const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

//Here we are using a turnary operator. If the chain we are using is hardhat or localhost, then we skip
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", async function () {
        let deployer
        let fundMe
        const sendValue = ethers.utils.parseEther("0.1")
        //We are not deploying any contract with the fixture function like we did with the unit tests because we assume the contracts are already deployed
        beforeEach(async () => {
            //We are getting the deployer object and creating a fundMe object were we connect the deployer to the fundMe contract
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async function () {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw();

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            console.log(
                endingFundMeBalance.toString() +
                " should equal 0, running assert equal..."
            )
            assert.equal(endingFundMeBalance.toString(), "0")
        })
    })