import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 🔐 Pi SDK initialisieren
if (window.Pi) {
  window.Pi.init({
    version: "2.0",
    sandbox: false
  })
  console.log("Pi SDK initialized")
} else {
  console.warn("Pi SDK NOT available")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
