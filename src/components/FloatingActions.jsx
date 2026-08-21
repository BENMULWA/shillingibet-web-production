import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaXmark } from "react-icons/fa6";

export default function FloatingActions() {
  const [showDeposit, setShowDeposit] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const mobileHomeVisibility = isHomePage ? "block md:block" : "hidden md:block";

  return (
    <>
      {/*
      <div className="pointer-events-none fixed left-3 top-[38%] z-40 hidden -translate-y-1/2 flex-col gap-4 md:flex">
        {!isAuth && (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="floating-action floating-action-left pointer-events-auto"
            aria-label="Sign in"
          >
            <span className="floating-action-icon bg-primary text-black">
              <FaRightToBracket />
            </span>
            <span className="floating-action-label">Sign In</span>
          </button>
        )}
      </div>
      */}

      {showDeposit && (
        <div
          className={`pointer-events-none fixed left-4 bottom-24 z-40 ${mobileHomeVisibility}`}
        >
          <button
            type="button"
            onClick={() => setShowDeposit(false)}
            className="floating-support-close floating-deposit-close pointer-events-auto"
            aria-label="Hide deposit shortcut"
          >
            <FaXmark />
          </button>
          <button
            type="button"
            onClick={() => navigate("/deposit")}
            className="floating-deposit pointer-events-auto"
            aria-label="Open deposit"
          >
            <img
              src="/icons/pngwing.com%20(27).png"
              alt=""
              className="floating-deposit-image"
            />
          </button>
        </div>
      )}

    </>
  );
}
