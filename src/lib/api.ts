const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE = (configuredApiBase || 'http://localhost:8000').replace(/\/$/, '');
