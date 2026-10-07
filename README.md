# Detrading Ticket Platform

一套可完整展示「發票、持有、二級市場交易、產生入場 QR Code、現場驗票」流程的去中心化票券 Demo。平台以 Solidity ERC-1155 智慧合約保存票券與交易狀態，React 前端透過 MetaMask 完成簽署與鏈上操作。

> [!IMPORTANT]
> 本專案使用本機 Hardhat 測試鏈與公開的開發帳號，僅供展示與開發。尚未經獨立資安審計，不可直接部署至主網或承載真實資金。

手機正式展示可部署至 Sepolia 測試網與 Vercel HTTPS，完整步驟見 [`MOBILE_DEMO.md`](MOBILE_DEMO.md)。此流程只使用拋棄式測試錢包與測試 ETH。

## Demo 能展示什麼

| 身分 | 可操作功能 |
| --- | --- |
| 主辦方 | 建立票種、鑄造 ERC-1155 票券；合約層可管理驗票人員 |
| 持票人 | 查看持有票券、上架轉售、取消上架、簽署五分鐘入場票證 |
| 買家 | 瀏覽市場、以精確價格購票、確認鏈上持有量 |
| 驗票人員 | 使用相機或圖片掃描 QR Code、檢查摘要、鏈上核銷一張票 |

核心功能包括：

- ERC-1155 多票種與鏈上活動資料。
- 票券先託管至合約的二級市場，避免賣家上架後重複使用。
- 價格與付款金額由合約驗證，支援購買與取消上架。
- 持票人簽署的短效入場票證，綁定合約、鏈 ID、錢包、票種、nonce 與期限。
- 授權驗票人員鏈上核銷；成功後燃燒一張票，且同一票證不可重放。
- 行動裝置後鏡頭掃描、QR 圖片上傳，以及單機 Demo 用的手動備援。
- 錢包、網路切換與交易送出/確認/失敗狀態提示。

## 快速開始

### 環境需求

- Node.js 18 或更新版本
- npm
- MetaMask 瀏覽器擴充功能
- 可使用相機的瀏覽器（相機掃描需 `localhost` 或 HTTPS 安全環境）

### 一個指令啟動完整 Demo

```bash
npm ci
npm run demo
```

`npm run demo` 會依序啟動 Hardhat 節點、部署 `TicketMarketplaceV2`、建立範例票種與轉售單，最後在 [http://localhost:3000](http://localhost:3000) 啟動前端。

在 MetaMask 新增本機網路：

| 欄位 | 值 |
| --- | --- |
| 網路名稱 | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| 貨幣符號 | ETH |

啟動時 Hardhat 會印出測試帳號與私鑰。只可匯入這些公開的開發帳號；請勿轉入真實資產，也不要將真實錢包助記詞匯入 Demo 環境。

### Demo 帳號

| Hardhat 帳號 | 角色 | 建議展示 |
| --- | --- | --- |
| Account #0 | 主辦方 | 建立新票種 |
| Account #1 | Alice／賣家 | 查看持票、建立或取消上架 |
| Account #2 | Bob／買家 | 購票、建立入場 QR Code |
| Account #3 | Gate Staff | 掃描並核銷 Bob 的票證 |

## 建議的五分鐘展示腳本

1. 在「探索市場」介紹 Alice 已上架的 VIP 票券與價格。
2. 切換 Bob，購買一張 VIP 票，等待交易確認提示。
3. 到「我的票券」確認 Bob 的鏈上餘額。
4. 到「入場票證」，選擇 VIP 票並由 Bob 簽署五分鐘 QR Code。
5. 在 Gate Staff 的「驗票工作台」以相機掃描另一個畫面上的 QR Code，或上傳 QR 截圖。
6. 核對活動、持票地址與到期時間後，送出鏈上核銷。
7. 再次掃描同一張 QR Code，展示合約拒絕重放攻擊。
8. 若只有一台電腦，可展開「手動輸入」並載入最近產生的 Demo 票證。

更詳細的解說重點請見 [`DEMO_GUIDE.md`](DEMO_GUIDE.md)。

## 入場票證的安全模型

QR Code 本身不是入場權限，只是攜帶持票人簽章的資料。`redeemTicket` 會在鏈上確認：

1. 呼叫者是主辦方授權的驗票人員。
2. 票證尚未過期，且有效期不超過十分鐘。
3. 宣告的持票人仍持有該票種。
4. nonce 對應的票證從未使用。
5. 復原出的簽署者確實是持票人。

掃描只在瀏覽器本機執行，不會上傳相機畫面。相機必須由使用者主動啟動，掃描完成或離開元件時會停止。完整威脅模型請見 [`ADMISSION_SECURITY.md`](ADMISSION_SECURITY.md)。

## 測試與驗證

```bash
# Solidity 合約測試
npm run test:contract

# React 單元與元件測試
CI=true npm test -- --runInBand

# 前端正式版建置
npm run build

# 隔離節點上的部署、交易與防重放端到端驗證
npm run verify:demo
```

`verify:demo` 會部署合約、建立與購買票券、產生持票人簽章、由驗票帳號核銷、確認票券被燃燒，並驗證同一票證無法再次使用。

## 分開啟動服務

需要逐步除錯時，可使用三個終端機：

```bash
# Terminal 1：本機鏈
npm run chain

# Terminal 2：部署與種子資料
npm run deploy:local
npm run seed:local

# Terminal 3：前端
npm start
```

部署結果會寫入 `src/deployments/local.json`。也可複製 `.env.example` 為 `.env.local`，以 `REACT_APP_CHAIN_ID` 與 `REACT_APP_CONTRACT_ADDRESS` 覆寫；若目標地址沒有合約 bytecode，前端會拒絕繼續。

## 手機 HTTPS／Sepolia Demo

公開測試網流程提供：

- 部署前的 RPC、私鑰格式、角色錢包與明確確認旗標檢查。
- Sepolia 合約部署，以及不接觸 Alice、Bob、Gate 私鑰的票券初始化。
- Vercel HTTPS 建置與相機權限標頭。
- 公開測試網角色標籤與 Etherscan 交易連結。

```bash
cp .env.sepolia.example .env
npm run validate:sepolia-env
npm run deploy:sepolia
npm run seed:sepolia
```

不要將 `.env`、部署私鑰或任何真實錢包憑證加入 Git。逐步操作與現場備援請見 [`MOBILE_DEMO.md`](MOBILE_DEMO.md)。

## 專案結構

```text
contracts/TicketMarketplaceV2.sol   ERC-1155、交易市場與入場核銷
scripts/                            部署、種子資料、ABI 匯出、端到端驗證
test/                               Hardhat 合約測試
src/components/                     市場、持票、主辦方、票證與驗票 UI
src/hooks/useTicketPlatform.js      錢包與合約互動流程
src/utils/admission.js              QR 票證編碼與格式驗證
```

`TicketMarketplaceV2.sol` 是為可重現 Demo 新增的 v2 合約，不宣稱是舊版 ABI 所對應原始合約的復原版本。設計細節見 [`CONTRACT_V2.md`](CONTRACT_V2.md)。

## 已知限制與上線前工作

- 活動取消與退款流程尚未實作。
- 二級市場尚未加入售價上限、轉售期限與版稅政策。
- 目前核銷會燃燒票券；正式產品應決定是否保留不可轉讓的紀念憑證。
- 驗票人員仍使用一般瀏覽器錢包；大型活動應考慮受管金鑰或帳戶抽象化。
- 圖片與 metadata URI 可使用 IPFS，但 Demo 沒有提供 pinning 與內容審核服務。
- 部署公開網路前需要完整測試、監控、金鑰管理與獨立智慧合約審計。

後續規劃見 [`NEXT_STEPS.md`](NEXT_STEPS.md)，目前驗證結果見 [`TEST_RESULTS.md`](TEST_RESULTS.md)。

## 技術棧

- Solidity 0.8.26、OpenZeppelin Contracts、Hardhat
- ERC-1155
- React 19、ethers.js 6
- `qrcode`（產生票證）與 `html5-qrcode`（相機／圖片辨識）
- MetaMask、本機 Hardhat JSON-RPC
- Sepolia 測試網、Vercel HTTPS（手機 Demo 選用）

## License

MIT
