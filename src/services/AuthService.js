import { fetchAPI } from "../utils/FetchApi";
import BaseClass from "./BaseClass";

const normalizeAuthResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const user = payload?.user ?? payload?.profile ?? payload;
  const token =
    payload?.token ?? payload?.accessToken ?? payload?.access_token ?? null;

  return {
    ...response,
    status: response?.success ?? response?.status ?? true,
    token,
    user,
  };
};

export class AuthService extends BaseClass {
  constructor() {
    super();
  }
  async logIn({ phone, password }) {
    try {
      const response = await fetchAPI("users/login", "POST", { phone, password });
      return normalizeAuthResponse(response);
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async register({ phone, password, referralCode = "" }) {
    try {
      const response = await fetchAPI("users/register", "POST", {
        phone,
        password,
        ...(referralCode ? { referralCode } : {}),
      });
      return normalizeAuthResponse(response);
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async forgotPassword({ phone }) {
    void phone;
    throw new Error("Password recovery is not supported by the new backend.");
  }

  async resetPassword({ phone, otp, newPassword }) {
    void phone;
    void otp;
    void newPassword;
    throw new Error("Password recovery is not supported by the new backend.");
  }

  async deleteAccount({ duration }) {
    void duration;
    throw new Error("Account deletion is not supported by the new backend.");
  }

  async logOut() {
    this.clearUser();
    return { success: true, status: true, message: "Logged out" };
  }

  async activateAccount({ code, phone }) {
    void code;
    void phone;
    throw new Error("OTP activation is not required by the new backend.");
  }
  async resendActivationCode({ phone }) {
    void phone;
    throw new Error("OTP activation is not required by the new backend.");
  }
}
