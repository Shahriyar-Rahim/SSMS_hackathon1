export const SERVICE_CATEGORIES = [
  {
    id: "appliance",
    name: "Appliance & Gadget Repair",
    description: "AC repair, refrigerator servicing, microwave, TV, and washer fixes",
    iconName: "Wrench",
    popularServices: ["AC Repair & Servicing", "Refrigerator Maintenance", "Washing Machine Repair", "Microwave Repair"],
    basePriceRange: "৳800 - ৳2,500"
  },
  {
    id: "plumbing",
    name: "Plumbing Services",
    description: "Pipe leakages, tap replacements, sanitary fitting, and drain unclogging",
    iconName: "Droplet",
    popularServices: ["Pipe Leakage Repair", "Tap & Mixer Installation", "Toilet Repair", "Drain Unclogging"],
    basePriceRange: "৳500 - ৳1,800"
  },
  {
    id: "electrical",
    name: "Electrical Work",
    description: "Wiring maintenance, short circuit fix, fan/light mounting, circuit breakers",
    iconName: "Zap",
    popularServices: ["Short Circuit Troubleshooting", "Ceiling Fan & Light Installation", "Switch Board Repair", "DB Box Wiring"],
    basePriceRange: "৳600 - ৳2,000"
  },
  {
    id: "cleaning",
    name: "Cleaning & Pest Control",
    description: "Deep house cleaning, sofa/carpet shampooing, cockroach & termite treatment",
    iconName: "Sparkles",
    popularServices: ["Full Home Deep Cleaning", "Sofa & Carpet Cleaning", "Pest & Cockroach Control", "Water Tank Cleaning"],
    basePriceRange: "৳1,200 - ৳4,500"
  },
  {
    id: "maintenance",
    name: "Home Maintenance",
    description: "Carpentry, lock repair, wall painting touching, door/window fitting",
    iconName: "Hammer",
    popularServices: ["Furniture Repair", "Door Lock Replacement", "Wall Touch-up Painting", "Drilling & Hanging"],
    basePriceRange: "৳700 - ৳3,000"
  },
  {
    id: "moving",
    name: "Moving & Shifting",
    description: "House & office relocation, heavy item packaging, and transport",
    iconName: "Truck",
    popularServices: ["Full Apartment Relocation", "Furniture Disassembly & Loading", "Office Pickup & Drop"],
    basePriceRange: "৳3,000 - ৳12,000"
  },
  {
    id: "carcare",
    name: "Car Care & Repair",
    description: "On-demand car wash, battery jumpstart, oil filter change, diagnostic",
    iconName: "Car",
    popularServices: ["Doorstep Car Wash & Polish", "Battery Jumpstart & Fix", "Engine Diagnostic", "Brake Pad Check"],
    basePriceRange: "৳900 - ৳3,500"
  },
  {
    id: "personal",
    name: "Personal Care at Home",
    description: "Physiotherapy, salon & grooming, elderly assistance at home",
    iconName: "UserCheck",
    popularServices: ["Home Physiotherapy Session", "Salon & Hair Cut for Men/Women", "Elderly Care Assistant"],
    basePriceRange: "৳1,000 - ৳2,200"
  }
];

export const LOCATIONS = [
  "Dhanmondi",
  "Gulshan",
  "Banani",
  "Uttara",
  "Mirpur",
  "Mohammadpur",
  "Badda",
  "Bashundhara R/A"
];

export const INITIAL_PROVIDERS = [
  {
    id: "prov-101",
    name: "Rahim Electronics & AC Solutions",
    contactPerson: "Rahim Ahmed",
    phone: "+880 1711-234567",
    categoryIds: ["appliance", "electrical"],
    rating: 4.8,
    reviewsCount: 142,
    baseLocation: "Dhanmondi",
    distanceMap: {
      "Dhanmondi": 1.2,
      "Mohammadpur": 2.5,
      "Mirpur": 6.0,
      "Gulshan": 8.5,
      "Banani": 9.0,
      "Badda": 10.2,
      "Uttara": 14.0,
      "Bashundhara R/A": 12.5
    },
    baseCharge: 1000,
    availableSlots: ["09:00 AM - 11:00 AM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"],
    isVerified: true,
    completedJobs: 284,
    status: "Available"
  },
  {
    id: "prov-102",
    name: "Karim Plumbing & Sanitary Experts",
    contactPerson: "Karim Hossain",
    phone: "+880 1819-876543",
    categoryIds: ["plumbing", "maintenance"],
    rating: 4.9,
    reviewsCount: 98,
    baseLocation: "Mirpur",
    distanceMap: {
      "Dhanmondi": 4.5,
      "Mohammadpur": 3.0,
      "Mirpur": 0.8,
      "Gulshan": 7.0,
      "Banani": 6.2,
      "Badda": 8.0,
      "Uttara": 9.5,
      "Bashundhara R/A": 11.0
    },
    baseCharge: 800,
    availableSlots: ["10:00 AM - 12:00 PM", "01:00 PM - 03:00 PM", "04:00 PM - 06:00 PM"],
    isVerified: true,
    completedJobs: 195,
    status: "Available"
  },
  {
    id: "prov-103",
    name: "Dhaka CleanPro & Pest Solutions",
    contactPerson: "Tanvir Rahman",
    phone: "+880 1912-341122",
    categoryIds: ["cleaning"],
    rating: 4.7,
    reviewsCount: 215,
    baseLocation: "Gulshan",
    distanceMap: {
      "Dhanmondi": 8.0,
      "Mohammadpur": 9.0,
      "Mirpur": 7.5,
      "Gulshan": 1.0,
      "Banani": 1.5,
      "Badda": 3.2,
      "Uttara": 6.8,
      "Bashundhara R/A": 4.0
    },
    baseCharge: 1500,
    availableSlots: ["09:00 AM - 11:00 AM", "11:30 AM - 01:30 PM", "03:30 PM - 05:30 PM"],
    isVerified: true,
    completedJobs: 410,
    status: "Available"
  },
  {
    id: "prov-104",
    name: "PowerVolt Electrical Engineering",
    contactPerson: "Sajid Khan",
    phone: "+880 1673-998877",
    categoryIds: ["electrical", "appliance"],
    rating: 4.6,
    reviewsCount: 76,
    baseLocation: "Uttara",
    distanceMap: {
      "Dhanmondi": 14.2,
      "Mohammadpur": 13.0,
      "Mirpur": 9.0,
      "Gulshan": 6.5,
      "Banani": 5.8,
      "Badda": 8.5,
      "Uttara": 1.1,
      "Bashundhara R/A": 5.0
    },
    baseCharge: 900,
    availableSlots: ["10:00 AM - 12:00 PM", "02:00 PM - 04:00 PM", "05:00 PM - 07:00 PM"],
    isVerified: true,
    completedJobs: 132,
    status: "Available"
  },
  {
    id: "prov-105",
    name: "SwiftShift Movers & Packers",
    contactPerson: "Rafiq Islam",
    phone: "+880 1552-443322",
    categoryIds: ["moving", "maintenance"],
    rating: 4.8,
    reviewsCount: 164,
    baseLocation: "Mohammadpur",
    distanceMap: {
      "Dhanmondi": 2.0,
      "Mohammadpur": 0.9,
      "Mirpur": 4.2,
      "Gulshan": 9.5,
      "Banani": 8.8,
      "Badda": 11.0,
      "Uttara": 12.8,
      "Bashundhara R/A": 13.5
    },
    baseCharge: 3500,
    availableSlots: ["08:00 AM - 12:00 PM", "01:00 PM - 05:00 PM"],
    isVerified: true,
    completedJobs: 220,
    status: "Available"
  }
];

export const INITIAL_REQUESTS = [
  {
    id: "REQ-8042",
    serviceCategory: "appliance",
    serviceName: "AC Repair & Servicing",
    customerName: "Anisur Rahman",
    customerPhone: "+880 1715-009988",
    address: "House 24, Road 7A, Dhanmondi",
    location: "Dhanmondi",
    preferredDate: "2026-09-09",
    preferredTime: "04:00 PM - 06:00 PM",
    urgency: "Normal",
    problemDetails: "AC is blowing warm air and making a vibrating squeal noise from outdoor unit.",
    photoUrl: null,
    providerId: "prov-101",
    providerName: "Rahim Electronics & AC Solutions",
    estimatedCharge: 1000,
    distanceKm: 1.2,
    matchScore: 94,
    status: "In Progress",
    createdAt: "2026-09-08T14:30:00Z",
    statusHistory: [
      { status: "Requested", timestamp: "2026-09-08T14:30:00Z", note: "Customer submitted service request" },
      { status: "Accepted", timestamp: "2026-09-08T14:35:00Z", note: "Provider Rahim Electronics accepted job" },
      { status: "On the Way", timestamp: "2026-09-08T15:10:00Z", note: "Technician en route to Dhanmondi" },
      { status: "In Progress", timestamp: "2026-09-08T15:40:00Z", note: "Diagnostics started on site" }
    ]
  },
  {
    id: "REQ-8041",
    serviceCategory: "plumbing",
    serviceName: "Pipe Leakage Repair",
    customerName: "Nusrat Jahan",
    customerPhone: "+880 1812-776655",
    address: "Flat 4B, Building 12, Main Road, Mirpur-10",
    location: "Mirpur",
    preferredDate: "2026-09-08",
    preferredTime: "10:00 AM - 12:00 PM",
    urgency: "Urgent",
    problemDetails: "Major water leak under kitchen sink causing water pooling on floor.",
    photoUrl: null,
    providerId: "prov-102",
    providerName: "Karim Plumbing & Sanitary Experts",
    estimatedCharge: 950,
    distanceKm: 0.8,
    matchScore: 98,
    status: "Completed",
    createdAt: "2026-09-08T09:15:00Z",
    completedAt: "2026-09-08T11:45:00Z",
    rating: 5,
    feedback: "Super fast response! Fixed the leak in less than 30 minutes.",
    statusHistory: [
      { status: "Requested", timestamp: "2026-09-08T09:15:00Z", note: "Customer submitted emergency request" },
      { status: "Accepted", timestamp: "2026-09-08T09:18:00Z", note: "Karim Plumbing accepted" },
      { status: "On the Way", timestamp: "2026-09-08T09:30:00Z", note: "Technician dispatched" },
      { status: "In Progress", timestamp: "2026-09-08T10:05:00Z", note: "Replaced faulty joint pipe" },
      { status: "Completed", timestamp: "2026-09-08T11:45:00Z", note: "Job completed and payment received" }
    ]
  }
];
