// import { useState } from 'react'
// import axios from 'axios'

// const API_URL = 'http://localhost:5000/api/payments'

// function PaymentForm() {
//   const [paymentMethod, setPaymentMethod] = useState('stkPush')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [successMessage, setSuccessMessage] = useState('')
//   const [trackingId, setTrackingId] = useState('')
  
//   // STK Push state
//   const [phoneNumber, setPhoneNumber] = useState('')
//   const [amount, setAmount] = useState('')
  
//   // Checkout state
//   const [customerDetails, setCustomerDetails] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     country: 'KE',
//     city: 'Nairobi',
//     address: '',
//   })

//   const handleCustomerDetailChange = (e) => {
//     const { name, value } = e.target
//     setCustomerDetails({
//       ...customerDetails,
//       [name]: value
//     })
//   }

//   const handleStkSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     setSuccessMessage('')
    
//     try {
//       const response = await axios.post(`${API_URL}/stk`, {
//         phoneNumber,
//         amount
//       })
      
//       if (response.data.success) {
//         setTrackingId(response.data.data.trackingId)
//         setSuccessMessage('Payment initiated! Check your phone to complete the payment.')
//         startStatusCheck(response.data.data.trackingId)
//       }
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to initiate payment')
//       console.error('STK Push error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCheckoutSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     setSuccessMessage('')
    
//     try {
//       const response = await axios.post(`${API_URL}/checkout`, {
//         amount,
//         currency: 'KES',
//         customerDetails
//       })
      
//       if (response.data.success) {
//         setTrackingId(response.data.data.trackingId)
//         setSuccessMessage('Redirecting to payment page...')
//         // Redirect to IntaSend checkout page
//         window.location.href = response.data.data.checkoutUrl
//       }
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to create checkout')
//       console.error('Checkout error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const startStatusCheck = (id) => {
//     // Check payment status every 5 seconds for 60 seconds
//     let attempts = 0
//     const maxAttempts = 12
    
//     const checkInterval = setInterval(async () => {
//       try {
//         const response = await axios.get(`${API_URL}/status/${id}`)
        
//         if (response.data.success) {
//           const { status } = response.data.data
          
//           if (status === 'COMPLETE') {
//             setSuccessMessage('Payment completed successfully!')
//             clearInterval(checkInterval)
//           } else if (status === 'FAILED') {
//             setError('Payment failed or was cancelled')
//             clearInterval(checkInterval)
//           }
//         }
//       } catch (error) {
//         console.error('Status check error:', error)
//       }
      
//       attempts++
//       if (attempts >= maxAttempts) {
//         clearInterval(checkInterval)
//       }
//     }, 5000)
//   }

//   return (
//     <div className="payment-form-container">
//       <div className="payment-method-toggle">
//         <button 
//           className={paymentMethod === 'stkPush' ? 'active' : ''} 
//           onClick={() => setPaymentMethod('stkPush')}
//         >
//           M-Pesa STK Push
//         </button>
//         <button 
//           className={paymentMethod === 'checkout' ? 'active' : ''} 
//           onClick={() => setPaymentMethod('checkout')}
//         >
//           IntaSend Checkout
//         </button>
//       </div>
      
//       {error && <div className="error-message">{error}</div>}
//       {successMessage && <div className="success-message">{successMessage}</div>}
      
//       {paymentMethod === 'stkPush' ? (
//         <form onSubmit={handleStkSubmit} className="payment-form">
//           <h2>M-Pesa STK Push Payment</h2>
          
//           <div className="form-group">
//             <label htmlFor="phoneNumber">Phone Number (254XXXXXXXXX)</label>
//             <input
//               type="text"
//               id="phoneNumber"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               placeholder="254722000000"
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="amount">Amount (KES)</label>
//             <input
//               type="number"
//               id="amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder="10"
//               min="1"
//               required
//             />
//           </div>
          
//           <button type="submit" disabled={loading} className="submit-button">
//             {loading ? 'Processing...' : 'Pay with M-Pesa'}
//           </button>
//         </form>
//       ) : (
//         <form onSubmit={handleCheckoutSubmit} className="payment-form">
//           <h2>IntaSend Checkout</h2>
          
//           <div className="form-group">
//             <label htmlFor="amount">Amount (KES)</label>
//             <input
//               type="number"
//               id="amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder="10"
//               min="1"
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="firstName">First Name</label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={customerDetails.firstName}
//               onChange={handleCustomerDetailChange}
//               placeholder="John"
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="lastName">Last Name</label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={customerDetails.lastName}
//               onChange={handleCustomerDetailChange}
//               placeholder="Doe"
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={customerDetails.email}
//               onChange={handleCustomerDetailChange}
//               placeholder="john@example.com"
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="address">Address</label>
//             <input
//               type="text"
//               id="address"
//               name="address"
//               value={customerDetails.address}
//               onChange={handleCustomerDetailChange}
//               placeholder="123 Main St"
//               required
//             />
//           </div>
          
//           <button type="submit" disabled={loading} className="submit-button">
//             {loading ? 'Processing...' : 'Proceed to Checkout'}
//           </button>
//         </form>
//       )}
//     </div>
//   )
// }

// export default PaymentForm



// client/src/components/PaymentForm.jsx
import { useState } from 'react'
import axios from 'axios'

// const API_URL = 'http://localhost:5000/api/payments'
const API_URL = 'https://intasend-payment-api-integration.onrender.com/api/payments'

function PaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState('stkPush')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [trackingId, setTrackingId] = useState('')
  
  // STK Push state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState('')
  
  // Checkout state
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: 'KE',
    city: 'Nairobi',
    address: '',
  })

  const handleCustomerDetailChange = (e) => {
    const { name, value } = e.target
    setCustomerDetails({
      ...customerDetails,
      [name]: value
    })
  }

  const handleStkSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      // Format phone number if needed (remove any spaces, ensure it has country code)
      let formattedPhone = phoneNumber.trim().replace(/\s+/g, '')
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.substring(1)}`
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = `254${formattedPhone}`
      }
      
      console.log('Initiating STK Push with phone:', formattedPhone, 'amount:', amount)
      
      const response = await axios.post(`${API_URL}/stk`, {
        phoneNumber: formattedPhone,
        amount
      })
      
      if (response.data.success) {
        setTrackingId(response.data.data.trackingId)
        setSuccessMessage('Payment initiated! Check your phone to complete the payment.')
        startStatusCheck(response.data.data.trackingId)
      } else {
        setError(response.data.message || 'Failed to initiate payment')
      }
    } catch (error) {
      console.error('STK Push error:', error)
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to initiate payment. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      // Validation
      if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount')
        setLoading(false)
        return
      }
      
      console.log('Creating checkout with details:', { amount, customerDetails })
      
      const response = await axios.post(`${API_URL}/checkout`, {
        amount,
        currency: 'KES',
        customerDetails
      })
      
      if (response.data.success) {
        setTrackingId(response.data.data.trackingId)
        setSuccessMessage('Redirecting to payment page...')
        
        // Store the tracking ID in localStorage to retrieve after redirect
        localStorage.setItem('paymentTrackingId', response.data.data.trackingId)
        
        // Redirect to IntaSend checkout page
        window.location.href = response.data.data.checkoutUrl
      } else {
        setError(response.data.message || 'Failed to create checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create checkout. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const startStatusCheck = (id) => {
    // Check payment status every 5 seconds for 60 seconds
    let attempts = 0
    const maxAttempts = 12
    
    const checkInterval = setInterval(async () => {
      try {
        console.log(`Checking status for tracking ID: ${id}, attempt ${attempts + 1}/${maxAttempts}`)
        const response = await axios.get(`${API_URL}/status/${id}`)
        
        if (response.data.success) {
          const { status } = response.data.data
          console.log(`Current payment status: ${status}`)
          
          if (status === 'COMPLETE') {
            setSuccessMessage('Payment completed successfully!')
            clearInterval(checkInterval)
          } else if (status === 'FAILED') {
            setError('Payment failed or was cancelled')
            clearInterval(checkInterval)
          }
        }
      } catch (error) {
        console.error('Status check error:', error)
      }
      
      attempts++
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
      }
    }, 5000)
    
    // Return a cleanup function
    return () => clearInterval(checkInterval)
  }

  const handlePhoneNumberChange = (e) => {
    // Allow only numbers and + sign
    const value = e.target.value.replace(/[^\d+]/g, '')
    setPhoneNumber(value)
  }

  const handleAmountChange = (e) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^\d.]/g, '')
    setAmount(value)
  }

  return (
    <div className="payment-form-container">
      <div className="payment-method-toggle">
        <button 
          className={paymentMethod === 'stkPush' ? 'active' : ''} 
          onClick={() => setPaymentMethod('stkPush')}
        >
          M-Pesa STK Push
        </button>
        <button 
          className={paymentMethod === 'checkout' ? 'active' : ''} 
          onClick={() => setPaymentMethod('checkout')}
        >
          IntaSend Checkout
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {paymentMethod === 'stkPush' ? (
        <form onSubmit={handleStkSubmit} className="payment-form">
          <h2>M-Pesa STK Push Payment</h2>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="254722000000 or 0722000000"
              required
            />
            <small>Format: 254722XXXXXX or 0722XXXXXX</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount (KES)</label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="10"
              min="1"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Processing...' : 'Pay with M-Pesa'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCheckoutSubmit} className="payment-form">
          <h2>IntaSend Checkout</h2>
          <h3>Card Test Credentials: Card Number 445653 00 0000 1096, any future date as the expiry and any three digits as the CVC</h3>
          <br />
          <h3>M-Pesa Test Credentials: Phone Number 254708374149</h3>
          <br />
          <div className="form-group">
            <label htmlFor="amount">Amount (KES)</label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="10"
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={customerDetails.firstName}
              onChange={handleCustomerDetailChange}
              placeholder="John"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={customerDetails.lastName}
              onChange={handleCustomerDetailChange}
              placeholder="Doe"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerDetails.email}
              onChange={handleCustomerDetailChange}
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={customerDetails.address}
              onChange={handleCustomerDetailChange}
              placeholder="123 Main St"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </form>
      )}
      
      {trackingId && (
        <div className="tracking-info">
          <p>Tracking ID: {trackingId}</p>
          <small>You can use this ID to check your payment status</small>
        </div>
      )}
    </div>
  )
}

export default PaymentForm