/* global BigInt */
import { ethers } from 'ethers';

export function shortAddress(address) {
  if (!address) return '—';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatWeiAsEth(value) {
  try {
    return ethers.formatEther(BigInt(value || 0));
  } catch {
    return '0';
  }
}

export function ipfsToHttp(uri) {
  return uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') : uri;
}
