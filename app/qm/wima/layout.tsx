import { Suspense } from "react";

export default function WiMaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <Suspense>{children}</Suspense>
    </div>
  );
}
