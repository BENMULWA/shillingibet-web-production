import { tenantId } from "../utils/configs";
import { fetchAPI } from "../utils/FetchApi";
import BaseClass from "./BaseClass";

export class AuthService extends BaseClass {
  constructor() {
    super();
  }
  async logIn({ phone, password, turnstileToken }) {
    try {
      return await fetchAPI("user/login", "POST", {
        phone,
        password,
        tenantId,
        turnstileToken,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async register({ phone, password, referralCode = "" }) {
    try {
      return await fetchAPI("user/create-account", "POST", {
        phone,
        password,
        tenantId,
        referralCode,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async forgotPassword({ phone }) {
    try {
      return await fetchAPI("user/forgot-password", "POST", {
        phone,
        tenantId,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async resetPassword({ phone, otp, newPassword }) {
    try {
      return await fetchAPI("user/reset-password", "POST", {
        phone,
        otp,
        newPassword,
        tenantId,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async deleteAccount({ duration }) {
    try {
      return await fetchAPI(
        `user/delete-account?duration=${duration}`,
        "DELETE",
        tenantId
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async logOut() {
    try {
      if (!this.token) {
        throw new Error("Something went wrong");
      }

      return await fetchAPI("user/logOut", "POST", tenantId, this.token);
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async activateAccount({ code, phone }) {
    try {
      return await fetchAPI("user/activate-account", "POST", {
        code,
        phone,
        tenantId,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
  async resendActivationCode({ phone }) {
    try {
      return await fetchAPI("user/resend-otp", "POST", {
        phone,
        tenantId,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
}
