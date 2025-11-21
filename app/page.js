'use client'

import { useState } from 'react'
import { salonConfig } from '../config'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, you would send this data to a backend
    // For now, we'll just show a success message
    console.log('Booking submitted:', formData)
    setSubmitted(true)

    // Reset form after 5 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        preferredDate: '',
        preferredTime: '',
        notes: ''
      })
    }, 5000)
  }

  // Set CSS variables for colors from config
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary-color', salonConfig.colors.primary)
    document.documentElement.style.setProperty('--secondary-color', salonConfig.colors.secondary)
    document.documentElement.style.setProperty('--accent-color', salonConfig.colors.accent)
  }

  return (
    <>
      <div className="hero">
        <div className="container">
          <h1>{salonConfig.businessName}</h1>
          <p>{salonConfig.tagline}</p>
        </div>
      </div>

      <div className="main-content">
        <div className="container">
          {/* Services Section */}
          <section className="section">
            <h2>Our Services</h2>
            <div className="services-grid">
              {salonConfig.services.map((service, index) => (
                <div key={index} className="service-card">
                  <h3>{service.name}</h3>
                  <div className="price">{service.price}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Booking Form */}
          <section className="section">
            <h2>Book Your Appointment</h2>
            <div className="booking-form">
              {submitted && (
                <div className="success-message">
                  Thank you! Your booking request has been received. We'll contact you shortly to confirm your appointment.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service">Service *</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {salonConfig.services.map((service, index) => (
                      <option key={index} value={service.name}>
                        {service.name} - {service.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="preferredDate">Preferred Date *</label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preferredTime">Preferred Time *</label>
                  <input
                    type="time"
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special requests or information we should know?"
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Request Appointment
                </button>
              </form>
            </div>
          </section>

          {/* Contact Information */}
          <section className="section">
            <h2>Contact Us</h2>
            <div className="contact-info">
              <div className="contact-grid">
                <div className="contact-item">
                  <h3>Phone</h3>
                  <p>{salonConfig.phone}</p>
                </div>
                <div className="contact-item">
                  <h3>Email</h3>
                  <p>{salonConfig.email}</p>
                </div>
                <div className="contact-item">
                  <h3>Address</h3>
                  <p>{salonConfig.address}</p>
                </div>
              </div>

              <h3 style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px', color: salonConfig.colors.primary }}>
                Business Hours
              </h3>
              <div className="hours-grid">
                {Object.entries(salonConfig.hours).map(([day, time]) => (
                  <div key={day} className="hours-item">
                    <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <span className="time">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer>
        <div className="container">
          <p>&copy; 2024 {salonConfig.businessName}. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
