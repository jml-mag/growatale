import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  signOut: () => void;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  signOut,
  user,
}: {
  children: ReactNode;
  signOut: () => void;
  user: any;
}) => {
  return (
    <AuthContext.Provider value={{ signOut, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
