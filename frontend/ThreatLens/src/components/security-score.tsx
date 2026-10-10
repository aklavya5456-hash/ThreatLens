export function SecurityScore({ score = 78 }: { score?: number }) {
  const circumference = 2 * Math.PI * 43;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative grid size-44 shrink-0 place-items-center" aria-label={`Illustrative security score: ${score} out of 100`}>
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="43" fill="none" stroke="#252C40" strokeWidth="6" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#2DD4BF" strokeLinecap="round" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="text-center">
        <p className="text-4xl font-semibold tracking-[-0.06em] text-white">{score}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">out of 100</p>
      </div>
    </div>
  );
}
