import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Page from './Pages/Page';
import ChatPage from './Pages/Chat.tsx';
import NewChat from './Pages/NewChat.tsx';
import ChatHistory from './Pages/ChatHistory.tsx';
import GuestChat from './Pages/GuestChat.tsx';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}>
                    <Route path='' element={<Page />} />
                    <Route path='chat' element={<NewChat />}/>
                    <Route path='chat/:id' element={<ChatPage />} />
                    <Route path='history' element={<ChatHistory />}/>
                    <Route path='guest_chat' element={<GuestChat />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;