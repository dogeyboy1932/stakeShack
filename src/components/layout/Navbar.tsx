"use client";

import Link from "next/link";

import { Home } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "next/navigation";


import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";


export function Navbar() {
  const { setID, profile } = useProfile()
  const router = useRouter()

  const handleClick = () => {
    router.push("/profile")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
      <div className="container flex h-14 items-center justify-between mx-4">
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/">Browse</Link>
          <Link href="/tenant">Your Apartments</Link>
          <Link href="/lessor">Your Listings</Link>
          <Link href="/users">Community</Link>
          {/* <Link href="/profile">Profile</Link> */}
          {/* <Link href="/escrow">Escrow</Link> */}
        </nav>


        <div className="flex items-center space-x-2">    {/* FOR DEMO PURPOSES */}
          <span className="text-sm text-gray-600">Account:</span>
          <select 
            onChange={(e) => setID(parseInt(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="1"
          >
            <option value="1">Account 1</option>
            <option value="2">Account 2</option>
            <option value="3">Account 3</option>
            <option value="4">Account 4</option>
          </select>
        </div>


        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900 bg-sky-100 px-3 py-1 rounded-lg cursor-pointer" onClick={handleClick}>
            {profile?.username ? `@${profile.username}` : 'Loading...'}
          </span> 
        </div>


        {/* <div className="flex flex-1 items-center justify-end space-x-4">
          <WalletMultiButton/>
        </div> */}
      </div>
    </header>
  );
} 