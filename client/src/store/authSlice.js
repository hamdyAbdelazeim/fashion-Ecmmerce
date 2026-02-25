import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/auth';

// ── Register ──────────────────────────────────────────────────────────────────
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('user');
});

// ── Fetch latest profile from server (called on app load) ─────────────────────
export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, thunkAPI) => {
    try {
        const { user } = thunkAPI.getState().auth;
        if (!user?.token) return thunkAPI.rejectWithValue('No token');
        const response = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${user.token}` },
        });
        // Merge fresh data into localStorage
        const updated = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ── Update profile ────────────────────────────────────────────────────────────
export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
    try {
        const { user } = thunkAPI.getState().auth;
        const response = await axios.put(`${API_URL}/profile`, profileData, {
            headers: { Authorization: `Bearer ${user.token}` },
        });
        // Persist updated user (keep the same token if server returns a new one)
        const updated = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ── Initial state ─────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    // True while fetchProfile is in flight (app-init token verification)
    profileLoading: !!(user?.token),
    message: '',
};

// ── Slice ─────────────────────────────────────────────────────────────────────
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // register
            .addCase(register.pending, (state) => { state.isLoading = true; })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            // login
            .addCase(login.pending, (state) => { state.isLoading = true; })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            // logout
            .addCase(logout.fulfilled, (state) => { state.user = null; })
            // fetchProfile
            .addCase(fetchProfile.pending, (state) => { state.profileLoading = true; })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = action.payload;
            })
            .addCase(fetchProfile.rejected, (state) => { state.profileLoading = false; })
            // updateProfile
            .addCase(updateProfile.pending, (state) => { state.isLoading = true; })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
