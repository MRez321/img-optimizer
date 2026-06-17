import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// import App, {Rcomp} from './App.tsx'
import App from './App.tsx';
import './index.css';
import './components.css';


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);


// createRoot(document.getElementById('Rcomp')!).render(
//     <StrictMode>
//         <Rcomp />
//     </StrictMode>,
// )




