import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// 請填入你的合約地址和 ABI
const contractAddress = '0x0a52e1F23FbD9a08a73eE8b6Ea3dd7cDE7db2C0E';
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
const ganacheChainId = '0x539'; // 1337
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

  useEffect(() => {
    connectWallet();
    // eslint-disable-next-line
  }, []);

  const connectWallet = async () => {
    setAccount('');
    setContract(null);
    setIsOwner(false);
    setTicketList([]);
    setListings([]);
    setErrorMsg('');
    if (!window.ethereum) {
      alert('請安裝MetaMask!');
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
          alert('請手動切換到 Ganache 本地鏈 (chainId 1337)');
          return;
        }
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);

      const ownerAddress = await contractInstance.owner();
      setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase());
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('連接錢包失敗: ' + err.message);
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
            tickets.push({ id, ...info, uri, balance: balance.toString() });
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
            Number(listing.amount) > 0
          ) {
            result.push({
              id,
              seller: listing.seller,
              tokenId: Number(listing.tokenId),
              amount: Number(listing.amount),
              pricePerItem: Number(listing.pricePerItem)
            });
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
    if (!contract) return;
    const { eventName, eventDate, ticketType, metadataURI, amount, to } = form;
    try {
      await contract.createTicketTypeAndMint(eventName, eventDate, ticketType, metadataURI, amount, to);
      alert('鑄造成功！');
      fetchTickets();
    } catch (err) {
      alert('鑄造失敗: ' + err.message);
    }
  };

  const handleListing = async (tokenId, amount, pricePerItem) => {
    if (!contract) return;
    try {
      await contract.setApprovalForAll(contractAddress, true);
      await contract.createListing(tokenId, amount, pricePerItem);
      alert('掛單成功！');
      fetchListings();
    } catch (err) {
      alert('掛單失敗: ' + err.message);
    }
  };

  const handleBuy = async (listingId, buyAmount, pricePerItem) => {
    if (!contract) return;
    try {
      await contract.buy(listingId, buyAmount, { value: ethers.parseUnits((buyAmount * pricePerItem).toString(), 'wei') });
      alert('購買成功！');
      fetchTickets();
      fetchListings();
    } catch (err) {
      alert('購買失敗: ' + err.message);
    }
  };

  const handleCancel = async (listingId) => {
    if (!contract) return;
    try {
      await contract.cancelListing(listingId);
      alert('取消掛單成功！');
      fetchListings();
    } catch (err) {
      alert('取消失敗: ' + err.message);
    }
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
      <button style={buttonStyle} onClick={connectWallet}>重新選擇帳號登入</button>
      <div style={{ fontSize: 15, margin: '8px 0 16px 0', color: theme.primary }}>
        目前帳戶：{account}
      </div>
      {errorMsg && <div style={{ color: theme.error, textAlign: 'center', margin: 12 }}>{errorMsg}</div>}
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
          <button style={buttonAccent} onClick={handleMint}>鑄造 NFT 票券</button>
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
              <input type="number" min="1" max={ticket.balance} placeholder="掛單數量" id={`amount-${ticket.id}`} style={inputStyle} />
              <input type="number" min="1" placeholder="單價（wei）" id={`price-${ticket.id}`} style={inputStyle} />
              <button style={buttonStyle} onClick={() => {
                const amount = parseInt(document.getElementById(`amount-${ticket.id}`).value);
                const price = parseInt(document.getElementById(`price-${ticket.id}`).value);
                handleListing(ticket.id, amount, price);
              }}>掛單出售</button>
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
              <input type="number" min="1" max={listing.amount} placeholder="購買數量" id={`buyamount-${listing.id}`} style={inputStyle} />
              <button style={buttonAccent} onClick={() => {
                const buyAmount = parseInt(document.getElementById(`buyamount-${listing.id}`).value);
                handleBuy(listing.id, buyAmount, listing.pricePerItem);
              }}>購買</button>
              {listing.seller && account &&
                listing.seller.toLowerCase() === account.toLowerCase() && (
                  <button style={buttonStyle} onClick={() => handleCancel(listing.id)}>取消掛單</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
