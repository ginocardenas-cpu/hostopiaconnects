import { Suspense } from "react";
import { LibraryClient } from "@/components/LibraryClient";

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
          <p className="text-gray-500 font-body">Loading library…</p>
        </div>
      }
    >
      <LibraryClient />
    </Suspense>
  );
}
