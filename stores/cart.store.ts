import { defineStore } from 'pinia'
import type { Course, Classroom, ResourcePricePlan } from '~/types/course.type'

export interface CartItem {
  id: string
  course: Course
  selectedClassroom?: Classroom // Optional - for course type
  selectedPricePlan?: ResourcePricePlan // Optional - for resource type
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
        // For course type - use classroom pricing
        if (item.selectedClassroom) {
          const originalPrice = parseFloat(item.selectedClassroom.price || '0')
          const discountPrice = parseFloat(item.selectedClassroom.discount_price || '0')
          if (discountPrice > 0 && discountPrice < originalPrice) {
            return total + (originalPrice - discountPrice)
          }
        }
        // For resource type - no discount (price plans don't have discount)
        return total
      }, 0)
    },
    
    tax: (state: CartState): number => {
      // Temporarily set tax to 0
      return 0
      // return Math.round(state.items.reduce((total: number, item: CartItem) => total + item.price, 0) * 0.1) // 10% tax
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

    // Add item to cart (for course type with classroom)
    addToCart(course: Course, selectedClassroom: Classroom) {
      const existingItemIndex = this.items.findIndex(
        item => item.course.id === course.id && item.selectedClassroom?.id === selectedClassroom.id
      )

      if (existingItemIndex !== -1) {
        // Item already exists, update it
        this.items[existingItemIndex] = {
          ...this.items[existingItemIndex],
          addedAt: new Date().toISOString(),
        }
      } else {
        // Add new item - use classroom effective_price instead of course
        const newItem: CartItem = {
          id: `${course.id}-${selectedClassroom.id}`,
          course,
          selectedClassroom,
          price: selectedClassroom.effective_price || 0,
          addedAt: new Date().toISOString(),
        }
        this.items.push(newItem)
      }

      this.saveCart()
    },

    // Add resource to cart (for resource type with price plan)
    addResourceToCart(course: Course, selectedPricePlan: ResourcePricePlan) {
      const existingItemIndex = this.items.findIndex(
        item => item.course.id === course.id && item.selectedPricePlan?.id === selectedPricePlan.id
      )

      if (existingItemIndex !== -1) {
        // Item already exists, update it
        this.items[existingItemIndex] = {
          ...this.items[existingItemIndex],
          addedAt: new Date().toISOString(),
        }
      } else {
        // Add new item - use price plan price
        const newItem: CartItem = {
          id: `${course.id}-plan-${selectedPricePlan.id}`,
          course,
          selectedPricePlan,
          price: Number.parseFloat(selectedPricePlan.price_amount),
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
    isInCart(courseId: string, classroomId?: string, pricePlanId?: string): boolean {
      if (classroomId) {
        return this.items.some(item => item.course.id === courseId && item.selectedClassroom?.id === classroomId)
      }
      if (pricePlanId) {
        return this.items.some(item => item.course.id === courseId && item.selectedPricePlan?.id === pricePlanId)
      }
      return this.items.some(item => item.course.id === courseId)
    },

    // Get cart item by course and classroom
    getCartItem(courseId: string, classroomId: string): CartItem | undefined {
      return this.items.find(item => item.course.id === courseId && item.selectedClassroom?.id === classroomId)
    },

    // Get cart item by course and price plan
    getCartItemByPricePlan(courseId: string, pricePlanId: string): CartItem | undefined {
      return this.items.find(item => item.course.id === courseId && item.selectedPricePlan?.id === pricePlanId)
    },
  },
})
