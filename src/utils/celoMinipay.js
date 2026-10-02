// MiniPay is Opera Mini's built-in non-custodial wallet. It injects a
// standard EIP-1193 provider at window.ethereum with an extra `isMiniPay`
// flag, and is Celo-only (no chain-switching UI on its side).
//
// We deliberately avoid a wallet SDK here and hand-encode the single ERC20
// call we need (`transfer`) to keep this dependency-free — MiniPay users are
// already inside a wallet browser, so all we're doing is asking it to sign.

const CELO_NETWORKS = {
  mainnet: { chainIdHex: "0xa4ec", chainIdDec: 42220, label: "Celo Mainnet" },
  alfajores: { chainIdHex: "0xaef3", chainIdDec: 44787, label: "Celo Alfajores Testnet" },
};

const network = import.meta.env.VITE_CELO_NETWORK === "alfajores" ? "alfajores" : "mainnet";
export const CELO_NETWORK = CELO_NETWORKS[network];

// Must be set by whoever deploys this — verify on https://celoscan.io before
// enabling in production. We do not ship a guessed default.
export const USDT_CELO_ADDRESS = import.meta.env.VITE_USDT_CELO_ADDRESS || null;
export const CELO_DEPOSIT_ADDRESS = import.meta.env.VITE_CELO_DEPOSIT_ADDRESS || null;

export const isMinipayConfigured = () =>
  Boolean(USDT_CELO_ADDRESS && CELO_DEPOSIT_ADDRESS);

export const getMinipayProvider = () => {
  if (typeof window === "undefined") return null;
  return window.ethereum?.isMiniPay ? window.ethereum : null;
};

export const isMinipayAvailable = () => Boolean(getMinipayProvider());

const toHex32 = (value) => {
  const hex = BigInt(value).toString(16);
  return hex.padStart(64, "0");
};

const addressToTopic = (address) => address.replace(/^0x/, "").toLowerCase().padStart(64, "0");

// function selectors (first 4 bytes of keccak256("<sig>")), taken from the
// canonical ERC20 ABI — these are fixed across every ERC20 token.
const SELECTOR_DECIMALS = "0x313ce567"; // decimals()
const SELECTOR_TRANSFER = "0xa9059cbb"; // transfer(address,uint256)

async function ethCall(provider, { to, data }) {
  return provider.request({
    method: "eth_call",
    params: [{ to, data }, "latest"],
  });
}

export async function connectMinipay(provider) {
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const address = accounts?.[0];
  if (!address) throw new Error("MiniPay did not return a wallet address");
  return address;
}

export async function assertOnCeloNetwork(provider) {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId?.toLowerCase() !== CELO_NETWORK.chainIdHex) {
    throw new Error(
      `Wrong network in MiniPay (expected ${CELO_NETWORK.label}). Please switch and try again.`
    );
  }
}

export async function getUsdtDecimals(provider) {
  if (!USDT_CELO_ADDRESS) {
    throw new Error("USDT (Celo) contract address is not configured");
  }
  const result = await ethCall(provider, {
    to: USDT_CELO_ADDRESS,
    data: SELECTOR_DECIMALS,
  });
  return parseInt(result, 16);
}

// amountHuman is a decimal string/number, e.g. 3.5 USDT
export function toBaseUnits(amountHuman, decimals) {
  const [whole, fraction = ""] = String(amountHuman).split(".");
  const paddedFraction = (fraction + "0".repeat(decimals)).slice(0, decimals);
  const base = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "");
  return BigInt(base || "0");
}

export async function sendUsdtOnCelo({ provider, fromAddress, amountHuman }) {
  if (!isMinipayConfigured()) {
    throw new Error("Crypto deposits are not configured yet");
  }

  await assertOnCeloNetwork(provider);
  const decimals = await getUsdtDecimals(provider);
  const amountBase = toBaseUnits(amountHuman, decimals);

  if (amountBase <= 0n) {
    throw new Error("Deposit amount is too small");
  }

  const data = `${SELECTOR_TRANSFER}${addressToTopic(CELO_DEPOSIT_ADDRESS)}${toHex32(amountBase)}`;

  const txHash = await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: fromAddress,
        to: USDT_CELO_ADDRESS,
        data,
      },
    ],
  });

  return txHash;
}
