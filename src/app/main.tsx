import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';

import './colors.css';
import './controls.css';

import './component_styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/lang-nav">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
