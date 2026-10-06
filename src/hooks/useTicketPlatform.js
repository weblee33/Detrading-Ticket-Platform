/* global BigInt */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { platformConfig, roleForAccount } from '../config/platform';
import { calculateTotalWei, friendlyError, mapListing, mapTicketInfo, requirePositiveInteger, validateMintForm, waitForTransaction } from '../contractUtils';
import { encodeAdmissionPass, parseAdmissionPass } from '../utils/admission';

const EMPTY_STATUS = { phase: 'idle', message: '', hash: '' };

export function useTicketPlatform() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isGateStaff, setIsGateStaff] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(EMPTY_STATUS);
  const requestVersion = useRef(0);

  const clearSession = useCallback(message => {
    requestVersion.current += 1;
    setAccount('');
    setContract(null);
    setIsOwner(false);
    setIsGateStaff(false);
    setTickets([]);
    setListings([]);
    setPendingAction('');
    setStatus(message ? { phase: 'idle', message, hash: '' } : EMPTY_STATUS);
  }, []);

  const loadData = useCallback(async (contractInstance, userAddress) => {
    if (!contractInstance || !userAddress) return;
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const [nextToken, nextListing] = await Promise.all([
        contractInstance.nextTokenId(),
        contractInstance.nextListingId()
      ]);

      const tokenIds = Array.from({ length: Math.max(0, Number(nextToken) - 1) }, (_, index) => index + 1);
      const ticketRows = await Promise.all(tokenIds.map(async id => {
        const [info, uri, balance, supply] = await Promise.all([
          contractInstance.ticketInfos(id),
          contractInstance.uri(id),
          contractInstance.balanceOf(userAddress, id),
          contractInstance['totalSupply(uint256)'](id)
        ]);
        return { ...mapTicketInfo(id, info, uri, balance), supply: supply.toString() };
      }));

      const listingIds = Array.from({ length: Math.max(0, Number(nextListing) - 1) }, (_, index) => index + 1);
      const listingRows = await Promise.all(listingIds.map(async id => mapListing(id, await contractInstance.listings(id))));
      const ticketMap = new Map(ticketRows.map(ticket => [ticket.id.toString(), ticket]));
      const activeListings = listingRows
        .filter(item => item.seller !== ethers.ZeroAddress && BigInt(item.amount) > 0n)
        .map(item => ({ ...item, ticket: ticketMap.get(item.tokenId) }));

      if (version !== requestVersion.current) return;
      setTickets(ticketRows);
      setListings(activeListings);
    } catch (reason) {
      if (version === requestVersion.current) setError(`讀取鏈上資料失敗：${friendlyError(reason)}`);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setError('');
    setStatus({ phase: 'signing', message: '等待錢包連線…', hash: '' });
    if (!window.ethereum) {
      setError('找不到 MetaMask，請先安裝錢包擴充功能。');
      setStatus(EMPTY_STATUS);
      return;
    }
    try {
      let chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId.toLowerCase() !== platformConfig.chainId.toLowerCase()) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: platformConfig.chainId }] });
        } catch (switchError) {
          if (switchError?.code !== 4902) throw switchError;
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: platformConfig.chainId,
              chainName: platformConfig.chainName,
              rpcUrls: [platformConfig.rpcUrl],
              nativeCurrency: { name: 'Test Ether', symbol: 'ETH', decimals: 18 }
            }]
          });
        }
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
      }
      if (chainId.toLowerCase() !== platformConfig.chainId.toLowerCase()) throw new Error('錢包尚未切換至 Demo 網路');

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (!ethers.isAddress(platformConfig.address)) throw new Error('尚未產生有效的本地合約地址，請先執行部署');
      if (await provider.getCode(platformConfig.address) === '0x') throw new Error('目前網路找不到 Demo 合約，請重新執行部署');
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const instance = new ethers.Contract(platformConfig.address, platformConfig.abi, signer);
      const [ownerAddress, gateAccess] = await Promise.all([instance.owner(), instance.gateStaff(userAddress)]);
      const ownerMatch = ownerAddress.toLowerCase() === userAddress.toLowerCase();

      setAccount(userAddress);
      setContract(instance);
      setIsOwner(ownerMatch);
      setIsGateStaff(gateAccess);
      setStatus({ phase: 'confirmed', message: '錢包已連線，鏈上資料已同步。', hash: '' });
      await loadData(instance, userAddress);
    } catch (reason) {
      clearSession();
      setError(`錢包連線失敗：${friendlyError(reason)}`);
    }
  }, [clearSession, loadData]);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const changed = () => clearSession('帳號或網路已變更，請重新連線。');
    window.ethereum.on?.('accountsChanged', changed);
    window.ethereum.on?.('chainChanged', changed);
    window.ethereum.on?.('disconnect', changed);
    return () => {
      window.ethereum.removeListener?.('accountsChanged', changed);
      window.ethereum.removeListener?.('chainChanged', changed);
      window.ethereum.removeListener?.('disconnect', changed);
    };
  }, [clearSession]);

  const runTransaction = useCallback(async (action, signingMessage, send) => {
    if (!contract || pendingAction) return;
    setPendingAction(action);
    setError('');
    setStatus({ phase: 'signing', message: signingMessage, hash: '' });
    try {
      const tx = await send();
      setStatus({ phase: 'submitted', message: '交易已送出，等待區塊確認…', hash: tx.hash });
      await waitForTransaction(tx);
      setStatus({ phase: 'confirmed', message: '交易已確認，平台資料已更新。', hash: tx.hash });
      await loadData(contract, account);
    } catch (reason) {
      setError(friendlyError(reason));
      setStatus(EMPTY_STATUS);
      throw reason;
    } finally {
      setPendingAction('');
    }
  }, [account, contract, loadData, pendingAction]);

  const mint = useCallback(async form => {
    validateMintForm(form);
    return runTransaction('mint', '請在錢包確認鑄票交易…', () => contract.createTicketTypeAndMint(
      form.eventName.trim(), form.eventDate.trim(), form.ticketType.trim(), form.metadataURI.trim(),
      requirePositiveInteger(form.amount, '鑄造數量'), form.to.trim()
    ));
  }, [contract, runTransaction]);

  const list = useCallback(async (tokenId, amount, priceWei) => {
    const quantity = requirePositiveInteger(amount, '掛單數量');
    const price = requirePositiveInteger(priceWei, '單價');
    const ticket = tickets.find(item => item.id === tokenId);
    if (quantity > BigInt(ticket?.balance || 0)) throw new Error('掛單數量超過持有餘額');
    if (!(await contract.isApprovedForAll(account, platformConfig.address))) {
      await runTransaction(`approve-${tokenId}`, '請先授權市場託管票券…', () => contract.setApprovalForAll(platformConfig.address, true));
    }
    return runTransaction(`list-${tokenId}`, '請在錢包確認掛單交易…', () => contract.createListing(tokenId, quantity, price));
  }, [account, contract, runTransaction, tickets]);

  const buy = useCallback(async (listingId, amount) => {
    const listing = listings.find(item => item.id === listingId);
    const quantity = requirePositiveInteger(amount, '購買數量');
    if (!listing || quantity > BigInt(listing.amount)) throw new Error('購買數量超過掛單餘額');
    const value = calculateTotalWei(quantity, listing.pricePerItem);
    return runTransaction(`buy-${listingId}`, '請在錢包確認購買交易…', () => contract.buy(listingId, quantity, { value }));
  }, [contract, listings, runTransaction]);

  const cancel = useCallback(listingId => runTransaction(
    `cancel-${listingId}`, '請在錢包確認取消掛單…', () => contract.cancelListing(listingId)
  ), [contract, runTransaction]);

  const createAdmissionPass = useCallback(async tokenId => {
    if (!contract || pendingAction) return null;
    const ticket = tickets.find(item => item.id === tokenId);
    if (!ticket || BigInt(ticket.balance) < 1n) throw new Error('目前錢包沒有可核銷的這張票');
    setPendingAction(`pass-${tokenId}`);
    setError('');
    setStatus({ phase: 'signing', message: '請在錢包簽署限時入場票證…', hash: '' });
    try {
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const deadline = Math.floor(Date.now() / 1000) + 300;
      const digest = await contract.getRedemptionDigest(account, tokenId, nonce, deadline);
      const signature = await contract.runner.signMessage(ethers.getBytes(digest));
      const pass = {
        version: 1,
        contract: platformConfig.address,
        chainId: platformConfig.chainId,
        holder: account,
        tokenId: String(tokenId),
        nonce,
        deadline: String(deadline),
        signature
      };
      window.localStorage.setItem('detrading.latestAdmissionPass', encodeAdmissionPass(pass));
      setStatus({ phase: 'confirmed', message: '限時入場票證已產生，有效時間五分鐘。', hash: '' });
      return pass;
    } catch (reason) {
      setError(`票證產生失敗：${friendlyError(reason)}`);
      setStatus(EMPTY_STATUS);
      throw reason;
    } finally {
      setPendingAction('');
    }
  }, [account, contract, pendingAction, tickets]);

  const redeemAdmissionPass = useCallback(input => {
    const pass = parseAdmissionPass(input);
    if (pass.contract.toLowerCase() !== platformConfig.address.toLowerCase()) throw new Error('票證不屬於目前 Demo 合約');
    if (pass.chainId.toLowerCase() !== platformConfig.chainId.toLowerCase()) throw new Error('票證不屬於目前 Demo 網路');
    return runTransaction(`redeem-${pass.nonce}`, '請在錢包確認鏈上核銷交易…', () => contract.redeemTicket(
      pass.holder, pass.tokenId, pass.nonce, pass.deadline, pass.signature
    ));
  }, [contract, runTransaction]);

  const ownedTickets = useMemo(() => tickets.filter(ticket => BigInt(ticket.balance) > 0n), [tickets]);
  const role = useMemo(() => roleForAccount(account, isOwner), [account, isOwner]);

  return {
    account, isOwner, isGateStaff, role, tickets, ownedTickets, listings, loading, pendingAction, error, status,
    connect, refresh: () => loadData(contract, account), mint, list, buy, cancel, createAdmissionPass, redeemAdmissionPass
  };
}
