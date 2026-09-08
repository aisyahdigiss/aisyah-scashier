import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CashierAccount } from '../../types';
import { AvatarPicker, CUTE_AVATAR_PRESETS } from '../common/AvatarPicker';

export const PengaturanScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    cashiers,
    activeCashier,
    setActiveCashierId,
    addCashier,
    updateCashier,
    deleteCashier,
    resetToDefaultData,
    storeStatus,
    setStoreOperationalStatus,
    setIsStoreLogoModalOpen,
    currentShift,
    setIsShiftModalOpen,
    shiftHistory,
    currentUser,
    users,
    logout,
    switchUser,
    eyeCareTheme,
    setEyeCareTheme,
    antiGlareFilter,
    setAntiGlareFilter,
    sidebarMode,
    setSidebarMode,
    zenFocusMode,
    setZenFocusMode,
    uiDensity,
    setUiDensity,
    playBeep,
    showToast,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<
    'profil' | 'pembayaran' | 'kasir' | 'shift' | 'akun' | 'tampilan'
  >('akun');

  // Form states for Profil Toko & Jam Operasional
  const [storeName, setStoreName] = useState(settings.storeName);
  const [branchName, setBranchName] = useState(settings.branchName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [openTime, setOpenTime] = useState(settings.openTime || '08:00');
  const [closeTime, setCloseTime] = useState(settings.closeTime || '22:00');
  const [closingWarningMinutes, setClosingWarningMinutes] = useState<number>(
    settings.closingWarningMinutes || 30
  );
  const [autoStatusByHours, setAutoStatusByHours] = useState<boolean>(
    settings.autoStatusByHours ?? true
  );
  const [closingNoticeText, setClosingNoticeText] = useState(
    settings.closingNoticeText ||
      'Perhatian: Toko akan segera tutup dalam waktu dekat. Pemesanan terakhir sedang berlangsung.'
  );

  // New Cashier Modal
  const [isAddCashierOpen, setIsAddCashierOpen] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierRole, setNewCashierRole] = useState<'Kasir' | 'Manager'>('Kasir');
  const [newCashierAvatar, setNewCashierAvatar] = useState(CUTE_AVATAR_PRESETS[0].url);

  // Edit Cashier Modal
  const [editingCashier, setEditingCashier] = useState<CashierAccount | null>(null);
  const [editCashierName, setEditCashierName] = useState('');
  const [editCashierRole, setEditCashierRole] = useState<'Kasir' | 'Manager'>('Kasir');
  const [editCashierAvatar, setEditCashierAvatar] = useState('');

  // Delete Cashier Confirmation Modal
  const [deletingCashier, setDeletingCashier] = useState<CashierAccount | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      branchName,
      phone,
      address,
      openTime,
      closeTime,
      closingWarningMinutes: Number(closingWarningMinutes) || 30,
      autoStatusByHours,
      closingNoticeText,
    });
  };

  const handleTogglePayment = (method: 'qris' | 'kartu' | 'tunai') => {
    updateSettings({
      paymentMethods: {
        ...settings.paymentMethods,
        [method]: !settings.paymentMethods[method],
      },
    });
  };

  const handleOpenAddCashier = () => {
    const randomPreset = CUTE_AVATAR_PRESETS[Math.floor(Math.random() * CUTE_AVATAR_PRESETS.length)].url;
    setNewCashierAvatar(randomPreset);
    setNewCashierName('');
    setNewCashierRole('Kasir');
    setIsAddCashierOpen(true);
  };

  const handleAddCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName.trim()) return;
    addCashier(newCashierName.trim(), newCashierRole, newCashierAvatar);
    setNewCashierName('');
    setIsAddCashierOpen(false);
  };

  const handleOpenEdit = (cashier: CashierAccount) => {
    setEditingCashier(cashier);
    setEditCashierName(cashier.name);
    setEditCashierRole(cashier.role);
    setEditCashierAvatar(cashier.avatarUrl);
  };

  const handleEditCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCashier || !editCashierName.trim()) return;
    updateCashier(editingCashier.id, {
      name: editCashierName.trim(),
      role: editCashierRole,
      avatarUrl: editCashierAvatar,
    });
    setEditingCashier(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCashier) return;
    deleteCashier(deletingCashier.id);
    setDeletingCashier(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
          Pengaturan Toko
        </h1>
        <p className="text-sm text-[#78716c] mt-1">
          Kelola profil toko, integrasi metode pembayaran, dan manajemen foto serta hak akses kasir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Store Profile Card & Navigation Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Store Info Card */}
          <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] text-center flex flex-col items-center">
            <div
              onClick={() => setIsStoreLogoModalOpen(true)}
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#dfd5c3] shadow-sm mb-3 bg-[#fdfbf7] ring-4 ring-[#fef9c3] cursor-pointer group/storelogo"
              title="Klik untuk ganti foto toko"
            >
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-full h-full object-cover group-hover/storelogo:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-stone-900/40 rounded-full opacity-0 group-hover/storelogo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                <span className="text-[10px] font-bold mt-0.5">Ubah Foto</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#292524]">{settings.storeName}</h3>
            <p className="text-xs font-semibold text-[#78716c] mt-0.5">{settings.branchName}</p>

            {/* Operational Status Pill */}
            <div className="mt-3 flex flex-col items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  storeStatus === 'BUKA'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : storeStatus === 'SEGERA_TUTUP'
                    ? 'bg-[#fef9c3] text-[#713f12] border-[#fde68a] animate-pulse'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>
                  {storeStatus === 'BUKA'
                    ? `Buka (${settings.openTime || '08:00'} - ${settings.closeTime || '22:00'})`
                    : storeStatus === 'SEGERA_TUTUP'
                    ? `Segera Tutup (${settings.closeTime || '22:00'})`
                    : `Tutup (Buka ${settings.openTime || '08:00'})`}
                </span>
              </span>

              {/* Direct Ganti Foto Button */}
              <button
                type="button"
                onClick={() => setIsStoreLogoModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#fdfbf7] hover:bg-[#fef9c3] text-[#713f12] text-xs font-bold border border-[#ede5d8] shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>Ganti Foto Toko</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-2.5 border border-[#ede5d8] shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('akun')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'akun'
                  ? 'bg-[#e0f2fe] text-[#0369a1] font-extrabold border border-[#bae6fd] shadow-2xs'
                  : 'text-[#0c4a6e] hover:bg-[#f0f9ff]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                  verified_user
                </span>
                <span>Super Admin & Akun Portal</span>
              </div>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-[#bae6fd] text-[#0284c7]">
                LOGIN
              </span>
            </button>

            <button
              onClick={() => setActiveTab('kasir')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'kasir'
                  ? 'bg-[#fef9c3] text-[#713f12] font-bold border border-[#fde68a] shadow-2xs'
                  : 'text-[#57534e] hover:bg-[#f7f3eb]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>Akun Kasir & Foto ({cashiers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profil')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'profil'
                  ? 'bg-[#fef9c3] text-[#713f12] font-bold border border-[#fde68a] shadow-2xs'
                  : 'text-[#57534e] hover:bg-[#f7f3eb]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              <span>Profil & Jam Operasional</span>
            </button>

            <button
              onClick={() => setActiveTab('shift')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'shift'
                  ? 'bg-[#fef9c3] text-[#713f12] font-bold border border-[#fde68a] shadow-2xs'
                  : 'text-[#57534e] hover:bg-[#f7f3eb]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
              <span>Shift & Laci Kasir</span>
            </button>

            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'pembayaran'
                  ? 'bg-[#fef9c3] text-[#713f12] font-bold border border-[#fde68a] shadow-2xs'
                  : 'text-[#57534e] hover:bg-[#f7f3eb]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span>Metode Pembayaran</span>
            </button>

            <button
              onClick={() => setActiveTab('tampilan')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'tampilan'
                  ? 'bg-[#e0f2fe] text-[#0369a1] font-bold border border-[#bae6fd] shadow-2xs'
                  : 'text-[#57534e] hover:bg-[#f7f3eb]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                  visibility
                </span>
                <span>Kenyamanan Mata & Tampilan</span>
              </div>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                RAMAH MATA
              </span>
            </button>
          </div>

          {/* Reset Demo Data Card */}
          <div className="bg-[#fdfbf7] rounded-3xl p-4 border border-[#ede5d8]">
            <p className="text-xs text-[#78716c] mb-2 font-medium">Pengaturan Data:</p>
            <button
              onClick={resetToDefaultData}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#f7f3eb] text-[#57534e] text-xs font-bold border border-[#ede5d8] transition-colors shadow-xs"
            >
              Reset Data ke Pengaturan Default
            </button>
          </div>
        </div>

        {/* Right Column: Active Tab Content (8 cols) */}
        <div className="lg:col-span-8">
          {/* Tab 0: Super Admin & Akun Portal */}
          {activeTab === 'akun' && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#ede7db] shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede7db]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#1c1917]">
                      Super Admin & Kredensial Login
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] whitespace-nowrap">
                      Kredensial Resmi
                    </span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    Kelola kredensial super admin, ganti akun staf, atau uji coba form login dan pendaftaran akun.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-all self-start whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Keluar / Tampilkan Form Login</span>
                </button>
              </div>

              {/* Super Admin Highlight Box */}
              <div className="p-5 rounded-xl bg-[#fcfbf9] border border-[#e2dbcc]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white p-1 border border-[#e2dbcc] shadow-2xs shrink-0 overflow-hidden">
                      <img
                        src="https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd"
                        alt="Aisyah Sya"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1c1917]">
                          Aisyah Sya (Super Admin)
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0284c7] text-white whitespace-nowrap">
                          UTAMA
                        </span>
                      </div>
                      <p className="text-xs text-[#57534e] mt-0.5">
                        Pemilik Toko & Hak Akses Tertinggi Sistem POS
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs font-medium text-[#57534e]">
                        <span>
                          Username: <strong className="font-mono text-[#0284c7]">aisyahsya</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Password:{' '}
                          <strong className="font-mono text-[#0284c7]">aisyahsyadec242025</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-[#78716c]">
                      Email: aisyahdigiss@gmail.com
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const superAdmin = users.find((u) => u.username === 'aisyahsya');
                        if (superAdmin) switchUser(superAdmin.id);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      <span>Aktifkan Sebagai User Ini</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Registered Users List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#57534e]">
                  Daftar Seluruh Akun Pengguna Terdaftar ({users.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {users.map((user) => {
                    const isCurrent = currentUser?.id === user.id;

                    return (
                      <div
                        key={user.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-[#f0f9ff] border-[#bae6fd] shadow-xs'
                            : 'bg-[#ffffff] border-[#ede7db] hover:bg-[#fcfbf9]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-[#e2dbcc] shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#1c1917] truncate">
                              {user.fullName}
                            </p>
                            <p className="text-[10px] font-mono text-[#78716c]">@{user.username}</p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#e0f2fe] text-[#0369a1] whitespace-nowrap">
                              {user.role}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isCurrent ? (
                            <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 whitespace-nowrap">
                              Sedang Aktif
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => switchUser(user.id)}
                              className="px-3 py-1.5 rounded-md bg-white hover:bg-stone-50 text-[#0284c7] text-xs font-bold border border-[#bae6fd] transition-colors whitespace-nowrap"
                            >
                              Ganti Akun
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Akun Kasir */}
          {activeTab === 'kasir' && (
            <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 md:p-8 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede5d8]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#292524]">Manajemen Akun Kasir</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                      Foto & Avatar
                    </span>
                  </div>
                  <p className="text-xs text-[#78716c] mt-0.5">
                    Ganti foto profil (upload atau pilih avatar), edit nama/peran, atau tambah kasir baru.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddCashier}
                  className="px-4 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold flex items-center gap-1.5 self-start shadow-2xs transition-all active:scale-95 border border-[#fde68a]"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>+ Tambah Kasir</span>
                </button>
              </div>

              <div className="space-y-3">
                {cashiers.map((cashier) => {
                  const isActive = cashier.id === activeCashier.id;

                  return (
                    <div
                      key={cashier.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                        isActive
                          ? 'bg-[#fef9c3]/70 border-[#eab308] shadow-xs'
                          : 'bg-[#fdfbf7] hover:bg-[#f7f3eb] border-[#ede5d8]'
                      }`}
                    >
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Interactive Avatar with Quick Change Trigger */}
                        <div
                          onClick={() => handleOpenEdit(cashier)}
                          className="relative cursor-pointer shrink-0 group/avatar"
                          title="Klik untuk ganti foto kasir"
                        >
                          <img
                            src={cashier.avatarUrl}
                            alt={cashier.name}
                            className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs group-hover/avatar:ring-2 group-hover/avatar:ring-[#eab308] transition-all"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = CUTE_AVATAR_PRESETS[0].url;
                            }}
                          />
                          <div className="absolute inset-0 bg-stone-900/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-[#292524] truncate">{cashier.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cashier.role === 'Manager'
                                  ? 'bg-[#713f12] text-white'
                                  : 'bg-[#fef9c3] text-[#713f12] border border-[#fde68a]'
                              }`}
                            >
                              {cashier.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-[#78716c]">
                              {isActive ? 'Sedang aktif di terminal ini' : 'Akun terdaftar'}
                            </p>
                            <button
                              onClick={() => handleOpenEdit(cashier)}
                              className="text-[11px] font-bold text-[#854d0e] hover:text-[#713f12] hover:underline flex items-center gap-0.5"
                            >
                              <span>Ganti Foto</span>
                              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Select/Active Status */}
                        {isActive ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#fef9c3] text-[#713f12] flex items-center gap-1 border border-[#fde68a]">
                            <span className="w-2 h-2 rounded-full bg-amber-600" />
                            Aktif
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveCashierId(cashier.id)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#fef9c3] text-[#713f12] font-bold text-xs border border-[#ede5d8] transition-colors shadow-xs"
                          >
                            Pilih Akun
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(cashier)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#fef9c3] text-[#292524] font-semibold text-xs border border-[#ede5d8] transition-colors flex items-center gap-1 shadow-xs"
                          title={`Edit ${cashier.name}`}
                          aria-label={`Edit ${cashier.name}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingCashier(cashier)}
                          disabled={cashiers.length <= 1}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            cashiers.length <= 1
                              ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                              : 'bg-white hover:bg-rose-50 text-[#78716c] hover:text-rose-600 border-[#ede5d8] hover:border-rose-200'
                          }`}
                          title={
                            cashiers.length <= 1
                              ? 'Minimal harus ada 1 akun kasir'
                              : `Hapus ${cashier.name}`
                          }
                          aria-label={`Hapus ${cashier.name}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Profil Toko & Jam Operasional */}
          {activeTab === 'profil' && (
            <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 md:p-8 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] space-y-6">
              <div className="pb-4 border-b border-[#ede5d8]">
                <h3 className="text-xl font-bold text-[#292524]">Profil & Jam Operasional Outlet</h3>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Atur identitas toko, logo/foto outlet, serta jadwal buka dan notifikasi peringatan mau tutup kasir.
                </p>
              </div>

              {/* Store Photo Management Card */}
              <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#dfd5c3] shadow-xs bg-white shrink-0">
                    <img
                      src={settings.logoUrl}
                      alt={settings.storeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#292524]">Foto / Logo Outlet Saat Ini</h4>
                    <p className="text-xs text-[#78716c] mt-0.5">
                      Pilih dari koleksi foto cafe estetik, upload file gambar, atau gunakan link URL
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStoreLogoModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_library</span>
                  <span>Ganti Foto Toko</span>
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Store Identitas */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
                    Informasi Kontak Toko (Struk & Nota)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                        Nama Toko / Outlet
                      </label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                        Nama Cabang
                      </label>
                      <input
                        type="text"
                        required
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                      Alamat Lengkap Toko
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm text-[#292524] outline-none focus:border-[#eab308]"
                    />
                  </div>
                </div>

                {/* Jam Operasional & Status Warning Toko */}
                <div className="pt-4 border-t border-[#ede5d8] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
                        Jadwal Jam Operasional & Peringatan Mau Tutup
                      </h4>
                      <p className="text-xs text-[#78716c] mt-0.5">
                        Sistem kasir akan otomatis memunculkan banner peringatan saat toko mendekati jam tutup
                      </p>
                    </div>

                    {/* Auto Mode Switch */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-xs font-semibold text-[#57534e]">Otomatis Ikuti Jam:</span>
                      <input
                        type="checkbox"
                        checked={autoStatusByHours}
                        onChange={(e) => setAutoStatusByHours(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                        Jam Buka Toko
                      </label>
                      <input
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                        Jam Tutup Toko
                      </label>
                      <input
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                        Peringatan Mau Tutup
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={closingWarningMinutes}
                          onChange={(e) => setClosingWarningMinutes(Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
                        />
                        <span className="text-xs font-semibold text-[#78716c] shrink-0">menit sblm tutup</span>
                      </div>
                    </div>
                  </div>

                  {/* Keterangan Mau Tutup Input */}
                  <div>
                    <label className="text-xs font-bold text-[#57534e] block mb-1.5">
                      Pesan Keterangan / Pengumuman Saat Mau Tutup
                    </label>
                    <input
                      type="text"
                      value={closingNoticeText}
                      onChange={(e) => setClosingNoticeText(e.target.value)}
                      placeholder="Contoh: Perhatian: Outlet akan segera tutup dalam waktu dekat. Pemesanan terakhir sedang berlangsung."
                      className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-xs font-medium text-[#292524] outline-none focus:border-[#eab308]"
                    />
                  </div>

                  {/* Manual Quick Overrides */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-[#57534e] block mb-2">
                      Kontrol Manual Status Toko Saat Ini:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setStoreOperationalStatus('BUKA')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          storeStatus === 'BUKA'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                            : 'bg-white text-stone-600 border-[#ede5d8] hover:bg-emerald-50'
                        }`}
                      >
                        🟢 Buka Operasional
                      </button>

                      <button
                        type="button"
                        onClick={() => setStoreOperationalStatus('SEGERA_TUTUP')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          storeStatus === 'SEGERA_TUTUP'
                            ? 'bg-[#fef9c3] text-[#713f12] border-[#fde68a] shadow-2xs'
                            : 'bg-white text-stone-600 border-[#ede5d8] hover:bg-[#fef9c3]'
                        }`}
                      >
                        🟡 Segera Tutup (Last Order)
                      </button>

                      <button
                        type="button"
                        onClick={() => setStoreOperationalStatus('TUTUP')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          storeStatus === 'TUTUP'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                            : 'bg-white text-stone-600 border-[#ede5d8] hover:bg-rose-50'
                        }`}
                      >
                        🔴 Toko Tutup
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-sm shadow-2xs transition-all active:scale-95 border border-[#fde68a]"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Shift & Laci Kasir */}
          {activeTab === 'shift' && (
            <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 md:p-8 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] space-y-6">
              <div className="pb-4 border-b border-[#ede5d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#292524]">Manajemen Shift & Laci Kasir</h3>
                  <p className="text-xs text-[#78716c] mt-0.5">
                    Kelola pergantian shift kasir, rekonsiliasi kas tunai (Z-Report), dan laporan serah terima laci.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(true)}
                  className="px-4 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Tutup Shift & Z-Report</span>
                </button>
              </div>

              {/* Active Shift Dashboard */}
              <div className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#ede5d8] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a]">
                      <span className="material-symbols-outlined text-[22px]">timer</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#292524]">Shift Berjalan Sekarang</h4>
                      <p className="text-xs text-[#78716c]">
                        Kasir Bertugas: <strong>{activeCashier.name}</strong> • Mulai: {currentShift?.startTime}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Aktif
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-2xl border border-[#ede5d8]">
                    <span className="text-[11px] text-[#78716c] font-medium block">Modal Awal Laci</span>
                    <span className="text-sm font-bold text-[#292524] mt-0.5 block">
                      Rp {(currentShift?.startingCash || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-[#ede5d8]">
                    <span className="text-[11px] text-[#78716c] font-medium block">Penjualan Tunai</span>
                    <span className="text-sm font-bold text-amber-800 mt-0.5 block">
                      Rp {(currentShift?.totalCashSales || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-[#ede5d8]">
                    <span className="text-[11px] text-[#78716c] font-medium block">Non-Tunai (QRIS/Card)</span>
                    <span className="text-sm font-bold text-[#292524] mt-0.5 block">
                      Rp {(currentShift?.totalNonCashSales || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="p-3 bg-[#fef9c3]/70 rounded-2xl border border-[#fde68a]">
                    <span className="text-[11px] text-[#713f12] font-semibold block">Estimasi Kas di Laci</span>
                    <span className="text-sm font-extrabold text-[#713f12] mt-0.5 block">
                      Rp {(currentShift?.expectedCash || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shift History Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
                  Riwayat Tutup Shift Kasir Sebelumnya
                </h4>

                {shiftHistory.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] text-xs text-[#78716c]">
                    Belum ada riwayat penutupan shift. Setelah tutup shift pertama dicatat, laporannya akan muncul di sini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[11px] font-bold text-[#78716c] uppercase border-b border-[#ede5d8] bg-[#fdfbf7]">
                        <tr>
                          <th className="p-3">Waktu Shift</th>
                          <th className="p-3">Kasir</th>
                          <th className="p-3">Modal Awal</th>
                          <th className="p-3">Penjualan Tunai</th>
                          <th className="p-3">Fisik Diserahkan</th>
                          <th className="p-3">Selisih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ede5d8]">
                        {shiftHistory.map((s) => (
                          <tr key={s.id} className="hover:bg-[#fdfbf7]">
                            <td className="p-3 font-semibold text-[#292524]">
                              {s.startTime} - {s.endTime}
                            </td>
                            <td className="p-3">{s.cashierName}</td>
                            <td className="p-3">Rp {s.startingCash.toLocaleString('id-ID')}</td>
                            <td className="p-3 font-bold text-amber-800">
                              Rp {s.totalCashSales.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3 font-bold text-[#292524]">
                              Rp {(s.actualCashEnding || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold ${
                                  (s.difference || 0) === 0
                                    ? 'bg-green-100 text-green-800'
                                    : (s.difference || 0) > 0
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {(s.difference || 0) === 0
                                  ? 'Pas (Rp 0)'
                                  : `Rp ${(s.difference || 0).toLocaleString('id-ID')}`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Metode Pembayaran */}
          {activeTab === 'pembayaran' && (
            <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 md:p-8 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] space-y-6">
              <div className="pb-4 border-b border-[#ede5d8]">
                <h3 className="text-xl font-bold text-[#292524]">Metode Pembayaran</h3>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Aktifkan saluran penerimaan pembayaran yang tersedia di kasir.
                </p>
              </div>

              <div className="space-y-4">
                {/* QRIS Switch */}
                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a]">
                      <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#292524]">QRIS Dinamis</h4>
                      <p className="text-xs text-[#78716c]">
                        Terima pembayaran otomatis via GoPay, OVO, Dana, ShopeePay, dan m-Banking.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePayment('qris')}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                      settings.paymentMethods.qris ? 'bg-[#fef08a] border border-[#fde68a]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        settings.paymentMethods.qris ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Kartu Kredit/Debit Switch */}
                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a]">
                      <span className="material-symbols-outlined text-[24px]">credit_card</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#292524]">Kartu Kredit / Debit</h4>
                      <p className="text-xs text-[#78716c]">
                        Memerlukan mesin EDC terhubung untuk input nomor referensi otorisasi.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePayment('kartu')}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                      settings.paymentMethods.kartu ? 'bg-[#fef08a] border border-[#fde68a]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        settings.paymentMethods.kartu ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Tunai Switch */}
                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a]">
                      <span className="material-symbols-outlined text-[24px]">payments</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#292524]">Uang Tunai (Cash)</h4>
                      <p className="text-xs text-[#78716c]">
                        Metode pembayaran default dengan kalkulator kembalian otomatis.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePayment('tunai')}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                      settings.paymentMethods.tunai ? 'bg-[#fef08a] border border-[#fde68a]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        settings.paymentMethods.tunai ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Kenyamanan Mata & Tampilan */}
          {activeTab === 'tampilan' && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#ede7db] shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede7db]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#1c1917]">
                      Kenyamanan Mata & Estetika Tampilan
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                      Eye-Care Kalibrasi
                    </span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    Atur palet warna ramah mata, filter anti-silau cahaya biru, serta tata letak menu samping dan hamburger.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span className="text-xs font-medium text-[#78716c]">Tema aktif:</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                    {eyeCareTheme}
                  </span>
                </div>
              </div>

              {/* 1. Palet Warna Ramah Mata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wider">
                    1. Pilihan Palet Warna (Bebas Silau / Glare-Free)
                  </h4>
                  <span className="text-xs text-[#78716c]">4 Pilihan Kalibrasi Visual</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'warm-beige' as const,
                      name: 'Kertas Hangat (Warm Beige)',
                      desc: 'Warna dasar kertas alami yang lembut, menyejukkan mata untuk shift pagi dan siang.',
                      icon: 'eco',
                      badge: 'Standar Toko',
                      bgClass: 'bg-[#f6f4ee]',
                      borderClass: 'border-[#ede7db]',
                    },
                    {
                      id: 'matcha-sage' as const,
                      name: 'Matcha Sage (Paling Menenangkan)',
                      desc: 'Spektrum hijau sage redup terbukti klinis menurunkan ketegangan retina kasir.',
                      icon: 'spa',
                      badge: 'Rekomendasi Utama',
                      bgClass: 'bg-[#eff5ee]',
                      borderClass: 'border-[#d7e4d5]',
                    },
                    {
                      id: 'slate-charcoal' as const,
                      name: 'Slate Charcoal (Mode Redup Hangat)',
                      desc: 'Mode malam terkalibrasi lembut tanpa kontras hitam pekat yang menyilaukan.',
                      icon: 'dark_mode',
                      badge: 'Shift Malam',
                      bgClass: 'bg-[#18181b]',
                      borderClass: 'border-[#3f3f46]',
                    },
                    {
                      id: 'nordic-sky' as const,
                      name: 'Nordic Sky (Pastel Sejuk)',
                      desc: 'Nuansa biru pastel Skandinavia yang bersih, cerah, dan menyejukkan pandangan.',
                      icon: 'air',
                      badge: 'Elegan & Tenang',
                      bgClass: 'bg-[#eff5f9]',
                      borderClass: 'border-[#d7e5f0]',
                    },
                  ].map((t) => {
                    const isSelected = eyeCareTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setEyeCareTheme(t.id);
                          playBeep('beep');
                          showToast(`Tema diterapkan: ${t.name}`, 'info');
                        }}
                        className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-[#0284c7] bg-[#f0f9ff] ring-2 ring-[#e0f2fe]'
                            : 'border-[#ede7db] bg-[#fcfbf9] hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg ${t.bgClass} border ${t.borderClass} shadow-2xs flex items-center justify-center`}
                            >
                              <span
                                className={`material-symbols-outlined text-[16px] ${
                                  t.id === 'slate-charcoal' ? 'text-white' : 'text-stone-700'
                                }`}
                              >
                                {t.icon}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#1c1917]">{t.name}</span>
                          </div>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                              check_circle
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#78716c] leading-relaxed">{t.desc}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-[#ede7db]/50">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-stone-600 border border-[#ede7db]">
                            {t.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Filter Anti-Silau (Blue Light Reduction) */}
              <div className="p-4 rounded-xl bg-[#fcfbf9] border border-[#ede7db] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                    <span className="material-symbols-outlined text-[22px]">wb_twilight</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#1c1917]">
                        Filter Anti-Silau (Night Shift / Peredam Cahaya Biru)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Optik Retina
                      </span>
                    </div>
                    <p className="text-xs text-[#78716c] mt-0.5 max-w-xl">
                      Menurunkan emisi spektrum biru tajam langsung dari layar kasir. Sangat cocok bagi kasir yang menatap layar lebih dari 6 jam sehari untuk mencegah mata lelah dan pusing.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAntiGlareFilter((prev) => !prev);
                    playBeep('beep');
                    showToast(
                      !antiGlareFilter ? 'Filter anti-silau diaktifkan' : 'Filter anti-silau dinonaktifkan',
                      'info'
                    );
                  }}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shrink-0 border ${
                    antiGlareFilter ? 'bg-[#0284c7] border-[#0284c7]' : 'bg-stone-300 border-stone-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white transition-transform shadow-xs ${
                      antiGlareFilter ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 3. Mode Bilah Sisi & Hamburger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wider">
                    2. Tata Letak Bilah Menu Sisi (Sidebar & Hamburger)
                  </h4>
                  <span className="text-xs text-[#78716c]">Tombol Hamburger tersedia di Navbar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'expanded' as const,
                      title: 'Bilah Penuh (Standar)',
                      desc: 'Lebar 260px dengan teks menu dan lencana stok lengkap.',
                      icon: 'side_navigation',
                    },
                    {
                      id: 'compact' as const,
                      title: 'Bilah Ringkas (Ikon Saja)',
                      desc: 'Lebar 74px minimalis untuk menghemat ruang layar kasir.',
                      icon: 'dock_to_right',
                    },
                    {
                      id: 'hidden' as const,
                      title: 'Tersembunyi Penuh',
                      desc: 'Bilah menu hanya terbuka saat menekan tombol Hamburger.',
                      icon: 'menu',
                    },
                  ].map((m) => {
                    const isActive = sidebarMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSidebarMode(m.id);
                          playBeep('beep');
                          showToast(`Mode menu: ${m.title}`, 'info');
                        }}
                        className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-all ${
                          isActive
                            ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-bold shadow-xs'
                            : 'border-[#ede7db] bg-[#fcfbf9] text-[#57534e] hover:bg-stone-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">{m.icon}</span>
                        <span className="text-xs font-bold text-[#1c1917]">{m.title}</span>
                        <span className="text-[11px] text-[#78716c] leading-relaxed">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Mode Fokus Zen & Kepadatan Tampilan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-[#ede7db] bg-[#fcfbf9] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                        center_focus_strong
                      </span>
                      <h4 className="text-sm font-bold text-[#1c1917]">Mode Fokus Zen</h4>
                    </div>
                    <p className="text-xs text-[#78716c] mt-1 leading-relaxed">
                      Sembunyikan bilah sisi dan maksimalkan layar kasir 100% untuk kecepatan transaksi bebas distraksi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setZenFocusMode((prev) => !prev);
                      playBeep('beep');
                      showToast(
                        !zenFocusMode ? 'Mode Fokus Zen diaktifkan' : 'Mode Fokus Zen dinonaktifkan',
                        'info'
                      );
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      zenFocusMode
                        ? 'bg-[#0284c7] text-white border-[#0284c7]'
                        : 'bg-white text-[#57534e] border-[#ede7db] hover:bg-stone-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {zenFocusMode ? 'check' : 'power_settings_new'}
                    </span>
                    <span>{zenFocusMode ? 'Mode Fokus Zen Sedang Aktif' : 'Aktifkan Mode Fokus Zen'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-[#ede7db] bg-[#fcfbf9] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                        density_medium
                      </span>
                      <h4 className="text-sm font-bold text-[#1c1917]">Kepadatan Tampilan</h4>
                    </div>
                    <p className="text-xs text-[#78716c] mt-1 leading-relaxed">
                      Atur kerapatan antarmuka kartu produk untuk kenyamanan jarak pandang mata.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUiDensity('relaxed');
                        playBeep('beep');
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors text-center ${
                        uiDensity === 'relaxed'
                          ? 'bg-[#0284c7] text-white border-[#0284c7]'
                          : 'bg-white text-[#57534e] border-[#ede7db] hover:bg-stone-50'
                      }`}
                    >
                      Nyaman & Luas
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUiDensity('compact');
                        playBeep('beep');
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors text-center ${
                        uiDensity === 'compact'
                          ? 'bg-[#0284c7] text-white border-[#0284c7]'
                          : 'bg-white text-[#57534e] border-[#ede7db] hover:bg-stone-50'
                      }`}
                    >
                      Padat & Rapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Cashier Modal */}
      {isAddCashierOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-md w-full border border-[#ede5d8] shadow-2xl space-y-4 my-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#fef9c3] text-[#713f12] flex items-center justify-center font-bold text-sm border border-[#fde68a]">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#292524]">Tambah Akun Kasir Baru</h2>
                  <p className="text-[11px] text-[#78716c] font-medium">Lengkapi nama dan foto avatar</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCashierOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#f7f3eb]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCashierSubmit} className="space-y-4">
              {/* Avatar Selector Component */}
              <AvatarPicker
                currentAvatar={newCashierAvatar}
                onAvatarChange={setNewCashierAvatar}
                cashierName={newCashierName || 'Kasir Baru'}
              />

              <div>
                <label className="text-xs font-bold text-[#57534e] block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newCashierName}
                  onChange={(e) => setNewCashierName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#fde68a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#57534e] block mb-1">Peran / Role</label>
                <select
                  value={newCashierRole}
                  onChange={(e) => setNewCashierRole(e.target.value as 'Kasir' | 'Manager')}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#fde68a]"
                >
                  <option value="Kasir">Kasir (Melayani Penjualan)</option>
                  <option value="Manager">Manager (Akses Penuh & Laporan)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede5d8]">
                <button
                  type="button"
                  onClick={() => setIsAddCashierOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] text-xs font-bold transition-colors border border-[#ede5d8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold shadow-2xs transition-all active:scale-95 border border-[#fde68a]"
                >
                  Daftarkan Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cashier Modal */}
      {editingCashier && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-md w-full border border-[#ede5d8] shadow-2xl space-y-4 my-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#fef9c3] text-[#713f12] flex items-center justify-center font-bold text-sm border border-[#fde68a]">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#292524]">Ubah Foto & Data Kasir</h2>
                  <p className="text-[11px] text-[#78716c] font-medium">{editingCashier.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCashier(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#f7f3eb]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditCashierSubmit} className="space-y-4">
              {/* Interactive Avatar Picker Component */}
              <AvatarPicker
                currentAvatar={editCashierAvatar}
                onAvatarChange={setEditCashierAvatar}
                cashierName={editCashierName}
              />

              <div>
                <label className="text-xs font-bold text-[#57534e] block mb-1">
                  Nama Kasir / Staf
                </label>
                <input
                  type="text"
                  required
                  value={editCashierName}
                  onChange={(e) => setEditCashierName(e.target.value)}
                  placeholder="Masukkan nama kasir"
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#fde68a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#57534e] block mb-1">Peran / Role</label>
                <select
                  value={editCashierRole}
                  onChange={(e) => setEditCashierRole(e.target.value as 'Kasir' | 'Manager')}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#fde68a]"
                >
                  <option value="Kasir">Kasir (Melayani Penjualan)</option>
                  <option value="Manager">Manager (Akses Penuh & Laporan)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede5d8]">
                <button
                  type="button"
                  onClick={() => setEditingCashier(null)}
                  className="px-4 py-2.5 rounded-full bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] text-xs font-bold transition-colors border border-[#ede5d8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold shadow-2xs transition-all active:scale-95 border border-[#fde68a]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Cashier Confirmation Modal */}
      {deletingCashier && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-sm w-full border border-[#ede5d8] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-[#292524]">Hapus Akun Kasir?</h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-[#292524]">"{deletingCashier.name}"</span>? Akun ini tidak dapat dipulihkan kembali.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCashier(null)}
                className="flex-1 py-2.5 rounded-full bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] text-xs font-bold transition-colors border border-[#ede5d8]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
