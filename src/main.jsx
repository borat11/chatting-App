import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import firebaseConfig from './db/firebaseConfig.js'
import store from './features/store.js'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
