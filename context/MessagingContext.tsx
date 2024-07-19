// @/context/MessagingContext.tsx

import { createContext, useContext, ReactNode } from "react";

interface MessagingContextType {
  messages: {};
}

const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined
);

export const MessagingProvider = ({
  children,
  messages,
}: {
  children: ReactNode;
  messages: {};
}) => {
  return (
    <MessagingContext.Provider value={{ messages }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
};
