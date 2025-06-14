import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Select } from '@/components/ui/select'

// Get the root element
const rootElement = document.getElementById('root')

// Create a root
const root = createRoot(rootElement)

// Render your application
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)