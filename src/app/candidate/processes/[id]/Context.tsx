"use client";

import { createContext, useContext } from "react";

const IsLockedContext = createContext<boolean | null>(null);
const isCertificateUnlocked = createContext<boolean>(false);

export const useIsLocked = () => {
  const context = useContext(IsLockedContext);
  if (context === null) {
    throw new Error("useIsLocked must be used within IsLockedProvider");
  }
  return context;
};

export const useIsCertificateUnlocked = () => {
  const context = useContext(isCertificateUnlocked);
  if (context === null) {
    throw new Error("useIsLocked must be used within IsLockedProvider");
  }
  return context;
};

export const IsLockedProvider = ({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) => {
  return (
    <IsLockedContext.Provider value={value}>
      {children}
    </IsLockedContext.Provider>
  );
};

export const CertificateUnlockedProvider = ({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) => {
  return (
    <isCertificateUnlocked.Provider value={value}>
      {children}
    </isCertificateUnlocked.Provider>
  );
};