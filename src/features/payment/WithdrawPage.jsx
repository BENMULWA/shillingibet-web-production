import { useState } from "react";
import BaseClass from "../../services/BaseClass";
import {
  useUpdateBalance,
  useWithdraw,
  useWithdrawCrypto,
} from "../../hooks/usePayment";
import { BsInfoCircle, BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { SiTether } from "react-icons/si";
import toast from "react-hot-toast";
import { debouncedWithdraw } from "../../utils/debounce";

const TABS = ["M-Pesa", "Crypto (USDT)", "Comet App"];

export default function Withdraw() {
  const [activeTab, setActiveTab] = useState("M-Pesa");

  // M-Pesa state
  const [amount, setAmount] = useState(100);
  const tax = amount * 0.05;
  const fee = 0;
  const disbursed = amount - tax - fee;

  // Crypto state
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");

  // Comet App state
  const [cometEmail, setCometEmail] = useState("");
  const [cometWithdrawAmount, setCometWithdrawAmount] = useState("");

  const baseClass = new BaseClass();
  const phone = baseClass?.phone;

  const { balance } = useUpdateBalance();
  const { withdrawingCash, isLoading: isWithdrawing } = useWithdraw();
  const { withdrawCrypto, isLoading: isCryptoWithdrawing, data: cryptoResult, reset: resetCrypto } = useWithdrawCrypto();

  // ── M-Pesa handler ──────────────────────────────────────────────────────────
  function handleWithdraw() {
    debouncedWithdraw(amount, () => {
      if (isWithdrawing) return;

      if (!balance?.balance || balance?.balance === 0) {
        return toast.error("You don't have enough amount to make this transaction");
      }

      if (+amount > balance?.balance) {
        return toast.error("You don't have enough amount to make this transaction");
      }

      if (+amount < 100) {
        return toast.error("Withdrawals start at Ksh 100 and above.");
      }

      withdrawingCash(
        { withdrawAmount: amount },
        {
          onSuccess: () => {
            setAmount(100);
          },
          onError: (err) => {
            toast.error(err?.message || `Withdrawal of Ksh ${amount} failed`);
          },
        }
      );
    });
  }

  // ── Crypto handler ───────────────────────────────────────────────────────────
  function handleCryptoWithdraw() {
    if (!cryptoAddress.trim()) {
      return toast.error("Please enter a valid TRC20 wallet address.");
    }
    if (!cryptoAmount || +cryptoAmount < 1) {
      return toast.error("Minimum withdrawal is 1 USDT.");
    }
    withdrawCrypto({ address: cryptoAddress.trim(), amount: +cryptoAmount });
  }

  function handleCryptoReset() {
    setCryptoAddress("");
    setCryptoAmount("");
    resetCrypto();
  }

  // ── Crypto result screen ─────────────────────────────────────────────────────
  if (activeTab === "Crypto (USDT)" && cryptoResult) {
    const isComplete = cryptoResult?.status === "complete";
    return (
      <div className="text-[#b7c4ba] flex justify-center p-4">
        <div className="w-full max-w-md md:max-w-5xl bg-surface/80 rounded-2xl shadow-xl overflow-hidden border border-white/5">
          <div className="p-8 flex flex-col items-center gap-5 text-center">
            {isComplete ? (
              <BsCheckCircleFill className="text-6xl text-green-400" />
            ) : (
              <BsXCircleFill className="text-6xl text-red-400" />
            )}

            <h2 className={`text-2xl font-bold ${isComplete ? "text-green-400" : "text-red-400"}`}>
              {isComplete ? "Withdrawal Initiated" : "Withdrawal Failed"}
            </h2>

            <p className="text-textColor/70 text-sm">
              {cryptoResult?.message}
            </p>

            {isComplete && (
              <div className="w-full rounded-lg bg-[#07110b]/85 border border-primary/20 p-4 text-sm space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-textColor/70">Amount</span>
                  <span className="font-semibold text-primary">
                    {cryptoResult?.amount} {cryptoResult?.amountUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textColor/70">Rate</span>
                  <span>1 USDT = KES {cryptoResult?.rate?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textColor/70">KES Equivalent</span>
                  <span className="font-semibold text-primary">
                    KES {cryptoResult?.amountKes?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textColor/70">Network</span>
                  <span>{cryptoResult?.network}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-textColor/70 shrink-0">Address</span>
                  <span className="break-all text-right text-xs">{cryptoResult?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textColor/70">Withdrawal ID</span>
                  <span className="text-xs">{cryptoResult?.withdrawalId}</span>
                </div>
              </div>
            )}

            {!isComplete && cryptoResult?.reason === "insufficient_funds" && (
              <div className="w-full rounded-lg bg-[#07110b]/85 border border-primary/20 p-4 text-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-textColor/70">Available Balance</span>
                  <span className="text-red-400 font-semibold">
                    {cryptoResult?.availableAmount} {cryptoResult?.availableAmountUnit}
                  </span>
                </div>
              </div>
            )}

            {!isComplete && cryptoResult?.reason === "amount_below_minimum" && (
              <div className="w-full rounded-lg bg-[#07110b]/85 border border-primary/20 p-4 text-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-textColor/70">Requested</span>
                  <span>{cryptoResult?.requestedAmount} {cryptoResult?.amountUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textColor/70">Minimum</span>
                  <span className="text-primary font-semibold">
                    {cryptoResult?.minWithdrawalAmount} {cryptoResult?.amountUnit}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleCryptoReset}
              className="w-full bg-primary text-black py-3 rounded-lg font-bold"
            >
              Make Another Withdrawal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[#b7c4ba] flex justify-center p-4">
      <div className="w-full max-w-md md:max-w-5xl bg-surface/80 rounded-2xl shadow-xl overflow-hidden border border-white/5">

        {/* Content */}
        <main className="p-6 md:p-8 space-y-6">
          <h1 className="text-2xl font-semibold text-white">Withdraw</h1>

          <p className="text-primary font-semibold">
            Balance Withdrawable (KES) :{" "}
            {balance?.balance?.toLocaleString() ?? 0}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 bg-background/70 p-1 rounded-lg border border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-black"
                    : "text-[#9cae9f] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── M-Pesa Tab ─────────────────────────────────────────────────── */}
          {activeTab === "M-Pesa" && (
            <>
              <input
                type="text"
                value={`MPESA Number: ${phone}`}
                readOnly
                disabled
                className="w-full border border-white/10 bg-[#07110b] rounded-lg px-5 py-3 text-[#8fb79c] cursor-not-allowed opacity-80"
              />

              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg px-5 py-3 border border-primary/40 bg-[#07110b] text-white placeholder:text-[#9cae9f] focus:outline-none focus:border-primary"
                placeholder="Amount (KES)"
              />

              <div className="rounded-lg bg-[#07110b]/85 border border-primary/20 p-4 text-sm space-y-3">
                <p className="text-xs text-[#b7c4ba]">
                  Withholding Tax{" "}
                  <span className="font-semibold text-primary">5%</span>
                </p>

                <div className="flex justify-between">
                  <span>Withdraw Amount</span>
                  <span>KES {amount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span className="text-red-400">- KES {tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Withdraw Fee</span>
                  <span className="text-red-400">- KES {fee}</span>
                </div>

                <div className="border-t border-primary/20 pt-3 flex justify-between font-semibold">
                  <span className="text-primary">Disbursed Amount</span>
                  <span className="text-primary">KES {disbursed.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full bg-primary text-black py-4 rounded-lg text-lg font-bold disabled:opacity-60"
              >
                {isWithdrawing ? "Processing..." : "Withdraw"}
              </button>

              <div className="rounded-sm bg-[#07110b]/85 border border-white/5 p-4 text-sm text-[#b7c4ba] space-y-3">
                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    Withdrawal range is{" "}
                    <span className="font-semibold text-primary">KES 100 – 70,000</span>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    Funds are credited{" "}
                    <span className="font-semibold text-primary">instantly</span> to Mpesa.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── Comet App Tab ──────────────────────────────────────────────── */}
          {activeTab === "Comet App" && (
            <>
              {/* Comet App Logo / Header */}
              <div className="flex flex-col items-center gap-3 bg-[#07110b]/85 border border-white/10 rounded-2xl p-6">
                <img
                  src="/Comet Logo.png"
                  alt="Comet App"
                  className="w-20 h-20 object-contain"
                />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#d7e1d9]">Comet App</h3>
                  <p className="text-xs text-[#75877a] mt-0.5">Withdraw directly to your Comet account</p>
                </div>
              </div>

              <input
                type="email"
                value={cometEmail}
                onChange={(e) => setCometEmail(e.target.value)}
                className="w-full rounded-lg px-5 py-3 border border-primary/40 placeholder:text-[#6f7f73] bg-[#07110b] text-white focus:outline-none focus:border-primary"
                placeholder="Enter your Comet App email"
              />

              <input
                type="number"
                value={cometWithdrawAmount}
                onChange={(e) => setCometWithdrawAmount(e.target.value)}
                min={1}
                className="w-full rounded-lg px-5 py-3 border border-primary/40 placeholder:text-[#6f7f73] bg-[#07110b] text-white focus:outline-none focus:border-primary"
                placeholder="Enter amount (KES)"
              />

              <button
                type="button"
                onClick={() => toast("Comet App withdrawal coming soon!", { icon: "🚀" })}
                className="w-full bg-primary text-black py-4 rounded-lg text-lg font-bold"
              >
                Withdraw via Comet App
              </button>

              <div className="rounded-sm bg-[#07110b]/85 border border-white/5 p-4 text-sm text-[#b7c4ba] space-y-3">
                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    Funds are sent{" "}
                    <span className="font-semibold text-primary">instantly</span>{" "}
                    to your Comet App account.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    Make sure you use your registered{" "}
                    <span className="font-semibold text-primary">Comet App email</span>.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── Crypto Tab ─────────────────────────────────────────────────── */}
          {activeTab === "Crypto (USDT)" && (
            <>
              <div className="flex items-center gap-3 bg-[#07110b]/85 border border-white/10 rounded-lg px-4 py-3">
                <SiTether className="text-2xl text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">USDT — TRC20 (Tron)</p>
                  <p className="text-xs text-[#75877a]">Minimum withdrawal: 10 USDT</p>
                </div>
              </div>

              <input
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="w-full rounded-lg px-5 py-3 border border-primary/40 placeholder:text-[#6f7f73] bg-[#07110b] text-white focus:outline-none focus:border-primary"
                placeholder="TRC20 Wallet Address (e.g. TYoAs73k...)"
              />

              <input
                type="number"
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                min={1}
                className="w-full rounded-lg px-5 py-3 border border-primary/40 placeholder:text-[#6f7f73] bg-[#07110b] text-white focus:outline-none focus:border-primary"
                placeholder="Amount (USDT)"
              />

              <button
                onClick={handleCryptoWithdraw}
                disabled={isCryptoWithdrawing}
                className="w-full bg-primary text-black py-4 rounded-lg text-lg font-bold disabled:opacity-60"
              >
                {isCryptoWithdrawing ? "Processing..." : "Withdraw USDT"}
              </button>

              <div className="rounded-sm bg-[#07110b]/85 border border-white/5 p-4 text-sm text-[#b7c4ba] space-y-3">
                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    Only send to a valid{" "}
                    <span className="font-semibold text-primary">TRC20 (Tron)</span> address.
                    Sending to the wrong network will result in permanent loss of funds.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <BsInfoCircle className="mt-0.5 text-primary text-lg shrink-0" />
                  <p>
                    Minimum withdrawal is{" "}
                    <span className="font-semibold text-primary">10 USDT</span>.
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
