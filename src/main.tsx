
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'

// Add San Francisco font styles
const style = document.createElement('style')
style.textContent = `
  @font-face {
    font-family: 'San Francisco';
    src: url('https://applesocial.s3.amazonaws.com/assets/styles/fonts/sanfrancisco/sanfranciscodisplay-regular-webfont.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  
  @font-face {
    font-family: 'San Francisco';
    src: url('https://applesocial.s3.amazonaws.com/assets/styles/fonts/sanfrancisco/sanfranciscodisplay-medium-webfont.woff2') format('woff2');
    font-weight: 500;
    font-style: normal;
  }
  
  @font-face {
    font-family: 'San Francisco';
    src: url('https://applesocial.s3.amazonaws.com/assets/styles/fonts/sanfrancisco/sanfranciscodisplay-bold-webfont.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
  }
  
  body {
    font-family: 'San Francisco', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }
`
document.head.appendChild(style)

createRoot(document.getElementById("root")!).render(<App />);
