# Detrading-Ticket-Platform 🎟️

基於 ERC-1155 的 NFT 演唱會票券與二等交易平台，使用者可以鉸造、上架與購買演唱會門票 NFT，並解決傳統票務在驗證、轉售與資訊透明上的痕痕問題。

## 🔧 專案特色

* 支援多種票券類型（一般票、VIP等）與事件資訊儲存
* 所有票券為 ERC-1155 規範，支援一對多、多對多販售
* 內建 NFT 掛單與購買交易邏輯
* 擁有者專屬鉸造權限，避免假票濫發
* 可自訂 `metadataURI`，整合至 IPFS 或其他去中心化儲存
* 支援可供查詢的鏈上事件：票券建立、掛單、交易與取消

---

## 📦 合約部署

本合約使用 Solidity `^0.8.20`，並依賴以下 OpenZeppelin 模組：

* `ERC1155`
* `ERC1155Supply`
* `Ownable`
* `ReentrancyGuard`

### 安裝依賴

```bash
npm install @openzeppelin/contracts
```

---

## 📘 功能說明

### 🎛 `createTicketTypeAndMint`

建立票券類型並鉸造給指定地址。

```solidity
function createTicketTypeAndMint(
    string memory eventName,
    string memory eventDate,
    string memory ticketType,
    string memory metadataURI,
    uint256 amount,
    address to
) external onlyOwner
```

* 僅限主辦方（合約擁有者）可呼叫
* `metadataURI` 支援 IPFS 格式或其他 JSON URI

📌 事件：

```solidity
event TicketCreated(uint256 tokenId, string eventName, string eventDate, string ticketType, string metadataURI);
```

---

### 📄 `uri`

返回指定票券的 metadata URI。

```solidity
function uri(uint256 tokenId) public view override returns (string memory)
```

---

### 📤 `createListing`

上架票券至二等市場（須先授權合約地址）。

```solidity
function createListing(uint256 tokenId, uint256 amount, uint256 pricePerItem) external
```

* 要求賣家已授權 `isApprovedForAll`
* 僅能上架自己持有的 NFT 數量

📌 事件：

```solidity
event Listed(uint256 listingId, address seller, uint256 tokenId, uint256 amount, uint256 pricePerItem);
```

---

### 🏍️ `buy`

購買指定掛單的 NFT。

```solidity
function buy(uint256 listingId, uint256 buyAmount) external payable
```

* 自動將 NFT 傳送給購買者、ETH 傳送給賣家
* 若該掛單數量清空會自動刪除

📌 事件：

```solidity
event Sale(uint256 listingId, address buyer, uint256 amount);
```

---

### ❌ `cancelListing`

取消掛單（僅限掛單者本人）。

```solidity
function cancelListing(uint256 listingId) external
```

📌 事件：

```solidity
event Cancelled(uint256 listingId);
```

---

## 🧐 資料組織設計

### `TicketInfo`

票券的基本資料組織：

```solidity
struct TicketInfo {
    string eventName;
    string eventDate;
    string ticketType;
    string metadataURI;
}
```

### `Listing`

NFT 掛單資料：

```solidity
struct Listing {
    address seller;
    uint256 tokenId;
    uint256 amount;
    uint256 pricePerItem;
}
```

---

## 📜 合約事件總覽

| 事件名稱            | 描述      |
| --------------- | ------- |
| `TicketCreated` | 票券建立與鉸造 |
| `Listed`        | 成功掛單    |
| `Sale`          | 成功購買    |
| `Cancelled`     | 掛單被取消   |

---

## 🚀 未來擴充建議

* 使用 EIP-2981 加入 NFT 轉售權利金功能
* 整合 SBT（不可轉賣）作為身份認證票
* 加入 KYC 驗證模組與身份錢包綁定
* 加入票券過期自動銷毀、活動開場觸發等時間條件

---

## 🧑‍💻 開發與測試

建議使用 Hardhat 進行部署與測試：

```bash
npx hardhat compile
npx hardhat test
```

---

## 🖼️ Metadata JSON 範例

```json
{
  "name": "VIP Ticket - Taylor Swift 2025",
  "description": "Access to front-row seat & backstage",
  "image": "https://ipfs.io/ipfs/Qm.../vip.png",
  "attributes": [
    { "trait_type": "Type", "value": "VIP" },
    { "trait_type": "Date", "value": "2025-08-15" },
    { "trait_type": "Event", "value": "Taylor Swift World Tour" }
  ]
}
```

---

## 📃 授權條款

本專案基於 [MIT License](LICENSE)。

---
