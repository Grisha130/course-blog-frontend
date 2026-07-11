export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-paper">
      {/* Left panel — signature element */}
      <div className="hidden lg:flex lg:w-[44%] bg-ink relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />

        <a href="/" className="text-paper font-display text-xl tracking-tight">
          CourseBlog
        </a>

        <div className="relative z-10">
          <p className="text-gold font-sans text-sm tracking-widest uppercase mb-4">
            {eyebrow}
          </p>
          <h1 className="text-paper font-display text-4xl leading-tight mb-6">
            {title}
          </h1>
          <p className="text-paper/60 font-sans text-base leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* floating course card mock — the signature element */}
        <div className="relative z-10 bg-ink-light border border-white/10 rounded-2xl p-5 max-w-xs shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-display text-sm">
              JS
            </div>
            <div>
              <p className="text-paper text-sm font-medium">Advanced Laravel</p>
              <p className="text-paper/40 text-xs">12 lessons</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-2/3 bg-gold rounded-full" />
          </div>
          <p className="text-paper/40 text-xs mt-2">8 of 12 completed</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}