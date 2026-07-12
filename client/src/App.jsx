import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-deep-teal selection:bg-primary-orange selection:text-white">
      {/* Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-orange/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-lg p-8 md:p-12 rounded-3xl bg-bg-card-glass border border-border-glass backdrop-blur-xl shadow-2xl text-center flex flex-col items-center">
        {/* Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-orange to-primary-orange/80 flex items-center justify-center shadow-lg shadow-primary-orange/25 mb-8">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-text-light mb-2">
          Transit<span className="text-primary-orange">Ops</span>
        </h1>
        <p className="text-text-muted text-sm md:text-base font-medium mb-8 max-w-xs">
          Smart Transport Operations Platform. Theme successfully initialized.
        </p>

        {/* Dynamic State Previews */}
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-teal/30 border border-border-glass text-xs font-semibold text-text-light">
            <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulse" />
            Available
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-teal/30 border border-border-glass text-xs font-semibold text-text-light">
            <span className="w-2.5 h-2.5 rounded-full bg-status-ontrip" />
            On Trip
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-teal/30 border border-border-glass text-xs font-semibold text-text-light">
            <span className="w-2.5 h-2.5 rounded-full bg-status-inshop" />
            In Shop
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-teal/30 border border-border-glass text-xs font-semibold text-text-light">
            <span className="w-2.5 h-2.5 rounded-full bg-status-retired" />
            Retired
          </div>
        </div>

        {/* Interactive Button */}
        <button
          onClick={() => setCount(count + 1)}
          className="w-full py-4 px-6 rounded-2xl bg-primary-orange hover:bg-primary-orange-hover text-white font-bold transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-primary-orange/20 cursor-pointer text-sm"
        >
          Initialize Dispatch ({count})
        </button>
      </div>
    </div>
  )
}

export default App
