import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';
import type { Chat } from '@/utils/AppInterfaces';

interface ChatData {
    allChats: Chat[]
}

const initialState: ChatData = {
    allChats: []
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addAllChats: (state, action: PayloadAction<Chat[]>) => {
            state.allChats = action.payload;
        },
        addChat: (state, action: PayloadAction<Chat>) => {
            state.allChats.push(action.payload);
        }
    },
});

export const { addAllChats, addChat } = chatSlice.actions;

export const selectChat = (state: RootState) => { state.chat.allChats };

export default chatSlice.reducer;