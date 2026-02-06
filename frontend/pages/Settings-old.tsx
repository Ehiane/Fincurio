
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-[720px] mx-auto px-6 pt-12 pb-24 animate-in fade-in duration-700">
      <section className="mb-20">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Account Preferences</h2>
        <p className="text-lg text-stone-text font-light max-w-md">Manage your personal details, financial connections, and security settings in one place.</p>
      </section>

      {/* Profile */}
      <section className="mb-24">
        <h3 className="text-2xl font-light text-white mb-8 border-b border-stone-800 pb-2">Profile</h3>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="shrink-0 relative">
            <div className="w-32 h-32 rounded-full bg-cover bg-center shadow-2xl border border-stone-800" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDq-cfc7xh1DGliN5hdHVsRaa5oF4UaFsm_HSnHNZfrWeUJ1unhrHZLRFd7AdM2vjYjV2HrSNASb-5bXJw7d_zruuGLZU8Wi8XxEBcxmzBNgE2-RWXRNVxGZzxg84TYbNYcanw6GWA2dgrDRj96mFRCc2bUWZQKh0EnrNqKEtZ8VwffwCrc9IEhQ7pzAj-d1fHEu1YLVYJVuLndUJLfsGvPlRb-GOQYB9oVs4styWAq7yVgqp2T8Gb8hKAAeyToTsbRxqxK7IT_1p40')" }}></div>
            <button className="absolute bottom-0 right-0 bg-surface-dark p-2 rounded-full text-white hover:bg-primary transition-all border border-stone-700">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div className="flex flex-col items-center md:items-start flex-1 pt-2">
            <div className="text-3xl font-medium mb-1">Alex Sterling</div>
            <div className="text-stone-text text-lg font-light mb-6">alex.sterling@example.com</div>
            <button className="text-sm font-medium text-white px-6 py-3 rounded-full bg-stone-800 hover:bg-stone-700 transition-all">
              Edit Details
            </button>
          </div>
        </div>
      </section>

      {/* Connections */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-10 border-b border-stone-800 pb-2">
          <h3 className="text-2xl font-light text-white">Connections</h3>
          <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-red-600 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Connect</span>
          </button>
        </div>
        <div className="flex flex-col gap-8">
          <ConnectionItem logo="https://lh3.googleusercontent.com/aida-public/AB6AXuBbgP6SdaOBtA5EQkXrJbCE0CJHCuSBXZPSfoCOx0JS6VFVXeSd5755afNeAY_ccqZ4CHNDXWmQxhGZ8eL3EIc05mgG_-tRXwMv3j_6uJdKafysH5AvlZDqZXUtSVkl8CBFEYyBpQS7o3GdFm-Mhrcp89ttg1x8nfX7Y0qwtC5AAIS6rZs4gw73I9JaIF63BwM9ujieQgHTJzwTK9hdzakUjhRVAs9phI_7ajxarV72UNhQkA7H3xv44mRq-hbzw2k_o76ioLAmmHuZ" name="Chase Sapphire" status="Synced just now" statusColor="bg-green-500" />
          <ConnectionItem name="American Express Gold" status="Synced 2 hours ago" statusColor="bg-green-500" bgOverride="bg-[#006fcf]" labelOverride="AMEX" />
          <ConnectionItem icon="account_balance" name="Vanguard IRA" status="Action required" statusColor="bg-yellow-500" needsReconnect />
        </div>
      </section>

      {/* Security */}
      <section className="mb-24">
        <h3 className="text-2xl font-light text-white mb-10 border-b border-stone-800 pb-2">Security</h3>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-stone-text">lock</span>
              <span className="font-medium">Password</span>
            </div>
            <p className="text-stone-text text-sm leading-relaxed">Last changed 3 months ago. We recommend updating it every 6 months.</p>
            <a href="#" className="text-primary hover:text-white text-sm font-medium mt-1 flex items-center gap-1">
              Update Password <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-stone-text">phonelink_lock</span>
              <span className="font-medium">Two-Factor Auth</span>
            </div>
            <p className="text-stone-text text-sm leading-relaxed">Currently active via Authenticator App. Your account is secure.</p>
            <a href="#" className="text-primary hover:text-white text-sm font-medium mt-1 flex items-center gap-1">
              Manage Methods <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center border-t border-stone-800 mt-auto opacity-50">
        <div className="flex justify-center gap-6 mb-4">
          <a className="text-stone-text hover:text-white text-xs uppercase tracking-widest" href="#">Help</a>
          <a className="text-stone-text hover:text-white text-xs uppercase tracking-widest" href="#">Privacy</a>
          <a className="text-stone-text hover:text-white text-xs uppercase tracking-widest" href="#">Terms</a>
        </div>
        <p className="text-xs text-[#5c4a4d]">© 2024 Fincurio Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

const ConnectionItem: React.FC<{ logo?: string; icon?: string; name: string; status: string; statusColor: string; bgOverride?: string; labelOverride?: string; needsReconnect?: boolean }> = ({ logo, icon, name, status, statusColor, bgOverride, labelOverride, needsReconnect }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgOverride || 'bg-white'}`}>
        {logo ? <img src={logo} alt={name} className="w-6 h-6 object-contain" /> : icon ? <span className="material-symbols-outlined text-stone-800">{icon}</span> : <span className="text-white font-bold text-xs">{labelOverride}</span>}
      </div>
      <div>
        <p className="text-lg font-normal text-white group-hover:text-primary transition-colors">{name}</p>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></span>
          <p className="text-sm text-stone-text">{status}</p>
        </div>
      </div>
    </div>
    {needsReconnect ? (
      <button className="text-primary hover:text-white text-sm font-medium">Re-connect</button>
    ) : (
      <button className="text-stone-text hover:text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Manage</button>
    )}
  </div>
);

export default Settings;
