import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PaymentService } from "../services/PaymentService";

export function useDeposit() {
  const paymentService = new PaymentService();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    mutate: makingPayment,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: paymentService.depositCash.bind(paymentService),
    onSuccess: (res) => {
      toast.success(
        "Check your phone. When prompted, enter your M-Pesa pin on your phone to complete payment"
      ); // ✅ invalidate balance after deposit
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      const transactionId =
        res?.data?.txnID ||
        res?.data?.transactionsID ||
        res?.data?.transactionID ||
        res?.data?.transactionId ||
        res?.txnID ||
        res?.transactionsID;

      if (transactionId) {
        navigate(`/callback/${transactionId}`);
      }
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong");
    },
  });

  return { makingPayment, isLoading, error };
}

export function useWithdraw() {
  const paymentService = new PaymentService();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    mutate: withdrawingCash,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: paymentService.withdrawCash.bind(paymentService),
    onSuccess: (res) => {
      if (res.status !== "success") {
        toast.error(
          res?.data?.message ?? "Something went wrong try again later"
        );
      } else {
        // ✅ invalidate balance after withdrawal
        queryClient.invalidateQueries({ queryKey: ["user-balance"] });
        const transactionId =
          res?.data?.transactionsID ||
          res?.data?.txnID ||
          res?.data?.transactionID ||
          res?.data?.transactionId ||
          res?.transactionsID;

        if (transactionId) {
          navigate(`/withdraw/callback/${transactionId}`);
        }
        toast.success(`Withdrawal was successful`);
      }
    },
  });
  return { withdrawingCash, isLoading, error };
}
export function useUpdateBalance() {
  const paymentService = new PaymentService();
  const isAuth = paymentService.isAuthenticated();

  const { data: balance, isLoading } = useQuery({
    queryKey: ["user-balance"],
    queryFn: paymentService.updateBalance.bind(paymentService),
    enabled: isAuth,
    refetchInterval: 5000, // Refresh every 5 seconds to keep live balance updated while playing games
  });

  return { balance, isLoading };
}
export function useTransactionsHistory() {
  const paymentService = new PaymentService();
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery({
    queryFn: paymentService.transactionHistory.bind(paymentService),
    queryKey: ["transactions"],
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong fetching your history");
    },
  });

  return { transactions, isLoading, error };
}
export function useGetTransactionStatus() {
  const paymentService = new PaymentService();
  const {
    mutate: getTransactionStatusAPI,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (uniqueID) =>
      paymentService.getTransactionStatus.bind(paymentService)(uniqueID),
    onSuccess: () => {},
  });

  return { getTransactionStatusAPI, isLoading, error };
}
export function useIssueKey() {
  const paymentService = new PaymentService();
  const {
    mutate: creatingKey,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: paymentService.createPaymentKey?.bind(paymentService),
  });

  return { creatingKey, isLoading, error };
}
export default function useRedeemBonus() {
  const navigate = useNavigate();
  const paymentService = new PaymentService();
  const queryClient = useQueryClient();
  const {
    mutate: redeemingBonus,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: paymentService.redeemBonus?.bind(paymentService),
    onSuccess: (res) => {
      if (res.status !== true) {
        toast.error(
          res?.data?.message ?? "Something went wrong try again later"
        );
      } else {
        // ✅ Invalidate balance query after success
        queryClient.invalidateQueries({ queryKey: ["user-balance"] });
        navigate("/profile");
        toast.success(res?.data?.message ?? "Bonus redeemed successfully");
      }
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong");
    },
  });

  return { redeemingBonus, isLoading, error };
}

export function useWithdrawCrypto() {
  const paymentService = new PaymentService();
  const queryClient = useQueryClient();

  const {
    mutate: withdrawCrypto,
    isPending: isLoading,
    data,
    reset,
  } = useMutation({
    mutationFn: paymentService.withdrawCrypto.bind(paymentService),
    onSuccess: (res) => {
      if (res?.status === "complete") {
        queryClient.invalidateQueries({ queryKey: ["user-balance"] });
        toast.success(res?.message || "Crypto withdrawal initiated successfully");
      } else if (res?.status === "failed") {
        toast.error(res?.message || "Withdrawal failed");
      }
    },
    onError: (err) => {
      toast.error(err?.message || "Something went wrong");
    },
  });

  return { withdrawCrypto, isLoading, data, reset };
}

export function useCometDeposit() {
  const paymentService = new PaymentService();
  const queryClient = useQueryClient();

  const {
    mutate: depositViaComet,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: paymentService.depositComet.bind(paymentService),
    onSuccess: (res) => {
      toast.success(res?.message || "Comet deposit initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
    },
    onError: (err) => {
      toast.error(err?.message || "Something went wrong");
    },
  });

  return { depositViaComet, isLoading, error };
}

export function useCryptoUpdateDeposit() {
  const paymentService = new PaymentService();
    const queryClient = useQueryClient();
  
  const {mutate: depositCrypto, isPending: isLoading, error} = useMutation({
    mutationFn: paymentService.updateCryptoWalletBalance?.bind(paymentService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      // window.location.reload();
    }
  })

  return {depositCrypto, isLoading, error};
}
