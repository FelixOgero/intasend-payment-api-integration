import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PaymentForm from "./components/PaymentForm";
import PaymentStatus from "./components/PaymentStatus";

function App() {
  return (
    <Router>
      <div className="app-container">
        <h1>IntaSend Payment Integration</h1>
        <a
          href="https://github.com/FelixOgero/intasend-payment-api-integration"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", marginBottom: "20px", color: "#0366d6", textDecoration: "none", fontWeight: "bold", fontSize: "16px", textAlign: "center" }}
        >
          View GitHub Repository
        </a>
        <Routes>
          <Route path="/" element={<PaymentForm />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
