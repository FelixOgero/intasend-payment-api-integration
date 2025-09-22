// // client/src/components/PaymentStatus.jsx
// import { useEffect, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import axios from 'axios'

// const API_URL = 'http://localhost:5000/api/payments'

// function PaymentStatus() {
//   const [status, setStatus] = useState('PROCESSING')
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [paymentDetails, setPaymentDetails] = useState(null)
  
//   const location = useLocation()
//   const navigate = useNavigate()
  
//   useEffect(() => {
//     // First try to get tracking ID from URL parameters
//     const queryParams = new URLSearchParams(location.search)
//     let trackingId = queryParams.get('tracking_id')
    
//     // If not in URL, try localStorage (we stored it there during checkout)
//     if (!trackingId) {
//       trackingId = localStorage.getItem('paymentTrackingId')
//       // Clear from localStorage after retrieving
//       if (trackingId) localStorage.removeItem('paymentTrackingId')
//     }
    
//     if (!trackingId) {
//       setError('No tracking ID found. Cannot check payment status.')
//       setLoading(false)
//       return
//     }
    
//     console.log(`Checking payment status for tracking ID: ${trackingId}`)
    
//     const checkStatus = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/status/${trackingId}`)
        
//         if (response.data.success) {
//           setStatus(response.data.data.status)
//           setPaymentDetails(response.data.data)
//         } else {
//           setError('Failed to get payment status')
//         }
//       } catch (error) {
//         console.error('Status fetch error:', error)
//         setError(
//           error.response?.data?.message || 
//           'Error checking payment status. The transaction ID may be invalid.'
//         )
//       } finally {
//         setLoading(false)
//       }
//     }
    
//     checkStatus()
    
//     // If status is still processing, check every 5 seconds for up to 1 minute
//     if (status === 'PROCESSING' || status === 'PENDING') {
//       const intervalId = setInterval(checkStatus, 5000)
//       const timeoutId = setTimeout(() => {
//         clearInterval(intervalId)
//         if (status === 'PROCESSING' || status === 'PENDING') {
//           setStatus('UNKNOWN')
//         }
//       }, 60000)
      
//       return () => {
//         clearInterval(intervalId)
//         clearTimeout(timeoutId)
//       }
//     }
//   }, [location.search, status])
  
//   const getStatusClass = () => {
//     switch (status) {
//       case 'COMPLETE':
//         return 'status-complete'
//       case 'FAILED':
//         return 'status-failed'
//       case 'UNKNOWN':
//         return 'status-unknown'
//       default:
//         return 'status-pending'
//     }
//   }
  
//   const getStatusMessage = () => {
//     switch (status) {
//       case 'COMPLETE':
//         return 'Payment completed successfully!'
//       case 'FAILED':
//         return 'Payment failed or was cancelled'
//       case 'PROCESSING':
//         return 'Payment is being processed...'
//       case 'PENDING':
//         return 'Payment is pending confirmation...'
//       case 'UNKNOWN':
//         return 'Payment status is unknown or taking too long to process'
//       default:
//         return 'Checking payment status...'
//     }
//   }
  
//   return (
//     <div className="payment-status-container">
//       <h2>Payment Status</h2>
      
//       {loading ? (
//         <div className="loading-spinner">Loading payment status...</div>
//       ) : error ? (
//         <div className="error-message">{error}</div>
//       ) : (
//         <>
//           <div className={`status-indicator ${getStatusClass()}`}>
//             <h3>{getStatusMessage()}</h3>
//           </div>
          
//           {paymentDetails && (
//             <div className="payment-details">
//               <p><strong>Amount:</strong> {paymentDetails.amount} {paymentDetails.currency}</p>
//               <p><strong>Transaction ID:</strong> {paymentDetails.trackingId}</p>
//               <p><strong>Date:</strong> {new Date(paymentDetails.createdAt).toLocaleString()}</p>
//             </div>
//           )}
          
//           <button onClick={() => navigate('/')} className="back-button">
//             Return to Payments
//           </button>
//         </>
//       )}
//     </div>
//   )
// }

// export default PaymentStatus




import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

// const API_URL = 'http://localhost:5000/api/payments'
const API_URL = 'https://intasend-payment-api-integration.onrender.com/api/payments'

function PaymentStatus() {
  const [status, setStatus] = useState('PROCESSING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentDetails, setPaymentDetails] = useState(null)
  
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const checkPaymentStatus = async (id) => {
      try {
        console.log(`Checking payment status for ID: ${id}`)
        const response = await axios.get(`${API_URL}/status/${id}`)
        
        if (response.data.success) {
          setStatus(response.data.data.status)
          setPaymentDetails(response.data.data)
        } else {
          setError('Failed to get payment status')
        }
      } catch (error) {
        console.error('Status fetch error:', error)
        setError(
          error.response?.data?.message || 
          'Error checking payment status. The transaction ID may be invalid.'
        )
      } finally {
        setLoading(false)
      }
    }
    
    const getPaymentId = () => {
      // First try to get tracking ID from URL parameters
      const queryParams = new URLSearchParams(location.search)
      const trackingId = queryParams.get('tracking_id')
      
      // Check if it might be an invoice_id from IntaSend
      const invoiceId = queryParams.get('invoice_id')
      
      // Look for signature which indicates it's coming from IntaSend
      const signature = queryParams.get('signature')
      
      // If we have both tracking_id and signature, use tracking_id (our ID)
      if (trackingId) {
        return trackingId
      }
      
      // If we have invoice_id (IntaSend's ID), use that
      if (invoiceId) {
        return invoiceId
      }
      
      // If nothing in URL, try localStorage (we stored it there during checkout)
      return localStorage.getItem('paymentTrackingId')
    }
    
    const paymentId = getPaymentId()
    
    if (!paymentId) {
      setError('No payment ID found. Cannot check payment status.')
      setLoading(false)
      return
    }
    
    // Clear from localStorage after retrieving
    localStorage.removeItem('paymentTrackingId')
    
    // Initial check
    checkPaymentStatus(paymentId)
    
    // If status is still processing, check every 5 seconds for up to 1 minute
    if (status === 'PROCESSING' || status === 'PENDING') {
      const intervalId = setInterval(() => checkPaymentStatus(paymentId), 5000)
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        if (status === 'PROCESSING' || status === 'PENDING') {
          setStatus('UNKNOWN')
        }
      }, 60000)
      
      return () => {
        clearInterval(intervalId)
        clearTimeout(timeoutId)
      }
    }
  }, [location.search, status])
  
  const getStatusClass = () => {
    switch (status) {
      case 'COMPLETE':
        return 'status-complete'
      case 'FAILED':
        return 'status-failed'
      case 'UNKNOWN':
        return 'status-unknown'
      default:
        return 'status-pending'
    }
  }
  
  const getStatusMessage = () => {
    switch (status) {
      case 'COMPLETE':
        return 'Payment completed successfully!'
      case 'FAILED':
        return 'Payment failed or was cancelled'
      case 'PROCESSING':
        return 'Payment is being processed...'
      case 'PENDING':
        return 'Payment is pending confirmation...'
      case 'UNKNOWN':
        return 'Payment status is unknown or taking too long to process'
      default:
        return 'Checking payment status...'
    }
  }
  
  return (
    <div className="payment-status-container">
      <h2>Payment Status</h2>
      
      {loading ? (
        <div className="loading-spinner">Loading payment status...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className={`status-indicator ${getStatusClass()}`}>
            <h3>{getStatusMessage()}</h3>
          </div>
          
          {paymentDetails && (
            <div className="payment-details">
              <p><strong>Amount:</strong> {paymentDetails.amount} {paymentDetails.currency}</p>
              <p><strong>Transaction ID:</strong> {paymentDetails.trackingId}</p>
              <p><strong>Date:</strong> {new Date(paymentDetails.createdAt).toLocaleString()}</p>
            </div>
          )}
          
          <button onClick={() => navigate('/')} className="back-button">
            Return to Payments
          </button>
        </>
      )}
    </div>
  )
}

export default PaymentStatus