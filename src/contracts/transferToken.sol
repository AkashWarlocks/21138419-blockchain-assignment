// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol';

contract transferToken is Ownable {
  IERC20 erc20;

  constructor(address token_contract_address) {
    // Sets the instance of ERC20 token contract
    erc20 = IERC20(token_contract_address);
  }

  /**
   * This Function will transfer amount to all addresses mentioned in array of user_addresses.
   */
  function transferAll(address[] memory user_addresses, uint256 amount)
    public
    onlyOwner
  {
    require(user_addresses.length > 0, 'Insufficient Users');

    for (uint256 i = 0; i < user_addresses.length; i++) {
      erc20.transferFrom(owner(), user_addresses[i], amount);
    }
  }

  function changeContractInstance(address new_token_contract_address)
    public
    onlyOwner
  {
    require(new_token_contract_address != address(0), 'Cannot be Zero address');
    require(
      new_token_contract_address != address(this),
      'Cannot be same as Contract address'
    );

    erc20 = IERC20(new_token_contract_address);
  }
}
