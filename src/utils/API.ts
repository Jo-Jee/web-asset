import axios from 'axios'

export const assetAPI = axios.create({ baseURL: 'http://localhost:8080' })
