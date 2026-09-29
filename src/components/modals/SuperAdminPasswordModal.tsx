import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../types';
import { usePOS } from '../../context/POSContext';
import { CUTE_AVATAR_PRESETS } from '../common/AvatarPicker';

export type SuperAdminModalMode =
  | 'change-password'
  | 'create-user'
  | 'edit-user'
  | 'reset-password';

interface SuperAdminPasswordModalProps {
  isOpen: boolean;
  mode: SuperAdminModalMode;
  targetUser: AuthUser | null;
  onClose: () => void;
}

export const SuperAdminPasswordModal: React.FC<SuperAdminPasswordModalProps> = ({
  isOpen,
  mode,
  targetUser,
  onClose,
}) => {
  const {
    updateUserPassword,
    resetUserPasswordToDefault,
    updateUserAccount,
    register,
    playBeep,
    showToast,
  } = usePOS();

  // Form fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // User profile fields (for create-user and edit-user)
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Manager' | 'Kasir'>('Super Admin');
  const [avatarUrl, setAvatarUrl] = useState(CUTE_AVATAR_PRESETS[0]?.url || '');

  // Reset or initialize state when modal opens or targetUser/mode changes
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setCopiedNotification(false);

      if (targetUser) {
        setFullName(targetUser.fullName || '');
        setUsername(targetUser.username || '');
        setEmail(targetUser.email || '');
        setPhone(targetUser.phone || '');
        setRole(targetUser.role || 'Super Admin');
        setAvatarUrl(targetUser.avatarUrl || CUTE_AVATAR_PRESETS[0]?.url || '');
      } else {
        setFullName('');
        setUsername('');
        setEmail('');
        setPhone('');
        setRole('Super Admin');
        setAvatarUrl(
          `https://api.dicebear.com/7.x/adventurer/svg?seed=Admin_${Date.now()}&backgroundColor=bae6fd`
        );
      }
    }
  }, [isOpen, targetUser, mode]);

  if (!isOpen) return null;

  // Password Generator
  const generateStrongPassword = () => {
    const specials = ['@', '#', '$', '!', '&', '*'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const words = ['Pos', 'Kasir', 'Admin', 'Super', 'Toko', 'Bintang', 'Sukses', 'Kopi', 'Aisyah'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomWord2 = words[Math.floor(Math.random() * words.length)];
    const randomDigits = Math.floor(100 + Math.random() * 900); // 3 digits
    const year = 2026;

    const generated = `${randomWord}${randomWord2}${randomSpecial}${year}${randomDigits}`;
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    playBeep('beep');
    showToast('Password kuat berhasil dibuat!', 'success');
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopiedNotification(true);
    playBeep('beep');
    showToast('Password disalin ke clipboard!', 'info');
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Calculate password strength
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: 'Kosong', color: 'bg-stone-200', text: 'text-stone-400' };
    if (pw.length < 6) return { score: 25, label: 'Terlalu Pendek (< 6)', color: 'bg-rose-500', text: 'text-rose-600' };
    
    let score = 25;
    if (pw.length >= 8) score += 25;
    if (pw.length >= 12) score += 20;
    if (/[0-9]/.test(pw)) score += 15;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 15;
    if (/[^A-Za-z0-9]/.test(pw)) score += 10;

    if (score < 50) return { score, label: 'Lemah', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score < 80) return { score, label: 'Sedang', color: 'bg-sky-500', text: 'text-sky-600' };
    return { score: 100, label: 'Sangat Kuat 🔒', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'change-password') {
      if (!targetUser) return;
      if (!newPassword || newPassword.length < 6) {
        showToast('Password baru minimal 6 karakter!', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('Konfirmasi password tidak cocok!', 'error');
        return;
      }

      const res = updateUserPassword(targetUser.id, newPassword);
      if (res.success) {
        onClose();
      }
    } else if (mode === 'create-user') {
      if (!fullName.trim()) {
        showToast('Nama lengkap wajib diisi!', 'error');
        return;
      }
      if (!username.trim()) {
        showToast('Username wajib diisi!', 'error');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        showToast('Password baru minimal 6 karakter!', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('Konfirmasi password tidak cocok!', 'error');
        return;
      }

      const res = register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@kasirku.id`,
        phone: phone.trim(),
        role,
        password: newPassword,
        avatarUrl,
      });

      if (res.success) {
        onClose();
      }
    } else if (mode === 'edit-user') {
      if (!targetUser) return;
      if (!fullName.trim() || !username.trim()) {
        showToast('Nama dan username wajib diisi!', 'error');
        return;
      }

      const updatePayload: Partial<AuthUser> = {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@kasirku.id`,
        phone: phone.trim(),
        role,
        avatarUrl,
      };

      if (newPassword) {
        if (newPassword.length < 6) {
          showToast('Password baru minimal 6 karakter!', 'error');
          return;
        }
        if (newPassword !== confirmPassword) {
          showToast('Konfirmasi password tidak cocok!', 'error');
          return;
        }
        updatePayload.password = newPassword;
        updatePayload.passwordUpdatedAt = new Date().toISOString();
      }

      const res = updateUserAccount(targetUser.id, updatePayload);
      if (res.success) {
        onClose();
      }
    } else if (mode === 'reset-password') {
      if (!targetUser) return;
      const res = resetUserPasswordToDefault(targetUser.id);
      if (res.success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl border border-[#ede5d8] shadow-2xl max-w-lg w-full overflow-hidden transition-all transform scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 md:p-6 bg-linear-to-r from-[#f0f9ff] via-[#e0f2fe] to-[#f8fafc] border-b border-[#bae6fd] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[22px]">
                {mode === 'change-password' && 'password'}
                {mode === 'create-user' && 'person_add'}
                {mode === 'edit-user' && 'badge'}
                {mode === 'reset-password' && 'restart_alt'}
              </span>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-[#0c4a6e]">
                {mode === 'change-password' && `Ubah Password ${targetUser?.role || 'Super Admin'}`}
                {mode === 'create-user' && 'Tambah Akun Super Admin / Kredensial'}
                {mode === 'edit-user' && `Edit Data & Password ${targetUser?.fullName}`}
                {mode === 'reset-password' && 'Reset Password ke Default Pabrik'}
              </h3>
              <p className="text-xs text-[#0369a1] font-medium">
                {mode === 'change-password' && 'Perbarui kata sandi dengan verifikasi keamanan kuat.'}
                {mode === 'create-user' && 'Buat hak akses baru dengan peran dan password kustom.'}
                {mode === 'edit-user' && 'Ubah username, nama, peran, kontak, atau password.'}
                {mode === 'reset-password' && 'Kembalikan password ke kata sandi standar awal.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center border border-stone-200 transition-colors shadow-2xs"
            aria-label="Tutup modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target User Info Header (if applicable) */}
          {targetUser && mode !== 'create-user' && (
            <div className="p-3.5 rounded-2xl bg-[#fcfbf9] border border-[#ede5d8] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={targetUser.avatarUrl}
                  alt={targetUser.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-[#e2dbcc] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#1c1917] truncate">
                      {targetUser.fullName}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#e0f2fe] text-[#0369a1] whitespace-nowrap">
                      {targetUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#78716c]">
                    Username: <span className="text-[#0284c7] font-bold">@{targetUser.username}</span>
                  </p>
                </div>
              </div>

              {targetUser.passwordUpdatedAt && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#78716c] block">Terakhir diubah:</span>
                  <span className="text-[10px] font-semibold text-[#1c1917]">
                    {new Date(targetUser.passwordUpdatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* RESET PASSWORD CONFIRMATION VIEW */}
          {mode === 'reset-password' && targetUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <span className="material-symbols-outlined text-[20px] text-amber-600">
                    warning
                  </span>
                  <span>Konfirmasi Reset Password</span>
                </div>
                <p>
                  Apakah Anda yakin ingin mereset password akun{' '}
                  <strong>{targetUser.fullName}</strong> (@{targetUser.username})?
                </p>
                <div className="p-3 bg-white rounded-xl border border-amber-200/80 font-mono text-xs text-stone-800">
                  Password akan dikembalikan ke:{' '}
                  <strong className="text-[#0284c7]">
                    {targetUser.username.toLowerCase() === 'aisyahsya'
                      ? 'aisyahsyadec242025'
                      : 'password123'}
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Reset Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* EDIT OR CREATE USER FIELDS */}
          {(mode === 'create-user' || mode === 'edit-user') && (
            <div className="space-y-4">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (mode === 'create-user' && !username) {
                        const sug = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '_')
                          .slice(0, 16);
                        setUsername(sug);
                      }
                    }}
                    placeholder="Contoh: Aisyah Sya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0284c7] text-xs text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                      }
                      placeholder="aisyahsya"
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0284c7] text-xs font-mono text-stone-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0284c7] text-xs text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0284c7] text-xs text-stone-800 bg-white"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Hak Akses / Peran Akun <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Super Admin', 'Manager', 'Kasir'] as const).map((r) => {
                    const isSelected = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-[#e0f2fe] text-[#0369a1] border-[#0284c7] shadow-xs'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {r === 'Super Admin' && 'verified_user'}
                          {r === 'Manager' && 'manage_accounts'}
                          {r === 'Kasir' && 'point_of_sale'}
                        </span>
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Selector Presets */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Pilih Avatar Profil
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CUTE_AVATAR_PRESETS.slice(0, 7).map((preset) => {
                    const isSelected = avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all shrink-0 p-0.5 ${
                          isSelected
                            ? 'border-[#0284c7] scale-110 shadow-md ring-2 ring-sky-200'
                            : 'border-stone-200 hover:border-stone-400 opacity-80'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PASSWORD SECTION (For change-password, create-user, or optional for edit-user) */}
          {mode !== 'reset-password' && (
            <div className="space-y-3.5 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0284c7]">
                    lock
                  </span>
                  <span>
                    {mode === 'edit-user'
                      ? 'Ganti Password (Kosongkan jika tidak diubah)'
                      : 'Password Baru'}
                  </span>
                  {mode !== 'edit-user' && <span className="text-rose-500">*</span>}
                </label>

                {/* Password Generator Button */}
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] text-[11px] font-bold border border-sky-200 flex items-center gap-1 transition-all"
                  title="Generate otomatis password yang kuat dan aman"
                >
                  <span className="material-symbols-outlined text-[14px]">casino</span>
                  <span>🎲 Acak Password Kuat</span>
                </button>
              </div>

              {/* Password Input with Show/Hide & Copy */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={mode !== 'edit-user'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password minimal 6 karakter"
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0284c7] text-xs font-mono text-stone-800 bg-white"
                />

                <div className="absolute right-2 top-1.5 flex items-center gap-1">
                  {newPassword && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 rounded-md text-stone-400 hover:text-[#0284c7] hover:bg-stone-100 transition-colors"
                      title="Salin password"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedNotification ? 'done' : 'content_copy'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-medium">Kekuatan Password:</span>
                    <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password Input */}
              {(mode !== 'edit-user' || newPassword.length > 0) && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ulangi Konfirmasi Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={mode !== 'edit-user' || newPassword.length > 0}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password yang sama"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono text-stone-800 bg-white focus:outline-none ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-emerald-400 focus:border-emerald-500 bg-emerald-50/20'
                        : 'border-stone-200 focus:border-[#0284c7]'
                    }`}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">
                      ⚠️ Password konfirmasi tidak sama dengan password baru!
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Konfirmasi password cocok!</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {mode !== 'reset-password' && (
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {mode === 'change-password' ? 'key' : mode === 'create-user' ? 'add_moderator' : 'save'}
                </span>
                <span>
                  {mode === 'change-password'
                    ? 'Simpan Password Baru'
                    : mode === 'create-user'
                    ? 'Buat Akun Sekarang'
                    : 'Simpan Perubahan Akun'}
                </span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
