const web3 = require('./src/web3');
let fs = require('fs');
const { BigNumber } = require('bignumber.js');
const { USER_KEYS } = require('./src/config');

async function startTransaction() {
  try {
    await web3.initiateWeb3Instance();
    // Read File
    let distributionAddresses = fs
      .readFileSync('./accounts.txt', 'utf8')
      .split('\n');
    console.log({ distributionAddresses });

    // Call Transaction function in for loop
    const web3Instance = await web3.getWeb3Instance();
    //console.log({ web3Instance });
    let options = {
      from: USER_KEYS.publicKey,
    };
    const name = await web3.getName(options);
    const symbol = await web3.getSymbol(options);

    const decimal = await web3.getDecimals(options);

    const balance = await web3.getBalance(USER_KEYS.publicKey, options);

    console.log({ name, symbol, decimal, balance });

    const decimcalBN = new BigNumber(decimal);
    const balanceBN = new BigNumber(balance);

    const fivePercent = new BigNumber(20);

    const approveBalance = balanceBN.div(fivePercent);
    const balanceNew = approveBalance.div(1e18);
    // console.log({ a: dividedBalance.toFixed(), balanceNew });
    console.log({ Owner_Balance: new BigNumber(balance).div(1e18).toFixed() });

    const addressLengthBN = new BigNumber(distributionAddresses.length);

    const individualBalance = approveBalance.div(addressLengthBN);

    console.log(
      '--------------------------------Balances Before Transfer--------------------------------',
    );

    for (var i = 0; i < distributionAddresses.length; i++) {
      let balance = await web3.getBalance(distributionAddresses[i], options);
      let userBalance = new BigNumber(balance).div(1e18);

      console.log({ [distributionAddresses[i]]: userBalance.toFixed() });
    }

    console.log({
      Individual_transfer_amount: individualBalance.div(1e18).toFixed(),
    });

    const approved = await web3.approveToken(
      approveBalance.toFixed(),
      USER_KEYS,
    );

    console.log('approve done');

    //Individual Transfer
    const data = await web3.transferToken(
      distributionAddresses,
      individualBalance.toFixed(),
      USER_KEYS,
    );

    console.log(' transfer done');

    // console.log({ data });

    console.log(
      '--------------------------------Balances After Transfer--------------------------------',
    );
    for (var i = 0; i < distributionAddresses.length; i++) {
      let balance = await web3.getBalance(distributionAddresses[i], options);
      let userBalance = new BigNumber(balance).div(1e18);

      console.log({ [distributionAddresses[i]]: userBalance.toFixed() });
    }
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  await startTransaction();
})();
