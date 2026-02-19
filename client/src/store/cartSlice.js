import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
    isCartOpen: false,
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id && x.selectedSize === item.selectedSize && x.selectedColor.name === item.selectedColor.name);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id && x.selectedSize === existItem.selectedSize && x.selectedColor.name === existItem.selectedColor.name ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action) => {
            // Expecting payload to be unique ID combination or just filtering
            state.cartItems = state.cartItems.filter((x) => !(x._id === action.payload._id && x.selectedSize === action.payload.selectedSize && x.selectedColor.name === action.payload.selectedColor.name));
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        toggleCart: (state) => {
            state.isCartOpen = !state.isCartOpen;
        },
        clearCart: (state) => {
            state.cartItems = [];
            localStorage.removeItem('cartItems');
        }
    },
});

export const { addToCart, removeFromCart, toggleCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
