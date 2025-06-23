"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Home } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mx-4 flex items-center">
          {/* <Link href="/" className="mr-6 flex items-center space-x-2">
            <Home className="h-6 w-6" />
            <span className="font-bold">Rent/Stake</span>
            Rent/Stake
          </Link> */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="mr-6 flex items-center space-x-2">Rent/Stake</Link>
            <Link href="/tenant">Your Apartments</Link>
            <Link href="/lessor">Lessor Mode</Link>
            <Link href="/profile">Profile</Link>
          </nav>
        </div>
        {/* <div className="flex flex-1 items-center justify-end space-x-4">
          <WalletMultiButton />
        </div> */}
      </div>
    </header>
  );
} 