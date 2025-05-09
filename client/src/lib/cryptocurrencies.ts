export interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  rank: number;
  isDefault?: boolean;
}

// Top 20 cryptocurrencies as of the time of development
// In a real app, this would be fetched from an API
export const cryptocurrencies: Cryptocurrency[] = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    price: 42389.25,
    change24h: 1.42,
    change7d: -2.18,
    marketCap: 824500000000,
    rank: 1
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    price: 2486.17,
    change24h: 3.21,
    change7d: 7.84,
    marketCap: 298900000000,
    rank: 2
  },
  {
    id: 3,
    name: "Tether",
    symbol: "USDT",
    price: 1.00,
    change24h: 0.01,
    change7d: -0.02,
    marketCap: 89200000000,
    rank: 3,
    isDefault: true
  },
  {
    id: 4,
    name: "BNB",
    symbol: "BNB",
    price: 352.89,
    change24h: -0.87,
    change7d: 2.34,
    marketCap: 54700000000,
    rank: 4
  },
  {
    id: 5,
    name: "Solana",
    symbol: "SOL",
    price: 102.63,
    change24h: 8.94,
    change7d: 21.37,
    marketCap: 44300000000,
    rank: 5
  },
  {
    id: 6,
    name: "XRP",
    symbol: "XRP",
    price: 0.62,
    change24h: -1.24,
    change7d: 3.56,
    marketCap: 33900000000,
    rank: 6
  },
  {
    id: 7,
    name: "USD Coin",
    symbol: "USDC",
    price: 1.00,
    change24h: 0.02,
    change7d: 0.01,
    marketCap: 28700000000,
    rank: 7
  },
  {
    id: 8,
    name: "Cardano",
    symbol: "ADA",
    price: 0.59,
    change24h: 2.45,
    change7d: -4.12,
    marketCap: 21200000000,
    rank: 8
  },
  {
    id: 9,
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.139,
    change24h: 1.87,
    change7d: -3.45,
    marketCap: 19600000000,
    rank: 9
  },
  {
    id: 10,
    name: "Avalanche",
    symbol: "AVAX",
    price: 37.84,
    change24h: 5.32,
    change7d: 12.78,
    marketCap: 13800000000,
    rank: 10
  },
  {
    id: 11,
    name: "Polkadot",
    symbol: "DOT",
    price: 7.25,
    change24h: 1.98,
    change7d: -2.43,
    marketCap: 9400000000,
    rank: 11
  },
  {
    id: 12,
    name: "Polygon",
    symbol: "MATIC",
    price: 0.76,
    change24h: 3.15,
    change7d: 5.78,
    marketCap: 7200000000,
    rank: 12
  },
  {
    id: 13,
    name: "Shiba Inu",
    symbol: "SHIB",
    price: 0.0000226,
    change24h: 2.75,
    change7d: -1.23,
    marketCap: 13300000000,
    rank: 13
  },
  {
    id: 14,
    name: "Dai",
    symbol: "DAI",
    price: 1.00,
    change24h: 0.01,
    change7d: 0.03,
    marketCap: 5300000000,
    rank: 14
  },
  {
    id: 15,
    name: "Litecoin",
    symbol: "LTC",
    price: 73.45,
    change24h: -0.54,
    change7d: 2.87,
    marketCap: 5450000000,
    rank: 15
  },
  {
    id: 16,
    name: "Bitcoin Cash",
    symbol: "BCH",
    price: 248.76,
    change24h: 1.12,
    change7d: -3.45,
    marketCap: 4870000000,
    rank: 16
  },
  {
    id: 17,
    name: "Chainlink",
    symbol: "LINK",
    price: 14.84,
    change24h: 4.56,
    change7d: 9.87,
    marketCap: 8700000000,
    rank: 17
  },
  {
    id: 18,
    name: "Uniswap",
    symbol: "UNI",
    price: 7.32,
    change24h: 2.34,
    change7d: -1.25,
    marketCap: 5590000000,
    rank: 18
  },
  {
    id: 19,
    name: "Cosmos",
    symbol: "ATOM",
    price: 9.76,
    change24h: 3.87,
    change7d: 5.43,
    marketCap: 3750000000,
    rank: 19
  },
  {
    id: 20,
    name: "Monero",
    symbol: "XMR",
    price: 164.25,
    change24h: -0.32,
    change7d: 1.56,
    marketCap: 3040000000,
    rank: 20
  }
];
