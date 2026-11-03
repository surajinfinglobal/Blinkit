export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-space-lg flex flex-col justify-between gap-space-md xl:flex-row xl:items-center">
      <div>
        <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">{eyebrow}</span>
        <h1 className="mt-1 font-headline-lg text-headline-lg tracking-tight text-on-surface">{title}</h1>
        {description && <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
