import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { AuthUser } from '../../types';

export const AuthScreen: React.FC<{ onDismiss?: () => void; isModal?: boolean }> = ({
  onDismiss,
  isModal = false,
}) => {
  const { login, register, settings, storeStatus } = usePOS();

  // Tab State: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('aisyahsya');
  const [loginPassword, setLoginPassword] = useState('aisyahsyadec242025');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'Super Admin' | 'Manager' | 'Kasir'>('Kasir');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Quick fill Super Admin Credentials
  const handleFillSuperAdmin = () => {
    setActiveTab('login');
    setLoginUsername('aisyahsya');
    setLoginPassword('aisyahsyadec242025');
    setLoginError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginUsername.trim()) {
      setLoginError('Mohon isi username atau email Anda.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Mohon isi password Anda.');
      return;
    }

    setIsSubmittingLogin(true);
    setTimeout(() => {
      const result = login(loginUsername, loginPassword);
      setIsSubmittingLogin(false);
      if (!result.success) {
        setLoginError(result.message);
      } else if (onDismiss) {
        onDismiss();
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regUsername.trim() || !regFullName.trim() || !regEmail.trim()) {
      setRegError('Mohon lengkapi seluruh kolom yang bertanda bintang (*).');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password minimal harus 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    if (!agreeTerms) {
      setRegError('Anda harus menyetujui Ketentuan Layanan Kasirku POS.');
      return;
    }

    setIsSubmittingReg(true);
    setTimeout(() => {
      const result = register({
        username: regUsername,
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        role: regRole,
        password: regPassword,
      });
      setIsSubmittingReg(false);

      if (!result.success) {
        setRegError(result.message);
      } else if (onDismiss) {
        onDismiss();
      }
    }, 400);
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 ${
        isModal
          ? 'fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs'
          : 'bg-[#f6f4ee] relative'
      }`}
    >
      {/* Main Container Card (Solid & Crisp Physical Surface) */}
      <div className="relative w-full max-w-lg bg-[#ffffff] rounded-2xl border border-[#ede7db] shadow-[0px_4px_24px_rgba(28,25,23,0.06)] overflow-hidden transition-all">
        {/* Top Header Bar */}
        <div className="bg-[#fcfbf9] px-6 sm:px-8 pt-7 pb-6 border-b border-[#ede7db]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-[#e2dbcc] shadow-xs flex items-center justify-center shrink-0">
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-[#1c1917] tracking-tight">
                    {settings.storeName}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] whitespace-nowrap">
                    PORTAL
                  </span>
                </div>
                <p className="text-xs text-[#57534e]">Sistem Kasir & Manajemen Outlet</p>
              </div>
            </div>

            {/* Operational Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f4ee] border border-[#e2dbcc] text-xs font-semibold text-[#57534e]">
              <span
                className={`w-2 h-2 rounded-full ${
                  storeStatus === 'BUKA' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="whitespace-nowrap">{storeStatus === 'BUKA' ? 'Outlet Buka' : 'Status Toko'}</span>
            </div>

            {/* Modal Close Button */}
            {isModal && onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center border border-[#e2dbcc] transition-colors"
                title="Tutup Modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Credential Super Admin Highlight Card */}
          <div className="mt-5 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0 border border-[#bae6fd]">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#0f172a] flex items-center gap-1.5">
                  <span>Kredensial Super Admin</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] whitespace-nowrap">
                    RESMI
                  </span>
                </div>
                <div className="text-[#57534e] text-[11px] mt-0.5 font-medium flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>
                    User: <strong className="font-mono text-[#0284c7]">aisyahsya</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Pass: <strong className="font-mono text-[#0284c7]">aisyahsyadec242025</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFillSuperAdmin}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#e0f2fe] text-[#0284c7] hover:text-[#0369a1] text-xs font-bold border border-[#bae6fd] transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-auto whitespace-nowrap"
              title="Isi form login dengan kredensial Super Admin ini"
            >
              <span className="material-symbols-outlined text-[15px]">input</span>
              <span>1-Klik Isi Form</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="px-6 sm:px-8 pt-5">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#f6f4ee] border border-[#ede7db]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'login'
                  ? 'bg-white text-[#0284c7] shadow-xs border border-[#e2dbcc]'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'register'
                  ? 'bg-white text-[#0284c7] shadow-xs border border-[#e2dbcc]'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: FORM LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#292524]">Selamat Datang Kembali!</h3>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Silakan masukkan kredensial akun untuk mengakses sistem kasir & operasional toko.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                    error
                  </span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                  Username atau Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Contoh: aisyahsya"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-sm font-semibold text-[#292524] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#57534e]">Password</label>
                  <button
                    type="button"
                    onClick={handleFillSuperAdmin}
                    className="text-[11px] font-semibold text-[#0284c7] hover:underline"
                  >
                    Pakai Akun Super Admin?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[20px]">
                    lock
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-sm font-semibold text-[#292524] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#0284c7] p-1"
                    title={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showLoginPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#7dd3fc] accent-[#0284c7] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#57534e]">Ingat akun di perangkat ini</span>
                </label>

                <span className="text-[11px] font-semibold text-[#78716c]">
                  Role Otomatis: Super Admin / Kasir
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full py-3 px-6 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {isSubmittingLogin ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Masuk ke Sistem Kasir</span>
                  </>
                )}
              </button>

              {/* Footer Switcher */}
              <div className="text-center pt-2">
                <p className="text-xs text-[#78716c]">
                  Belum memiliki akun kasir / staf?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setRegError(null);
                    }}
                    className="font-bold text-[#0284c7] hover:underline"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: FORM DAFTAR (REGISTER) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#292524]">Pendaftaran Akun Baru</h3>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Daftarkan staf baru dengan peran Kasir, Manager, atau Super Admin.
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                    error
                  </span>
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Username */}
                <div>
                  <label className="text-xs font-bold text-[#57534e] block mb-1">
                    Username Akun <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[18px]">
                      alternate_email
                    </span>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="contoh: aisyahsya"
                      className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-xs font-semibold text-[#292524] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="text-xs font-bold text-[#57534e] block mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[18px]">
                      badge
                    </span>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="contoh: Aisyah Sya"
                      className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-xs font-semibold text-[#292524] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-[#57534e] block mb-1">
                    Email Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[18px]">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-xs font-semibold text-[#292524] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Telepon / WA */}
                <div>
                  <label className="text-xs font-bold text-[#57534e] block mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[18px]">
                      call
                    </span>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-xs font-semibold text-[#292524] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                  Tingkat Hak Akses / Peran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'Super Admin',
                      title: 'Super Admin',
                      icon: 'shield_person',
                      desc: 'Akses penuh',
                    },
                    {
                      id: 'Manager',
                      title: 'Manager',
                      icon: 'admin_panel_settings',
                      desc: 'Laporan & stok',
                    },
                    {
                      id: 'Kasir',
                      title: 'Kasir',
                      icon: 'point_of_sale',
                      desc: 'POS & shift',
                    },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setRegRole(role.id as 'Super Admin' | 'Manager' | 'Kasir')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        regRole === role.id
                          ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0369a1] shadow-2xs'
                          : 'bg-[#fdfbf7] border-[#ede5d8] text-[#78716c] hover:bg-[#f5efe6]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#0284c7]">
                          {role.icon}
                        </span>
                        <span className="text-xs font-bold leading-none">{role.title}</span>
                      </div>
                      <span className="text-[10px] opacity-80 block mt-1">{role.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-[#57534e] block mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[18px]">
                      lock
                    </span>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full pl-9 pr-9 py-2 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-xs font-semibold text-[#292524] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#0284c7]"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#57534e] block mb-1">
                    Konfirmasi Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7dd3fc] text-[18px]">
                      lock_reset
                    </span>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      className="w-full pl-9 pr-3 py-2 bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#7dd3fc] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] rounded-xl text-xs font-semibold text-[#292524] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Agree Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#7dd3fc] accent-[#0284c7] cursor-pointer mt-0.5"
                  />
                  <span className="text-xs text-[#57534e]">
                    Saya menyetujui Ketentuan Layanan & Kebijakan Hak Akses Staf Kasirku POS.
                  </span>
                </label>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isSubmittingReg}
                className="w-full py-3 px-6 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {isSubmittingReg ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Mendaftarkan Akun Baru...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                    <span>Daftar & Langsung Masuk</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[#78716c]">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setLoginError(null);
                    }}
                    className="font-bold text-[#0284c7] hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
