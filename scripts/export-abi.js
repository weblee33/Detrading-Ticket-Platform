const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'TicketMarketplaceV2.sol', 'TicketMarketplaceV2.json');
const outputPath = path.join(__dirname, '..', 'src', 'contracts', 'TicketMarketplaceV2.abi.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(artifact.abi, null, 2)}\n`);
console.log(`Exported ABI to ${outputPath}`);
