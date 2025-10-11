import { defineStore } from 'pinia'
import type { Course, Classroom } from '~/types/course.type'

export interface CartItem {
  id: string
  course: Course
  selectedClassroom: Classroom
  price: number
  addedAt: string
}

export interface CartState {
  items: CartItem[]
  isLoading: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    isLoading: false,
  }),

  getters: {
    totalItems: (state: CartState): number => {
      return state.items.length
    },
    
    totalPrice: (state: CartState): number => {
      return state.items.reduce((total: number, item: CartItem) => total + item.price, 0)
    },
    
    totalDiscount: (state: CartState): number => {
      return state.items.reduce((total: number, item: CartItem) => {
        const originalPrice = parseFloat(item.course.price)
        const discountPrice = parseFloat(item.course.discount_price || '0')
        return total + (originalPrice - discountPrice)
      }, 0)
    },
    
    tax: (state: CartState): number => {
      return Math.round(state.items.reduce((total: number, item: CartItem) => total + item.price, 0) * 0.1) // 10% tax
    },
    
    finalTotal: (state: CartState): number => {
      return state.totalPrice + state.tax
    },
  },

  actions: {
    // Load cart from localStorage
    loadCart() {
      if (typeof window !== 'undefined') {
        try {
          const savedCart = localStorage.getItem('elearning-cart')
          if (savedCart) {
            this.items = JSON.parse(savedCart)
          }
        } catch (error) {
          console.error('Error loading cart from localStorage:', error)
          this.items = []
        }
      }
    },

    // Save cart to localStorage
    saveCart() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('elearning-cart', JSON.stringify(this.items))
        } catch (error) {
          console.error('Error saving cart to localStorage:', error)
        }
      }
    },

    // Add item to cart
    addToCart(course: Course, selectedClassroom: Classroom) {
      const existingItemIndex = this.items.findIndex(
        item => item.course.id === course.id && item.selectedClassroom.id === selectedClassroom.id
      )

      if (existingItemIndex !== -1) {
        // Item already exists, update it
        this.items[existingItemIndex] = {
          ...this.items[existingItemIndex],
          addedAt: new Date().toISOString(),
        }
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${course.id}-${selectedClassroom.id}`,
          course,
          selectedClassroom,
          price: course.effective_price,
          addedAt: new Date().toISOString(),
        }
        this.items.push(newItem)
      }

      this.saveCart()
    },

    // Remove item from cart
    removeFromCart(itemId: string) {
      this.items = this.items.filter(item => item.id !== itemId)
      this.saveCart()
    },

    // Clear cart
    clearCart() {
      this.items = []
      this.saveCart()
    },

    // Check if course is in cart
    isInCart(courseId: string, classroomId?: string): boolean {
      if (classroomId) {
        return this.items.some(item => item.course.id === courseId && item.selectedClassroom.id === classroomId)
      }
      return this.items.some(item => item.course.id === courseId)
    },

    // Get cart item by course and classroom
    getCartItem(courseId: string, classroomId: string): CartItem | undefined {
      return this.items.find(item => item.course.id === courseId && item.selectedClassroom.id === classroomId)
    },
  },
})
