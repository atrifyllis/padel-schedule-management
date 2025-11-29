export default function BookingsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="h-4 w-full max-w-xl rounded-lg bg-slate-200" />
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div key={item} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
