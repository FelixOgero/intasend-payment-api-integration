// // server/controllers/paymentController.js
// const IntaSend = require('intasend-node');
// const Transaction = require('../models/Transaction');
// const dotenv = require('dotenv');

// dotenv.config();

// // Improved logging for debugging
// console.log('IntaSend Configuration:');
// console.log('Publishable Key:', process.env.INTASEND_PUBLISHABLE_KEY);
// console.log('Secret Key:', process.env.INTASEND_SECRET_KEY);
// console.log('Test Mode:', process.env.INTASEND_TEST_MODE);

// // Initialize IntaSend
// const intasend = new IntaSend(
//   process.env.INTASEND_PUBLISHABLE_KEY,
//   process.env.INTASEND_SECRET_KEY,
//   process.env.INTASEND_TEST_MODE === 'true'
// );

// // @desc    Initiate M-Pesa STK Push
// // @route   POST /api/payments/stk
// // @access  Public
// const initiateStkPush = async (req, res) => {
//   try {
//     const { amount, phoneNumber } = req.body;

//     if (!amount || !phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide amount and phone number',
//       });
//     }

//     // Format phone number if needed
//     const formattedPhone = phoneNumber.startsWith('254') 
//       ? phoneNumber 
//       : `254${phoneNumber.replace(/^0+/, '')}`;

//     // Generate a unique tracking ID on our side
//     const trackingId = `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
//     // Initiate STK Push
//     const collection = intasend.collection();
//     const response = await collection.mpesaStkPush({
//       amount: parseFloat(amount),
//       phone_number: formattedPhone,
//       api_ref: trackingId, // Use our generated tracking ID as the api_ref
//       host: process.env.CLIENT_URL,
//       first_name: 'Customer',
//       last_name: 'User',
//       email: 'customer@example.com',
//     });

//     // Check if we have a valid response with invoice details
//     if (!response || !response.invoice || !response.invoice.invoice_id) {
//       throw new Error('Invalid response from IntaSend API');
//     }

//     // Save transaction to database with our generated tracking ID
//     const transaction = await Transaction.create({
//       trackingId: trackingId,
//       invoiceId: response.invoice.invoice_id,
//       amount: parseFloat(amount),
//       currency: 'KES',
//       phoneNumber: formattedPhone,
//       status: 'PENDING',
//       paymentMethod: 'MPESA_STK',
//       customerDetails: {
//         phoneNumber: formattedPhone,
//       },
//       paymentDetails: response,
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         trackingId: transaction.trackingId,
//         invoiceId: transaction.invoiceId,
//         status: transaction.status,
//       },
//     });
//   } catch (error) {
//     console.error('STK Push Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Payment initiation failed',
//       error: error.message,
//     });
//   }
// };

// // @desc    Create checkout payment
// // @route   POST /api/payments/checkout
// // @access  Public

// const createCheckout = async (req, res) => {
//     try {
//       const { amount, currency, customerDetails } = req.body;
  
//       if (!amount || !customerDetails) {
//         return res.status(400).json({
//           success: false,
//           message: 'Please provide amount and customer details',
//         });
//       }
  
//       const trackingId = `COLLECT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
//       // Create collection charge
//       const collection = intasend.collection();
//       const response = await collection.charge({
//         first_name: customerDetails.firstName || 'Customer',
//         last_name: customerDetails.lastName || 'User',
//         email: customerDetails.email || 'customer@example.com',
//         host: process.env.CLIENT_URL,
//         amount: parseFloat(amount),
//         currency: currency || 'KES',
//         api_ref: trackingId,
//         redirect_url: `${process.env.CLIENT_URL}/payment-status?tracking_id=${trackingId}`,
//       });

//       console.log('Collection Response:', response);
  
//       if (!response || !response.url) {
//         throw new Error('Invalid response from IntaSend API');
//       }
  
//       // Save transaction to database
//       const transaction = await Transaction.create({
//         trackingId,
//         amount: parseFloat(amount),
//         currency: currency || 'KES',
//         email: customerDetails.email,
//         status: 'PENDING',
//         paymentMethod: 'CHECKOUT',
//         customerDetails,
//         paymentDetails: response,
//       });
  
//       res.status(200).json({
//         success: true,
//         data: {
//           trackingId,
//           checkoutUrl: response.url,
//           status: transaction.status,
//         },
//       });
//     } catch (error) {
//       console.error('Collection Error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Collection charge failed',
//         error: error.message,
//       });
//     }
//   };

// // @desc    Check payment status
// // @route   GET /api/payments/status/:trackingId
// // @access  Public
// const checkPaymentStatus = async (req, res) => {
//   try {

//     // console.log('Checking payment status for:', req.params);

//     const { trackingId } = req.params;


//     // Find transaction in database
//     const transaction = await Transaction.findOne({ trackingId });

//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: 'Transaction not found',
//       });
//     }

//     let status = transaction.status;

//     // Only check status from IntaSend if transaction is not in final state
//     if (status !== 'COMPLETE' && status !== 'FAILED') {
//       try {
//         // Check status based on payment method
//         let statusResponse;
        
//         if (transaction.paymentMethod === 'MPESA_STK' && transaction.invoiceId) {
//           const collection = intasend.collection();
//           statusResponse = await collection.status(transaction.invoiceId);
          
//           // Map IntaSend status to our status
//           if (statusResponse && statusResponse.invoice && statusResponse.invoice.state) {
//             status = statusResponse.invoice.state;
//           }
//         } else {
//           // For checkout, we use the api_ref (our trackingId) to check status
//           const checkout = intasend.checkout();
          
//           // We need to get the list of transactions and find ours
//           const checkoutResponse = await checkout.list();
          
//           if (checkoutResponse && Array.isArray(checkoutResponse.results)) {
//             // Find our transaction by api_ref
//             const checkoutTxn = checkoutResponse.results.find(
//               txn => txn.api_ref === trackingId
//             );
            
//             if (checkoutTxn) {
//               status = checkoutTxn.state;
//             }
//           }
//         }

//         // Map IntaSend status to our status if needed
//         if (status === 'COMPLETE' || status === 'PROCESSING' || status === 'FAILED') {
//           // Update transaction status
//           transaction.status = status;
//           transaction.paymentDetails = {
//             ...transaction.paymentDetails,
//             statusResponse,
//           };
//           await transaction.save();
//         }
//       } catch (error) {
//         console.error('Status check error:', error);
//         // Don't fail the request, just return the current status
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         trackingId: transaction.trackingId,
//         status: transaction.status,
//         amount: transaction.amount,
//         currency: transaction.currency,
//         createdAt: transaction.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error('Status Check Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Status check failed',
//       error: error.message,
//     });
//   }
// };

// // @desc    Handle webhook notifications
// // @route   POST /api/payments/webhook
// // @access  Public
// const handleWebhook = async (req, res) => {
//   try {

//     console.log("Hi there")
//     console.log('Raw webhook body:', req.body);


//     const { event, data } = req.body;

//     // Verify webhook signature (implement in production)
//     // ...

//     if (!event || !data) {
//       return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
//     }

//     console.log('Webhook received:', { event, data });

//     // Process webhook based on event type
//     switch (event) {
//       case 'payment.completed':
//         if (data.api_ref) {
//           // Find transaction by our tracking ID (stored as api_ref in IntaSend)
//           const transaction = await Transaction.findOne({ trackingId: data.api_ref });
//           if (transaction) {
//             transaction.status = 'COMPLETE';
//             transaction.paymentDetails = {
//               ...transaction.paymentDetails,
//               webhookData: data,
//             };
//             await transaction.save();
//           }
//         }
//         break;
      
//       case 'payment.failed':
//         if (data.api_ref) {
//           // Find transaction by our tracking ID (stored as api_ref in IntaSend)
//           const transaction = await Transaction.findOne({ trackingId: data.api_ref });
//           if (transaction) {
//             transaction.status = 'FAILED';
//             transaction.paymentDetails = {
//               ...transaction.paymentDetails,
//               webhookData: data,
//             };
//             await transaction.save();
//           }
//         }
//         break;
      
//       default:
//         console.log(`Unhandled webhook event: ${event}`);
//     }

//     // Always respond with 200 OK to acknowledge receipt
//     res.status(200).json({ success: true, message: 'Webhook received' });
//   } catch (error) {
//     console.error('Webhook Error:', error);
//     // Still return 200 to avoid retries
//     res.status(200).json({ success: true, message: 'Webhook processed with errors' });
//   }
// };

// module.exports = {
//   initiateStkPush,
//   createCheckout,
//   checkPaymentStatus,
//   handleWebhook,
// };




// server/controllers/paymentController.js
const IntaSend = require('intasend-node');
const Transaction = require('../models/Transaction');
const dotenv = require('dotenv');

dotenv.config();

// Improved logging for debugging
console.log('IntaSend Configuration:');
console.log('Publishable Key:', process.env.INTASEND_PUBLISHABLE_KEY);
console.log('Secret Key:', process.env.INTASEND_SECRET_KEY);
console.log('Test Mode:', process.env.INTASEND_TEST_MODE);

// Initialize IntaSend
const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY,
  process.env.INTASEND_SECRET_KEY,
  process.env.INTASEND_TEST_MODE === 'true'
);

// @desc    Initiate M-Pesa STK Push
// @route   POST /api/payments/stk
// @access  Public
const initiateStkPush = async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount and phone number',
      });
    }

    // Format phone number if needed
    const formattedPhone = phoneNumber.startsWith('254') 
      ? phoneNumber 
      : `254${phoneNumber.replace(/^0+/, '')}`;

    // Generate a unique tracking ID on our side
    const trackingId = `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Initiate STK Push
    const collection = intasend.collection();
    const response = await collection.mpesaStkPush({
      amount: parseFloat(amount),
      phone_number: formattedPhone,
      api_ref: trackingId, // Use our generated tracking ID as the api_ref
      host: process.env.CLIENT_URL,
      first_name: 'Customer',
      last_name: 'User',
      email: 'customer@example.com',
    });

    // Check if we have a valid response with invoice details
    if (!response || !response.invoice || !response.invoice.invoice_id) {
      throw new Error('Invalid response from IntaSend API');
    }

    // Save transaction to database with our generated tracking ID
    const transaction = await Transaction.create({
      trackingId: trackingId,
      invoiceId: response.invoice.invoice_id,
      amount: parseFloat(amount),
      currency: 'KES',
      phoneNumber: formattedPhone,
      status: 'PENDING',
      paymentMethod: 'MPESA_STK',
      customerDetails: {
        phoneNumber: formattedPhone,
      },
      paymentDetails: response,
    });

    res.status(200).json({
      success: true,
      data: {
        trackingId: transaction.trackingId,
        invoiceId: transaction.invoiceId,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('STK Push Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message,
    });
  }
};

// @desc    Create checkout payment
// @route   POST /api/payments/checkout
// @access  Public
const createCheckout = async (req, res) => {
    try {
      const { amount, currency, customerDetails } = req.body;
  
      if (!amount || !customerDetails) {
        return res.status(400).json({
          success: false,
          message: 'Please provide amount and customer details',
        });
      }
  
      const trackingId = `COLLECT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
      // Create collection charge
      const collection = intasend.collection();
      const response = await collection.charge({
        first_name: customerDetails.firstName || 'Customer',
        last_name: customerDetails.lastName || 'User',
        email: customerDetails.email || 'customer@example.com',
        host: process.env.CLIENT_URL,
        amount: parseFloat(amount),
        currency: currency || 'KES',
        api_ref: trackingId,
        redirect_url: `${process.env.CLIENT_URL}/payment-status?tracking_id=${trackingId}`,
      });

      console.log('Collection Response:', response);
  
      if (!response || !response.url) {
        throw new Error('Invalid response from IntaSend API');
      }
  
      // Save transaction to database - Adding invoice_id field for tracking
      const transaction = await Transaction.create({
        trackingId,
        amount: parseFloat(amount),
        currency: currency || 'KES',
        email: customerDetails.email,
        status: 'PENDING',
        paymentMethod: 'CHECKOUT',
        customerDetails,
        paymentDetails: response,
      });
  
      res.status(200).json({
        success: true,
        data: {
          trackingId,
          checkoutUrl: response.url,
          status: transaction.status,
        },
      });
    } catch (error) {
      console.error('Collection Error:', error);
      res.status(500).json({
        success: false,
        message: 'Collection charge failed',
        error: error.message,
      });
    }
  };

// @desc    Check payment status
// @route   GET /api/payments/status/:trackingId
// @access  Public
const checkPaymentStatus = async (req, res) => {
  try {
    console.log('Checking payment status for params:', req.params);
    
    const { trackingId } = req.params;
    
    // First try to find transaction by our trackingId
    let transaction = await Transaction.findOne({ trackingId });
    
    // If not found, check if this might be an invoice ID
    if (!transaction) {
      console.log('Transaction not found by trackingId, checking if this is an invoiceId...');
      
      // Try to find by invoiceId (could be from webhook data)
      transaction = await Transaction.findOne({ 
        $or: [
          { invoiceId: trackingId },
          { "paymentDetails.webhookData.invoice_id": trackingId }
        ]
      });
      
      if (!transaction) {
        console.log('No transaction found with trackingId or invoiceId:', trackingId);
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }
    }

    let status = transaction.status;

    // Only check status from IntaSend if transaction is not in final state
    if (status !== 'COMPLETE' && status !== 'FAILED') {
      try {
        // Check status based on payment method
        let statusResponse;
        
        if (transaction.paymentMethod === 'MPESA_STK' && transaction.invoiceId) {
          const collection = intasend.collection();
          statusResponse = await collection.status(transaction.invoiceId);
          
          // Map IntaSend status to our status
          if (statusResponse && statusResponse.invoice && statusResponse.invoice.state) {
            status = statusResponse.invoice.state;
          }
        } else if (transaction.paymentMethod === 'CHECKOUT') {
          // For checkout, try to use the invoice_id if we have it from webhook data
          let invoiceId = transaction.invoiceId;
          
          if (!invoiceId && transaction.paymentDetails?.webhookData?.invoice_id) {
            invoiceId = transaction.paymentDetails.webhookData.invoice_id;
          }
          
          if (invoiceId) {
            const collection = intasend.collection();
            try {
              statusResponse = await collection.status(invoiceId);
              
              if (statusResponse && statusResponse.invoice && statusResponse.invoice.state) {
                status = statusResponse.invoice.state;
              }
            } catch (error) {
              console.error('Error checking invoice status:', error);
            }
          }
        }

        // Map IntaSend status to our status if needed
        if (status === 'COMPLETE' || status === 'PROCESSING' || status === 'FAILED') {
          // Update transaction status
          transaction.status = status;
          if (statusResponse) {
            transaction.paymentDetails = {
              ...transaction.paymentDetails,
              statusResponse,
            };
          }
          await transaction.save();
        }
      } catch (error) {
        console.error('Status check error:', error);
        // Don't fail the request, just return the current status
      }
    }

    res.status(200).json({
      success: true,
      data: {
        trackingId: transaction.trackingId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Status check failed',
      error: error.message,
    });
  }
};

// @desc    Handle webhook notifications
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    console.log('Raw webhook body:', req.body);

    const { event, invoice_id, state, api_ref } = req.body;

    // Verify webhook signature (implement in production)
    // ...

    if (!invoice_id) {
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    console.log('Webhook received:', { invoice_id, state, api_ref });

    // Find transaction either by api_ref (our tracking ID) or by invoice_id
    let transaction;
    
    if (api_ref) {
      transaction = await Transaction.findOne({ trackingId: api_ref });
    }
    
    if (!transaction && invoice_id) {
      transaction = await Transaction.findOne({ invoiceId: invoice_id });
    }
    
    if (!transaction) {
      console.log(`Creating new transaction record for invoice_id: ${invoice_id}`);
      
      // Create a new transaction record if we don't have one yet
      transaction = await Transaction.create({
        invoiceId: invoice_id,
        trackingId: api_ref || `WEBHOOK-${Date.now()}`,
        status: state || 'PENDING',
        amount: req.body.value ? parseFloat(req.body.value) : 0,
        currency: req.body.currency || 'KES',
        paymentMethod: req.body.provider || 'UNKNOWN',
        paymentDetails: {
          webhookData: req.body
        }
      });
    } else {
      // Update the existing transaction
      transaction.status = state || transaction.status;
      
      // Store invoice_id if we don't have it yet
      if (invoice_id && !transaction.invoiceId) {
        transaction.invoiceId = invoice_id;
      }
      
      // Update payment details with webhook data
      transaction.paymentDetails = {
        ...transaction.paymentDetails,
        webhookData: req.body
      };
      
      await transaction.save();
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Still return 200 to avoid retries
    res.status(200).json({ success: true, message: 'Webhook processed with errors' });
  }
};

module.exports = {
  initiateStkPush,
  createCheckout,
  checkPaymentStatus,
  handleWebhook,
};