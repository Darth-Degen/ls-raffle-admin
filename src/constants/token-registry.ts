export const wrappedSOL = 'So11111111111111111111111111111111111111112';

const tokenRegistry = {
  "sol": {
    chainId: 101,
    address: wrappedSOL,
    symbol: 'SOL',
    name: 'SOL',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    tags: [],
    extensions: {
      website: 'https://solana.com/',
      serumV3Usdc: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
      serumV3Usdt: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
      coingeckoId: 'solana',
      imageURI: '/resources/solana-logo.gif',
    },
  },
  'flth': {
    chainId: 101,
    address: 'FLTHudk5B5zag7JmGXqrYrFfey6otevLQA6jm1UHHLEE',
    symbol: 'FLTH',
    name: 'FLTH',
    decimals: 9,
    logoURI: 'https://www.arweave.net/6cZ-d9BnAsCqxkpzazYmKjLpUN2kE-jYnU3WDV4_lo0?ext=png',
    tags: []
  },
  'dust': {
    chainId: 101,
    address: 'FLTHudk5B5zag7JmGXqrYrFfey6otevLQA6jm1UHHLEE',
    symbol: 'DUST',
    name: 'DUST',
    decimals: 9,
    logoURI: 'https://www.arweave.net/6cZ-d9BnAsCqxkpzazYmKjLpUN2kE-jYnU3WDV4_lo0?ext=png',
    tags: []
  }
};

export const tokenInfoMap = new Map(Object.entries(tokenRegistry));

export const UNKNOWN_TOKEN_INFO = {
  chainId: 101,
  symbol: '???',
  name: 'Unkown token',
  decimals: 0,
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9nusLQeFKiocswDt6NQsiErm1M43H2b8x6v5onhivqKv/logo.png',
  tags: [],
  extensions: {},
};
