import Link from "next/link";
import AuthNav from "@/app/components/AuthNav";

const navItems = ["Home", "How it works", "Pricing"];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto max-w-6xl px-6 pt-6">
        <nav className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-5 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-md shadow-cyan-500/30">
              J
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              JobPilot AI
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            {navItems.map((item) => (
              <a key={item} href="#" className="transition hover:text-slate-900">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <AuthNav />
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
            >
              Analyze my CV
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-14 sm:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Career acceleration
            </span>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              Land your next job with AI
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Analyze your CV against a job description and get personalized
              recommendations for your application.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95"
              >
                Analyze my CV
              </Link>
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Try for free
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-slate-500">
              <div>
                <span className="block text-2xl font-bold text-slate-900">92%</span>
                <span>CV match insights</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">4x</span>
                <span>faster prep</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">1 click</span>
                <span>application polish</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-cyan-200/60 blur-3xl" />
            <div className="absolute -right-6 bottom-12 h-32 w-32 rounded-full bg-blue-200/60 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
              <div className="rounded-[1.5rem] bg-slate-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      CV fit score
                    </p>
                    <p className="mt-2 text-4xl font-semibold">87%</p>
                  </div>
                  <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-300">
                    Strong match
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["Skills alignment", 86],
                    ["Experience fit", 91],
                    ["Role keywords", 82],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Recommended improvements
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Add leadership examples to your summary.</li>
                  <li>• Include more product metrics in your experience.</li>
                  <li>• Highlight cross-functional collaboration.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "CV analysis",
              text: "Compare your experience to the role and surface gaps quickly.",
            },
            {
              title: "Actionable feedback",
              text: "Get tailored recommendations to strengthen your application.",
            },
            {
              title: "Interview-ready polish",
              text: "Refine your wording so your profile reads clearly and confidently.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-lg text-cyan-700">
                ✦
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
