// src/utils/test-ethereum.ts
import Web3 from 'web3';

export const testEthereumFunctions = async () => {
  console.log('🧪 Testing Frontend Ethereum Functions...\n');

  if (!window.ethereum) {
    console.log('❌ MetaMask not detected');
    return false;
  }

  try {
    console.log('1. Testing MetaMask detection...');
    console.log('✅ MetaMask detected:', window.ethereum.isMetaMask);

    console.log('2. Testing account request...');
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    console.log('✅ Accounts:', accounts);

    console.log('3. Testing Web3 initialization...');
    const web3 = new Web3(window.ethereum);
    console.log('✅ Web3 initialized');

    console.log('4. Testing network ID...');
    const networkId = await web3.eth.net.getId();
    console.log('✅ Network ID:', networkId);

    console.log('5. Testing block number...');
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('✅ Block number:', blockNumber);

    console.log('6. Testing balance...');
    if (accounts.length > 0) {
      const balance = await web3.eth.getBalance(accounts[0]);
      console.log('✅ Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');
    }

    console.log('7. Testing gas price...');
    const gasPrice = await web3.eth.getGasPrice();
    console.log('✅ Gas price:', web3.utils.fromWei(gasPrice, 'gwei'), 'Gwei');

    console.log('\n🎉 All tests passed!');
    return true;

  } catch (error: any) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
};

// Utility to run tests from browser console
declare global {
  interface Window {
    testEthereum: () => Promise<boolean>;
  }
}

if (typeof window !== 'undefined') {
  window.testEthereum = testEthereumFunctions;
}