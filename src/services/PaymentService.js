import { fetchAPI } from "../utils/FetchApi";
import BaseClass from "./BaseClass";

const API_URL = import.meta.env.VITE_API_URL;

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
      const payload = response?.data ?? response;
      return payload?.user ?? payload;
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
  async transactionHistory() {
    try {
      return await fetchAPI("transactions", "GET", null, this.token);
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

  async depositComet({ amount, email }) {
    const payload = {
      amount: +amount,
      email,
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

  async redeemBonus({ amount, type }) {
    const payload = {
      amount: +amount,
      type,
    };
    try {
      return await fetchAPI("user/redeem-bonus", "POST", payload, this.token);
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
