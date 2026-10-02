import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import BaseClass from "../services/BaseClass";
import { useUpdateBalance } from "../hooks/usePayment";
import { useLogOut } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { RiMenuUnfold3Line, RiMenuFold3Line } from "react-icons/ri";
import {
  FiSearch, FiChevronDown,
  FiUser, FiClock, FiLogOut, FiDollarSign
} from "react-icons/fi";
// import { FaWhatsapp } from "react-icons/fa";
import { BsChatRightText } from "react-icons/bs";

export default function Navbar({
  collapsed,
  setCollapsed,
  isMobile,
  onMenuClick,
}) {
  const base = new BaseClass();
  const isAuth = base.isAuthenticated();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch live balance only when logged in
  const { balance } = useUpdateBalance();
  const { logOutFn } = useLogOut();

  const totalBalance =
    isAuth && balance?.totalBalance != null
      ? Number(balance.totalBalance).toFixed(2)
      : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logOutFn(null, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        navigate("/");
      },
      onError: () => {
        base.clearUser();
        navigate("/");
      },
    });
    setDropdownOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className="w-full h-16 bg-accent text-white px-2 md:px-4 flex items-center justify-between sticky top-0 z-50 border-b border-white/10 shadow-[0_8px_28px_rgba(0,200,83,0.22)]"
    >
      {/* ── Left Section ── */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Desktop: collapse sidebar toggle */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed?.((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1 rounded hover:bg-white/5 transition-colors"
          >
            {collapsed ? <RiMenuUnfold3Line size={30} /> : <RiMenuFold3Line size={30} />}
          </button>
        )}

        {/* Mobile: open sidebar drawer */}
        {isMobile && (
          <button
            onClick={() => onMenuClick?.()}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white"
            aria-label="Open menu"
          >
            <RiMenuUnfold3Line size={28} />
          </button>
        )}

        <Link to="/" className="flex items-center">
          <div className={`flex items-center gap-2 ${isMobile ? "mx-1" : ""}`}>
            {isMobile ? (
              <img src="/favicons.svg" alt="Logo" className="h-11 w-11 object-contain" />
            ) : (
              <img src="/shilingibet.png" alt="shilingibet" className="h-10" />
            )}
          </div>
        </Link>

        {/* Promotions — icon-only on mobile, full pill on desktop */}
        {/* <Link
          to="/promotions"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 md:px-3 py-1.5 rounded-full transition-colors border border-white/5"
          aria-label="Promotions"
        >
          <span className="animate-promo-dance">
            <HiGift className="text-[#ff4d4f]" size={20} />
          </span>
          <span className="hidden md:inline text-sm font-medium text-gray-200">Promotions</span>
        </Link> */}
      </div>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-2 md:gap-3">
        {isAuth ? (
          <>
            {/* WhatsApp Icon
            <a
              href="https://wa.me/yourphonenumber"
              target="_blank"
              className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#25D366] transition-all hover:brightness-110 active:scale-95 md:flex"
            >
              <FaWhatsapp size={18} className="text-white" />
            </a>
            */}

            {/* Search Icon */}
            <button
              onClick={() => navigate('/search')}
              aria-label="Search games"
              className="hidden md:flex w-8 h-8 items-center justify-center hover:bg-white/5 rounded-full transition-colors"
            >
              <FiSearch size={20} className="text-gray-300" />
            </button>

            {/* Balance + Deposit — always visible, like other Kenyan betting sites */}
            <Link
              to="/deposit"
              className="flex items-center overflow-hidden rounded-lg border border-black/20 bg-[#07110b] shadow-[0_0_15px_rgba(245,197,24,0.2)]"
              title="Total balance, including wager-only bonus funds. Tap to deposit."
              aria-label={`Balance KES ${totalBalance ?? "loading"}. Deposit`}
            >
              <span className="flex flex-col justify-center px-2.5 py-1 leading-none md:px-3">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">KES</span>
                <span className="text-[13px] font-extrabold text-white md:text-sm">
                  {totalBalance ?? "—"}
                </span>
              </span>
              <span className="flex h-full items-center bg-primary px-2.5 py-2.5 text-[11px] font-black uppercase text-black transition-colors hover:bg-yellow-400 md:px-4 md:text-xs">
                Deposit
              </span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative group" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
                className="hidden md:flex items-center gap-1.5 p-1 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <img src="/prof-1.png" className="h-8 w-8 rounded-full object-cover" alt="Profile" />
                <FiChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu (Simplified for brevity) */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5" onClick={() => setDropdownOpen(false)}>
                    <FiUser size={16} /> Profile
                  </Link>
                  <Link to="/history" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5" onClick={() => setDropdownOpen(false)}>
                    <FiClock size={16} /> My Bets &amp; History
                  </Link>
                  <Link to="/withdraw" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5" onClick={() => setDropdownOpen(false)}>
                    <FiDollarSign size={16} /> Withdraw
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5">
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>


            <button
              onClick={() => navigate('/support')}
              aria-label="Support"
              className="hidden lg:flex w-9 h-9 items-center justify-center bg-primary rounded-lg hover:brightness-110 transition-colors"
            >
              <BsChatRightText className="text-black" size={18} />
            </button>

          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg border border-white/30 px-3 py-2 text-xs font-extrabold uppercase text-white transition-colors hover:border-white hover:bg-white/10 md:px-4">Login</Link>
            <Link to="/register" className="rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase text-black shadow-[0_0_15px_rgba(245,197,24,0.25)] hover:bg-yellow-400 md:px-5">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}
