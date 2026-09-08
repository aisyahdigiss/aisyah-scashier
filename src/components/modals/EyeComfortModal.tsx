import React from 'react';
import { usePOS } from '../../context/POSContext';
import { EyeCareTheme, SidebarLayoutMode } from '../../types';

interface EyeComfortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EyeComfortModal: React.FC<EyeComfortModalProps> = ({ isOpen, onClose }) => {
  const {
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

  if (!isOpen) return null;

  const themes: {
    id: EyeCareTheme;
    name: string;
    subtitle: string;
    icon: string;
    badge: string;
    bgSample: string;
    borderSample: string;
    textSample: string;
  }[] = [
    {
      id: 'warm-beige',
      name: 'Kertas Hangat (Warm Beige)',
      subtitle: 'Spektrum hangat 2400K natural, nyaman untuk shift harian.',
      icon: 'eco',
      badge: 'Alami & Tenang',
      bgSample: 'bg-[#f6f4ee]',
      borderSample: 'border-[#ede7db]',
      textSample: 'text-[#1c1917]',
    },
    {
      id: 'matcha-sage',
      name: 'Matcha Sage (Anti-Lelah)',
      subtitle: 'Hijau sage lembut terbukti meredakan ketegangan saraf mata.',
      icon: 'spa',
      badge: 'Paling Ramah Mata',
      bgSample: 'bg-[#eff5ee]',
      borderSample: 'border-[#d7e4d5]',
      textSample: 'text-[#142310]',
    },
    {
      id: 'slate-charcoal',
      name: 'Slate Charcoal (Redup Lembut)',
      subtitle: 'Mode malam terkalibrasi tanpa silau kontras hitam pekat.',
      icon: 'dark_mode',
      badge: 'Bebas Silau Malam',
      bgSample: 'bg-[#18181b]',
      borderSample: 'border-[#3f3f46]',
      textSample: 'text-[#f4f4f5]',
    },
    {
      id: 'nordic-sky',
      name: 'Nordic Sky (Pastel Sejuk)',
      subtitle: 'Biru pastel sejuk nan bersih dengan estetika Skandinavia.',
      icon: 'air',
      badge: 'Segar & Fokus',
      bgSample: 'bg-[#eff5f9]',
      borderSample: 'border-[#d7e5f0]',
      textSample: 'text-[#0f172a]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#ede7db] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ede7db] bg-[#fcfbf9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center border border-[#bae6fd]">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c1917]">
                Kenyamanan Tampilan & Mata
              </h3>
              <p className="text-xs text-[#78716c]">
                Sesuaikan warna, anti-silau, dan tata letak agar mata tidak lelah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Eye Care Color Schemes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wider">
                1. Palet Warna Ramah Mata
              </h4>
              <span className="text-[11px] text-[#78716c] font-medium">Bebas Silau / Glare-Free</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map((t) => {
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
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 group ${
                      isSelected
                        ? 'border-[#0284c7] bg-[#f0f9ff] ring-2 ring-[#e0f2fe]'
                        : 'border-[#ede7db] bg-[#fcfbf9] hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg ${t.bgSample} border ${t.borderSample} shadow-2xs flex items-center justify-center`}
                        >
                          <span
                            className={`material-symbols-outlined text-[14px] ${
                              t.id === 'slate-charcoal' ? 'text-white' : 'text-stone-700'
                            }`}
                          >
                            {t.icon}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#1c1917]">{t.name.split(' (')[0]}</span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[18px] text-[#0284c7]">
                          check_circle
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#78716c] leading-relaxed line-clamp-2">
                      {t.subtitle}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-stone-600 border border-[#ede7db]">
                        {t.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Anti-Glare Blue Light Filter */}
          <div className="p-4 rounded-xl bg-[#fcfbf9] border border-[#ede7db] flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                <span className="material-symbols-outlined text-[18px]">wb_twilight</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1c1917]">
                    Filter Anti-Silau (Night Shift / Meredam Cahaya Biru)
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Kenyamanan Retina
                  </span>
                </div>
                <p className="text-[11px] text-[#78716c] mt-0.5">
                  Mengaplikasikan filter temperatur hangat alami untuk mengurangi paparan radiasi sinar biru monitor saat kasir menatap layar berjam-jam.
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
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 border ${
                antiGlareFilter ? 'bg-[#0284c7] border-[#0284c7]' : 'bg-stone-300 border-stone-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  antiGlareFilter ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 3: Sidebar Hamburger Layout Mode */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#1c1917] uppercase tracking-wider">
                2. Tata Letak Bilah Menu (Hamburger & Sidebar)
              </h4>
              <span className="text-[11px] text-[#78716c]">Tombol Hamburger di Navbar</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'expanded' as SidebarLayoutMode,
                  title: 'Bilah Penuh',
                  desc: '260px (Standar teks & ikon)',
                  icon: 'side_navigation',
                },
                {
                  id: 'compact' as SidebarLayoutMode,
                  title: 'Bilah Ringkas',
                  desc: '74px (Hanya ikon hemat ruang)',
                  icon: 'dock_to_right',
                },
                {
                  id: 'hidden' as SidebarLayoutMode,
                  title: 'Tersembunyi',
                  desc: '0px (Buka hanya via Hamburger)',
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
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isActive
                        ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-bold shadow-xs'
                        : 'border-[#ede7db] bg-[#fcfbf9] text-[#57534e] hover:bg-stone-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                    <span className="text-xs font-bold text-[#1c1917]">{m.title}</span>
                    <span className="text-[10px] text-[#78716c] leading-tight">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Zen Mode & UI Density */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Zen Mode Toggle */}
            <div className="p-3.5 rounded-xl border border-[#ede7db] bg-[#fcfbf9] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0284c7]">
                    center_focus_strong
                  </span>
                  <h4 className="text-xs font-bold text-[#1c1917]">Mode Fokus Zen</h4>
                </div>
                <p className="text-[11px] text-[#78716c] mt-1">
                  Sembunyikan bilah sisi dan maksimalkan layar kasir untuk kecepatan transaksi bebas distraksi.
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
                className={`w-full py-2 px-4 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  zenFocusMode
                    ? 'bg-[#0284c7] text-white border-[#0284c7]'
                    : 'bg-white text-[#57534e] border-[#ede7db] hover:bg-stone-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {zenFocusMode ? 'check' : 'power_settings_new'}
                </span>
                <span>{zenFocusMode ? 'Fokus Zen Aktif' : 'Aktifkan Mode Zen'}</span>
              </button>
            </div>

            {/* UI Density */}
            <div className="p-3.5 rounded-xl border border-[#ede7db] bg-[#fcfbf9] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0284c7]">
                    density_medium
                  </span>
                  <h4 className="text-xs font-bold text-[#1c1917]">Kepadatan Tampilan</h4>
                </div>
                <p className="text-[11px] text-[#78716c] mt-1">
                  Atur kenyamanan spasi antara kartu produk dan tombol transaksi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUiDensity('relaxed');
                    playBeep('beep');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors text-center ${
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
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors text-center ${
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#ede7db] bg-[#fcfbf9] flex items-center justify-between">
          <span className="text-[11px] text-[#78716c]">
            Pengaturan tersimpan otomatis di perangkat ini
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
