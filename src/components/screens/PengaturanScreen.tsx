import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CashierAccount, AuthUser } from '../../types';
import { AvatarPicker, CUTE_AVATAR_PRESETS } from '../common/AvatarPicker';
import { SuperAdminPasswordModal, SuperAdminModalMode } from '../modals/SuperAdminPasswordModal';

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
    deleteUser,
    eyeCareTheme,
    setEyeCareTheme,
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    antiGlareFilter,
    setAntiGlareFilter,
    sidebarMode,
    setSidebarMode,
    zenFocusMode,
    setZenFocusMode,
    uiDensity,
    setUiDensity,
    activePrinter,
    printerList,
    isPrinterScanning,
    printerConfig,
    printerLogs,
    clearPrinterLogs,
    openPrinterModal,
    autoDetectPrinter,
    connectBluetoothPrinter,
    connectUsbPrinter,
    disconnectPrinter,
    setPrinterPaperWidth,
    updatePrinterConfig,
    printTestReceipt,
    playBeep,
    showToast,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<
    'profil' | 'pembayaran' | 'kasir' | 'shift' | 'akun' | 'tampilan' | 'printer'
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

  // Delete User Confirmation Modal
  const [deletingUser, setDeletingUser] = useState<AuthUser | null>(null);

  // Super Admin Password & Account CRUD Modal state
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [superAdminModalMode, setSuperAdminModalMode] = useState<SuperAdminModalMode>('change-password');
  const [selectedSuperAdminUser, setSelectedSuperAdminUser] = useState<AuthUser | null>(null);

  // Read: Password visibility & copy feedback state
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // User list filter & search
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'Super Admin' | 'Manager' | 'Kasir'>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyText = (text: string, id: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playBeep('beep');
    showToast(`${label} disalin ke clipboard!`, 'info');
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const handleOpenChangePassword = (user: AuthUser) => {
    setSelectedSuperAdminUser(user);
    setSuperAdminModalMode('change-password');
    setIsSuperAdminModalOpen(true);
  };

  const handleOpenCreateUser = () => {
    setSelectedSuperAdminUser(null);
    setSuperAdminModalMode('create-user');
    setIsSuperAdminModalOpen(true);
  };

  const handleOpenEditUser = (user: AuthUser) => {
    setSelectedSuperAdminUser(user);
    setSuperAdminModalMode('edit-user');
    setIsSuperAdminModalOpen(true);
  };

  const handleOpenResetPassword = (user: AuthUser) => {
    setSelectedSuperAdminUser(user);
    setSuperAdminModalMode('reset-password');
    setIsSuperAdminModalOpen(true);
  };

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

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id);
    setDeletingUser(null);
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

          {/* Quick Hardware Printer Status Card */}
          <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-4 border border-[#ede5d8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                  print
                </span>
                <h4 className="text-xs font-bold text-[#1c1917]">Printer Struk Kasir</h4>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activePrinter
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {activePrinter ? '● Terhubung' : 'Terputus'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#fcfbf9] border border-[#ede7db] text-xs">
              <p className="font-bold text-[#1c1917] truncate">
                {activePrinter ? activePrinter.name : 'Belum Ada Printer Mini Terhubung'}
              </p>
              <p className="text-[10px] text-[#78716c] mt-0.5">
                Kertas: {activePrinter?.paperWidth || printerConfig.paperWidth}mm • Auto-Print:{' '}
                {printerConfig.autoPrintOnPayment ? 'Aktif' : 'Nonaktif'}
              </p>
            </div>

            <button
              type="button"
              onClick={openPrinterModal}
              className="w-full py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] text-xs font-bold border border-sky-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">bluetooth_searching</span>
              <span>Kelola & Pindai Printer</span>
            </button>
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

            <button
              onClick={() => setActiveTab('printer')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'printer'
                  ? 'bg-[#e0f2fe] text-[#0369a1] font-bold border border-[#bae6fd] shadow-2xs'
                  : 'text-[#57534e] hover:bg-[#f7f3eb]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[20px] text-[#0284c7] ${isPrinterScanning ? 'animate-spin' : ''}`}>
                  print
                </span>
                <span>Printer Mini & Bluetooth</span>
              </div>
              <span
                className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                  activePrinter
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {activePrinter ? 'AKTIF' : 'AUTO-SCAN'}
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
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ede7db] shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#ede7db]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-[#1c1917]">
                      Super Admin & Manajemen Password
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] whitespace-nowrap">
                      CRUD Password & Akses
                    </span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    Kelola penuh kata sandi super admin (Lihat, Ubah, Reset, Buat baru), salin kredensial, dan kontrol akses staf.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenCreateUser}
                    className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>+ Tambah Super Admin / Akun</span>
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Kunci / Keluar</span>
                  </button>
                </div>
              </div>

              {/* Super Admin Highlight Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#0369a1] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#0284c7]">
                      verified_user
                    </span>
                    <span>Akun Super Admin Utama ({users.filter((u) => u.role === 'Super Admin').length})</span>
                  </h4>
                  <span className="text-[11px] text-[#78716c]">
                    Hak Akses Tertinggi & Hak Penuh
                  </span>
                </div>

                {users
                  .filter((u) => u.role === 'Super Admin')
                  .map((admin) => {
                    const isCurrent = currentUser?.id === admin.id;
                    const isVisible = !!visiblePasswords[admin.id];
                    const adminPw =
                      admin.password ||
                      (admin.username.toLowerCase() === 'aisyahsya'
                        ? 'aisyahsyadec242025'
                        : 'password123');

                    return (
                      <div
                        key={admin.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-linear-to-r from-[#f0f9ff] via-[#f8fafc] to-[#f0fdf4] border-[#bae6fd] shadow-sm'
                            : 'bg-[#fcfbf9] border-[#e2dbcc] hover:border-[#bae6fd]'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          {/* User identity */}
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="relative">
                              <img
                                src={admin.avatarUrl}
                                alt={admin.fullName}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                                }}
                              />
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[11px] shadow-xs">
                                <span className="material-symbols-outlined text-[12px]">
                                  verified
                                </span>
                              </span>
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-extrabold text-[#1c1917] truncate">
                                  {admin.fullName}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0284c7] text-white shadow-2xs">
                                  SUPER ADMIN
                                </span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    ● Sedang Aktif
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57534e]">
                                <span className="flex items-center gap-1 font-mono">
                                  <strong className="text-[#0284c7]">@{admin.username}</strong>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyText(admin.username, `user-${admin.id}`, 'Username')
                                    }
                                    className="text-stone-400 hover:text-[#0284c7] p-0.5 rounded"
                                    title="Salin Username"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      {copiedId === `user-${admin.id}` ? 'done' : 'content_copy'}
                                    </span>
                                  </button>
                                </span>
                                {admin.email && (
                                  <span className="text-stone-500">📧 {admin.email}</span>
                                )}
                                {admin.phone && (
                                  <span className="text-stone-500">📞 {admin.phone}</span>
                                )}
                              </div>

                              {/* Password interactive box (CRUD: Read & Copy) */}
                              <div className="pt-2">
                                <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-white border border-[#e2dbcc] shadow-2xs">
                                  <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-[#0284c7]">
                                      lock
                                    </span>
                                    <span>Password:</span>
                                  </span>

                                  <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-stone-50 text-[#0c4a6e] border border-stone-200">
                                    {isVisible ? adminPw : '••••••••••••••••'}
                                  </span>

                                  {/* Read toggle */}
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(admin.id)}
                                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                                    title={isVisible ? 'Sembunyikan Password' : 'Lihat Password'}
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {isVisible ? 'visibility_off' : 'visibility'}
                                    </span>
                                  </button>

                                  {/* Copy password */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyText(adminPw, `pw-${admin.id}`, 'Password Super Admin')
                                    }
                                    className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] text-[11px] font-bold flex items-center gap-1 transition-colors"
                                    title="Salin Password ke Clipboard"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      {copiedId === `pw-${admin.id}` ? 'done' : 'content_copy'}
                                    </span>
                                    <span>
                                      {copiedId === `pw-${admin.id}` ? 'Tersalin!' : 'Salin'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons for Super Admin (CRUD: Update, Reset, Delete, Switch) */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                            {/* Update Password */}
                            <button
                              type="button"
                              onClick={() => handleOpenChangePassword(admin)}
                              className="px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[16px]">key</span>
                              <span>Ubah Password</span>
                            </button>

                            {/* Edit Profile */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(admin)}
                              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold border border-stone-200 transition-colors shadow-2xs flex items-center gap-1"
                              title="Edit Profil Super Admin"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>Edit</span>
                            </button>

                            {/* Reset Password to default */}
                            <button
                              type="button"
                              onClick={() => handleOpenResetPassword(admin)}
                              className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-700 hover:text-amber-800 text-xs font-bold border border-amber-200 transition-colors shadow-2xs flex items-center gap-1"
                              title="Reset Password ke default awal"
                            >
                              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                              <span>Reset</span>
                            </button>

                            {/* Switch active user */}
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => switchUser(admin.id)}
                                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs flex items-center gap-1"
                                title="Gunakan akun ini sekarang"
                              >
                                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                                <span>Aktifkan</span>
                              </button>
                            )}

                            {/* Delete Super Admin (only if multiple exist) */}
                            {users.filter((u) => u.role === 'Super Admin').length > 1 && (
                              <button
                                type="button"
                                onClick={() => setDeletingUser(admin)}
                                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 hover:border-rose-300 transition-colors shadow-2xs"
                                title="Hapus akun Super Admin ini"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* All Registered Users Section */}
              <div className="space-y-4 pt-4 border-t border-[#ede7db]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                        badge
                      </span>
                      <span>Daftar Seluruh Pengguna & Kredensial ({users.length})</span>
                    </h4>
                    <p className="text-xs text-[#57534e]">
                      Lihat, ubah kata sandi, atau edit profil akun staf kasir dan manajer.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 p-1 bg-[#f5f0e6] rounded-xl border border-[#ede5d8] overflow-x-auto">
                    {(['ALL', 'Super Admin', 'Manager', 'Kasir'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setUserRoleFilter(role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          userRoleFilter === role
                            ? 'bg-white text-[#0c4a6e] shadow-2xs border border-[#bae6fd]'
                            : 'text-[#78716c] hover:text-[#292524]'
                        }`}
                      >
                        {role === 'ALL' ? `Semua (${users.length})` : role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-stone-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama lengkap, username, atau email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede5d8] focus:outline-none focus:border-[#0284c7] text-xs text-stone-800 bg-white"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                {/* Users List Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {users
                    .filter((u) => {
                      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                      if (!userSearchQuery) return true;
                      const q = userSearchQuery.toLowerCase();
                      return (
                        u.fullName.toLowerCase().includes(q) ||
                        u.username.toLowerCase().includes(q) ||
                        (u.email && u.email.toLowerCase().includes(q))
                      );
                    })
                    .map((user) => {
                      const isCurrent = currentUser?.id === user.id;
                      const isVisible = !!visiblePasswords[user.id];
                      const userPw =
                        user.password ||
                        (user.username.toLowerCase() === 'aisyahsya'
                          ? 'aisyahsyadec242025'
                          : 'password123');

                      return (
                        <div
                          key={user.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            isCurrent
                              ? 'bg-[#f0f9ff] border-[#bae6fd] shadow-xs'
                              : 'bg-white border-[#ede7db] hover:border-[#bae6fd]'
                          }`}
                        >
                          {/* User Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="w-11 h-11 rounded-full object-cover border border-[#e2dbcc] shrink-0 bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                                }}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-bold text-[#1c1917] truncate">
                                    {user.fullName}
                                  </p>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold whitespace-nowrap ${
                                      user.role === 'Super Admin'
                                        ? 'bg-[#0284c7] text-white'
                                        : user.role === 'Manager'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-stone-100 text-stone-700'
                                    }`}
                                  >
                                    {user.role}
                                  </span>
                                </div>
                                <p className="text-[11px] font-mono text-[#0284c7] font-semibold">
                                  @{user.username}
                                </p>
                                {user.email && (
                                  <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                                )}
                              </div>
                            </div>

                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 whitespace-nowrap shrink-0">
                                Aktif
                              </span>
                            )}
                          </div>

                          {/* Password Field (CRUD: Read & Copy) */}
                          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="material-symbols-outlined text-[15px] text-stone-400">
                                lock
                              </span>
                              <span className="font-mono text-stone-800 font-bold tracking-wide truncate">
                                {isVisible ? userPw : '••••••••••••'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                                title={isVisible ? 'Sembunyikan' : 'Lihat Password'}
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  {isVisible ? 'visibility_off' : 'visibility'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(userPw, `pw-${user.id}`, `Password ${user.fullName}`)
                                }
                                className="p-1 rounded text-stone-400 hover:text-[#0284c7] hover:bg-stone-200 transition-colors"
                                title="Salin Password"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  {copiedId === `pw-${user.id}` ? 'done' : 'content_copy'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons (CRUD: Update, Reset, Delete, Switch) */}
                          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-stone-100">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenChangePassword(user)}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] text-[11px] font-bold border border-sky-200 flex items-center gap-1 transition-colors"
                                title="Ganti Password"
                              >
                                <span className="material-symbols-outlined text-[14px]">key</span>
                                <span>Password</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(user)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                                title="Edit Akun"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResetPassword(user)}
                                className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                                title="Reset Password ke Default"
                              >
                                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingUser(user)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title={`Hapus Akun ${user.fullName}`}
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>

                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => switchUser(user.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-[#0284c7] text-[11px] font-bold border border-[#bae6fd] transition-colors whitespace-nowrap"
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
                          type="button"
                          onClick={() => setDeletingCashier(cashier)}
                          className="p-1.5 rounded-xl border bg-white hover:bg-rose-50 text-[#78716c] hover:text-rose-600 border-[#ede5d8] hover:border-rose-200 transition-colors shadow-xs"
                          title={`Hapus ${cashier.name}`}
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

              {/* Main Dark / Light Mode Feature Section */}
              <div className="p-5 rounded-2xl bg-[#fcfbf9] border border-[#ede7db] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#1c1917] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                        {isDarkMode ? 'dark_mode' : 'light_mode'}
                      </span>
                      <span>Mode Tema: Terang vs Gelap (Dark / Light)</span>
                    </h4>
                    <p className="text-xs text-[#57534e]">
                      Pilih tampilan kontras terang atau gelap untuk kenyamanan pandangan kasir.
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isDarkMode
                        ? 'bg-amber-400/10 text-amber-500 border-amber-400/30'
                        : 'bg-sky-50 text-[#0284c7] border-sky-200'
                    }`}
                  >
                    {isDarkMode ? '🌙 Mode Gelap Aktif' : '☀️ Mode Terang Aktif'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => setDarkMode(false)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      !isDarkMode
                        ? 'bg-white border-[#0284c7] ring-2 ring-sky-100 shadow-sm'
                        : 'bg-white/60 border-stone-200 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        !isDarkMode
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">light_mode</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-extrabold text-[#1c1917]">
                          Mode Terang (Light Mode)
                        </h5>
                        {!isDarkMode && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-[#0369a1]">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#57534e] mt-1 leading-relaxed">
                        Latar bersih, natural kertas hangat, kontras sejuk ramah mata untuk shift pagi & siang.
                      </p>
                    </div>
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => setDarkMode(true)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#18181b] text-white border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                        : 'bg-white/60 border-stone-200 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isDarkMode
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-stone-800 text-stone-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">dark_mode</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5
                          className={`text-xs font-extrabold ${
                            isDarkMode ? 'text-white' : 'text-[#1c1917]'
                          }`}
                        >
                          Mode Gelap (Dark Mode)
                        </h5>
                        {isDarkMode && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-1 leading-relaxed ${
                          isDarkMode ? 'text-stone-300' : 'text-[#57534e]'
                        }`}
                      >
                        Latar gelap arang elegan, mengurangi silau kontras, nyaman untuk pencahayaan minim & shift malam.
                      </p>
                    </div>
                  </button>
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

          {/* Tab 6: Printer Thermal Mini & Deteksi Bluetooth Global */}
          {activeTab === 'printer' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ede7db] shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#ede7db]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[18px]">print</span>
                    </span>
                    <h3 className="text-lg font-bold text-[#1c1917]">
                      Printer Thermal Mini & Deteksi Bluetooth Global
                    </h3>
                  </div>
                  <p className="text-xs text-[#78716c] mt-1">
                    Sistem mendeteksi printer Bluetooth portabel, kabel USB thermal, dan cetak struk ESC/POS secara otomatis di seluruh aplikasi.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => autoDetectPrinter(false)}
                    disabled={isPrinterScanning}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] text-xs font-bold border border-sky-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isPrinterScanning ? 'animate-spin' : ''}`}>
                      autorenew
                    </span>
                    <span>{isPrinterScanning ? 'Memindai...' : 'Pindai Otomatis'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={printTestReceipt}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    <span>Tes Cetak Struk</span>
                  </button>
                </div>
              </div>

              {/* Active Printer Spotlight Box */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  activePrinter
                    ? 'bg-linear-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200 shadow-xs'
                    : 'bg-[#fcfbf9] border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        activePrinter ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[26px]">
                        {activePrinter?.type === 'bluetooth'
                          ? 'bluetooth_connected'
                          : activePrinter?.type === 'usb-serial'
                          ? 'cable'
                          : activePrinter
                          ? 'print'
                          : 'print_disabled'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold text-[#1c1917]">
                          {activePrinter ? activePrinter.name : 'Belum Ada Printer Terhubung'}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                            activePrinter
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {activePrinter
                            ? `● ${activePrinter.type === 'bluetooth' ? 'Bluetooth' : activePrinter.type === 'usb-serial' ? 'USB Port' : 'Driver/Virtual'} Siap Cetak`
                            : 'Mencari / Auto-Detect Aktif'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[#57534e]">
                        <span>
                          Lebar Kertas:{' '}
                          <strong className="text-[#1c1917]">
                            {activePrinter?.paperWidth || printerConfig.paperWidth} mm
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Auto-Print:{' '}
                          <strong className="text-[#1c1917]">
                            {printerConfig.autoPrintOnPayment ? 'Aktif Saat Bayar' : 'Manual'}
                          </strong>
                        </span>
                        {activePrinter?.batteryLevel && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">
                              🔋 Baterai: {activePrinter.batteryLevel}%
                            </span>
                          </>
                        )}
                        {activePrinter?.lastConnectedAt && (
                          <>
                            <span>•</span>
                            <span className="text-[#78716c]">
                              Tersambung:{' '}
                              {new Date(activePrinter.lastConnectedAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {activePrinter ? (
                      <button
                        type="button"
                        onClick={disconnectPrinter}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        Putus Sambungan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => autoDetectPrinter(false)}
                        disabled={isPrinterScanning}
                        className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Deteksi Sekarang
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Connect Channels Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wider">
                  Jalur Sambungan Printer Mini
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Bluetooth */}
                  <div className="p-4 rounded-2xl border border-sky-100 bg-[#f0f9ff] flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">bluetooth</span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#1c1917]">Bluetooth Thermal Mini</h5>
                        <p className="text-[11px] text-[#57534e] mt-0.5 leading-relaxed">
                          Panda, Blueprint, VSC, Eppos, Goojprt, Zjiang portable.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={connectBluetoothPrinter}
                      disabled={isPrinterScanning}
                      className="w-full py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_link</span>
                      <span>Pasang Bluetooth</span>
                    </button>
                  </div>

                  {/* USB Serial */}
                  <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">cable</span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#1c1917]">Kabel USB Thermal (COM)</h5>
                        <p className="text-[11px] text-[#57534e] mt-0.5 leading-relaxed">
                          Printer kasir yang terhubung kabel USB ke komputer.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={connectUsbPrinter}
                      disabled={isPrinterScanning}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">usb</span>
                      <span>Pilih Port USB</span>
                    </button>
                  </div>

                  {/* Virtual Simulator */}
                  <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#1c1917]">Printer Virtual & Driver</h5>
                        <p className="text-[11px] text-[#57534e] mt-0.5 leading-relaxed">
                          Uji coba cetak struk tanpa alat fisik, hasil instan.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openPrinterModal}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span>
                      <span>Kelola di Modal</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto-Detection Engine Configuration */}
              <div className="space-y-3 pt-2 border-t border-[#ede7db]">
                <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wider">
                  Konfigurasi Deteksi Otomatis & Cetak Struk
                </h4>

                {/* Paper Width Selection */}
                <div className="p-4 rounded-2xl bg-[#fcfbf9] border border-[#ede7db]">
                  <label className="block text-xs font-bold text-[#1c1917] mb-2">
                    Ukuran Lebar Kertas Struk Kasir:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPrinterPaperWidth(58)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        printerConfig.paperWidth === 58
                          ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] ring-2 ring-sky-100 font-bold'
                          : 'bg-white border-[#ede7db] text-[#57534e] hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">58 mm (Mini Portabel)</span>
                        {printerConfig.paperWidth === 58 && (
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        )}
                      </div>
                      <p className="text-[11px] font-normal text-[#78716c] mt-0.5">
                        Standar printer Bluetooth saku kasir (32 kolom teks).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrinterPaperWidth(80)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        printerConfig.paperWidth === 80
                          ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] ring-2 ring-sky-100 font-bold'
                          : 'bg-white border-[#ede7db] text-[#57534e] hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">80 mm (Standar POS)</span>
                        {printerConfig.paperWidth === 80 && (
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        )}
                      </div>
                      <p className="text-[11px] font-normal text-[#78716c] mt-0.5">
                        Standar printer kasir besar minimarket/restoran (48 kolom teks).
                      </p>
                    </button>
                  </div>
                </div>

                {/* Toggles List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fcfbf9] border border-[#ede7db]">
                    <div>
                      <h5 className="text-xs font-bold text-[#1c1917]">
                        Deteksi Otomatis Saat Buka Aplikasi
                      </h5>
                      <p className="text-[11px] text-[#78716c]">
                        Memindai printer Bluetooth/USB otomatis saat kasir login.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={printerConfig.autoDetectOnLaunch}
                      onChange={(e) => updatePrinterConfig({ autoDetectOnLaunch: e.target.checked })}
                      className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fcfbf9] border border-[#ede7db]">
                    <div>
                      <h5 className="text-xs font-bold text-[#1c1917]">
                        Sambung Ulang Otomatis (Auto-Reconnect)
                      </h5>
                      <p className="text-[11px] text-[#78716c]">
                        Otomatis menyambungkan kembali jika sinyal sempat terputus.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={printerConfig.autoReconnect}
                      onChange={(e) => updatePrinterConfig({ autoReconnect: e.target.checked })}
                      className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fcfbf9] border border-[#ede7db]">
                    <div>
                      <h5 className="text-xs font-bold text-[#1c1917]">
                        Pemindaian Berkala Latar Belakang (20s)
                      </h5>
                      <p className="text-[11px] text-[#78716c]">
                        Mendeteksi printer otomatis ketika printer baru dinyalakan.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={printerConfig.autoScanInterval}
                      onChange={(e) => updatePrinterConfig({ autoScanInterval: e.target.checked })}
                      className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fcfbf9] border border-[#ede7db]">
                    <div>
                      <h5 className="text-xs font-bold text-[#1c1917]">
                        Cetak Otomatis Setiap Transaksi Selesai
                      </h5>
                      <p className="text-[11px] text-[#78716c]">
                        Struk langsung tercetak begitu pembayaran kasir sukses.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={printerConfig.autoPrintOnPayment}
                      onChange={(e) => updatePrinterConfig({ autoPrintOnPayment: e.target.checked })}
                      className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                    />
                  </div>
                </div>
              </div>

              {/* Live Detection Diagnostic Logs */}
              <div className="space-y-3 pt-2 border-t border-[#ede7db]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0284c7]">
                      history
                    </span>
                    <span>Riwayat & Log Deteksi Printer ({printerLogs.length})</span>
                  </h4>

                  <button
                    type="button"
                    onClick={clearPrinterLogs}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                    <span>Bersihkan</span>
                  </button>
                </div>

                <div className="bg-stone-950 text-stone-200 font-mono text-[11px] rounded-2xl p-4 max-h-56 overflow-y-auto space-y-1.5 border border-stone-800 shadow-inner">
                  {printerLogs.length === 0 ? (
                    <p className="text-stone-500 italic text-center py-4">
                      Belum ada catatan aktivitas pemindaian printer.
                    </p>
                  ) : (
                    printerLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2.5 pb-1 border-b border-stone-850">
                        <span className="text-stone-500 shrink-0">[{log.timestamp}]</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                            log.source === 'Bluetooth'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800'
                              : log.source === 'USB/Serial'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {log.source}
                        </span>
                        <span
                          className={`break-words ${
                            log.type === 'error'
                              ? 'text-rose-400'
                              : log.type === 'warning'
                              ? 'text-amber-300'
                              : log.type === 'success'
                              ? 'text-emerald-400'
                              : 'text-stone-300'
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
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

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-sm w-full border border-[#ede5d8] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
              <span className="material-symbols-outlined text-[24px]">person_remove</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-[#292524]">Hapus Akun Pengguna / Kasir?</h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-[#292524]">"{deletingUser.fullName}"</span> (@{deletingUser.username})? Akun ini akan dihapus permanen dan tidak dapat login lagi.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 rounded-full bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] text-xs font-bold transition-colors border border-[#ede5d8]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Password & Account CRUD Modal */}
      <SuperAdminPasswordModal
        isOpen={isSuperAdminModalOpen}
        mode={superAdminModalMode}
        targetUser={selectedSuperAdminUser}
        onClose={() => setIsSuperAdminModalOpen(false)}
      />
    </div>
  );
};
