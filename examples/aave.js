
const Web3 = require("web3");
//Providers
const web3 = new Web3(new Web3.providers.HttpProvider('https://api.avax-test.network/ext/bc/C/rpc'))

//Wallet from
const privateKey1 = '67633be8c32db5414951db4a9ea9734b1214f8f5ca15d6b16818c0b4ee864653' // Private key of account 1
const signer = web3.eth.accounts.privateKeyToAccount(privateKey1)
web3.eth.accounts.wallet.add(signer);

const lendingPoolABI = require("../abi/Pool.json")
const ERC20_ABI =[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]

//Contracts
const pool_contract_addr='0xb47673b7a73D78743AFF1487AF69dBB5763F00cA'
const usdc_avax_address='0x3E937B4881CBd500d05EeDAB7BA203f2b7B3f74f'
const usdc_contract = new web3.eth.Contract(ERC20_ABI, usdc_avax_address)
const pool_contract = new web3.eth.Contract(lendingPoolABI,pool_contract_addr)
const underlyingTokensToSupply = 10 * Math.pow(10, 6)

const main = async () => {
    //Check balance
    await checkBalanceUSDC(signer.address,6)
    await approveUSDC()
    await supply()
    await borrow()
    await balances()
}


const balances = async () => {

    let data=await pool_contract.methods.getUserAccountData(signer.address).call()
    let collateral=(parseInt(data.totalCollateralBase/10) / 10**18)
    let borrow=(parseInt(data.totalDebtBase/10) / 10**18)
    console.log(`2- Balances:\n`)
    console.log('collateral:',collateral,'\n')
    console.log('borrow:',borrow,'\n')
    
}   


const approveUSDC = async () => {

    
    // Token approval
    await usdc_contract.methods.approve(pool_contract_addr, underlyingTokensToSupply).send({from: signer.address, gas: 100000})
    .on('transactionHash', hash => {
        console.log('TX Hash Approve', hash)
    })
    .on('error', error => {
        console.log('Approve Error', error)
    })
}
const supply = async () => {



    // Supply
    await pool_contract.methods.supply(usdc_avax_address, underlyingTokensToSupply/10, signer.address, "0").send({from: signer.address, gas: 500000})
    .on('transactionHash', hash => {
        console.log('TX Hash Supply', hash)
    })
    .on('error', error => {
        console.log('Supply Error', error)
    })
    .on('receipt', receipt => {
        console.log('Mined', receipt)
        if(receipt.status == '0x1' || receipt.status == 1){
            console.log('Transaction Success')
        }
        else
            console.log('Transaction Failed')
    })

}
const borrow = async () => {

    await pool_contract.methods.borrow(usdc_avax_address, underlyingTokensToSupply/10, 2, "0",signer.address).send({from: signer.address, gas: 500000})
    .on('transactionHash', hash => {
        console.log('TX Hash Borrow', hash)
    })
    .on('error', error => {
        console.log('Supply Error', error)
    })
    .on('receipt', receipt => {
        console.log('Mined', receipt)
        if(receipt.status == '0x1' || receipt.status == 1){
            console.log('Transaction Success')
        }
        else
            console.log('Transaction Failed')
    })
   
}

const checkBalanceUSDC = async (wallet,decimals) => {
    let balance = await usdc_contract.methods.balanceOf(wallet).call()
    balance = parseInt(balance) / 10**decimals;
    console.log(`1- USDC Blaance: ${((balance))}\n`)
}

main()