import { encodeAdmissionPass, parseAdmissionPass } from './admission';

const pass = {
  contract: '0x0000000000000000000000000000000000000001',
  chainId: '0x7a69',
  holder: '0x0000000000000000000000000000000000000002',
  tokenId: '1',
  nonce: `0x${'11'.repeat(32)}`,
  deadline: '1893456000',
  signature: `0x${'22'.repeat(65)}`
};

test('round-trips a compact admission pass', () => {
  expect(parseAdmissionPass(encodeAdmissionPass(pass))).toMatchObject(pass);
});

test('rejects malformed and unsupported passes', () => {
  expect(() => parseAdmissionPass('{}')).toThrow('版本');
  expect(() => parseAdmissionPass(encodeAdmissionPass({ ...pass, nonce: '0x01' }))).toThrow('nonce');
});
