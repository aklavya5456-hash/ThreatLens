export function ClerkPreviewNotice({ mode }: { mode: "sign-in" | "sign-up" }) {
  const action = mode === "sign-in" ? "sign in" : "create an account";

  return (
    <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Local frontend preview
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-white">
        Clerk setup is not configured
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Add the Clerk environment variables to {action}. This preview does not
        create or simulate an account.
      </p>
    </section>
  );
}
