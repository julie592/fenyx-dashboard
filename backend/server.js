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

app.get('/api/test', async (req, res) => {
  if (!AC_URL || !AC_KEY) {
    return res.status(500).json({ 
      connected: false, 
      error: 'Missing ACTIVECAMPAIGN_URL or ACTIVECAMPAIGN_API_KEY.' 
    });
  }
  try {
    const response = await acApi.get('/users/me');
    res.json({ connected: true, user: response.data.user?.email || 'Authenticated' });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.response?.data || err.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  if (!AC_URL || !AC_KEY) {
    return res.status(500).json({ error: 'Missing API Key or URL on backend.' });
  }

  try {
    let allContacts = [];
    let allFieldValues = [];
    let allFields = [];
    let allContactTags = [];
    let allTags = [];
    let allContactAutomations = [];

    const limit = 100;
    let offset = 0;
    let keepFetching = true;
    let totalInAccount = null;

    while (keepFetching) {
      const response = await acApi.get(
        `/contacts?limit=${limit}&offset=${offset}&include=fieldValues,fields,contactTags.tag,contactAutomations`
      );

      const {
        contacts = [],
        fieldValues = [],
        fields = [],
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
      if (Array.isArray(fields)) allFields = allFields.concat(fields);
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

    // Map custom field metadata (ID -> Tag / Title)
    const fieldMetaMap = {};
    allFields.forEach(f => {
      if (f?.id) {
        const pertag = (f.pertag || '').replace(/%/g, '').toUpperCase().trim();
        const title = (f.title || '').toUpperCase().trim();
        fieldMetaMap[f.id] = { pertag, title };
      }
    });

    // Map custom field values per contact
    const contactCustomMap = {};
    allFieldValues.forEach(fv => {
      if (fv?.contact && fv?.field && fv?.val !== undefined && fv?.val !== null && fv?.val !== '') {
        if (!contactCustomMap[fv.contact]) contactCustomMap[fv.contact] = {};
        const metaInfo = fieldMetaMap[fv.field];
        if (metaInfo) {
          if (metaInfo.pertag) contactCustomMap[fv.contact][metaInfo.pertag] = fv.val;
          if (metaInfo.title) contactCustomMap[fv.contact][metaInfo.title] = fv.val;
        }
      }
    });

    // Tag and automation mapping
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

    const formattedContacts = allContacts.map(c => {
      const rawTags = contactTagMap[c.id] || [];
      const autoData = contactAutoMap[c.id] || { total: 0, active: 0, completed: 0 };
      const custom = contactCustomMap[c.id] || {};

      // Helper to pull custom fields by tag or title
      const getVal = (...keys) => {
        for (const k of keys) {
          const formattedKey = String(k).replace(/%/g, '').toUpperCase().trim();
          if (custom[formattedKey] && custom[formattedKey] !== '') return custom[formattedKey];
        }
        return '—';
      };

      const companyVal = getVal('COMPANY', '%COMPANY%', 'Organization', 'Company Name') !== '—' 
        ? getVal('COMPANY', '%COMPANY%', 'Organization', 'Company Name')
        : (c.orgname || c.organization || '—');

      const roleVal = getVal('ROLE', '%ROLE%', 'Job Title', 'Role', 'Title');
      const ownerVal = getVal('LEAD_OWNER', '%LEAD_OWNER%', 'Lead Owner', 'Owner');
      const stageVal = getVal('PIPELINE_STAGE', '%PIPELINE_STAGE%', 'Pipeline Stage', 'Stage');
      const sourceVal = getVal('LEAD_SOURCE', '%LEAD_SOURCE%', 'Lead Source', 'Source', 'UTM_SOURCE') !== '—'
        ? getVal('LEAD_SOURCE', '%LEAD_SOURCE%', 'Lead Source', 'Source', 'UTM_SOURCE')
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
