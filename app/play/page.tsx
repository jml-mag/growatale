"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";
import Image from "next/image";
import defaultBackground from "@/public/home-bg.webp";
import logo from "@/public/logo.png";

Amplify.configure(outputs);

export default function Home() {
  return (
    <Authenticator className="bg-none" variation="modal">
      {({ signOut, user }) => (
        <>
          <div className="w-screen h-screen fixed -z-30">
            <Image
              src={defaultBackground}
              alt="Welcome to Grow a Tale"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div className="center top-10 left-8">
            <Image src={logo} alt="Grow A Tale logo" />
          </div>
          <main className="flex min-h-screen flex-col items-center justify-between">
            <h1>Hello {user?.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </main>
        </>
      )}
    </Authenticator>
  );
}
