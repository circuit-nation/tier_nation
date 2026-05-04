export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-3xl font-bold uppercase leading-tight tracking-wide">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-lg text-lg leading-relaxed text-[#6E6E7C]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
