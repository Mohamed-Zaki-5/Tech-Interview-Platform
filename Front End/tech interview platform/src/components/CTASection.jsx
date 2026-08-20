import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 px-6 py-14 text-center shadow-[0_30px_80px_rgba(79,70,229,0.2)] sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100">Ready to begin</div>
          <h2 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Step into your next interview with confidence.</h2>
          <p className="mt-5 text-lg leading-8 text-indigo-100">Explore questions for free, sharpen your answers, and create an account later when you’re ready to save progress.</p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/tracks" className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5">Start Practicing Free</Link>
            <Link to="/register" className="rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Create Account</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
