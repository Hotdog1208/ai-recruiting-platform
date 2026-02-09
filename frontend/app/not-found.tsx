import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="mt-2 text-zinc-400">Page not found</p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-teal-500 text-black font-semibold rounded-lg hover:bg-teal-400 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
