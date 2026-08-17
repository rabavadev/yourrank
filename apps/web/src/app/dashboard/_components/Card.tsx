interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
