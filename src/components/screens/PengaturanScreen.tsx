import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

export const PengaturanScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    cashiers,
    activeCashier,
    setActiveCashierId,
    addCashier,
    resetToDefaultData,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'profil' | 'pembayaran' | 'kasir'>('profil');

  // Form states for Profil Toko
  const [storeName, setStoreName] = useState(settings.storeName);
  const [branchName, setBranchName] = useState(settings.branchName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);

  // New Cashier Modal
  const [isAddCashierOpen, setIsAddCashierOpen] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierRole, setNewCashierRole] = useState<'Kasir' | 'Manager'>('Kasir');

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

  const handleAddCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName.trim()) return;
    addCashier(newCashierName, newCashierRole);
    setNewCashierName('');
    setIsAddCashierOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1d1b16] tracking-tight">
          Pengaturan Toko
        </h1>
        <p className="text-sm text-[#41474e] mt-1">
          Kelola profil toko, integrasi metode pembayaran, dan manajemen hak akses kasir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Store Profile Card & Navigation Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Store Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#bee1ff] shadow-sm mb-4 bg-[#f9f3ea]">
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-[#1d1b16]">{settings.storeName}</h3>
            <p className="text-xs font-semibold text-[#40627b] mt-0.5">{settings.branchName}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
              Outlet Aktif
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-3xl p-2.5 border border-[#ede7df] shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('profil')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'profil'
                  ? 'bg-[#bee1ff] text-[#001e2f] font-bold border-l-4 border-[#30628a]'
                  : 'text-[#41474e] hover:bg-[#f9f3ea]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              <span>Profil Toko</span>
            </button>

            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'pembayaran'
                  ? 'bg-[#bee1ff] text-[#001e2f] font-bold border-l-4 border-[#30628a]'
                  : 'text-[#41474e] hover:bg-[#f9f3ea]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span>Metode Pembayaran</span>
            </button>

            <button
              onClick={() => setActiveTab('kasir')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                activeTab === 'kasir'
                  ? 'bg-[#bee1ff] text-[#001e2f] font-bold border-l-4 border-[#30628a]'
                  : 'text-[#41474e] hover:bg-[#f9f3ea]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>Akun Kasir ({cashiers.length})</span>
            </button>
          </div>

          {/* Reset Demo Data Card */}
          <div className="bg-[#f9f3ea] rounded-3xl p-4 border border-[#ede7df]">
            <p className="text-xs text-[#72787f] mb-2 font-medium">Pengaturan Data:</p>
            <button
              onClick={resetToDefaultData}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#ede7df] text-[#41474e] text-xs font-bold border border-[#ede7df] transition-colors"
            >
              Reset Data ke Pengaturan Default
            </button>
          </div>
        </div>

        {/* Right Column: Active Tab Content (8 cols) */}
        <div className="lg:col-span-8">
          {/* Tab 1: Profil Toko */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)]">
              <div className="pb-4 mb-6 border-b border-[#ede7df]">
                <h3 className="text-xl font-bold text-[#1d1b16]">Profil Toko & Kontak</h3>
                <p className="text-xs text-[#72787f] mt-0.5">
                  Informasi ini akan tercetak di struk nota transaksi pelanggan.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#41474e] block mb-1.5">
                      Nama Toko / Outlet
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#41474e] block mb-1.5">
                      Nama Cabang
                    </label>
                    <input
                      type="text"
                      required
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#41474e] block mb-1.5">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#41474e] block mb-1.5">
                    Alamat Lengkap Toko
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm text-[#1d1b16] outline-none focus:border-[#30628a]"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#30628a] hover:bg-[#275b82] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Metode Pembayaran */}
          {activeTab === 'pembayaran' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] space-y-6">
              <div className="pb-4 border-b border-[#ede7df]">
                <h3 className="text-xl font-bold text-[#1d1b16]">Metode Pembayaran</h3>
                <p className="text-xs text-[#72787f] mt-0.5">
                  Aktifkan saluran penerimaan pembayaran yang tersedia di kasir.
                </p>
              </div>

              <div className="space-y-4">
                {/* QRIS Switch */}
                <div className="p-4 rounded-2xl bg-[#f9f3ea] border border-[#ede7df] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#bee1ff] text-[#30628a] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1d1b16]">QRIS Dinamis</h4>
                      <p className="text-xs text-[#72787f]">
                        Terima pembayaran otomatis via GoPay, OVO, Dana, ShopeePay, dan m-Banking.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePayment('qris')}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                      settings.paymentMethods.qris ? 'bg-[#30628a]' : 'bg-gray-300'
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
                <div className="p-4 rounded-2xl bg-[#f9f3ea] border border-[#ede7df] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#cae6ff] text-[#40627b] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">credit_card</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1d1b16]">Kartu Kredit / Debit</h4>
                      <p className="text-xs text-[#72787f]">
                        Memerlukan mesin EDC terhubung untuk input nomor referensi otorisasi.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePayment('kartu')}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                      settings.paymentMethods.kartu ? 'bg-[#30628a]' : 'bg-gray-300'
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
                <div className="p-4 rounded-2xl bg-[#f9f3ea] border border-[#ede7df] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#cecfb7]/50 text-[#5e604d] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">payments</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1d1b16]">Uang Tunai (Cash)</h4>
                      <p className="text-xs text-[#72787f]">
                        Metode pembayaran default dengan kalkulator kembalian otomatis.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePayment('tunai')}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                      settings.paymentMethods.tunai ? 'bg-[#30628a]' : 'bg-gray-300'
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

          {/* Tab 3: Akun Kasir */}
          {activeTab === 'kasir' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede7df]">
                <div>
                  <h3 className="text-xl font-bold text-[#1d1b16]">Manajemen Akun Kasir</h3>
                  <p className="text-xs text-[#72787f] mt-0.5">
                    Kelola siapa saja staf yang berwenang melayani transaksi.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddCashierOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#30628a] text-white text-xs font-bold flex items-center gap-1.5 self-start"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>+ Tambah Kasir</span>
                </button>
              </div>

              <div className="space-y-3">
                {cashiers.map((cashier) => {
                  const isActive = cashier.id === activeCashier.id;

                  return (
                    <div
                      key={cashier.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-[#bee1ff]/30 border-[#30628a]'
                          : 'bg-[#f9f3ea] border-[#ede7df]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={cashier.avatarUrl}
                          alt={cashier.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#1d1b16]">{cashier.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cashier.role === 'Manager'
                                  ? 'bg-[#30628a] text-white'
                                  : 'bg-[#f3ede4] text-[#41474e]'
                              }`}
                            >
                              {cashier.role}
                            </span>
                          </div>
                          <p className="text-xs text-[#72787f] mt-0.5">
                            {isActive ? 'Sedang aktif login di terminal ini' : 'Akun terdaftar'}
                          </p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveCashierId(cashier.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#ede7df] text-[#30628a] font-bold text-xs border border-[#ede7df] transition-colors"
                        >
                          Pilih Akun Ini
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Cashier Modal */}
      {isAddCashierOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#ede7df] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede7df]">
              <h2 className="text-lg font-bold text-[#1d1b16]">Tambah Akun Kasir Baru</h2>
              <button onClick={() => setIsAddCashierOpen(false)} className="p-1 text-[#72787f]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCashierSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#41474e] block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newCashierName}
                  onChange={(e) => setNewCashierName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#41474e] block mb-1">Peran / Role</label>
                <select
                  value={newCashierRole}
                  onChange={(e) => setNewCashierRole(e.target.value as 'Kasir' | 'Manager')}
                  className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none"
                >
                  <option value="Kasir">Kasir (Melayani Penjualan)</option>
                  <option value="Manager">Manager (Akses Penuh & Laporan)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede7df]">
                <button
                  type="button"
                  onClick={() => setIsAddCashierOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#f3ede4] text-[#41474e] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#30628a] text-white text-xs font-bold shadow-md"
                >
                  Daftarkan Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
