"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";
import { AuthProvider } from "@/context/AuthContext";
//import { User } from "@/context/AuthContext"; // Ensure you import the correct User type from your context

Amplify.configure(outputs);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Authenticator variation="modal" hideSignUp={true}>
      {({ signOut = () => {}, user }) => {
        if (!user) {
          return <div>Loading...</div>;
        }

        return (
          <AuthProvider signOut={signOut} user={user}>
            {children}
          </AuthProvider>
        );
      }}
    </Authenticator>
  );
}
