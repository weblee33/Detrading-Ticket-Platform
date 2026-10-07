const { ethers } = require('ethers');
require('dotenv').config();

const REQUIRED_ADDRESSES = [
  ['DEMO_SELLER_ADDRESS', 'Alice／賣家'],
  ['DEMO_BUYER_ADDRESS', 'Bob／買家'],
  ['DEMO_GATE_STAFF_ADDRESS', '驗票人員']
];

function validateSepoliaEnv(env = process.env) {
  const errors = [];
  let deployerAddress = '';

  try {
    const url = new URL(env.SEPOLIA_RPC_URL || '');
    if (url.protocol !== 'https:') errors.push('SEPOLIA_RPC_URL 必須使用 HTTPS');
  } catch {
    errors.push('SEPOLIA_RPC_URL 必須是有效的 HTTPS URL');
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(env.DEPLOYER_PRIVATE_KEY || '')) {
    errors.push('DEPLOYER_PRIVATE_KEY 必須是 0x 開頭的 32-byte 私鑰');
  } else {
    deployerAddress = new ethers.Wallet(env.DEPLOYER_PRIVATE_KEY).address.toLowerCase();
  }

  if (env.ALLOW_TESTNET_DEPLOY !== 'true') {
    errors.push('確認目標為 Sepolia 後，將 ALLOW_TESTNET_DEPLOY 設為 true');
  }

  const addresses = [];
  for (const [key, label] of REQUIRED_ADDRESSES) {
    const value = env[key] || '';
    if (!ethers.isAddress(value) || value === ethers.ZeroAddress) {
      errors.push(`${key}（${label}）必須是有效的非零地址`);
    } else {
      addresses.push([key, value.toLowerCase()]);
    }
  }

  const uniqueAddresses = new Set(addresses.map(([, address]) => address));
  if (uniqueAddresses.size !== addresses.length) errors.push('賣家、買家與驗票人員必須使用不同錢包');
  if (deployerAddress && uniqueAddresses.has(deployerAddress)) errors.push('部署者與三個 Demo 角色應使用不同錢包');

  return errors;
}

if (require.main === module) {
  const errors = validateSepoliaEnv();
  if (errors.length) {
    console.error('Sepolia 環境設定未通過：');
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log('Sepolia 環境設定已通過（私鑰內容未輸出）。');
  }
}

module.exports = { validateSepoliaEnv };
