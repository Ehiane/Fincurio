
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col pt-20">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 py-20 bg-background-light dark:bg-background-dark overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/20">
              Editorial Finance
            </span>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-medium leading-[0.9] tracking-tight text-slate-900 dark:text-white">
              Money,<br/><span className="italic text-stone-400 dark:text-stone-500">reflected.</span>
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-stone-600 dark:text-stone-text max-w-2xl mt-6">
              Fincurio helps you cultivate a practice of intentional financial living. 
              Move beyond spreadsheets and embrace a narrative of wealth.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => navigate('/signin')}
                className="flex items-center justify-center rounded-full h-14 px-10 bg-primary text-white text-base font-bold tracking-wide hover:bg-red-700 hover:scale-105 transition-all shadow-lg shadow-primary/30"
              >
                Begin Reflection
              </button>
              <p className="mt-4 text-xs text-stone-500 uppercase tracking-widest">30 Day Complimentary Access</p>
            </div>
          </div>

          <div className="mt-20 w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#38292b]/20 opacity-90">
            <div className="aspect-[21/9] bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBLY6GVtZWomscqk-cS3RJhMqqdAlMi_3NXpog1l9ez1iDBuuQY1EVjrWyx_wRM2yMO51O4nyUqYSAWdV1GgX7obC5sFymVEQSTSrvaL2RZNLQT1-1JzrSB93n45MAK8KyctWfPtolp5e0Os02RJNQfuRRUzDWMfSx0Yi5bO7cHn-j-jFEClODeIh0HgIXkovipjcHX5i6mHjOwMdtHJnbomzh238j2kaP3lg5D7cgXfMMwt_KtaAmGOUvErPz2krGFvAQ8brggmgkl')" }}></div>
          </div>
        </section>

        {/* Philosophy Sections */}
        <section id="awareness" className="py-32 px-6 md:px-12 lg:px-20 bg-white dark:bg-[#1f1012] border-t border-[#38292b]/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <div className="size-12 rounded-full bg-surface-dark flex items-center justify-center text-primary mb-4 border border-[#38292b]">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-tight">
                Awareness without<br/>the noise.
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full"></div>
              <p className="text-lg md:text-xl text-stone-600 dark:text-stone-text leading-relaxed font-light max-w-md">
                Understand where your resources flow without the anxiety of minute-by-minute tracking. We utilize soft focus metrics to give you the shape of your spending, blurring the lines between raw data and intuition.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-900 rounded-lg blur opacity-25"></div>
              <div className="relative w-full aspect-[4/5] md:aspect-square bg-surface-dark rounded-lg overflow-hidden border border-[#38292b]">
                <div className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQOysV5LPTCPge9NIv0qEW42PFg6koelh4c8L7zAoxcFpoAgsPG5EqlG3gITsxRP46fopjiq-_rRj3RSedarloGLDWpHi32pfbN1HCcRY-bKryApTxKPqVd4wkL-S90SefXCw3KH1lzcufbxFkPslIvF4EsfRpNbPeXrdog01sqiu_80mm6sjL2jdFu3brP0UMFyCojoNClgZeNkKTC1Qq_IgxGCzYzOw5j6n1C4OIMDdvjqapyNfHYxq_FkM3HGddabz3xrxJqB1x')" }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 backdrop-blur-md p-8 rounded-full border border-white/10 text-center">
                    <p className="text-xs font-mono uppercase tracking-widest text-white/70 mb-1">Monthly Flow</p>
                    <p className="text-4xl font-serif text-white italic">Healthy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#38292b]/30 bg-background-light dark:bg-background-dark py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-stone-500 text-xl">diamond</span>
            <span className="text-stone-500 font-bold tracking-tight">Fincurio</span>
          </div>
          <div className="flex gap-8 text-stone-500 text-sm">
            <a className="hover:text-primary transition-colors" href="#">Manifesto</a>
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
          </div>
          <div className="text-stone-600 dark:text-stone-600 text-xs">© 2024 Fincurio Inc. Wealth is a mindset.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
