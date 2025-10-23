// Shared types for Shampooches application

export interface Pet {
  id: string
  customerId: string
  name: string
  breed: string
  age: number
  vaccinationStatus: string
  groomingNotes: string
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  email: string
  phone: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  description: string
  basePrice: number
  duration: number // in minutes
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  customerId: string
  petId: string
  serviceId: string
  groomerId: string
  scheduledAt: Date
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  depositPaymentId: string
  depositAmount: number
  depositStatus: 'pending' | 'applied' | 'forfeited' | 'refunded'
  rescheduleCount: number
  originalAppointmentDate: Date | null
  finalPaymentId: string | null
  totalServiceCost: number
  remainingBalance: number
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  bookingId: string
  squarePaymentId: string
  paymentType: 'deposit' | 'final_payment' | 'refund'
  amount: number
  paymentMethod: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  processedAt: Date
  processedBy: string
  createdAt: Date
}

export interface Groomer {
  id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PetStatus {
  id: string
  appointmentId: string
  status: 'waiting' | 'grooming' | 'drying' | 'completed'
  updatedAt: Date
}
