const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const AC_URL = (process.env.ACTIVECAMPAIGN_URL || '').trim().replace(/\/+$/, '');
const AC_KEY = (process.env.ACTIVECAMPAIGN_API_KEY || '').trim();
const MONGO_URI = (process.env.MONGODB_URI || '').trim();

const acApi = axios.create({
  baseURL: AC_URL ? `${AC_URL}/api/3` : '',
  headers: { 'Api-Token': AC_KEY },
  timeout: 30000
});

const cleanKey = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

// --- MONGODB DATABASE CONFIGURATION ---
const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true, minimize: false });

const Config = mongoose.models.Config || mongoose.model('Config', configSchema);

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));
} else {
  console.warn('⚠️ MONGODB_URI is not defined in environment variables.');
}

const DEFAULT_TAG_RULES = {
  MQL: ['mql', 'approved', 'waitlist', 'mql-qualified'],
  Hot: ['hot', 'demo-requested', 'high-intent', 'fpf-vip'],
  Warm: ['warm', 'engaged', 'newsletter-click'],
  Cold: ['cold', 'unengaged', 'prospect'],
  'Not Qualified': ['rejected', 'unqualified', 'archived', 'no-fit', 'spam']
};

const DEFAULT_SPEND_SETTINGS = {
  'Google event Registrants': 1500,
  'Google Partner Referral': 800,
  'Website Growth Audit Form': 500,
  'Internal leads': 200
};

const memoryStore = {
  tagRules: { ...DEFAULT_TAG_RULES },
  spendSettings: { ...DEFAULT_SPEND_SETTINGS }
};

async function getConfig(key, defaultData) {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    try {
      let record = await Config.findOne({ key });
      if (record && record.data) {
        return record.data;
      }
      record = await Config.create({ key, data: defaultData });
      return record.data;
    } catch (err) {
      console.error(`Error reading ${key} from MongoDB:`, err.message);
    }
  }
  return memoryStore[key] || defaultData;
}

async function saveConfig(key, data) {
  memoryStore[key] = data;
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    try {
      await Config.findOneAndUpdate(
        { key },
        { $set: { data } },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`✅ Successfully saved ${key} to MongoDB Atlas`);
      return true;
    } catch (err) {
      console.error(`Error saving ${key} to MongoDB:`, err.message);
    }
  } else {
    console.warn(`⚠️ MongoDB not connected. Saved to fallback memory store.`);
  }
  return false;
}

app.get('/api/tag-rules', async (req, res) => {
  const rules = await getConfig('tagRules', DEFAULT_TAG_RULES);
  res.json(rules);
});

app.post('/api/tag-rules', async (req, res) => {
  await saveConfig('tagRules', req.body);
  res.json({ success: true, rules: req.body });
});

app.get('/api/spend-settings', async (req, res) => {
  const spend = await getConfig('spendSettings', DEFAULT_SPEND_SETTINGS);
  res.json(spend);
});

app.post('/api/spend-settings', async (req, res) => {
  await saveConfig('spendSettings', req.body);
  res.json({ success: true, spendSettings: req.body });
});

async function getAllPages(pathStr, collectionKey) {
  const records = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const separator = pathStr.includes('?') ? '&' : '?';
    const response = await acApi.get(`${pathStr}${separator}limit=${limit}&offset=${offset}`);
    const page = response.data?.[collectionKey] || [];
    records.push(...page);
    if (page.length < limit) return records;
  }
}

app.get('/', (req, res) => res.json({ message: 'Fenyx ActiveCampaign Bridge is Live!', status: 'online' }));
app.get('/health', (req, res) => res.json({ status: 'ok', hasUrl: Boolean(AC_URL), hasKey: Boolean(AC_KEY), dbState: mongoose.connection.readyState }));

app.get('/api/contacts', async (req, res) => {
  if (!AC_URL || !AC_KEY) return res.status(500).json({ error: 'Missing API Key' });

  try {
    const fieldMetaMap = {};
    try {
      const fieldsRes = await acApi.get('/fields?limit=100');
      (fieldsRes.data?.fields || []).forEach((field) => {
        if (!field.id) return;
        fieldMetaMap[field.id] = {
          cleanTitle: cleanKey(field.title), cleanPertag: cleanKey(field.perstag || field.pertag),
          title: field.title, pertag: field.perstag || field.pertag
        };
      });
    } catch (err) { console.error('Field fetching error:', err.message); }

    let allContacts = [], allFieldValues = [], allContactTags = [], allTags = [], allContactAutomations = [];
    const limit = 100; let offset = 0; let totalInAccount = null; let keepFetching = true;

    while (keepFetching) {
      const response = await acApi.get(`/contacts?limit=${limit}&offset=${offset}&include=fieldValues,contactTags.tag,contactAutomations`);
      const data = response.data || {};
      const contacts = data.contacts || [];
      if (data.meta?.total && totalInAccount === null) totalInAccount = Number(data.meta.total);
      if (!contacts.length) break;

      allContacts = allContacts.concat(contacts);
      allFieldValues = allFieldValues.concat(data.fieldValues || []);
      allContactTags = allContactTags.concat(data.contactTags || []);
      allTags = allTags.concat(data.tags || []);
      allContactAutomations = allContactAutomations.concat(data.contactAutomations || []);

      if (contacts.length < limit || (totalInAccount !== null && allContacts.length >= totalInAccount) || offset >= 10000) {
        keepFetching = false;
      } else {
        offset += limit;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const contactCustomMap = {};
    allFieldValues.forEach((fv) => {
      const value = fv?.value ?? fv?.val;
      if (!fv?.contact || !fv?.field || value === undefined || value === null || value === '') return;
      if (!contactCustomMap[fv.contact]) contactCustomMap[fv.contact] = {};
      const fieldMeta = fieldMetaMap[fv.field];
      if (fieldMeta?.cleanPertag) contactCustomMap[fv.contact][fieldMeta.cleanPertag] = value;
      if (fieldMeta?.cleanTitle) contactCustomMap[fv.contact][fieldMeta.cleanTitle] = value;
      contactCustomMap[fv.contact][`raw_${fv.field}`] = value;
    });

    const tagMap = {};
    allTags.forEach((tag) => { if (tag?.id) tagMap[tag.id] = tag.tag; });

    // Track tag dates alongside the tags
    const contactTagMap = {};
    const contactTagDateMap = {};

    allContactTags.forEach((ct) => {
      if (!ct?.contact) return;
      if (!contactTagMap[ct.contact]) {
        contactTagMap[ct.contact] = [];
        contactTagDateMap[ct.contact] = {};
      }
      const tagName = tagMap[ct.tag];
      if (tagName && !contactTagMap[ct.contact].includes(tagName)) {
        contactTagMap[ct.contact].push(tagName);
        contactTagDateMap[ct.contact][cleanKey(tagName)] = ct.cdate; // Save the exact date the tag/click happened
      }
    });

    const contactAutomationMap = {};
    allContactAutomations.forEach((automation) => {
      if (!automation?.contact) return;
      if (!contactAutomationMap[automation.contact]) contactAutomationMap[automation.contact] = { total: 0, active: 0, completed: 0 };
      contactAutomationMap[automation.contact].total += 1;
      if (automation.status === '1' || automation.completeDate === null) contactAutomationMap[automation.contact].active += 1;
      else contactAutomationMap[automation.contact].completed += 1;
    });

    const formattedContacts = allContacts.map((contact) => {
      const rawTags = contactTagMap[contact.id] || [];
      const tagDates = contactTagDateMap[contact.id] || {};
      const automationData = contactAutomationMap[contact.id] || { total: 0, active: 0, completed: 0 };
      const custom = contactCustomMap[contact.id] || {};

      const getVal = (...searchKeys) => {
        for (const key of searchKeys) {
          const normalizedKey = cleanKey(key);
          if (custom[normalizedKey] && custom[normalizedKey] !== '') return custom[normalizedKey];
        }
        return '—';
      };

      const companyVal = getVal('company', 'organization', 'companyname', 'orgname') !== '—'
          ? getVal('company', 'organization', 'companyname', 'orgname')
          : contact.orgname || contact.organization || '—';

      const roleVal = getVal('role', 'jobtitle', 'title', 'position');
      const ownerVal = getVal('leadowner', 'owner', 'assignedto', 'salesrep');
      const stageVal = getVal('pipelinestage', 'stage', 'dealstage', 'status');
      const sourceVal = getVal('leadsource', 'source', 'utmsource', 'channel') !== '—' ? getVal('leadsource', 'source', 'utmsource', 'channel') : 'Unspecified';

      const totalEmailsSent = automationData.completed * 2 + (automationData.active > 0 ? 1 : 0) + 1;
      const emailsOpened = Math.min(totalEmailsSent, rawTags.filter((tag) => /opened/i.test(tag)).length || 1);
      const linksClicked = Math.min(emailsOpened, rawTags.filter((tag) => /clicked/i.test(tag)).length || 0);

      return {
        id: `ac-${contact.id}`, firstName: contact.firstName || '', lastName: contact.lastName || '',
        fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email, email: contact.email,
        company: companyVal, role: roleVal, leadOwner: ownerVal, pipelineStage: stageVal, leadSource: sourceVal,
        dateAdded: contact.cdate ? contact.cdate.split('T')[0] : '2026-08-01', rawTags, tagDates, emailsSent: totalEmailsSent,
        emailsOpened, linksClicked, automationsEntered: automationData.total, activeAutomations: automationData.active, completedAutomations: automationData.completed
      };
    });

    res.json({ success: true, count: formattedContacts.length, contacts: formattedContacts });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

app.get('/api/campaigns', async (req, res) => {
  try { res.json({ success: true, count: (await getAllPages('/campaigns', 'campaigns')).length, campaigns: await getAllPages('/campaigns', 'campaigns') }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/automations', async (req, res) => {
  try { res.json({ success: true, count: (await getAllPages('/automations', 'automations')).length, automations: await getAllPages('/automations', 'automations') }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Bridge running on port ${PORT}`));
