import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';

interface PromptData {
    currentPrompt: string
}

const initialState: PromptData = {
    currentPrompt: ''
}

export const promptSlice = createSlice({
    name: 'prompt',
    initialState,
    reducers: {
        addPrompt: (state, action: PayloadAction<string>) => {
            state.currentPrompt = action.payload;
        }
    },
});

export const { addPrompt } = promptSlice.actions;

export const selectPrompt = (state: RootState) => { state.prompt.currentPrompt };

export default promptSlice.reducer;