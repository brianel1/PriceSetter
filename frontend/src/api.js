import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('pricer_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Login
export const login = async (code) => {
  const response = await axios.post(`${API_BASE}/auth/login`, { code });
  return response.data;
};

export const analyzeProject = async (requirement, isStudent = false) => {
  const response = await axios.post(`${API_BASE}/analyze`, { requirement, isStudent }, { headers: getAuthHeader() });
  return response.data;
};

export const saveQuotation = async (data) => {
  const response = await axios.post(`${API_BASE}/quotations`, data, { headers: getAuthHeader() });
  return response.data;
};

export const getQuotations = async () => {
  const response = await axios.get(`${API_BASE}/quotations`, { headers: getAuthHeader() });
  return response.data;
};

export const getQuotation = async (id) => {
  const response = await axios.get(`${API_BASE}/quotations/${id}`, { headers: getAuthHeader() });
  return response.data;
};

export const updateQuotationStatus = async (id, status) => {
  const response = await axios.patch(`${API_BASE}/quotations/${id}/status`, { status }, { headers: getAuthHeader() });
  return response.data;
};

export const savePattern = async (data) => {
  const response = await axios.post(`${API_BASE}/patterns`, data, { headers: getAuthHeader() });
  return response.data;
};

export const getPricingData = async () => {
  const response = await axios.get(`${API_BASE}/pricing-data`, { headers: getAuthHeader() });
  return response.data;
};

export const addPricingEntry = async (data) => {
  const response = await axios.post(`${API_BASE}/pricing-data`, data, { headers: getAuthHeader() });
  return response.data;
};

export const getPricingEntry = async (id) => {
  const response = await axios.get(`${API_BASE}/pricing-data/${id}`, { headers: getAuthHeader() });
  return response.data;
};

export const updatePricingEntry = async (id, data) => {
  const response = await axios.put(`${API_BASE}/pricing-data/${id}`, data, { headers: getAuthHeader() });
  return response.data;
};

export const deletePricingEntry = async (id) => {
  const response = await axios.delete(`${API_BASE}/pricing-data/${id}`, { headers: getAuthHeader() });
  return response.data;
};
