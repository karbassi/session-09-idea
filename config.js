// EDIT THIS FILE TO CUSTOMIZE YOUR SALON BOOKING SITE
// This is the only file you need to change to personalize your site!

export const salonConfig = {
  // Your Business Information
  businessName: "Glamour Hair Salon",
  tagline: "Where Beauty Meets Excellence",

  // Contact Information
  phone: "(555) 123-4567",
  email: "bookings@glamourhair.com",
  address: "123 Beauty Street, Your City, ST 12345",

  // Business Hours
  hours: {
    monday: "9:00 AM - 7:00 PM",
    tuesday: "9:00 AM - 7:00 PM",
    wednesday: "9:00 AM - 7:00 PM",
    thursday: "9:00 AM - 7:00 PM",
    friday: "9:00 AM - 8:00 PM",
    saturday: "9:00 AM - 6:00 PM",
    sunday: "Closed"
  },

  // Your Services (you can add, remove, or modify these)
  services: [
    { name: "Haircut - Women", price: "$65" },
    { name: "Haircut - Men", price: "$35" },
    { name: "Hair Color - Full", price: "$120" },
    { name: "Hair Color - Highlights", price: "$150" },
    { name: "Balayage", price: "$200" },
    { name: "Blowout & Style", price: "$45" },
    { name: "Deep Conditioning Treatment", price: "$40" },
    { name: "Bridal Styling", price: "$150" },
    { name: "Extensions", price: "$300+" },
    { name: "Perm", price: "$85" },
    { name: "Keratin Treatment", price: "$250" }
  ],

  // Social Media (optional - leave empty "" if you don't have)
  social: {
    instagram: "",
    facebook: "",
    twitter: ""
  },

  // Color Theme (you can change these hex color codes)
  colors: {
    primary: "#d4a574", // Gold
    secondary: "#2c3e50", // Dark blue-gray
    accent: "#e8d5c4" // Light beige
  }
}
