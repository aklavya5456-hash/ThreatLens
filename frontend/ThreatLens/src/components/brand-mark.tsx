type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="ThreatLens home">
      <span className="relative grid size-8 place-items-center rounded-[10px] border border-violet-300/30 bg-violet-400/10 text-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
        <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3.2 19 6v5.1c0 4.6-2.6 7.8-7 9.7-4.4-1.9-7-5.1-7-9.7V6l7-2.8Z" />
          <circle cx="11.2" cy="11.2" r="2.7" />
          <path d="m13.2 13.2 2.4 2.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className={compact ? "sr-only" : "text-[15px] font-semibold tracking-[-0.02em] text-white"}>
        Threat<span className="text-violet-300">Lens</span>
      </span>
    </span>
  );
}
