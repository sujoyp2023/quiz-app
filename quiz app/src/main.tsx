import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import QuizApp from './quiz-app.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QuizApp />
 <div className="bg-green-500 text-white p-4">
      Tailwind is working!
    </div>
  </StrictMode>,
)
