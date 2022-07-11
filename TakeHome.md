
## Features

1. How can I get a list of the recent liquidations on the Aave Polygon V3 market?
2. How do I get my token listed on Aave?
3. How often do token prices update and based upon which price service?
4. I’m interested in building a liquidation bot, what do I need to get started on this?
    
<br />

1.) How can I get a list of the recent liquidations on the Aave Polygon V3 market?

A liquidation is a process that occurs when a borrower's health factor goes below 1 due to their collateral value not properly covering their loan/debt value. This might happen when the collateral decreases in value or the borrowed debt increases in value against each other. This collateral vs loan value ratio is shown in the health factor.
In a liquidation, up to 50% of a borrower's debt is repaid and that value + liquidation fee is taken from the collateral available, so after a liquidation that amount liquidated from your debt is repaid.


2.) How do I get my token listed on Aave?

Aave protocol allows you to add new tokens as whitelisted currency that can be used for deposits and borrows. 

Listing a token is a very straightforward process that consists in 4 steps:

-**Proposing the asset via ARC process (off-chain)**

As with all governance upgrades, an ARC process is recommended for listing a new token. This is a formal document presenting the information needed about the token and a template can be found here

-**Prepare for the on-chain process (on-chain)**

1. Create a Pull Request with your token parameters

-fork from the protocol-v2 repository@aave-v2-asset-listing
-add your token addresses to markets/aave/index.ts 
-create your reserve parameters inside markets/aave/reservesConfigs.ts 
-update the types to include your token in /helpers/types 
-add the current price in the MOCK_CHAINLINK_AGGREGATORS_PRICES object in markets/aave/commons.ts 
-create a PR with your changes. An example PR can be found here

2. Run the asset deployment script
From the protocol-v2 repository, 
```ts
$ npm install
$ SYMBOL="Your Symbol" npm run external:deploy-assets-kovan to deploy on kovan
$ SYMBOL="Your Symbol" npm run external:deploy-assets-main to deploy on mainnet
```

This will deploy the following contracts and display the addresses:

-AToken
-variableDebt
-stableDebt
-InterestRateStrategy

You will need them for the last step.

-**Deploy the proposal** 
For requesting Aave Governance to initialize your assets you will need AIP IPFS hash. After that you have to deploy the on-chain proposal following these instructions 

-**Follow up**
You will need to connect with Aave Genesis team, to add your token price oracle as a source.


3.) How often do token prices update and based upon which price service?

https://docs.aave.com/developers/v/2.0/the-core-protocol/price-oracle

4.) I’m interested in building a liquidation bot, what do I need to get started on this?

Depending on your environment, preferred programming tools and languages, your bot should:
-Ensure it has enough (or access to enough) funds when liquidating.
-Calculate the profitability of liquidating loans vs gas costs, taking into account the most lucrative collateral to liquidate.
-Ensure it has access to the latest protocol user data.
-Have the usual fail safes and security you'd expect for any production service.

For calculating profitability you should consider this :
-Store and retrieve each collateral's relevant details such as address, decimals used, and liquidation bonus as listed here. 
-Get the user's collateral balance (aTokenBalance).
-Get the asset's price according to the Aave's oracle contract (getAssetPrice()).
-The maximum collateral bonus you can receive will be the collateral balance (2) multiplied by the liquidation bonus (1) multiplied by the collateral asset's price in ETH (3). Note that for assets such as USDC, the number of decimals are different from other assets.
-The maximum cost of your transaction will be your gas price multiplied by the amount of gas used. You should be able to get a good estimation of the gas amount used by calling estimateGas via your web3 provider.
-Your approximate profit will be the value of the collateral bonus (4) minus the cost of your transaction (5).