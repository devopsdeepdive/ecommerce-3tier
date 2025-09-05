import axios from 'axios'
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080' })

export const signup = (data) => API.post('/signup', data)
export const login = (data) => API.post('/login', data)
export const me = (token) => API.get('/me', { headers: { Authorization: `Bearer ${token}` } })
export const listProducts = () => API.get('/products')
export const addToCart = (token, payload) => API.post('/cart', payload, { headers: { Authorization: `Bearer ${token}` } })
export const getCart = (token) => API.get('/cart', { headers: { Authorization: `Bearer ${token}` } })
export const checkout = (token) => API.post('/checkout', {}, { headers: { Authorization: `Bearer ${token}` } })
export const myOrders = (token) => API.get('/orders', { headers: { Authorization: `Bearer ${token}` } })
