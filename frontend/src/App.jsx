import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users,
  Target,
  Award,
  DollarSign,
  TrendingUp,
  Activity,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  Calendar,
  Layers,
  Send,
  Workflow,
  CalendarCheck,
  PieChart,
  Tag,
  Settings,
  RefreshCw,
  Clock,
  Mail,
  MousePointer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Sliders,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Info,
  Zap,
  HelpCircle,
  X,
  Plus,
  Trash2,
  Check,
  BarChart2,
  CheckCircle,
  UserCheck,
  UserX,
  Inbox,
  Link2,
  Globe,
  Sparkles,
  Bot,
  Wand2,
  Lightbulb,
  Copy,
  Edit2,
  Save,
  RotateCcw
} from 'lucide-react';

function FenyxLogo({ className = "h-8", showTagline = false }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <div className="flex flex-col justify-center">
        <span className="font-light tracking-[-0.01em] text-[28px] leading-none text-slate-950 font-sans">
          Fenyx
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium mt-1">
            Marketing & Lead Intelligence
          </span>
        )}
      </div>
    </div>
  );
}

const INITIAL_TAG_RULES = [
  { id: 'rule-1', pattern: 'FPF-', matchType: 'startsWith', source: 'Google Event – August 2026', priority: 1, active: true },
  { id: 'rule-2', pattern: 'import', matchType: 'startsWith', source: 'Internal Leads', priority: 2, active: true },
  { id: 'rule-3', pattern: 'GR-', matchType: 'startsWith', source: 'Google Referrals', priority: 3, active: true },
  { id: 'rule-4', pattern: 'GRF-', matchType: 'startsWith', source: 'Growth Review Form – Website', priority: 4, active: true },
  { id: 'rule-5', pattern: 'test-', matchType: 'startsWith', source: 'Test Emails', priority: 5, active: true },
];

const INITIAL_SOURCE_SPEND_DATA = {
  'Google Event – August 2026': 4760.00,
  'Internal Leads': 0.00,
  'Google Referrals': 1420.00,
  'Growth Review Form – Website': 850.00,
  'Test Emails': 0.00,
  'Unattributed': 150.00,
};

const SOURCE_SPEND_DATA = INITIAL_SOURCE_SPEND_DATA;

const generateInitialContacts = () => {
  const contacts = [];
  const firstNames = ['Sarah', 'John', 'Maria', 'David', 'Elena', 'Michael', 'Rachel', 'Alex', 'Sophia', 'James'];
  const lastNames = ['Smith', 'Lee', 'Tan', 'Brown', 'Vargas', 'Miller', 'Davis', 'Chen', 'Johnson', 'Wilson'];
  const companies = ['Apex Cloud Solutions', 'Vanguard Media', 'HyperGrowth AI', 'Nexus Retail', 'Beacon Logistics'];
  const titles = ['VP Marketing', 'Head of Growth', 'CMO', 'Demand Gen Director', 'Marketing Ops Lead'];

  for (let i = 1; i <= 25; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const comp = companies[i % companies.length];
    const title = titles[(i * 7) % titles.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${comp.toLowerCase().replace(/\s+/g, '')}.com`;
    
    contacts.push({
      id: `fallback-${i}`,
      firstName: fn,
      lastName: ln,
      fullName: `${fn} ${ln}`,
      email: email,
      company: comp,
      jobTitle: title,
      dateAdded: '2026-08-15',
      leadStage: i <= 5 ? 'SQL' : i <= 15 ? 'MQL' : 'Lead',
      leadScore: 50,
      emailsReceived: 6,
      broadcastEmails: 4,
      automationEmails: 2,
      emailsOpened: 3,
      linksClicked: 1,
      openRate: 50.0,
      clickRate: 16.7,
      automationsEntered: 1,
      activeAutomations: 0,
      completedAutomations: 1,
      lastAutomationEntered: 'Onboarding Sequence',
      event: 'Google Event – August 2026',
      approvalStatus: 'Approved',
      rsvpStatus: 'Yes',
      attendanceStatus: 'Attended',
      engagementLevel: 'Engaged',
      rawTags: ['FPF-Aug2026', 'Approved', 'MQL'],
      lastActivity: '2026-08-30 02:45 PM',
      lastActivityType: 'Email Opened',
    });
  }
  return contacts;
};

const MOCK_CAMPAIGNS = [
  {
    id: 'camp-101',
    name: 'Growth Audit Invitation – Wave 3',
    dateSent: '2026-08-25',
    recipients: 2481,
    delivered: 2463,
    opens: 1421,
    openRate: 57.7,
    clicks: 214,
    clickRate: 8.7,
    unsubscribes: 6,
    bounces: 18,
    category: 'Nurture',
  },
  {
    id: 'camp-102',
    name: 'Founder Partner Forum: RSVP Confirmation',
    dateSent: '2026-08-18',
    recipients: 127,
    delivered: 127,
    opens: 114,
    openRate: 89.8,
    clicks: 81,
    clickRate: 63.8,
    unsubscribes: 0,
    bounces: 0,
    category: 'Event Confirmation',
  },
  {
    id: 'camp-103',
    name: 'August Executive Briefing Newsletter',
    dateSent: '2026-08-10',
    recipients: 3120,
    delivered: 3090,
    opens: 1358,
    openRate: 43.9,
    clicks: 198,
    clickRate: 6.4,
    unsubscribes: 14,
    bounces: 30,
    category: 'Newsletter',
  }
];

const MOCK_AUTOMATIONS = [
  {
    id: 'auto-201',
    name: 'Growth Audit Follow-up & Booking Sequence',
    entries: 342,
    active: 38,
    completed: 298,
    completionRate: 87.1,
    emailsSent: 1026,
    uniqueOpens: 728,
    uniqueClicks: 215,
    unsubscribes: 4,
    goalConversion: '62.8% Booked',
  },
  {
    id: 'auto-202',
    name: 'Google Event (FPF) Onboarding & Logistics',
    entries: 127,
    active: 0,
    completed: 127,
    completionRate: 100.0,
    emailsSent: 381,
    uniqueOpens: 350,
    uniqueClicks: 112,
    unsubscribes: 0,
    goalConversion: '63.8% RSVP',
  }
];

const INITIAL_LIVE_ACTIVITIES = [
  { id: 'act-1', contact: 'Sarah Smith', time: '12:41 PM', action: 'Entered "Growth Audit Follow-up"', type: 'automation' },
  { id: 'act-2', contact: 'John Lee', time: '12:40 PM', action: 'Clicked "Request a Follow-up"', type: 'click' },
  { id: 'act-3', contact: 'Maria Tan', time: '12:39 PM', action: 'Opened "September Forum Brief"', type: 'open' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [dateRange, setDateRange] = useState('YTD 2026');
  
  const [contacts, setContacts] = useState(generateInitialContacts);
  const [isLiveSource, setIsLiveSource] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [syncError, setSyncError] = useState(null);

  const [tagRules, setTagRules] = useState(INITIAL_TAG_RULES);
  const [sourceSpend, setSourceSpend] = useState(INITIAL_SOURCE_SPEND_DATA);
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [inlineEditingSource, setInlineEditingSource] = useState(null);
  const [inlineSpendValue, setInlineSpendValue] = useState('');
  const [liveActivities, setLiveActivities] = useState(INITIAL_LIVE_ACTIVITIES);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    backendUrl: 'https://fenyx-dashboard.onrender.com',
    status: 'checking',
    accountName: 'ActiveCampaign Live',
    lastSync: 'Syncing...'
  });

  const [leadFilters, setLeadFilters] = useState({
    search: '',
    source: 'All',
    leadStage: 'All',
    engagement: 'All',
    automation: 'All',
    eventStatus: 'All',
    sortField: 'dateAdded',
    sortDirection: 'desc',
  });

  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [campaignCohortFilter, setCampaignCohortFilter] = useState('ALL');
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isTagRulesModalOpen, setIsTagRulesModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ pattern: '', matchType: 'startsWith', source: '', priority: 6 });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiReportType, setAiReportType] = useState('EXECUTIVE');
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  
  const [aiLeadAnalysisLoading, setAiLeadAnalysisLoading] = useState(false);
  const [aiLeadAnalysis, setAiLeadAnalysis] = useState(null);
  const [copiedLeadDraft, setCopiedLeadDraft] = useState(false);

  // Auto-Fetch Contacts from Backend Proxy
  const fetchLiveContacts = useCallback(async (targetUrl = apiConfig.backendUrl) => {
    setIsLoadingLive(true);
    setSyncError(null);
    try {
      const cleanUrl = targetUrl.replace(/\/+$/, '');
      const response = await fetch(`${cleanUrl}/api/contacts`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.contacts && Array.isArray(data.contacts) && data.contacts.length > 0) {
        setContacts(data.contacts);
        setIsLiveSource(true);
        setApiConfig(prev => ({
          ...prev,
          status: 'connected',
          lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
      } else {
        throw new Error('No contact records returned from ActiveCampaign API endpoint');
      }
    } catch (err) {
      console.warn('Could not pull real contacts from backend proxy:', err.message);
      setSyncError(err.message);
      setApiConfig(prev => ({
        ...prev,
        status: 'error',
        lastSync: 'Sync failed (using offline dataset)'
      }));
    } finally {
      setIsLoadingLive(false);
    }
  }, [apiConfig.backendUrl]);

  // Trigger initial fetch on dashboard mount
  useEffect(() => {
    fetchLiveContacts();
  }, [fetchLiveContacts]);

  const callGemini = async (prompt, systemInstruction = "") => {
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    let delay = 1000;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("No content returned from Gemini");
      } catch (err) {
        if (attempt === 2) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const handleGenerateExecutiveBrief = async (type = 'EXECUTIVE', customQuery = '') => {
    setAiAnalysisLoading(true);
    setAiAnalysisResult(null);
    setAiReportType(type);

    const systemPrompt = `You are the Principal Marketing & Revenue Operations Analyst for Fenyx.
Analyze the provided ActiveCampaign lead and marketing data with executive precision.
Structure your insights with clear markdown headings, bullet points, and data-backed recommendations.`;

    const dataSummary = `
2026 Year-to-Date ActiveCampaign Metrics:
- Total Unique Contacts: ${metrics.totalContacts}
- Total MQLs: ${metrics.mqlCount}
- Total SQLs: ${metrics.sqlCount}
- Total Marketing Spend: $${metrics.totalSpend.toFixed(2)}
- Cost per Lead: $${metrics.costPerLead}
- Cost per MQL: $${metrics.costPerMQL}
- Cost per SQL: $${metrics.costPerSQL}

Channel Breakdown:
${metrics.sourceRows.map(r => `- ${r.source}: ${r.leadCount} leads, Spend: $${r.spend}, MQL: ${r.mql}, SQL: ${r.sql}`).join('\n')}
`;

    let prompt = `Provide an executive brief based on these live ActiveCampaign numbers:\n${dataSummary}`;
    if (customQuery) prompt = `${customQuery}\n\nData:\n${dataSummary}`;

    try {
      const responseText = await callGemini(prompt, systemPrompt);
      setAiAnalysisResult(responseText);
    } catch (err) {
      setAiAnalysisResult("Unable to generate AI briefing at this time. Please verify your connection.");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handleGenerateLeadCopilot = async (lead) => {
    if (!lead) return;
    setAiLeadAnalysisLoading(true);
    setAiLeadAnalysis(null);

    const systemPrompt = `You are an elite B2B Account Executive for Fenyx.
Analyze this lead's ActiveCampaign footprint and generate an actionable qualification dossier with a 1-to-1 email draft.`;

    const leadFootprint = `
Lead Profile:
- Name: ${lead.fullName} (${lead.email})
- Company: ${lead.company}
- Stage: ${lead.leadStage} (Score: ${lead.leadScore} pts)
- Tags: ${lead.rawTags.join(', ')}
`;

    try {
      const result = await callGemini(`Analyze lead:\n${leadFootprint}`, systemPrompt);
      setAiLeadAnalysis(result);
    } catch (err) {
      setAiLeadAnalysis("Failed to generate AI lead dossier.");
    } finally {
      setAiLeadAnalysisLoading(false);
    }
  };

  const getContactAttributedSource = (contactTags, rules) => {
    if (!contactTags || contactTags.length === 0) return 'Unattributed';
    const activeRules = [...rules].filter(r => r.active).sort((a, b) => a.priority - b.priority);
    
    const matchedSources = [];
    for (const rule of activeRules) {
      const match = contactTags.some(tag => {
        if (!tag) return false;
        if (rule.matchType === 'startsWith') return tag.toLowerCase().startsWith(rule.pattern.toLowerCase());
        if (rule.matchType === 'contains') return tag.toLowerCase().includes(rule.pattern.toLowerCase());
        if (rule.matchType === 'exact') return tag.toLowerCase() === rule.pattern.toLowerCase();
        return false;
      });
      if (match) matchedSources.push(rule.source);
    }

    if (matchedSources.length > 1) {
      const uniqueSources = [...new Set(matchedSources)];
      if (uniqueSources.length > 1) return 'Multiple Source Identifiers';
      return uniqueSources[0];
    }
    return matchedSources[0] || 'Unattributed';
  };

  const attributedContacts = useMemo(() => {
    return contacts.map(c => ({
      ...c,
      derivedSource: getContactAttributedSource(c.rawTags, tagRules),
    }));
  }, [contacts, tagRules]);

  const metrics = useMemo(() => {
    const totalContacts = attributedContacts.length;
    const mqls = attributedContacts.filter(c => c.leadStage === 'MQL' || c.leadStage === 'SQL');
    const sqls = attributedContacts.filter(c => c.leadStage === 'SQL');
    
    const totalSpend = Object.values(sourceSpend).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
    const costPerMQL = mqls.length > 0 ? (totalSpend / mqls.length).toFixed(2) : '0.00';
    const costPerSQL = sqls.length > 0 ? (totalSpend / sqls.length).toFixed(2) : '0.00';
    const costPerLead = totalContacts > 0 ? (totalSpend / totalContacts).toFixed(2) : '0.00';

    const sourceBuckets = {};
    attributedContacts.forEach(c => {
      const src = c.derivedSource;
      if (!sourceBuckets[src]) {
        sourceBuckets[src] = { count: 0, mql: 0, sql: 0, contacts: [] };
      }
      sourceBuckets[src].count += 1;
      if (c.leadStage === 'MQL' || c.leadStage === 'SQL') sourceBuckets[src].mql += 1;
      if (c.leadStage === 'SQL') sourceBuckets[src].sql += 1;
      sourceBuckets[src].contacts.push(c);
    });

    const sourceRows = Object.entries(sourceBuckets).map(([sourceName, data]) => {
      const spend = parseFloat(sourceSpend[sourceName]) || 0.00;
      const shareOfLeads = totalContacts > 0 ? ((data.count / totalContacts) * 100).toFixed(1) : '0.0';
      const cpl = data.count > 0 ? (spend / data.count).toFixed(2) : '—';
      const cpMql = data.mql > 0 ? (spend / data.mql).toFixed(2) : '—';
      const cpSql = data.sql > 0 ? (spend / data.sql).toFixed(2) : '—';

      return {
        source: sourceName,
        leadCount: data.count,
        shareOfLeads,
        spend,
        cpl,
        mql: data.mql,
        sql: data.sql,
        costPerMql: cpMql,
        costPerSql: cpSql,
      };
    }).sort((a, b) => b.leadCount - a.leadCount);

    const eventApproved = attributedContacts.filter(c => c.approvalStatus === 'Approved');
    const eventWaitlist = attributedContacts.filter(c => c.approvalStatus === 'Waitlist');
    const eventRSVP = attributedContacts.filter(c => c.rsvpStatus === 'Yes');
    const eventAttended = attributedContacts.filter(c => c.attendanceStatus === 'Attended');
    const eventNoShow = attributedContacts.filter(c => c.attendanceStatus === 'No Show');

    return {
      totalContacts,
      mqlCount: mqls.length,
      sqlCount: sqls.length,
      totalSpend,
      costPerMQL,
      costPerSQL,
      costPerLead,
      sourceRows,
      eventStats: {
        totalApplications: totalContacts,
        uniqueEventContacts: attributedContacts.filter(c => c.event).length,
        approved: eventApproved.length,
        waitlist: eventWaitlist.length,
        rejected: attributedContacts.filter(c => c.approvalStatus === 'Rejected').length,
        rsvp: eventRSVP.length,
        attended: eventAttended.length,
        noShow: eventNoShow.length,
      }
    };
  }, [attributedContacts, sourceSpend]);

  const filteredLeads = useMemo(() => {
    return attributedContacts.filter(contact => {
      if (leadFilters.search.trim()) {
        const query = leadFilters.search.toLowerCase();
        const matchSearch =
          contact.fullName.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.company.toLowerCase().includes(query) ||
          contact.rawTags.some(t => t.toLowerCase().includes(query));
        if (!matchSearch) return false;
      }
      if (leadFilters.source !== 'All' && contact.derivedSource !== leadFilters.source) return false;
      if (leadFilters.leadStage !== 'All') {
        if (leadFilters.leadStage === 'MQL') {
          if (contact.leadStage !== 'MQL' && contact.leadStage !== 'SQL') return false;
        } else if (contact.leadStage !== leadFilters.leadStage) return false;
      }
      if (leadFilters.engagement !== 'All' && contact.engagementLevel !== leadFilters.engagement) return false;
      if (leadFilters.eventStatus !== 'All') {
        if (leadFilters.eventStatus === 'Approved' && contact.approvalStatus !== 'Approved') return false;
        if (leadFilters.eventStatus === 'Waitlist' && contact.approvalStatus !== 'Waitlist') return false;
        if (leadFilters.eventStatus === 'Rejected' && contact.approvalStatus !== 'Rejected') return false;
        if (leadFilters.eventStatus === 'RSVP' && contact.rsvpStatus !== 'Yes') return false;
        if (leadFilters.eventStatus === 'Attended' && contact.attendanceStatus !== 'Attended') return false;
        if (leadFilters.eventStatus === 'No Show' && contact.attendanceStatus !== 'No Show') return false;
      }
      return true;
    }).sort((a, b) => {
      let valA = a[leadFilters.sortField];
      let valB = b[leadFilters.sortField];
      if (typeof valA === 'string') {
        return leadFilters.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return leadFilters.sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valB > valA ? 1 : -1);
    });
  }, [attributedContacts, leadFilters]);

  const handleDrilldown = (filterUpdates) => {
    setLeadFilters(prev => ({
      ...prev,
      search: '',
      source: 'All',
      leadStage: 'All',
      engagement: 'All',
      automation: 'All',
      eventStatus: 'All',
      ...filterUpdates,
    }));
    setActiveTab('LEADS');
  };

  const handleUpdateSpend = (sourceName, amount) => {
    const parsed = Math.max(0, parseFloat(amount) || 0);
    setSourceSpend(prev => ({
      ...prev,
      [sourceName]: parsed
    }));
  };

  const handleSaveInlineSpend = (sourceName) => {
    handleUpdateSpend(sourceName, inlineSpendValue);
    setInlineEditingSource(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Top Global Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-4">
          <FenyxLogo className="h-8" />
          <div className="hidden sm:block h-6 w-px bg-slate-200" />
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              ActiveCampaign Intelligence
            </span>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className={`flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                isLiveSource 
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' 
                  : isLoadingLive 
                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                isLiveSource ? 'bg-emerald-500 animate-pulse' : isLoadingLive ? 'bg-amber-500 animate-spin' : 'bg-slate-400'
              }`}></span>
              {isLoadingLive ? 'Connecting...' : isLiveSource ? `Live ActiveCampaign (${contacts.length})` : 'Offline / Standby'}
            </button>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button 
            onClick={() => fetchLiveContacts()}
            disabled={isLoadingLive}
            title="Refresh from ActiveCampaign"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${isLoadingLive ? 'animate-spin' : ''}`} />
            <span>{isLoadingLive ? 'Fetching...' : 'Sync Now'}</span>
          </button>

          <button 
            onClick={() => {
              setIsAiModalOpen(true);
              if (!aiAnalysisResult) handleGenerateExecutiveBrief('EXECUTIVE');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg shadow-xs transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AI Strategist</span>
          </button>

          <button 
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-xs transition"
          >
            <Link2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Connection Manager</span>
          </button>

          <button 
            onClick={() => setIsSpendModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-xs transition"
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            <span>Manage Spend</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: PieChart },
            { id: 'LEADS', label: 'All Leads', icon: Users, badge: metrics.totalContacts },
            { id: 'CAMPAIGNS', label: 'Campaigns', icon: Send, badge: MOCK_CAMPAIGNS.length },
            { id: 'AUTOMATIONS', label: 'Automations', icon: Workflow, badge: MOCK_AUTOMATIONS.length },
            { id: 'EVENTS', label: 'Events', icon: CalendarCheck, badge: metrics.eventStats.approved },
            { id: 'ACQUISITION', label: 'Acquisition / Spend', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-slate-800 text-indigo-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Live sync banner alert */}
        {isLiveSource && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Live ActiveCampaign Connected:</strong> Currently streaming <strong>{contacts.length} real contacts</strong> and tags from your account.
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">Last synced: {apiConfig.lastSync}</span>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div 
                onClick={() => handleDrilldown({})}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">Total Contacts</span>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.totalContacts.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-600 mt-2 font-medium">ActiveCampaign Base</div>
              </div>

              <div 
                onClick={() => handleDrilldown({ leadStage: 'MQL' })}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">MQL</span>
                  <Target className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-indigo-600 tracking-tight">{metrics.mqlCount}</div>
                <div className="text-[11px] text-slate-500 mt-2">Marketing Qualified</div>
              </div>

              <div 
                onClick={() => handleDrilldown({ leadStage: 'SQL' })}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">SQL</span>
                  <Award className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 tracking-tight">{metrics.sqlCount}</div>
                <div className="text-[11px] text-slate-500 mt-2">Sales Ready</div>
              </div>

              <div 
                onClick={() => setActiveTab('ACQUISITION')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">Cost per MQL</span>
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">${metrics.costPerMQL}</div>
                <div className="text-[11px] text-slate-500 mt-2">Spend / MQLs</div>
              </div>

              <div 
                onClick={() => setActiveTab('ACQUISITION')}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-400 cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">Cost per SQL</span>
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">${metrics.costPerSQL}</div>
                <div className="text-[11px] text-slate-500 mt-2">Spend / SQLs</div>
              </div>
            </div>

            {/* Lead Source Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Lead Source Performance</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click any source row to drill down into its contacts.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4 text-right">Lead Count</th>
                      <th className="py-3 px-4 text-right">Share</th>
                      <th className="py-3 px-4 text-right">Spend</th>
                      <th className="py-3 px-4 text-right">CPL</th>
                      <th className="py-3 px-4 text-right">MQL</th>
                      <th className="py-3 px-4 text-right">SQL</th>
                      <th className="py-3 px-4 text-right">Cost / MQL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.sourceRows.map((row) => (
                      <tr 
                        key={row.source}
                        onClick={() => handleDrilldown({ source: row.source })}
                        className="hover:bg-indigo-50/40 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">{row.source}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{row.leadCount}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{row.shareOfLeads}%</td>
                        <td className="py-3 px-4 text-right text-slate-600">${row.spend.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-slate-600">${row.cpl}</td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-600">{row.mql}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-600">{row.sql}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">${row.costPerMql}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'LEADS' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search leads by name, email, company, or ActiveCampaign tag..."
                    value={leadFilters.search}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setLeadFilters({
                    search: '',
                    source: 'All',
                    leadStage: 'All',
                    engagement: 'All',
                    automation: 'All',
                    eventStatus: 'All',
                    sortField: 'dateAdded',
                    sortDirection: 'desc',
                  })}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Filters</span>
                </button>
              </div>

              {/* Multi-Dimensional Filter Dropdowns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Lead Source</label>
                  <select
                    value={leadFilters.source}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Sources</option>
                    <option value="Google Event – August 2026">Google Event (FPF)</option>
                    <option value="Internal Leads">Internal Leads</option>
                    <option value="Google Referrals">Google Referrals</option>
                    <option value="Growth Review Form – Website">Website Form</option>
                    <option value="Unattributed">Unattributed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Lead Stage</label>
                  <select
                    value={leadFilters.leadStage}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, leadStage: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Stages</option>
                    <option value="Lead">Lead</option>
                    <option value="MQL">MQL</option>
                    <option value="SQL">SQL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Engagement</label>
                  <select
                    value={leadFilters.engagement}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, engagement: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Engagement</option>
                    <option value="Engaged">Engaged</option>
                    <option value="Unengaged">Unengaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Automation Status</label>
                  <select
                    value={leadFilters.automation}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, automation: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Automations</option>
                    <option value="Active">Currently in Automation</option>
                    <option value="Completed">Completed Journeys</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Event Status</label>
                  <select
                    value={leadFilters.eventStatus}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, eventStatus: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Event Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Waitlist">Waitlist</option>
                    <option value="Rejected">Rejected</option>
                    <option value="RSVP">RSVP Confirmed</option>
                    <option value="Attended">Attended</option>
                    <option value="No Show">No Show</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Showing <strong>{filteredLeads.length}</strong> of {attributedContacts.length} contacts</span>
                <span className="text-[11px]">Click any contact for complete 360° lead dossier</span>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[640px]">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 sticky top-0 z-20 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Company</th>
                      <th className="py-3 px-3">Source Attribution</th>
                      <th className="py-3 px-3 text-center">Stage</th>
                      <th className="py-3 px-3 text-center">Score</th>
                      <th className="py-3 px-3 text-center">Emails Rcvd</th>
                      <th className="py-3 px-3 text-center">Opens</th>
                      <th className="py-3 px-3 text-center">Clicks</th>
                      <th className="py-3 px-3 text-center">Automations</th>
                      <th className="py-3 px-3 text-center">Event Status</th>
                      <th className="py-3 px-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((contact) => (
                      <tr
                        key={contact.id}
                        onClick={() => setSelectedLead(contact)}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{contact.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{contact.email}</div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{contact.company}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {contact.derivedSource}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            contact.leadStage === 'SQL' ? 'bg-emerald-100 text-emerald-800' :
                            contact.leadStage === 'MQL' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {contact.leadStage}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-800">{contact.leadScore}</td>
                        
                        {/* Emails Received with Broadcast vs Automation breakdown */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-bold text-slate-900">{contact.emailsReceived || 0}</div>
                          <div className="text-[10px] text-slate-400">
                            {contact.broadcastEmails || 0} bcast / {contact.automationEmails || 0} auto
                          </div>
                        </td>

                        {/* Opens & Open Rate */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-medium text-indigo-700">{contact.emailsOpened || 0}</div>
                          <div className="text-[10px] text-slate-400">{contact.openRate || 0}%</div>
                        </td>

                        {/* Clicks & Click Rate */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-medium text-emerald-700">{contact.linksClicked || 0}</div>
                          <div className="text-[10px] text-slate-400">{contact.clickRate || 0}%</div>
                        </td>

                        {/* Automations entered and active status */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-medium text-slate-800">{contact.automationsEntered || 0} entered</div>
                          <div className="text-[10px]">
                            {contact.activeAutomations > 0 ? (
                              <span className="text-amber-600 font-semibold">{contact.activeAutomations} Active</span>
                            ) : (
                              <span className="text-emerald-600 font-medium">{contact.completedAutomations || 0} done</span>
                            )}
                          </div>
                        </td>

                        {/* Event Attendance Status */}
                        <td className="py-2.5 px-3 text-center">
                          {contact.approvalStatus ? (
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                contact.approvalStatus === 'Approved' ? 'bg-purple-100 text-purple-700' :
                                contact.approvalStatus === 'Waitlist' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {contact.approvalStatus}
                              </span>
                              {contact.attendanceStatus && (
                                <div className="text-[10px] text-slate-500 mt-0.5">{contact.attendanceStatus}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right text-indigo-600 font-medium hover:underline">
                          View Dossier →
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === 'CAMPAIGNS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Campaign Name</th>
                    <th className="py-3 px-4">Date Sent</th>
                    <th className="py-3 px-4 text-right">Recipients</th>
                    <th className="py-3 px-4 text-right">Opens</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_CAMPAIGNS.map(camp => (
                    <tr key={camp.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{camp.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{camp.dateSent}</td>
                      <td className="py-3.5 px-4 text-right">{camp.recipients}</td>
                      <td className="py-3.5 px-4 text-right text-indigo-600 font-semibold">{camp.openRate}%</td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-semibold">{camp.clickRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUTOMATIONS TAB */}
        {activeTab === 'AUTOMATIONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_AUTOMATIONS.map(auto => (
              <div key={auto.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-slate-900">{auto.name}</h3>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">Entries: {auto.entries}</div>
                  <div className="p-2 bg-amber-50 text-amber-800 rounded-lg">Active: {auto.active}</div>
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">Done: {auto.completed}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'EVENTS' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Google Event — August 2026</h2>
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-slate-500">Approved</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.eventStats.approved}</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="text-amber-700">RSVP Confirmed</div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{metrics.eventStats.rsvp}</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="text-emerald-700">Attended</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">{metrics.eventStats.attended}</div>
              </div>
            </div>
          </div>
        )}

        {/* ACQUISITION / SPEND TAB */}
        {activeTab === 'ACQUISITION' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Marketing Spend</th>
                    <th className="py-3 px-4 text-right">Leads</th>
                    <th className="py-3 px-4 text-right">Cost / Lead</th>
                    <th className="py-3 px-4 text-right">Cost / MQL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.sourceRows.map(r => (
                    <tr key={r.source} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{r.source}</td>
                      <td className="py-3.5 px-4 text-right font-medium">${r.spend.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right">{r.leadCount}</td>
                      <td className="py-3.5 px-4 text-right">${r.cpl}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-600">${r.costPerMql}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* LEAD PROFILE MODAL */}
      {selectedLead && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedLead.fullName}</h2>
                <p className="text-xs font-mono text-slate-500">{selectedLead.email}</p>
                <div className="text-xs text-slate-600 mt-1">{selectedLead.company}</div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <button
                onClick={() => handleGenerateLeadCopilot(selectedLead)}
                disabled={aiLeadAnalysisLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{aiLeadAnalysisLoading ? 'Analyzing...' : 'Generate AI Dossier & Outreach Draft'}</span>
              </button>

              {aiLeadAnalysis && (
                <div className="p-4 bg-slate-50 rounded-xl border border-indigo-100 whitespace-pre-line text-slate-700 leading-relaxed">
                  {aiLeadAnalysis}
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 mb-2">ActiveCampaign Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.rawTags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-1 rounded font-mono text-slate-700 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedLead(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTION & SYNC MANAGER MODAL */}
      {isConnectModalOpen && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">ActiveCampaign Connection</h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Backend Proxy URL</label>
                <input
                  type="text"
                  value={apiConfig.backendUrl}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, backendUrl: e.target.value }))}
                  className="w-full p-2.5 font-mono bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Live Status</span>
                  <span className={`font-semibold ${isLiveSource ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isLiveSource ? '200 OK (Live Connected)' : 'Standby / Error'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Contacts</span>
                  <span className="font-bold text-slate-800">{contacts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Sync</span>
                  <span className="text-slate-800">{apiConfig.lastSync}</span>
                </div>
              </div>

              {syncError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
                  <strong>Sync Warning:</strong> {syncError}. (Free tier instances on Render spin down after inactivity; clicking "Sync Now" will wake the server up).
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
              <button
                onClick={() => fetchLiveContacts(apiConfig.backendUrl)}
                disabled={isLoadingLive}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition"
              >
                {isLoadingLive ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
