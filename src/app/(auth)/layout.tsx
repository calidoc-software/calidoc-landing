export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-96 rounded-full bg-tertiary-300/20 blur-3xl" />
        <div className="absolute -top-28 right-[12%] size-72 rounded-full bg-primary-200/25 blur-3xl" />
        <div className="absolute top-[38%] -right-32 size-80 rounded-full bg-secondary-200/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] -left-20 size-72 rounded-full bg-primary-100/35 blur-3xl" />
      </div>
      {children}
    </div>
  );
}
