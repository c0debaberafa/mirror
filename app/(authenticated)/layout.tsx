import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  UserButton,
  RedirectToSignUp,
} from "@clerk/nextjs";
import { headers } from "next/headers";
import WaitlistHeader from "@/components/WaitlistHeader";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedIn>
        <AuthenticatedHeader />
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignUp />
      </SignedOut>
    </>
  );
}

async function AuthenticatedHeader() {
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