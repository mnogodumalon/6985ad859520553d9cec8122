import './App.css'
import Dashboard from '@/pages/Dashboard'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Dashboard />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </>
  )
}

export default App
