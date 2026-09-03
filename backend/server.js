const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const AC_URL = process.env.ACTIVECAMPAIGN_URL;
const AC_KEY = process.env.ACTIVECAMPAIGN_API_KEY;

const acApi = axios.create({
  baseURL: `${AC_URL}/api/3`,
  headers: { 'Api-Token': AC_KEY }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Test ActiveCampaign connection
app.get('/api/test', async (req, res) => {
  try {
    const response = await acApi.get('/users/me');
    res.json({ connected: true, user: response.data.user?.email });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Fetch contacts and tags
app.get('/api/contacts', async (req, res) => {
  try {
    const response = await acApi.get('/contacts?limit=100&include=contactTags.tag');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
