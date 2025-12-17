import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* TODO: Replace with your actual Google Client ID from Google Cloud Console */}
        <GoogleOAuthProvider clientId="526877931132-q25vm6petbsr4iqotj6o68b8dka55trq.apps.googleusercontent.com">
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
