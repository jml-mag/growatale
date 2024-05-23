"use client";
import { useState } from "react";
import Link from "next/link";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";
import Image from "next/image";
import defaultBackground from "@/public/home-bg.webp";
import logo from "@/public/logo.png";

Amplify.configure(outputs);

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  return (
    <div className="text-center">
      <div className="w-screen h-screen fixed -z-30">
        <Image
          src={defaultBackground}
          alt="Welcome to Grow a Tale"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <div className="w-full">
        <Image className="pt-12 mx-auto sm:ml-12 md:ml-32" src={logo} alt="Grow A Tale logo" />
      </div>
      <main>
        <div className="text-center text-blue-100 text-5xl font-extrabold px-7 py-4 mt-6 border-2 border-blue-100 rounded-3xl bg-blue-900 bg-opacity-70 inline-block">
          <Link href="/play">Play</Link>
        </div>
      </main>
    </div>
  );
}
