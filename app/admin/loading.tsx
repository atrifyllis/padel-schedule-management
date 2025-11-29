export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-52 rounded-lg bg-slate-200" />
      <div className="h-4 w-full max-w-xl rounded-lg bg-slate-200" />
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="h-[520px] rounded-2xl border border-slate-200 bg-white shadow-sm" />
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="h-10 w-full rounded bg-slate-100" />
          <div className="h-10 w-full rounded bg-slate-100" />
          <div className="h-10 w-full rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
