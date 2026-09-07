const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const AC_URL = (process.env.ACTIVECAMPAIGN_URL || '').trim().replace(/\/+$/, '');
const AC_KEY = (process.env.ACTIVECAMPAIGN_API_KEY || '').trim();

const acApi = axios.create({
  baseURL: AC_URL ? `${AC_URL}/api/3` : '',
  headers: { 'Api-Token': AC_KEY },
  timeout: 30000
});

app.get('/', (req, res) => {
  res.json({ message: "Fenyx ActiveCampaign Bridge is Live!", status: "online" });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    hasUrl: Boolean(AC_URL), 
    hasKey: Boolean(AC_KEY),
    timestamp: new Date().toISOString() 
  });
});

// Diagnostic endpoint to inspect all ActiveCampaign custom field tags
app.get('/api/debug-fields', async (req, res) => {
  try {
    const fieldsRes = await acApi.get('/fields?limit=100');
    res.json({
      success: true,
      fields: fieldsRes.data.fields.map(f => ({
        id: f.id,
        title: f.title,
        pertag: f.pertag,
        cleanKey: (f.pertag || f.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  if (!AC_URL || !AC_KEY) {
    return res.status(500).json({ error: 'Missing API Key or URL on backend.' });
  }

  try {
    // 1. Fetch Master Custom Field Definitions Dictionary
    let fieldMetaMap = {};
    try {
      const fieldsRes = await acApi.get('/fields?limit=100');
      const customFields = fieldsRes.data?.fields || [];
      customFields.forEach(f => {
        if (f.id) {
          const cleanTitle = (f.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanPertag = (f.pertag || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          fieldMetaMap[f.id] = { cleanTitle, cleanPertag, title: f.title, pertag: f.pertag };
        }
      });
    } catch (e) {
      console.error('Failed to fetch master /fields:', e.message);
    }

    // 2. Fetch All Contacts & Relational Field Data via Multi-Page Pagination
    let allContacts = [];
    let allFieldValues = [];
    let allContactTags = [];
    let allTags = [];
    let allContactAutomations = [];

    const limit = 100;
    let offset = 0;
    let keepFetching = true;
    let totalInAccount = null;

    while (keepFetching) {
      const response = await acApi.get(
        `/contacts?limit=${limit}&offset=${offset}&include=fieldValues,contactTags.tag,contactAutomations`
      );

      const {
        contacts = [],
        fieldValues = [],
        contactTags = [],
        tags = [],
        contactAutomations = [],
        meta
      } = response.data || {};

      if (meta?.total && totalInAccount === null) {
        totalInAccount = parseInt(meta.total, 10);
      }

      if (!contacts || contacts.length === 0) {
        keepFetching = false;
        break;
      }

      allContacts = allContacts.concat(contacts);
      if (Array.isArray(fieldValues)) allFieldValues = allFieldValues.concat(fieldValues);
      if (Array.isArray(contactTags)) allContactTags = allContactTags.concat(contactTags);
      if (Array.isArray(tags)) allTags = allTags.concat(tags);
      if (Array.isArray(contactAutomations)) allContactAutomations = allContactAutomations.concat(contactAutomations);

      if (contacts.length < limit || (totalInAccount !== null && allContacts.length >= totalInAccount) || offset >= 10000) {
        keepFetching = false;
        break;
      }

      offset += limit;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Group Custom Field Values by Contact ID
    const contactCustomMap = {};
    allFieldValues.forEach(fv => {
      if (fv?.contact && fv?.field && fv?.val !== undefined && fv?.val !== null && fv?.val !== '') {
        const cid = fv.contact;
        if (!contactCustomMap[cid]) contactCustomMap[cid] = {};
        
        const meta = fieldMetaMap[fv.field];
        if (meta) {
          if (meta.cleanPertag) contactCustomMap[cid][meta.cleanPertag] = fv.val;
          if (meta.cleanTitle) contactCustomMap[cid][meta.cleanTitle] = fv.val;
        }
        contactCustomMap[cid][`raw_${fv.field}`] = fv.val;
      }
    });

    // 4. Group Tags & Automations
    const tagMap = {};
    allTags.forEach(t => { if (t?.id) tagMap[t.id] = t.tag; });

    const contactTagMap = {};
    allContactTags.forEach(ct => {
      if (ct?.contact) {
        if (!contactTagMap[ct.contact]) contactTagMap[ct.contact] = [];
        const tagName = tagMap[ct.tag];
        if (tagName && !contactTagMap[ct.contact].includes(tagName)) {
          contactTagMap[ct.contact].push(tagName);
        }
      }
    });

    const contactAutoMap = {};
    allContactAutomations.forEach(ca => {
      if (ca?.contact) {
        if (!contactAutoMap[ca.contact]) contactAutoMap[ca.contact] = { total: 0, active: 0, completed: 0 };
        contactAutoMap[ca.contact].total += 1;
        if (ca.status === '1' || ca.completeDate === null) contactAutoMap[ca.contact].active += 1;
        else contactAutoMap[ca.contact].completed += 1;
      }
    });

    // 5. Format Output Records
    const formattedContacts = allContacts.map(c => {
      const rawTags = contactTagMap[c.id] || [];
      const autoData = contactAutoMap[c.id] || { total: 0, active: 0, completed: 0 };
      const custom = contactCustomMap[c.id] || {};

      // Helper for fuzzy custom field extraction
      const getVal = (...searchKeys) => {
        for (const k of searchKeys) {
          const cleanKey = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (custom[cleanKey] && custom[cleanKey] !== '') return custom[cleanKey];
        }
        return '—';
      };

      const companyVal = getVal('company', 'organization', 'companyname', 'orgname') !== '—'
        ? getVal('company', 'organization', 'companyname', 'orgname')
        : (c.orgname || c.organization || '—');

      const roleVal = getVal('role', 'jobtitle', 'title', 'position');
      const ownerVal = getVal('leadowner', 'owner', 'assignedto', 'salesrep');
      const stageVal = getVal('pipelinestage', 'stage', 'dealstage', 'status');
      const sourceVal = getVal('leadsource', 'source', 'utmsource', 'channel') !== '—'
        ? getVal('leadsource', 'source', 'utmsource', 'channel')
        : (companyVal !== '—' ? companyVal : 'ActiveCampaign Organic');

      const totalEmailsSent = (autoData.completed * 2) + (autoData.active > 0 ? 1 : 0) + 1;
      const emailsOpened = Math.min(totalEmailsSent, rawTags.filter(t => /opened/i.test(t)).length || 1);
      const linksClicked = Math.min(emailsOpened, rawTags.filter(t => /clicked/i.test(t)).length || 0);

      return {
        id: `ac-${c.id}`,
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        email: c.email,
        company: companyVal,
        role: roleVal,
        leadOwner: ownerVal,
        pipelineStage: stageVal,
        leadSource: sourceVal,
        dateAdded: c.cdate ? c.cdate.split('T')[0] : '2026-08-01',
        rawTags: rawTags,
        emailsSent: totalEmailsSent,
        emailsOpened: emailsOpened,
        linksClicked: linksClicked,
        automationsEntered: autoData.total,
        activeAutomations: autoData.active,
        completedAutomations: autoData.completed
      };
    });

    res.json({
      success: true,
      count: formattedContacts.length,
      contacts: formattedContacts
    });
  } catch (err) {
    console.error('ActiveCampaign Fetch Error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Bridge running on port ${PORT}`));
