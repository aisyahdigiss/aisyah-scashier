import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CASHIER_AVATAR_PRESETS } from '../../data/initialData';

interface AuthScreenProps {
  onDismiss?: () => void;
  isModal?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onDismiss,
  isModal = false,
}) => {
  const {
    login,
    register,
    settings,
    storeStatus,
    showToast,
    setCurrentScreen,
    authMode,
    setAuthMode,
    users,
  } = usePOS();

  // Active Tab: 'signin' or 'signup'
  const activeTab = authMode || 'signin';

  // Sign In Form States
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingSignIn, setIsSubmittingSignIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up Form States
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpRole, setSignUpRole] = useState<'Kasir' | 'Manager' | 'Super Admin'>('Kasir');
  const [signUpAvatar, setSignUpAvatar] = useState<string>(
    CASHIER_AVATAR_PRESETS[0]?.url ||
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd'
  );
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Auto-generate username from full name if username is untouched
  const handleFullNameChange = (val: string) => {
    setSignUpFullName(val);
    const suggestedUsername = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 16);
    if (!signUpUsername || signUpUsername.startsWith(suggestedUsername.slice(0, 3))) {
      setSignUpUsername(suggestedUsername);
    }
    if (!signUpEmail || signUpEmail.endsWith('@kasirku.id')) {
      setSignUpEmail(suggestedUsername ? `${suggestedUsername}@kasirku.id` : '');
    }
  };

  // Quick fill demo credentials
  const handleQuickFillAccount = (user: {
    username: string;
    fullName: string;
    role: string;
    defaultPw: string;
  }) => {
    setSignInIdentifier(user.username);
    setSignInPassword(user.defaultPw);
    setSignInError(null);
    showToast(`Akun ${user.fullName} (${user.role}) dipilih. Password otomatis terisi!`, 'info');
  };

  // Submit Sign In with password
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    const cleanId = signInIdentifier.trim();
    const cleanPw = signInPassword;

    if (!cleanId) {
      setSignInError('Masukkan username atau email Anda!');
      return;
    }

    if (!cleanPw) {
      setSignInError('Masukkan password akun Anda!');
      return;
    }

    setIsSubmittingSignIn(true);

    setTimeout(() => {
      const res = login(cleanId, cleanPw);
      setIsSubmittingSignIn(false);

      if (res.success) {
        if (onDismiss) {
          onDismiss();
        } else {
          setCurrentScreen('kasir');
        }
      } else {
        setSignInError(res.message || 'Login gagal. Periksa username dan password Anda.');
      }
    }, 250);
  };

  // Submit Sign Up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!signUpFullName.trim()) {
      setSignUpError('Nama lengkap wajib diisi!');
      return;
    }

    if (!signUpUsername.trim()) {
      setSignUpError('Username wajib diisi!');
      return;
    }

    if (!signUpEmail.trim()) {
      setSignUpError('Alamat email wajib diisi!');
      return;
    }

    if (!signUpPassword) {
      setSignUpError('Password wajib diisi!');
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError('Password minimal harus 6 karakter demi keamanan!');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Konfirmasi password tidak cocok! Pastikan kedua password sama.');
      return;
    }

    setIsSubmittingSignUp(true);

    setTimeout(() => {
      const res = register({
        fullName: signUpFullName.trim(),
        username: signUpUsername.trim(),
        email: signUpEmail.trim(),
        phone: signUpPhone.trim() || undefined,
        password: signUpPassword,
        role: signUpRole,
        avatarUrl: signUpAvatar,
      });

      setIsSubmittingSignUp(false);

      if (res.success) {
        if (onDismiss) {
          onDismiss();
        } else {
          setCurrentScreen('kasir');
        }
      } else {
        setSignUpError(res.message || 'Pendaftaran gagal. Silakan coba username lain.');
      }
    }, 300);
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 ${
        isModal ? 'fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs' : 'bg-[#f6f4ee] relative'
      }`}
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-[#e2dbcc] shadow-[0px_10px_40px_rgba(28,25,23,0.08)] overflow-hidden transition-all my-4">
        {/* Top Header with Store Branding & Back to Landing */}
        <div className="bg-[#fcfbf9] px-6 sm:px-8 pt-6 pb-5 border-b border-[#ede7db]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-[#e2dbcc] shadow-xs flex items-center justify-center shrink-0">
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQKFTo1cMYTrVnSx6gA9lJCsxrUvyIZ_QvC87o0u7manpYH1hDDsAO7BgzqxQV32_lHhPhYDaf967o8XZdzmDVmlyL3-iLE9VE2PN2JiMBRM5_8eUtCdCwA7LmdFcFzj6t3cV4KjKd7AUHb3A1GSf6HWaBDQ4MQNgwQ3wxrpi-7T9dJVl3YsmHSN2PFP_EypUS7dymZ8fu99B0QIF7Qdd05jrEYyF_9H0txOqu3yEOaYnQYNNVn3t7bg';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-[#1c1917] tracking-tight">
                    {settings.storeName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                    POS SYSTEM
                  </span>
                </div>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Portal Autentikasi Kasir & Akun Pegawai
                </p>
              </div>
            </div>

            {/* Back to Landing Page or Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onDismiss) {
                    onDismiss();
                  } else {
                    setCurrentScreen('landing');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#57534e] hover:text-[#1c1917] text-xs font-bold border border-[#e2dbcc] flex items-center gap-1.5 transition-all shadow-2xs"
                title="Kembali ke Halaman Beranda (Landing Page)"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span className="hidden sm:inline">Landing Page</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Toggle: Sign In (Masuk) vs Sign Up (Daftar Akun) */}
        <div className="px-6 sm:px-8 pt-5 pb-2">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#f5f2ea] border border-[#ede7db]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setSignInError(null);
                setSignUpError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'signin'
                  ? 'bg-white text-[#0284c7] shadow-sm border border-[#e2dbcc]'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Masuk (Sign In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setSignInError(null);
                setSignUpError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'signup'
                  ? 'bg-white text-[#0284c7] shadow-sm border border-[#e2dbcc]'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Daftar Akun (Sign Up)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 pt-4">
          {activeTab === 'signin' ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-[#1c1917]">
                  Masuk Akun Kasir
                </h2>
                <p className="text-xs text-[#57534e] mt-0.5">
                  Masukkan username/email dan password Anda untuk membuka sesi kasir.
                </p>
              </div>

              {signInError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                    error
                  </span>
                  <span>{signInError}</span>
                </div>
              )}

              {/* Username / Email Field */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">
                  Username atau Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716c]">
                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => {
                      setSignInIdentifier(e.target.value);
                      if (signInError) setSignInError(null);
                    }}
                    placeholder="Contoh: aisyahsya atau andi_kasir"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#1c1917] bg-white focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#292524]">
                    Password (Kata Sandi)
                  </label>
                  <span className="text-[11px] text-[#78716c] font-medium">
                    Wajib diisi
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716c]">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (signInError) setSignInError(null);
                    }}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#1c1917] bg-white focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#78716c] hover:text-[#1c1917] transition-colors"
                    title={showSignInPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showSignInPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#57534e]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0284c7] border-[#cbd5e1] focus:ring-[#0284c7]"
                  />
                  <span>Ingat sesi masuk saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const superAdmin = users.find((u) => u.role === 'Super Admin') || users[0];
                    if (superAdmin) {
                      const adminPw =
                        superAdmin.password ||
                        (superAdmin.username.toLowerCase() === 'aisyahsya'
                          ? 'aisyahsyadec242025'
                          : 'password123');
                      handleQuickFillAccount({
                        username: superAdmin.username,
                        fullName: superAdmin.fullName,
                        role: superAdmin.role,
                        defaultPw: adminPw,
                      });
                    }
                  }}
                  className="text-xs text-[#0284c7] hover:underline font-bold"
                >
                  Lupa Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingSignIn}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>{isSubmittingSignIn ? 'Memverifikasi Password...' : 'Masuk ke Kasir'}</span>
              </button>

              {/* Quick Fill Demo Helper (Solves "nda bingung dan ada pw nya") */}
              <div className="pt-3 border-t border-[#ede7db] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black tracking-wider uppercase text-[#78716c]">
                    Pilihan Akun Demo (Klik untuk Isi Cepat):
                  </span>
                  <span className="text-[10px] font-bold text-[#0284c7] bg-[#f0f9ff] px-2 py-0.5 rounded-full border border-[#bae6fd]">
                    Siap Pakai
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {users.slice(0, 3).map((u) => {
                    const isFilled =
                      signInIdentifier.toLowerCase() === u.username.toLowerCase() ||
                      signInIdentifier.toLowerCase() === u.email.toLowerCase();
                    const demoPw =
                      u.password ||
                      (u.username.toLowerCase() === 'aisyahsya'
                        ? 'aisyahsyadec242025'
                        : 'password123');
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() =>
                          handleQuickFillAccount({
                            username: u.username,
                            fullName: u.fullName,
                            role: u.role,
                            defaultPw: demoPw,
                          })
                        }
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isFilled
                            ? 'bg-[#f0f9ff] border-[#0284c7] ring-1 ring-[#0284c7]'
                            : 'bg-[#fdfbf7] hover:bg-stone-50 border-[#ede7db]'
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-[#1c1917] truncate leading-tight">
                            {u.fullName}
                          </p>
                          <p className="text-[9px] text-[#0284c7] font-semibold truncate">
                            {u.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Switch to Sign Up */}
              <div className="pt-2 text-center text-xs text-[#57534e]">
                <span>Belum memiliki akun pegawai kasir? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setSignInError(null);
                    setSignUpError(null);
                  }}
                  className="font-bold text-[#0284c7] hover:underline"
                >
                  Daftar Akun Baru (Sign Up)
                </button>
              </div>
            </form>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <h2 className="text-lg font-black text-[#1c1917]">
                  Daftar Akun Baru (Sign Up)
                </h2>
                <p className="text-xs text-[#57534e] mt-0.5">
                  Buat akun kasir atau manajer baru lengkap dengan password untuk masuk.
                </p>
              </div>

              {signUpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                    error
                  </span>
                  <span>{signUpError}</span>
                </div>
              )}

              {/* Nama Lengkap & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpFullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    placeholder="Contoh: Rina Safitri"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] text-xs sm:text-sm text-[#1c1917] bg-white focus:outline-hidden focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Username untuk Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="Contoh: rina_safitri"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] text-xs sm:text-sm text-[#1c1917] bg-white focus:outline-hidden focus:border-[#0284c7] font-mono"
                  />
                </div>
              </div>

              {/* Email & Nomor Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="rina@kasirku.id"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] text-xs sm:text-sm text-[#1c1917] bg-white focus:outline-hidden focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    No. WhatsApp / HP (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] text-xs sm:text-sm text-[#1c1917] bg-white focus:outline-hidden focus:border-[#0284c7]"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1">
                  Peran / Hak Akses Akun:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Kasir', label: 'Kasir', desc: 'Transaksi Penjualan' },
                    { id: 'Manager', label: 'Manager', desc: 'Stok & Laporan' },
                    { id: 'Super Admin', label: 'Super Admin', desc: 'Akses Penuh' },
                  ].map((roleOption) => (
                    <button
                      key={roleOption.id}
                      type="button"
                      onClick={() => setSignUpRole(roleOption.id as 'Kasir' | 'Manager' | 'Super Admin')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        signUpRole === roleOption.id
                          ? 'bg-[#e0f2fe] text-[#0369a1] border-[#0284c7] font-extrabold shadow-2xs'
                          : 'bg-white text-[#57534e] border-[#cbd5e1] hover:bg-stone-50'
                      }`}
                    >
                      <span className="block text-xs">{roleOption.label}</span>
                      <span className="block text-[9px] text-[#78716c] font-normal truncate">
                        {roleOption.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#292524]">
                      Password Baru *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="text-[10px] text-[#0284c7] font-bold hover:underline"
                    >
                      {showSignUpPassword ? 'Sembunyikan' : 'Lihat PW'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] text-xs sm:text-sm text-[#1c1917] bg-white focus:outline-hidden focus:border-[#0284c7] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Konfirmasi Password *
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Ulangi password di atas"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm text-[#1c1917] bg-white focus:outline-hidden font-mono ${
                      signUpConfirmPassword && signUpPassword !== signUpConfirmPassword
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-[#cbd5e1] focus:border-[#0284c7]'
                    }`}
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1">
                  Pilih Avatar Profil
                </label>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {CASHIER_AVATAR_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSignUpAvatar(preset.url)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        signUpAvatar === preset.url
                          ? 'border-[#0284c7] ring-2 ring-[#0284c7]/30 scale-105 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={isSubmittingSignUp}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
              >
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                <span>
                  {isSubmittingSignUp
                    ? 'Mendaftarkan Akun...'
                    : 'Daftarkan Akun & Buka Kasir'}
                </span>
              </button>

              {/* Bottom Switch to Sign In */}
              <div className="pt-2 text-center text-xs text-[#57534e]">
                <span>Sudah punya akun kasir terdaftar? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setSignInError(null);
                    setSignUpError(null);
                  }}
                  className="font-bold text-[#0284c7] hover:underline"
                >
                  Masuk Sekarang (Sign In)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
