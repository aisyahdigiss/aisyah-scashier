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
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'profil' | 'pembayaran' | 'kasir'>('kasir');

  // Form states for Profil Toko
  const [storeName, setStoreName] = useState(settings.storeName);
  const [branchName, setBranchName] = useState(settings.branchName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);

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
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#dfd5c3] shadow-sm mb-4 bg-[#fdfbf7] ring-4 ring-[#fef9c3]">
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-[#292524]">{settings.storeName}</h3>
            <p className="text-xs font-semibold text-[#78716c] mt-0.5">{settings.branchName}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-[#fef9c3] text-[#713f12] rounded-full text-xs font-bold border border-[#fde68a]">
              Outlet Aktif
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-2.5 border border-[#ede5d8] shadow-xs space-y-1">
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
              <span>Profil Toko</span>
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

          {/* Tab 2: Profil Toko */}
          {activeTab === 'profil' && (
            <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 md:p-8 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)]">
              <div className="pb-4 mb-6 border-b border-[#ede5d8]">
                <h3 className="text-xl font-bold text-[#292524]">Profil Toko & Kontak</h3>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Informasi ini akan tercetak di struk nota transaksi pelanggan.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
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
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm text-[#292524] outline-none focus:border-[#eab308]"
                  />
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
