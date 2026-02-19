import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api/products`;
const ADMIN_API_URL = `${BASE_URL}/api/admin`;

const getAuthConfig = (thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

// ── Public ─────────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk(
    'products/getAll',
    async ({ category, department, sizes, colors, priceRange } = {}, thunkAPI) => {
        try {
            let query = '?';
            if (category) query += `category=${category}&`;
            if (department) query += `department=${department}&`;
            if (sizes && sizes.length > 0) query += `sizes=${sizes.join(',')}&`;
            if (colors && colors.length > 0) query += `colors=${colors.join(',')}&`;
            if (priceRange) query += `priceRange=${priceRange}&`;
            const { data } = await axios.get(API_URL + query);
            return data;
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
    products: [],
    adminProducts: [],
    adminUsers: [],
    adminOrders: [],
    adminStats: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    adminLoading: false,
    adminError: null,
    message: '',
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
    },
    extraReducers: (builder) => {
        builder
            // Public
            .addCase(fetchProducts.pending, (state) => { state.isLoading = true; })
            .addCase(fetchProducts.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.products = action.payload; })
            .addCase(fetchProducts.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
            // Admin products
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
            // Admin users
            .addCase(adminFetchUsers.pending, (state) => { state.adminLoading = true; })
            .addCase(adminFetchUsers.fulfilled, (state, action) => { state.adminLoading = false; state.adminUsers = action.payload; })
            .addCase(adminUpdateUserRole.fulfilled, (state, action) => {
                const idx = state.adminUsers.findIndex(u => u._id === action.payload._id);
                if (idx !== -1) state.adminUsers[idx] = { ...state.adminUsers[idx], ...action.payload };
            })
            .addCase(adminDeleteUser.fulfilled, (state, action) => {
                state.adminUsers = state.adminUsers.filter(u => u._id !== action.payload);
            })
            // Admin orders
            .addCase(adminFetchOrders.pending, (state) => { state.adminLoading = true; })
            .addCase(adminFetchOrders.fulfilled, (state, action) => { state.adminLoading = false; state.adminOrders = action.payload; })
            .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
                const idx = state.adminOrders.findIndex(o => o._id === action.payload._id);
                if (idx !== -1) state.adminOrders[idx] = action.payload;
            })
            // Admin stats
            .addCase(adminFetchStats.fulfilled, (state, action) => { state.adminStats = action.payload; });
    },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
