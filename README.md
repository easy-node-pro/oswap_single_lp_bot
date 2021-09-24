# Description
When you start this bot, it will claim Open Swap Single Pool oSwap rewards and that triggers a claim of pending rewards. 

This runs on a 10 minute timer, if you stake in the [Open Swap 100% Validator](https://staking.harmony.one/validators/mainnet/one1j35d0vd4uzwffeawjjfukn8t9wjt8csungj0z0 "Open Swap 100% Validator") you get rewards every 10 minutes, this will compound those rewards into the Single LP boosting your APY.

# Disclaimer
You can use this code and extend it for your own personal use.
This is not production ready code.
Please be very careful with your private key and never push it to a public repository. It's advised that you use an account that doesn't have all your funds attached to it. 

# Prerequisites
- Node JS installed 
    - MAC users: `brew install node`
- You have money in the OpenSwap 100% validator getting rewards or single staking oSwap LP pool
- You have Harmony ONE to pay gas fees

# Steps to run
- download this repository `git clone https://github.com/easy-node-one/oswap_bot.git`
- cd `oswap_bot`
- run `npm install openswap-core`
- run `npm install`
- copy env_sample to a new file (.env) and enter your Polygon RPC URL and the private key of the account that currently has its LP in the oSwap farm `cp env_sample .env`
- make sure that the `.env` file is in the `.gitignore` file
- **Optional:** if you'd like to keep it running on your system if you close your terminal use tmux `tmux new -s openswap` to start a new tmux session.
    - use `tmux -disconnect` to leave the session running but exit.
    - use `tmux attach` to reconnect to the openswap session.
- Now you're ready to run the openswap auto compounding bot `node index`

# OpenSwap Contractcs on Harmony ONE Protocol Blockchain
- `OpenSwap TOKEN_ADDRESS="0xc0431Ddcc0D213Bf27EcEcA8C2362c0d0208c6DC"`

# Environment Variables
Copy env_sample to .env & fill in with your settings. Here's our notes:

- PRIVATE_KEY=84985998afe8f98EXAMPLE9999999
    - Your Harmony ONE Wallet Private Key (Export from wallet)
- TOKEN_ADDRESS="0xc0431Ddcc0D213Bf27EcEcA8C2362c0d0208c6DC"
    - This is the address for OpenSwap
- WALLET_ADDRESS="0xXXXXX"
    - Your harmony wallet address
- FARM_PID=11
    - Farm PID - Get from vfat.tools pool if you're changing it out from oswap
- OSWAP_MASTERCHEF_CONTRACT = "0xaC71B617a58B3CC136D1f6A118252f331faB44fC"
    - Contract for depositing oswap on oswap

# Credits
- Inspired by @alysiahuggins project [dinoswap-compound-bot](https://github.com/alysiahuggins/dinoswap-compound-bot "dinoswap-compound-bot")
