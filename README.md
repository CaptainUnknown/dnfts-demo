<img src="https://i.imgur.com/vEXbpUu.png" alt="Splash screen for dNFTs" style="width:600px;"/>

# Prototype Dynamic NFTs | Nex Labs
This repository contains the source code for a basic dynamic NFT implementation. User is able to interact and modify their tokens. This not only makes the NFTs fully customizable but composable. NFTs changes or additions can be time triggerred or even user triggerred.


## Components Breakdown

### Front-end Client:
The DApp contains a single page that demonstrates customizability, which can be triggerred by a user action. This triggers the Smart Contract and the user provided args are passed along.

### Smart Contract:
The Smart Contract contains a very basic ERC721 implementation & uses Chainlink Functions to request the changes with custom arguments. Once invoked, the Smart Contract after necessary checks forwards the user args to the Chainlink Functions.

### Vercel Edge Function:
The Vercel Edge Function serves as a demo endpoint to update the nft with any specific changes received from the user. The Chainlink function calls this API that is responsible for generating on demand metadata. Once done, the Chainlink Function callbacks the Smart Contract to update the metadata of any ``tokenId``.


## Installation

To run the DApp locally, follow these steps:

1. Deploy the ``dNFT.sol`` Smart Contract provided in ``/contracts/``.
2. Create a [Chainlink Function Subcription](https://functions.chain.link/). Once done, retrieve the ``subscriptionId``.
2. Clone the repository:
```
git clone https://github.com/CaptainUnknown/dnfts-demo.git
```
3. Copy the address of your deployed contracts and add it to the constants file, along with any other required information:
```
cd dnfts-demo/client
nano src/Constant/constants.js
``` 
4. Install the dependencies:
```
npm install
```
5. Serve the DApp using the following command:
```
npm run start
```
6. Update the environment variables from ``.env.example``.
```
cd ..
cd serverless
mv .env.example .env
nano .env
```
7. Navigate to the ``serverless`` directory & then run the app:
```
vercel dev
``` 
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Considerations 
- This is purely a demo project & implementation would depend on specific needs that the NFT Collection serves.
- Current implementation exposes the endpoint in the Smart Contract. To deal with this, ``secrets`` can be used to validate the API requests.
- Complicated compute (>10s) or delayed responses can't be done using Chainlink functions. In those conditions, consider using Chainlink Direct Requests.

## Possibilities 
- On demand metadata generation can allow complete composability or layered functionality.
- Event driven changes.
- Access to certain features or attributes of an NFT can be controlled and triggered automatically based on external conditions or user actions.

## Screenshots
1. DApp Prevew:
<br />
<img src="https://i.imgur.com/rXM2vUf.png" alt="DApp Preview" style="width:400px;"/>

2. Functioning:
<img src="https://i.imgur.com/z9C6WJA.gif" alt="recorded functioning" style="width:800px;"/>