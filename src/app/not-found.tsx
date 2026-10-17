import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 text-2xl font-semibold">We couldn’t find that page</h1>
        <p className="mt-2 text-slate-500">The link may be wrong, or the complaint isn’t available to your account.</p>
        <Link href="/" className="btn-primary mt-6">Go to home</Link>
      </div>
    </main>
  );
}
