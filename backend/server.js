const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' })); // Allows your Vercel site to fetch data
app.use(express.json());

const AC_URL = process.env.ACTIVECAMPAIGN_URL;
const AC_KEY = process.env.ACTIVECAMPAIGN_API_KEY;

const acApi = axios.create({
  baseURL: `${AC_URL}/api/3`,
  headers: { 'Api-Token': AC_KEY }
});

// Root welcome & health
app.get('/', (req, res) => {
  res.json({ message: "Fenyx ActiveCampaign Bridge is Live!", status: "online" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test connection
app.get('/api/test', async (req, res) => {
  try {
    const response = await acApi.get('/users/me');
    res.json({ connected: true, user: response.data.user?.email || 'Authenticated' });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.response?.data || err.message });
  }
});

// Fetch Real Contacts from ActiveCampaign with Tags and Metadata
app.get('/api/contacts', async (req, res) => {
  try {
    // 1. Fetch contacts with associated tags
    const response = await acApi.get('/contacts?limit=100&include=contactTags.tag,contactAutomations');
    const { contacts = [], contactTags = [], tags = [], contactAutomations = [] } = response.data;

    // Create a fast lookup map for tag IDs -> tag names
    const tagMap = {};
    tags.forEach(t => { tagMap[t.id] = t.tag; });

    // Map tags to contact IDs
    const contactTagMap = {};
    contactTags.forEach(ct => {
      if (!contactTagMap[ct.contact]) contactTagMap[ct.contact] = [];
      if (tagMap[ct.tag]) contactTagMap[ct.contact].push(tagMap[ct.tag]);
    });

    // Map automations count to contact IDs
    const contactAutoMap = {};
    contactAutomations.forEach(ca => {
      if (!contactAutoMap[ca.contact]) contactAutoMap[ca.contact] = { total: 0, active: 0, completed: 0 };
      contactAutoMap[ca.contact].total += 1;
      if (ca.status === '1' || ca.completeDate === null) {
        contactAutoMap[ca.contact].active += 1;
      } else {
        contactAutoMap[ca.contact].completed += 1;
      }
    });

    // 2. Format into the clean dashboard contact structure
    const formattedContacts = contacts.map(c => {
      const rawTags = contactTagMap[c.id] || [];
      const autoData = contactAutoMap[c.id] || { total: 0, active: 0, completed: 0 };
      
      // Determine Lead Stage based on tags
      let leadStage = 'Lead';
      if (rawTags.some(t => t.toLowerCase() === 'sql' || t.toLowerCase().includes('sales-qualified'))) {
        leadStage = 'SQL';
      } else if (rawTags.some(t => t.toLowerCase() === 'mql' || t.toLowerCase().includes('approved') || t.toLowerCase().includes('waitlist'))) {
        leadStage = 'MQL';
      }

      // Event & Attendance detection from tags
      const hasApproved = rawTags.some(t => t.toLowerCase().includes('approved'));
      const hasWaitlist = rawTags.some(t => t.toLowerCase().includes('waitlist'));
      const hasRejected = rawTags.some(t => t.toLowerCase().includes('rejected'));
      const hasRsvp = rawTags.some(t => t.toLowerCase().includes('rsvp'));
      const hasAttended = rawTags.some(t => t.toLowerCase().includes('attended'));
      const hasNoShow = rawTags.some(t => t.toLowerCase().includes('noshow') || t.toLowerCase().includes('no show'));

      const approvalStatus = hasApproved ? 'Approved' : hasWaitlist ? 'Waitlist' : hasRejected ? 'Rejected' : null;
      const rsvpStatus = hasRsvp ? 'Yes' : null;
      const attendanceStatus = hasAttended ? 'Attended' : hasNoShow ? 'No Show' : null;

      const dateAdded = c.cdate ? c.cdate.split('T')[0] : '2026-08-01';

      return {
        id: `ac-${c.id}`,
        firstName: c.firstName || 'Lead',
        lastName: c.lastName || `#${c.id}`,
        fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        email: c.email,
        company: c.orgname || 'Direct Lead',
        jobTitle: 'Prospect',
        dateAdded: dateAdded,
        leadStage: leadStage,
        leadScore: parseInt(c.score || 25, 10),
        rawTags: rawTags,
        emailsReceived: Math.max(1, (autoData.total * 2) + 2),
        broadcastEmails: 2,
        automationEmails: autoData.total * 2,
        emailsOpened: 1,
        linksClicked: 0,
        openRate: 50.0,
        clickRate: 0.0,
        automationsEntered: autoData.total,
        activeAutomations: autoData.active,
        completedAutomations: autoData.completed,
        lastAutomationEntered: autoData.total > 0 ? 'Active Journey' : '—',
        event: approvalStatus ? 'Google Event – August 2026' : null,
        approvalStatus: approvalStatus,
        rsvpStatus: rsvpStatus,
        attendanceStatus: attendanceStatus,
        engagementLevel: rawTags.length > 2 ? 'Engaged' : 'Unengaged',
        lastActivity: 'Recent Sync',
        lastActivityType: 'Contact Synced'
      };
    });

    res.json({
      success: true,
      count: formattedContacts.length,
      contacts: formattedContacts
    });
  } catch (err) {
    console.error('ActiveCampaign API Error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ActiveCampaign Bridge running on port ${PORT}`));
