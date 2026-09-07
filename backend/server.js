const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
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

const cleanKey = (value = '') =>
  String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

// --- GLOBAL TAG RULES STORAGE ---
const RULES_FILE = path.join(__dirname, 'tagRules.json');
const DEFAULT_TAG_RULES = {
  MQL: ['mql', 'approved', 'waitlist', 'mql-qualified'],
  Hot: ['hot', 'demo-requested', 'high-intent', 'fpf-vip'],
  Warm: ['warm', 'engaged', 'newsletter-click'],
  Cold: ['cold', 'unengaged', 'prospect'],
  'Not Qualified': ['rejected', 'unqualified', 'archived', 'no-fit', 'spam']
};

function getTagRules() {
  try {
    if (fs.existsSync(RULES_FILE)) {
      return JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading tag rules file:", err);
  }
  return DEFAULT_TAG_RULES;
}

app.get('/api/tag-rules', (req, res) => {
  res.json(getTagRules());
});

app.post('/api/tag-rules', (req, res) => {
  try {
    const newRules = req.body;
    fs.writeFileSync(RULES_FILE, JSON.stringify(newRules, null, 2));
    res.json({ success: true, rules: newRules });
  } catch (err) {
    console.error("Error saving tag rules:", err);
    res.status(500).json({ error: "Failed to save rules" });
  }
});
// --------------------------------

async function getAllPages(path, collectionKey) {
  const records = [];
  const limit = 100;

  for (let offset = 0; ; offset += limit) {
    const separator = path.includes('?') ? '&' : '?';
    const response = await acApi.get(
      `${path}${separator}limit=${limit}&offset=${offset}`
    );

    const page = response.data?.[collectionKey] || [];
    records.push(...page);

    if (page.length < limit) return records;
  }
}

app.get('/', (req, res) => {
  res.json({
    message: 'Fenyx ActiveCampaign Bridge is Live!',
    status: 'online'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    hasUrl: Boolean(AC_URL),
    hasKey: Boolean(AC_KEY),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug-fields', async (req, res) => {
  try {
    const fieldsRes = await acApi.get('/fields?limit=100');

    res.json({
      success: true,
      fields: (fieldsRes.data.fields || []).map((field) => ({
        id: field.id,
        title: field.title,
        pertag: field.perstag || field.pertag,
        cleanKey: cleanKey(field.perstag || field.pertag || field.title)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  if (!AC_URL || !AC_KEY) {
    return res.status(500).json({
      error: 'Missing API Key or URL on backend.'
    });
  }

  try {
    const fieldMetaMap = {};

    try {
      const fieldsRes = await acApi.get('/fields?limit=100');
      const customFields = fieldsRes.data?.fields || [];

      customFields.forEach((field) => {
        if (!field.id) return;

        fieldMetaMap[field.id] = {
          cleanTitle: cleanKey(field.title),
          cleanPertag: cleanKey(field.perstag || field.pertag),
          title: field.title,
          pertag: field.perstag || field.pertag
        };
      });
    } catch (err) {
      console.error('Failed to fetch ActiveCampaign field definitions:', err.message);
    }

    let allContacts = [];
    let allFieldValues = [];
    let allContactTags = [];
    let allTags = [];
    let allContactAutomations = [];

    const limit = 100;
    let offset = 0;
    let totalInAccount = null;
    let keepFetching = true;

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
        totalInAccount = Number(meta.total);
      }

      if (!contacts.length) break;

      allContacts = allContacts.concat(contacts);
      allFieldValues = allFieldValues.concat(fieldValues);
      allContactTags = allContactTags.concat(contactTags);
      allTags = allTags.concat(tags);
      allContactAutomations = allContactAutomations.concat(contactAutomations);

      if (
        contacts.length < limit ||
        (totalInAccount !== null && allContacts.length >= totalInAccount) ||
        offset >= 10000
      ) {
        keepFetching = false;
      } else {
        offset += limit;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const contactCustomMap = {};

    allFieldValues.forEach((fieldValueRecord) => {
      // ActiveCampaign v3 uses `value`; `val` is kept for compatibility.
      const value = fieldValueRecord?.value ?? fieldValueRecord?.val;

      if (
        !fieldValueRecord?.contact ||
        !fieldValueRecord?.field ||
        value === undefined ||
        value === null ||
        value === ''
      ) {
        return;
      }

      const contactId = fieldValueRecord.contact;
      if (!contactCustomMap[contactId]) {
        contactCustomMap[contactId] = {};
      }

      const fieldMeta = fieldMetaMap[fieldValueRecord.field];

      if (fieldMeta?.cleanPertag) {
        contactCustomMap[contactId][fieldMeta.cleanPertag] = value;
      }

      if (fieldMeta?.cleanTitle) {
        contactCustomMap[contactId][fieldMeta.cleanTitle] = value;
      }

      contactCustomMap[contactId][`raw_${fieldValueRecord.field}`] = value;
    });

    const tagMap = {};
    allTags.forEach((tag) => {
      if (tag?.id) tagMap[tag.id] = tag.tag;
    });

    const contactTagMap = {};
    allContactTags.forEach((contactTag) => {
      if (!contactTag?.contact) return;

      if (!contactTagMap[contactTag.contact]) {
        contactTagMap[contactTag.contact] = [];
      }

      const tagName = tagMap[contactTag.tag];

      if (
        tagName &&
        !contactTagMap[contactTag.contact].includes(tagName)
      ) {
        contactTagMap[contactTag.contact].push(tagName);
      }
    });

    const contactAutomationMap = {};
    allContactAutomations.forEach((automation) => {
      if (!automation?.contact) return;

      if (!contactAutomationMap[automation.contact]) {
        contactAutomationMap[automation.contact] = {
          total: 0,
          active: 0,
          completed: 0
        };
      }

      contactAutomationMap[automation.contact].total += 1;

      if (automation.status === '1' || automation.completeDate === null) {
        contactAutomationMap[automation.contact].active += 1;
      } else {
        contactAutomationMap[automation.contact].completed += 1;
      }
    });

    const formattedContacts = allContacts.map((contact) => {
      const rawTags = contactTagMap[contact.id] || [];
      const automationData = contactAutomationMap[contact.id] || {
        total: 0,
        active: 0,
        completed: 0
      };
      const custom = contactCustomMap[contact.id] || {};

      const getVal = (...searchKeys) => {
        for (const key of searchKeys) {
          const normalizedKey = cleanKey(key);

          if (custom[normalizedKey] && custom[normalizedKey] !== '') {
            return custom[normalizedKey];
          }
        }

        return '—';
      };

      const companyVal =
        getVal('company', 'organization', 'companyname', 'orgname') !== '—'
          ? getVal('company', 'organization', 'companyname', 'orgname')
          : contact.orgname || contact.organization || '—';

      const roleVal = getVal('role', 'jobtitle', 'title', 'position');
      const ownerVal = getVal('leadowner', 'owner', 'assignedto', 'salesrep');
      const stageVal = getVal('pipelinestage', 'stage', 'dealstage', 'status');

      const sourceVal =
        getVal('leadsource', 'source', 'utmsource', 'channel') !== '—'
          ? getVal('leadsource', 'source', 'utmsource', 'channel')
          : 'Unspecified';

      const totalEmailsSent =
        automationData.completed * 2 +
        (automationData.active > 0 ? 1 : 0) +
        1;

      const emailsOpened = Math.min(
        totalEmailsSent,
        rawTags.filter((tag) => /opened/i.test(tag)).length || 1
      );

      const linksClicked = Math.min(
        emailsOpened,
        rawTags.filter((tag) => /clicked/i.test(tag)).length || 0
      );

      return {
        id: `ac-${contact.id}`,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        fullName:
          `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
          contact.email,
        email: contact.email,
        company: companyVal,
        role: roleVal,
        leadOwner: ownerVal,
        pipelineStage: stageVal,
        leadSource: sourceVal,
        dateAdded: contact.cdate
          ? contact.cdate.split('T')[0]
          : '2026-08-01',
        rawTags,
        emailsSent: totalEmailsSent,
        emailsOpened,
        linksClicked,
        automationsEntered: automationData.total,
        activeAutomations: automationData.active,
        completedAutomations: automationData.completed
      };
    });

    res.json({
      success: true,
      count: formattedContacts.length,
      contacts: formattedContacts
    });
  } catch (err) {
    console.error(
      'ActiveCampaign Contact Fetch Error:',
      err.response?.data || err.message
    );

    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message
    });
  }
});

app.get('/api/campaigns', async (req, res) => {
  if (!AC_URL || !AC_KEY) {
    return res.status(500).json({
      error: 'Missing API Key or URL on backend.'
    });
  }

  try {
    const campaigns = await getAllPages('/campaigns', 'campaigns');

    res.json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (err) {
    console.error(
      'ActiveCampaign Campaign Fetch Error:',
      err.response?.data || err.message
    );

    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message
    });
  }
});

app.get('/api/automations', async (req, res) => {
  if (!AC_URL || !AC_KEY) {
    return res.status(500).json({
      error: 'Missing API Key or URL on backend.'
    });
  }

  try {
    const automations = await getAllPages('/automations', 'automations');

    res.json({
      success: true,
      count: automations.length,
      automations
    });
  } catch (err) {
    console.error(
      'ActiveCampaign Automation Fetch Error:',
      err.response?.data || err.message
    );

    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Bridge running on port ${PORT}`);
});
