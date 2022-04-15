//const web3 = require('./web3');
let { getWeb3Instance } = require('./web3');
const EthereumTx = require('@ethereumjs/tx').Transaction;
const { ROPSTEN_URL } = require('./config');
const axios = require('./axios');
let transaction = {};

// Function to get the number of transaction count of the user: using publicKey
const getTxCount = async (publicKey) => {
  try {
    let web3 = require('./web3');
    const web3Instance = await web3.getWeb3Instance();

    const txCount = await web3Instance.eth.getTransactionCount(publicKey);
    return txCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Funtion: Returns: hex string is 32-bit function signature hash plus the
 * passed parameters in Solidity tightly packed format
 * @param {Object} contractInstance
 * @param {String} method
 * @param {Array} data
 * @returns
 */
const encodeData = async (contractInstance, method, data) => {
  try {
    const encodedData = await contractInstance.methods[method](
      ...data,
    ).encodeABI();

    return encodedData;
  } catch (error) {
    throw error;
  }
};

/**
 * Function to predict gas limit and gas price.
 * @param {Object} userKeypair
 * @param {String} nonce
 * @param {Hex} encodedData
 * @param {String} contractAddress
 * @returns
 */
const estimatedGasLimit = async (
  userKeypair,
  nonce,
  encodedData,
  contractAddress,
) => {
  try {
    const web3Instance = await getWeb3Instance();
    const estimatedGasLimit = await web3Instance.eth.estimateGas({
      from: userKeypair.publicKey,
      nonce,
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
    return { estimatedGasLimit, gasPrice: response.data };
  } catch (error) {
    throw error;
  }
};

/**
 *
 * @param {string} txCount
 * @param {string} data
 * @param {object} userKeypair
 * @param {string} contractAddress
 * @param {string} gasLimit
 * @param {string} estimatedGasPrice
 * @returns raw : transaction string
 */
const signTransaction = async (
  txCount,
  data,
  userKeypair,
  contractAddress,
  gasLimit,
  estimatedGasPrice,
) => {
  try {
    const web3Instance = await getWeb3Instance();

    const txObject = {
      chainId: 80001,
      nonce: web3Instance.utils.toHex(txCount),
      gasLimit: web3Instance.utils.toHex(236906), // Raise the gas limit to a much higher amount
      gasPrice: web3Instance.utils.toHex(
        web3Instance.utils.toWei('30', 'gwei'),
      ),
      to: contractAddress,
      data,
    };

    // To get details of network used
    const common = await getCommon();

    // console.log({ common });
    // Initialize Transaction object and freeze the tx object
    let tx = new EthereumTx(txObject, { common });

    const privateKey = userKeypair.privateKey.substr(2);

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

    return raw;
  } catch (error) {
    throw error;
  }
};

/**
 * Function to broadcast signed transaction on the chain
 * @param {Object} signedTransaction
 * @returns {Object} transaction: Transaction object details.
 */

const sendSignedTransaction = async (signedTransaction) => {
  try {
    const web3Instance = await getWeb3Instance();

    const transaction = await web3Instance.eth.sendSignedTransaction(
      signedTransaction,
    );
    return transaction;
  } catch (error) {
    let receipt = null;
    if (error.receipt) {
      receipt = await getTransactionReceipt(error.receipt.transactionHash);
    }

    throw error;
  }
};

const getTransactionReceipt = async (txHash) => {
  try {
    const web3Instance = await getWeb3Instance();

    const receipt = await web3Instance.eth.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    throw error;
  }
};

/**
 * To call Particular type of method
 *
 * @param {Object} contractInstance - Instance of Contract
 * @param {String} method - Method of contract to be called
 * @param {Aray} data - Data needed to send to contract
 * @param {Object} options
 */
const callFunction = async (contractInstance, method, data, options) => {
  try {
    const response = await contractInstance.methods[method](...data).call(
      options,
    );
    // console.log({response})
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getTxCount,
  encodeData,
  estimatedGasLimit,
  signTransaction,
  sendSignedTransaction,
  getTransactionReceipt,
  callFunction,
};
