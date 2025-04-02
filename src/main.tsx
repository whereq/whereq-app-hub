import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './App.css'
import './styles/global.css'
import Modal from 'react-modal'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@contexts/AuthContext.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'

// Polyfill for global object
if (typeof global === "undefined") {
  (window as typeof globalThis).global = window;
}


// Set the app element for react-modal
Modal.setAppElement("#root");

// Create a new QueryClient instance
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
