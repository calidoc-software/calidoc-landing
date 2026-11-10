export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-36 -left-28 size-[26rem] rounded-full bg-tertiary-400/22 blur-[90px]" />
        <div className="absolute top-1/3 -right-36 size-[26rem] rounded-full bg-secondary-300/22 blur-[90px]" />
        <div className="absolute -bottom-36 left-[10%] size-[24rem] rounded-full bg-tertiary-300/18 blur-[90px]" />
      </div>
      {children}
    </div>
  );
}
