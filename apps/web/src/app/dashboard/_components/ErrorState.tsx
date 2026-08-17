import { Card } from "./Card";

interface ErrorStateProps {
  title?: string;
  message: string;
}

export function ErrorState({ title = "Could not load this page", message }: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <h3 className="text-sm font-semibold text-red-800">{title}</h3>
      <p className="mt-1 text-sm text-red-700">{message}</p>
    </Card>
  );
}
