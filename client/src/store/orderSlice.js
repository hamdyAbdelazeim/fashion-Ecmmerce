import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/orders';

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (_, thunkAPI) => {
    try {
        const { user } = thunkAPI.getState().auth;
        const response = await axios.get(`${API_URL}/mine`, {
            headers: { Authorization: `Bearer ${user.token}` },
        });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        myOrders: [],
        isLoading: false,
        isError: false,
        message: '',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyOrders.pending, (state) => { state.isLoading = true; state.isError = false; })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myOrders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export default orderSlice.reducer;
