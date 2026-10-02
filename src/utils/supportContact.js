import { getStoredUser } from "./authStorage";

// Single source of truth for customer-support contact details.
export const SUPPORT_PHONE_DISPLAY = "0714 073 826";
export const SUPPORT_PHONE_TEL = "tel:+254714073826";

const WHATSAPP_NUMBER = "254714073826";

// 254712345678 / +254712345678 / 0712345678 -> "0712 345 678"
const formatKenyanPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  const local = digits.startsWith("254") ? `0${digits.slice(3)}` : digits;
  if (!/^0\d{9}$/.test(local)) return null;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
};

// Pre-filled WhatsApp message laid out as a short form, so every chat reaches
// support with the account and the details needed to look the issue up.
const buildSupportMessage = () => {
  let accountPhone = null;
  try {
    accountPhone = formatKenyanPhone(getStoredUser()?.phone);
  } catch {
    // storage unavailable — the player types their number instead
  }

  return [
    "*ShilingiBet Support Request*",
    "",
    `*Account phone:* ${accountPhone || "(the number you registered with)"}`,
    "*Name the Issue:* Deposit / Withdrawal / Login / Game / Bonus / Other",
    "*M-Pesa code (Withdrawal or Deposit error!):* ",
    "*Amount (KES):* ",
    "*Date & time it happened:* ",
    "",
    "*Describe the problem HERE:* ",
  ].join("\n");
};

// Built on demand so it always reflects who is currently logged in.
export const buildSupportWhatsAppUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildSupportMessage())}`;
