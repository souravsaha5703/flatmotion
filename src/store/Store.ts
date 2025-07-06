import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '@/features/chat/chatSlice';
import promptReducer from '@/features/prompt/promptSlice';
import guestReducer from '@/features/guest/guestSlice';

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        prompt:promptReducer,
        guest:guestReducer
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch