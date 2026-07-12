const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden selection:bg-primary selection:text-text-primary">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Centered Login Box */}
      <div className="w-full max-w-lg relative z-10 flex flex-col gap-4">
        
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
