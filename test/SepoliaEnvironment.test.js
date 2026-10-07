const { expect } = require('chai');
const { validateSepoliaEnv } = require('../scripts/validate-sepolia-env');

const validEnv = {
  SEPOLIA_RPC_URL: 'https://example.invalid/sepolia',
  DEPLOYER_PRIVATE_KEY: `0x${'11'.repeat(32)}`,
  ALLOW_TESTNET_DEPLOY: 'true',
  DEMO_SELLER_ADDRESS: '0x0000000000000000000000000000000000000001',
  DEMO_BUYER_ADDRESS: '0x0000000000000000000000000000000000000002',
  DEMO_GATE_STAFF_ADDRESS: '0x0000000000000000000000000000000000000003'
};

describe('Sepolia environment validation', function () {
  it('accepts separate, valid testnet roles without exposing secrets', function () {
    expect(validateSepoliaEnv(validEnv)).to.deep.equal([]);
  });

  it('rejects unsafe or incomplete deployment settings', function () {
    const errors = validateSepoliaEnv({ ...validEnv, SEPOLIA_RPC_URL: 'http://localhost:8545', ALLOW_TESTNET_DEPLOY: 'false' });
    expect(errors.join(' ')).to.include('HTTPS');
    expect(errors.join(' ')).to.include('ALLOW_TESTNET_DEPLOY');
  });

  it('requires separate role wallets', function () {
    const errors = validateSepoliaEnv({ ...validEnv, DEMO_BUYER_ADDRESS: validEnv.DEMO_SELLER_ADDRESS });
    expect(errors.join(' ')).to.include('不同錢包');
  });
});
