<p align="center"> <a href="https://aave.com/" rel="noopener" target="_blank"><img width="150" src="https://app.aave.com/aaveLogo.svg" alt="Aave logo"></a></p>

<h1 align="center">Aave Excersise</h1>


<br />

## Installation

Aave utilities are available as npm packages,
[contract helpers](https://www.npmjs.com/package/@aave/contract-helpers) and
[math utils](https://www.npmjs.com/package/@aave/math-utils)

[ethers v5](https://docs.ethers.io/v5/) and [reflect-metadata](reflect metadata)
are peer dependencies of the contract-helpers package

```sh
// with npm
npm install --save-dev ethers reflect-metadata
npm install @aave/contract-helpers @aave/math-utils

// with yarn
yarn add --dev ethers reflect-metadata
yarn add @aave/contract-helpers @aave/math-utils
```

<br />

## Features

1.  [Data Formatting Methods](#data-formatting-methods)
    - a. [Fetching Protocol Data](#fetching-protocol-data)
      - [ethers](#ethersjs)
      - [Subgraph](#subgraph)
      - [Caching Server](#caching-server)
    - b. [Format Reserve Data](#reserve-data)
      - [formatReserves](#formatReserves)
      - [formatReservesAndIncentives](#formatReservesAndIncentives)
    - c. [Format User Data](#user-data)
      - [formatUserSummary](#formatUserSummary)
      - [formatUserSummaryAndIncentives](#formatUserSummaryAndIncentives)
2.  [Transaction Methods](#transaction-methods)
    - a. [Submitting Transactions](#submitting-transactions)
    - b. [Pool V3](#pool-v3)
      - [supply](#supply)
      - [signERC20Approval](#signERC20Approval)
      - [supplyWithPermit](#supply-with-permit)
      - [borrow](<#borrow-(v3)>)
      - [repay](<#repay-(v3)>)
      - [repayWithPermit](#repayWithPermit)
      - [repayWithATokens](#repayWithATokens)
      - [withdraw](<#withdraw-(v3)>)
      - [swapBorrowRateMode](<#swapBorrowRateMode-(v3)>)
      - [setUsageAsCollateral](<#setUsageAsCollateral-(v3)>)
      - [liquidationCall](<#liquidationCall-(v3)>)
      - [swapCollateral](<#swapCollateral-(v3)>)
      - [repayWithCollateral](<#repayWithCollateral-(v3)>)
      - [setUserEMode](#setUserEMode)
    - c. [Lending Pool V2](#lending-pool-v2)
      - [deposit](#deposit)
      - [borrow](#borrow)
      - [repay](#repay)
      - [withdraw](#withdraw)
      - [swapBorrowRateMode](#swapBorrowRateMode)
      - [setUsageAsCollateral](#setUsageAsCollateral)
      - [liquidationCall](#liquidationCall)
      - [swapCollateral](#swapCollateral)
      - [repayWithCollateral](#repayWithCollateral)
    - d. [Staking](#staking)
      - [stake](#stake)
      - [redeem](#redeem)
      - [cooldown](#cooldown)
      - [claimRewards](#claimRewards)
    - e. [Governance V2](#governancev2)
      - [create](#create)
      - [cancel](#cancel)
      - [queue](#queue)
      - [execute](#execute)
      - [submitVote](#submitVote)
      - [delegate](#delegate)
      - [delegateByType](#delegateByType)
    - f. [Faucets](#faucets)
      - [mint](#mint)

<br />

# Data Formatting Methods

Users interact with the Aave protocol through a set of smart contracts. The
`@aave/math-utils` package is a collection of methods to take raw input data
from these contracts, and format to use on a frontend interface such as
[Aave Ui](https://github.com/aave/aave-ui) or
[Aave info](https://github.com/sakulstra/info.aave)

## Fetching Protocol Data

Input data for these methods can be obtained in a variety of ways with some
samples below:

- [ethers](#ethers.js)
- [Subgraph](#subgraph)
- [Caching Server](#caching-server)

<br />

### ethers.js

[ethers.js](https://docs.ethers.io/v5/) is a library for interacting with
Ethereum and other EVM compatible blockchains. To install:

The first step to query contract data with ethers is to inialize a `provider`,
there are a [variety](https://docs.ethers.io/v5/api/providers/) to choose from,
all of them requiring the an rpcURL

The sample code below includes an example of initializing a provider, and using
it query the helper contract data which can be passed directly into data
formatting methods.

<details>
	<summary>Sample Code</summary>

```ts
import { ethers } from 'ethers';
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
} from '@aave/contract-helpers';

// Sample RPC address for querying ETH mainnet
const provider = new ethers.providers.JsonRpcProvider(
  'https://eth-mainnet.alchemyapi.io/v2/demo',
);

// This is the provider used in Aave UI, it checks the chainId locally to reduce RPC calls with frequent network switches, but requires that the rpc url and chainId to remain consistent with the request being sent from the wallet (i.e. actively detecting the active chainId)
const provider = new ethers.providers.StaticJsonRpcProvider(
  'https://eth-mainnet.alchemyapi.io/v2/demo',
  ChainId.mainnet,
);

// Aave protocol contract addresses, will be different for each market and can be found at https://docs.aave.com/developers/deployed-contracts/deployed-contracts
// For V3 Testnet Release, contract addresses can be found here https://github.com/aave/aave-ui/blob/feat/arbitrum-clean/src/ui-config/markets/index.ts
const uiPoolDataProviderAddress = '0xa2DC1422E0cE89E1074A6cd7e2481e8e9c4415A6';
const uiIncentiveDataProviderAddress =
  '0xD01ab9a6577E1D84F142e44D49380e23A340387d';
const lendingPoolAddressProvider = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5';

// User address to fetch data for
const currentAccount = '';

// View contract used to fetch all reserves data (including market base currency data), and user reserves
const poolDataProviderContract = new UiPoolDataProvider({
  uiPoolDataProviderAddress,
  provider,
  chainId: ChainId.mainnet,
});

// View contract used to fetch all reserve incentives (APRs), and user incentives
const incentiveDataProviderContract = new UiIncentiveDataProvider({
  uiIncentiveDataProviderAddress,
  provider,
  chainId: ChainId.mainnet,
});

// Note, contract calls should be performed in an async block, and updated on interval or on network/market change

// Object containing array of pool reserves and market base currency data
// { reservesArray, baseCurrencyData }
const reserves = await poolDataProviderContract.getReservesHumanized({
  lendingPoolAddressProvider,
});

// Object containing array or users aave positions and active eMode category
// { userReserves, userEmodeCategoryId }
const userReserves = await poolDataProviderContract.getUserReservesHumanized({
  lendingPoolAddressProvider,
  currentAccount,
});

// Array of incentive tokens with price feed and emission APR
const reserveIncentives =
  await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
    lendingPoolAddressProvider,
  });

// Dictionary of claimable user incentives
const userIncentives =
  await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
    lendingPoolAddressProvider,
    currentAccount,
  });
```

These four variables are passed as parameters into the [reserve](#reserve-data)
and [user](#user-data) formatters to compute all of the fields needed for a
frontend interface.

</details>

<br />

### Subgraph

A subgraph indexes events emitted from a smart contract and exposes a graphql
endpoing to query data from. Each network where the protocol is deployed is a
corresponding subgraph. Subgraph can be queried directly using the playground
(links below) and integrated into applications directly via TheGraph API. Check
out these guides from
[Aave](https://docs.aave.com/developers/getting-started/using-graphql) and
[TheGraph](https://thegraph.com/docs/en/developer/querying-from-your-app/) for
resources on querying subgraph from a frontend application.

Here are queries for fetching the data fields required for
[data formatting methods](#data-formatting-methods). The formatting methods are
the same for V2 and V3, but the queries required to fetch the input data are
different. Queries will depend on two parameters:

- `pool` : lendingPoolAddressProvider address for the market you are querying
  data for
- `user` : user to fetch account data for

<details>
	<summary>V2</summary>

  <details>
    <summary>Reserves</summary>

```graphql
{
  reserves(
    where: { pool: "insert_lowercase_lending_pool_address_provider_here" }
  ) {
    id
    symbol
    name
    decimals
    underlyingAsset
    usageAsCollateralEnabled
    reserveFactor
    baseLTVasCollateral
    averageStableRate
    stableDebtLastUpdateTimestamp
    liquidityIndex
    reserveLiquidationThreshold
    reserveLiquidationBonus
    variableBorrowIndex
    variableBorrowRate
    liquidityRate
    totalPrincipalStableDebt
    totalScaledVariableDebt
    lastUpdateTimestamp
    availableLiquidity
    stableBorrowRate
    totalLiquidity
    price {
      priceInEth
    }
  }
}
```

1.) How can I get a list of the recent liquidations on the Aave Polygon V3 market?


2.) How do I get my token listed on Aave?


3.) How often do token prices update and based upon which price service?


4.) I’m interested in building a liquidation bot, what do I need to get started on this?