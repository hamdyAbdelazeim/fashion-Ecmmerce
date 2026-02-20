import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api/products`;
const ADMIN_API_URL = `${BASE_URL}/api/admin`;

const getAuthConfig = (thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

// ── Per-page cache (key = filter params + page, TTL = 15 min) ─────────────
const CACHE_TTL = 15 * 60 * 1000;

const cacheKey = (filters, page) => {
    const { department = '', category = '', sizes = [], colors = [], priceRange = '' } = filters || {};
    return `fec|d=${department}|c=${category}|s=${[...sizes].sort().join(',')}|col=${[...colors].sort().join(',')}|p=${priceRange}|pg=${page}`;
};

const readCache = (key) => {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.ts > CACHE_TTL) { sessionStorage.removeItem(key); return null; }
        return entry.data;
    } catch { return null; }
};

const writeCache = (key, data) => {
    try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
};

// ── Persist filter preferences to localStorage (survives page close) ───────
const FILTER_PREF_KEY = 'fec_filter_prefs';
export const saveFilterPrefs = (filters) => {
    try { localStorage.setItem(FILTER_PREF_KEY, JSON.stringify(filters)); } catch {}
};
export const loadFilterPrefs = () => {
    try { return JSON.parse(localStorage.getItem(FILTER_PREF_KEY)) || {}; } catch { return {}; }
};

// ── Fetch a page of products (cached per filter+page key) ──────────────────
export const fetchProductsPage = createAsyncThunk(
    'products/fetchPage',
    async ({ filters = {}, page = 1 } = {}, thunkAPI) => {
        const key = cacheKey(filters, page);
        const cached = readCache(key);
        if (cached) return { ...cached, page, fromCache: true };

        try {
            const { department, category, sizes, colors, priceRange } = filters;
            const params = new URLSearchParams({ page, limit: 12 });
            if (department) params.append('department', department);
            if (category) params.append('category', category);
            if (sizes?.length) params.append('sizes', sizes.join(','));
            if (colors?.length) params.append('colors', colors.join(','));
            if (priceRange) params.append('priceRange', priceRange);

            const { data } = await axios.get(`${API_URL}?${params}`);
            writeCache(key, data);
            return { ...data, page, fromCache: false };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// ── Trending products for Home page ────────────────────────────────────────
export const fetchTrending = createAsyncThunk(
    'products/fetchTrending',
    async (_, thunkAPI) => {
        const key = 'fec|trending';
        const cached = readCache(key);
        if (cached) return cached;
        try {
            const { data } = await axios.get(`${API_URL}?limit=48`);
            const trending = data.products.filter(p => p.isTrending).slice(0, 4);
            writeCache(key, trending);
            return trending;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// ── Legacy: kept so any remaining references don't break ───────────────────
export const fetchAllProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, thunkAPI) => {
        const key = 'fec|all';
        const cached = readCache(key);
        if (cached) return cached;
        try {
            const { data } = await axios.get(`${API_URL}?limit=48`);
            writeCache(key, data.products);
            return data.products;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
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
    // Shop page — paginated, infinite-scroll
    products: [],
    hasMore: true,
    currentPage: 0,
    totalCount: 0,
    currentFilters: {},
    isLoading: false,
    isLoadingMore: false,

    // Home page
    trendingProducts: [],
    trendingLoading: false,

    // Legacy compat
    allProducts: [],

    // Admin
    adminProducts: [],
    adminUsers: [],
    adminOrders: [],
    adminStats: null,
    adminLoading: false,
    adminError: null,

    isError: false,
    isSuccess: false,
    message: '',
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isLoadingMore = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
            state.adminError = null;
        },
        // Called when filters change: wipe the display list so page 1 is fetched fresh
        resetProducts: (state, action) => {
            state.products = [];
            state.hasMore = true;
            state.currentPage = 0;
            state.totalCount = 0;
            state.currentFilters = action.payload || {};
        },
    },
    extraReducers: (builder) => {
        builder
            // ── fetchProductsPage ──────────────────────────────────────────
            .addCase(fetchProductsPage.pending, (state, action) => {
                const isFirst = (action.meta.arg?.page ?? 1) === 1;
                if (isFirst) state.isLoading = true;
                else state.isLoadingMore = true;
            })
            .addCase(fetchProductsPage.fulfilled, (state, action) => {
                const { products, hasMore, totalCount, page } = action.payload;
                state.isLoading = false;
                state.isLoadingMore = false;
                state.isSuccess = true;
                state.hasMore = hasMore ?? false;
                state.totalCount = totalCount ?? 0;
                state.currentPage = page;
                if (page === 1) {
                    state.products = products;
                } else {
                    const ids = new Set(state.products.map(p => p._id));
                    state.products = [...state.products, ...products.filter(p => !ids.has(p._id))];
                }
            })
            .addCase(fetchProductsPage.rejected, (state, action) => {
                state.isLoading = false;
                state.isLoadingMore = false;
                state.isError = true;
                state.message = action.payload;
            })

            // ── fetchTrending ──────────────────────────────────────────────
            .addCase(fetchTrending.pending, (state) => { state.trendingLoading = true; })
            .addCase(fetchTrending.fulfilled, (state, action) => {
                state.trendingLoading = false;
                state.trendingProducts = action.payload;
            })
            .addCase(fetchTrending.rejected, (state) => { state.trendingLoading = false; })

            // ── fetchAllProducts (legacy) ──────────────────────────────────
            .addCase(fetchAllProducts.pending, (state) => { state.isLoading = true; })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allProducts = action.payload;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // ── Admin products ─────────────────────────────────────────────
            .addCase(adminFetchProducts.pending, (state) => { state.adminLoading = true; })
            .addCase(adminFetchProducts.fulfilled, (state, action) => { state.adminLoading = false; state.adminProducts = action.payload; })
            .addCase(adminFetchProducts.rejected, (state, action) => { state.adminLoading = false; state.adminError = action.payload; })
            .addCase(adminCreateProduct.fulfilled, (state, action) => { state.adminProducts.unshift(action.payload); })
            .addCase(adminUpdateProduct.fulfilled, (state, action) => {
                const idx = state.adminProducts.findIndex(p => p._id === action.payload._id);
                if (idx !== -1) state.adminProducts[idx] = action.payload;
            })
            .addCase(adminDeleteProduct.fulfilled, (state, action) => {
                state.adminProducts = state.adminProducts.filter(p => p._id !== action.payload);
            })

            // ── Admin users ────────────────────────────────────────────────
            .addCase(adminFetchUsers.pending, (state) => { state.adminLoading = true; })
            .addCase(adminFetchUsers.fulfilled, (state, action) => { state.adminLoading = false; state.adminUsers = action.payload; })
            .addCase(adminUpdateUserRole.fulfilled, (state, action) => {
                const idx = state.adminUsers.findIndex(u => u._id === action.payload._id);
                if (idx !== -1) state.adminUsers[idx] = { ...state.adminUsers[idx], ...action.payload };
            })
            .addCase(adminDeleteUser.fulfilled, (state, action) => {
                state.adminUsers = state.adminUsers.filter(u => u._id !== action.payload);
            })

            // ── Admin orders ───────────────────────────────────────────────
            .addCase(adminFetchOrders.pending, (state) => { state.adminLoading = true; })
            .addCase(adminFetchOrders.fulfilled, (state, action) => { state.adminLoading = false; state.adminOrders = action.payload; })
            .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
                const idx = state.adminOrders.findIndex(o => o._id === action.payload._id);
                if (idx !== -1) state.adminOrders[idx] = action.payload;
            })

            // ── Admin stats ────────────────────────────────────────────────
            .addCase(adminFetchStats.fulfilled, (state, action) => { state.adminStats = action.payload; });
    },
});

export const { reset, resetProducts } = productSlice.actions;
export default productSlice.reducer;
