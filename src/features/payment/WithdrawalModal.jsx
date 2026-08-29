import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

import { IoWalletOutline } from "react-icons/io5";
import BaseClass from "../../services/BaseClass";
import toast from "react-hot-toast";

import {
  useUpdateBalance,
  useWithdraw,
} from "../../hooks/usePayment";
import { debouncedWithdraw } from "../../utils/debounce";
import { WALLET_LIMITS } from "../../utils/walletLimits";

export default function WithdrawalModal({ onClose }) {
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const presetAmounts = [100, 250, 500, 1000, 1500];
  const { balance } = useUpdateBalance();
  const { withdrawingCash, isLoading: isWithdrawing } = useWithdraw();
  const baseClass = new BaseClass();
  const withdrawableBalance = Number(balance?.withdrawableBalance ?? 0);

  const handlePresetClick = (val) => setWithdrawAmount(val);
  function handleWithdraw() {
    debouncedWithdraw(withdrawAmount, () => {
      if (isWithdrawing) return;
      const requestedAmount = Number(withdrawAmount);

      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
        return toast.error("Enter a valid withdrawal amount.");
      }

      if (withdrawableBalance === 0)
        return toast.error(
          "You don't have withdrawable funds. Bonus funds can only be used to bet."
        );

      if (requestedAmount > withdrawableBalance) {
        return toast.error(
          "The amount exceeds your withdrawable balance."
        );
      }

      if (requestedAmount < WALLET_LIMITS.withdrawal.min) {
        return toast.error(`Withdrawals start at KES ${WALLET_LIMITS.withdrawal.min}.`);
      }

      if (requestedAmount > WALLET_LIMITS.withdrawal.max) {
        return toast.error(`Maximum withdrawal is KES ${WALLET_LIMITS.withdrawal.max.toLocaleString()}.`);
      }

      withdrawingCash(
        { withdrawAmount },
        {
          onSuccess: () => {
            setWithdrawAmount("");
          },
          onError: (err) => {
            toast.error(
              err?.message || `Withdrawal of Ksh ${withdrawAmount} failed`
            );
          },
        }
      );
    });
  }

  return (
    <div className="fixed inset-0 bottom-15 flex flex-col justify-end md:justify-center items-center z-50">
      <div className="w-full md:w-[90%] md:max-w-md bg-secondary rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl text-[#b7c4ba]">
        {/* Header */}
        <div className="bg-primary flex items-center justify-between px-4 py-2">
          <h2 className="font-semibold text-[17px] flex items-center gap-2 text-black">
            <IoWalletOutline /> Withdraw
          </h2>
          <button onClick={onClose}>
            <IoClose className="text-black text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* M-Pesa Logo */}
          <div className="flex justify-center mb-5">
            <img src="/mpesa.png" alt="M-PESA" className="h-12" />
          </div>

          {/* Account Info */}
          <div className="bg-secondary border border-[#444] text-sm px-4 py-3 rounded-lg mb-1 font-medium tracking-wide text-[#b7c4ba]">
            KE {baseClass?.phone}
          </div>
          <p className="text-sm text-[#b7c4ba] my-4 font-normal">
            This is your primary account number
          </p>

          {/* Preset Amounts */}
          <div className="flex rounded-lg overflow-hidden border border-[#444] mb-4">
            {presetAmounts.map((val, idx) => (
              <button
                key={val}
                onClick={() => handlePresetClick(val)}
                className={`flex-1 py-2 text-sm font-medium transition-all 
                  ${
                    withdrawAmount === val
                      ? "bg-primary text-black"
                      : "bg-secondary text-[#b7c4ba]"
                  } 
                  ${
                    idx !== presetAmounts.length - 1
                      ? "border-r border-[#444]"
                      : ""
                  } 
                  ${idx === 0 ? "rounded-l-md" : ""} 
                  ${idx === presetAmounts.length - 1 ? "rounded-r-md" : ""}`}
              >
                +{val}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <input
            type="number"
            min={WALLET_LIMITS.withdrawal.min}
            max={WALLET_LIMITS.withdrawal.max}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-secondary text-[#b7c4ba] border border-[#444] outline-none mb-2 text-sm"
          />

          {/* Max Note */}
          <p className="text-xs text-[#b7c4ba] mb-4 font-normal">
            Withdrawable: KES {withdrawableBalance.toLocaleString()}. Allowed
            range: KES {WALLET_LIMITS.withdrawal.min.toLocaleString()}–{WALLET_LIMITS.withdrawal.max.toLocaleString()}.
            Bonus funds can only be used to bet.
          </p>

          {/* Deposit Button */}
          <button
            onClick={() => handleWithdraw()}
            disabled={isWithdrawing}
            className="w-full bg-primary text-black font-bold py-3 rounded-lg text-[15px] hover:brightness-105 transition mb-6"
          >
            {isWithdrawing ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}
