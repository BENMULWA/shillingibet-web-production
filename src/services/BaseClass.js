import { isUserPhoneVerified } from "../utils/verification";

class BaseClass {
  // Get the current user from localStorage
  get user() {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }

  // Get the token from user (always returns raw token without 'Bearer ' prefix)
  get token() {
    const raw = this.user?.token || null;
    // Strip 'Bearer ' prefix if the server stored it with one
    return raw ? raw.replace(/^Bearer\s+/i, "") : null;
  }

  // Get the userId
  get userId() {
    return this.user?.userId || this.user?._id || this.user?.id || null;
  }

  // Get the phone
  get phone() {
    return this.user?.phone || null;
  }

  // Phone verification follows the backend's `isActive` flag.
  isPhoneVerified() {
    return isUserPhoneVerified(this.user);
  }

  // Get the referralCode
  get referralCode() {
    return this.user?.referralCode || null;
  }
  // Get the Username
  get username() {
    return this.user?.username || null;
  }

  // Auth headers (auto-updates when token changes)
  get authHeaders() {
    return {
      Authorization: this.token ? `Bearer ${this.token}` : "",
      "Content-Type": "application/json",
    };
  }

  // Auth headers for JSON
  get authJsonHeaders() {
    return this.authHeaders;
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.token) return true;
    try {
      const payload = JSON.parse(atob(this.token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return now >= payload.exp;
    } catch {
      return true;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user && !this.isTokenExpired();
  }

  // Logout / clear user
  clearUser() {
    localStorage.removeItem("user");
  }
}

export default BaseClass;
