import { useQuery } from "@tanstack/react-query";

// Preview-only rate for the MiniPay deposit form so the user can see roughly
// how much USDT they're about to send. The backend recomputes the real KES
// credit from the amount actually confirmed on-chain, so drift here is
// cosmetic, not a balance-safety issue.
async function fetchUsdKesRate() {
  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) throw new Error("Rate lookup failed");
  const data = await response.json();
  const rate = data?.rates?.KES;
  if (!rate) throw new Error("KES rate unavailable");
  return rate;
}

export function useUsdKesRate() {
  const { data: kesPerUsd, isLoading } = useQuery({
    queryKey: ["usd-kes-rate"],
    queryFn: fetchUsdKesRate,
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
  });

  return { kesPerUsd, isLoading };
}
