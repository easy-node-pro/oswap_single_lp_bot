require('dotenv').config()
const Web3 = require('web3')

//WEB3 Config
const web3 = new Web3(process.env.RPC_URL)
const wallet = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)

//SMART CONTRACT ABIs
const OSWAP_FARM_ABI = [{https://raw.githubusercontent.com/TheOpenFinanceProject/openswap-core/master/build/contracts/MasterChef.json}]
const OSWAP_POOL_ABI = [{"inputs":[{"internalType":"contract IERC20","name":"_OSWAP","type":"address"},{"internalType":"contract IERC20","name":"_REWARD","type":"address"},{"internalType":"uint256","name":"_rewardPerBlock","type":"uint256"},{"internalType":"uint256","name":"_startBlock","type":"uint256"},{"internalType":"uint256","name":"_endBlock","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EmergencyWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"OSWAP","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARD","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"emergencyTransfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"endBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"pendingReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolInfo","outputs":[{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accRewardPerShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rewardPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_rewardPerBLock","type":"uint256"}],"name":"setOswapPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_endBlock","type":"uint256"}],"name":"setEndBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stakedOswaps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"startBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updatePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]

//SMART CONTRACT ADDRESSSES
const OSWAP_FARM_CONTRACT="0xaC71B617a58B3CC136D1f6A118252f331faB44fC"
const OSWAP_POOL_CONTRACT="0xaC71B617a58B3CC136D1f6A118252f331faB44fC"

//smart contract objects
const oswapFarmContract = new web3.eth.Contract(OSWAP_FARM_ABI, OSWAP_FARM_CONTRACT)
const oswapPoolContract = new web3.eth.Contract(OSWAP_POOL_ABI, OSWAP_POOL_CONTRACT)

const farmID = 10

let currently_compounding = false

async function checkCompoundingOpportunities(){
    if(currently_compounding) return
    try{
        const pendingOswap = await oswapFarmContract.methods.pendingOswap(farmID, wallet.address).call()
        const gasLimit = 200000
        const gasPrice = await web3.eth.getGasPrice()
        const txCost = web3.utils.fromWei(gasPrice.toString(),'ether') * gasLimit
        
        //if the oswap to be excavated is more than the transaction cost (assumes 1 OSWAP>1 MATIC)
        if(pendingOswap > 4 * txCost) {
            console.log(`time to compound ${web3.utils.fromWei(pendingOswap.toString(),'ether')} OSWAP!`)
            currently_compounding = true
            console.log(`gas Price: ${gasPrice}`)
            compound(pendingOswap, oswapPoolContract, gasPrice, gasLimit)
        }
        else{
            console.log(`not ready to compound ${web3.utils.fromWei(pendingOswap.toString(),'ether')} OSWAP`)
        }
    } catch (err){
        console.log(`didn't fetch pendingOswap ${err}`)
        return
    }
}

async function compound(pendingOswap, poolContract, gasPrice, gasLimit){
    console.log('begin compounding')

    //Withdraw OSWAP from Farm
    try{
        const withdrawTx = await oswapFarmContract.methods.deposit(farmID,0).send(
            {
            from: wallet.address,
            gas: gasLimit,
            gasPrice: gasPrice
            }
        )
        console.log(`withdraw status: ${withdrawTx.status}`)
    } catch (err){
        currently_compounding = false
        console.log(`Withdraw OSWAP error ${err.message}`)
        return
    }

    try{
    //Deposit OSWAP into Pool
        const depositTx = await poolContract.methods.deposit(pendingOswap).send(
            {
            from: wallet.address,
            gas: gasLimit,
            gasPrice: gasPrice
            }
        )
        console.log(`deposit status: ${depositTx.status}`)
    } catch (err){
        currently_compounding = false
        console.log(`Deposit OSWAP error ${err.message}`)
        return
    }
    
    currently_compounding = false

}


checkCompoundingOpportunities()
const POLLING_INTERVAL = 240000 // 4 minutes 
setInterval(async () => { await checkCompoundingOpportunities() }, POLLING_INTERVAL)

