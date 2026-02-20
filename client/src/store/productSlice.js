import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api/products`;
const ADMIN_API_URL = `${BASE_URL}/api/admin`;

const getAuthConfig = (thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

// ── localStorage cache for all products (30 min TTL) ──────────────────────
const CACHE_KEY = 'fec_all_v2';
const CACHE_TTL = 30 * 60 * 1000;

const readCache = () => {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
        return entry.data;
    } catch { return null; }
};

const writeCache = (data) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
};

// ── Filter preferences (survives tab close) ────────────────────────────────
const FILTER_KEY = 'fec_filter_prefs';
export const saveFilterPrefs = (f) => { try { localStorage.setItem(FILTER_KEY, JSON.stringify(f)); } catch {} };
export const loadFilterPrefs = () => { try { return JSON.parse(localStorage.getItem(FILTER_KEY)) || {}; } catch { return {}; } };

// ── Fetch ALL products once, cache in localStorage ─────────────────────────
export const fetchAllProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, thunkAPI) => {
        const cached = readCache();
        if (cached) return cached;
        try {
            // no ?page → backend returns plain array (all products)
            const { data } = await axios.get(API_URL);
            const list = Array.isArray(data) ? data : (data.products || []);
            writeCache(list);
            return list;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ── Admin Products ──────────────────────────────────────────────────────────
export const adminFetchProducts = createAsyncThunk('products/adminGetAll', async (_, thunkAPI) => {
    try {
        const { data } = await axios.get(`${ADMIN_API_URL}/products`, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminCreateProduct = createAsyncThunk('products/adminCreate', async (productData, thunkAPI) => {
    try {
        const { data } = await axios.post(`${ADMIN_API_URL}/products`, productData, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminUpdateProduct = createAsyncThunk('products/adminUpdate', async ({ id, productData }, thunkAPI) => {
    try {
        const { data } = await axios.put(`${ADMIN_API_URL}/products/${id}`, productData, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminDeleteProduct = createAsyncThunk('products/adminDelete', async (id, thunkAPI) => {
    try {
        await axios.delete(`${ADMIN_API_URL}/products/${id}`, getAuthConfig(thunkAPI));
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// ── Admin Users ─────────────────────────────────────────────────────────────
export const adminFetchUsers = createAsyncThunk('products/adminGetUsers', async (_, thunkAPI) => {
    try {
        const { data } = await axios.get(`${ADMIN_API_URL}/users`, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminUpdateUserRole = createAsyncThunk('products/adminUpdateUserRole', async ({ id, role }, thunkAPI) => {
    try {
        const { data } = await axios.put(`${ADMIN_API_URL}/users/${id}/role`, { role }, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminDeleteUser = createAsyncThunk('products/adminDeleteUser', async (id, thunkAPI) => {
    try {
        await axios.delete(`${ADMIN_API_URL}/users/${id}`, getAuthConfig(thunkAPI));
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// ── Admin Orders ────────────────────────────────────────────────────────────
export const adminFetchOrders = createAsyncThunk('products/adminGetOrders', async (_, thunkAPI) => {
    try {
        const { data } = await axios.get(`${ADMIN_API_URL}/orders`, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const adminUpdateOrderStatus = createAsyncThunk('products/adminUpdateOrderStatus', async ({ id, isPaid, isDelivered }, thunkAPI) => {
    try {
        const { data } = await axios.put(`${ADMIN_API_URL}/orders/${id}/status`, { isPaid, isDelivered }, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// ── Admin Stats ─────────────────────────────────────────────────────────────
export const adminFetchStats = createAsyncThunk('products/adminGetStats', async (_, thunkAPI) => {
    try {
        const { data } = await axios.get(`${ADMIN_API_URL}/dashboard/stats`, getAuthConfig(thunkAPI));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// ── Slice ───────────────────────────────────────────────────────────────────
const initialState = {
    allProducts: [],      // full list from DB (cached)
    products: [],         // filtered view (client-side)
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    adminProducts: [],
    adminUsers: [],
    adminOrders: [],
    adminStats: null,
    adminLoading: false,
    adminError: null,
};

const applyFilters = (all, { department, category, sizes, colors, priceRange } = {}) => {
    let out = all;
    if (department) out = out.filter(p => p.department === department);
    if (category)   out = out.filter(p => p.category === category);
    if (sizes?.length)  out = out.filter(p => p.sizes?.some(s => sizes.includes(s)));
    if (colors?.length) out = out.filter(p => p.colors?.some(c => colors.includes(c.name)));
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        out = out.filter(p => p.price >= min && p.price <= max);
    }
    return out;
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
            state.adminError = null;
        },
        // Instant client-side filter — zero API calls
        filterProducts: (state, action) => {
            state.products = applyFilters(state.allProducts, action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // ── fetchAllProducts ───────────────────────────────────────────
            .addCase(fetchAllProducts.pending,   (state) => { state.isLoading = true; })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.allProducts = action.payload;
                state.products    = action.payload; // show all by default
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError   = true;
                state.message   = action.payload;
            })

            // ── Admin products ─────────────────────────────────────────────
            .addCase(adminFetchProducts.pending,    (state) => { state.adminLoading = true; })
            .addCase(adminFetchProducts.fulfilled,  (state, action) => { state.adminLoading = false; state.adminProducts = action.payload; })
            .addCase(adminFetchProducts.rejected,   (state, action) => { state.adminLoading = false; state.adminError = action.payload; })
            .addCase(adminCreateProduct.fulfilled,  (state, action) => { state.adminProducts.unshift(action.payload); })
            .addCase(adminUpdateProduct.fulfilled,  (state, action) => {
                const idx = state.adminProducts.findIndex(p => p._id === action.payload._id);
                if (idx !== -1) state.adminProducts[idx] = action.payload;
            })
            .addCase(adminDeleteProduct.fulfilled,  (state, action) => {
                state.adminProducts = state.adminProducts.filter(p => p._id !== action.payload);
            })

            // ── Admin users ────────────────────────────────────────────────
            .addCase(adminFetchUsers.pending,       (state) => { state.adminLoading = true; })
            .addCase(adminFetchUsers.fulfilled,     (state, action) => { state.adminLoading = false; state.adminUsers = action.payload; })
            .addCase(adminUpdateUserRole.fulfilled, (state, action) => {
                const idx = state.adminUsers.findIndex(u => u._id === action.payload._id);
                if (idx !== -1) state.adminUsers[idx] = { ...state.adminUsers[idx], ...action.payload };
            })
            .addCase(adminDeleteUser.fulfilled,     (state, action) => {
                state.adminUsers = state.adminUsers.filter(u => u._id !== action.payload);
            })

            // ── Admin orders ───────────────────────────────────────────────
            .addCase(adminFetchOrders.pending,         (state) => { state.adminLoading = true; })
            .addCase(adminFetchOrders.fulfilled,       (state, action) => { state.adminLoading = false; state.adminOrders = action.payload; })
            .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
                const idx = state.adminOrders.findIndex(o => o._id === action.payload._id);
                if (idx !== -1) state.adminOrders[idx] = action.payload;
            })

            // ── Admin stats ────────────────────────────────────────────────
            .addCase(adminFetchStats.fulfilled, (state, action) => { state.adminStats = action.payload; });
    },
});

export const { reset, filterProducts } = productSlice.actions;
export default productSlice.reducer;
