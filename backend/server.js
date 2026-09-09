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

// --- MONGODB CONFIGURATION & CACHE LAYER ---
const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true, minimize: false });

const Config = mongoose.models.Config || mongoose.model('Config', configSchema);

const DEFAULT_TAG_RULES = {
  MQL: ['FPF-Approved', 'FPF-Waitlisted'],
  Hot: [''],
  Warm: ['Growth Review - Coming Soon Form'],
  Cold: [''],
  'Not Qualified': ['FPF-Rejected']
};

const DEFAULT_SPEND_SETTINGS = {
  'Google event Registrants': 0,
  'Google Partner Referral': 0,
  'Website Growth Audit Form': 0,
  'Internal leads': 0
};

// Memory Cache
const memoryCache = {
  tagRules: { ...DEFAULT_TAG_RULES },
  spendSettings: { ...DEFAULT_SPEND_SETTINGS }
};

// Await DB connection on cold starts to prevent fallback resets
async function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1 && MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected/Reconnected to MongoDB Atlas!');
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
    }
  }
}

if (MONGO_URI) {
  ensureDbConnected().then(async () => {
    try {
      const rulesDoc = await Config.findOne({ key: 'tagRules' });
      if (rulesDoc?.data) memoryCache.tagRules = rulesDoc.data;

      const spendDoc = await Config.findOne({ key: 'spendSettings' });
      if (spendDoc?.data) memoryCache.spendSettings = spendDoc.data;
    } catch (e) {
      console.error('Cache hydration error:', e.message);
    }
  });
} else {
  console.warn('⚠️ MONGODB_URI is not set in environment variables.');
}

async function getConfig(key, fallback) {
  await ensureDbConnected();
  if (mongoose.connection.readyState === 1) {
    try {
      let record = await Config.findOne({ key });
      if (record?.data && Object.keys(record.data).length > 0) {
        memoryCache[key] = record.data;
        return record.data;
      } else if (!record) {
        // Create initial DB record only if it does not exist at all
        record = await Config.create({ key, data: fallback });
        memoryCache[key] = record.data;
        return record.data;
      }
    } catch (err) {
      console.error(`Error reading ${key} from MongoDB:`, err.message);
    }
  }
  return memoryCache[key] || fallback;
}

async function saveConfig(key, data) {
  memoryCache[key] = data; // Immediate in-memory sync
  await ensureDbConnected();
  if (mongoose.connection.readyState === 1) {
    try {
      await Config.findOneAndUpdate(
        { key },
        { $set: { data } },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`✅ Saved ${key} to MongoDB Atlas`);
      return true;
    } catch (err) {
      console.error(`Error writing ${key} to Mongo:`, err.message);
    }
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
      const fields = await getAllPages('/fields', 'fields');
      fields.forEach((field) => {
        if (!field.id) return;
        fieldMetaMap[field.id] = {
          cleanTitle: cleanKey(field.title), 
          cleanPertag: cleanKey(field.perstag || field.pertag),
          title: field.title, 
          pertag: field.perstag || field.pertag
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
      let value = fv?.value ?? fv?.val;
      if (!fv?.contact || !fv?.field || value === undefined || value === null || value === '') return;
      
      if (typeof value === 'string') {
        value = value.replace(/^\|\||\|\|$/g, '').replace(/\|\|/g, ', ').trim();
      }

      if (!contactCustomMap[fv.contact]) contactCustomMap[fv.contact] = {};
      const fieldMeta = fieldMetaMap[fv.field];
      if (fieldMeta?.cleanPertag) contactCustomMap[fv.contact][fieldMeta.cleanPertag] = value;
      if (fieldMeta?.cleanTitle) contactCustomMap[fv.contact][fieldMeta.cleanTitle] = value;
      contactCustomMap[fv.contact][`raw_${fv.field}`] = value;
    });

    const tagMap = {};
    allTags.forEach((tag) => { if (tag?.id) tagMap[tag.id] = tag.tag; });

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
        contactTagDateMap[ct.contact][cleanKey(tagName)] = ct.cdate;
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
          if (custom[normalizedKey] && custom[normalizedKey] !== '' && custom[normalizedKey] !== '—') {
            return custom[normalizedKey];
          }
        }
        return '—';
      };

      const companyVal = getVal('company', 'organization', 'companyname', 'orgname') !== '—'
          ? getVal('company', 'organization', 'companyname', 'orgname')
          : contact.orgname || contact.organization || '—';

      const roleVal = getVal('role', 'jobtitle', 'title', 'position');
      const ownerVal = getVal('leadowner', 'owner', 'assignedto', 'salesrep');
      const sourceVal = getVal('leadsource', 'source', 'utmsource', 'channel') !== '—' ? getVal('leadsource', 'source', 'utmsource', 'channel') : 'Unspecified';
      const stageVal = getVal('pipelinestage', 'pipeline_stage');

      const totalEmailsSent = automationData.completed * 2 + (automationData.active > 0 ? 1 : 0) + 1;
      const emailsOpened = Math.min(totalEmailsSent, rawTags.filter((tag) => /opened/i.test(tag)).length || 1);
      const linksClicked = Math.min(emailsOpened, rawTags.filter((tag) => /clicked/i.test(tag)).length || 0);

      return {
        id: `ac-${contact.id}`, 
        firstName: contact.firstName || '', 
        lastName: contact.lastName || '',
        fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email, 
        email: contact.email,
        company: companyVal, 
        role: roleVal, 
        leadOwner: ownerVal, 
        pipelineStage: stageVal, 
        leadSource: sourceVal,
        dateAdded: contact.cdate ? contact.cdate.split('T')[0] : '2026-08-01', 
        rawTags, 
        tagDates, 
        emailsSent: totalEmailsSent,
        emailsOpened, 
        linksClicked, 
        automationsEntered: automationData.total, 
        activeAutomations: automationData.active, 
        completedAutomations: automationData.completed,
        custom
      };
    });

    res.json({ success: true, count: formattedContacts.length, contacts: formattedContacts });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

app.get('/api/campaigns', async (req, res) => {
  try { 
    const campaigns = await getAllPages('/campaigns?include=campaignMessage', 'campaigns');
    res.json({ success: true, count: campaigns.length, campaigns }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.get('/api/automations', async (req, res) => {
  try { res.json({ success: true, count: (await getAllPages('/automations', 'automations')).length, automations: await getAllPages('/automations', 'automations') }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Bridge running on port ${PORT}`));
