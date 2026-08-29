const PENDING_DEPOSIT_KEY = "shilingibet:pending-deposit-balance";
export const VIRTUAL_WALLET_REFRESH_EVENT = "shilingibet:virtual-wallet-refresh";

export function markDepositPending(currentBalance) {
  const balance = Number(currentBalance);
  sessionStorage.setItem(PENDING_DEPOSIT_KEY, JSON.stringify({
    balance: Number.isFinite(balance) ? balance : null,
    createdAt: Date.now(),
  }));
}

export function clearPendingDeposit() {
  sessionStorage.removeItem(PENDING_DEPOSIT_KEY);
}

export function notifyVirtualWalletRefresh() {
  clearPendingDeposit();
  window.dispatchEvent(new CustomEvent(VIRTUAL_WALLET_REFRESH_EVENT, {
    detail: { source: "deposit", at: Date.now() },
  }));
}

export function notifyIfDepositCredited(currentBalance) {
  let pending;
  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING_DEPOSIT_KEY) || "null");
  } catch {
    clearPendingDeposit();
    return;
  }
  if (!pending) return;

  // Do not leave an abandoned payment attempt armed indefinitely.
  if (Date.now() - Number(pending.createdAt || 0) > 15 * 60 * 1000) {
    clearPendingDeposit();
    return;
  }

  const nextBalance = Number(currentBalance);
  const previousBalance = Number(pending.balance);
  if (pending.balance === null && Number.isFinite(nextBalance)) {
    sessionStorage.setItem(PENDING_DEPOSIT_KEY, JSON.stringify({
      ...pending,
      balance: nextBalance,
    }));
    return;
  }
  if (Number.isFinite(nextBalance) && Number.isFinite(previousBalance) && nextBalance > previousBalance) {
    notifyVirtualWalletRefresh();
  }
}
