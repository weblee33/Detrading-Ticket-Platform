require('@nomicfoundation/hardhat-toolbox');

const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');

// Use the pinned npm solc package so CI and demo setup do not depend on a compiler download.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async ({ solcVersion }, hre, runSuper) => {
  if (solcVersion === '0.8.26') {
    return {
      compilerPath: require.resolve('solc/soljson.js'),
      isSolcJs: true,
      version: '0.8.26',
      longVersion: '0.8.26'
    };
  }
  return runSuper();
});

module.exports = {
  solidity: {
    version: '0.8.26',
    settings: {
      evmVersion: 'cancun',
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    localhost: { url: process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545' }
  }
};
