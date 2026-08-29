import { fetchAPI } from "../utils/FetchApi";
import { getDeviceId } from "../utils/device";
import BaseClass from "./BaseClass";

const API_URL = import.meta.env.DEV ? "/api/v1" : import.meta.env.VITE_API_URL;

const moneyValue = (value, fallback = 0) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : fallback;
};

const normalizeWallet = (user = {}) => {
  const wallet = user?.wallet ?? {};
  const totalBalance = moneyValue(wallet.totalBalance ?? user.balance);
  const bonusBalance = moneyValue(
    wallet.bonusBalance ?? user.bonusBalance,
    0
  );
  const withdrawableBalance = moneyValue(
    wallet.withdrawableBalance,
    Math.max(0, totalBalance - bonusBalance)
  );

  return {
    totalBalance,
    bonusBalance,
    withdrawableBalance,
    currency: wallet.currency ?? "KES",
  };
};

export class PaymentService extends BaseClass {
  constructor() {
    super();
  }
  async depositCash({ amount }) {
    try {
      return await fetchAPI(
        "transactions/deposit",
        "POST",
        { amount: +amount, ...(this.phone ? { phone: this.phone } : {}) },
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
  async updateBalance() {
    try {
      const response = await fetchAPI("users/me", "GET", null, this.token);
      // GET /users/me returns the authenticated user at data.data. Read this
      // path before considering legacy response shapes so balance is not lost.
      const user =
        response?.data?.data ??
        response?.data?.user ??
        response?.data ??
        response;
      const wallet = normalizeWallet(user);

      return {
        ...user,
        wallet,
        // Keep the existing UI working while it is migrated to the explicit
        // total, bonus, and withdrawable wallet fields.
        balance: wallet.totalBalance,
        totalBalance: wallet.totalBalance,
        bonusBalance: wallet.bonusBalance,
        withdrawableBalance: wallet.withdrawableBalance,
        referralBonus:
          user?.referral?.bonusEarned ?? user?.referralBonus ?? 0,
        referralsCount:
          user?.referral?.referredUsersCount ?? user?.referralsCount ?? 0,
        referralCode:
          user?.referral?.code ?? user?.referralCode ?? null,
      };
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
  async withdrawCash({ withdrawAmount }) {
    try {
      return await fetchAPI(
        "transactions/withdraw",
        "POST",
        {
          amount: +withdrawAmount,
          ...(this.phone ? { phone: this.phone } : {}),
        },
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
  async transactionHistory(page = 1, limit = 20) {
    try {
      return await fetchAPI(
        `transactions?page=${page}&limit=${limit}`,
        "GET",
        null,
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
  async betHistory(page = 1, limit = 20) {
    try {
      return await fetchAPI(
        `bets/history?page=${page}&limit=${limit}`,
        "GET",
        null,
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
  async getTransactionStatus(uniqueID) {
    try {
      return await fetchAPI(
        `transactions/${uniqueID}`,
        "GET",
        null,
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  } // Get withdrawal transaction status
  async getWithdrawalTransactionStatus(uniqueID) {
    const response = await fetchAPI(
      `transactions/${uniqueID}`,
      "GET",
      null,
      this.token
    );

    if (response?.status === 409) {
      throw new Error("Too many withdrawal requests. Please try later.");
    }

    return response;
  }
  async createPaymentKey() {
    try {
      return await fetchAPI("wallet/createIssueKey", "POST", null, this.token);
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async withdrawCrypto({ address, amount }) {
    const payload = { depositAddress: address, amount: +amount };
    try {
      return await fetchAPI(
        "wallet/withdraw/secure/crypto",
        "POST",
        payload,
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async depositFusion({ amount, email, currency, comment, description, external_ref }) {
    const payload = {
      amount: +amount,
      email,
      ...(currency ? { currency } : {}),
      ...(comment ? { comment } : {}),
      ...(description ? { description } : {}),
      ...(external_ref ? { external_ref } : {}),
    };

    try {
      return await fetchAPI(
        "wallet/billOrder",
        "POST",
        payload,
        this.token
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async updateCryptoWalletBalance(updateBalanceData) {
    try {
      const { transactionId } = updateBalanceData?.updateBalanceData || updateBalanceData || {};

      if (!transactionId) {
        throw new Error("Transaction ID is required");
      }

      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      if (this.token) {
        headers.append("Authorization", `Bearer ${this.token}`);
      }
      const deviceId = getDeviceId();
      if (deviceId) {
        headers.append("X-Device-ID", deviceId);
      }

      const payload = JSON.stringify({
        txId: transactionId,
      });

      const response = await fetch(
        `${API_URL}/wallet/crypto/deposit`,
        {
          method: "POST",
          headers: headers,
          body: payload,
          redirect: "follow",
        }
      );

      const data = await response.json();

      // Handle different response scenarios
      if (response.status === 400 && data.error === "Transaction ID already used") {
        // Transaction already processed - return success with existing data
        return {
          status: "confirmed",
          confirmedAmount: data.confirmedAmount,
          rewardKes: data.rewardKes,
          confirmedAt: data.confirmedAt,
          alreadyUsed: true,
        };
      }

      if (data.status === "waiting_confirmation") {
        // Transaction not found yet - return waiting status
        return {
          status: "waiting_confirmation",
          message: data.message || "No matching deposit found yet. Please try again later.",
        };
      }

      if (data.status === "confirmed") {
        // Transaction confirmed successfully
        return {
          status: "confirmed",
          confirmedAmount: data.confirmedAmount,
          rewardKes: data.rewardKes,
          confirmedAt: data.confirmedAt,
        };
      }

      // If we get here, something unexpected happened
      throw new Error(data.error || data.message || "Failed to process crypto deposit");
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
}
