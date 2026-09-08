import React, { useState, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { CASHIER_AVATAR_PRESETS } from '../../data/initialData';

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfilePhoto, showToast, playBeep, activeCashier } = usePOS();

  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    currentUser?.avatarUrl || activeCashier.avatarUrl
  );
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'Semua' | 'Ilustrasi' | 'Foto Asli'>('Semua');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentDisplayName = currentUser ? currentUser.fullName : activeCashier.name;
  const currentRole = currentUser ? currentUser.role : activeCashier.role;

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, atau WebP)', 'error');
      playBeep('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5 MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedPhoto(result);
        setUploadedFileName(file.name);
        playBeep('beep');
        showToast(`Foto "${file.name}" siap diterapkan!`, 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      showToast('Masukkan tautan URL gambar terlebih dahulu', 'warning');
      return;
    }
    setSelectedPhoto(trimmed);
    playBeep('beep');
    showToast('Tautan gambar berhasil dimuat!', 'info');
  };

  const handleSave = () => {
    if (!selectedPhoto) {
      showToast('Pilih foto terlebih dahulu', 'warning');
      return;
    }

    updateUserProfilePhoto(selectedPhoto);
    onClose();
  };

  const filteredPresets = CASHIER_AVATAR_PRESETS.filter(
    (p) => filterCategory === 'Semua' || p.category === filterCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-300 z-10 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 text-[#1c1917]">
        {/* Header - High Contrast */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#fbfaf8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">photo_camera</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
                  Ubah Foto Profil Kasir
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0284c7] text-white">
                  {currentRole}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                Akun: <strong className="text-stone-900">{currentDisplayName}</strong> • Foto tersinkronisasi di kasir & struk
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
            title="Tutup"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Preview Box - Crisp & Prominent */}
        <div className="px-6 py-4 bg-[#f1f5f9] border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-[#0284c7] bg-white shadow-md">
                <img
                  src={selectedPhoto}
                  alt="Pratinjau Foto"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-xs">
                ✓
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded border border-[#bae6fd]">
                Pratinjau Kasir Aktif
              </span>
              <h4 className="text-sm font-bold text-[#0f172a] mt-1">
                {currentDisplayName}
              </h4>
              <p className="text-xs text-stone-600 font-medium">
                Foto ini akan langsung tampil di bilah atas, kartu kasir, laci shift, dan riwayat transaksi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white hover:bg-stone-100 text-[#0f172a] border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0284c7]">upload</span>
            <span>Unggah dari File...</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 px-6 bg-white gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'preset'
                ? 'border-[#0284c7] text-[#0284c7]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">face</span>
            <span>Koleksi Avatar & Barista ({CASHIER_AVATAR_PRESETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#0284c7] text-[#0284c7]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">drive_folder_upload</span>
            <span>Unggah Foto Galeri / HP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'url'
                ? 'border-[#0284c7] text-[#0284c7]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            <span>Tautan URL Web</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Tab 1: Presets */}
          {activeTab === 'preset' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600">Kategori:</span>
                {(['Semua', 'Ilustrasi', 'Foto Asli'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      filterCategory === cat
                        ? 'bg-[#0f172a] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(preset.url);
                        playBeep('beep');
                      }}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all relative ${
                        isSelected
                          ? 'border-[#0284c7] bg-[#f0f9ff] ring-2 ring-[#bae6fd] shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                          }}
                        />
                      </div>

                      <div className="w-full">
                        <p className="text-[11px] font-bold text-[#0f172a] truncate">
                          {preset.name}
                        </p>
                        <span className="text-[9px] font-semibold text-stone-500">
                          {preset.category}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-xs shadow-xs">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#0284c7] bg-[#fcfbf9] hover:bg-[#f0f9ff] rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center border border-[#bae6fd]">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a]">
                    Klik untuk memilih foto atau seret file ke sini
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                    Mendukung format gambar JPG, PNG, WEBP, atau GIF (Maksimal 5 MB). Foto akan disimpan langsung di profil akun Anda.
                  </p>
                </div>
                {uploadedFileName && (
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>File terpilih: {uploadedFileName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: URL Web */}
          {activeTab === 'url' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#fcfbf9] border border-stone-200">
              <label className="text-xs font-bold text-[#0f172a] block">
                Tautan Gambar Langsung (Image URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/foto-kasir.jpg"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-900 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-4 py-2.5 bg-[#0f172a] text-white hover:bg-stone-800 rounded-xl text-xs font-bold transition-all shrink-0"
                >
                  Tinjau URL
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                Tip: Anda dapat memasukkan tautan gambar dari hosting publik seperti Imgur, Unsplash, atau Cloudinary.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions - High Contrast */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Simpan Foto Profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
