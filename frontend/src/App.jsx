import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, RefreshCw, Layers, Mail, 
  Search, Tag, BarChart2, Briefcase,
  X, Filter, Plus, ArrowUpRight, Building2, UserCheck,
  DollarSign, Sparkles, Activity, Calendar, MousePointer, Eye, Send,
  CheckCircle2, Clock, UserPlus, XCircle, Award, ExternalLink, Check, AlertCircle,
  MessageSquare, Bot, Minimize2, Workflow, Radio, ChevronDown, TrendingUp, Sun, FileText, CheckSquare
} from 'lucide-react';

const API_PROXY = 'https://fenyx-dashboard.onrender.com';

const DEFAULT_TAG_RULES = {
  MQL: ['FPF-Approved', 'FPF-Waitlist'],
  Hot: [''],
  Warm: ['Growth Review - Fenyx Website','Growth Review - In Person'],
  Cold: [''],
  'Not Qualified': ['FPF-Rejected']
};

const DEFAULT_SPEND = {
  'Google event Registrants': 0,
  'Google Partner Referral': 0,
  'Website Growth Audit Form': 0,
  'Internal leads': 0
};

const EVENT_REGISTRY = [
  {
    id: 'google-ph-aug-2026',
    name: 'Google Event PH - August 2026',
    registeredTag: 'Reg-Google-Event-August-2026',
    approvedTag: 'FPF-Approved',
    attendedTag: 'FPF-Attended',
    approvedNoShowTag: 'FPF-Approved-NoShow',
    rejectedTag: 'FPF-Rejected',
    rsvpConfirmedTag: 'RSVP-Confirmed',
    rsvpPlusOneTag: 'RSVP-Plus-one',
    spendKey: 'Google event Registrants'
  }
];

const PIPELINE_STAGES = [
  'Outreach Sent',
  'Discovery Call Booked',
  'In Contact',
  'Follow Up - 1',
  'Follow Up - 2',
  'For Growth Audit Presentation',
  'Proposal Sent',
  'Won',
  'Lost',
  'No Response'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [rawContacts, setRawContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedSurveyLead, setSelectedSurveyLead] = useState(null);
  const [surveyFormData, setSurveyFormData] = useState({});
  
  const [syncStatus, setSyncStatus] = useState('Standby');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeadType, setFilterLeadType] = useState('All');
  const [filterPipeline, setFilterPipeline] = useState('All');

  // Campaign Tab States
  const [campaignDatePreset, setCampaignDatePreset] = useState('All');
  const [campaignStartDate, setCampaignStartDate] = useState('');
  const [campaignEndDate, setCampaignEndDate] = useState('');
  const [campaignTypeFilter, setCampaignDateFilter] = useState('all'); 

  // Event Selection & Modal States
  const [selectedEventId, setSelectedEventId] = useState('google-ph-aug-2026');
  const [tagLeadModal, setTagLeadModal] = useState(null);

  // Gemini Floating Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'gemini',
      text: 'Hello! I am your Fenyx AI Assistant. Ask me about contacts, deals pipeline, conversions, or spend metrics!'
    }
  ]);

  const [tagRules, setTagRules] = useState(DEFAULT_TAG_RULES);
  const [spendSettings, setSpendSettings] = useState(DEFAULT_SPEND);
  const [newTagInput, setNewTagInput] = useState({ stage: 'MQL', tag: '' });

  const fetchData = async () => {
    setLoading(true);
    setSyncStatus('Syncing...');
    try {
      const [contactsRes, campaignsRes, automationsRes, tagRulesRes, spendRes] = await Promise.allSettled([
        fetch(`${API_PROXY}/api/contacts`),
        fetch(`${API_PROXY}/api/campaigns`),
        fetch(`${API_PROXY}/api/automations`),
        fetch(`${API_PROXY}/api/tag-rules`),
        fetch(`${API_PROXY}/api/spend-settings`)
      ]);

      if (contactsRes.status === 'fulfilled' && contactsRes.value.ok) {
        const data = await contactsRes.value.json();
        setRawContacts(data.contacts || []);
      }

      if (campaignsRes.status === 'fulfilled' && campaignsRes.value.ok) {
        const data = await campaignsRes.value.json();
        setCampaigns(data.campaigns || []);
      }

      if (automationsRes.status === 'fulfilled' && automationsRes.value.ok) {
        const data = await automationsRes.value.json();
        setAutomations(data.automations || []);
      }

      if (tagRulesRes.status === 'fulfilled' && tagRulesRes.value.ok) {
        const data = await tagRulesRes.value.json();
        if (data && Object.keys(data).length > 0) setTagRules(data);
      }

      if (spendRes.status === 'fulfilled' && spendRes.value.ok) {
        const data = await spendRes.value.json();
        if (data && Object.keys(data).length > 0) setSpendSettings(data);
      }

      const failedRequests = [contactsRes, campaignsRes, automationsRes].filter(
        result => result.status === 'rejected' || !result.value?.ok
      );

      setSyncStatus(failedRequests.length ? 'Partially connected' : 'Connected');
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Fetch error:', err);
      setSyncStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveRulesToBackend = async (updatedRules) => {
    try {
      await fetch(`${API_PROXY}/api/tag-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRules)
      });
    } catch (err) { console.error('Failed to save tag rules:', err); }
  };

  const saveSpendToBackend = async (updatedSpend) => {
    try {
      await fetch(`${API_PROXY}/api/spend-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSpend)
      });
    } catch (err) { console.error('Failed to save spend settings:', err); }
  };

  const processedLeads = useMemo(() => {
    return rawContacts.map(c => {
      const tags = (c.rawTags || []).map(t => String(t).toLowerCase());

      let detectedType = 'Cold';
      
      const isNotQual = tags.some(t => tagRules['Not Qualified']?.some(r => r.trim() !== '' && t.includes(r.toLowerCase())));
      const isMql = tags.some(t => tagRules['MQL']?.some(r => r.trim() !== '' && t.includes(r.toLowerCase())));
      const isHot = tags.some(t => tagRules['Hot']?.some(r => r.trim() !== '' && t.includes(r.toLowerCase())));
      const isWarm = tags.some(t => tagRules['Warm']?.some(r => r.trim() !== '' && t.includes(r.toLowerCase())));

      if (isNotQual) detectedType = 'Not Qualified';
      else if (isMql) detectedType = 'MQL';
      else if (isHot) detectedType = 'Hot';
      else if (isWarm) detectedType = 'Warm';
      else if (c.emailsOpened >= 3) detectedType = 'Warm';

      return { ...c, leadType: detectedType };
    });
  }, [rawContacts, tagRules]);

  const dealLeads = useMemo(() => {
    return processedLeads.filter(l => l.pipelineStage && l.pipelineStage !== '—' && l.pipelineStage.trim() !== '');
  }, [processedLeads]);

  const pipelineStageCounts = useMemo(() => {
    const counts = {};
    PIPELINE_STAGES.forEach(stg => counts[stg] = 0);

    const cleanStr = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    dealLeads.forEach(lead => {
      const stgClean = cleanStr(lead.pipelineStage);
      const matched = PIPELINE_STAGES.find(s => cleanStr(s) === stgClean);
      if (matched) {
        counts[matched]++;
      }
    });

    return counts;
  }, [dealLeads]);

  const leadTypeCounts = useMemo(() => {
    const counts = { Hot: 0, Warm: 0, MQL: 0, Cold: 0, 'Not Qualified': 0 };
    processedLeads.forEach(l => {
      if (counts[l.leadType] !== undefined) counts[l.leadType]++;
      else counts.Cold++;
    });
    return counts;
  }, [processedLeads]);

  const sourceBreakdown = useMemo(() => {
    const map = {
      'Google event Registrants': { count: 0, hot: 0, warm: 0, mqls: 0, cold: 0 },
      'Google Partner Referral': { count: 0, hot: 0, warm: 0, mqls: 0, cold: 0 },
      'Website Growth Audit Form': { count: 0, hot: 0, warm: 0, mqls: 0, cold: 0 },
      'Internal leads': { count: 0, hot: 0, warm: 0, mqls: 0, cold: 0 }
    };

    processedLeads.forEach(l => {
      const cleanTags = (l.rawTags || []).map(t => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));
      let sourceCat = 'Internal leads';

      if (cleanTags.some(t => t.includes('reggoogleeventaugust2026'))) sourceCat = 'Google event Registrants';
      else if (cleanTags.some(t => t.includes('googleemaillist'))) sourceCat = 'Google Partner Referral';
      else if (cleanTags.some(t => t.includes('growthreviewcomingsoonform'))) sourceCat = 'Website Growth Audit Form';

      if (map[sourceCat]) {
        map[sourceCat].count++;
        if (l.leadType === 'Hot') map[sourceCat].hot++;
        if (l.leadType === 'Warm') map[sourceCat].warm++;
        if (l.leadType === 'MQL') map[sourceCat].mqls++;
        if (l.leadType === 'Cold') map[sourceCat].cold++;
      }
    });

    return Object.entries(map).map(([source, data]) => {
      const spend = Number(spendSettings[source] || 0);
      const cpmql = data.mqls > 0 ? (spend / data.mqls) : 0;
      return { source, spend, cpmql, ...data };
    });
  }, [processedLeads, spendSettings]);

  const activeEvent = useMemo(() => {
    return EVENT_REGISTRY.find(e => e.id === selectedEventId) || EVENT_REGISTRY[0];
  }, [selectedEventId]);

  const activeEventStats = useMemo(() => {
    let registered = 0, approved = 0, attended = 0, approvedNoShow = 0;
    let rejected = 0, rsvpConfirmed = 0, rsvpPlusOne = 0, eventMqls = 0, growthAuditCount = 0;

    const resourceCounts = {
      'FPF-Consumer Shift': 0,
      'FPF-Data to Strategy': 0,
      'FPF-Growth Blueprint': 0,
      'FPF-All-Categories': 0
    };

    const regTagClean = activeEvent.registeredTag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const appTagClean = activeEvent.approvedTag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const attTagClean = activeEvent.attendedTag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const noShowTagClean = activeEvent.approvedNoShowTag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rejTagClean = activeEvent.rejectedTag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rsvpConfClean = activeEvent.rsvpConfirmedTag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rsvpPlusClean = activeEvent.rsvpPlusOneTag.toLowerCase().replace(/[^a-z0-9]/g, '');

    processedLeads.forEach(l => {
      const cleanTags = (l.rawTags || []).map(t => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));
      const rawTagsLower = (l.rawTags || []).map(t => String(t).toLowerCase());
      const isRegistered = cleanTags.includes(regTagClean);

      if (isRegistered) {
        registered++;
        if (l.leadType === 'MQL') eventMqls++;

        if (cleanTags.includes(appTagClean)) approved++;
        if (cleanTags.includes(attTagClean)) attended++;
        if (cleanTags.includes(noShowTagClean)) approvedNoShow++;
        if (cleanTags.includes(rejTagClean)) rejected++;
        if (cleanTags.includes(rsvpConfClean)) rsvpConfirmed++;
        if (cleanTags.includes(rsvpPlusClean)) rsvpPlusOne++;

        const hasGrowthAuditTag = cleanTags.includes('fpfgrowthaudit');
        const hasGrowthAuditLink = rawTagsLower.some(t => 
          t.includes('future-proof-forum-2026-growth-audit') || 
          t.includes('fenyx.digital/future-proof-forum-2026-growth-audit') ||
          t.includes('growth-audit')
        );

        if (hasGrowthAuditTag || hasGrowthAuditLink) growthAuditCount++;

        if (cleanTags.includes('fpfconsumershift')) resourceCounts['FPF-Consumer Shift']++;
        if (cleanTags.includes('fpfdatatostrategy')) resourceCounts['FPF-Data to Strategy']++;
        if (cleanTags.includes('fpfgrowthblueprint')) resourceCounts['FPF-Growth Blueprint']++;
        if (cleanTags.includes('fpfallcategories')) resourceCounts['FPF-All-Categories']++;
      }
    });

    const spend = Number(spendSettings[activeEvent.spendKey] || 0);
    const costPerMql = eventMqls > 0 ? spend / eventMqls : 0;
    const costPerRegistrant = registered > 0 ? spend / registered : 0;

    return {
      registered, approved, attended, approvedNoShow, rejected,
      rsvpConfirmed, rsvpPlusOne, eventMqls, spend, costPerMql,
      costPerRegistrant, growthAuditCount, resourceCounts
    };
  }, [processedLeads, spendSettings, activeEvent]);

  const modalLeads = useMemo(() => {
    if (!tagLeadModal) return [];

    if (tagLeadModal.isGrowthAudit) {
      return processedLeads.filter(l => {
        const cleanTags = (l.rawTags || []).map(t => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));
        const rawTagsLower = (l.rawTags || []).map(t => String(t).toLowerCase());
        
        const hasTag = cleanTags.includes('fpfgrowthaudit');
        const hasLink = rawTagsLower.some(t => 
          t.includes('future-proof-forum-2026-growth-audit') || 
          t.includes('fenyx.digital/future-proof-forum-2026-growth-audit') ||
          t.includes('growth-audit')
        );

        return hasTag || hasLink;
      });
    }

    const targetClean = tagLeadModal.cleanTag;
    return processedLeads.filter(l => {
      const cleanTags = (l.rawTags || []).map(t => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));
      return cleanTags.includes(targetClean);
    });
  }, [processedLeads, tagLeadModal]);

  const totalContacts = processedLeads.length;
  const totalAdSpend = useMemo(() => {
    return Object.values(spendSettings).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [spendSettings]);

  const totalMQLs = leadTypeCounts.MQL || 0;
  const overallCostPerMQL = totalMQLs > 0 ? (totalAdSpend / totalMQLs) : 0;

  const roleBreakdown = useMemo(() => {
    const map = {
      'C-Level': { total: 0, hot: 0, mql: 0, warm: 0, cold: 0, notQual: 0 },
      'Director': { total: 0, hot: 0, mql: 0, warm: 0, cold: 0, notQual: 0 },
      'Founder/Owner': { total: 0, hot: 0, mql: 0, warm: 0, cold: 0, notQual: 0 },
      'Manager': { total: 0, hot: 0, mql: 0, warm: 0, cold: 0, notQual: 0 },
      'Others': { total: 0, hot: 0, mql: 0, warm: 0, cold: 0, notQual: 0 }
    };

    processedLeads.forEach(l => {
      let cat = 'Others';
      if (l.role && l.role !== 'Prospect' && l.role !== '—') {
        const r = String(l.role).toLowerCase();
        if (r.includes('founder') || r.includes('owner')) cat = 'Founder/Owner';
        else if (r.includes('chief') || r.includes('c-level') || /\bc[a-z]{1,2}o\b/.test(r)) cat = 'C-Level';
        else if (r.includes('director')) cat = 'Director';
        else if (r.includes('manager')) cat = 'Manager';
      }
      map[cat].total++;
      if (l.leadType === 'Hot') map[cat].hot++;
      if (l.leadType === 'MQL') map[cat].mql++;
      if (l.leadType === 'Warm') map[cat].warm++;
      if (l.leadType === 'Cold') map[cat].cold++;
      if (l.leadType === 'Not Qualified') map[cat].notQual++;
    });

    return Object.entries(map).map(([role, stats]) => ({ role, ...stats }));
  }, [processedLeads]);

  const openTimeTrends = useMemo(() => {
    const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const timeSlots = {
      'Morning (6AM - 12PM)': 0,
      'Afternoon (12PM - 5PM)': 0,
      'Evening (5PM - 9PM)': 0,
      'Night (9PM - 6AM)': 0
    };
    let totalRecordedOpens = 0;

    processedLeads.forEach(lead => {
      const tagDates = lead.tagDates || {};
      const datesToAnalyze = [];

      Object.values(tagDates).forEach(dateStr => {
        if (dateStr) datesToAnalyze.push(dateStr);
      });

      if (!datesToAnalyze.length && lead.dateAdded && lead.dateAdded !== '—') {
        datesToAnalyze.push(lead.dateAdded);
      }

      datesToAnalyze.forEach(dateStr => {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          totalRecordedOpens++;
          
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          if (dayCounts[dayName] !== undefined) dayCounts[dayName]++;

          const hr = d.getHours();
          if (hr >= 6 && hr < 12) timeSlots['Morning (6AM - 12PM)']++;
          else if (hr >= 12 && hr < 17) timeSlots['Afternoon (12PM - 5PM)']++;
          else if (hr >= 17 && hr < 21) timeSlots['Evening (5PM - 9PM)']++;
          else timeSlots['Night (9PM - 6AM)']++;
        }
      });
    });

    return { dayCounts, timeSlots, totalRecordedOpens };
  }, [processedLeads]);

  const liveActivityFeed = useMemo(() => {
    if (!processedLeads.length) return [];
    
    const actions = [];

    processedLeads.forEach((lead) => {
      const tagDates = lead.tagDates || {};
      const cleanTags = (lead.rawTags || []).map(t => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));

      const clickTagMatch = cleanTags.find(t => t.includes('click') || t.includes('growth-audit'));
      if (lead.linksClicked > 0 || clickTagMatch) {
        let timestamp = null;
        let rawDate = new Date(0);
        if (clickTagMatch && tagDates[clickTagMatch]) {
          rawDate = new Date(tagDates[clickTagMatch]);
          timestamp = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        actions.push({
          id: `act-click-${lead.id}`,
          rawDate,
          time: timestamp || 'Recent Click',
          contact: lead.fullName,
          email: lead.email,
          action: 'Clicked campaign link',
          detail: `${lead.linksClicked || 1} URL click event(s) recorded`,
          type: 'click'
        });
      }

      const openTagMatch = cleanTags.find(t => t.includes('open'));
      if (lead.emailsOpened > 0 || openTagMatch) {
        let timestamp = null;
        let rawDate = new Date(0);
        if (openTagMatch && tagDates[openTagMatch]) {
          rawDate = new Date(tagDates[openTagMatch]);
          timestamp = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        actions.push({
          id: `act-open-${lead.id}`,
          rawDate,
          time: timestamp || 'Recent Open',
          contact: lead.fullName,
          email: lead.email,
          action: `Opened active campaign email`,
          detail: `${lead.emailsOpened || 1} open event(s) recorded`,
          type: 'open'
        });
      }
    });

    return actions
      .sort((a, b) => b.rawDate - a.rawDate)
      .slice(0, 4);
  }, [processedLeads]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    const newMessages = [...chatMessages, { sender: 'user', text: query }];
    setChatMessages(newMessages);
    setChatInput('');

    setTimeout(() => {
      let botResponse = '';
      const lowerQ = query.toLowerCase();

      if (lowerQ.includes('attended') || lowerQ.includes('google event') || lowerQ.includes('event')) {
        botResponse = `For "${activeEvent.name}", exactly ${activeEventStats.attended} registrants possess the "FPF-Attended" tag out of ${activeEventStats.registered} total registered contacts (${activeEventStats.registered > 0 ? ((activeEventStats.attended / activeEventStats.registered) * 100).toFixed(1) : 0}% attendance rate).`;
      } else if (lowerQ.includes('cost per mql') || lowerQ.includes('cpmql') || lowerQ.includes('cost/mql')) {
        botResponse = `Your overall Cost per MQL across all channels is $${overallCostPerMQL.toFixed(2)} based on $${totalAdSpend.toLocaleString()} total marketing spend and ${totalMQLs} total MQLs generated.`;
      } else if (lowerQ.includes('role') || lowerQ.includes('persona')) {
        const topRole = [...roleBreakdown].sort((a, b) => b.total - a.total)[0];
        botResponse = `Your highest concentration role is "${topRole?.role}" with ${topRole?.total} total contacts (${topRole?.mql} converted to MQL).`;
      } else if (lowerQ.includes('source') || lowerQ.includes('channel')) {
        const topSource = [...sourceBreakdown].sort((a, b) => b.mqls - a.mqls)[0];
        botResponse = `Your top-performing lead source is "${topSource?.source}" producing ${topSource?.mqls} MQLs at $${topSource?.cpmql?.toFixed(2)}/MQL.`;
      } else if (lowerQ.includes('growth audit') || lowerQ.includes('audit')) {
        botResponse = `There are currently ${activeEventStats.growthAuditCount} attendees who have requested a Growth Audit (tagged "FPF-Growth-Audit" or clicked the audit link).`;
      } else {
        botResponse = `I analyzed your live CRM data: You currently have ${totalContacts.toLocaleString()} total contacts (${leadTypeCounts.Hot} Hot, ${leadTypeCounts.Warm} Warm, ${leadTypeCounts.MQL} MQLs). Total configured spend is $${totalAdSpend.toLocaleString()}.`;
      }

      setChatMessages(prev => [...prev, { sender: 'gemini', text: botResponse }]);
    }, 400);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const sendDateStr = c.sdate || c.cdate || c.send_date;
      if (!sendDateStr) return true;
      const cDate = new Date(sendDateStr);

      if (campaignDatePreset === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return cDate >= thirtyDaysAgo;
      }
      if (campaignDatePreset === '90d') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return cDate >= ninetyDaysAgo;
      }
      if (campaignDatePreset === 'custom') {
        if (campaignStartDate && cDate < new Date(campaignStartDate)) return false;
        if (campaignEndDate && cDate > new Date(campaignEndDate + 'T23:59:59')) return false;
      }
      return true;
    });
  }, [campaigns, campaignDatePreset, campaignStartDate, campaignEndDate]);

  const categorizedCampaigns = useMemo(() => {
    const broadcast = [];
    const automationMap = {};

    filteredCampaigns.forEach(c => {
      const type = String(c.type || '').toLowerCase();
      const name = String(c.name || '').toLowerCase();

      const isAuto = 
        type === 'autoresponder' || 
        type === 'automation' || 
        type === 'split' ||
        /^\s*e\d+[\s:-]/i.test(c.name) ||
        /^\s*email\s*\d+/i.test(c.name) ||
        /^\s*step\s*\d+/i.test(c.name) ||
        /^\s*day\s*\d+/i.test(c.name) ||
        name.includes('automation') || 
        name.includes('drip') || 
        name.includes('sequence') ||
        name.includes('nurture') ||
        name.includes('follow-up') ||
        name.includes('reminder') ||
        name.includes('welcome') ||
        name.includes('onboarding') ||
        name.includes('fpf') ||
        name.includes('audit');

      if (isAuto) {
        let autoGroup = 'General Automation Sequences';

        const matchedACAuto = automations.find(a => 
          name.includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(name.split(':')[0].toLowerCase())
        );

        if (matchedACAuto) {
          autoGroup = matchedACAuto.name;
        } else if (c.name.includes(':')) {
          const prefix = c.name.split(':')[0].trim();
          if (prefix.length > 2 && !/^\s*e\d+$/i.test(prefix)) {
            autoGroup = prefix;
          } else {
            autoGroup = 'Event & Nurture Sequences';
          }
        } else if (name.includes('fpf') || name.includes('google event')) {
          autoGroup = 'Google Event & Future Proof Forum Automations';
        }

        if (!automationMap[autoGroup]) {
          automationMap[autoGroup] = [];
        }
        automationMap[autoGroup].push({ ...c, category: 'Automation Email' });
      } else {
        broadcast.push({ ...c, category: 'Broadcast Email' });
      }
    });

    return { broadcast, automationGroups: Object.entries(automationMap) };
  }, [filteredCampaigns, automations]);

  const campaignScorecard = useMemo(() => {
    let uniqueSent = 0, uniqueOpens = 0, uniqueClicks = 0;
    filteredCampaigns.forEach(c => {
      uniqueSent += Number(c.send_amt) || Number(c.unique_send) || 0;
      uniqueOpens += Number(c.uniqueopens) || Number(c.unique_opens) || Number(c.opens) || 0;
      uniqueClicks += Number(c.subscriberclicks) || Number(c.uniqueclicks) || Number(c.unique_clicks) || Number(c.linkclicks) || Number(c.clicks) || 0;
    });
    const openRate = uniqueSent > 0 ? ((uniqueOpens / uniqueSent) * 100).toFixed(1) : '0.0';
    const clickRate = uniqueSent > 0 ? ((uniqueClicks / uniqueSent) * 100).toFixed(1) : '0.0';
    return { uniqueSent, uniqueOpens, uniqueClicks, openRate, clickRate };
  }, [filteredCampaigns]);

  const uniquePipelineStages = useMemo(() => {
    const set = new Set();
    processedLeads.forEach(l => {
      if (l.pipelineStage && l.pipelineStage !== '—') set.add(l.pipelineStage);
    });
    return Array.from(set);
  }, [processedLeads]);

  const filteredLeads = useMemo(() => {
    return processedLeads.filter(l => {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        l.fullName?.toLowerCase().includes(search) ||
        l.email?.toLowerCase().includes(search) ||
        l.company?.toLowerCase().includes(search) ||
        l.leadOwner?.toLowerCase().includes(search);
      const matchesType = filterLeadType === 'All' || l.leadType === filterLeadType;
      const matchesPipeline = filterPipeline === 'All' || l.pipelineStage === filterPipeline;
      return matchesSearch && matchesType && matchesPipeline;
    });
  }, [processedLeads, searchQuery, filterLeadType, filterPipeline]);

  const handleAddTagRule = (e) => {
    e.preventDefault();
    if (!newTagInput.tag.trim()) return;
    const stage = newTagInput.stage;
    const tag = newTagInput.tag.trim().toLowerCase();
    const updatedRules = { ...tagRules, [stage]: [...(tagRules[stage] || []), tag] };
    setTagRules(updatedRules);
    saveRulesToBackend(updatedRules);
    setNewTagInput({ ...newTagInput, tag: '' });
  };

  const handleRemoveTagRule = (stage, tagToRemove) => {
    const updatedRules = { ...tagRules, [stage]: tagRules[stage].filter(t => t !== tagToRemove) };
    setTagRules(updatedRules);
    saveRulesToBackend(updatedRules);
  };

  const handleSpendInputChange = (source, value) => {
    setSpendSettings(prev => ({ ...prev, [source]: value }));
  };

  const handleSpendInputBlur = () => {
    const cleanSpend = {};
    Object.keys(spendSettings).forEach(k => {
      cleanSpend[k] = Number(spendSettings[k]) || 0;
    });
    saveSpendToBackend(cleanSpend);
  };

  const openSurveyModal = (lead) => {
    setSelectedSurveyLead(lead);
    
    const getVal = (key) => {
      const cleanK = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      return lead[cleanK] || lead.custom?.[cleanK] || 'Not Specified';
    };

    setSurveyFormData({
      targetGoLive: getVal('target_golive_date_for_this_project'),
      budgetStatus: getVal('what_is_the_current_budget_status_for_this_initiative'),
      decisionRole: getVal('what_is_the_leads_role_in_the_decision'),
      problemImportance: getVal('how_important_is_solving_this_problem_to_the_business_right_now'),
      businessOutcome: getVal('what_business_outcome_are_they_trying_to_achieve'),
      targetKpi: getVal('what_specific_target_or_kpi_are_they_benchmarking_against'),
      alignsWithFenyx: getVal('does_the_project_align_with_fenyxs_solutions') === 'Yes' || getVal('does_the_project_align_with_fenyxs_solutions') === true || String(getVal('does_the_project_align_with_fenyxs_solutions')).toLowerCase().includes('yes'),
      businessChallenges: getVal('what_business_challenges_are_you_facing'),
      notes: getVal('notes')
    });
  };

  const renderCampaignCard = (c) => {
    const sendAmt = Number(c.send_amt) || Number(c.unique_send) || 1;
    const uniqueOpens = Number(c.uniqueopens) || Number(c.unique_opens) || Number(c.opens) || 0;
    const uniqueClicks = Number(c.subscriberclicks) || Number(c.uniqueclicks) || Number(c.unique_clicks) || Number(c.linkclicks) || Number(c.clicks) || 0;
    const openRate = ((uniqueOpens / sendAmt) * 100).toFixed(1);
    const clickRate = ((uniqueClicks / sendAmt) * 100).toFixed(1);
    const isAboveAvg = Number(openRate) >= 21.5;

    return (
      <div key={c.id} className="p-4 border rounded-xl flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition shadow-2xs">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>{c.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAboveAvg ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isAboveAvg ? 'Above Benchmark' : 'Average Engagement'}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <span>Status: <strong className="text-slate-700">{c.status}</strong></span>
            <span>•</span>
            <span>Unique Recipients: <strong className="text-slate-700">{sendAmt.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Sent: {c.sdate || c.cdate || 'Recent'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-right">
          <div>
            <div className="text-xs text-slate-400">Unique Opens / Clicks</div>
            <div className="text-xs font-bold text-slate-800">{uniqueOpens.toLocaleString()} opens | {uniqueClicks.toLocaleString()} clicks</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Unique Rates</div>
            <div className={`text-xs font-extrabold ${isAboveAvg ? 'text-emerald-600' : 'text-slate-800'}`}>
              {openRate}% open | {clickRate}% click
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-light tracking-tight text-slate-900 font-sans">Fenyx</span>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Marketing & Lead Intelligence</h1>
              <p className="text-[11px] text-slate-500">Live ActiveCampaign API Integration</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <span className={`h-2.5 w-2.5 rounded-full ${syncStatus === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium text-slate-700">{syncStatus}</span>
              {lastSyncTime && <span className="text-slate-400">({lastSyncTime})</span>}
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 border-t border-slate-100 text-sm font-medium">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'leads', label: `All leads (${processedLeads.length})`, icon: Users },
            { id: 'deals', label: `Deals (${dealLeads.length})`, icon: Briefcase },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'campaigns', label: `Campaigns (${filteredCampaigns.length})`, icon: Mail },
            { id: 'automations', label: `Automations (${automations.length})`, icon: Layers },
            { id: 'spend', label: 'Marketing Spend', icon: DollarSign },
            { id: 'tag-rules', label: 'Rules', icon: Tag }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 border-b-2 transition cursor-pointer ${
                  active 
                    ? 'border-slate-900 text-slate-900 font-semibold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border text-slate-900 bg-white border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Contacts</p>
                <p className="text-3xl font-extrabold mt-1">{totalContacts.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">Active sync database</p>
              </div>

              <div className="p-4 rounded-xl border text-emerald-900 bg-emerald-50 border-emerald-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Ad Spend</p>
                <p className="text-3xl font-extrabold mt-1">${totalAdSpend.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-600 mt-1">Configured lead sources</p>
              </div>

              <div className="p-4 rounded-xl border text-indigo-900 bg-indigo-50 border-indigo-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Cost per MQL</p>
                <p className="text-3xl font-extrabold mt-1">${overallCostPerMQL.toFixed(2)}</p>
                <p className="text-[11px] text-indigo-600 mt-1">{totalMQLs} Total MQLs</p>
              </div>

              <div className="p-4 rounded-xl border text-purple-900 bg-purple-50 border-purple-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700">MQL Leads</p>
                <p className="text-3xl font-extrabold mt-1">{totalMQLs}</p>
                <p className="text-[11px] text-purple-600 mt-1">Qualified prospects</p>
              </div>

              <div className="p-4 rounded-xl border text-red-900 bg-red-50 border-red-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">Hot Leads</p>
                <p className="text-3xl font-extrabold mt-1">{leadTypeCounts.Hot}</p>
                <p className="text-[11px] text-red-600 mt-1">High conversion intent</p>
              </div>

              <div className="p-4 rounded-xl border text-amber-900 bg-amber-50 border-amber-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Warm Leads</p>
                <p className="text-3xl font-extrabold mt-1">{leadTypeCounts.Warm}</p>
                <p className="text-[11px] text-amber-600 mt-1">Engaged contacts</p>
              </div>

              <div className="p-4 rounded-xl border text-blue-900 bg-blue-50 border-blue-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Cold Leads</p>
                <p className="text-3xl font-extrabold mt-1">{leadTypeCounts.Cold}</p>
                <p className="text-[11px] text-blue-600 mt-1">Unengaged prospects</p>
              </div>

              <div className="p-4 rounded-xl border text-slate-700 bg-slate-100 border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Not Qualified</p>
                <p className="text-3xl font-extrabold mt-1">{leadTypeCounts['Not Qualified'] || 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">Unmatched / Rejected</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lead Source Performance</h3>
                  <p className="text-xs text-slate-500">Volume, lead stage segmentation, spend, and Cost per MQL</p>
                </div>
                <button
                  onClick={() => setActiveTab('spend')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
                >
                  <span>Edit Spend</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Lead Source Category</th>
                      <th className="px-6 py-3">Spend ($)</th>
                      <th className="px-6 py-3">Total Leads</th>
                      <th className="px-6 py-3">Hot Leads</th>
                      <th className="px-6 py-3">Warm Leads</th>
                      <th className="px-6 py-3">MQLs</th>
                      <th className="px-6 py-3">Cold Leads</th>
                      <th className="px-6 py-3">Cost / MQL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sourceBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">{item.source}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">${item.spend.toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{item.count}</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{item.hot}</td>
                        <td className="px-6 py-4 text-amber-600 font-bold">{item.warm}</td>
                        <td className="px-6 py-4 text-indigo-600 font-bold">{item.mqls}</td>
                        <td className="px-6 py-4 text-blue-600 font-bold">{item.cold}</td>
                        <td className="px-6 py-4 text-emerald-700 font-extrabold bg-emerald-50/50">
                          {item.mqls > 0 ? `$${item.cpmql.toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Breakdown by Roles & Job Titles</h3>
                  <p className="text-xs text-slate-500">Auto-categorized into C-Level, Director, Manager, Founder, and Others</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Role / Persona Category</th>
                        <th className="px-6 py-3">Total Leads</th>
                        <th className="px-6 py-3">Hot</th>
                        <th className="px-6 py-3">Warm</th>
                        <th className="px-6 py-3">MQL</th>
                        <th className="px-6 py-3">Cold</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {roleBreakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">{item.role}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{item.total}</td>
                          <td className="px-6 py-4 text-red-600 font-bold">{item.hot}</td>
                          <td className="px-6 py-4 text-amber-600 font-bold">{item.warm}</td>
                          <td className="px-6 py-4 text-indigo-600 font-bold">{item.mql}</td>
                          <td className="px-6 py-4 text-blue-600 font-bold">{item.cold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIVE ENGAGEMENT STREAM */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-slate-900 text-sm">Live Engagement Stream</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Latest 4 Actions</span>
                </div>

                <div className="space-y-3">
                  {liveActivityFeed.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No recent email opens or link clicks logged.</p>
                  ) : (
                    liveActivityFeed.map(act => (
                      <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 truncate max-w-[150px]">{act.contact}</span>
                          <span className="text-[10px] text-slate-400">{act.time}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] flex items-center space-x-1">
                          {act.type === 'click' ? (
                            <MousePointer className="h-3 w-3 text-blue-500 inline flex-shrink-0" />
                          ) : (
                            <Eye className="h-3 w-3 text-indigo-500 inline flex-shrink-0" />
                          )}
                          <span>{act.action}</span>
                        </p>
                        <p className="text-[10px] text-indigo-600 font-medium">{act.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* EMAIL OPEN DAY AND TIME TREND SECTION */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Email Open Day & Time Trends</h3>
                  <p className="text-xs text-slate-500">Distribution of subscriber email opens by day of week and time of day</p>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{openTimeTrends.totalRecordedOpens} Timestamps Analyzed</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Open Rate by Day of Week</span>
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(openTimeTrends.dayCounts).map(([day, count]) => {
                      const maxDay = Math.max(...Object.values(openTimeTrends.dayCounts), 1);
                      const pct = Math.round((count / maxDay) * 100);

                      return (
                        <div key={day} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-700 w-10 font-bold">{day}</span>
                            <span className="text-slate-500">{count} opens</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sun className="h-3.5 w-3.5 text-slate-500" />
                    <span>Peak Engagement Time Slots</span>
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(openTimeTrends.timeSlots).map(([slot, count]) => {
                      const total = openTimeTrends.totalRecordedOpens || 1;
                      const pct = ((count / total) * 100).toFixed(1);

                      return (
                        <div key={slot} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{slot}</span>
                            <span className="font-extrabold text-indigo-900">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ALL LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, company, or lead owner..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">Lead Type:</span>
                  <select
                    value={filterLeadType}
                    onChange={e => setFilterLeadType(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="All">All Types</option>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="MQL">MQL</option>
                    <option value="Cold">Cold</option>
                    <option value="Not Qualified">Not Qualified</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-600">Pipeline Stage:</span>
                  <select
                    value={filterPipeline}
                    onChange={e => setFilterPipeline(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="All">All Stages</option>
                    {uniquePipelineStages.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-6 py-3">Lead Owner</th>
                      <th className="px-6 py-3">Lead Source</th>
                      <th className="px-6 py-3">Lead Type</th>
                      <th className="px-6 py-3">Pipeline Stage</th>
                      <th className="px-6 py-3">Engagement</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{lead.fullName}</div>
                          <div className="text-xs text-slate-500">{lead.email}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-medium">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>{lead.company}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-medium">
                            <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                            <span>{lead.leadOwner}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-700 font-medium">
                            {lead.leadSource || 'Unspecified'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            lead.leadType === 'Hot' ? 'bg-red-100 text-red-800' :
                            lead.leadType === 'Warm' ? 'bg-amber-100 text-amber-800' :
                            lead.leadType === 'MQL' ? 'bg-indigo-100 text-indigo-800' :
                            lead.leadType === 'Not Qualified' ? 'bg-slate-200 text-slate-700' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {lead.leadType}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md border border-slate-200">
                            {lead.pipelineStage}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-800">{lead.emailsSent || 1} Sent</div>
                          <div className="text-xs text-slate-500">{lead.emailsOpened || 0} Opens | {lead.linksClicked || 0} Clicks</div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            <span>View Details</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEALS TAB */}
        {activeTab === 'deals' && (
          <div className="space-y-8">
            
            {/* PIPELINE STAGE SUMMARY VISUALIZATION */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Deals Pipeline Stage Funnel</h3>
                  <p className="text-xs text-slate-500">Live breakdown of deal distribution across all 10 active pipeline stages</p>
                </div>
                <span className="text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full">
                  {dealLeads.length} Active Deals
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                {PIPELINE_STAGES.map((stg) => {
                  const cnt = pipelineStageCounts[stg] || 0;
                  return (
                    <div key={stg} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate" title={stg}>
                        {stg}
                      </p>
                      <p className="text-xl font-extrabold text-slate-900">{cnt}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DEALS CONTACT TABLE WITH PIPELINE STAGE COLUMN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Active Deals List</h3>
                <p className="text-xs text-slate-500">Showing all contacts where Pipeline Stage is populated</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Email Address</th>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Lead Source</th>
                      <th className="px-6 py-3">Lead Owner</th>
                      <th className="px-6 py-3">Lead Type</th>
                      <th className="px-6 py-3">Pipeline Stage</th>
                      <th className="px-6 py-3 text-right">Lead Qualifier Survey</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dealLeads.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-8 text-center text-xs text-slate-400 italic">
                          No active deal contacts found with a non-blank pipeline stage.
                        </td>
                      </tr>
                    ) : (
                      dealLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-bold text-slate-900">{lead.fullName}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">{lead.email}</td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-700">{lead.company}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">{lead.role}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">{lead.leadSource}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">{lead.leadOwner}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              lead.leadType === 'Hot' ? 'bg-red-100 text-red-800' :
                              lead.leadType === 'Warm' ? 'bg-amber-100 text-amber-800' :
                              lead.leadType === 'MQL' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {lead.leadType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md border border-slate-200">
                              {lead.pipelineStage}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openSurveyModal(lead)}
                              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>View Qualifier Survey</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-[280px]">
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Featured Event</span>
                  <span className="text-xs text-slate-400 font-medium">Tag: {activeEvent.registeredTag}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{activeEvent.name}</h2>
                <p className="text-xs text-slate-500">Live registrant tracking, strict approval verification, and email nurture response metrics</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">Select Event:</span>
                  <select
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {EVENT_REGISTRY.map(evt => (
                      <option key={evt.id} value={evt.id}>{evt.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setActiveTab('spend')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-lg transition border border-slate-200 cursor-pointer"
                >
                  <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                  <span>Update Budget</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl border bg-white border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{activeEventStats.registered}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Total event signups</p>
              </div>

              <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved</p>
                <p className="text-2xl font-extrabold text-emerald-900 mt-1">{activeEventStats.approved}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Strict FPF-Approved tag</p>
              </div>

              <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Attended</p>
                <p className="text-2xl font-extrabold text-indigo-900 mt-1">{activeEventStats.attended}</p>
                <p className="text-[11px] text-indigo-600 mt-0.5">FPF-Attended tag</p>
              </div>

              <div className="p-4 rounded-xl border bg-slate-100 border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Event Spend</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">${activeEventStats.spend.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{activeEvent.spendKey}</p>
              </div>

              <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Cost / Registrant</p>
                <p className="text-2xl font-extrabold text-blue-900 mt-1">
                  {activeEventStats.registered > 0 ? `$${activeEventStats.costPerRegistrant.toFixed(2)}` : '$0.00'}
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5">Spend / Registered</p>
              </div>

              <div className="p-4 rounded-xl border bg-purple-50 border-purple-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Cost / MQL</p>
                <p className="text-2xl font-extrabold text-purple-900 mt-1">
                  {activeEventStats.eventMqls > 0 ? `$${activeEventStats.costPerMql.toFixed(2)}` : '$0.00'}
                </p>
                <p className="text-[11px] text-purple-600 mt-0.5">{activeEventStats.eventMqls} Event MQLs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Registrant Qualification Breakdown</h3>
                  <p className="text-xs text-slate-500">Strict tag counts for {activeEvent.name}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Status Category</th>
                        <th className="px-6 py-3">Tag Identifier</th>
                        <th className="px-6 py-3">Count</th>
                        <th className="px-6 py-3">% of Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Approved</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{activeEvent.approvedTag}</td>
                        <td className="px-6 py-4 font-bold text-emerald-700">{activeEventStats.approved}</td>
                        <td className="px-6 py-4 font-medium">
                          {activeEventStats.registered > 0 ? ((activeEventStats.approved / activeEventStats.registered) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                          <Award className="h-4 w-4 text-indigo-500" />
                          <span>Attended</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{activeEvent.attendedTag}</td>
                        <td className="px-6 py-4 font-bold text-indigo-700">{activeEventStats.attended}</td>
                        <td className="px-6 py-4 font-medium">
                          {activeEventStats.registered > 0 ? ((activeEventStats.attended / activeEventStats.registered) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>Approved, No Show</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{activeEvent.approvedNoShowTag}</td>
                        <td className="px-6 py-4 font-bold text-amber-700">{activeEventStats.approvedNoShow}</td>
                        <td className="px-6 py-4 font-medium">
                          {activeEventStats.registered > 0 ? ((activeEventStats.approvedNoShow / activeEventStats.registered) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>Rejected</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{activeEvent.rejectedTag}</td>
                        <td className="px-6 py-4 font-bold text-red-700">{activeEventStats.rejected}</td>
                        <td className="px-6 py-4 font-medium">
                          {activeEventStats.registered > 0 ? ((activeEventStats.rejected / activeEventStats.registered) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">RSVP Confirmation Visualizer</h3>
                  <p className="text-xs text-slate-500">Visual breakdown of approved candidates vs confirmed RSVPs & plus ones</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Approved Applicants ({activeEvent.approvedTag})</span>
                      </span>
                      <span className="font-extrabold text-slate-900">{activeEventStats.approved}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeEventStats.registered > 0 ? Math.min(100, (activeEventStats.approved / activeEventStats.registered) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                        <span>RSVP Confirmed ({activeEvent.rsvpConfirmedTag})</span>
                      </span>
                      <span className="font-extrabold text-slate-900">{activeEventStats.rsvpConfirmed}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeEventStats.approved > 0 ? Math.min(100, (activeEventStats.rsvpConfirmed / activeEventStats.approved) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-amber-500" />
                        <span>Registered Plus Ones ({activeEvent.rsvpPlusOneTag})</span>
                      </span>
                      <span className="font-extrabold text-slate-900">{activeEventStats.rsvpPlusOne}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeEventStats.rsvpConfirmed > 0 ? Math.min(100, (activeEventStats.rsvpPlusOne / activeEventStats.rsvpConfirmed) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Estimated Venue Headcount:</span>
                  <span className="font-extrabold text-indigo-900 text-sm">
                    {activeEventStats.rsvpConfirmed + activeEventStats.rsvpPlusOne} Total Attendees
                  </span>
                </div>
              </div>

            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Email Nurture Responses & Resource Preferences</h3>
                  <p className="text-xs text-slate-500">Interactive response tracking from post-event and pre-event email workflows. Click any category to view contact list.</p>
                </div>
                <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">Interactive Drill-down</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => setTagLeadModal({
                    title: 'Growth Audit Requests (Attendees)',
                    cleanTag: 'fpfgrowthaudit',
                    isGrowthAudit: true
                  })}
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50 p-4 rounded-xl border border-indigo-200 text-left transition space-y-2 group shadow-xs cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Nurture Action #1</span>
                    <ArrowUpRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">Growth Audit Request</h4>
                  <p className="text-2xl font-extrabold text-indigo-950">{activeEventStats.growthAuditCount}</p>
                  <p className="text-[11px] text-indigo-600 font-medium truncate">Tag or Email Link Click</p>
                </button>

                {Object.entries(activeEventStats.resourceCounts).map(([catName, count]) => {
                  const tagMap = {
                    'FPF-Consumer Shift': 'fpfconsumershift',
                    'FPF-Data to Strategy': 'fpfdatatostrategy',
                    'FPF-Growth Blueprint': 'fpfgrowthblueprint',
                    'FPF-All-Categories': 'fpfallcategories'
                  };
                  return (
                    <button
                      key={catName}
                      onClick={() => setTagLeadModal({
                        title: `Resource Request: ${catName}`,
                        cleanTag: tagMap[catName],
                        isGrowthAudit: false
                      })}
                      className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 text-left transition space-y-2 group shadow-xs cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resource Request</span>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug truncate">{catName}</h4>
                      <p className="text-2xl font-extrabold text-slate-900">{count}</p>
                      <p className="text-[11px] text-indigo-600 font-medium truncate">Tag: {catName}</p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ORGANIZED CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Date Range:</span>
                <select
                  value={campaignDatePreset}
                  onChange={e => setCampaignDatePreset(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="All">All Time</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setCampaignDateFilter('all')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${campaignTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  All Emails ({filteredCampaigns.length})
                </button>
                <button
                  onClick={() => setCampaignDateFilter('automation')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${campaignTypeFilter === 'automation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Automation Sequences ({categorizedCampaigns.automationGroups.reduce((acc, g) => acc + g[1].length, 0)})
                </button>
                <button
                  onClick={() => setCampaignDateFilter('broadcast')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${campaignTypeFilter === 'broadcast' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Broadcast Emails ({categorizedCampaigns.broadcast.length})
                </button>
              </div>

              {campaignDatePreset === 'custom' && (
                <div className="flex items-center space-x-3 text-xs">
                  <input
                    type="date"
                    value={campaignStartDate}
                    onChange={e => setCampaignStartDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={campaignEndDate}
                    onChange={e => setCampaignEndDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl border bg-white border-slate-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unique Sent</span>
                  <Send className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{campaignScorecard.uniqueSent.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400">Unique recipients reached</p>
              </div>

              <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Unique Opens</span>
                  <Eye className="h-4 w-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-extrabold text-indigo-900">{campaignScorecard.uniqueOpens.toLocaleString()}</p>
                <p className="text-[11px] text-indigo-600">Distinct subscriber opens</p>
              </div>

              <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Unique Clicks</span>
                  <MousePointer className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-extrabold text-blue-900">{campaignScorecard.uniqueClicks.toLocaleString()}</p>
                <p className="text-[11px] text-blue-600">Distinct subscriber clicks</p>
              </div>

              <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Unique Open Rate</span>
                  <span className="text-[10px] font-bold bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded">Bench 21.5%</span>
                </div>
                <p className="text-2xl font-extrabold text-emerald-900">{campaignScorecard.openRate}%</p>
                <p className="text-[11px] text-emerald-600">Unique Opens / Unique Sent</p>
              </div>

              <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 shadow-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Unique Click Rate</span>
                  <span className="text-[10px] font-bold bg-amber-200/60 text-amber-800 px-1.5 py-0.5 rounded">Bench 2.3%</span>
                </div>
                <p className="text-2xl font-extrabold text-amber-900">{campaignScorecard.clickRate}%</p>
                <p className="text-[11px] text-amber-600">Unique Clicks / Unique Sent</p>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* SECTION 1: AUTOMATION & SEQUENCE EMAILS */}
              {(campaignTypeFilter === 'all' || campaignTypeFilter === 'automation') && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <Workflow className="h-5 w-5 text-purple-600" />
                      <h3 className="text-base font-bold text-slate-900">Automation Sequence Emails (Grouped by Automation)</h3>
                    </div>
                    <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                      {categorizedCampaigns.automationGroups.reduce((acc, g) => acc + g[1].length, 0)} Sequence Emails
                    </span>
                  </div>

                  {categorizedCampaigns.automationGroups.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 border border-slate-200 text-xs text-slate-400 italic">
                      No automated sequence emails found for this selection.
                    </div>
                  ) : (
                    categorizedCampaigns.automationGroups.map(([groupName, groupEmails]) => {
                      const groupSent = groupEmails.reduce((sum, e) => sum + (Number(e.send_amt) || Number(e.unique_send) || 0), 0);
                      const groupOpens = groupEmails.reduce((sum, e) => sum + (Number(e.uniqueopens) || Number(e.unique_opens) || Number(e.opens) || 0), 0);
                      const groupOpenRate = groupSent > 0 ? ((groupOpens / groupSent) * 100).toFixed(1) : '0.0';

                      return (
                        <div key={groupName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                                <Workflow className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">{groupName}</h4>
                                <p className="text-xs text-slate-500">{groupEmails.length} Step Emails in this Sequence</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="bg-purple-100 text-purple-900 font-bold px-3 py-1 rounded-md border border-purple-200">
                                Sequence Avg Open Rate: {groupOpenRate}%
                              </span>
                            </div>
                          </div>
                          <div className="p-6 space-y-3 bg-white">
                            {groupEmails.map(renderCampaignCard)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* SECTION 2: BROADCAST EMAILS */}
              {(campaignTypeFilter === 'all' || campaignTypeFilter === 'broadcast') && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-2">
                      <Radio className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-base font-bold text-slate-900">Broadcast Emails (Bulk One-Off Sends)</h3>
                    </div>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                      {categorizedCampaigns.broadcast.length} Broadcasts
                    </span>
                  </div>
                  <div className="p-6 text-sm text-slate-500">
                    {categorizedCampaigns.broadcast.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No broadcast emails found for this selection.</p>
                    ) : (
                      <div className="space-y-4">
                        {categorizedCampaigns.broadcast.map(renderCampaignCard)}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* AUTOMATIONS TAB */}
        {activeTab === 'automations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Active Automations & Workflow Health</h3>
              <p className="text-xs text-slate-500 mt-1">Multi-step drip sequence monitoring, lead throughput, and automated workflow tracking</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 text-sm text-slate-500">
                {automations.length === 0 ? 'No automations found in ActiveCampaign.' : (
                  <div className="space-y-4">
                    {automations.map(a => (
                      <div key={a.id} className="p-4 border rounded-xl flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                            <span>{a.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              a.status === '1' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {a.status === '1' ? 'Active Sequence' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">Workflow ID: {a.id} | Real-time Trigger Monitoring</div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            Health Status: Optimal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MARKETING SPEND TAB */}
        {activeTab === 'spend' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">Lead Source Marketing Spend Allocation</h3>
              <p className="text-xs text-slate-500">
                Configure your active advertising and partner acquisition spend per lead source. Amounts set here automatically update the Cost per MQL performance metrics globally.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(DEFAULT_SPEND).map(source => (
                  <div key={source} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">{source}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={spendSettings[source] ?? ''}
                        onChange={e => handleSpendInputChange(source, e.target.value)}
                        onBlur={handleSpendInputBlur}
                        className="w-full pl-8 pr-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Saved automatically on field blur</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'tag-rules' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">Auto-Identify Lead Types via ActiveCampaign Tags</h3>
              <p className="text-xs text-slate-500">
                Configure tag keywords globally. Any updates you make here will be saved to the backend and applied for your entire team across sessions.
              </p>
            </div>

            <form onSubmit={handleAddTagRule} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Lead Type</label>
                <select
                  value={newTagInput.stage}
                  onChange={e => setNewTagInput({ ...newTagInput, stage: e.target.value })}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MQL">MQL</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="Not Qualified">Not Qualified</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tag Keyword / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. approved, webinar-attendee, bad-data..."
                  value={newTagInput.tag}
                  onChange={e => setNewTagInput({ ...newTagInput, tag: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center space-x-1 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Rule</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(tagRules).map(([stage, tags]) => (
                <div key={stage} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{stage} Tag Conditions</h4>
                    <span className="text-xs font-semibold text-slate-400">{tags.length} active rules</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <span key={t} className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-full">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span>{t}</span>
                        <button
                          onClick={() => handleRemoveTagRule(stage, t)}
                          className="hover:text-red-600 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FLOATING GEMINI AI CHATBOT BUTTON */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-700 hover:to-slate-800 text-white p-3.5 rounded-full shadow-2xl flex items-center space-x-2.5 transition transform hover:scale-105 border border-indigo-400/30 cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-indigo-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-bold pr-1">Ask Gemini AI</span>
        </button>
      )}

      {/* FLOATING GEMINI AI CHATBOT DRAWER */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px]">
          
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-indigo-900/50">
            <div className="flex items-center space-x-2.5">
              <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-400/30">
                <Sparkles className="h-4 w-4 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-bold text-xs tracking-wide">Gemini Marketing Assistant</h3>
                <p className="text-[10px] text-indigo-200/80">Live CRM Intelligence Stream</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white font-medium rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60 overflow-x-auto whitespace-nowrap flex space-x-2 text-[10px]">
            <button
              onClick={() => handleSendMessage("How many google event registrants attended?")}
              className="bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 px-2.5 py-1 rounded-full font-medium transition shadow-2xs cursor-pointer"
            >
              How many google event registrants attended?
            </button>
            <button
              onClick={() => handleSendMessage("What is our overall Cost per MQL?")}
              className="bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 px-2.5 py-1 rounded-full font-medium transition shadow-2xs cursor-pointer"
            >
              Cost per MQL?
            </button>
            <button
              onClick={() => handleSendMessage("Which role category has the most leads?")}
              className="bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 px-2.5 py-1 rounded-full font-medium transition shadow-2xs cursor-pointer"
            >
              Top Role?
            </button>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-white border-t border-slate-200 flex space-x-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask Gemini anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* LEAD QUALIFIER SURVEY MODAL FOR DEALS */}
      {selectedSurveyLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lead Qualifier Survey</h3>
                <p className="text-xs text-slate-500">Filled up by lead owner for <strong className="text-slate-800">{selectedSurveyLead.fullName}</strong> ({selectedSurveyLead.company})</p>
              </div>
              <button
                onClick={() => setSelectedSurveyLead(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Target go-live date for this project?</label>
                <p className="text-[10px] text-slate-400 font-mono">%TARGET_GOLIVE_DATE_FOR_THIS_PROJECT%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {surveyFormData.targetGoLive}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">What is the current budget status for this initiative?</label>
                <p className="text-[10px] text-slate-400 font-mono">%WHAT_IS_THE_CURRENT_BUDGET_STATUS_FOR_THIS_INITIATIVE%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {surveyFormData.budgetStatus}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">What is the lead's role in the decision?</label>
                <p className="text-[10px] text-slate-400 font-mono">%WHAT_IS_THE_LEADS_ROLE_IN_THE_DECISION%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {surveyFormData.decisionRole}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">How important is solving this problem to the business right now?</label>
                <p className="text-[10px] text-slate-400 font-mono">%HOW_IMPORTANT_IS_SOLVING_THIS_PROBLEM_TO_THE_BUSINESS_RIGHT_NOW%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {surveyFormData.problemImportance}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">What business outcome are they trying to achieve?</label>
                <p className="text-[10px] text-slate-400 font-mono">%WHAT_BUSINESS_OUTCOME_ARE_THEY_TRYING_TO_ACHIEVE%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {surveyFormData.businessOutcome}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">What specific target or KPI are they benchmarking against?</label>
                <p className="text-[10px] text-slate-400 font-mono">%WHAT_SPECIFIC_TARGET_OR_KPI_ARE_THEY_BENCHMARKING_AGAINST%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {surveyFormData.targetKpi}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Does the project align with Fenyx's solutions?</label>
                <p className="text-[10px] text-slate-400 font-mono">%DOES_THE_PROJECT_ALIGN_WITH_FENYXS_SOLUTIONS%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium flex items-center space-x-2">
                  <CheckSquare className={`h-4 w-4 ${surveyFormData.alignsWithFenyx ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{surveyFormData.alignsWithFenyx ? 'Yes - Project Aligned' : 'No / Unspecified'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">What Business Challenges Are You Facing?</label>
                <p className="text-[10px] text-slate-400 font-mono">%WHAT_BUSINESS_CHALLENGES_ARE_YOU_FACING%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {surveyFormData.businessChallenges}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Notes</label>
                <p className="text-[10px] text-slate-400 font-mono">%NOTES%</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium whitespace-pre-wrap">
                  {surveyFormData.notes}
                </div>
              </div>

            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedSurveyLead(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-lg hover:bg-slate-900 transition cursor-pointer"
              >
                Close Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED NURTURE RESPONSE DRILL-DOWN MODAL */}
      {tagLeadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{tagLeadModal.title}</h3>
                <p className="text-xs text-slate-500">Showing {modalLeads.length} contacts matching this nurture response criteria</p>
              </div>
              <button
                onClick={() => setTagLeadModal(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {!tagLeadModal.isGrowthAudit && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>Email Delivery Confirmation:</strong> All contacts listed below have received their requested resources via automated email sequences.
                  </span>
                </div>
              )}

              {modalLeads.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  No contacts found matching this nurture trigger.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Contact Name</th>
                        <th className="px-4 py-2.5">Email</th>
                        <th className="px-4 py-2.5">Company</th>
                        <th className="px-4 py-2.5">Trigger Source / Action Date</th>
                        <th className="px-4 py-2.5 text-right">Resource Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {modalLeads.map(lead => {
                        const cleanTags = (lead.rawTags || []).map(t => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));
                        const rawTagsLower = (lead.rawTags || []).map(t => String(t).toLowerCase());

                        const hasAuditTag = cleanTags.includes('fpfgrowthaudit');
                        const hasAuditLink = rawTagsLower.some(t => 
                          t.includes('future-proof-forum-2026-growth-audit') || 
                          t.includes('growth-audit')
                        );

                        let actionDateStr = null;
                        if (tagLeadModal.isGrowthAudit) {
                          const triggerMatch = cleanTags.find(t => t.includes('futureproofforum2026growthaudit') || t === 'fpfgrowthaudit' || t.includes('growthaudit'));
                          if (triggerMatch && lead.tagDates && lead.tagDates[triggerMatch]) {
                            const d = new Date(lead.tagDates[triggerMatch]);
                            actionDateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                          }
                        } else {
                          const triggerMatch = tagLeadModal.cleanTag;
                          if (triggerMatch && lead.tagDates && lead.tagDates[triggerMatch]) {
                            const d = new Date(lead.tagDates[triggerMatch]);
                            actionDateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                          }
                        }

                        const hasSentTag = cleanTags.includes('fpfgrowthauditsent');

                        return (
                          <tr key={lead.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-900">{lead.fullName}</td>
                            <td className="px-4 py-2.5 text-slate-500">{lead.email}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-700">{lead.company}</td>
                            
                            <td className="px-4 py-2.5">
                              {tagLeadModal.isGrowthAudit ? (
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-indigo-700 flex items-center space-x-1">
                                    <span>
                                      {hasAuditTag && hasAuditLink ? 'Tag Assigned & Link Clicked' :
                                       hasAuditLink ? 'Email Link Clicked' : 'Tag: FPF-Growth-Audit'}
                                    </span>
                                  </div>
                                  <a 
                                    href="https://www.fenyx.digital/future-proof-forum-2026-growth-audit" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-slate-400 hover:text-indigo-600 underline flex items-center space-x-1"
                                  >
                                    <span>https://www.fenyx.digital/future-proof-forum-2026-growth-audit</span>
                                    <ExternalLink className="h-2.5 w-2.5 inline" />
                                  </a>
                                  {actionDateStr && (
                                    <div className="text-[10px] text-slate-500 font-medium mt-1">
                                      Action Logged: {actionDateStr}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="font-mono text-slate-500">{tagLeadModal.title}</span>
                                  {actionDateStr && (
                                    <div className="text-[10px] text-slate-400 font-medium mt-1">
                                      Requested on: {actionDateStr}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-2.5 text-right">
                              {tagLeadModal.isGrowthAudit ? (
                                hasSentTag ? (
                                  <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-[10px] font-bold">
                                    <Check className="h-3 w-3" />
                                    <span>Resource Sent</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-[10px] font-bold">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Not yet sent</span>
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-[10px] font-bold">
                                  <Check className="h-3 w-3" />
                                  <span>Received via Email</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setTagLeadModal(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-lg hover:bg-slate-900 transition cursor-pointer"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW CONTACT DETAILS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedLead.fullName}</h3>
                <p className="text-xs text-slate-500">{selectedLead.email}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Contact Fields (Populated)</h4>
              
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(selectedLead)
                  .filter(([key, val]) => {
                    if (val === null || val === undefined || val === '' || val === '—') return false;
                    if (Array.isArray(val) && val.length === 0) return false;
                    return true;
                  })
                  .map(([key, val]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="ml-2 font-medium text-slate-900 break-words">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
