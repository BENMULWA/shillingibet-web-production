import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "../utils/FetchApi";
import { WALLET_LIMITS } from "../utils/walletLimits";

const toLimits = (data) => ({
  deposit: { ...WALLET_LIMITS.deposit, ...data?.deposit },
  withdrawal: { ...WALLET_LIMITS.withdrawal, ...data?.withdrawal },
});

export function useWalletLimits() {
  const { data } = useQuery({
    queryKey: ["wallet-limits"],
    queryFn: async () => toLimits((await fetchAPI("transactions/limits")).data),
    staleTime: 10 * 60 * 1000,
  });
  return data || WALLET_LIMITS;
}
