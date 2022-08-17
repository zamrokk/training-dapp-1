---
title: Training dapp n°1
tags: Training
description: Training n°1 for decentralized application
---

Training dapp n°1
===

# :point_up:  Poke game

> dapp : A decentralized application (dApp) is a type of distributed open source software application that runs on a peer-to-peer (P2P) blockchain network rather than on a single computer. DApps are visibly similar to other software applications that are supported on a website or mobile device but are P2P supported

Goal of this training is to develop a poke game with smart contract. You will learn : 
- create a Tezos project with taqueria
- create a smart contract in jsligo
- deploy the smart contract to a local testnet and a real testnet
- create a dapp using taquito library and interact with a Tezos browser wallet
- use an indexer

> :warning: This is not an HTML or REACT training, I will avoid as much of possible any complexity relative to these technologies 

The game consists on poking the owner of a smart contract.  The smartcontract keeps a track of user interactions on its own storage 

Poke sequence diagram
```mermaid
sequenceDiagram
  Note left of User: Prepare poke
  User->>SM: poke owner
  Note right of SM: store poke trace 
```

# :memo: Prerequisites

Please install this software first on your machine or use online alternative : 

- [ ] [VS Code](https://code.visualstudio.com/download) : as text editor
- [ ] [npm](https://nodejs.org/en/download/) : we will use a typescript React client app
- [ ] [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) : because yet another
- [ ] [taqueria](https://github.com/ecadlabs/taqueria) : Tezos Dapp project tooling
- [ ] [taqueria VS Code extension](https://marketplace.visualstudio.com/items?itemName=ecadlabs.taqueria-vscode) : visualize your project and execute tasks
- [ ] [ligo VS Code extension](https://marketplace.visualstudio.com/items?itemName=ligolang-publish.ligo-vscode) : for smart contract highlighting, completion, etc ..
- [ ] [Temple wallet](https://templewallet.com/) : an easy to use Tezos wallet in your browser

# :scroll: Smart contract

## Step 1 : Create folder & file

```bash
taq init training1
cd training1
taq install @taqueria/plugin-ligo
taq create contract pokeGame.jsligo
```

## Step 2 : Edit pokeGame.jsligo

Add a main function

```javascript
type storage = unit;

type parameter =
| ["Poke"];

type return_ = [list<operation>, storage];

const main = ([action, store] : [parameter, storage]) : return_ => {
    return match (action, {
        Poke: () => poke(store)
    } 
    )
};
```

Every contract requires :
- an entrypoint, **main** by default, with a mandatory signature taking 2 parameters and a return : 
    - **parameter** : the contract `parameter`
    - **storage** : the on-chain storage (can be any type, here `unit` by default)
    - **return_** : a list of `operation` and a storage

> Doc :  https://ligolang.org/docs/advanced/entrypoints-contracts

>:warning: You will notice that jsligo is a javascript-like language, multiple parameter declaration is a bit different.
Instead of this declaration : `(action : parameter, store : storage)`
You have to separate variable name to its type declaration this way : `([action, store] : [parameter, storage])`


Pattern matching is an important feature in Ligo. We need a switch on the entrypoint function to manage different actions. We use `match` to evaluate the parameter and call the appropriated `poke` function
> Doc https://ligolang.org/docs/language-basics/unit-option-pattern-matching

```javascript
match (action, {
        Poke: () => poke(store)
    } 
```

`Poke` is a `parameter` from `variant` type. It is the equivalent of Enum type in javascript

```javascript
type parameter =
| ["Poke"];
```

> Doc https://ligolang.org/docs/language-basics/unit-option-pattern-matching#variant-types

## Step 3 : Write the poke function

We want to store every caller address poking the contract. Let's redefine storage, and then add the caller to the set of poke guys

```javascript
type storage = set<address>;

...

const poke = (store : storage) : return_ => {
    return [  list([]) as list<operation>, Set.add(Tezos.get_source(), store)]; 
};
```

Set library has specific usage :
> Doc https://ligolang.org/docs/language-basics/sets-lists-tuples#sets


Here, we get the caller address using `Tezos.get_source()`. Tezos library provides useful function for manipulating blockchain objects
> Doc https://ligolang.org/docs/reference/current-reference

## Step 4 : Try to poke

The LIGO command-line interpreter provides sub-commands to directly test your LIGO code

> Doc : https://ligolang.org/docs/advanced/testing

Compile contract (to check any error, and prepare the michelson outputfile to deploy later) :

```bash
taq compile pokeGame.jsligo
```

Compile an initial storage (to pass later during deployment too)

```bash
taq compile storage pokeGame.jsligo 'Set.empty as set<address>' -e "development"
```

Dry run (i.e test an execution locally without deploying), pass the contract parameter `Poke()` and the initial on-chain storage with an empty set : 

```bash
taq dry-run pokeGame.jsligo 'Poke()' 'Set.empty as set<address>' 
```

Output should give : 

```ocaml
( LIST_EMPTY() ,
  SET_ADD(@"tz1QL8xpMA9JwtUYXXwB6qnJTk8pkEakHpT4" , SET_EMPTY()) )
```

You can notice that the instruction will store the address of the caller into the traces storage

## Step 5 : Configure your wallet to get free Tez



### Local testnet wallet

Flextesa local testnet includes already some accounts with XTZ (alice,bob,...)

### Jakarta testnet wallet

> Note as a simple user, you would need only a web faucet like [Marigold faucet here](https://faucet.marigold.dev/). However, Taqueria will require the faucet JSON file

Go to the [Tezos faucet](https://teztnets.xyz/jakartanet-faucet) and get the faucet file for Jakarta

On taqueria .taq/config.json file, add a new Jakarta testnet on network field as follow 

```json
   "network": {
        "jakartanet": {
            "label": "Jakartanet Testnet",
            "rpcUrl": "https://jakartanet.tezos.marigold.dev",
            "protocol": "PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY",
            "faucet": {
                "pkh": "tz1LsNuEoc8vZPJpvjYcjERVD8RYdZCKyume",
                "mnemonic": [
                    "bunker",
                    "maple",
                    "refuse",
                    "awful",
                    "vote",
                    "series",
                    "urban",
                    "hill",
                    "toddler",
                    "rural",
                    "love",
                    "just",
                    "toward",
                    "swear",
                    "avocado"
                ],
                "email": "yvlgzqzr.uypforim@teztnets.xyz",
                "password": "vlnDLyoUPF",
                "amount": "16034654271",
                "activation_code": "ec0978849eb4034d92a69d8b6b193f919715cbc0"
            }
        }
        
    },
```

Then on "environment" field, you can add a new environment pointing to this network
```json
"testing": {
            "networks": [
                "jakartanet"
            ]
        }
```

```bash
taq list accounts -n "jakartanet"
```

Your account should appear on the list now with its balance

### Temple

Open your Temple browser extension or on your mobile phone. Do the initial setup to create an implicit account then import an account from the previous JSON faucet file

:rocket: You are ready to go :sunglasses:

## Step 6 : (Optional) deploy locally with flextesa

You can deploy locally Tezos on your local machine, but we require to use laer an indexer (this service exists already on Jakartanet). For your knowledge, below the step to deplpoy locally.

```
taq install @taqueria/plugin-flextesa

# it takes some minutes the first time
taq start sandbox local

#list users
taq list accounts local

```

Deploy the contract

Edit the init storage on file ./.taq/config.json , where the field "environment"
like this
```json
"environment": {
        "default": "development",
        "development": {
            "networks": [],
            "sandboxes": [
                "local"
            ]
        }
    },
```

Add the inital storage

```bash
taq compile storage pokeGame.jsligo 'Set.empty as set<address>' -e "development"
```

you should have now

```json
"environment": {
        "default": "development",
        "development": {
            "networks": [],
            "sandboxes": [
                "local"
            ],
            "storage": {
                "pokeGame.tz": []
            }
        }
    },
```

and then, to deploy it, install plugin first and originate the contract

```bash
taq install @taqueria/plugin-taquito

taq deploy pokeGame.tz -e "development"
```

## Step 6 : Deploy to Jakarta testnet

Add testing environment

Edit the init storage on file ./.taq/config.json , where the field "environment"
like this

```json
"environment": {
        "default": "testing",
        "testing": {
            "networks": [
                "jakartanet"
            ]
        }
    },
```

Add initial storage to testing env

```bash

taq compile storage pokeGame.jsligo 'Set.empty as set<address>' -e "testing"

taq deploy pokeGame.tz -e "testing"
```

HOORAY :confetti_ball: your smart contract is ready on the Jakarta !

# :construction_worker:  Dapp 

## Step 1 : Create react app

```bash
yarn create react-app app --template typescript

cd app
```

Add taquito, tzkt indexer lib

```bash
yarn add @taquito/taquito @taquito/beacon-wallet @airgap/beacon-sdk
yarn add @dipdup/tzkt-api
```



> :warning: If you are using last version 5.x of react-script, follow these steps to rewire webpack for all encountered missing libraries : https://github.com/ChainSafe/web3.js#troubleshooting-and-known-issues

> For example, in my case :

> yarn add --dev react-app-rewired process crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url path-browserify

> and my overrides : 
> "crypto": require.resolve("crypto-browserify"),
> "stream": require.resolve("stream-browserify"),
> "assert": require.resolve("assert"),
> "http": require.resolve("stream-http"),
> "https": require.resolve("https-browserify"),
> "os": require.resolve("os-browserify"),
> "url": require.resolve("url"),
> "path": require.resolve("path-browserify")    :warning:


Get typescript classes from taqueria plugin, get back to root folder
```bash
cd ..

taq install @taqueria/plugin-contract-types

taq generate types ./app/src

cd ./app
```

Start the dev server

```bash
yarn run start
```

Open your browser at : http://localhost:3000/
Your app should be running

## Step 2 : Connect / disconnect the wallet

We will declare 2 React Button components and a display of address and balance while connected

Edit src/App.tsx file

```typescript
import { useState } from 'react';
import './App.css';
import ConnectButton from './ConnectWallet';
import { TezosToolkit } from '@taquito/taquito';
import DisconnectButton from './DisconnectWallet';

function App() {

  const [Tezos, setTezos] = useState<TezosToolkit>(new TezosToolkit("https://jakartanet.tezos.marigold.dev"));
  const [wallet, setWallet] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);

  return (
    <div className="App">
      <header className="App-header">
        <p>
        
        <ConnectButton
          Tezos={Tezos}
          setWallet={setWallet}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
          wallet={wallet}
        />
        
        <DisconnectButton
          wallet={wallet}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
          setWallet={setWallet}
        />

        <div>
        I am {userAddress} with {userBalance} mutez
        </div>

        </p>

      </header>
    </div>
  );
}

export default App;
```

Let's create the 2 missing src component files and put code in it. On **src** folder, create these files.

```bash
touch ConnectWallet.tsx
touch DisconnectWallet.tsx
```

ConnectWallet button will create an instance wallet, get user permissions via a popup and then retrieve account information

Edit ConnectWallet.tsx

```typescript
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType
} from "@airgap/beacon-sdk";

type ButtonProps = {
  Tezos: TezosToolkit;
  setWallet: Dispatch<SetStateAction<any>>;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  wallet: BeaconWallet;
};

const ConnectButton = ({
  Tezos,
  setWallet,
  setUserAddress,
  setUserBalance,
  wallet
}: ButtonProps): JSX.Element => {

  const setup = async (userAddress: string): Promise<void> => {
    setUserAddress(userAddress);
    // updates balance
    const balance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(balance.toNumber());
  };

  const connectWallet = async (): Promise<void> => {
    try {
      if(!wallet) await createWallet();
      await wallet.requestPermissions({
        network: {
          type: NetworkType.JAKARTANET,
          rpcUrl: "https://jakartanet.tezos.marigold.dev"
        }
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
    } catch (error) {
      console.log(error);
    }
  };

  const createWallet = async() => {
    // creates a wallet instance if not exists
    if(!wallet){
      wallet = new BeaconWallet({
      name: "training",
      preferredNetwork: NetworkType.JAKARTANET
    });}
    Tezos.setWalletProvider(wallet);
    setWallet(wallet);
    // checks if wallet was connected before
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
    }
  }

  useEffect(() => {
    (async () => createWallet())();
  }, []);

  return (
    <div className="buttons">
      <button className="button" onClick={connectWallet}>
        <span>
          <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
        </span>
      </button>
    </div>
  );
};

export default ConnectButton;
```

DisconnectWallet button will clean wallet instance and all linked objects

```typescript
import { Dispatch, SetStateAction } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";

interface ButtonProps {
  wallet: BeaconWallet | null;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  setWallet: Dispatch<SetStateAction<any>>;
}

const DisconnectButton = ({
  wallet,
  setUserAddress,
  setUserBalance,
  setWallet,
}: ButtonProps): JSX.Element => {
  const disconnectWallet = async (): Promise<void> => {
    setUserAddress("");
    setUserBalance(0);
    setWallet(null);
    console.log("disconnecting wallet");
    if (wallet) {
      await wallet.client.removeAllAccounts();
      await wallet.client.removeAllPeers();
      await wallet.client.destroy();
    }
  };

  return (
    <div className="buttons">
      <button className="button" onClick={disconnectWallet}>
        <i className="fas fa-times"></i>&nbsp; Disconnect wallet
      </button>
    </div>
  );
};

export default DisconnectButton;

```

Save both file, the dev server should refresh the page

As Temple is configured well, Click on Connect button

On the popup, select your Temple wallet, then your account and connect. :warning: Do not forget to stay on the "jakartanet" testnet

![](doc/logged.png)

:confetti_ball: your are *"logged"*

Click on the Disconnect button to logout to test it

## Step 3 : List poke contracts via an indexer

Remember that you deployed your contract previously.
Instead of querying heavily the rpc node to search where is located your contract and get back some information about it, we can use an indexer. We can consider it as an enriched cache API on top of rpc node. In this example, we will use the tzkt indexer

Add the library

```bash
yarn add @dipdup/tzkt-api
yarn add dotenv
```


[Install jq](https://github.com/stedolan/jq)
On package.json, change the start script line, prefixing with jq command to create an new env var pointing to your last smart contract address on testing env :
```
    "start": "jq -r '\"REACT_APP_CONTRACT_ADDRESS=\" + last(.tasks[]).output[0].address' ../.taq/testing-state.json > .env && react-app-rewired start",
```
You are pointing now to the last contract deployed on Jakarta by taqueria

We will add a button to fetch all similar contracts to the one you deployed, then we display the list

Now, edit App.tsx to add 1 import on top of the file

```typescript
import { Contract, ContractsService } from '@dipdup/tzkt-api';
```

Before the return , add this section for the fetch

```typescript
  const contractsService = new ContractsService( {baseUrl: "https://api.jakartanet.tzkt.io" , version : "", withCredentials : false});
  const [contracts, setContracts] = useState<Array<Contract>>([]);

  const fetchContracts = () => {
    (async () => {
     setContracts((await contractsService.getSimilar({address: process.env["CONTRACT_ADDRESS"]!, includeStorage:true, sort:{desc:"id"}})));
    })();
  }
```

On the return 'html templating' section, add this after the display of the user balance div `I am {userAddress} with {userBalance} mutez`, add this : 

```html
<br />
<div>
    <button onClick={fetchContracts}>Fetch contracts</button>
    {contracts.map((contract) => <div>{contract.address}</div>)}
</div>
```
Save your file and go to the browser. click on Fetch button

![](doc/deployedcontracts.png)

:confetti_ball:  Congrats ! you are able to list all similar deployed contracts


## Step 4 : Poke your contract

Add some import at the top

```typescript
import { TezosToolkit, WalletContract } from '@taquito/taquito';
```

Add this new function inside the App function, it will call the entrypoint to poke

```typescript
 const poke = async (contract : Contract) => {   
    let c : PokeGameContractType = await Tezos.wallet.at(""+contract.address);
    try {
      const op = await c.methods.default().send();
      await op.confirmation();
      alert("Tx done");
    } catch (error : any) {
      console.table(`Error: ${JSON.stringify(error, null, 2)}`);
    }
  };
```

> :warning: Normally we should call `c.methods.poke()` function , but there is a bug while compiling ligo variant with one unique choice, then the `default` is generated instead of having the name of the function. Also be careful because all entrypoints naming are converting to lowercase whatever variant variable name you can have on source file. 

Then replace the line displaying the contract address `{contracts.map((contract) => <div>{contract.address}</div>)}` by this one that will add a Poke button

```html
    {contracts.map((contract) => <div>{contract.address} <button onClick={() =>poke(contract)}>Poke</button></div>)}
```

Save and see the page refreshed, then click on Poke button

![](doc/pokecontracts.png)

:confetti_ball:  If you have enough Tz on your wallet for the gas, then it should have successfully call the contract and added you to the list of poke guyz

## Step 5 : Display poke guys

To verify that on the page, we can display the list of poke guyz directly on the page

Replace again the html contracts line by this one

```html
<table><thead><tr><th>address</th><th>people</th><th>action</th></tr></thead><tbody>
    {contracts.map((contract) => <tr><td style={{borderStyle: "dotted"}}>{contract.address}</td><td style={{borderStyle: "dotted"}}>{contract.storage.join(", ")}</td><td style={{borderStyle: "dotted"}}><button onClick={() =>poke(contract)}>Poke</button></td></tr>)}
    </tbody></table>
```

Contracts are displaying its people now 

![](doc/table.png)

> :information_source: Wait around few second for blockchain confirmation and click on "fetch contracts" to refresh the list
 
:confetti_ball: Congratulation, you have completed this first dapp training 

# :palm_tree: Conclusion :sun_with_face:

Now, you are able to create any Smart Contract using Ligo and create a complete Dapp via Taqueria/Taquito.

On next training, you will learn how to call a Smart contract inside a Smart Contract and use the callback, write unit test, etc ...

[:arrow_right: NEXT](https://github.com/marigold-dev/training-dapp-2)
