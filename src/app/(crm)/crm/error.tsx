"use client";

export default function CrmError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-lg bg-white p-6">
      <h1 className="text-xl font-semibold text-[#C9002B]">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
      <button type="button" className="mt-4 font-semibold text-[#004B93] underline" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
