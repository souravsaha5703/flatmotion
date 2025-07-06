import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';
import type { GuestData } from '@/utils/AppInterfaces';

interface GuestInfo {
    guest: GuestData | null
}

const initialState: GuestInfo = {
    guest: null
}

export const guestSlice = createSlice({
    name: 'guest',
    initialState,
    reducers: {
        addGuest: (state,action:PayloadAction<GuestData>) => {
            state.guest = action.payload;
        }
    },
});

export const { addGuest } = guestSlice.actions;

export const selectGuest = (state: RootState) => { state.guest.guest };

export default guestSlice.reducer;