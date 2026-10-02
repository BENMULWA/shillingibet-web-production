import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
// import { successToast } from "../../components/SuccessToast";
import BaseClass from "../../services/BaseClass";
import {
  useDeposit,
  useCryptoUpdateDeposit,
} from "../../hooks/usePayment";
import { useUsdKesRate } from "../../hooks/useUsdKesRate";
import { useWalletLimits } from "../../hooks/useWalletLimits";
import CryptoStatusCard from "./CryptoStatusCard";
import {
  CELO_DEPOSIT_ADDRESS,
  CELO_NETWORK,
  connectMinipay,
  getMinipayProvider,
  isMinipayAvailable,
  isMinipayConfigured,
  sendUsdtOnCelo,
} from "../../utils/celoMinipay";

const depositAmounts = [
  { value: 49, hot: false },
  { value: 100, hot: true },
  { value: 500, hot: true },
  { value: 1000, hot: true },
  { value: 2000, hot: true },
  { value: 3000, hot: true },
  { value: 4000, hot: true },
  { value: 5000, hot: true },
  { value: 10000, hot: false },
];

const SHOW_CRYPTO_UI = false;
// MiniPay/Celo USDT deposits. Stays hidden until VITE_USDT_CELO_ADDRESS and
// VITE_CELO_DEPOSIT_ADDRESS are configured (see celoMinipay.js) so we never
// show a "pay" button pointing at an unset address.
// Hidden until the backend has a /wallet/crypto/deposit route to credit MiniPay payments.
const SHOW_MINIPAY_UI = false;

export default function Deposit() {
  const limits = useWalletLimits();
  const baseClass = new BaseClass();

  const [tab, setTab] = useState("mobile"); // "mobile" | "crypto" | "comet" | "minipay"
  const [copied, setCopied] = useState(false);
  const [transactionID, setTransactionID] = useState("");

  // MiniPay / Celo USDT state
  const [minipayDetected, setMinipayDetected] = useState(false);
  const [minipayAmount, setMinipayAmount] = useState(100);
  const [minipayView, setMinipayView] = useState("form"); // 'form' | 'connecting' | 'processing' | 'waiting' | 'success' | 'failed'
  const [minipayMessage, setMinipayMessage] = useState("");
  const [minipayManualTxHash, setMinipayManualTxHash] = useState("");

  useEffect(() => {
    setMinipayDetected(isMinipayAvailable());
  }, []);

  const { kesPerUsd } = useUsdKesRate();
  const estimatedUsdt =
    kesPerUsd && minipayAmount ? (Number(minipayAmount) / kesPerUsd).toFixed(2) : null;

  // Crypto: M-Pesa-style processing view — 'form' | 'processing' | 'success' | 'failed' | 'waiting'
  const [cryptoView, setCryptoView] = useState("form");
  const [cryptoResultMessage, setCryptoResultMessage] = useState("");

  // Crypto address for USDT deposits on TRC20.
  const cryptoAddress = "TYoAs73kthQKByqBbWBWtLRUj3RUG7b2yY";

  const { makingPayment, isLoading } = useDeposit();
  const { depositCrypto: updatingCryptoBalance, isLoading: isDepositingCrypto } = useCryptoUpdateDeposit();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { amount: 49 },
    mode: "onTouched",
  });

  const amount = Number(watch("amount") || 0);
  const tax = amount * 0.05;
  const netAmount = amount - tax;
  const disabled = isLoading || isSubmitting;

  const handlePresetClick = (val) => {
    setValue("amount", val, { shouldValidate: true });
  };

  const onSubmit = ({ amount }) => {
    const phone = baseClass?.phone;
    const userID = baseClass?.userId;

    makingPayment(
      { amount: Number(amount), phone, userID },
      {
        onSuccess: () => {
          reset({ amount: 49 });
        },
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCryptoDeposit = async (e) => {
    e.preventDefault();

    if (!transactionID.trim()) {
      toast.error("Please enter a valid Transaction ID");
      return;
    }

    const updateBalanceData = {
      updateBalanceData: {
        transactionId: transactionID,
      },
    };

    setCryptoView("processing");

    updatingCryptoBalance(
      updateBalanceData,
      {
        onSuccess: (res) => {
          if (res.status === "confirmed") {
            const message = res.alreadyUsed
              ? `Transaction already processed. Amount: ${res.confirmedAmount} USDT, Reward: KES ${res.rewardKes}`
              : res.message || `Deposit confirmed! Amount: ${res.confirmedAmount} USDT, Reward: KES ${res.rewardKes}`;
            setCryptoResultMessage(message);
            setCryptoView("success");
            setTransactionID("");
          } else if (res.status === "waiting_confirmation") {
            setCryptoResultMessage(
              res.message || "No matching deposit found yet. Please try again later."
            );
            setCryptoView("waiting");
          } else if (res.message && /success|confirmed|credited/i.test(res.message)) {
            setCryptoResultMessage(res.message);
            setCryptoView("success");
            setTransactionID("");
          } else {
            setCryptoResultMessage(res.message || "Failed to process deposit");
            setCryptoView("failed");
          }
        },
        onError: (err) => {
          const msg = err?.message ?? "Something went wrong";
          if (/success|successful|confirmed|credited/i.test(msg)) {
            setCryptoResultMessage(msg);
            setCryptoView("success");
            setTransactionID("");
          } else {
            setCryptoResultMessage(msg);
            setCryptoView("failed");
          }
        },
      }
    );
  };

  const resetCryptoView = () => {
    setCryptoView("form");
    setCryptoResultMessage("");
  };

  const submitCeloTxForVerification = (txHash) => {
    setMinipayView("processing");

    updatingCryptoBalance(
      { updateBalanceData: { transactionId: txHash, chain: "celo" } },
      {
        onSuccess: (res) => {
          if (res.status === "confirmed") {
            const message = res.alreadyUsed
              ? `Transaction already processed. Amount: ${res.confirmedAmount} USDT, Reward: KES ${res.rewardKes}`
              : res.message || `Deposit confirmed! Amount: ${res.confirmedAmount} USDT, Reward: KES ${res.rewardKes}`;
            setMinipayMessage(message);
            setMinipayView("success");
            setMinipayManualTxHash("");
          } else if (res.status === "waiting_confirmation") {
            setMinipayMessage(
              res.message || "No matching deposit found yet. Please try again shortly."
            );
            setMinipayView("waiting");
          } else if (res.message && /success|confirmed|credited/i.test(res.message)) {
            setMinipayMessage(res.message);
            setMinipayView("success");
            setMinipayManualTxHash("");
          } else {
            setMinipayMessage(res.message || "Failed to process deposit");
            setMinipayView("failed");
          }
        },
        onError: (err) => {
          const msg = err?.message ?? "Something went wrong";
          if (/success|successful|confirmed|credited/i.test(msg)) {
            setMinipayMessage(msg);
            setMinipayView("success");
            setMinipayManualTxHash("");
          } else {
            setMinipayMessage(msg);
            setMinipayView("failed");
          }
        },
      }
    );
  };

  const handleMinipayPay = async () => {
    if (!isMinipayConfigured()) {
      toast.error("Crypto deposits aren't set up yet. Please try again later.");
      return;
    }

    const amountNum = Number(minipayAmount);
    if (!amountNum || amountNum < limits.deposit.min) {
      toast.error(`Minimum deposit is KES ${limits.deposit.min}`);
      return;
    }
    if (amountNum > limits.deposit.max) {
      toast.error(`Maximum deposit is KES ${limits.deposit.max.toLocaleString()}`);
      return;
    }
    if (!kesPerUsd) {
      toast.error("Couldn't fetch the exchange rate. Please try again.");
      return;
    }

    const provider = getMinipayProvider();
    if (!provider) {
      toast.error("Open ShilingiBet inside the MiniPay app to pay this way.");
      return;
    }

    try {
      setMinipayView("connecting");
      const fromAddress = await connectMinipay(provider);

      const usdtAmount = (amountNum / kesPerUsd).toFixed(6);
      const txHash = await sendUsdtOnCelo({
        provider,
        fromAddress,
        amountHuman: usdtAmount,
      });

      submitCeloTxForVerification(txHash);
    } catch (err) {
      setMinipayView("failed");
      setMinipayMessage(err?.message || "MiniPay payment was cancelled or failed");
    }
  };

  const handleMinipayManualSubmit = (e) => {
    e.preventDefault();
    if (!minipayManualTxHash.trim()) {
      toast.error("Please enter a valid transaction hash");
      return;
    }
    submitCeloTxForVerification(minipayManualTxHash.trim());
  };

  const resetMinipayView = () => {
    setMinipayView("form");
    setMinipayMessage("");
  };

  return (
    <div className="md:min-h-screen text-[#b7c4ba] flex justify-center px-3 md:px-4 py-4 md:py-6">
      <div className="w-full max-w-md md:max-w-5xl md:bg-surface/80 rounded-xl overflow-hidden shadow-lg border border-white/5">

        {/* Content */}
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          <header>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Deposit</h1>
            <p className="text-xs md:text-sm text-[#9cae9f] mt-1">
              Choose your preferred payment method
            </p>
          </header>

          {/* Tab Selector */}
          <div className="flex gap-2 md:gap-3 bg-background/70 p-1 md:p-1.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setTab("mobile")}
              className={`flex-1 py-2 md:py-2.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                tab === "mobile"
                  ? "bg-primary text-black shadow-md"
                  : "text-[#9cae9f] hover:text-white"
              }`}
            >
              Mobile Money
            </button>
            {SHOW_CRYPTO_UI && (
              <button
                type="button"
                onClick={() => setTab("crypto")}
                className={`flex-1 py-2 md:py-2.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                  tab === "crypto"
                    ? "bg-primary text-black shadow-md"
                    : "text-[#9cae9f] hover:text-white"
                }`}
              >
                Crypto (USDT)
              </button>
            )}
            {SHOW_MINIPAY_UI && (
              <button
                type="button"
                onClick={() => setTab("minipay")}
                className={`flex-1 py-2 md:py-2.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                  tab === "minipay"
                    ? "bg-primary text-black shadow-md"
                    : "text-[#9cae9f] hover:text-white"
                }`}
              >
                MiniPay (USDT)
              </button>
            )}
          </div>

          {/* MOBILE MONEY TAB */}
          {tab === "mobile" && (
            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <p className="text-sm text-[#b7c4ba] mb-4">
                  Choose an amount or enter manually
                </p>

                {/* Amount Input */}
                <input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={limits.deposit.min}
                  max={limits.deposit.max}
                  placeholder="Amount (KES)"
                  className="w-full rounded-lg px-5 border border-primary/80 bg-[#07110b] py-3 text-white focus:outline-primary focus:ring-0 focus:border-primary placeholder:text-[#9cae9f]"
                  {...register("amount", {
                    required: "Amount is required",
                    valueAsNumber: true,
                    validate: (value) => Number.isInteger(value) || "Enter a whole amount in KES",
                    min: {
                      value: limits.deposit.min,
                      message: `Minimum deposit is KES ${limits.deposit.min}`,
                    },
                    max: {
                      value: limits.deposit.max,
                      message: `Maximum deposit is KES ${limits.deposit.max.toLocaleString()}`,
                    },
                  })}
                  disabled={disabled}
                />
                {errors.amount && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-4">
                {depositAmounts.map(({ value, hot }) => {
                  const active = amount === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handlePresetClick(value)}
                      disabled={disabled}
                      className={`relative overflow-hidden rounded-lg border bg-[#0b120e] transition-all duration-200 hover:border-primary/60 hover:bg-[#0f1b13]
                        ${
                          active
                            ? "border-primary ring-2 ring-primary/35"
                            : "border-primary/20"
                        }
                      `}
                    >
                      <div className="relative px-4 py-3 text-center">
                        <span className="text-md font-semibold text-[#d7e1d9]">
                          {value}
                        </span>
                        {hot && (
                          <span className="absolute right-2 top-2 text-lg">
                            🔥
                          </span>
                        )}
                      </div>

                      <div className={`py-2 text-center font-medium text-sm transition-colors ${
                        active
                          ? "bg-primary text-black"
                          : "bg-primary/10 text-primary"
                      }`}>
                        Pay {value}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pay CTA */}
              <button
                type="submit"
                disabled={disabled}
                className="w-full rounded-md bg-primary py-4 text-lg font-bold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {disabled ? "Processing…" : `Pay KES ${amount}`}
              </button>

              {/* Summary */}
              <div className="rounded-xl border border-primary/20 bg-[#07110b]/85 p-4 text-sm space-y-3">
                <p className="text-xs text-[#b7c4ba]">
                  A <span className="font-semibold text-primary">5% tax</span>{" "}
                  will be deducted from your deposit amount
                </p>

                <div className="flex justify-between">
                  <span>Deposit Amount</span>
                  <span className="text-green-500">KES {amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span className="text-red-400">- KES {tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-primary/20 pt-3 flex justify-between font-semibold">
                  <span className="text-primary">Amount to Wallet</span>
                  <span className="text-primary">
                    KES {netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* CRYPTO TAB */}
          {SHOW_CRYPTO_UI && tab === "crypto" && cryptoView !== "form" && (
            <CryptoStatusCard
              view={cryptoView}
              resultMessage={cryptoResultMessage}
              onReset={resetCryptoView}
            />
          )}

          {/* MINIPAY (CELO USDT) TAB */}
          {SHOW_MINIPAY_UI && tab === "minipay" && minipayView !== "form" && (
            <CryptoStatusCard
              view={minipayView === "connecting" ? "processing" : minipayView}
              resultMessage={
                minipayView === "connecting"
                  ? "Confirm the payment in MiniPay…"
                  : minipayMessage
              }
              onReset={resetMinipayView}
            />
          )}

          {SHOW_MINIPAY_UI && tab === "minipay" && minipayView === "form" && (
            <div className="space-y-6">
              {!isMinipayConfigured() && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 md:p-4">
                  <p className="text-xs text-red-300 leading-relaxed">
                    Crypto deposits aren&apos;t configured yet.
                  </p>
                </div>
              )}

              {minipayDetected ? (
                <div className="bg-background/60 border border-primary/20 rounded-2xl p-4 md:p-6 space-y-6">
                  <div>
                    <p className="text-sm text-[#b7c4ba] mb-4">
                      Enter an amount to pay with MiniPay ({CELO_NETWORK.label})
                    </p>
                    <input
                      type="number"
                      inputMode="numeric"
                      step={1}
                      min={limits.deposit.min}
                      max={limits.deposit.max}
                      placeholder="Amount (KES)"
                      value={minipayAmount}
                      onChange={(e) => setMinipayAmount(e.target.value)}
                      className="w-full rounded-lg px-5 border border-primary/80 bg-[#07110b] py-3 text-white focus:outline-primary focus:ring-0 focus:border-primary placeholder:text-[#9cae9f]"
                    />
                    <p className="text-xs text-[#75877a] mt-2">
                      {estimatedUsdt
                        ? `≈ ${estimatedUsdt} USDT (estimated — the amount credited is based on the live rate when your payment confirms)`
                        : "Fetching exchange rate…"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleMinipayPay}
                    disabled={!isMinipayConfigured() || !kesPerUsd}
                    className="w-full rounded-md bg-primary py-4 text-lg font-bold text-black transition hover:brightness-110 disabled:opacity-60"
                  >
                    Pay with MiniPay
                  </button>
                </div>
              ) : (
                <div className="bg-background/60 border border-primary/20 rounded-2xl p-4 md:p-6 space-y-6 md:space-y-8">
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 md:p-4">
                    <p className="text-xs text-[#aab8ad] leading-relaxed">
                      MiniPay wasn&apos;t detected. Open ShilingiBet inside the{" "}
                      <span className="font-semibold text-primary">MiniPay</span> app for
                      instant, one-tap payment — or send USDT on{" "}
                      <span className="font-semibold text-primary">{CELO_NETWORK.label}</span>{" "}
                      from any wallet and verify it below.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-start md:items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary text-black font-bold text-base md:text-lg flex-shrink-0">
                        1
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-[#d7e1d9] leading-tight">
                        Send USDT ({CELO_NETWORK.label}) to this address:
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 bg-secondary border border-primary/40 rounded-lg px-3 md:px-4 py-2.5 md:py-3.5">
                      <span className="break-all text-primary font-mono text-xs md:text-sm flex-1 min-w-0">
                        {CELO_DEPOSIT_ADDRESS || "Not configured yet"}
                      </span>
                      {CELO_DEPOSIT_ADDRESS && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(CELO_DEPOSIT_ADDRESS);
                            toast.success("Address copied!");
                          }}
                          className="text-primary hover:text-primary/80 transition flex-shrink-0"
                        >
                          <Copy size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleMinipayManualSubmit}>
                    <div className="flex items-start md:items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary text-black font-bold text-base md:text-lg flex-shrink-0">
                        2
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-[#d7e1d9] leading-tight">
                        Enter Transaction Hash:
                      </h3>
                    </div>

                    <input
                      type="text"
                      placeholder="0x..."
                      value={minipayManualTxHash}
                      onChange={(e) => setMinipayManualTxHash(e.target.value)}
                      className="w-full bg-secondary border border-primary/20 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-[#d7e1d9] placeholder:text-[#6f7f73] focus:outline-none focus:border-primary transition"
                    />

                    <button
                      type="submit"
                      disabled={!minipayManualTxHash.trim()}
                      className="mt-4 md:mt-6 w-full py-3 md:py-3.5 bg-primary text-black text-sm md:text-base font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Transaction Hash
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {SHOW_CRYPTO_UI && tab === "crypto" && cryptoView === "form" && (
            <div className="bg-background/60 border border-primary/20 rounded-2xl p-4 md:p-6 space-y-6 md:space-y-8">
              {/* Step 1 */}
              <div>
                <div className="flex items-start md:items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary text-black font-bold text-base md:text-lg flex-shrink-0">
                    1
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-[#d7e1d9] leading-tight">
                    Send USDT TRC20 to this address:
                  </h3>
                </div>

                <div className="flex items-center gap-2 bg-secondary border border-primary/40 rounded-lg px-3 md:px-4 py-2.5 md:py-3.5">
                  <span className="break-all text-primary font-mono text-xs md:text-sm flex-1 min-w-0">
                    {cryptoAddress}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-primary hover:text-primary/80 transition flex-shrink-0"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                <ul className="list-disc list-inside mt-3 md:mt-4 text-xs md:text-sm text-[#9cae9f] space-y-1 md:space-y-1.5">
                  <li className="break-words">Use the TRC20 (Tron) network only.</li>
                  <li className="break-words">Copy the address above and send your USDT.</li>
                  <li className="break-words">
                    After sending, enter your transaction details below.
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-start md:items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary text-black font-bold text-base md:text-lg flex-shrink-0">
                    2
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-[#d7e1d9] leading-tight">
                    Enter Transaction Details:
                  </h3>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-xs md:text-sm text-[#9cae9f] mb-2">
                    Transaction ID (TxID)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your transaction ID"
                    value={transactionID}
                    className="w-full bg-secondary border border-primary/20 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-[#d7e1d9] placeholder:text-[#6f7f73] focus:outline-none focus:border-primary transition"
                    onChange={(e) => setTransactionID(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  disabled={isDepositingCrypto || !transactionID.trim()}
                  className="mt-4 md:mt-6 w-full py-3 md:py-3.5 bg-primary text-black text-sm md:text-base font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCryptoDeposit}
                >
                  {isDepositingCrypto
                    ? "Processing Transaction..."
                    : "Submit Transaction ID"}
                </button>
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 md:p-4">
                <p className="text-xs text-[#aab8ad] leading-relaxed break-words">
                  <span className="font-semibold text-primary">Note:</span> Your
                  account will be credited after we verify your USDT TRC20
                  transaction on the blockchain. This usually takes 5-10 minutes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
