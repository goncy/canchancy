function Legend() {
  return (
    <div className="flex justify-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-blue-500" />
        <span>Morning (before 12PM)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <span>Afternoon (12-6PM)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-purple-500" />
        <span>Evening (after 6PM)</span>
      </div>
    </div>
  );
}

export default async function CourtsLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {children}

      <Legend />
    </div>
  );
}
