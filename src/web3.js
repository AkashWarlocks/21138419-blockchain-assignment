const Web3 = require('web3');
const transaction = require('./transactions');
const { INFURA_URL, ROPSTEN_URL } = require('./config');
const Common = require('@ethereumjs/common').default;
const { Chain, Hardfork } = require('@ethereumjs/common');
const EthereumTx = require('@ethereumjs/tx').Transaction;

const axios = require('./axios');

const contractAddress = '0xD5807577ab00a17b9b74cd87d53EF3dA3A76e60D';
const transferAddress = '0x7110363f6061a4d0255b8577e6b76DE9B44a5DcE';
const contractABI = require('./contracts/warlockz-abi.json');
const transferABI = require('./contracts/transfer-token-abi.json');
let web3Instance = {};
let warlockz_contract_instance = {};
let transfer_contract_instance = {};
let common = {};

const initiateWeb3Instance = async () => {
  try {
    //console.log('in this web3');

    const web3Provider = new Web3.providers.HttpProvider(INFURA_URL);

    web3Instance = new Web3(web3Provider);
    warlockz_contract_instance = new web3Instance.eth.Contract(
      contractABI,
      contractAddress,
    );

    //console.log({ warlockz_contract_instance });

    transfer_contract_instance = new web3Instance.eth.Contract(
      transferABI,
      transferAddress,
    );
    common = new Common({
      chain: Chain.Ropsten,
      hardfork: Hardfork.Petersburg,
    });
  } catch (error) {}
};

const getWeb3Instance = async () => {
  // console.log({web3Instance})
  try {
    return web3Instance;
  } catch (error) {
    throw error;
  }
};

async function getContractInstance() {
  return warlockz_contract_instance;
}

async function getCommon() {
  return common;
}

async function getName(options) {
  try {
    const name = await transaction.callFunction(
      warlockz_contract_instance,
      'name',
      [],
      options,
    );
    return name;
  } catch (error) {
    throw error;
  }
}

async function getSymbol(options) {
  const symbol = await transaction.callFunction(
    warlockz_contract_instance,
    'symbol',
    [],
    options,
  );
  return symbol;
}

async function getDecimals(options) {
  const decimals = await transaction.callFunction(
    warlockz_contract_instance,
    'decimals',
    [],
    options,
  );
  return decimals;
}

async function getBalance(account, options) {
  const balance = await transaction.callFunction(
    warlockz_contract_instance,
    'balanceOf',
    [account],
    options,
  );
  return balance;
}

async function approveToken(amount, keypair) {
  try {
    // generate a nonce
    const txCount = await web3Instance.eth.getTransactionCount(
      keypair.publicKey,
    );

    console.log('tx count is ' + txCount);

    // Get Encoded data
    // const encodedData = await transaction.encodeData(
    //   warlockz_contract_instance,
    //   'transfer',
    //   [toAccount, amount],
    // );

    const encodedData = await warlockz_contract_instance.methods['approve'](
      transferAddress,
      amount,
    ).encodeABI();

    // 2. To estimate Gas
    // const estimateGasPrice = await transaction.estimatedGasLimit(
    //   keypair,
    //   txCount,
    //   encodedData,
    //   contractAddress,
    // );

    const estimatedGasLimit = await web3Instance.eth.estimateGas({
      from: keypair.publicKey,
      nonce: `${txCount}`,
      to: contractAddress,
      data: encodedData,
    });

    //const gasPrice = await this.getGasPrice();
    const response = await axios(
      ROPSTEN_URL,
      '',
      'GET',
      {},
      {},
      { network: 'ropsten' },
      'json',
    );
    console.log({ estimatedGasLimit, gasPrice: response.data });

    const data = { estimatedGasLimit, gasPrice: response.data.gasPrice };
    const txObject = {
      chainId: 3,
      nonce: web3Instance.utils.toHex(txCount),
      gasLimit: web3Instance.utils.toHex(data.estimatedGasLimit), // Raise the gas limit to a much higher amount
      gasPrice: web3Instance.utils.toHex(
        web3Instance.utils.toWei(`${data.gasPrice.fast}`, 'gwei'),
      ),
      to: contractAddress,
      data: encodedData,
    };

    // Initialize Transaction object and freeze the tx object
    let tx = new EthereumTx(txObject, { common });
    const privateKey = keypair.privateKey.substr(2);

    // Convert string to hex : privateKey
    const pvtBuffer = Buffer.from(privateKey, 'hex');

    // Sign the transaction using the hex of private key
    tx = tx.sign(pvtBuffer);

    /**
     * Returns the serialized encoding of the legacy const
     * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
     * */

    const serializedTx = tx.serialize();

    const raw = '0x' + serializedTx.toString('hex');
    // // Get Gas estimate from external API
    // const signedTransaction = await transaction.signTransaction(
    //   `${txCount}`,
    //   encodedData,
    //   keypair,
    //   contractAddress,
    //   estimateGasPrice.estimatedGasLimit,
    //   //'819758',
    //   `${estimateGasPrice.gasPrice.fastest}`,
    //   // '10.500000012',
    // );

    // const transactionDetails = await transaction.sendSignedTransaction(
    //   signedTransaction,
    // );
    //console.log({ transaction });
    const transaction = await web3Instance.eth.sendSignedTransaction(raw);

    console.log({ transactionHash: transaction.transactionHash });
    // Get Receipt of transaction based on transaction hash
    // const receipt = await transaction.getTransactionReceipt(
    //   transactionDetails.transactionHash,
    // );

    // console.log({ receipt });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function transferToken(toAccount, amount, keypair) {
  try {
    // generate a nonce
    const txCount = await web3Instance.eth.getTransactionCount(
      keypair.publicKey,
    );

    console.log('tx count is ' + txCount);

    // Get Encoded data

    const encodedData = await transfer_contract_instance.methods['transferAll'](
      toAccount,
      amount,
    ).encodeABI();

    // 2. To estimate Gas
    const estimatedGasLimit = await web3Instance.eth.estimateGas({
      from: keypair.publicKey,
      nonce: `${txCount}`,
      to: transferAddress,
      data: encodedData,
    });

    //const gasPrice = await this.getGasPrice();
    const response = await axios(
      ROPSTEN_URL,
      '',
      'GET',
      {},
      {},
      { network: 'ropsten' },
      'json',
    );
    console.log({ estimatedGasLimit, gasPrice: response.data });

    const data = { estimatedGasLimit, gasPrice: response.data.gasPrice };
    const txObject = {
      chainId: 3,
      nonce: web3Instance.utils.toHex(txCount),
      gasLimit: web3Instance.utils.toHex(data.estimatedGasLimit), // Raise the gas limit to a much higher amount
      gasPrice: web3Instance.utils.toHex(
        web3Instance.utils.toWei(`${data.gasPrice.fast}`, 'gwei'),
      ),
      to: transferAddress,
      data: encodedData,
    };

    // To get details of network used

    // console.log({ common });
    // Initialize Transaction object and freeze the tx object
    let tx = new EthereumTx(txObject, { common });
    const privateKey = keypair.privateKey.substr(2);

    // Convert string to hex : privateKey
    const pvtBuffer = Buffer.from(privateKey, 'hex');

    // Sign the transaction using the hex of private key
    tx = tx.sign(pvtBuffer);

    /**
     * Returns the serialized encoding of the legacy const
     * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
     * */

    const serializedTx = tx.serialize();

    const raw = '0x' + serializedTx.toString('hex');

    const transaction = await web3Instance.eth.sendSignedTransaction(raw);

    console.log({ transaction });
    // Get Receipt of transaction based on transaction hash
    // const receipt = await transaction.getTransactionReceipt(
    //   transactionDetails.transactionHash,
    // );

    // console.log({ receipt });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  initiateWeb3Instance,
  getWeb3Instance,
  getCommon,
  getContractInstance,
  transferToken,
  getDecimals,
  getSymbol,
  getBalance,
  approveToken,
  getName,
};
