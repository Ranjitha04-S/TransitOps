const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden selection:bg-primary selection:text-text-primary">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Centered Login Box */}
      <div className="w-full max-w-md relative z-10 flex flex-col gap-6">
        
        {/* Branding header centered above the card */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold tracking-wider text-text-primary uppercase leading-tight">
              TRANSPORTOPS
            </h1>
            <span className="text-[10px] tracking-widest text-text-muted font-bold uppercase -mt-1 block">
              Ops Control
            </span>
          </div>
        </div>

        {/* Children Rendered (Card containing forms) */}
        <div>
          {children}
        </div>

        {/* Centered Footer */}
        <div className="text-center text-[10px] text-text-muted">
          TRANSPORTOPS © {new Date().getFullYear()} NEURAL LOGISTICS COMMAND. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
