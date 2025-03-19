import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './App.css'
import './styles/global.css'
import Modal from 'react-modal'
import App from './App.tsx'

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
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
