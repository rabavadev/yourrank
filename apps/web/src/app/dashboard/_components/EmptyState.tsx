import { Card } from "./Card";

interface EmptyStateProps {
  title?: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title = "Nothing here yet", description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-line bg-surface-soft">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
