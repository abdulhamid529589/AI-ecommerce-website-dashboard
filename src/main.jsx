import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/responsive-modals.css'
import './styles/dark-enforce.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'

// Force global dark mode for the dashboard (no white backgrounds)
try {
  document.documentElement.classList.add('dark')
} catch (e) {
  // safe fallback for SSR or test environments
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
