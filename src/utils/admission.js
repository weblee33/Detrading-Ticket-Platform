import { ethers } from 'ethers';

export function encodeAdmissionPass(pass) {
  return JSON.stringify({
    v: 1,
    c: pass.contract,
    i: pass.chainId,
    h: pass.holder,
    t: String(pass.tokenId),
    n: pass.nonce,
    d: String(pass.deadline),
    s: pass.signature
  });
}

export function parseAdmissionPass(value) {
  const raw = typeof value === 'string' ? JSON.parse(value.trim()) : value;
  const pass = {
    version: raw.v,
    contract: raw.c,
    chainId: raw.i,
    holder: raw.h,
    tokenId: String(raw.t),
    nonce: raw.n,
    deadline: String(raw.d),
    signature: raw.s
  };
  if (pass.version !== 1) throw new Error('不支援的票證版本');
  if (!ethers.isAddress(pass.contract) || !ethers.isAddress(pass.holder)) throw new Error('票證地址格式無效');
  if (!/^\d+$/.test(pass.tokenId) || !/^\d+$/.test(pass.deadline)) throw new Error('票證鏈上欄位無效');
  if (!ethers.isHexString(pass.nonce, 32)) throw new Error('票證 nonce 無效');
  if (!ethers.isHexString(pass.signature, 65)) throw new Error('票證簽章無效');
  return pass;
}

export function admissionExpiry(pass) {
  return new Date(Number(pass.deadline) * 1000);
}
