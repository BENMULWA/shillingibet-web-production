// Shared processing/success/failed card for crypto deposit flows
// (TRC20 manual submit and MiniPay/Celo instant pay use the same states).
export default function CryptoStatusCard({ view, resultMessage, onReset }) {
  return (
    <div className="w-full max-w-sm mx-auto bg-secondary rounded-2xl overflow-hidden">
      <div className="pt-10 pb-8 px-6 flex flex-col items-center">
        <div
          className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            view === "success"
              ? "bg-green-500/15"
              : view === "failed"
              ? "bg-red-500/15"
              : "bg-primary/10"
          }`}
        >
          {(view === "processing" || view === "waiting") && (
            <svg
              className="w-10 h-10 text-primary animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {view === "success" && (
            <svg
              className="w-10 h-10 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  strokeDasharray: 63,
                  strokeDashoffset: 63,
                  animation: "draw-circle 0.5s ease-out forwards",
                }}
              />
              <path
                d="M8 12l3 3 5-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 20,
                  strokeDashoffset: 20,
                  animation: "draw-check 0.4s ease-out 0.4s forwards",
                }}
              />
            </svg>
          )}
          {view === "failed" && (
            <svg
              className="w-10 h-10 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  strokeDasharray: 63,
                  strokeDashoffset: 63,
                  animation: "draw-circle 0.5s ease-out forwards",
                }}
              />
              <path
                d="M15 9L9 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 10,
                  strokeDashoffset: 10,
                  animation: "draw-x 0.3s ease-out 0.4s forwards",
                }}
              />
              <path
                d="M9 9L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 10,
                  strokeDashoffset: 10,
                  animation: "draw-x 0.3s ease-out 0.5s forwards",
                }}
              />
            </svg>
          )}
        </div>
        <h2
          className={`text-xl font-bold mb-2 ${
            view === "success"
              ? "text-green-500"
              : view === "failed"
              ? "text-red-500"
              : "text-primary"
          }`}
        >
          {view === "processing" && "Processing..."}
          {view === "waiting" && "Verifying..."}
          {view === "success" && "Deposit Successful!"}
          {view === "failed" && "Deposit Failed"}
        </h2>
        <p className="text-[#9cae9f] text-center text-sm leading-relaxed max-w-[280px]">
          {view === "processing" &&
            "Please wait while we confirm your payment. This may take a few moments."}
          {view === "waiting" &&
            (resultMessage ||
              "We're verifying your transaction on the blockchain. This usually takes 5-10 minutes.")}
          {view === "success" &&
            (resultMessage || "Your funds have been added to your account successfully.")}
          {view === "failed" &&
            (resultMessage ||
              "We couldn't process your deposit. Please try again or contact support.")}
        </p>
      </div>
      <div className="px-6 pb-6">
        {(view === "processing" || view === "waiting") && (
          <div className="bg-background/30 rounded-lg p-3 mb-4">
            <p className="text-[#75877a] text-xs leading-relaxed text-center">
              Please don&apos;t close this page. Your payment is being verified on
              the blockchain.
            </p>
          </div>
        )}
        {(view === "success" || view === "failed" || view === "waiting") && (
          <button
            type="button"
            onClick={onReset}
            className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
              view === "success"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-primary hover:bg-primary/90 text-black"
            }`}
          >
            {view === "success" ? "Continue" : view === "waiting" ? "Back" : "Try Again"}
          </button>
        )}
      </div>
    </div>
  );
}
