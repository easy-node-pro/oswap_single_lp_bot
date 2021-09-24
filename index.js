require('dotenv').config()
const Web3 = require('web3')

//WEB3 Config
const web3 = new Web3(process.env.RPC_URL)
const wallet = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)

//SMART CONTRACT ABIs
var MasterChef = require("./node_modules/openswap-core/build/contracts/MasterChef.json");
const OSWAP_MASTERCHEF_ABI = MasterChef.abi;

//smart contract objects
const oswapMasterChefContract = new web3.eth.Contract(OSWAP_MASTERCHEF_ABI, process.env.OSWAP_MASTERCHEF_CONTRACT)

// The minimum ABI to get ERC20 Token balance
let minABI = [
    // balanceOf
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    },
    // decimals
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
    }
];

let contract = new web3.eth.Contract(minABI,process.env.TOKEN_ADDRESS);

//Get OSWAP balance
async function getBalance() {
const balanceBN = await contract.methods.balanceOf(process.env.WALLET_ADDRESS).call();
const decimalsBN = await contract.methods.decimals().call();

return balanceBN 
}

async function compound(amountOswap){
    console.log('begin compounding')
    try{
        
        const gasLimit = 250000 //(await web3.eth.getBlock('latest')).gasLimit
        const gasPrice = await web3.eth.getGasPrice()
        const txCost = web3.utils.fromWei(gasPrice.toString(),'ether') * gasLimit
        const depositTx = await oswapMasterChefContract.methods.deposit(process.env.FARM_PID,amountOswap).send(
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
}

getBalance().then(function (result) {

compound(result)
/*
      const gasLimit = 200000
      const gasPrice = web3.eth.getGasPrice()
      const txCost = web3.utils.fromWei(gasPrice.toString(),'ether') * gasLimit
      const depositTx = dinoExtinctionContract.methods.transact(result).send(
            {
            from: wallet.address,
            gas: gasLimit,
            gasPrice: gasPrice
            }
        )
        console.log(`deposit status: ${depositTx.status}`);
        */
        
        console.log(`fetch amountOswap ${result}`)
});
const POLLING_INTERVAL = 300000 // 5 minutes 
setInterval(async () => { await compound() }, POLLING_INTERVAL)