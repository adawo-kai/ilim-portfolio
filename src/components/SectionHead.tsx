/** Shared section header: index, label and a drawn hairline. */
export default function SectionHead({ index, label, aside }: { index: string; label: string; aside?: string }) {
  return (
    <div className="px-gutter">
      <div className="label flex items-end justify-between pb-3 text-paper-dim">
        <span data-reveal="fade">
          <span className="text-accent">({index})</span> — {label}
        </span>
        {aside ? (
          <span data-reveal="fade" className="hidden text-right md:block">
            {aside}
          </span>
        ) : null}
      </div>
      <div data-reveal="rule" className="h-px w-full bg-line" />
    </div>
  );
}
