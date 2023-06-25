import { Subscription, UserDetails } from "@/types";
import { User } from "@supabase/auth-helpers-nextjs";
import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
    accessToken: string | null;
    user: User | null;
    userDetails: UserDetails | null;
    isLoading: boolean;
    subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export interface Props {
    [propName: string]: any;
}

// Using these details acroess all the components to check user authentication and subscription.
export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Getting the details from the table, Selection of all the relation, even with the one with foreignKey!
  const getUserDetails = () => supabase.from("users").select("*").single();
  const getSubscription = () =>
    supabase
      .from("subscription")
      .select("*, prices(*, products(*))")
      .in("status", ["trailing", "active"])
      .single();

  // Updating all the states with supabase returned values.
  useEffect(() => {

    // If the userLoggedIn, no user and subscription details
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);

      // Creates a Promise that is resolved with an array of results when all of the provided Promises resolve or reject.
      Promise.allSettled([getUserDetails(), getSubscription()]).then((results) => {
        const userDetailsPromise = results[0];
        const subscriptionPromise = results[1];

        if(userDetailsPromise.status === "fulfilled") {
            setUserDetails(userDetailsPromise.value.data as UserDetails);
        }

        if (subscriptionPromise.status === "fulfilled") {
          setSubscription(subscriptionPromise.value.data as Subscription);
        }
      })

      setIsLoadingData(false);
    } else if (!user && !isLoadingData && !userDetails && !subscription) {
        setUserDetails(null);
        setSubscription(null);
    }
  }, [user, isLoadingData]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription
  };

  return <UserContext.Provider value={value} {...props} />
};

export const useUser = () => {
    const context = useContext(UserContext); 
    if(context === undefined) {
        throw new Error("useUser must be used within a MyUserContextProvider")
    }

    return context;
}