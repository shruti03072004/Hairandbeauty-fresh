import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Services from './pages/Services'
import Contact from './pages/Contact'
import About from './pages/About'
import Appointment from './pages/Appointment'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Payment from './pages/Payment'

const App = () => {
  const isAdmin = !!localStorage.getItem("adminToken")


  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book" element={<Appointment />} />
        <Route path="/payment" element={<Payment />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<AdminLogin/>}
        />
        <Route
          path="/admin/panel"
          element={isAdmin ? <AdminPanel /> : <AdminLogin />}
        />
      </Routes>
      <Footer />
    </>
  )
}

export default App
