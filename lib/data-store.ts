// Simple in-memory data store with localStorage persistence
// This is a placeholder for a real database in production

import type { DivisionOrderData, OperatorData } from "@/lib/types"

class DataStore {
  private divisionOrders: DivisionOrderData[] = []
  private operators: OperatorData[] = []
  private initialized = false

  constructor() {
    // Don't initialize in constructor to avoid SSR issues
  }

  // Initialize the data store - call this on the client side
  loadFromStorage() {
    // Skip if already initialized or if running on server
    if (this.initialized || typeof window === "undefined") {
      return
    }

    try {
      const storedOrders = localStorage.getItem("divisionOrders")
      if (storedOrders) {
        this.divisionOrders = JSON.parse(storedOrders)
      }

      const storedOperators = localStorage.getItem("operators")
      if (storedOperators) {
        this.operators = JSON.parse(storedOperators)
      }

      this.initialized = true
    } catch (error) {
      console.error("Failed to load data from localStorage:", error)
      // Continue with empty data rather than crashing
      this.divisionOrders = []
      this.operators = []
      this.initialized = true
    }
  }

  // Save data to localStorage
  private saveToStorage() {
    if (typeof window === "undefined") {
      return
    }

    try {
      localStorage.setItem("divisionOrders", JSON.stringify(this.divisionOrders))
      localStorage.setItem("operators", JSON.stringify(this.operators))
    } catch (error) {
      console.error("Failed to save data to localStorage:", error)
      // Continue without saving rather than crashing
    }
  }

  // Division Order methods
  getDivisionOrders(): DivisionOrderData[] {
    this.loadFromStorage() // Ensure data is loaded
    return [...this.divisionOrders]
  }

  getDivisionOrderById(id: string): DivisionOrderData | undefined {
    this.loadFromStorage() // Ensure data is loaded
    return this.divisionOrders.find((order) => order.id === id)
  }

  addDivisionOrder(order: DivisionOrderData) {
    this.loadFromStorage() // Ensure data is loaded
    this.divisionOrders.push(order)
    this.saveToStorage()
  }

  updateDivisionOrder(id: string, updates: Partial<DivisionOrderData>) {
    this.loadFromStorage() // Ensure data is loaded
    const index = this.divisionOrders.findIndex((order) => order.id === id)
    if (index !== -1) {
      this.divisionOrders[index] = { ...this.divisionOrders[index], ...updates }
      this.saveToStorage()
    }
  }

  deleteDivisionOrder(id: string) {
    this.loadFromStorage() // Ensure data is loaded
    this.divisionOrders = this.divisionOrders.filter((order) => order.id !== id)
    this.saveToStorage()
  }

  // Operator methods
  getOperators(): OperatorData[] {
    this.loadFromStorage() // Ensure data is loaded
    return [...this.operators]
  }

  getOperatorById(id: string): OperatorData | undefined {
    this.loadFromStorage() // Ensure data is loaded
    return this.operators.find((operator) => operator.id === id)
  }

  addOperator(operator: OperatorData) {
    this.loadFromStorage() // Ensure data is loaded
    this.operators.push(operator)
    this.saveToStorage()
  }

  updateOperator(id: string, updates: Partial<OperatorData>) {
    this.loadFromStorage() // Ensure data is loaded
    const index = this.operators.findIndex((operator) => operator.id === id)
    if (index !== -1) {
      this.operators[index] = { ...this.operators[index], ...updates }
      this.saveToStorage()
    }
  }

  deleteOperator(id: string) {
    this.loadFromStorage() // Ensure data is loaded
    this.operators = this.operators.filter((operator) => operator.id !== id)
    this.saveToStorage()
  }
}

// Export a singleton instance
export const dataStore = new DataStore()
