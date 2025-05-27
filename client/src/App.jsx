import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PaymentForm from './components/PaymentForm'
import PaymentStatus from './components/PaymentStatus'

function App() {
  return (
    <Router>
      <div className="app-container">
        <h1>IntaSend Payment Integration</h1>
        <Routes>
          <Route path="/" element={<PaymentForm />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App