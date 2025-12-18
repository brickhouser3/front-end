import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  firstName: string;
};

const DEFAULT_USER: User = {
  firstName: "Traveler",
};

const UserContext = createContext<User>(DEFAULT_USER);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Priority:
    // 1) window.APP_USER (future SSO / env injection)
    // 2) localStorage fallback
    // 3) "Traveler"
    const injectedName = (window as any)?.APP_USER?.firstName;
    const storedName = localStorage.getItem("firstName");

    const firstName =
      injectedName || storedName || DEFAULT_USER.firstName;

    setUser({ firstName });

    // Persist for session continuity
    localStorage.setItem("firstName", firstName);
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
