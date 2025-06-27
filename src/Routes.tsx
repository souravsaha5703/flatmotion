import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Page from './Pages/Page';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}>
                    <Route path='' element={<Page />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;