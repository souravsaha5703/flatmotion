import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Page from './Pages/Page';
import ChatPage from './Pages/Chat.tsx';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}>
                    <Route path='' element={<Page />} />
                    <Route path='chat/:id' element={<ChatPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;