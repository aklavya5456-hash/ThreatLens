type FeatureCardProps = {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export function FeatureCard({ number, title, description, icon }: FeatureCardProps) {
  return (
    <article className="group rounded-2xl border border-[#252C40] bg-[#111522] p-6 transition-colors duration-200 hover:border-violet-300/40 hover:bg-[#141a2a]">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-10 place-items-center rounded-xl border border-[#303953] bg-[#171827] text-violet-300">{icon}</span>
        <span className="font-mono text-xs text-slate-600">{number}</span>
      </div>
      <h3 className="mt-6 text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}
