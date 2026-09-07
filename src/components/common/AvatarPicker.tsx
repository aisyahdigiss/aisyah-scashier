import React, { useState, useRef } from 'react';

export const CUTE_AVATAR_PRESETS = [
  {
    id: 'preset-1',
    title: 'Aisyah',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=fef9c3',
  },
  {
    id: 'preset-2',
    title: 'Barista Milo',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=fefce8',
  },
  {
    id: 'preset-3',
    title: 'Rian Casual',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rian&backgroundColor=fef9c3',
  },
  {
    id: 'preset-4',
    title: 'Zoe Pastel',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=fefce8',
  },
  {
    id: 'preset-5',
    title: 'Sasha Barista',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha&backgroundColor=fef9c3',
  },
  {
    id: 'preset-6',
    title: 'Staf Kasir',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=fef3c7',
  },
  {
    id: 'preset-7',
    title: 'Robot Kasir',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BaristaBot&backgroundColor=fef9c3',
  },
  {
    id: 'preset-8',
    title: 'Smart Barista',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=SweetSmile&backgroundColor=fefce8',
  },
  {
    id: 'preset-9',
    title: 'Andi (Foto Real)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC11vXIThX3TR5KuZyFSiUYfwE4vKkRMxMMZq7F0ryBGcEoiGawA_XLgxQd5jGpkZs4xDe2mxsOjUm5j_lGHlgkiprrdR0MEtwcB849F47NIZaZ1T_V6PoWFBpv23aMXmAODkIp4lQBDkjQLgqk8f04of5M1HH7xIXPUPeUWhVnHkWH7M4wIEDTGAFAp4GG5Vy2z3K9v-VXK1fWREpKRX9yPnqMoOZLS-70rbZOtoU56o__Xr5PHYLZLA',
  },
  {
    id: 'preset-10',
    title: 'Budi (Foto Real)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChmnNgyyFMI2eTmcP-nY8CgHiQwcGhv3npQrIKtbYCLWxDNR6lSe1rJ9zi8EjbHL6elGu7h-hLb8AXwHe4oQ_6_8heue-b5Ax3OzhmpiUQPlQdz77g107YIYFOY4JpPHGA50TSsjAYSviemwxgV92hbdjv55_vj0vJaQ-f-ueI3cWhMQYZ8HhO1wuAv1rGD9niqGv_14Y55QKwK-zXIre6yknU6Pddv9zHEsnxhcwf85ZJT4_2KTwvJA',
  },
  {
    id: 'preset-11',
    title: 'Siti (Foto Real)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALiv9Y4DPCMxhKvUngfdgBMaYa80aAPfMx9Zz-veyVg9zyjCNszgNLMoNl1Lg7yak00AgF9NQJNohmgABxEwJ4aM_6ezfPjmrfYp0hxTflD0NEyRy2kGGP4oetQlZQBUXBbBwaE5mdGdDuHzaQEvAEqfF5Nu4dOU09VATPB9nW6aj7e64CSB42odg9R6WPt8X0nujXDXGnkAS2Rj-Fg6q3597yg3LdM1Yhhrkiv5XTPORnYrE_m37L2w',
  },
];

interface AvatarPickerProps {
  currentAvatar: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  cashierName?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  onAvatarChange,
  cashierName = 'Kasir',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('preset');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, atau WebP)');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAvatarChange(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onAvatarChange(urlInput.trim());
    setUrlInput('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#292524] flex items-center gap-1.5">
          <span>Foto Profil Kasir</span>
        </label>
      </div>

      {/* Preview Section */}
      <div className="p-3.5 bg-[#fdfbf7] rounded-2xl border-2 border-dashed border-[#ede5d8] flex items-center gap-4">
        <div className="relative group">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#dfd5c3] shadow-sm bg-white shrink-0 p-0.5 ring-2 ring-[#fef9c3]">
            <img
              src={currentAvatar}
              alt={cashierName}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CUTE_AVATAR_PRESETS[0].url;
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] flex items-center justify-center shadow-2xs border border-[#fde68a] hover:scale-105 transition-transform"
            title="Ganti Foto dari Perangkat"
          >
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#292524]">Pratinjau Foto Kasir</p>
          <p className="text-[11px] text-[#78716c] truncate">
            Foto ini akan tampil di kasir bar dan sistem transaksi
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#854d0e] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
            <span>Pilih avatar atau upload foto sendiri dari galeri</span>
          </div>
        </div>
      </div>

      {/* Tabs: Preset, Upload File, Link URL */}
      <div className="flex items-center gap-1 p-1 bg-[#f7f3eb] rounded-xl border border-[#ede5d8] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === 'preset'
              ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
              : 'text-[#78716c] hover:text-[#292524]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
          <span>Koleksi Avatar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === 'upload'
              ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
              : 'text-[#78716c] hover:text-[#292524]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">upload</span>
          <span>Upload Foto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === 'url'
              ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
              : 'text-[#78716c] hover:text-[#292524]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">link</span>
          <span>Link URL</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Preset Avatar */}
      {activeTab === 'preset' && (
        <div className="space-y-2">
          <p className="text-[11px] text-[#78716c]">Klik salah satu avatar pilihan di bawah:</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1.5 rounded-xl bg-[#fdfbf7] border border-[#ede5d8]">
            {CUTE_AVATAR_PRESETS.map((preset) => {
              const isSelected = currentAvatar === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onAvatarChange(preset.url);
                    setErrorMsg(null);
                  }}
                  title={preset.title}
                  className={`relative p-1 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group ${
                    isSelected
                      ? 'border-[#fde68a] bg-[#fef9c3] scale-105 shadow-2xs'
                      : 'border-transparent hover:border-[#dfd5c3] hover:bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-xs">
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] text-[#78716c] font-medium truncate w-full text-center">
                    {preset.title.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fef9c3] text-[#713f12] font-bold flex items-center justify-center text-[10px] border border-[#fde68a]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Upload File (Click & Drag-and-Drop) */}
      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#fde68a] bg-[#fef9c3] scale-[1.01]'
                : 'border-[#ede5d8] bg-[#fdfbf7] hover:bg-[#fef9c3]/50 hover:border-[#fde68a]'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#fef9c3] text-[#713f12] flex items-center justify-center mx-auto mb-2 border border-[#fde68a]">
              <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
            </div>
            <p className="text-xs font-bold text-[#292524]">
              {isDragging ? 'Lepaskan file foto di sini!' : 'Klik atau seret foto ke sini'}
            </p>
            <p className="text-[11px] text-[#78716c] mt-0.5">
              Mendukung PNG, JPG, GIF, WebP (Maksimal 3MB)
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Link URL */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/foto-kasir.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-xs text-[#292524] outline-none focus:border-[#fde68a]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3.5 py-2 bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] rounded-xl text-xs font-bold transition-colors shadow-2xs border border-[#fde68a]"
            >
              Gunakan
            </button>
          </div>
          <p className="text-[10px] text-[#78716c]">
            Masukkan tautan URL gambar langsung dari internet jika Anda memilikinya.
          </p>
        </div>
      )}
    </div>
  );
};
