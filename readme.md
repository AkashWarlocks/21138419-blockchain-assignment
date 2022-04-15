# Token Transfer Blockchain-NodeJs Application

This is backend application which will Transfer tokens to addressusing smart contract.

## Functions

1. Approve total amount
2. Transfer All

## Setting up the enviroment

### Pre-requisities

List of env setup required:

1. NodeJs - To setup a backend server

2. Libraries: web3, bignumber, ethereum/tx, axios

### Installing Dependencies

1. To Install NodeJs <https://nodejs.org/en/download/>

## Running the Project

1. Clone/unzip the project

2. Inside Code root directory

   ```
   cd name-of-folder
   ```

3. Install nodemon globally

   ```
   npm i nodemon
   ```

4. Install other dependencies from package.json

   ```
   npm install
   ```

5. Create .env file and get the content from .env.sample

   ```
   INFURA_URL=https://ropsten.infura.io/v3/<YOUR INFURA ID>
   ROPSTEN_URL=https://api.ethgasstation.info/api/fee-estimate

   PUBLIC_KEY=<>
   PRIVATE_KEY=<>
   ```

6. Start the project

   ```
   node app.js
   ```
