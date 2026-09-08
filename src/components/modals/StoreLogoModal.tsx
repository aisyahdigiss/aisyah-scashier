import React, { useState, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { STORE_PHOTO_PRESETS } from '../../data/initialData';

export const StoreLogoModal: React.FC = () => {
  const { settings, updateSettings, showToast, isStoreLogoModalOpen, setIsStoreLogoModalOpen } =
    usePOS();

  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>(settings.logoUrl);
  const [customUrl, setCustomUrl] = useState<string>(settings.logoUrl);
  const [previewImage, setPreviewImage] = useState<string>(settings.logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isStoreLogoModalOpen) return null;

  const handleSelectPreset = (url: string) => {
    setSelectedPreset(url);
    setPreviewImage(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 4MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewImage(result);
        setSelectedPreset('');
        showToast('Foto berhasil dimuat dari perangkat', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) {
      showToast('Masukkan URL gambar toko terlebih dahulu', 'warning');
      return;
    }
    setPreviewImage(customUrl);
    showToast('Pratinjau foto URL diperbarui', 'info');
  };

  const handleSave = () => {
    if (!previewImage) {
      showToast('Pilih atau unggah foto terlebih dahulu', 'warning');
      return;
    }
    updateSettings({ logoUrl: previewImage });
    showToast('Foto toko berhasil diperbarui!', 'success');
    setIsStoreLogoModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsStoreLogoModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#fffdfa] rounded-3xl p-6 shadow-[0px_16px_50px_rgba(120,113,108,0.2)] border border-[#ede5d8] z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ede5d8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a] shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#292524]">Ganti Foto & Logo Toko</h3>
              <p className="text-xs text-[#78716c]">
                Sesuaikan tampilan foto etalase toko untuk profil outlet & struk belanja
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStoreLogoModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#f7f3eb] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="py-4 flex items-center gap-4 bg-[#fdfbf7] px-4 my-3 rounded-2xl border border-[#ede5d8]">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md ring-2 ring-[#fde68a] shrink-0 bg-stone-100">
            <img
              src={previewImage}
              alt="Pratinjau Foto Toko"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = STORE_PHOTO_PRESETS[0].url;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#292524] truncate">{settings.storeName}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                Pratinjau Baru
              </span>
            </div>
            <p className="text-xs text-[#78716c] truncate mt-0.5">
              {settings.branchName} • {settings.address}
            </p>
          </div>
        </div>

        {/* Tabs: Preset, Upload, Custom URL */}
        <div className="flex items-center gap-2 border-b border-[#ede5d8] pb-3 mb-3">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'preset'
                ? 'bg-[#fef9c3] text-[#713f12] border border-[#fde68a] shadow-2xs'
                : 'text-[#78716c] hover:bg-[#f7f3eb]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">collections</span>
            <span>Koleksi Preset Toko</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#fef9c3] text-[#713f12] border border-[#fde68a] shadow-2xs'
                : 'text-[#78716c] hover:bg-[#f7f3eb]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Upload dari Perangkat</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-[#fef9c3] text-[#713f12] border border-[#fde68a] shadow-2xs'
                : 'text-[#78716c] hover:bg-[#f7f3eb]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>Link URL Gambar</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* Preset Tab */}
          {activeTab === 'preset' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STORE_PHOTO_PRESETS.map((preset) => {
                const isSelected = previewImage === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`cursor-pointer rounded-2xl border p-2 text-center transition-all group ${
                      isSelected
                        ? 'bg-[#fef9c3]/70 border-[#eab308] shadow-md ring-2 ring-[#fde68a]'
                        : 'bg-[#fdfbf7] hover:bg-[#f7f3eb] border-[#ede5d8]'
                    }`}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-stone-100">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#713f12]/30 flex items-center justify-center">
                          <span className="w-7 h-7 rounded-full bg-[#fef9c3] text-[#713f12] flex items-center justify-center font-bold text-sm shadow-md">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#292524] truncate">{preset.name}</p>
                    <span className="text-[10px] text-[#78716c]">{preset.category}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#dfd5c3] hover:border-[#eab308] bg-[#fdfbf7] hover:bg-[#fef9c3]/30 p-8 rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a] shadow-xs">
                  <span className="material-symbols-outlined text-[30px]">add_photo_alternate</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#292524]">
                    Klik untuk memilih file foto dari komputer/HP
                  </p>
                  <p className="text-xs text-[#78716c] mt-1">
                    Mendukung format JPG, PNG, WEBP (Maksimal 4 MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full bg-[#fef9c3] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs hover:bg-[#fef08a]"
                >
                  Pilih File Gambar
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Custom URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-3 bg-[#fdfbf7] p-4 rounded-2xl border border-[#ede5d8]">
              <label className="text-xs font-bold text-[#57534e] block">
                Tautan Langsung Gambar (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://contoh.com/foto-toko.jpg"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#ede5d8] rounded-xl text-xs text-[#292524] outline-none focus:border-[#eab308]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-xs border border-[#fde68a]"
                >
                  Terapkan
                </button>
              </div>
              <p className="text-[11px] text-[#78716c]">
                Pastikan tautan dapat diakses secara publik dan menggunakan protokol HTTPS.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ede5d8] mt-3">
          <button
            type="button"
            onClick={() => setIsStoreLogoModalOpen(false)}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#78716c] hover:text-[#292524] hover:bg-[#f7f3eb] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs transition-all active:scale-95"
          >
            Simpan Foto Toko
          </button>
        </div>
      </div>
    </div>
  );
};
