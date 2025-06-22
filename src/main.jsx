import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = "222286917457-kurblm37cidb02n1puitaqglrir3ljg6.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
	// <StrictMode>
	
		<BrowserRouter>
			<GoogleOAuthProvider clientId={googleClientId}>
				<App />
			</GoogleOAuthProvider>
		</BrowserRouter>
		
	// </StrictMode>,
)
