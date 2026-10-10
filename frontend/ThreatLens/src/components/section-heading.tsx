type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-5 text-base leading-7 text-slate-400">{description}</p> : null}
    </div>
  );
}
