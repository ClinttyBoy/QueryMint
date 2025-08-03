import { createAccount } from "@/lib/biconomy";
import {
  GOLD_SKY_ENDPOINT,
  SUBSCRIPTION_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ADDRESS,
} from "@/lib/constant";
import {
  fetchChatInteractions,
  fetchUserByID,
  formatBalance,
  hashEmail,
  supabase,
} from "@/lib/utils";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { Service } from "@/types/Service";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const UserDataProviderFn = () => {
  const [userId, setUserId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [interactionCount, setInteractionCount] = useState<number>(0);
  const [NFTSubscriptionStatus, setNFTSubscriptionStatus] =
    useState<boolean>(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<number | null>(
    0
  );
  const { status, data: session } = useSession();
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const initializeSmartAccount = useCallback(async () => {
    const userEmail = session?.user?.email;
    if (userEmail) {
      const userID = hashEmail(userEmail);
      const data = await fetchUserByID(userID);

      if (!data || !data[0].id) return;
      const index = data[0].id;
      console.log("index", index);
      const smartAcc = await createAccount(index);
      setSmartAccount(smartAcc);
      setUserId(userID);
      const saAddress = await smartAcc.getAccountAddress();

      await refreshBalance();
      console.log(`userEmail: ${userEmail}`, `smrt address: ${saAddress}`);
      setAddress(saAddress);
      //   console.log(smartAcc);
    }
  }, [session]);

  const refreshBalance = useCallback(async () => {
    if (!smartAccount || !address) return;

    const balances = await smartAccount.getBalances();
    setBalance(Number(formatBalance(balances[0].amount, balances[0].decimals)));
  }, [smartAccount, address]);

  const refreshNFTSubscriptionStatus = useCallback(async () => {
    if (!smartAccount || !address) return;
    const result = await readContract(wagmiConfig, {
      abi: SUBSCRIPTION_CONTRACT_ABI,
      address: SUBSCRIPTION_CONTRACT_ADDRESS,
      functionName: "hasActiveSubscription",
      args: [address],
    });
    setNFTSubscriptionStatus(result as boolean);

    if (result === true) {
      const result = await readContract(wagmiConfig, {
        abi: SUBSCRIPTION_CONTRACT_ABI,
        address: SUBSCRIPTION_CONTRACT_ADDRESS,
        functionName: "getExpiry",
        args: [address],
      });
      setSubscriptionExpiry(Number(result));
    }
  }, [smartAccount, address]);

  const fetchServices = async () => {
    if (userId) {
      const res = await fetch(`/api/fetch-service?userId=${userId}`);
      const data = await res.json();
      console.log(data);
      setServices(data.services);
    }
  };

  const fetchbyServiceId = async (id: string) => {
    const res = await fetch(`/api/fetch-service?id=${id}`);
    const data = await res.json();

    return data;
  };

  const fetchInteractionCount = async () => {
    if (!services) return;
    const serviceIds = services.map((service) => service.id);
    const data = await fetchChatInteractions(serviceIds);
    if (data) setInteractionCount(data);
  };

  useEffect(() => {
    fetchInteractionCount();
  }, [services]);

  const  subscribeNFTFunc = async (monthCount: number) => {
    try {
      const { request } = await simulateContract(wagmiConfig, {
        abi: SUBSCRIPTION_CONTRACT_ABI,
        address: SUBSCRIPTION_CONTRACT_ADDRESS,
        functionName: "subscribe",
        args: [monthCount],
      });

      const approveResult = await writeContract(wagmiConfig, request);
      console.log(approveResult);

      const approveReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: approveResult,
      });
      console.log(approveReceipt);
      return approveReceipt;
    } catch (e) {
      console.log(e);
    }
  };

  const fetchRatings = async (serviceId: string) => {
    console.log("serviceId: " + serviceId);
    const query = `
      query MyQuery {
        serviceRateds(where: {serviceId: "${serviceId}"}) {
          rating
        }
      }
    `;

    const response = await fetch(GOLD_SKY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    // console.log(result.data.serviceRateds);
    return result.data.serviceRateds;
  };

  useEffect(() => {
    if (status === "authenticated") {
      initializeSmartAccount();
    }
  }, [status, initializeSmartAccount]);

  useEffect(() => {
    fetchUserByID(hashEmail(session?.user?.email || ""));
  }, [status]);

  useEffect(() => {
    refreshBalance();
  }, [smartAccount, status]);

  useEffect(() => {
    refreshNFTSubscriptionStatus();
  }, [smartAccount, status]);

  useEffect(() => {
    fetchServices();
  }, [userId]);

  return {
    userId,
    smartAccount,
    interactionCount,
    address,
    balance,
    refreshBalance,
    fetchServices,
    fetchbyServiceId,
    services,
    subscribeNFTFunc,
    NFTSubscriptionStatus,
    refreshNFTSubscriptionStatus,
    subscriptionExpiry,
    fetchRatings,
  };
};

type UserContextProps = ReturnType<typeof UserDataProviderFn>;

const UserContext = createContext<UserContextProps | null>(null);

interface UserProviderProps {
  children: ReactNode;
}
export const UserDataProvider = ({ children }: UserProviderProps) => {
  return (
    <UserContext.Provider value={UserDataProviderFn()}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
};
