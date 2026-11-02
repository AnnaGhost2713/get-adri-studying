import { Suspense } from "react";

export default function LawLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <Suspense>{children}</Suspense>
    </div>
  );
}
