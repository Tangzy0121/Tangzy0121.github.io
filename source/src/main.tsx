import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Terminal } from './term/Terminal';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><div className="page"><Terminal /></div></StrictMode>,
);
