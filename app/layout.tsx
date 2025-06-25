import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  RedirectToSignUp,
} from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { headers } from "next/headers";
import WaitlistHeader from "@/components/WaitlistHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fred",
  description: "Your AI Reflection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased`}>
          <SignedIn>
            <OnboardingHeader />
          </SignedIn>
          <SignedIn>{children}</SignedIn>
          <SignedOut>
            <RedirectToSignUp />
          </SignedOut>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

async function OnboardingHeader() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Only hide header for onboarding route
  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <header className="p-4 border-b bg-white/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <Image src="/assets/images/logo.png" alt="Fred Logo" width={200} height={80} className="object-contain" />
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <WaitlistHeader />
          <div className="flex items-center justify-center scale-125 md:scale-150">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
