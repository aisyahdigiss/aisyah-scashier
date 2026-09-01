import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Category } from '../../types';

export const KategoriScreen: React.FC = () => {
  const { categories, products, deleteCategory, addCategory, updateCategory, searchQuery } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductCountForCategory = (catName: string) => {
    return products.filter((p) => p.category.toLowerCase().includes(catName.toLowerCase()) || catName.toLowerCase().includes(p.category.toLowerCase())).length;
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1d1b16] tracking-tight">
            Kategori Produk
          </h1>
          <p className="text-sm text-[#41474e] mt-1">
            Kelola pengelompokan produk dan klasifikasi menu toko Anda.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="px-5 py-2.5 rounded-full bg-[#30628a] hover:bg-[#275b82] text-white font-bold text-sm flex items-center gap-2 shadow-[0px_4px_16px_rgba(48,98,138,0.25)] transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Categories Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const count = getProductCountForCategory(cat.name);

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col justify-between hover:shadow-[0px_8px_24px_rgba(48,98,138,0.15)] hover:border-[#30628a]/40 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Icon Circle */}
                  <div className="w-14 h-14 rounded-2xl bg-[#bee1ff] flex items-center justify-center text-[#30628a] shadow-xs group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                  </div>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#41474e] hover:bg-[#f3ede4] hover:text-[#30628a] transition-colors"
                      title="Edit Kategori"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors"
                        title="Hapus Kategori"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1d1b16] tracking-tight">{cat.name}</h3>
                <p className="text-xs text-[#72787f] mt-1.5 leading-relaxed min-h-[36px]">
                  {cat.description}
                </p>
              </div>

              {/* Footer with Count */}
              <div className="pt-4 mt-4 border-t border-[#f3ede4] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#72787f]">Jumlah Produk:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f3ede4] text-[#30628a]">
                  {count} Produk
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={(data) => {
            if (editingCategory) {
              updateCategory(editingCategory.id, data);
            } else {
              addCategory(data);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id'>) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [icon, setIcon] = useState(category?.icon || 'local_cafe');

  const availableIcons = [
    { label: 'Kopi', icon: 'local_cafe' },
    { label: 'Kue', icon: 'cake' },
    { label: 'Makanan', icon: 'fastfood' },
    { label: 'Blender', icon: 'blender' },
    { label: 'Barang', icon: 'inventory' },
    { label: 'Snack', icon: 'cookie' },
    { label: 'Es Teh', icon: 'emoji_food_beverage' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, description, icon });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#ede7df] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede7df]">
          <h2 className="text-lg font-bold text-[#1d1b16]">
            {category ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
          <button onClick={onClose} className="p-1 text-[#72787f]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#41474e] block mb-1">Nama Kategori</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Aneka Jus & Smoothies"
              className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#41474e] block mb-1">Pilih Ikon</label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => setIcon(item.icon)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    icon === item.icon
                      ? 'bg-[#bee1ff] border-[#30628a] text-[#30628a] font-bold'
                      : 'bg-[#f9f3ea] border-[#ede7df] text-[#41474e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  <span className="text-[10px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#41474e] block mb-1">Deskripsi</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan singkat kategori..."
              className="w-full px-3.5 py-2 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-xs text-[#1d1b16] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ede7df]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#f3ede4] text-[#41474e] text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#30628a] text-white text-xs font-bold shadow-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
