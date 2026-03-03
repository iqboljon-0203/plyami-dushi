import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-right" toastOptions={{
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(139, 0, 0, 0.2)' }
        }} />
      </BrowserRouter>
    </AppProvider>
  </StrictMode>,
)
