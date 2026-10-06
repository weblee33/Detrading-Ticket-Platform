/* global BigInt */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  calculateTotalWei,
  friendlyError,
  mapListing,
  mapTicketInfo,
  requirePositiveInteger,
  validateMintForm,
  waitForTransaction
} from './contractUtils';

// 請填入你的合約地址和 ABI
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x0a52e1F23FbD9a08a73eE8b6Ea3dd7cDE7db2C0E';
const contractABI = [
			{
				"inputs": [],
				"stateMutability": "nonpayable",
				"type": "constructor"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "balance",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "needed",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					}
				],
				"name": "ERC1155InsufficientBalance",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "approver",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidApprover",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "idsLength",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "valuesLength",
						"type": "uint256"
					}
				],
				"name": "ERC1155InvalidArrayLength",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidOperator",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "receiver",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidReceiver",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					}
				],
				"name": "ERC1155InvalidSender",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					}
				],
				"name": "ERC1155MissingApprovalForAll",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					}
				],
				"name": "OwnableInvalidOwner",
				"type": "error"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "account",
						"type": "address"
					}
				],
				"name": "OwnableUnauthorizedAccount",
				"type": "error"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "account",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"name": "ApprovalForAll",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "listingId",
						"type": "uint256"
					}
				],
				"name": "Cancelled",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "listingId",
						"type": "uint256"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "seller",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "pricePerItem",
						"type": "uint256"
					}
				],
				"name": "Listed",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "previousOwner",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "newOwner",
						"type": "address"
					}
				],
				"name": "OwnershipTransferred",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "listingId",
						"type": "uint256"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "buyer",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "Sale",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "eventName",
						"type": "string"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "eventDate",
						"type": "string"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "ticketType",
						"type": "string"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "metadataURI",
						"type": "string"
					}
				],
				"name": "TicketCreated",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256[]",
						"name": "ids",
						"type": "uint256[]"
					},
					{
						"indexed": false,
						"internalType": "uint256[]",
						"name": "values",
						"type": "uint256[]"
					}
				],
				"name": "TransferBatch",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"indexed": true,
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "value",
						"type": "uint256"
					}
				],
				"name": "TransferSingle",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": false,
						"internalType": "string",
						"name": "value",
						"type": "string"
					},
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "URI",
				"type": "event"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "account",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "balanceOf",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address[]",
						"name": "accounts",
						"type": "address[]"
					},
					{
						"internalType": "uint256[]",
						"name": "ids",
						"type": "uint256[]"
					}
				],
				"name": "balanceOfBatch",
				"outputs": [
					{
						"internalType": "uint256[]",
						"name": "",
						"type": "uint256[]"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "listingId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "buyAmount",
						"type": "uint256"
					}
				],
				"name": "buy",
				"outputs": [],
				"stateMutability": "payable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "listingId",
						"type": "uint256"
					}
				],
				"name": "cancelListing",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "pricePerItem",
						"type": "uint256"
					}
				],
				"name": "createListing",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "eventName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "eventDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ticketType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "metadataURI",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "to",
						"type": "address"
					}
				],
				"name": "createTicketTypeAndMint",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "exists",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "account",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					}
				],
				"name": "isApprovedForAll",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"name": "listings",
				"outputs": [
					{
						"internalType": "address",
						"name": "seller",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "pricePerItem",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "nextListingId",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "nextTokenId",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "owner",
				"outputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "renounceOwnership",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"internalType": "uint256[]",
						"name": "ids",
						"type": "uint256[]"
					},
					{
						"internalType": "uint256[]",
						"name": "values",
						"type": "uint256[]"
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes"
					}
				],
				"name": "safeBatchTransferFrom",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "from",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "value",
						"type": "uint256"
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes"
					}
				],
				"name": "safeTransferFrom",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "operator",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"name": "setApprovalForAll",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "bytes4",
						"name": "interfaceId",
						"type": "bytes4"
					}
				],
				"name": "supportsInterface",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"name": "ticketInfos",
				"outputs": [
					{
						"internalType": "string",
						"name": "eventName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "eventDate",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ticketType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "metadataURI",
						"type": "string"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "totalSupply",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					}
				],
				"name": "totalSupply",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "newOwner",
						"type": "address"
					}
				],
				"name": "transferOwnership",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					}
				],
				"name": "uri",
				"outputs": [
					{
						"internalType": "string",
						"name": "",
						"type": "string"
					}
				],
				"stateMutability": "view",
				"type": "function"
			}
		];
const ganacheChainId = process.env.REACT_APP_CHAIN_ID || '0x539'; // 1337
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// 主題色
const theme = {
  primary: '#3f51b5',
  secondary: '#f5f5f5',
  accent: '#ff9800',
  border: '#e0e0e0',
  error: '#e53935'
};

function NFTImage({ metadataURI }) {
  const [imgUrl, setImgUrl] = useState('');
  useEffect(() => {
    async function fetchMeta() {
      if (!metadataURI) return setImgUrl('');
      let url = metadataURI;
      if (url.startsWith('ipfs://')) {
        url = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      try {
        const res = await fetch(url);
        const meta = await res.json();
        let imageUrl = meta.image;
        if (imageUrl && imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        setImgUrl(imageUrl);
      } catch (err) {
        setImgUrl('');
      }
    }
    fetchMeta();
  }, [metadataURI]);
  return imgUrl ? (
    <img
      src={imgUrl}
      alt="NFT"
      style={{
        width: 120,
        height: 120,
        objectFit: 'cover',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(63,81,181,0.08)',
        margin: 8,
        background: theme.secondary
      }}
    />
  ) : (
    <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.secondary, borderRadius: 16, margin: 8 }}>圖片載入中...</div>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ticketList, setTicketList] = useState([]);
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState({
    eventName: '',
    eventDate: '',
    ticketType: '',
    metadataURI: '',
    amount: 1,
    to: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [pendingAction, setPendingAction] = useState('');
  const [listingInputs, setListingInputs] = useState({});
  const [buyInputs, setBuyInputs] = useState({});

  useEffect(() => {
    if (!window.ethereum) return;
    const reset = () => {
      setAccount('');
      setContract(null);
      setIsOwner(false);
      setTicketList([]);
      setListings([]);
      setStatusMsg('錢包帳號或網路已變更，請重新連線');
    };
    window.ethereum.on?.('accountsChanged', reset);
    window.ethereum.on?.('chainChanged', reset);
    window.ethereum.on?.('disconnect', reset);
    return () => {
      window.ethereum.removeListener?.('accountsChanged', reset);
      window.ethereum.removeListener?.('chainChanged', reset);
      window.ethereum.removeListener?.('disconnect', reset);
    };
  }, []);

  const connectWallet = async () => {
    setAccount('');
    setContract(null);
    setIsOwner(false);
    setTicketList([]);
    setListings([]);
    setErrorMsg('');
    setStatusMsg('');
    if (!window.ethereum) {
      setErrorMsg('找不到 MetaMask，請先安裝錢包擴充功能');
      return;
    }
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== ganacheChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ganacheChainId }],
          });
        } catch {
          setErrorMsg(`請手動切換到設定的網路 (${ganacheChainId})`);
          return;
        }
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      if (!ethers.isAddress(contractAddress)) throw new Error('合約地址設定無效');
      const bytecode = await provider.getCode(contractAddress);
      if (bytecode === '0x') throw new Error('設定的合約地址沒有已部署的 bytecode');
      setAccount(userAddress);
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);

      const ownerAddress = await contractInstance.owner();
      setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase());
      setErrorMsg('');
      setStatusMsg('錢包已連線');
    } catch (err) {
      setErrorMsg('連接錢包失敗: ' + friendlyError(err));
      setAccount('');
      setContract(null);
      setIsOwner(false);
    }
  };

  const fetchTickets = async () => {
    if (!contract || !account) return;
    try {
      const nextTokenId = Number(await contract.nextTokenId());
      let tickets = [];
      for (let id = 1; id < nextTokenId; id++) {
        try {
          const info = await contract.ticketInfos(id);
          if (info && info.eventName) {
            const uri = await contract.uri(id);
            const balance = await contract.balanceOf(account, id);
            if (balance > 0n) tickets.push(mapTicketInfo(id, info, uri, balance));
          }
        } catch {}
      }
      setTicketList(tickets);
    } catch (err) {
      setErrorMsg('取得票券失敗: ' + err.message);
    }
  };

  const fetchListings = async () => {
    if (!contract) return;
    try {
      const nextListingId = Number(await contract.nextListingId());
      let result = [];
      for (let id = 1; id < nextListingId; id++) {
        try {
          const listing = await contract.listings(id);
          if (
            listing &&
            listing.seller &&
            listing.seller !== ZERO_ADDRESS &&
            BigInt(listing.amount) > 0n
          ) {
            result.push(mapListing(id, listing));
          }
        } catch {}
      }
      setListings(result);
    } catch (err) {
      setErrorMsg('取得掛單失敗: ' + err.message);
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchTickets();
      fetchListings();
    }
    // eslint-disable-next-line
  }, [contract, account]);

  const handleMint = async () => {
    if (!contract || pendingAction) return;
    const { eventName, eventDate, ticketType, metadataURI, amount, to } = form;
    try {
      validateMintForm(form);
      setPendingAction('mint'); setErrorMsg(''); setStatusMsg('等待錢包簽名…');
      const tx = await contract.createTicketTypeAndMint(eventName.trim(), eventDate.trim(), ticketType.trim(), metadataURI.trim(), requirePositiveInteger(amount), to.trim());
      setStatusMsg(`交易已送出：${tx.hash}`);
      await waitForTransaction(tx);
      setStatusMsg('鑄造交易已確認');
      await fetchTickets();
    } catch (err) {
      setErrorMsg('鑄造失敗: ' + friendlyError(err));
    } finally { setPendingAction(''); }
  };

  const handleListing = async (tokenId, amount, pricePerItem) => {
    if (!contract || pendingAction) return;
    try {
      const quantity = requirePositiveInteger(amount, '掛單數量');
      const price = requirePositiveInteger(pricePerItem, '單價');
      const owned = BigInt(ticketList.find(ticket => ticket.id === tokenId)?.balance || 0);
      if (quantity > owned) throw new Error('掛單數量超過持有餘額');
      setPendingAction(`list-${tokenId}`); setErrorMsg('');
      const approved = await contract.isApprovedForAll(account, contractAddress);
      if (!approved) {
        setStatusMsg('等待授權簽名…');
        const approvalTx = await contract.setApprovalForAll(contractAddress, true);
        setStatusMsg(`授權交易已送出：${approvalTx.hash}`);
        await waitForTransaction(approvalTx);
      }
      setStatusMsg('等待掛單簽名…');
      const tx = await contract.createListing(tokenId, quantity, price);
      setStatusMsg(`掛單交易已送出：${tx.hash}`);
      await waitForTransaction(tx);
      setStatusMsg('掛單交易已確認');
      await Promise.all([fetchTickets(), fetchListings()]);
    } catch (err) {
      setErrorMsg('掛單失敗: ' + friendlyError(err));
    } finally { setPendingAction(''); }
  };

  const handleBuy = async (listingId, buyAmount, pricePerItem) => {
    if (!contract || pendingAction) return;
    try {
      const listing = listings.find(item => item.id === listingId);
      const quantity = requirePositiveInteger(buyAmount, '購買數量');
      if (!listing || quantity > BigInt(listing.amount)) throw new Error('購買數量超過掛單餘額');
      const value = calculateTotalWei(quantity, pricePerItem);
      setPendingAction(`buy-${listingId}`); setErrorMsg(''); setStatusMsg('等待購買簽名…');
      const tx = await contract.buy(listingId, quantity, { value });
      setStatusMsg(`購買交易已送出：${tx.hash}`);
      await waitForTransaction(tx);
      setStatusMsg('購買交易已確認');
      await Promise.all([fetchTickets(), fetchListings()]);
    } catch (err) {
      setErrorMsg('購買失敗: ' + friendlyError(err));
    } finally { setPendingAction(''); }
  };

  const handleCancel = async (listingId) => {
    if (!contract || pendingAction) return;
    try {
      setPendingAction(`cancel-${listingId}`); setErrorMsg(''); setStatusMsg('等待取消簽名…');
      const tx = await contract.cancelListing(listingId);
      setStatusMsg(`取消交易已送出：${tx.hash}`);
      await waitForTransaction(tx);
      setStatusMsg('取消掛單交易已確認');
      await Promise.all([fetchTickets(), fetchListings()]);
    } catch (err) {
      setErrorMsg('取消失敗: ' + friendlyError(err));
    } finally { setPendingAction(''); }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 共用樣式
  const inputStyle = {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    padding: '8px 12px',
    margin: '4px 8px 4px 0',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.2s',
    background: theme.secondary
  };
  const buttonStyle = {
    background: theme.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    margin: '4px 8px 4px 0',
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(63,81,181,0.08)',
    transition: 'background 0.2s'
  };
  const buttonAccent = {
    ...buttonStyle,
    background: theme.accent
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: 32,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      background: '#fafbfc',
      minHeight: '100vh'
    }}>
      <h2 style={{ color: theme.primary, letterSpacing: 2, marginBottom: 16 }}>🎫 演唱會 NFT 票券交易平台</h2>
      <button style={buttonStyle} onClick={connectWallet} disabled={Boolean(pendingAction)}>連接／重新選擇帳號</button>
      <div style={{ fontSize: 15, margin: '8px 0 16px 0', color: theme.primary }}>
        目前帳戶：{account}
      </div>
      {errorMsg && <div style={{ color: theme.error, textAlign: 'center', margin: 12 }}>{errorMsg}</div>}
      {statusMsg && <div role="status" style={{ color: theme.primary, textAlign: 'center', margin: 12 }}>{statusMsg}</div>}
      <hr style={{ margin: '24px 0', border: `1px solid ${theme.border}` }} />

      {isOwner && (
        <div style={{
          border: `1.5px solid ${theme.primary}`,
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          boxShadow: '0 2px 12px rgba(63,81,181,0.04)'
        }}>
          <h3 style={{ color: theme.primary, marginBottom: 12 }}>主辦方鑄造 NFT 票券</h3>
          <input name="eventName" placeholder="活動名稱" value={form.eventName} onChange={handleFormChange} style={inputStyle} />
          <input name="eventDate" placeholder="活動日期" value={form.eventDate} onChange={handleFormChange} style={inputStyle} />
          <input name="ticketType" placeholder="票種" value={form.ticketType} onChange={handleFormChange} style={inputStyle} />
          <input name="metadataURI" placeholder="Metadata URI" value={form.metadataURI} onChange={handleFormChange} style={inputStyle} />
          <input name="amount" type="number" placeholder="數量" value={form.amount} onChange={handleFormChange} style={inputStyle} />
          <input name="to" placeholder="接收地址" value={form.to} onChange={handleFormChange} style={inputStyle} />
          <button style={buttonAccent} disabled={Boolean(pendingAction)} onClick={handleMint}>{pendingAction === 'mint' ? '處理中…' : '鑄造 NFT 票券'}</button>
        </div>
      )}

      <h3 style={{ color: theme.primary, margin: '16px 0 8px 0' }}>我的 NFT 票券</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {ticketList.map(ticket => (
          <div key={ticket.id} style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(63,81,181,0.06)',
            padding: 20,
            marginBottom: 20,
            minWidth: 260,
            maxWidth: 280,
            flex: '1 1 260px'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 18, color: theme.primary }}>
              {ticket.eventName}
            </div>
            <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              {ticket.ticketType} | {ticket.eventDate}
            </div>
            <NFTImage metadataURI={ticket.uri} />
            <div style={{ fontSize: 15, color: theme.accent, marginBottom: 8 }}>
              我的餘額：{ticket.balance}
            </div>
            <div>
              <input inputMode="numeric" placeholder="掛單數量" value={listingInputs[ticket.id]?.amount || ''} onChange={e => setListingInputs(current => ({ ...current, [ticket.id]: { ...current[ticket.id], amount: e.target.value } }))} style={inputStyle} />
              <input inputMode="numeric" placeholder="單價（wei）" value={listingInputs[ticket.id]?.price || ''} onChange={e => setListingInputs(current => ({ ...current, [ticket.id]: { ...current[ticket.id], price: e.target.value } }))} style={inputStyle} />
              <button style={buttonStyle} disabled={Boolean(pendingAction)} onClick={() => handleListing(ticket.id, listingInputs[ticket.id]?.amount, listingInputs[ticket.id]?.price)}>{pendingAction === `list-${ticket.id}` ? '處理中…' : '掛單出售'}</button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ color: theme.primary, margin: '24px 0 8px 0' }}>掛單市場</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {listings.map(listing => (
          <div key={listing.id} style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(63,81,181,0.06)',
            padding: 20,
            minWidth: 260,
            maxWidth: 280,
            flex: '1 1 260px'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 16, color: theme.primary }}>
              票券ID: {listing.tokenId}
            </div>
            <div style={{ fontSize: 14, color: '#555' }}>
              數量: {listing.amount}，單價: {listing.pricePerItem} wei
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
              賣家: {listing.seller}
            </div>
            <div>
              <input inputMode="numeric" placeholder="購買數量" value={buyInputs[listing.id] || ''} onChange={e => setBuyInputs(current => ({ ...current, [listing.id]: e.target.value }))} style={inputStyle} />
              <button style={buttonAccent} disabled={Boolean(pendingAction)} onClick={() => handleBuy(listing.id, buyInputs[listing.id], listing.pricePerItem)}>{pendingAction === `buy-${listing.id}` ? '處理中…' : '購買'}</button>
              {listing.seller && account &&
                listing.seller.toLowerCase() === account.toLowerCase() && (
                  <button style={buttonStyle} disabled={Boolean(pendingAction)} onClick={() => handleCancel(listing.id)}>{pendingAction === `cancel-${listing.id}` ? '處理中…' : '取消掛單'}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
