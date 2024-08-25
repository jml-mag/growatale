// app/play/layout.tsx

"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { AuthProvider } from "@/context/AuthContext";
import { MessagingProvider } from "@/context/MessagingContext";
import Image from "next/image";
import playBg from "@/public/play-bg.webp";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <Authenticator variation="modal" hideSignUp={true}>
      {({ signOut = () => {}, user }) => {
        if (!user) {
          return <div>creating story</div>;
        }
        return (
          <AuthProvider signOut={signOut} user={user}>
            <MessagingProvider messages={{}}>
              <div>
                <div className="w-full h-screen fixed top-0 left-0 -z-50 opacity-25">
                  <Image
                    src={playBg}
                    alt="Play background"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                {children}
              </div>
            </MessagingProvider>
          </AuthProvider>
        );
      }}
    </Authenticator>
  );
}
