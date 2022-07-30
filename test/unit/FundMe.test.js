const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    //You can use the line below or you can use the next line to represent 1 eth
    //const sendValue = "1000000000000000000" //1 eth
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function () {
        //retrieves getNamedAccounts and gets the deployer object to assign to deployer. Ya some weird insception thing
        deployer = (await getNamedAccounts()).deployer
        //Deploys all the contracts with the "all" tag (runs all the deploy scripts with "all" to deploy all the contracts)
        await deployments.fixture(["all"])
        //Gets the most recently deployed fundme contract
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })
    describe("Constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            //Tells this test that you are expecting something to fail. This way the script doesn't terminate.
            //A message is also displayed when it picks up the failure.
            //No ETH is sent so it will fail
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })
        it("Updates the amount funded data structure", async function () {
            //Here we are calling the fund function in the fundMe contract and sending some eth
            await fundMe.fund({ value: sendValue })
            //Here the mapping in the fundMe contract is being accessed to retrieve the amount that was funded
            const response = await fundMe.s_addressToAmountFunded(deployer)
            //The amount that was sent and the amount that is recorded in the mapping should be the same
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: senValue })
            //getting the address that is stored in the fundMe contract and ensuring it matches the address that sent the funds
            const funder = await fundMe.s_funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function () {
        //Before we access the withdraw function and withdraw some ETH, we need to fund the contract
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("Withdraw ETH from a single founder", async function () {
            //Arrange
            //Here we are using the getBalance function of the provider object, which we did not build. We're just using it. I think it's a prebuilt function
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            //retrieving these from the transactionReceipt to calculate the gas const
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            //Use the multiplication function since the values we retrieved are from the blockchain and are considered big numbers
            const gasCost = gasUsed.mul(effectiveGasPrice)


            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            //Assert
            //The balance of the fundMe contract should be 0 becuase we transferred all the funds to the deployer
            assert.equal(endingFundMeBalance, 0)
            //The number retrieved for startingFundMeBalance is a Big number since it comes from the blockchain
            //Therefore, it is good practice to use the add function
            //You also need to account for the gas cost that was spent to transfer funds
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString())
        })

        it("allows us to withdraw with multiple funders", async function () {
            //Arrange
            //The getSigners() function is a function we imported. It gets all the accounts associated with the contract
            const accounts = await ethers.getSigners()
            //Goes through each account, connects the account to the contract, then runs the fund function of the contract
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(account[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            //Act
            const transactionResponse = await fundMe.withdraw
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            //Make sure that the funders of the contract are reset properly
            await expect(fundMe.s_funders(0)).to.be.reverted
            //Ensure all the accounts have no funds in them
            for (i = 1; i < 6; i++) {
                assert.equal(await fundMe.s_addressToAmountFunded(accounts[i].address), 0)
            }
        })
        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            //Account 0 would be the owner. So we set the attacker to the second account, which isn't the owner
            const attacker = account[1]
            //Connects the attackers account to the fundMe contract to try and call the withdraw function
            const attackerConnectedContract = await fundMe.connect(attacker)
            //Calling the withdraw function here will fail because the attacker is not the owner
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")
        })
    })
})