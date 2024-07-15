"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";
import { AuthProvider } from "@/context/AuthContext";

Amplify.configure(outputs);

/**
 * Layout component that wraps its children with authentication logic.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The children components to render within the layout.
 * @returns {JSX.Element} The layout component with authentication.
 */
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <Authenticator variation="modal">
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
