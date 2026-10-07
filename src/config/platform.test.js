import { roleForAccount } from './platform';

test('identifies deterministic demo roles', () => {
  expect(roleForAccount('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', false).name).toMatch(/Alice/);
  expect(roleForAccount('0xf39Fd6e51aad88f6F4ce6aB8827279cffFb92266', true).name).toBe('主辦方');
});

test('uses a safe generic role for unknown wallets', () => {
  expect(roleForAccount('0x0000000000000000000000000000000000000001', false).name).toBe('一般持票人');
});

test('identifies authorized gate staff even on a public deployment', () => {
  expect(roleForAccount('0x0000000000000000000000000000000000000001', false, true).name).toBe('驗票員');
});
