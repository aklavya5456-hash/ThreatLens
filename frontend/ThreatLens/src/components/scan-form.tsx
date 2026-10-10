"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidDomain, normalizeDomain } from "@/lib/scans/validation";
import { checkBackendHealth, createBackendScan, runBackendScan } from "@/lib/backend-api";

type FormErrors = {
  domain?: string;
  authorization?: string;
};

export function ScanForm() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedDomain = normalizeDomain(domain);
    const nextErrors: FormErrors = {};

    if (!normalizedDomain) {
      nextErrors.domain = "Enter a domain to continue.";
    } else if (!isValidDomain(normalizedDomain)) {
      nextErrors.domain = "Enter a valid domain, such as yourwebsite.com.";
    }

    if (!authorized) {
      nextErrors.authorization = "Confirm that you own this website or have permission to assess it.";
    }

    setErrors(nextErrors);
    setSubmissionMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    void (async () => {
      try {
        await checkBackendHealth();
        const queued = await createBackendScan(normalizedDomain);
        setSubmissionMessage(`Assessment ${queued.id} is running. Please wait…`);
        const completed = await runBackendScan(queued.id);
        router.push(`/findings?scanId=${encodeURIComponent(completed.id)}`);
      } catch (error) {
        setSubmissionMessage(error instanceof Error ? error.message : "The assessment could not be started.");
        setIsSubmitting(false);
      }
    })()
  }

  return (
    <form
      id="scan"
      className="mt-9 max-w-xl rounded-2xl border border-[#252C40] bg-[#111522] p-3 shadow-2xl shadow-black/10"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div
          className={`flex min-w-0 flex-1 items-center rounded-xl border bg-[#171827] px-4 focus-within:border-violet-300/70 ${errors.domain ? "border-red-400/70" : "border-[#303953]"}`}
        >
          <label className="sr-only" htmlFor="domain">Website domain</label>
          <span className="mr-2 text-slate-600" aria-hidden="true">https://</span>
          <input
            id="domain"
            name="domain"
            type="text"
            value={domain}
            onChange={(event) => {
              setDomain(event.target.value);
              if (errors.domain) setErrors((current) => ({ ...current, domain: undefined }));
            }}
            placeholder="yourwebsite.com"
            autoComplete="url"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
            aria-invalid={Boolean(errors.domain)}
            aria-describedby={errors.domain ? "domain-error" : undefined}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" /> : null}
          <span>{isSubmitting ? "Running security scan…" : "Start Security Scan"}</span>
        </button>
      </div>
      {errors.domain ? <p id="domain-error" className="mt-2 px-1 text-xs text-red-300" role="alert">{errors.domain}</p> : null}

      <label className={`mt-3 flex cursor-pointer items-start gap-2 px-1 text-xs leading-5 ${errors.authorization ? "text-red-300" : "text-slate-500"}`}>
        <input
          type="checkbox"
          checked={authorized}
          onChange={(event) => {
            setAuthorized(event.target.checked);
            if (errors.authorization) setErrors((current) => ({ ...current, authorization: undefined }));
          }}
          className="mt-1 size-3.5 accent-violet-500"
          aria-invalid={Boolean(errors.authorization)}
          aria-describedby={errors.authorization ? "authorization-error" : undefined}
        />
        <span>I confirm I own this website or have permission to assess it.</span>
      </label>
      {errors.authorization ? <p id="authorization-error" className="mt-1 px-1 text-xs text-red-300" role="alert">{errors.authorization}</p> : null}

      {submissionMessage ? <p className="mt-3 border-t border-[#252C40] px-1 pt-3 text-xs leading-5 text-amber-200" role="status">{submissionMessage}</p> : null}
      <p className="mt-3 border-t border-[#252C40] px-1 pt-3 text-[11px] leading-5 text-slate-600">The scan runs only after you confirm authorization. Results are generated by the connected ThreatLens backend.</p>
    </form>
  );
}
