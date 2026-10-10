import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { ClerkPreviewNotice } from "@/components/clerk-preview-notice";

export default function SignInPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="grid min-h-screen place-items-center bg-[#090b12] px-5 py-12">
      {clerkConfigured ? (
        <Suspense fallback={null}>
          <SignIn />
        </Suspense>
      ) : (
        <ClerkPreviewNotice mode="sign-in" />
      )}
    </main>
  );
}
