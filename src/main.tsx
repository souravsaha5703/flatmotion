import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './Routes.tsx';
import { Provider } from 'react-redux';
import { store } from './store/Store.ts';
import { ThemeProvider } from '@/components/theme-provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
