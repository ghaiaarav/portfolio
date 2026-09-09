import { type ReactNode } from "react";

interface McPanelProps {
  title?: string;
  children: ReactNode;
  header?: ReactNode;
}

export default function McPanel({ title, children, header }: McPanelProps) {
  return (
    <div className="mc-panel">
      {header ?? (title ? <h2 className="mc-panel__title">{title}</h2> : null)}
      {children}
    </div>
  );
}
