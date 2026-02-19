import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Pencil, Trash2, X, Save, Loader2, Search,
    Package, ImageOff, ChevronDown, Check,
} from 'lucide-react';
import {
    adminFetchProducts, adminCreateProduct,
    adminUpdateProduct, adminDeleteProduct,
} from '../../store/productSlice';

// ── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ['Clothing', 'Shoes'];
const DEPARTMENTS = ['Men', 'Women', 'Kids'];
const SIZES = ['S', 'M', 'L', 'XL'];
const PRESET_COLORS = [
    { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' },
    { name: 'Red', hex: '#C0392B' }, { name: 'Blue', hex: '#2980B9' },
    { name: 'Green', hex: '#27AE60' }, { name: 'Gray', hex: '#808080' },
    { name: 'Brown', hex: '#8B4513' }, { name: 'Pink', hex: '#E8A0BF' },
    { name: 'Beige', hex: '#D4C5A9' }, { name: 'Yellow', hex: '#F1C40F' },
];

const emptyForm = {
    name: '', description: '', price: '',
    category: 'Clothing', department: 'Men',
    sizes: [], colors: [],
    images: [''], isTrending: false, inStock: true,
};

// ── Sub-components ──────────────────────────────────────────────────────────
const Badge = ({ children, color = 'gray' }) => {
    const map = { gray: 'bg-gray-100 text-gray-600', green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-600' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>{children}</span>;
};

const Toggle = ({ value, onChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-black' : 'bg-gray-200'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
        </button>
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

// ── Product Modal ────────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onSave, saving }) => {
    const [form, setForm] = useState(
        product
            ? {
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                category: product.category || 'Clothing',
                department: product.department || 'Men',
                sizes: product.sizes || [],
                colors: product.colors || [],
                images: product.images?.length ? product.images : [''],
                isTrending: product.isTrending || false,
                inStock: product.inStock !== false,
            }
            : { ...emptyForm }
    );

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const toggleSize = (s) => set('sizes', form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : [...form.sizes, s]);
    const toggleColor = (c) => {
        const exists = form.colors.find(x => x.name === c.name);
        set('colors', exists ? form.colors.filter(x => x.name !== c.name) : [...form.colors, c]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...form, price: parseFloat(form.price), images: form.images.filter(Boolean) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-900">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)}
                            placeholder="e.g. Classic White T-Shirt"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description *</label>
                        <textarea required rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                            placeholder="Describe the product…"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors resize-none" />
                    </div>

                    {/* Price + Category + Department */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price ($) *</label>
                            <input required type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category *</label>
                            <div className="relative">
                                <select value={form.category} onChange={e => set('category', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black appearance-none bg-white transition-colors">
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department *</label>
                            <div className="relative">
                                <select value={form.department} onChange={e => set('department', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black appearance-none bg-white transition-colors">
                                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sizes</label>
                        <div className="flex gap-2 flex-wrap">
                            {SIZES.map(s => (
                                <button key={s} type="button" onClick={() => toggleSize(s)}
                                    className={`w-12 h-10 rounded-lg border text-sm font-medium transition-all ${form.sizes.includes(s) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colors</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map(c => {
                                const active = form.colors.find(x => x.name === c.name);
                                return (
                                    <button key={c.name} type="button" onClick={() => toggleColor(c)} title={c.name}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                                        style={{ backgroundColor: c.hex }}>
                                        {active && <Check size={12} className={c.hex === '#FFFFFF' ? 'text-black' : 'text-white'} />}
                                    </button>
                                );
                            })}
                        </div>
                        {form.colors.length > 0 && (
                            <p className="text-xs text-gray-400 mt-2">{form.colors.map(c => c.name).join(', ')}</p>
                        )}
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Image URL</label>
                        <input value={form.images[0]} onChange={e => set('images', [e.target.value])}
                            placeholder="https://images.unsplash.com/…"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
                        {form.images[0] && (
                            <img src={form.images[0]} alt="preview" className="mt-2 h-28 w-28 object-cover rounded-xl border border-gray-100"
                                onError={e => { e.target.style.display = 'none'; }} />
                        )}
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        <Toggle value={form.inStock} onChange={v => set('inStock', v)} label="In Stock" />
                        <Toggle value={form.isTrending} onChange={v => set('isTrending', v)} label="Trending" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ── Delete Confirm ───────────────────────────────────────────────────────────
const DeleteConfirm = ({ product, onClose, onConfirm, deleting }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm z-10 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-gray-800">"{product?.name}"</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:border-gray-400 transition-colors">Cancel</button>
                <button onClick={onConfirm} disabled={deleting}
                    className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                    {deleting ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </motion.div>
    </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const AdminProducts = () => {
    const dispatch = useDispatch();
    const { adminProducts, adminLoading } = useSelector(s => s.product);

    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [modal, setModal] = useState(null);     // null | 'add' | product object
    const [delTarget, setDelTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { dispatch(adminFetchProducts()); }, [dispatch]);

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const filtered = adminProducts.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q);
        const matchCat = !filterCat || p.category === filterCat;
        const matchDept = !filterDept || p.department === filterDept;
        return matchSearch && matchCat && matchDept;
    });

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            if (modal && modal !== 'add') {
                await dispatch(adminUpdateProduct({ id: modal._id, productData: formData })).unwrap();
                showToast('Product updated successfully');
            } else {
                await dispatch(adminCreateProduct(formData)).unwrap();
                showToast('Product added successfully');
            }
            setModal(null);
        } catch {
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await dispatch(adminDeleteProduct(delTarget._id)).unwrap();
            showToast('Product deleted');
            setDelTarget(null);
        } catch {
            showToast('Failed to delete product.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{adminProducts.length} items in catalogue</p>
                </div>
                <button onClick={() => setModal('add')}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" />
                </div>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                {(search || filterCat || filterDept) && (
                    <button onClick={() => { setSearch(''); setFilterCat(''); setFilterDept(''); }}
                        className="text-xs text-gray-400 hover:text-gray-700 font-medium px-2 py-1 border border-gray-200 rounded-lg transition-colors">
                        Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {adminLoading ? (
                    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={20} className="animate-spin" /> Loading products…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <Package size={36} className="opacity-30" />
                        <p className="text-sm">No products found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-3 text-left">Product</th>
                                    <th className="px-6 py-3 text-left">Category</th>
                                    <th className="px-6 py-3 text-left">Dept.</th>
                                    <th className="px-6 py-3 text-left">Price</th>
                                    <th className="px-6 py-3 text-left">Sizes</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(p => (
                                    <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt={p.name}
                                                        className="w-12 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                                                        onError={e => e.target.replaceWith(Object.assign(document.createElement('div'), { className: 'w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center' }))} />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                                        <ImageOff size={16} className="text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{p.name}</p>
                                                    {p.isTrending && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">🔥 Trending</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><Badge>{p.category}</Badge></td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{p.department}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${Number(p.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">{p.sizes?.join(', ') || '—'}</td>
                                        <td className="px-6 py-4">
                                            <Badge color={p.inStock !== false ? 'green' : 'red'}>
                                                {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setModal(p)}
                                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Pencil size={15} />
                                                </button>
                                                <button onClick={() => setDelTarget(p)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {modal && (
                    <ProductModal
                        product={modal === 'add' ? null : modal}
                        onClose={() => setModal(null)}
                        onSave={handleSave}
                        saving={saving}
                    />
                )}
                {delTarget && (
                    <DeleteConfirm
                        product={delTarget}
                        onClose={() => setDelTarget(null)}
                        onConfirm={handleDelete}
                        deleting={deleting}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProducts;
