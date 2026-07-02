import { useState } from "react";
import { useForm } from "react-hook-form";
import { Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
// import { successToast } from "../../components/SuccessToast";
import BaseClass from "../../services/BaseClass";
import {
  useDeposit,
  useCryptoUpdateDeposit,
  useFusionDeposit,
} from "../../hooks/usePayment";
import { BsInfoCircle } from "react-icons/bs";

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

const getFusionCheckoutUrl = (response) => {
  const candidates = [
    response?.checkout_url,
    response?.checkoutUrl,
    response?.payment_url,
    response?.paymentUrl,
    response?.url,
    response?.link,
    response?.provider?.checkout_url,
    response?.provider?.checkoutUrl,
    response?.provider?.payment_url,
    response?.provider?.paymentUrl,
    response?.provider?.url,
    response?.provider?.link,
    response?.provider?.order?.checkout_url,
    response?.provider?.order?.checkoutUrl,
    response?.provider?.order?.payment_url,
    response?.provider?.order?.paymentUrl,
    response?.provider?.order?.url,
    response?.provider?.order?.link,
    response?.order?.checkout_url,
    response?.order?.checkoutUrl,
    response?.order?.payment_url,
    response?.order?.paymentUrl,
    response?.order?.url,
    response?.order?.link,
  ];

  return candidates.find(
    (value) => typeof value === "string" && /^https?:\/\//i.test(value)
  );
};

export default function Deposit() {
  const baseClass = new BaseClass();

  const [tab, setTab] = useState("mobile"); // "mobile" | "crypto" | "comet"
  const [copied, setCopied] = useState(false);
  const [transactionID, setTransactionID] = useState("");

  // Fusion Fi state
  const [fusionEmail, setFusionEmail] = useState("");
  const [fusionAmount, setFusionAmount] = useState("");
  // Crypto: M-Pesa-style processing view — 'form' | 'processing' | 'success' | 'failed' | 'waiting'
  const [cryptoView, setCryptoView] = useState("form");
  const [cryptoResultMessage, setCryptoResultMessage] = useState("");

  // Crypto address for USDT deposits on TRC20.
  const cryptoAddress = "TYoAs73kthQKByqBbWBWtLRUj3RUG7b2yY";

  const { makingPayment, isLoading } = useDeposit();
  const { depositCrypto: updatingCryptoBalance, isLoading: isDepositingCrypto } = useCryptoUpdateDeposit();
  const { depositViaFusion, isLoading: isFusionLoading } = useFusionDeposit();

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

  const handleFusionDeposit = () => {
    const email = fusionEmail.trim();
    const amountNum = Number(fusionAmount);

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid Fusion Fi email");
      return;
    }

    if (!amountNum || amountNum < 10) {
      toast.error("Minimum Fusion Fi deposit is KES 10");
      return;
    }

    depositViaFusion(
      {
        amount: amountNum,
        email,
        currency: "KES",
        comment: `shilingibet-deposit-${baseClass.userId || "guest"}`,
        description: "ShilingiBet wallet deposit",
      },
      {
        onSuccess: (response) => {
          setFusionAmount("");

          const checkoutUrl = getFusionCheckoutUrl(response);
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
            return;
          }

          toast.success(
            "Fusion Fi order created. Complete the payment from the provider page once it becomes available."
          );
        },
      }
    );
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
            <button
              type="button"
              onClick={() => setTab("comet")}
              className={`flex-1 py-2 md:py-2.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                tab === "comet"
                  ? "bg-primary text-black shadow-md"
                  : "text-[#9cae9f] hover:text-white"
              }`}
            >
              Fusion Fi
            </button>
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
                  min={10}
                  max={140000}
                  placeholder="Amount (KES)"
                  className="w-full rounded-lg px-5 border border-primary/80 bg-[#07110b] py-3 text-white focus:outline-primary focus:ring-0 focus:border-primary placeholder:text-[#9cae9f]"
                  {...register("amount", {
                    required: "Amount is required",
                    valueAsNumber: true,
                    min: { value: 10, message: "Minimum deposit is KES 10" },
                    max: {
                      value: 140000,
                      message: "Maximum deposit is KES 140,000",
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
            /* M-Pesa-style processing / result card */
            <div className="w-full max-w-sm mx-auto bg-secondary rounded-2xl overflow-hidden">
              <div className="pt-10 pb-8 px-6 flex flex-col items-center">
                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                    cryptoView === "success"
                      ? "bg-green-500/15"
                      : cryptoView === "failed"
                      ? "bg-red-500/15"
                      : "bg-primary/10"
                  }`}
                >
                  {(cryptoView === "processing" || cryptoView === "waiting") && (
                    <svg
                      className="w-10 h-10 text-primary animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {cryptoView === "success" && (
                    <svg
                      className="w-10 h-10 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          strokeDasharray: 63,
                          strokeDashoffset: 63,
                          animation: "draw-circle 0.5s ease-out forwards",
                        }}
                      />
                      <path
                        d="M8 12l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          strokeDasharray: 20,
                          strokeDashoffset: 20,
                          animation: "draw-check 0.4s ease-out 0.4s forwards",
                        }}
                      />
                    </svg>
                  )}
                  {(cryptoView === "failed") && (
                    <svg
                      className="w-10 h-10 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          strokeDasharray: 63,
                          strokeDashoffset: 63,
                          animation: "draw-circle 0.5s ease-out forwards",
                        }}
                      />
                      <path
                        d="M15 9L9 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: 10,
                          strokeDashoffset: 10,
                          animation: "draw-x 0.3s ease-out 0.4s forwards",
                        }}
                      />
                      <path
                        d="M9 9L15 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: 10,
                          strokeDashoffset: 10,
                          animation: "draw-x 0.3s ease-out 0.5s forwards",
                        }}
                      />
                    </svg>
                  )}
                </div>
                <h2
                  className={`text-xl font-bold mb-2 ${
                    cryptoView === "success"
                      ? "text-green-500"
                      : cryptoView === "failed"
                      ? "text-red-500"
                      : "text-primary"
                  }`}
                >
                  {cryptoView === "processing" && "Processing..."}
                  {cryptoView === "waiting" && "Verifying..."}
                  {cryptoView === "success" && "Deposit Successful!"}
                  {cryptoView === "failed" && "Deposit Failed"}
                </h2>
                <p className="text-[#9cae9f] text-center text-sm leading-relaxed max-w-[280px]">
                  {cryptoView === "processing" &&
                    "Please wait while we confirm your payment. This may take a few moments."}
                  {cryptoView === "waiting" && (cryptoResultMessage || "We're verifying your transaction on the blockchain. This usually takes 5-10 minutes.")}
                  {cryptoView === "success" && (cryptoResultMessage || "Your funds have been added to your account successfully.")}
                  {cryptoView === "failed" && (cryptoResultMessage || "We couldn't process your deposit. Please try again or contact support.")}
                </p>
              </div>
              <div className="px-6 pb-6">
                {(cryptoView === "processing" || cryptoView === "waiting") && (
                  <div className="bg-background/30 rounded-lg p-3 mb-4">
                    <p className="text-[#75877a] text-xs leading-relaxed text-center">
                      Please don&apos;t close this page. Your payment is being
                      verified on the blockchain.
                    </p>
                  </div>
                )}
                {(cryptoView === "success" || cryptoView === "failed" || cryptoView === "waiting") && (
                  <button
                    type="button"
                    onClick={resetCryptoView}
                    className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
                      cryptoView === "success"
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-primary hover:bg-primary/90 text-black"
                    }`}
                  >
                    {cryptoView === "success" ? "Continue" : cryptoView === "waiting" ? "Back" : "Try Again"}
                  </button>
                )}
              </div>
            </div>
          )}
          {/* FUSION FI TAB */}
          {tab === "comet" && (
            <div className="space-y-6">
              {/* Fusion Fi Logo / Header */}
              <div className="flex flex-col items-center gap-3 bg-background/60 border border-white/10 rounded-2xl p-6">
                <img
                  src="/fusion.png"
                  alt="Fusion Fi"
                  className="h-24 w-24 object-contain"
                />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#d7e1d9]">Fusion Fi</h3>
                  <p className="text-xs text-[#75877a] mt-0.5">
                    Create a hosted bill order and complete payment on Fusion Fi
                  </p>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs md:text-sm text-[#9cae9f] mb-2">
                  Fusion Fi Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your Fusion Fi email"
                  value={fusionEmail}
                  onChange={(e) => setFusionEmail(e.target.value)}
                  className="w-full rounded-lg px-5 py-3 border border-primary/40 placeholder:text-[#6f7f73] bg-transparent text-[#d7e1d9] focus:outline-none focus:border-primary transition"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs md:text-sm text-[#9cae9f] mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount (KES)"
                  value={fusionAmount}
                  onChange={(e) => setFusionAmount(e.target.value)}
                  min={10}
                  className="w-full rounded-lg px-5 py-3 border border-primary/40 placeholder:text-[#6f7f73] bg-transparent text-[#d7e1d9] focus:outline-none focus:border-primary transition"
                />
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleFusionDeposit}
                disabled={isFusionLoading}
                className="w-full rounded-lg bg-primary py-4 text-lg font-bold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {isFusionLoading ? "Processing…" : "Continue to Fusion Fi"}
              </button>

              {/* Info */}
              <div className="rounded-sm bg-background/60 p-4 text-sm text-textColor/80 space-y-3">
                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    The backend contract creates a pending Fusion Fi bill order
                    first. Your wallet is credited only after the provider side
                    is completed and reconciled.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    Make sure you use your registered{" "}
                    <span className="font-semibold text-primary">Fusion Fi email</span>.
                  </p>
                </div>
              </div>
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
