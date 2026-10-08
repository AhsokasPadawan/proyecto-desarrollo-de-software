import { ReactNode } from 'react';

export interface ControlSectionProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly hasDivider?: boolean;
  readonly className?: string;
}

export function ControlSection({
  title,
  children,
  hasDivider = false,
  className = '',
}: ControlSectionProps): JSX.Element {
  const dividerClasses = hasDivider ? 'pt-2 border-t border-zinc-800' : '';

  return (
    <section className={`flex flex-col gap-2 ${dividerClasses} ${className}`.trim()}>
      <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
        {title}
      </span>
      {children}
    </section>
  );
}
