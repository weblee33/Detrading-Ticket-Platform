# 手機 HTTPS／Sepolia Demo 指南

這個流程適合口試、成果展或跨裝置展示：合約部署在 Sepolia，React 前端部署到 Vercel 的 HTTPS 網址，電腦顯示持票 QR Code，手機作為驗票機。所有鏈上操作都使用測試 ETH。

## 建議架構

| 裝置／錢包 | 角色 | Demo 操作 |
| --- | --- | --- |
| 部署電腦的測試錢包 | 主辦方 | 部署合約、鑄票、授權驗票員 |
| Alice 測試錢包 | 賣家 | 上架 VIP 票 |
| Bob 測試錢包 | 買家／持票人 | 購票、簽署五分鐘 QR Code |
| 手機 MetaMask | Gate Staff | 掃描、核銷、展示拒絕重放 |

四個角色應使用四個獨立的拋棄式測試錢包。主辦方、Alice、Bob 與 Gate Staff 都需要少量 Sepolia ETH 支付各自交易的 gas。

## 1. 準備部署環境

```bash
npm ci
cp .env.sepolia.example .env
```

編輯 `.env`：

- `SEPOLIA_RPC_URL`：HTTPS Sepolia RPC。
- `DEPLOYER_PRIVATE_KEY`：只持有測試資產的主辦方錢包私鑰。
- `DEMO_SELLER_ADDRESS`：Alice 地址。
- `DEMO_BUYER_ADDRESS`：Bob 地址。
- `DEMO_GATE_STAFF_ADDRESS`：手機驗票員地址。
- 確認資料無誤後，將 `ALLOW_TESTNET_DEPLOY` 改為 `true`。

先執行離線格式檢查。檢查器不會輸出私鑰：

```bash
npm run validate:sepolia-env
```

> `.env` 已被 Git 忽略。不要把私鑰放進 `REACT_APP_*`、Vercel、GitHub、截圖或操作文件。瀏覽器端的 `REACT_APP_*` 全部都是公開資料。

## 2. 部署與建立 Demo 票券

```bash
npm run deploy:sepolia
npm run seed:sepolia
```

部署結果會寫到本機 `src/deployments/sepolia.json`，此檔已被 Git 忽略。終端機會顯示合約地址與前端所需變數。

種子腳本只會：

1. 授權 Gate Staff。
2. 鑄造三張 VIP 票給 Alice。
3. 鑄造五張一般票給 Bob。

它不會要求 Alice 的私鑰，也不會代替 Alice 建立掛單。若合約已經有票種，腳本會拒絕重複執行。

## 3. 部署 HTTPS 前端

在 Vercel 匯入此 GitHub repository，建置分支選擇包含本階段變更的分支，Framework 使用 Create React App。`vercel.json` 已設定 `npm run build`、`build` 輸出目錄與相機權限安全標頭。

只在 Vercel 設定以下公開環境變數：

```text
REACT_APP_CHAIN_ID=0xaa36a7
REACT_APP_CHAIN_NAME=Sepolia
REACT_APP_RPC_URL=<可供錢包新增網路的 HTTPS Sepolia RPC>
REACT_APP_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io
REACT_APP_CONTRACT_ADDRESS=<剛部署的合約地址>
REACT_APP_DEMO_SELLER_ADDRESS=<Alice 地址>
REACT_APP_DEMO_BUYER_ADDRESS=<Bob 地址>
REACT_APP_DEMO_GATE_STAFF_ADDRESS=<Gate Staff 地址>
```

設定後重新部署。若 RPC URL 內含服務商 project key，應在服務商後台設定網域、額度與速率限制，因為前端環境變數會進入公開 JavaScript bundle。

## 4. 上台前建立市場掛單

1. 用 Alice 在 HTTPS 網站連接 MetaMask。
2. 到「我的票券」選擇 VIP。
3. 第一次上架會先要求市場託管授權。
4. 上架一張 VIP，建議價格使用容易辨識的小額測試 ETH。
5. 保留這筆掛單，作為正式 Demo 的起始狀態。

## 5. 正式展示流程

1. **Bob 購票**：在電腦上購買 Alice 的 VIP 票，點交易提示中的 Etherscan 連結證明交易已上鏈。
2. **確認持有**：切到「我的票券」，顯示 Bob 的 VIP 餘額。
3. **產生票證**：到「入場票證」簽署 QR Code。這是訊息簽章，不是鏈上交易，不需 gas。
4. **手機驗票**：在手機 MetaMask 內建瀏覽器開啟同一 HTTPS 網址，以 Gate Staff 連線並啟動相機。
5. **鏈上核銷**：掃描電腦 QR，核對摘要後送出核銷交易。
6. **拒絕重放**：再次掃描同一張 QR，展示智慧合約拒絕第二次使用。

QR Code 只有五分鐘有效。產生後應立即進行掃描；電腦與手機都應開啟自動校時。

## 6. 現場備援

- 相機權限失敗：在驗票頁選擇「從圖片讀取」。
- 只有一支手機：Bob 產生 QR 後截圖，切換 Gate Staff，再上傳截圖。
- RPC 暫時不穩：準備第二個 HTTPS Sepolia RPC，更新 Vercel 環境變數後重新部署。
- Sepolia 擁塞：保留一段預先錄製的完整流程，同時仍展示現場的 QR 格式驗證。
- QR 過期：回到 Bob 頁面重新簽署，不要重複使用舊票證。

## 安全界線

- 這仍是未經獨立審計的 Demo，不可部署主網或使用真實資金。
- 所有 Demo 錢包都只應持有少量測試 ETH。
- Vercel 只放公開的 `REACT_APP_*`，永遠不要放部署私鑰。
- 相機影像只在裝置內辨識；真正的簽章、餘額、驗票權限與重放狀態由合約檢查。
- Sepolia 上的地址、交易、票券資料與活動資料都是公開且長期可查的。
