/**
 * Hero Section Component
 * Main hero banner with headline and CTAs
 */

import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Interview prep for modern engineers
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.06em] text-slate-900 sm:text-6xl">
              Master your
              <span className="mt-2 block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                technical interview
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Practice structured questions, sharpen your fundamentals, and build confidence before your next big opportunity.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/tracks" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-indigo-600">Start Practicing</Link>
              <a href="#tracks" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600">Explore Tracks</a>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="text-3xl font-black text-indigo-600">500+</div>
                <div className="mt-1 text-sm text-slate-600">practice questions</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="text-3xl font-black text-indigo-600">8+</div>
                <div className="mt-1 text-sm text-slate-600">technology tracks</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(79,70,229,0.12)]">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-300">Interview Prep</div>
                  <div className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Live</div>
                </div>

                <div className="rounded-2xl bg-slate-900 p-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                    <span>React / Frontend</span>
                    <span>12 min</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2.5 rounded-full bg-slate-800">
                      <div className="h-2.5 w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800">
                      <div className="h-2.5 w-[58%] rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-slate-400">Accuracy</div>
                    <div className="mt-2 text-2xl font-bold text-white">82%</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-slate-400">Streak</div>
                    <div className="mt-2 text-2xl font-bold text-white">7 days</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Today’s focus</span>
                  <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">New</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Closures in JS</div>
                    <div className="text-xs text-slate-500">Advanced concept</div>
                  </div>
                  <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Practice</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
