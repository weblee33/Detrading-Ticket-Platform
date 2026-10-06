import abi from '../contracts/TicketMarketplaceV2.abi.json';
import deployment from '../deployments/local.json';

export const platformConfig = {
  address: process.env.REACT_APP_CONTRACT_ADDRESS || deployment.address,
  chainId: process.env.REACT_APP_CHAIN_ID || deployment.chainId || '0x7a69',
  chainName: process.env.REACT_APP_CHAIN_NAME || 'Hardhat Local',
  rpcUrl: process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8545',
  abi
};

export const demoRoles = {
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': { name: '主辦方', tone: 'organizer' },
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': { name: 'Alice・原始持票人', tone: 'holder' },
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': { name: 'Bob・二手買家', tone: 'buyer' },
  '0x90f79bf6eb2c4f870365e785982e1f101e93b906': { name: '驗票員', tone: 'staff' }
};

export function roleForAccount(account, isOwner) {
  if (!account) return { name: '尚未連線', tone: 'offline' };
  if (isOwner) return { name: '主辦方', tone: 'organizer' };
  return demoRoles[account.toLowerCase()] || { name: '一般持票人', tone: 'holder' };
}
