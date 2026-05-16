import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const AdminPanel = () => {
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [date, setDate] = useState("")
  const [service, setService] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [activeMenu, setActiveMenu] = useState("dashboard")

  const token = localStorage.getItem("adminToken")

  useEffect(() => {
    if (!token) navigate("/admin")
  }, [token, navigate])

  useEffect(() => {
    loadAppointments()
  }, [token, sortBy])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await fetch(
        `http://localhost:8080/api/admin/appointments?sort=${sortBy}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized. Please login again.")
      }

      if (!res.ok) throw new Error("Failed to load appointments")

      setAppointments(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      if (date) params.append("date", date)
      if (service) params.append("service", service)
      if (searchQuery) params.append("search", searchQuery)
      params.append("sort", sortBy)

      const res = await fetch(
        `http://localhost:8080/api/admin/appointments/filter?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Filter failed")

      setAppointments(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    applyFilter()
  }

  const updateStatus = async (id, status) => {
    try {
      await fetch(
        `http://localhost:8080/api/admin/appointments/${id}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status } : a))
      )
      
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(prev => ({ ...prev, status }))
      }
    } catch {
      alert("Failed to update status")
    }
  }

  const logout = () => {
    localStorage.removeItem("adminToken")
    navigate("/admin")
  }

  const clearFilters = () => {
    setDate("")
    setService("")
    setSearchQuery("")
    loadAppointments()
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700'
      case 'DONE': return 'bg-green-100 text-green-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    done: appointments.filter(a => a.status === 'DONE').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  }

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'appointments', icon: '📅', label: 'Appointments' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'services', icon: '✂️', label: 'Services' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-lg shadow-xl border-r border-purple-100">
        
        {/* Logo */}
        <div className="p-6 border-b border-purple-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3D217F] to-purple-600 bg-clip-text text-transparent">
            Hair&Beauty
          </h1>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeMenu === item.id
                  ? 'bg-gradient-to-r from-[#3D217F] to-purple-600 text-white shadow-lg shadow-purple-300'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-purple-100 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">Welcome back, Admin 👋</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 rounded-xl border border-purple-200 focus:border-purple-400 focus:outline-none bg-white/50"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center hover:bg-purple-50 transition-all">
                🔔
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Appointments */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Appointments</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  📊
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-1 rounded-lg">+12%</span>
                <span className="text-blue-100">vs last month</span>
              </div>
            </div>

            {/* Confirmed */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Confirmed</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.confirmed}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  ✓
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-1 rounded-lg">{Math.round((stats.confirmed/stats.total)*100 || 0)}%</span>
                <span className="text-purple-100">of total</span>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.done}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  ✨
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-1 rounded-lg">↑ {stats.done}</span>
                <span className="text-green-100">this week</span>
              </div>
            </div>

            {/* Cancelled */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-red-100 text-sm font-medium">Cancelled</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.cancelled}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  ✕
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-1 rounded-lg">{Math.round((stats.cancelled/stats.total)*100 || 0)}%</span>
                <span className="text-red-100">cancellation rate</span>
              </div>
            </div>
          </div>

          {/* Filters & Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Filters Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-purple-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Filters</h3>
                
                <div className="space-y-4">
                  {/* Date Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">📅 Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 focus:border-purple-400 focus:outline-none text-sm"
                    />
                  </div>

                  {/* Service Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">✂️ Service</label>
                    <select
                      value={service}
                      onChange={e => setService(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 focus:border-purple-400 focus:outline-none text-sm"
                    >
                      <option value="">All Services</option>
                      <option value="Haircut">Haircut</option>
                      <option value="Hair Colouring">Hair Colouring</option>
                      <option value="Hair Spa">Hair Spa</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">🔽 Sort By</label>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 focus:border-purple-400 focus:outline-none text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="date_asc">Date Ascending</option>
                      <option value="date_desc">Date Descending</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={applyFilter}
                      className="w-full bg-gradient-to-r from-[#3D217F] to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
                
                <div className="p-6 border-b border-purple-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
                    <p className="text-sm text-gray-500">Manage your bookings</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-all">
                    View all
                  </button>
                </div>

                {loading && (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading...</p>
                  </div>
                )}

                {error && (
                  <div className="p-6 bg-red-50 border-l-4 border-red-500 m-6 rounded-xl">
                    <p className="text-red-600 font-semibold">⚠️ {error}</p>
                  </div>
                )}

                {!loading && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100">
                        {appointments.slice(0, 10).map((a) => (
                          <tr 
                            key={a.id} 
                            onClick={() => setSelectedAppointment(a)}
                            className="hover:bg-purple-50/50 cursor-pointer transition-all"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                                  {a.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">{a.name}</div>
                                  <div className="text-xs text-gray-500">{a.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                {a.service}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{a.date}</div>
                              <div className="text-xs text-gray-500">{a.time}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(a.status)}`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => updateStatus(a.id, "DONE")}
                                  className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-all"
                                  title="Mark as Done"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => updateStatus(a.id, "CANCELLED")}
                                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {appointments.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center p-12">
                              <div className="text-gray-300 text-6xl mb-4">📭</div>
                              <p className="text-gray-600 font-semibold">No appointments found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAppointment(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#3D217F] to-purple-600 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Appointment Details</h2>
                  <p className="text-purple-200 text-sm">Complete information</p>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-8">
              
              <div className="flex justify-center mb-6">
                <span className={`px-6 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wide">Personal Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="font-semibold text-gray-900">{selectedAppointment.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedAppointment.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 break-all text-sm">{selectedAppointment.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wide">Appointment</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Service</p>
                      <p className="font-semibold text-gray-900">{selectedAppointment.service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="font-semibold text-gray-900">{selectedAppointment.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time</p>
                      <p className="font-semibold text-gray-900">{selectedAppointment.time}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-green-600 mb-3 uppercase tracking-wide">Payment</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                        {selectedAppointment.orderId || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                        {selectedAppointment.paymentId || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-orange-600 mb-3 uppercase tracking-wide">System</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ID</p>
                      <p className="font-mono font-semibold text-gray-900">#{selectedAppointment.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {selectedAppointment.createdAt || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(selectedAppointment.id, "DONE")}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  ✓ Mark as Done
                </button>
                <button
                  onClick={() => updateStatus(selectedAppointment.id, "CANCELLED")}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel