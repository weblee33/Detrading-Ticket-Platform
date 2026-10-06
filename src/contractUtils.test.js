import {
  calculateTotalWei,
  friendlyError,
  mapListing,
  mapTicketInfo,
  requirePositiveInteger,
  validateMintForm,
  waitForTransaction
} from './contractUtils';

test('preserves large wei values without Number precision loss', () => {
  expect(calculateTotalWei('3', '100000000000000001')).toBe(300000000000000003n);
});

test.each(['', '0', '-1', '1.5', 'abc'])("rejects invalid positive integer %p", value => {
  expect(() => requirePositiveInteger(value)).toThrow();
});

test('maps ethers-style named ticket fields explicitly', () => {
  const ticket = mapTicketInfo(4, {
    eventName: 'Demo Concert', eventDate: '2026-12-01', ticketType: 'VIP', metadataURI: 'ipfs://meta'
  }, 'ipfs://meta', 2n);
  expect(ticket).toMatchObject({ id: 4, eventName: 'Demo Concert', eventDate: '2026-12-01', ticketType: 'VIP', balance: '2' });
});

test('maps listing integers to lossless decimal strings', () => {
  expect(mapListing(1, { seller: '0xabc', tokenId: 9n, amount: 2n, pricePerItem: 100000000000000001n }))
    .toMatchObject({ tokenId: '9', amount: '2', pricePerItem: '100000000000000001' });
});

test('validates mint address and required data', () => {
  expect(() => validateMintForm({ eventName: 'A', eventDate: 'B', ticketType: 'C', metadataURI: 'ipfs://x', amount: '1', to: 'bad' })).toThrow('接收地址');
});

test('waits for transaction confirmation', async () => {
  const wait = jest.fn().mockResolvedValue({ status: 1 });
  await expect(waitForTransaction({ wait })).resolves.toEqual({ status: 1 });
  expect(wait).toHaveBeenCalledTimes(1);
});

test('formats rejected wallet actions', () => {
  expect(friendlyError({ code: 'ACTION_REJECTED' })).toBe('使用者已取消操作');
});
