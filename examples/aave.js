
const Web3 = require("web3");
const lendingPoolABI = require("../abi/Pool.json")
const ERC20_ABI = require("../abi/ERC20.json")

//Providers
const web3 = new Web3(new Web3.providers.HttpProvider('https://api.avax-test.network/ext/bc/C/rpc'))

//Wallet from
const privateKey1 = '67633be8c32db5414951db4a9ea9734b1214f8f5ca15d6b16818c0b4ee864653' // Private key of account 1
const signer = web3.eth.accounts.privateKeyToAccount(privateKey1)
web3.eth.accounts.wallet.add(signer);

//Contracts
const usdc_avax_address = '0x3E937B4881CBd500d05EeDAB7BA203f2b7B3f74f'
const usdc_contract = new web3.eth.Contract(ERC20_ABI, usdc_avax_address)
const pool_contract_addr = '0xb47673b7a73D78743AFF1487AF69dBB5763F00cA'
const pool_contract = new web3.eth.Contract(lendingPoolABI, pool_contract_addr)

const main = async () => {
    //Idenfity the usdc contract and get the supply ammount with it's cdecimals
    let decimals = await usdc_contract.methods.decimals().call()
    const tokenSupply = 10 * Math.pow(10, decimals)
    //Check balance. We use 6 as the decimals places that USDC has. Each token has each own decimal places. For reference Ether has 18.
    //We also send the wallet that we want to check the balance of. Doesnt need to be signed or ours, but in this case for the example we use our same wallet.
    await checkBalanceUSDC(signer.address, decimals)
    //Not we need to approve the usdc contract to allow transfering a certain amount of funds.
    await approveUSDC(tokenSupply)
    //With the previous approved contract we can now transfer usdc to the pool contract
    await supply(tokenSupply)
    //We can also borrow based on the amount we have as a collateral.
    await borrow(tokenSupply/10)
    //Now we can check again the balances using the users account on the aave protocol.
    await balances()
}
function niceNumber(num) {
    try{
          var sOut = num.toString();
        if ( sOut.length >=17 || sOut.indexOf("e") > 0){
        sOut=parseFloat(num).toPrecision(5)+"";
        sOut = sOut.replace("e","x10<sup>")+"</sup>";
        }
        return sOut;
  
    }
    catch ( e) {
        return num;
    }
  }
  

const balances = async () => {

    let data = await pool_contract.methods.getUserAccountData(signer.address).call()
    let collateral = (parseInt(data.totalCollateralBase / 10) / 10 ** 18)
    let borrow = (parseInt(data.totalDebtBase / 10) / 10 ** 18)
    console.log(`2- Balances:\n`)
    console.log('collateral:', collateral, '\n')
    console.log('borrow:', borrow, '\n')

}



const approveUSDC = async (tokenSupply) => {


    // Token approval
    await usdc_contract.methods.approve(pool_contract_addr, tokenSupply).send({ from: signer.address, gas: 100000 })
        .on('transactionHash', hash => {
            console.log('TX Hash Approve', hash)
        })
        .on('error', error => {
            console.log('Approve Error', error)
        })
}
const supply = async (tokenSupply) => {



    // Supply
    await pool_contract.methods.supply(usdc_avax_address, tokenSupply , signer.address, "0").send({ from: signer.address, gas: 500000 })
        .on('transactionHash', hash => {
            console.log('TX Hash Supply', hash)
        })
        .on('error', error => {
            console.log('Supply Error', error)
        })
        .on('receipt', receipt => {
            console.log('Mined', receipt)
            if (receipt.status == '0x1' || receipt.status == 1) {
                console.log('Transaction Success')
            }
            else
                console.log('Transaction Failed')
        })

}
const borrow = async (tokenSupply) => {

    await pool_contract.methods.borrow(usdc_avax_address, tokenSupply / 10, 2, "0", signer.address).send({ from: signer.address, gas: 500000 })
        .on('transactionHash', hash => {
            console.log('TX Hash Borrow', hash)
        })
        .on('error', error => {
            console.log('Supply Error', error)
        })
        .on('receipt', receipt => {
            console.log('Mined', receipt)
            if (receipt.status == '0x1' || receipt.status == 1) {
                console.log('Transaction Success')
            }
            else
                console.log('Transaction Failed')
        })

}

const checkBalanceUSDC = async (wallet, decimals) => {
    let balance = await usdc_contract.methods.balanceOf(wallet).call()
    balance = parseInt(balance) / 10 ** decimals;
    console.log(`1- USDC Balance: ${((balance))}\n`)
}

main()