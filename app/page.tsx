// @/app/page.tsx

"use client";
import { Amplify } from "aws-amplify";
import Link from "next/link";
import Image from "next/image";
import "@aws-amplify/ui-react/styles.css";
import { motion } from "framer-motion";
import outputs from "@/amplify_outputs.json";
import defaultBackground from "@/public/home-bg-2.png";
import logo from "@/public/logo.png";

Amplify.configure(outputs);

const backgroundVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 2, delay: 1.0 } },
};

const buttonVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 1, delay: 3.5 } },
};

export default function Home() {
  return (
    <div className="text-center flex flex-col items-center justify-center min-h-screen">
      <motion.div
        className="w-screen h-screen fixed -z-30"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      >
        <Image
          src={defaultBackground}
          alt="Welcome to Grow a Tale"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </motion.div>
      <main className="flex flex-col items-center justify-center">
        <div className="w-full sm:w-auto sm:mr-4">
          <Image
            className="pt-12 sm:pt-0 mx-auto sm:ml-0"
            src={logo}
            alt="Grow A Tale logo"
          />
        </div>
        <motion.div
          className="sm:mt-8 text-center text-white text-3xl sm:text-4xl md:text-6xl font-extrabold px-7 py-3 sm:py-4 border-2 border-white rounded-3xl bg-stone-950 bg-opacity-60 inline-block hover:text-sky-100 hover:border-sky-300"
          initial="hidden"
          animate="visible"
          variants={buttonVariants}
        >
          <Link href="/play">Play</Link>
        </motion.div>
      </main>
    </div>
  );
}
