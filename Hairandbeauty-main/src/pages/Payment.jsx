import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Service pricing mapping
  const servicePricing = {
    'Haircut': 500,
    'Hair Colouring': 1000,
    'Hair Spa': 800
  }

  useEffect(() => {
    // Check if appointment data exists
    if (!location.state?.appointment) {
      navigate('/book')
      return
    }
    setAppointment(location.state.appointment)
    
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [location.state, navigate])

  const handlePayment = async () => {
    if (!appointment) return

    setLoading(true)
    setError(null)

    try {
      const amount = servicePricing[appointment.service]
      
      // Step 1: Create order
      const orderResponse = await fetch('https://hairandbeauty-fresh-production.up.railway.app/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderResponse.json()

      // Step 2: Open Razorpay Checkout
      const options = {
        key: orderData.key, // Your Razorpay key from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Hair Salon',
        description: `${appointment.service} Appointment`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Step 3: Verify payment
          await verifyPayment(response)
        },
        prefill: {
          name: appointment.name,
          email: appointment.email,
          contact: appointment.phone
        },
        theme: {
          color: '#8f6a3b'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            setError('Payment cancelled')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  const verifyPayment = async (razorpayResponse) => {
    try {
      const verifyResponse = await fetch('https://hairandbeauty-fresh-production.up.railway.app/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          appointment: appointment
        })
      })

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed')
      }

      const verifyData = await verifyResponse.json()

      if (verifyData.status==='success') {
        setPaymentSuccess(true)
        setLoading(false)
      } else {
        throw new Error('Payment verification failed')
      }

    } catch (err) {
      setError(err.message || 'Payment verification failed')
      setLoading(false)
    }
  }

  if (!appointment) {
    return null
  }

  if (paymentSuccess) {
    return (
      <section className="bg-[#F5F3EF] min-h-screen flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
          * {
            font-family: 'Poppins', sans-serif;
          }

          @keyframes check-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .check-animation {
            animation: check-bounce 0.6s ease-in-out;
          }
        `}</style>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center check-animation">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Payment Successful! 🎉
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your appointment has been confirmed
          </p>

          {/* Booking Details */}
          <div className="bg-[#F5F3EF] rounded-xl p-6 mb-8 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Booking Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <span className="text-gray-600 font-medium">Service:</span>
                <span className="text-gray-900 font-semibold">{appointment.service}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="text-gray-900 font-semibold">
                  {new Date(appointment.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <span className="text-gray-600 font-medium">Time:</span>
                <span className="text-gray-900 font-semibold">{appointment.time}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-900 font-semibold">{appointment.name}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <span className="text-gray-600 font-medium">Phone:</span>
                <span className="text-gray-900 font-semibold">{appointment.phone}</span>
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-600 font-medium">Amount Paid:</span>
                <span className="text-2xl font-bold text-[#8f6a3b]">
                  ₹{servicePricing[appointment.service]}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Note */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-blue-800">
              📧 A confirmation email has been sent to <strong>{appointment.email}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#8f6a3b] text-white font-semibold rounded-lg hover:bg-[#a8845f] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
            
            <button
              onClick={() => navigate('/book')}
              className="px-6 py-3 bg-white text-[#8f6a3b] font-semibold rounded-lg border-2 border-[#8f6a3b] hover:bg-[#8f6a3b] hover:text-white transition-all duration-300"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#F5F3EF] min-h-screen flex items-center justify-center px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(143, 106, 59, 0.3); }
          50% { box-shadow: 0 0 40px rgba(143, 106, 59, 0.5); }
        }

        .payment-card {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full payment-card">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8f6a3b]/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-[#8f6a3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Complete Payment
          </h2>
          <p className="text-gray-600">
            Secure payment powered by Razorpay
          </p>
        </div>

        {/* Appointment Summary */}
        <div className="bg-[#F5F3EF] rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Appointment Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-300">
              <span className="text-gray-600 font-medium">Service:</span>
              <span className="text-gray-900 font-semibold">{appointment.service}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-300">
              <span className="text-gray-600 font-medium">Date:</span>
              <span className="text-gray-900 font-semibold">
                {new Date(appointment.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-300">
              <span className="text-gray-600 font-medium">Time:</span>
              <span className="text-gray-900 font-semibold">{appointment.time}</span>
            </div>
            
            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-900 font-bold text-lg">Total Amount:</span>
              <span className="text-3xl font-bold text-[#8f6a3b]">
                ₹{servicePricing[appointment.service]}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
            <div className="text-red-600 text-xl">⚠️</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-4 px-6 bg-[#8f6a3b] text-white font-bold text-lg rounded-lg transition-all duration-300 ${
            loading 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:bg-[#a8845f] hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Pay ₹{servicePricing[appointment.service]}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </button>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secured by Razorpay</span>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/book')}
            className="text-[#8f6a3b] font-semibold hover:underline"
          >
            ← Back to Booking
          </button>
        </div>
      </div>
    </section>
  )
}

export default Payment