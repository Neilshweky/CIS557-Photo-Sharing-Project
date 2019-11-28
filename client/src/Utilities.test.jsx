import dateDiff from './Utilities';

describe('dateDiff tests', () => {
  test('dateDiff today', () => {
    expect(dateDiff(new Date())).toBe(0);
  });

  test('dateDiff yesterday', () => {
    expect(dateDiff(new Date().getTime() - 24 * 60 * 60 * 1000)).toBe(1);
  });
});
