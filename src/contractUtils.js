/* global BigInt */
import { ethers } from 'ethers';

export function requirePositiveInteger(value, fieldName = '數值') {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text) || BigInt(text) <= 0n) {
    throw new Error(`${fieldName}必須是大於 0 的整數`);
  }
  return BigInt(text);
}

export function calculateTotalWei(amount, pricePerItem) {
  return requirePositiveInteger(amount, '購買數量') *
    requirePositiveInteger(pricePerItem, '單價');
}

export function validateMintForm(form) {
  const required = ['eventName', 'eventDate', 'ticketType', 'metadataURI', 'to'];
  for (const field of required) {
    if (!String(form[field] ?? '').trim()) throw new Error('請完整填寫鑄造資料');
  }
  requirePositiveInteger(form.amount, '鑄造數量');
  if (!ethers.isAddress(form.to)) throw new Error('接收地址格式不正確');
}

export function mapTicketInfo(id, info, uri, balance) {
  return {
    id: Number(id),
    eventName: info.eventName ?? info[0] ?? '',
    eventDate: info.eventDate ?? info[1] ?? '',
    ticketType: info.ticketType ?? info[2] ?? '',
    metadataURI: info.metadataURI ?? info[3] ?? '',
    uri,
    balance: BigInt(balance).toString()
  };
}

export function mapListing(id, listing) {
  return {
    id: Number(id),
    seller: listing.seller ?? listing[0],
    tokenId: BigInt(listing.tokenId ?? listing[1]).toString(),
    amount: BigInt(listing.amount ?? listing[2]).toString(),
    pricePerItem: BigInt(listing.pricePerItem ?? listing[3]).toString()
  };
}

export function friendlyError(error) {
  if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') return '使用者已取消操作';
  if (error?.code === 'TRANSACTION_REPLACED' && error?.cancelled) return '交易已被取消或替換';
  return error?.shortMessage || error?.reason || error?.message || '發生未知錯誤';
}

export async function waitForTransaction(tx) {
  if (!tx || typeof tx.wait !== 'function') throw new Error('錢包未回傳有效交易');
  return tx.wait();
}
