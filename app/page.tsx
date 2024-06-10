"use client";
import { useState } from "react";
import Link from "next/link";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";
import Image from "next/image";
import defaultBackground from "@/public/home-bg-2.png";
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
      <main className="">
        <div className="w-full sm:w-auto sm:mr-4">
          <Image
            className="pt-12 sm:pt-0 mx-auto sm:ml-0"
            src={logo}
            alt="Grow A Tale logo"
          />
        </div>

        <div className="mt-20 sm:mt-0 sm:ml-4 text-center text-sky-300 text-3xl sm:text-4xl md:text-6xl font-extrabold px-7 py-3 sm:py-4 border-4 border-sky-500 rounded-3xl bg-stone-950 bg-opacity-80 inline-block hover:text-sky-100 hover:border-sky-300">
          <Link href="/play-2">Play</Link>
        </div>
      </main>
    </div>
  );
}
