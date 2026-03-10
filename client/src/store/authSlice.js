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

// ── Google OAuth ───────────────────────────────────────────────────────────────
export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (access_token, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/google`, { access_token });
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ── Facebook OAuth ─────────────────────────────────────────────────────────────
export const loginWithFacebook = createAsyncThunk('auth/loginWithFacebook', async ({ accessToken, userID }, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/facebook`, { accessToken, userID });
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email });
        return response.data.message;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
        return response.data.message;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
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
        // Token expired or invalid — clear stale session silently
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
        }
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
    // Never block initial render — profile is refreshed silently in background
    profileLoading: false,
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
            // loginWithGoogle
            .addCase(loginWithGoogle.pending, (state) => { state.isLoading = true; })
            .addCase(loginWithGoogle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(loginWithGoogle.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            // loginWithFacebook
            .addCase(loginWithFacebook.pending, (state) => { state.isLoading = true; })
            .addCase(loginWithFacebook.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(loginWithFacebook.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            // fetchProfile
            .addCase(fetchProfile.pending, (state) => { state.profileLoading = true; })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.profileLoading = false;
                // If token was expired/invalid, clear the user so they're logged out
                if (action.payload === 'No token' || action.error?.message?.includes('401')) {
                    state.user = null;
                }
            })
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
            })
            // forgotPassword
            .addCase(forgotPassword.pending, (state) => { state.isLoading = true; })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = action.payload;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // resetPassword
            .addCase(resetPassword.pending, (state) => { state.isLoading = true; })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = action.payload;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
