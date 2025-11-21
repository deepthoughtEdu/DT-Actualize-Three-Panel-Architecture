// "use client";

// import { createContext, useContext } from "react";

// const IsLockedContext = createContext<boolean | null>(null);
// const isCertificateUnlocked = createContext<boolean>(false);

// export const useIsLocked = () => {
//   const context = useContext(IsLockedContext);
//   if (context === null) {
//     throw new Error("useIsLocked must be used within IsLockedProvider");
//   }
//   return context;
// };

// export const useIsCertificateUnlocked = () => {
//   const context = useContext(isCertificateUnlocked);
//   if (context === null) {
//     throw new Error("useIsLocked must be used within IsLockedProvider");
//   }
//   return context;
// };

// export const IsLockedProvider = ({
//   value,
//   children,
// }: {
//   value: boolean;
//   children: React.ReactNode;
// }) => {
//   return (
//     <IsLockedContext.Provider value={value}>
//       {children}
//     </IsLockedContext.Provider>
//   );
// };

// export const CertificateUnlockedProvider = ({
//   value,
//   children,
// }: {
//   value: boolean;
//   children: React.ReactNode;
// }) => {
//   return (
//     <isCertificateUnlocked.Provider value={value}>
//       {children}
//     </isCertificateUnlocked.Provider>
//   );
// };

"use client";

import { createContext, useContext } from "react";

// Context for general locked state
const IsLockedContext = createContext<boolean | null>(null);

// Context for WhatsApp group link unlock state and URL
interface WhatsAppGroupContext {
  isUnlocked: boolean;
  groupLink: string | null;
}

const WhatsAppGroupContext = createContext<WhatsAppGroupContext | null>(null);

// Hook for locked state
export const useIsLocked = () => {
  const context = useContext(IsLockedContext);
  if (context === null) {
    throw new Error("useIsLocked must be used within IsLockedProvider");
  }
  return context;
};

// Hook for WhatsApp group access
export const useWhatsAppGroup = () => {
  const context = useContext(WhatsAppGroupContext);
  if (context === null) {
    throw new Error(
      "useWhatsAppGroup must be used within WhatsAppGroupProvider"
    );
  }
  return context;
};

// Provider for locked state
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

// Provider for WhatsApp group link
export const WhatsAppGroupProvider = ({
  isUnlocked,
  groupLink,
  children,
}: {
  isUnlocked: boolean;
  groupLink: string | null;
  children: React.ReactNode;
}) => {
  return (
    <WhatsAppGroupContext.Provider value={{ isUnlocked, groupLink }}>
      {children}
    </WhatsAppGroupContext.Provider>
  );
};
