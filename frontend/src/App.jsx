import React, { useState, useMemo, useEffect } from 'react';
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
      {/* Pure, elegant Fenyx wordmark matching the brand typography */}
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

// Backwards-compatible alias to prevent undefined reference errors
const SOURCE_SPEND_DATA = INITIAL_SOURCE_SPEND_DATA;

const generateInitialContacts = () => {
  const contacts = [];
  const firstNames = ['Sarah', 'John', 'Maria', 'David', 'Elena', 'Michael', 'Rachel', 'Alex', 'Sophia', 'James', 'Emily', 'Marcus', 'Chloe', 'Daniel', 'Liam', 'Olivia', 'Ethan', 'Zoe', 'William', 'Ava'];
  const lastNames = ['Smith', 'Lee', 'Tan', 'Brown', 'Vargas', 'Miller', 'Davis', 'Chen', 'Johnson', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez'];
  const companies = ['Apex Cloud Solutions', 'Vanguard Media', 'HyperGrowth AI', 'Nexus Retail', 'Beacon Logistics', 'Summit Health', 'Pulse Fintech', 'Horizon Tech', 'Kinetix Labs', 'Solaris Energy'];
  const titles = ['VP Marketing', 'Head of Growth', 'CMO', 'Demand Gen Director', 'Marketing Ops Lead', 'CEO & Founder', 'Product Marketing Manager', 'VP Operations', 'Revenue Officer'];

  // Total unique contacts = 628. Total MQL = 357. Total SQL = 2.
  // Google Event applications: 730 total submissions, 502 unique contacts
  for (let i = 1; i <= 628; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const comp = companies[i % companies.length];
    const title = titles[(i * 7) % titles.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 35 ? i : ''}@${comp.toLowerCase().replace(/\s+/g, '')}.com`;
    
    let rawTags = [];
    let leadStage = 'Lead';
    let eventStatus = null;
    let rsvpStatus = null;
    let attendanceStatus = null;
    let eventName = null;

    if (i <= 127) {
      leadStage = (i === 1 || i === 2) ? 'SQL' : 'MQL';
      eventStatus = 'Approved';
      eventName = 'Google Event – August 2026';
      rawTags.push('FPF-Aug2026', 'FPF-Approved', 'MQL');
      if (leadStage === 'SQL') rawTags.push('SQL', 'Sales-Qualified');
      
      if (i <= 81) {
        rsvpStatus = 'Yes';
        rawTags.push('FPF-RSVP');
        if (i <= 60) {
          attendanceStatus = 'Attended';
          rawTags.push('FPF-Attended');
        } else {
          attendanceStatus = 'No Show';
          rawTags.push('FPF-NoShow');
        }
      } else {
        rsvpStatus = 'No';
      }
    } else if (i <= 127 + 230) {
      leadStage = 'MQL';
      eventStatus = 'Waitlist';
      eventName = 'Google Event – August 2026';
      rawTags.push('FPF-Aug2026', 'FPF-Waitlist', 'MQL');
      rsvpStatus = 'Pending';
    } else if (i <= 502) {
      leadStage = 'Lead';
      eventStatus = 'Rejected';
      eventName = 'Google Event – August 2026';
      rawTags.push('FPF-Aug2026', 'FPF-Rejected');
    } else if (i <= 550) {
      leadStage = (i % 7 === 0) ? 'MQL' : 'Lead';
      rawTags.push(`import-2026-batch${(i % 3) + 1}`);
      if (leadStage === 'MQL') rawTags.push('MQL');
    } else if (i <= 600) {
      leadStage = (i % 5 === 0) ? 'MQL' : 'Lead';
      rawTags.push('GR-Partner-Network');
      if (leadStage === 'MQL') rawTags.push('MQL');
    } else if (i <= 620) {
      leadStage = (i % 3 === 0) ? 'MQL' : 'Lead';
      rawTags.push('GRF-Website-Audit');
      if (leadStage === 'MQL') rawTags.push('MQL');
    } else {
      leadStage = 'Lead';
      rawTags.push('test-internal-qa');
    }

    const broadcastEmails = Math.floor((i * 7) % 10) + 2;
    const automationEmails = Math.floor((i * 5) % 8) + 1;
    const emailsReceived = broadcastEmails + automationEmails;
    const emailsOpened = Math.min(emailsReceived, Math.floor(emailsReceived * (0.35 + (i % 50) / 100)));
    const linksClicked = Math.min(emailsOpened, Math.floor(emailsOpened * (0.18 + (i % 30) / 100)));
    const openRate = emailsReceived > 0 ? ((emailsOpened / emailsReceived) * 100).toFixed(1) : '0.0';
    const clickRate = emailsReceived > 0 ? ((linksClicked / emailsReceived) * 100).toFixed(1) : '0.0';

    const automationsEntered = (i % 4 === 0) ? 3 : (i % 2 === 0) ? 2 : 1;
    const activeAutomations = (i % 3 === 0) ? 1 : 0;
    const completedAutomations = automationsEntered - activeAutomations;

    let engagementLevel = 'Never Opened';
    if (emailsOpened >= 6 || linksClicked >= 2) engagementLevel = 'Highly Engaged';
    else if (emailsOpened >= 1) engagementLevel = 'Engaged';
    else if (emailsReceived > 0) engagementLevel = 'Unengaged';

    const month = (i % 8) + 1;
    const day = (i % 28) + 1;
    const dateAdded = `2026-0${month < 10 ? month : month}-${day < 10 ? '0' + day : day}`;

    contacts.push({
      id: `ac-${10000 + i}`,
      firstName: fn,
      lastName: ln,
      fullName: `${fn} ${ln}`,
      email: email,
      company: comp,
      jobTitle: title,
      dateAdded: dateAdded,
      leadStage: leadStage,
      leadScore: Math.floor(emailsOpened * 4 + linksClicked * 10 + (leadStage === 'SQL' ? 85 : leadStage === 'MQL' ? 40 : 10)),
      utmSource: i <= 502 ? 'google' : i <= 550 ? 'internal' : i <= 600 ? 'referral' : 'organic',
      utmMedium: i <= 502 ? 'event' : i <= 550 ? 'database' : 'web',
      utmCampaign: i <= 502 ? 'founder-partner-forum' : 'q2-nurture',
      emailsReceived,
      broadcastEmails,
      automationEmails,
      emailsOpened,
      linksClicked,
      openRate: parseFloat(openRate),
      clickRate: parseFloat(clickRate),
      lastEmailReceived: '2026-08-28 09:30 AM',
      lastEmailOpened: emailsOpened > 0 ? '2026-08-29 11:15 AM' : '—',
      lastClick: linksClicked > 0 ? '2026-08-29 11:18 AM' : '—',
      automationsEntered,
      activeAutomations,
      completedAutomations,
      lastAutomationEntered: automationsEntered > 0 ? 'Growth Audit Sequence' : '—',
      event: eventName,
      approvalStatus: eventStatus,
      rsvpStatus: rsvpStatus,
      attendanceStatus: attendanceStatus,
      engagementLevel,
      rawTags: rawTags,
      lastActivity: '2026-08-30 02:45 PM',
      lastActivityType: linksClicked > 0 ? 'Link Clicked' : emailsOpened > 0 ? 'Email Opened' : 'Email Received',
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
  },
  {
    id: 'camp-104',
    name: 'Q3 Enterprise Demand Gen Playbook Release',
    dateSent: '2026-07-28',
    recipients: 1950,
    delivered: 1935,
    opens: 980,
    openRate: 50.6,
    clicks: 165,
    clickRate: 8.5,
    unsubscribes: 5,
    bounces: 15,
    category: 'Content Asset',
  },
  {
    id: 'camp-105',
    name: 'Google Event Waitlist Exclusive Access',
    dateSent: '2026-08-05',
    recipients: 230,
    delivered: 228,
    opens: 172,
    openRate: 75.4,
    clicks: 64,
    clickRate: 28.1,
    unsubscribes: 1,
    bounces: 2,
    category: 'Event Waitlist',
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
  },
  {
    id: 'auto-203',
    name: 'Waitlist Lead Nurture & Re-engagement',
    entries: 230,
    active: 65,
    completed: 165,
    completionRate: 71.7,
    emailsSent: 690,
    uniqueOpens: 440,
    uniqueClicks: 88,
    unsubscribes: 3,
    goalConversion: '21.3% Activated',
  },
  {
    id: 'auto-204',
    name: 'High-Intent Content Download Autoresponder',
    entries: 415,
    active: 22,
    completed: 393,
    completionRate: 94.7,
    emailsSent: 830,
    uniqueOpens: 580,
    uniqueClicks: 175,
    unsubscribes: 2,
    goalConversion: '34.0% Inbound',
  }
];

const INITIAL_LIVE_ACTIVITIES = [
  { id: 'act-1', contact: 'Sarah Smith', time: '12:41 PM', action: 'Entered "Growth Audit Follow-up"', type: 'automation' },
  { id: 'act-2', contact: 'John Lee', time: '12:40 PM', action: 'Clicked "Request a Follow-up"', type: 'click' },
  { id: 'act-3', contact: 'Maria Tan', time: '12:39 PM', action: 'Opened "September Forum Brief"', type: 'open' },
  { id: 'act-4', contact: 'David Brown', time: '12:38 PM', action: 'Contact created via ActiveCampaign API', type: 'contact' },
  { id: 'act-5', contact: 'Elena Vargas', time: '12:31 PM', action: 'Tag added "FPF-RSVP"', type: 'tag' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [dateRange, setDateRange] = useState('YTD 2026');
  
  const [contacts, setContacts] = useState(generateInitialContacts);
  const [tagRules, setTagRules] = useState(INITIAL_TAG_RULES);
  const [sourceSpend, setSourceSpend] = useState(INITIAL_SOURCE_SPEND_DATA);
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [inlineEditingSource, setInlineEditingSource] = useState(null);
  const [inlineSpendValue, setInlineSpendValue] = useState('');
  const [liveActivities, setLiveActivities] = useState(INITIAL_LIVE_ACTIVITIES);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Connection Manager state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    backendUrl: 'http://localhost:5000',
    status: 'connected',
    accountName: 'fenyx-marketing.api-us1.com',
    lastSync: 'Just now'
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
  
  // Lead-specific AI Copilot state
  const [aiLeadAnalysisLoading, setAiLeadAnalysisLoading] = useState(false);
  const [aiLeadAnalysis, setAiLeadAnalysis] = useState(null);
  const [copiedLeadDraft, setCopiedLeadDraft] = useState(false);

  // Gemini API Caller with Exponential Backoff
  const callGemini = async (prompt, systemInstruction = "") => {
    const apiKey = ""; // Canvas provides the key at runtime
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
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("No text content returned from Gemini");
      } catch (err) {
        if (attempt === 2) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  // Generate Executive Intelligence Briefing
  const handleGenerateExecutiveBrief = async (type = 'EXECUTIVE', customQuery = '') => {
    setAiAnalysisLoading(true);
    setAiAnalysisResult(null);
    setAiReportType(type);

    const systemPrompt = `You are the Principal Marketing & Revenue Operations Analyst for Fenyx.
Analyze the provided ActiveCampaign lead and marketing data with executive precision.
Structure your insights with clear markdown headings, bullet points, and data-backed recommendations.
Highlight unit economics (CPL, Cost per MQL, Cost per SQL), conversion bottlenecks, and specific high-ROI action items.`;

    const dataSummary = `
2026 Year-to-Date ActiveCampaign Metrics:
- Total Unique Contacts: ${metrics.totalContacts}
- Total MQLs: ${metrics.mqlCount} (${((metrics.mqlCount / metrics.totalContacts) * 100).toFixed(1)}% of total leads)
- Total SQLs: ${metrics.sqlCount}
- Total Marketing Spend: $${metrics.totalSpend.toFixed(2)}
- Cost per Lead: $${metrics.costPerLead}
- Cost per MQL: $${metrics.costPerMQL}
- Cost per SQL: $${metrics.costPerSQL}

Channel Breakdown:
${metrics.sourceRows.map(r => `- ${r.source}: ${r.leadCount} leads (${r.shareOfLeads}%), Spend: $${r.spend}, MQL: ${r.mql}, SQL: ${r.sql}, Cost/MQL: $${r.costPerMql}`).join('\n')}

Google Event (Founder Partner Forum - Aug 2026):
- Form Applications: ${metrics.eventStats.totalApplications}
- Unique AC Contacts: ${metrics.eventStats.uniqueEventContacts}
- Approved: ${metrics.eventStats.approved}
- Waitlist: ${metrics.eventStats.waitlist}
- RSVP Confirmed: ${metrics.eventStats.rsvp} (${((metrics.eventStats.rsvp / metrics.eventStats.approved) * 100).toFixed(1)}% conversion)
- Attended: ${metrics.eventStats.attended} (${((metrics.eventStats.attended / metrics.eventStats.rsvp) * 100).toFixed(1)}% of RSVP)
- No Shows: ${metrics.eventStats.noShow}

Campaigns summary:
${MOCK_CAMPAIGNS.map(c => `- ${c.name}: ${c.recipients} sent, ${c.openRate}% open rate, ${c.clickRate}% CTR`).join('\n')}
`;

    let prompt = "";
    if (type === 'EXECUTIVE') {
      prompt = `Provide a high-level executive strategic briefing on these 2026 YTD marketing results. Identify top-performing channels, quantify acquisition efficiencies (especially Google Event vs others), highlight the funnel leak between RSVPs and Attendance, and recommend 3 tactical priorities to accelerate SQL conversions.\n\nData:\n${dataSummary}`;
    } else if (type === 'BUDGET') {
      prompt = `Conduct a capital allocation audit. Assess which channels are underpriced or overpriced based on Cost per MQL and Cost per SQL. Suggest specific budget shifts for Q4 to maximize qualified sales pipeline.\n\nData:\n${dataSummary}`;
    } else if (type === 'FUNNEL') {
      prompt = `Analyze the marketing and event conversion funnel. Provide a root-cause breakdown of the drop-offs from Contact -> MQL -> SQL, and from Event Approved (127) -> RSVP (81) -> Attended (60). Propose automated nurture triggers to reduce the 21 No Shows.\n\nData:\n${dataSummary}`;
    } else if (type === 'CUSTOM' && customQuery) {
      prompt = `Answer this specific strategic question based on our ActiveCampaign marketing metrics:\n"${customQuery}"\n\nData Context:\n${dataSummary}`;
    }

    try {
      const responseText = await callGemini(prompt, systemPrompt);
      setAiAnalysisResult(responseText);
    } catch (err) {
      setAiAnalysisResult("Unable to generate AI briefing at this moment. Please verify your connection and try again.");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // Generate Individual Lead Dossier & Personalized Sales Outreach
  const handleGenerateLeadCopilot = async (lead) => {
    if (!lead) return;
    setAiLeadAnalysisLoading(true);
    setAiLeadAnalysis(null);

    const systemPrompt = `You are an elite B2B Account Executive and Sales Intelligence Copilot for Fenyx.
Analyze this specific ActiveCampaign lead's behavioral footprint and create an actionable qualification dossier along with a tailored, highly personalized 1-to-1 outreach email.
Keep the email natural, concise, and non-salesy, referencing their specific engagement history without sounding creepy.`;

    const leadFootprint = `
Lead Profile:
- Name: ${lead.fullName} (${lead.email})
- Company: ${lead.company}
- Job Title: ${lead.jobTitle}
- Lead Stage: ${lead.leadStage} (Score: ${lead.leadScore} pts)
- Attributed Source: ${lead.derivedSource}
- Event Status: ${lead.approvalStatus || 'None'} (RSVP: ${lead.rsvpStatus || 'N/A'}, Attendance: ${lead.attendanceStatus || 'N/A'})
- Date Added: ${lead.dateAdded}

Email Behavior:
- Total Emails Received: ${lead.emailsReceived} (${lead.broadcastEmails} broadcasts, ${lead.automationEmails} automated drips)
- Opens: ${lead.emailsOpened} (${lead.openRate}% open rate)
- Clicks: ${lead.linksClicked} (${lead.clickRate}% CTR)
- Engagement Classification: ${lead.engagementLevel}
- Last Activity: ${lead.lastActivityType} (${lead.lastActivity})

Automations:
- Automations Entered: ${lead.automationsEntered}
- Active in Automations: ${lead.activeAutomations > 0 ? 'Yes' : 'No'}
- Completed Automations: ${lead.completedAutomations}

ActiveCampaign Tags:
${lead.rawTags.join(', ')}
`;

    const prompt = `Please generate:
1. **Qualification & Intent Assessment**: 2-3 bullet points analyzing their buying readiness, intent signals, and potential risks based on their engagement metrics.
2. **Recommended Next Play**: The exact next step our sales or marketing team should take with ${lead.firstName}.
3. **Personalized 1-to-1 Outreach Email Draft**: Include Subject Line and Body tailored to their title at ${lead.company}, their specific event/automation journey, and a low-friction call-to-action.

Lead Data:
${leadFootprint}`;

    try {
      const result = await callGemini(prompt, systemPrompt);
      setAiLeadAnalysis(result);
    } catch (err) {
      setAiLeadAnalysis("Failed to generate AI lead dossier. Please try again.");
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
    const totalContacts = attributedContacts.length; // 628
    const mqls = attributedContacts.filter(c => c.leadStage === 'MQL' || c.leadStage === 'SQL'); // 357
    const sqls = attributedContacts.filter(c => c.leadStage === 'SQL'); // 2
    
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
      const shareOfLeads = ((data.count / totalContacts) * 100).toFixed(1);
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
        totalApplications: 730,
        uniqueEventContacts: 502,
        approved: eventApproved.length,
        waitlist: eventWaitlist.length,
        rejected: 373,
        rsvp: eventRSVP.length,
        attended: eventAttended.length,
        noShow: eventNoShow.length,
      }
    };
  }, [attributedContacts, sourceSpend]);

  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      const sampleActions = [
        { action: 'Opened "Growth Audit Follow-up #2"', type: 'open' },
        { action: 'Clicked link "View 2026 Benchmarks PDF"', type: 'click' },
        { action: 'Entered automation "Founder Partner Forum Onboarding"', type: 'automation' },
        { action: 'Updated ActiveCampaign tag to "SQL"', type: 'tag' },
      ];
      const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
      const randomAction = sampleActions[Math.floor(Math.random() * sampleActions.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setLiveActivities(prev => [
        {
          id: `act-${Date.now()}`,
          contact: randomContact.fullName,
          time: timeStr,
          action: randomAction.action,
          type: randomAction.type,
        },
        ...prev.slice(0, 6)
      ]);
    }, 8000);
    return () => clearInterval(interval);
  }, [isLiveStreaming, contacts]);

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
      if (leadFilters.automation !== 'All') {
        if (leadFilters.automation === 'Currently in Automation' && contact.activeAutomations === 0) return false;
        if (leadFilters.automation === 'Completed Automation' && contact.completedAutomations === 0) return false;
        if (leadFilters.automation === 'Never Entered' && contact.automationsEntered > 0) return false;
      }
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

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.pattern || !newRule.source) return;
    const rule = {
      id: `rule-${Date.now()}`,
      pattern: newRule.pattern,
      matchType: newRule.matchType,
      source: newRule.source,
      priority: parseInt(newRule.priority, 10) || 10,
      active: true,
    };
    setTagRules(prev => [...prev, rule]);
    setNewRule({ pattern: '', matchType: 'startsWith', source: '', priority: tagRules.length + 2 });
  };

  const toggleRule = (id) => {
    setTagRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id) => {
    setTagRules(prev => prev.filter(r => r.id !== id));
  };

  const handleProcessImport = (textData) => {
    if (!textData || !textData.trim()) return;

    try {
      const lines = textData.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setImportNotification({ type: 'error', message: 'The sheet data must contain at least a header row and 1 data row.' });
        return;
      }

      // Detect delimiter: tab (from direct copy-paste from Google Sheets) or comma
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      
      const splitRow = (row) => {
        if (delimiter === '\t') return row.split('\t').map(s => s.trim().replace(/^["']|["']$/g, ''));
        // Standard CSV split handling quotes
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const matches = [];
        let match;
        while ((match = regex.exec(row))) {
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
          matches.push(val.trim());
          if (regex.lastIndex >= row.length) break;
        }
        return matches.length > 0 ? matches : row.split(',').map(s => s.trim());
      };

      const headers = splitRow(firstLine).map(h => h.toLowerCase());
      
      // Check if this sheet is a Spend / Channel summary sheet
      const isSpendSheet = headers.some(h => h.includes('spend') || h.includes('cost') || h.includes('budget')) &&
                           headers.some(h => h.includes('source') || h.includes('channel') || h.includes('campaign'));

      if (isSpendSheet) {
        const sourceIdx = headers.findIndex(h => h.includes('source') || h.includes('channel') || h.includes('campaign'));
        const spendIdx = headers.findIndex(h => h.includes('spend') || h.includes('cost') || h.includes('budget'));
        
        const newSpendData = { ...sourceSpend };
        let updatedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cells = splitRow(lines[i]);
          if (cells[sourceIdx]) {
            const rawVal = cells[spendIdx] ? cells[spendIdx].replace(/[$,]/g, '') : '0';
            const num = parseFloat(rawVal) || 0;
            newSpendData[cells[sourceIdx]] = num;
            updatedCount++;
          }
        }

        setSourceSpend(newSpendData);
        setImportNotification({ 
          type: 'success', 
          message: `Successfully imported spend data for ${updatedCount} marketing channels from your sheet!` 
        });
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportNotification(null);
          setImportRawText('');
        }, 1800);
        return;
      }

      // Otherwise, parse as Contact / Lead data
      const col = {
        name: headers.findIndex(h => h.includes('name') && !h.includes('company')),
        firstName: headers.findIndex(h => h.includes('first')),
        lastName: headers.findIndex(h => h.includes('last')),
        email: headers.findIndex(h => h.includes('email') || h.includes('mail')),
        company: headers.findIndex(h => h.includes('company') || h.includes('organization') || h.includes('account')),
        title: headers.findIndex(h => h.includes('title') || h.includes('role') || h.includes('position')),
        stage: headers.findIndex(h => h.includes('stage') || h.includes('qualification') || h.includes('status') && !h.includes('rsvp') && !h.includes('attend')),
        source: headers.findIndex(h => h.includes('source') || h.includes('utm_source') || h.includes('origin')),
        tags: headers.findIndex(h => h.includes('tag')),
        score: headers.findIndex(h => h.includes('score')),
        emailsRcvd: headers.findIndex(h => h.includes('received') || h.includes('sent') || h.includes('emails')),
        opens: headers.findIndex(h => h.includes('open')),
        clicks: headers.findIndex(h => h.includes('click')),
        eventStatus: headers.findIndex(h => h.includes('event') || h.includes('approval')),
        rsvp: headers.findIndex(h => h.includes('rsvp')),
        attendance: headers.findIndex(h => h.includes('attend')),
      };

      const parsedContacts = [];

      for (let i = 1; i < lines.length; i++) {
        const cells = splitRow(lines[i]);
        if (!cells || cells.length === 0 || !cells.some(c => c.length > 0)) continue;

        let emailVal = col.email !== -1 ? cells[col.email] : `contact-${i}@imported-sheet.com`;
        let fullNameVal = col.name !== -1 ? cells[col.name] : '';
        let fn = col.firstName !== -1 ? cells[col.firstName] : '';
        let ln = col.lastName !== -1 ? cells[col.lastName] : '';

        if (!fullNameVal && (fn || ln)) {
          fullNameVal = `${fn} ${ln}`.trim();
        } else if (fullNameVal && !fn) {
          const parts = fullNameVal.split(' ');
          fn = parts[0] || 'Lead';
          ln = parts.slice(1).join(' ') || '';
        } else if (!fullNameVal) {
          fullNameVal = `Imported Lead ${i}`;
          fn = 'Lead';
          ln = `${i}`;
        }

        const compVal = col.company !== -1 && cells[col.company] ? cells[col.company] : 'Enterprise Partner';
        const titleVal = col.title !== -1 && cells[col.title] ? cells[col.title] : 'Executive';
        
        // Tags parsing
        let rawTags = [];
        if (col.tags !== -1 && cells[col.tags]) {
          rawTags = cells[col.tags].split(/[,;|]/).map(t => t.trim()).filter(Boolean);
        }

        // Determine Stage
        let rawStage = col.stage !== -1 && cells[col.stage] ? cells[col.stage].toUpperCase() : '';
        let leadStage = 'Lead';
        if (rawStage.includes('SQL') || rawTags.some(t => t.toLowerCase() === 'sql')) leadStage = 'SQL';
        else if (rawStage.includes('MQL') || rawTags.some(t => t.toLowerCase() === 'mql')) leadStage = 'MQL';
        else if (rawTags.some(t => t.toLowerCase().includes('approved') || t.toLowerCase().includes('waitlist'))) leadStage = 'MQL';

        // Event & RSVP
        const appStatus = col.eventStatus !== -1 && cells[col.eventStatus] ? cells[col.eventStatus] : 
          rawTags.some(t => t.toLowerCase().includes('approved')) ? 'Approved' :
          rawTags.some(t => t.toLowerCase().includes('waitlist')) ? 'Waitlist' : null;

        const rsvpStatus = col.rsvp !== -1 && cells[col.rsvp] ? cells[col.rsvp] : 
          rawTags.some(t => t.toLowerCase().includes('rsvp')) ? 'Yes' : null;

        const attStatus = col.attendance !== -1 && cells[col.attendance] ? cells[col.attendance] : 
          rawTags.some(t => t.toLowerCase().includes('attended')) ? 'Attended' :
          rawTags.some(t => t.toLowerCase().includes('noshow') || t.toLowerCase().includes('no show')) ? 'No Show' : null;

        const emailsRec = col.emailsRcvd !== -1 ? parseInt(cells[col.emailsRcvd], 10) || 5 : 6;
        const opens = col.opens !== -1 ? parseInt(cells[col.opens], 10) || Math.floor(emailsRec * 0.4) : Math.floor(emailsRec * 0.4);
        const clicks = col.clicks !== -1 ? parseInt(cells[col.clicks], 10) || (opens > 0 ? 1 : 0) : 1;
        const openRate = emailsRec > 0 ? ((opens / emailsRec) * 100).toFixed(1) : '0.0';
        const clickRate = emailsRec > 0 ? ((clicks / emailsRec) * 100).toFixed(1) : '0.0';

        parsedContacts.push({
          id: `sheet-${i}-${Date.now()}`,
          firstName: fn,
          lastName: ln,
          fullName: fullNameVal,
          email: emailVal,
          company: compVal,
          jobTitle: titleVal,
          dateAdded: '2026-08-31',
          leadStage: leadStage,
          leadScore: col.score !== -1 ? parseInt(cells[col.score], 10) || 45 : (leadStage === 'SQL' ? 90 : leadStage === 'MQL' ? 45 : 15),
          utmSource: col.source !== -1 ? cells[col.source] : 'google-sheet',
          utmMedium: 'imported',
          utmCampaign: 'sheet-sync',
          emailsReceived: emailsRec,
          broadcastEmails: Math.max(1, emailsRec - 2),
          automationEmails: Math.min(2, emailsRec),
          emailsOpened: opens,
          linksClicked: clicks,
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          lastEmailReceived: '2026-08-30 10:00 AM',
          lastEmailOpened: opens > 0 ? '2026-08-30 11:30 AM' : '—',
          lastClick: clicks > 0 ? '2026-08-30 11:35 AM' : '—',
          automationsEntered: 1,
          activeAutomations: 0,
          completedAutomations: 1,
          lastAutomationEntered: 'Google Event Onboarding',
          event: appStatus ? 'Google Event – August 2026' : null,
          approvalStatus: appStatus,
          rsvpStatus: rsvpStatus,
          attendanceStatus: attStatus,
          engagementLevel: opens >= 4 ? 'Highly Engaged' : opens >= 1 ? 'Engaged' : 'Unengaged',
          rawTags: rawTags.length > 0 ? rawTags : ['FPF-Aug2026', leadStage],
          lastActivity: '2026-08-31 04:15 PM',
          lastActivityType: clicks > 0 ? 'Link Clicked' : opens > 0 ? 'Email Opened' : 'Email Received',
        });
      }

      if (parsedContacts.length > 0) {
        setContacts(parsedContacts);
        setImportNotification({ 
          type: 'success', 
          message: `Successfully loaded ${parsedContacts.length} contacts from your Google Sheet into the dashboard!` 
        });
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportNotification(null);
          setImportRawText('');
          setActiveTab('LEADS');
        }, 1800);
      } else {
        setImportNotification({ type: 'error', message: 'Could not extract valid records. Please verify headers in your sheet.' });
      }
    } catch (err) {
      setImportNotification({ type: 'error', message: `Import error: ${err.message}` });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setImportRawText(content);
      handleProcessImport(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Top Global Header with Fenyx Branding */}
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
              className="flex items-center text-[11px] text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 transition cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              Live Synced
            </button>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
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
            <span>Connect AC API</span>
          </button>

          <button 
            onClick={() => setIsTagRulesModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-xs transition"
          >
            <Tag className="h-3.5 w-3.5 text-indigo-600" />
            <span>Tag Rules ({tagRules.filter(r => r.active).length})</span>
          </button>

          <button 
            onClick={() => setIsSpendModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-xs transition"
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            <span>Manage Spend</span>
          </button>

          <button 
            onClick={() => setIsArchModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-xs transition"
          >
            <Database className="h-3.5 w-3.5 text-blue-600" />
            <span>ETL Architecture</span>
          </button>

          <div className="flex items-center bg-white rounded-lg border border-slate-300 px-2.5 py-1 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-500 mr-2" />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="YTD 2026">2026 Year to Date</option>
            </select>
          </div>

          <button 
            onClick={() => setIsLiveStreaming(prev => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition shadow-xs ${
              isLiveStreaming 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLiveStreaming ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>{isLiveStreaming ? 'Live' : 'Paused'}</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Header */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: PieChart },
            { id: 'LEADS', label: 'All Leads', icon: Users, badge: metrics.totalContacts },
            { id: 'CAMPAIGNS', label: 'Campaigns', icon: Send, badge: MOCK_CAMPAIGNS.length },
            { id: 'AUTOMATIONS', label: 'Automations', icon: Workflow, badge: MOCK_AUTOMATIONS.length },
            { id: 'EVENTS', label: 'Events (Aug 2026)', icon: CalendarCheck, badge: metrics.eventStats.approved },
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

        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            
            {/* Executive Summary Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white via-slate-50 to-indigo-50/40 p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">Fenyx Executive Dashboard</span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">2026 Year to Date Marketing Summary</h1>
                <p className="text-xs text-slate-500 mt-1">
                  ActiveCampaign unified contacts, lead qualification cohorts, and marketing unit economics.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setIsAiModalOpen(true);
                    handleGenerateExecutiveBrief('EXECUTIVE');
                  }}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>AI Briefing</span>
                </button>
                <button
                  onClick={() => handleDrilldown({ leadStage: 'MQL' })}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1"
                >
                  <span>Drill into 357 MQLs</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              
              {/* Total Contacts */}
              <div 
                onClick={() => handleDrilldown({})}
                className="bg-white hover:bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition group shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">Total Contacts</span>
                  <Users className="h-4 w-4 text-blue-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.totalContacts.toLocaleString()}</div>
                <div className="flex items-center text-[11px] text-emerald-600 mt-2 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  <span>Single Source of Truth</span>
                </div>
              </div>

              {/* MQL */}
              <div 
                onClick={() => handleDrilldown({ leadStage: 'MQL' })}
                className="bg-white hover:bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition group shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">MQL</span>
                  <Target className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-2xl font-bold text-indigo-600 tracking-tight">{metrics.mqlCount}</div>
                <div className="text-[11px] text-slate-500 mt-2">
                  {((metrics.mqlCount / metrics.totalContacts) * 100).toFixed(1)}% of total leads
                </div>
              </div>

              {/* SQL */}
              <div 
                onClick={() => handleDrilldown({ leadStage: 'SQL' })}
                className="bg-white hover:bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition group shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">SQL</span>
                  <Award className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 tracking-tight">{metrics.sqlCount}</div>
                <div className="text-[11px] text-slate-500 mt-2">Sales pipeline ready</div>
              </div>

              {/* Cost per MQL */}
              <div 
                onClick={() => setActiveTab('ACQUISITION')}
                className="bg-white hover:bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer transition group shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">Cost per MQL</span>
                  <DollarSign className="h-4 w-4 text-amber-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">${metrics.costPerMQL}</div>
                <div className="text-[11px] text-slate-500 mt-2">Spend / 357 MQLs</div>
              </div>

              {/* Cost per SQL */}
              <div 
                onClick={() => setActiveTab('ACQUISITION')}
                className="bg-white hover:bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-teal-400 cursor-pointer transition group shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-medium">Cost per SQL</span>
                  <TrendingUp className="h-4 w-4 text-teal-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">${metrics.costPerSQL}</div>
                <div className="text-[11px] text-slate-500 mt-2">Spend / 2 SQLs</div>
              </div>

            </div>

            {/* Lead Source Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center">
                    <span>Lead Source Performance</span>
                    <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal">
                      Dynamically Attributed via Tags
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any source row to immediately drill into the underlying contacts.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsSpendModalOpen(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Spend</span>
                  </button>
                  <button
                    onClick={() => setIsTagRulesModalOpen(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Configure Attribution Rules</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4 text-right">Lead Count</th>
                      <th className="py-3 px-4 text-right">Share of Leads</th>
                      <th className="py-3 px-4 text-right">Spend</th>
                      <th className="py-3 px-4 text-right">Cost / Lead</th>
                      <th className="py-3 px-4 text-right">MQL</th>
                      <th className="py-3 px-4 text-right">SQL</th>
                      <th className="py-3 px-4 text-right">Cost / MQL</th>
                      <th className="py-3 px-4 text-right">Cost / SQL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.sourceRows.map((row) => (
                      <tr 
                        key={row.source}
                        onClick={() => handleDrilldown({ source: row.source })}
                        className="hover:bg-indigo-50/40 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                          <span>{row.source}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{row.leadCount}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{row.shareOfLeads}%</td>
                        <td className="py-3 px-4 text-right text-slate-600">${row.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{row.cpl !== '—' ? `$${row.cpl}` : '—'}</td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-600">{row.mql}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-600">{row.sql}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{row.costPerMql !== '—' ? `$${row.costPerMql}` : '—'}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{row.costPerSql !== '—' ? `$${row.costPerSql}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200">
                    <tr>
                      <td className="py-3 px-4">Total</td>
                      <td className="py-3 px-4 text-right">{metrics.totalContacts}</td>
                      <td className="py-3 px-4 text-right">100.0%</td>
                      <td className="py-3 px-4 text-right">${metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right">${metrics.costPerLead}</td>
                      <td className="py-3 px-4 text-right text-indigo-600">{metrics.mqlCount}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">{metrics.sqlCount}</td>
                      <td className="py-3 px-4 text-right">${metrics.costPerMQL}</td>
                      <td className="py-3 px-4 text-right">${metrics.costPerSQL}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Interactive Marketing Funnel */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Interactive Marketing Funnel</h3>
                    <p className="text-xs text-slate-500">Full lifecycle conversion from raw contact to event attendance.</p>
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    Click stage to filter
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { stage: 'Contacts', count: 628, prevCount: 628, color: 'bg-slate-800', filter: {} },
                    { stage: 'Leads', count: 628, prevCount: 628, color: 'bg-blue-600', filter: { leadStage: 'Lead' } },
                    { stage: 'MQL', count: 357, prevCount: 628, color: 'bg-indigo-600', filter: { leadStage: 'MQL' } },
                    { stage: 'SQL', count: 2, prevCount: 357, color: 'bg-emerald-600', filter: { leadStage: 'SQL' } },
                    { stage: 'Event Approved', count: 127, prevCount: 357, color: 'bg-purple-600', filter: { eventStatus: 'Approved' } },
                    { stage: 'RSVP Confirmed', count: 81, prevCount: 127, color: 'bg-amber-600', filter: { eventStatus: 'RSVP' } },
                    { stage: 'Attended Event', count: 60, prevCount: 81, color: 'bg-teal-600', filter: { eventStatus: 'Attended' } },
                  ].map((step, idx) => {
                    const pctOfMax = ((step.count / 628) * 100).toFixed(0);
                    const convFromPrev = idx === 0 ? '100%' : `${((step.count / step.prevCount) * 100).toFixed(1)}%`;

                    return (
                      <div
                        key={step.stage}
                        onClick={() => handleDrilldown(step.filter)}
                        className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
                      >
                        <div className="w-36 flex-shrink-0">
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                            {step.stage}
                          </span>
                          <div className="text-[11px] text-slate-500">
                            {idx > 0 && <span className="text-emerald-600 font-medium">{convFromPrev} from prev</span>}
                          </div>
                        </div>

                        <div className="flex-1 mx-4">
                          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
                            <div
                              className={`${step.color} h-3.5 rounded-full transition-all duration-500 group-hover:opacity-90`}
                              style={{ width: `${Math.max(Number(pctOfMax), 4)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="w-24 text-right flex-shrink-0">
                          <span className="text-xs font-bold text-slate-900">{step.count}</span>
                          <span className="text-[11px] text-slate-500 block">({pctOfMax}% of total)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Activity Component */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <h3 className="text-sm font-semibold text-slate-900">Live Activity Feed</h3>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">Webhook Stream</span>
                  </div>

                  <div className="divide-y divide-slate-100 mt-3 space-y-2">
                    {liveActivities.map((act) => (
                      <div key={act.id} className="pt-2 flex items-start space-x-2.5">
                        <div className="mt-0.5 p-1 rounded bg-slate-100 text-slate-600">
                          {act.type === 'open' && <Mail className="h-3 w-3 text-blue-500" />}
                          {act.type === 'click' && <MousePointer className="h-3 w-3 text-purple-500" />}
                          {act.type === 'automation' && <Zap className="h-3 w-3 text-amber-500" />}
                          {act.type === 'contact' && <Users className="h-3 w-3 text-emerald-500" />}
                          {act.type === 'tag' && <Tag className="h-3 w-3 text-indigo-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            <span className="font-semibold text-slate-900">{act.contact}</span> {act.action}
                          </p>
                          <span className="text-[10px] text-slate-500">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Deduplicated in PostgreSQL</span>
                  <span className="text-emerald-600 font-medium">100% Delivery Sync</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= LEADS TAB ================= */}
        {activeTab === 'LEADS' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search leads by name, email, company, or ActiveCampaign tag..."
                    value={leadFilters.search}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Clear Filters Button */}
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
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset Filters</span>
                </button>
              </div>

              {/* Filter Selects Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                
                {/* Source Filter */}
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
                    <option value="Test Emails">Test Emails</option>
                    <option value="Multiple Source Identifiers">Multiple Source Conflicts</option>
                  </select>
                </div>

                {/* Lead Stage Filter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Lead Stage</label>
                  <select
                    value={leadFilters.leadStage}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, leadStage: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Stages</option>
                    <option value="Lead">Lead</option>
                    <option value="MQL">MQL (Marketing Qualified)</option>
                    <option value="SQL">SQL (Sales Qualified)</option>
                  </select>
                </div>

                {/* Engagement Filter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Engagement Level</label>
                  <select
                    value={leadFilters.engagement}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, engagement: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Levels</option>
                    <option value="Highly Engaged">Highly Engaged</option>
                    <option value="Engaged">Engaged</option>
                    <option value="Unengaged">Unengaged</option>
                    <option value="Never Opened">Never Opened</option>
                  </select>
                </div>

                {/* Automation Filter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Automation Status</label>
                  <select
                    value={leadFilters.automation}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, automation: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Automations</option>
                    <option value="Currently in Automation">Currently Active</option>
                    <option value="Completed Automation">Completed Journey</option>
                    <option value="Never Entered">Never Entered</option>
                  </select>
                </div>

                {/* Event Status Filter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Event Status</label>
                  <select
                    value={leadFilters.eventStatus}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, eventStatus: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="All">All Event Statuses</option>
                    <option value="Approved">Approved (127)</option>
                    <option value="Waitlist">Waitlist (230)</option>
                    <option value="Rejected">Rejected (373)</option>
                    <option value="RSVP">RSVP Confirmed (81)</option>
                    <option value="Attended">Attended (60)</option>
                    <option value="No Show">No Show (21)</option>
                  </select>
                </div>

              </div>

              {/* Status counter */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Showing <strong>{filteredLeads.length}</strong> of {attributedContacts.length} contacts</span>
                <span className="text-[11px]">Click any row for complete 360° lead dossier</span>
              </div>
            </div>

            {/* Comprehensive Leads Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[640px]">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 sticky top-0 z-20 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Company & Title</th>
                      <th className="py-3 px-3">Source Attribution</th>
                      <th className="py-3 px-3 text-center">Stage</th>
                      <th className="py-3 px-3 text-center">Score</th>
                      <th className="py-3 px-3 text-center">Emails Rcvd</th>
                      <th className="py-3 px-3 text-center">Opens</th>
                      <th className="py-3 px-3 text-center">Clicks</th>
                      <th className="py-3 px-3 text-center">Automations</th>
                      <th className="py-3 px-3 text-center">Event Status</th>
                      <th className="py-3 px-3">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((contact) => (
                      <tr
                        key={contact.id}
                        onClick={() => setSelectedLead(contact)}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        {/* Contact Name & Email */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{contact.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{contact.email}</div>
                        </td>

                        {/* Company & Title */}
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{contact.company}</div>
                          <div className="text-[11px] text-slate-500">{contact.jobTitle}</div>
                        </td>

                        {/* Source Attribution */}
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {contact.derivedSource}
                          </span>
                        </td>

                        {/* Stage */}
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            contact.leadStage === 'SQL' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : contact.leadStage === 'MQL' 
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {contact.leadStage}
                          </span>
                        </td>

                        {/* Lead Score */}
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                          {contact.leadScore}
                        </td>

                        {/* Emails Received */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-semibold text-slate-900">{contact.emailsReceived}</div>
                          <div className="text-[10px] text-slate-400">
                            {contact.broadcastEmails} bcast / {contact.automationEmails} auto
                          </div>
                        </td>

                        {/* Opens & Open Rate */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-medium text-slate-800">{contact.emailsOpened}</div>
                          <div className="text-[10px] text-slate-400">{contact.openRate}%</div>
                        </td>

                        {/* Clicks */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-medium text-slate-800">{contact.linksClicked}</div>
                          <div className="text-[10px] text-slate-400">{contact.clickRate}%</div>
                        </td>

                        {/* Automations */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-medium text-slate-800">{contact.automationsEntered} entered</div>
                          <div className="text-[10px] text-slate-400">
                            {contact.activeAutomations > 0 ? (
                              <span className="text-amber-600 font-medium">1 Active</span>
                            ) : (
                              `${contact.completedAutomations} done`
                            )}
                          </div>
                        </td>

                        {/* Event Attendance / Status */}
                        <td className="py-2.5 px-3 text-center">
                          {contact.approvalStatus ? (
                            <div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                contact.approvalStatus === 'Approved' ? 'bg-purple-100 text-purple-700' :
                                contact.approvalStatus === 'Waitlist' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-700'
                              }`}>
                                {contact.approvalStatus}
                              </span>
                              {contact.attendanceStatus && (
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {contact.attendanceStatus}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Last Activity */}
                        <td className="py-2.5 px-3">
                          <div className="text-[11px] font-medium text-slate-800">{contact.lastActivityType}</div>
                          <div className="text-[10px] text-slate-500">{contact.lastActivity}</div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= CAMPAIGNS TAB ================= */}
        {activeTab === 'CAMPAIGNS' && (
          <div className="space-y-5">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">ActiveCampaign Broadcast Analytics</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Campaign delivery rates, engagement metrics, and individual recipient audit trails.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                  {MOCK_CAMPAIGNS.length} Sent Campaigns
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Campaign Name</th>
                      <th className="py-3 px-4">Date Sent</th>
                      <th className="py-3 px-4 text-right">Recipients</th>
                      <th className="py-3 px-4 text-right">Delivered</th>
                      <th className="py-3 px-4 text-right">Opens</th>
                      <th className="py-3 px-4 text-right">Open Rate</th>
                      <th className="py-3 px-4 text-right">Clicks</th>
                      <th className="py-3 px-4 text-right">Click Rate</th>
                      <th className="py-3 px-4 text-right">Unsubscribes</th>
                      <th className="py-3 px-4 text-right">Bounces</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_CAMPAIGNS.map((camp) => (
                      <tr 
                        key={camp.id}
                        onClick={() => { setSelectedCampaign(camp); setCampaignCohortFilter('ALL'); }}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center space-x-2">
                            <Send className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{camp.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal ml-5">{camp.category}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{camp.dateSent}</td>
                        <td className="py-3.5 px-4 text-right font-medium">{camp.recipients.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right text-slate-600">{camp.delivered.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800">{camp.opens.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-indigo-600">{camp.openRate}%</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800">{camp.clicks.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{camp.clickRate}%</td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{camp.unsubscribes}</td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{camp.bounces}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campaign Modal / Detailed Drilldown */}
            {selectedCampaign && (
              <div className="bg-slate-900/40 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
                  <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-indigo-600 tracking-wider">Campaign Drill-down</span>
                      <h3 className="text-lg font-bold text-slate-900">{selectedCampaign.name}</h3>
                      <p className="text-xs text-slate-500">Sent on {selectedCampaign.dateSent} • {selectedCampaign.category}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedCampaign(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="p-5 border-b border-slate-200 grid grid-cols-3 sm:grid-cols-6 gap-3 text-center bg-white">
                    <div 
                      onClick={() => setCampaignCohortFilter('ALL')}
                      className={`p-2.5 rounded-lg cursor-pointer border transition ${campaignCohortFilter === 'ALL' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-xs text-slate-500">Delivered</div>
                      <div className="text-base font-bold text-slate-900">{selectedCampaign.delivered}</div>
                    </div>
                    <div 
                      onClick={() => setCampaignCohortFilter('OPENED')}
                      className={`p-2.5 rounded-lg cursor-pointer border transition ${campaignCohortFilter === 'OPENED' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-xs text-slate-500">Opens</div>
                      <div className="text-base font-bold text-indigo-600">{selectedCampaign.opens}</div>
                      <div className="text-[10px] text-slate-400">{selectedCampaign.openRate}%</div>
                    </div>
                    <div 
                      onClick={() => setCampaignCohortFilter('CLICKED')}
                      className={`p-2.5 rounded-lg cursor-pointer border transition ${campaignCohortFilter === 'CLICKED' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-xs text-slate-500">Clicks</div>
                      <div className="text-base font-bold text-emerald-600">{selectedCampaign.clicks}</div>
                      <div className="text-[10px] text-slate-400">{selectedCampaign.clickRate}%</div>
                    </div>
                    <div 
                      onClick={() => setCampaignCohortFilter('NOT_OPENED')}
                      className={`p-2.5 rounded-lg cursor-pointer border transition ${campaignCohortFilter === 'NOT_OPENED' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-xs text-slate-500">Did Not Open</div>
                      <div className="text-base font-bold text-slate-700">{selectedCampaign.delivered - selectedCampaign.opens}</div>
                    </div>
                    <div 
                      onClick={() => setCampaignCohortFilter('UNSUBSCRIBED')}
                      className={`p-2.5 rounded-lg cursor-pointer border transition ${campaignCohortFilter === 'UNSUBSCRIBED' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-xs text-slate-500">Unsubscribed</div>
                      <div className="text-base font-bold text-slate-700">{selectedCampaign.unsubscribes}</div>
                    </div>
                    <div 
                      onClick={() => setCampaignCohortFilter('BOUNCED')}
                      className={`p-2.5 rounded-lg cursor-pointer border transition ${campaignCohortFilter === 'BOUNCED' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-xs text-slate-500">Bounced</div>
                      <div className="text-base font-bold text-slate-700">{selectedCampaign.bounces}</div>
                    </div>
                  </div>

                  {/* Recipient list for campaign */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">
                      Recipients ({campaignCohortFilter === 'ALL' ? 'All Sample Leads' : campaignCohortFilter})
                    </h4>
                    <div className="space-y-2">
                      {attributedContacts.slice(0, 15).map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => { setSelectedLead(c); setSelectedCampaign(null); }}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-indigo-50/40 cursor-pointer transition text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{c.fullName}</span>
                            <span className="text-slate-500 font-mono ml-2">({c.email})</span>
                          </div>
                          <div className="flex items-center space-x-3 text-slate-500">
                            <span>Stage: <strong className="text-slate-800">{c.leadStage}</strong></span>
                            <span className="text-indigo-600 hover:underline">View Dossier →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= AUTOMATIONS TAB ================= */}
        {activeTab === 'AUTOMATIONS' && (
          <div className="space-y-5">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">ActiveCampaign Automation Performance</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Monitors distinct contact journeys, drop-offs, and goal conversions across automated funnels.
                </p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg font-medium">
                {MOCK_AUTOMATIONS.length} Active Automations Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_AUTOMATIONS.map((auto) => (
                <div 
                  key={auto.id}
                  onClick={() => setSelectedAutomation(auto)}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition shadow-xs group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                        Sequence ID: {auto.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition">
                        {auto.name}
                      </h3>
                    </div>
                    <Zap className="h-5 w-5 text-amber-500 group-hover:scale-110 transition" />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                    <div>
                      <div className="text-xs text-slate-500">Entries</div>
                      <div className="text-base font-bold text-slate-900">{auto.entries}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Active</div>
                      <div className="text-base font-bold text-amber-600">{auto.active}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Completed</div>
                      <div className="text-base font-bold text-emerald-600">{auto.completed}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Rate</div>
                      <div className="text-base font-bold text-indigo-600">{auto.completionRate}%</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Goal: <strong className="text-slate-800">{auto.goalConversion}</strong></span>
                    <span className="text-indigo-600 group-hover:underline flex items-center">
                      <span>View Contacts</span>
                      <ChevronRight className="h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Automation Contacts Modal */}
            {selectedAutomation && (
              <div className="bg-slate-900/40 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
                  <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-indigo-600 tracking-wider">Automation Details</span>
                      <h3 className="text-lg font-bold text-slate-900">{selectedAutomation.name}</h3>
                      <p className="text-xs text-slate-500">Goal: {selectedAutomation.goalConversion} • {selectedAutomation.completionRate}% Completion Rate</p>
                    </div>
                    <button 
                      onClick={() => setSelectedAutomation(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-5 border-b border-slate-200 grid grid-cols-4 gap-3 text-center bg-white">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500">Total Entries</div>
                      <div className="text-base font-bold text-slate-900">{selectedAutomation.entries}</div>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg">
                      <div className="text-xs text-amber-700">Currently Active</div>
                      <div className="text-base font-bold text-amber-700">{selectedAutomation.active}</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg">
                      <div className="text-xs text-emerald-700">Completed</div>
                      <div className="text-base font-bold text-emerald-700">{selectedAutomation.completed}</div>
                    </div>
                    <div className="p-2.5 bg-indigo-50 rounded-lg">
                      <div className="text-xs text-indigo-700">Emails Sent</div>
                      <div className="text-base font-bold text-indigo-700">{selectedAutomation.emailsSent}</div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">Contacts in this Automation</h4>
                    <div className="space-y-2">
                      {attributedContacts.filter(c => c.automationsEntered > 0).slice(0, 12).map((c, i) => (
                        <div 
                          key={c.id}
                          onClick={() => { setSelectedLead(c); setSelectedAutomation(null); }}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{c.fullName}</span>
                            <span className="text-slate-500 font-mono ml-2">({c.email})</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${i % 3 === 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {i % 3 === 0 ? 'Active in Step 2' : 'Completed Journey'}
                            </span>
                            <span className="text-indigo-600 font-medium">Profile →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= EVENTS TAB ================= */}
        {activeTab === 'EVENTS' && (
          <div className="space-y-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase text-purple-600">Event Intelligence</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Google Event — August 2026 (Founder Partner Forum)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distinguishing <strong>730 Total Event Applications</strong> from <strong>628 Unique ActiveCampaign Contacts</strong>.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-medium">
                  Total Spend: ${metrics.sourceRows.find(r => r.source.includes('Google Event'))?.spend.toFixed(2) || '4,760.00'}
                </span>
              </div>
            </div>

            {/* Event Metrics Callout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Total Applications (Form Submissions)</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.eventStats.totalApplications}</div>
                <div className="text-[11px] text-slate-500 mt-1">Gross registrations in tracker</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Unique Deduplicated Contacts in AC</div>
                <div className="text-2xl font-bold text-indigo-600 mt-1">{metrics.eventStats.uniqueEventContacts}</div>
                <div className="text-[11px] text-slate-500 mt-1">Tagged with FPF-* in ActiveCampaign</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Cost per MQL (Google Event)</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  ${((sourceSpend['Google Event – August 2026'] || 4760.00) / 357).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ${(sourceSpend['Google Event – August 2026'] || 4760.00).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spend / 357 approved+waitlist MQLs
                </div>
              </div>
            </div>

            {/* Event Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Table 1: Lead Status & Cost per MQL */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-900">Lead Status Cohorts</h3>
                  <p className="text-xs text-slate-500">Based on Google Event application review and qualification.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Lead Count</th>
                        <th className="py-2.5 px-4 text-right">MQL</th>
                        <th className="py-2.5 px-4 text-right">Cost / MQL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr 
                        onClick={() => handleDrilldown({ eventStatus: 'Approved' })}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-emerald-700 flex items-center space-x-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Approved</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">127</td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-600">127</td>
                        <td className="py-3 px-4 text-right text-slate-900">$37.48</td>
                      </tr>
                      <tr 
                        onClick={() => handleDrilldown({ eventStatus: 'Waitlist' })}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-amber-700 flex items-center space-x-2">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Waitlist</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">230</td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-600">230</td>
                        <td className="py-3 px-4 text-right text-slate-900">$20.70</td>
                      </tr>
                      <tr 
                        onClick={() => handleDrilldown({ eventStatus: 'Rejected' })}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-rose-700 flex items-center space-x-2">
                          <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          <span>Rejected</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">373</td>
                        <td className="py-3 px-4 text-right text-slate-400">—</td>
                        <td className="py-3 px-4 text-right text-slate-400">—</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <tr>
                        <td className="py-3 px-4">TOTAL</td>
                        <td className="py-3 px-4 text-right">730</td>
                        <td className="py-3 px-4 text-right text-indigo-600">357</td>
                        <td className="py-3 px-4 text-right">$13.33</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Table 2: Event Attendance Conversion */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-900">Event Attendance Funnel</h3>
                  <p className="text-xs text-slate-500">Attendance and drop-off conversion among approved attendees.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Stage</th>
                        <th className="py-2.5 px-4 text-right">Count</th>
                        <th className="py-2.5 px-4 text-right">Conversion</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr 
                        onClick={() => handleDrilldown({ eventStatus: 'Approved' })}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">Approved</td>
                        <td className="py-3 px-4 text-right font-bold">127</td>
                        <td className="py-3 px-4 text-right text-slate-500">—</td>
                        <td className="py-3 px-4 text-right text-indigo-600 hover:underline">Drill down →</td>
                      </tr>
                      <tr 
                        onClick={() => handleDrilldown({ eventStatus: 'RSVP' })}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-amber-700">RSVP Confirmed</td>
                        <td className="py-3 px-4 text-right font-bold">81</td>
                        <td className="py-3 px-4 text-right text-amber-700 font-semibold">63.8% of Approved</td>
                        <td className="py-3 px-4 text-right text-indigo-600 hover:underline">Drill down →</td>
                      </tr>
                      <tr 
                        onClick={() => handleDrilldown({ eventStatus: 'Attended' })}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-emerald-700">Attended</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">60</td>
                        <td className="py-3 px-4 text-right text-emerald-700 font-semibold">74.1% of RSVP</td>
                        <td className="py-3 px-4 text-right text-indigo-600 hover:underline">Drill down →</td>
                      </tr>
                      <tr 
                        onClick={() => handleDrilldown({ eventStatus: 'No Show' })}
                        className="hover:bg-indigo-50/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-semibold text-rose-700">No Show</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600">21</td>
                        <td className="py-3 px-4 text-right text-rose-700 font-semibold">25.9% of RSVP</td>
                        <td className="py-3 px-4 text-right text-indigo-600 hover:underline">Drill down →</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= ACQUISITION / SPEND TAB ================= */}
        {activeTab === 'ACQUISITION' && (
          <div className="space-y-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase text-emerald-600">Marketing Economics</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acquisition & Marketing Spend Audit</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unit economic efficiency: Cost per Lead, Cost per MQL, and Cost per SQL across all marketing initiatives.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSpendModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Edit2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Edit All Spend</span>
                </button>
                <div className="text-right pl-4 border-l border-slate-200">
                  <span className="text-xs text-slate-500">Total 2026 YTD Spend</span>
                  <div className="text-2xl font-bold text-slate-900">${metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* KPI overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">Total Leads</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{metrics.totalContacts}</div>
                <div className="text-[11px] text-slate-400 mt-1">Unique AC records</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">Cost Per Lead (CPL)</div>
                <div className="text-xl font-bold text-slate-900 mt-1">${metrics.costPerLead}</div>
                <div className="text-[11px] text-slate-400 mt-1">Blended across all channels</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">Cost Per MQL</div>
                <div className="text-xl font-bold text-indigo-600 mt-1">${metrics.costPerMQL}</div>
                <div className="text-[11px] text-slate-400 mt-1">{metrics.mqlCount} total MQLs</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">Cost Per SQL</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">${metrics.costPerSQL}</div>
                <div className="text-[11px] text-slate-400 mt-1">{metrics.sqlCount} total SQLs</div>
              </div>
            </div>

            {/* Spend Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Source Economics & Spend Distribution</h3>
                  <p className="text-xs text-slate-500">Click the pencil icon on any row to edit its spend amount inline.</p>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                  Live Unit Economics Recalculation
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Channel / Source</th>
                      <th className="py-3 px-4 text-right">Marketing Spend</th>
                      <th className="py-3 px-4 text-right">Leads Acquired</th>
                      <th className="py-3 px-4 text-right">Cost per Lead</th>
                      <th className="py-3 px-4 text-right">MQL</th>
                      <th className="py-3 px-4 text-right">SQL</th>
                      <th className="py-3 px-4 text-right">Cost / MQL</th>
                      <th className="py-3 px-4 text-right">Cost / SQL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.sourceRows.map((r) => (
                      <tr 
                        key={r.source}
                        className="hover:bg-indigo-50/50 transition group"
                      >
                        <td 
                          onClick={() => handleDrilldown({ source: r.source })}
                          className="py-3.5 px-4 font-semibold text-slate-900 cursor-pointer hover:text-indigo-600"
                        >
                          {r.source}
                        </td>
                        
                        {/* Inline Editable Spend Cell */}
                        <td className="py-3.5 px-4 text-right font-medium">
                          {inlineEditingSource === r.source ? (
                            <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-slate-400">$</span>
                              <input
                                type="number"
                                step="any"
                                autoFocus
                                value={inlineSpendValue}
                                onChange={(e) => setInlineSpendValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineSpend(r.source);
                                  if (e.key === 'Escape') setInlineEditingSource(null);
                                }}
                                className="w-24 p-1 text-right text-xs bg-white border border-indigo-400 rounded outline-none font-semibold text-slate-900"
                              />
                              <button
                                onClick={() => handleSaveInlineSpend(r.source)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Save"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setInlineEditingSource(null)}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end space-x-1.5">
                              <span className="font-semibold text-slate-900">
                                ${r.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInlineEditingSource(r.source);
                                  setInlineSpendValue(r.spend.toString());
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                                title="Edit Spend"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td onClick={() => handleDrilldown({ source: r.source })} className="py-3.5 px-4 text-right font-medium text-slate-800 cursor-pointer">{r.leadCount}</td>
                        <td onClick={() => handleDrilldown({ source: r.source })} className="py-3.5 px-4 text-right text-slate-600 cursor-pointer">{r.cpl !== '—' ? `$${r.cpl}` : '—'}</td>
                        <td onClick={() => handleDrilldown({ source: r.source })} className="py-3.5 px-4 text-right font-semibold text-indigo-600 cursor-pointer">{r.mql}</td>
                        <td onClick={() => handleDrilldown({ source: r.source })} className="py-3.5 px-4 text-right font-semibold text-emerald-600 cursor-pointer">{r.sql}</td>
                        <td onClick={() => handleDrilldown({ source: r.source })} className="py-3.5 px-4 text-right font-semibold text-slate-900 cursor-pointer">{r.costPerMql !== '—' ? `$${r.costPerMql}` : '—'}</td>
                        <td onClick={() => handleDrilldown({ source: r.source })} className="py-3.5 px-4 text-right font-semibold text-slate-900 cursor-pointer">{r.costPerSql !== '—' ? `$${r.costPerSql}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ================= 360° LEAD DETAIL MODAL ================= */}
      {selectedLead && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-slate-900">{selectedLead.fullName}</h2>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    selectedLead.leadStage === 'SQL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    selectedLead.leadStage === 'MQL' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedLead.leadStage}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedLead.email}</p>
                <div className="text-xs text-slate-600 mt-2">
                  <strong>{selectedLead.jobTitle}</strong> at <strong>{selectedLead.company}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Dossier Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* AI Lead Intelligence & Outreach Drafter */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Gemini AI Sales Intelligence & Outreach Drafter
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Evaluates lead signals, qualification triggers, and drafts 1-to-1 executive messaging
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateLeadCopilot(selectedLead)}
                    disabled={aiLeadAnalysisLoading}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    <Wand2 className={`h-3.5 w-3.5 ${aiLeadAnalysisLoading ? 'animate-spin' : ''}`} />
                    <span>{aiLeadAnalysisLoading ? 'Analyzing...' : aiLeadAnalysis ? 'Regenerate' : 'Generate AI Dossier'}</span>
                  </button>
                </div>

                {aiLeadAnalysisLoading && (
                  <div className="p-4 rounded-lg bg-white/80 border border-indigo-100 flex items-center space-x-3 text-xs text-indigo-800">
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>Gemini is synthesizing email engagement rates, automations, and tags for {selectedLead.fullName}...</span>
                  </div>
                )}

                {aiLeadAnalysis && !aiLeadAnalysisLoading && (
                  <div className="mt-3 p-4 bg-white rounded-xl border border-indigo-100 shadow-xs text-xs text-slate-800 space-y-3">
                    <div className="prose prose-xs max-w-none whitespace-pre-line text-slate-700 leading-relaxed font-sans">
                      {aiLeadAnalysis}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">Model: gemini-3-flash-preview • Live ActiveCampaign Signals</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiLeadAnalysis);
                          setCopiedLeadDraft(true);
                          setTimeout(() => setCopiedLeadDraft(false), 2000);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                      >
                        {copiedLeadDraft ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-slate-500" />
                            <span>Copy Analysis & Draft</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Attribution & Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Attributed Source</span>
                  <span className="font-semibold text-slate-800">{selectedLead.derivedSource}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date Added to ActiveCampaign</span>
                  <span className="font-semibold text-slate-800">{selectedLead.dateAdded}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lead Score</span>
                  <span className="font-semibold text-slate-800">{selectedLead.leadScore} pts</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Event Registration</span>
                  <span className="font-semibold text-slate-800">{selectedLead.event || 'None'}</span>
                </div>
              </div>

              {/* Email Activity Stats */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">Email Engagement Audit</h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Emails Received</span>
                    <span className="text-xl font-bold text-slate-900">{selectedLead.emailsReceived}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {selectedLead.broadcastEmails} bcast / {selectedLead.automationEmails} auto
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Opens</span>
                    <span className="text-xl font-bold text-indigo-600">{selectedLead.emailsOpened}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{selectedLead.openRate}% rate</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Clicks</span>
                    <span className="text-xl font-bold text-emerald-600">{selectedLead.linksClicked}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{selectedLead.clickRate}% rate</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Status</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">{selectedLead.engagementLevel}</span>
                  </div>
                </div>
              </div>

              {/* Automation Journeys */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">ActiveCampaign Automation Journeys</h4>
                  <span className="text-xs text-slate-500">
                    {selectedLead.automationsEntered} distinct automations entered
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">Growth Audit Follow-up & Booking</div>
                      <div className="text-[11px] text-slate-500">Entered Aug 12, 2026</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedLead.activeAutomations > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedLead.activeAutomations > 0 ? 'Currently Active (Step 3)' : 'Completed (Aug 19)'}
                    </span>
                  </div>
                  {selectedLead.automationsEntered > 1 && (
                    <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">Founder Partner Forum Onboarding</div>
                        <div className="text-[11px] text-slate-500">Entered Aug 03, 2026</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed (Aug 10)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preserved Raw ActiveCampaign Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-2">Preserved ActiveCampaign Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.rawTags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 text-slate-800 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronological Activity Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">Chronological Activity Stream</h4>
                <div className="relative pl-6 border-l-2 border-indigo-200 space-y-4 text-xs">
                  
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-slate-900 ring-4 ring-white"></div>
                    <div className="font-semibold text-slate-900">12:41 PM – Clicked Link</div>
                    <p className="text-slate-500">Clicked "Book Growth Audit Consultation" in email campaign.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                    <div className="font-semibold text-slate-900">11:32 AM – Opened Email</div>
                    <p className="text-slate-500">Opened "Growth Audit Follow-up #2" (IP: 172.56.21.9).</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 ring-4 ring-white"></div>
                    <div className="font-semibold text-slate-900">10:05 AM – Entered Automation</div>
                    <p className="text-slate-500">Triggered by tag application "FPF-Approved".</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-slate-400 ring-4 ring-white"></div>
                    <div className="font-semibold text-slate-900">Yesterday – Tag Added</div>
                    <p className="text-slate-500">ActiveCampaign webhook added tag "MQL".</p>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Contact ID: {selectedLead.id}</span>
              <button 
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MARKETING SPEND MANAGEMENT MODAL ================= */}
      {isSpendModalOpen && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Marketing Spend</h3>
                  <p className="text-xs text-slate-500">Edit channel budgets to recalculate CPL, Cost per MQL & SQL</p>
                </div>
              </div>
              <button
                onClick={() => setIsSpendModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-3">
                {metrics.sourceRows.map((row) => (
                  <div key={row.source} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{row.source}</span>
                      <span className="text-[11px] text-slate-500">
                        {row.leadCount} leads • {row.mql} MQL • {row.sql} SQL
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-semibold">$</span>
                      <input
                        type="number"
                        step="any"
                        value={sourceSpend[row.source] !== undefined ? sourceSpend[row.source] : ''}
                        onChange={(e) => handleUpdateSpend(row.source, e.target.value)}
                        className="w-28 p-1.5 bg-white border border-slate-300 rounded-lg text-right font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                <span className="font-semibold text-emerald-950">Total Marketing Spend</span>
                <span className="text-base font-bold text-emerald-700">
                  ${metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <button
                onClick={() => setSourceSpend(INITIAL_SOURCE_SPEND_DATA)}
                className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Defaults</span>
              </button>

              <button
                onClick={() => setIsSpendModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAG RULES / ATTRIBUTION CONFIG MODAL ================= */}
      {isTagRulesModalOpen && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-indigo-600 tracking-wider">Attribution Engine</span>
                <h3 className="text-lg font-bold text-slate-900">ActiveCampaign Lead Source Rules</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matches contact tags into definitive lead sources using priority weighting.
                </p>
              </div>
              <button
                onClick={() => setIsTagRulesModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              
              {/* Add New Rule Form */}
              <form onSubmit={handleAddRule} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase">+ Add New Attribution Rule</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Pattern (e.g. FPF-)"
                    value={newRule.pattern}
                    onChange={(e) => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
                    className="p-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    required
                  />
                  <select
                    value={newRule.matchType}
                    onChange={(e) => setNewRule(prev => ({ ...prev, matchType: e.target.value }))}
                    className="p-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="startsWith">Starts With</option>
                    <option value="contains">Contains</option>
                    <option value="exact">Exact Match</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Lead Source Name"
                    value={newRule.source}
                    onChange={(e) => setNewRule(prev => ({ ...prev, source: e.target.value }))}
                    className="p-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg p-2 transition"
                  >
                    Save Rule
                  </button>
                </div>
              </form>

              {/* Configured Rules Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Tag Pattern</th>
                      <th className="py-2.5 px-3">Match Type</th>
                      <th className="py-2.5 px-3">Assigned Source</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tagRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{rule.priority}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">{rule.pattern}</td>
                        <td className="py-2.5 px-3 text-slate-500">{rule.matchType}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{rule.source}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rule.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {rule.active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button 
                            onClick={() => deleteRule(rule.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Conflict Resolution:</strong> If a contact has multiple matching tags that map to distinct sources (e.g. both <code>FPF-</code> and <code>import-</code>), the engine safely flags the contact as <em>"Multiple Source Identifiers"</em> rather than silently guessing.
                </p>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsTagRulesModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= ARCHITECTURE / PIPELINE DRAWER MODAL ================= */}
      {isArchModalOpen && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-blue-600 tracking-wider">System Architecture</span>
                <h3 className="text-lg font-bold text-slate-900">ActiveCampaign ETL & Synchronization Pipeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">Secure server-side API proxy, webhook ingestion, deduplication, and reconciliation.</p>
              </div>
              <button
                onClick={() => setIsArchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Architecture diagram */}
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                <div className="text-slate-400">// Production Data Flow</div>
                <div>ActiveCampaign API + Webhooks (contact.add, campaign.open, etc.)</div>
                <div className="text-indigo-400">      ↓ (Encrypted HTTPS / Secret API Key in env variables)</div>
                <div>Server-Side Proxy & Ingestion Worker (Node.js / Python)</div>
                <div className="text-indigo-400">      ↓ (Deduplication via webhook_event_id & Idempotency Key)</div>
                <div>Normalized PostgreSQL Database (contacts, tags, automations, spend)</div>
                <div className="text-indigo-400">      ↓ (Sub-100ms indexed queries)</div>
                <div>Fenyx Intelligence Dashboard (Single Source of Truth)</div>
              </div>

              {/* Data Safety & Security principles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Server-Side Security</span>
                  </h4>
                  <p className="text-slate-600">
                    The ActiveCampaign API key is never exposed to the frontend. Webhook payloads are verified with signature matching and HMAC secrets.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span>Hourly Reconciliation</span>
                  </h4>
                  <p className="text-slate-600">
                    In addition to real-time webhook ingestion, a scheduled cron sync runs every hour to reconcile contact email counts and un-tag events.
                  </p>
                </div>
              </div>

              {/* Normalized tables documentation */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Relational PostgreSQL Schema Structure</h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                  <div>• <strong>contacts:</strong> id, ac_id, email, first_name, last_name, lead_stage, score, date_added</div>
                  <div>• <strong>contact_tags:</strong> contact_id, tag_name, tag_id, applied_at</div>
                  <div>• <strong>contact_automations:</strong> contact_id, automation_id, status (active|completed), entered_at</div>
                  <div>• <strong>campaign_events:</strong> id, campaign_id, contact_id, type (received|opened|clicked), timestamp</div>
                  <div>• <strong>lead_attribution_rules:</strong> id, pattern, match_type, source_name, priority, is_active</div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsArchModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Close Architecture View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= STREAMING_CHUNK:Rendering Gemini AI Executive Strategist Modal ================= */}
      {isAiModalOpen && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold">Fenyx Marketing Strategist AI</h3>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20 font-mono">
                      gemini-3-flash-preview
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Real-time revenue operations analysis and budget optimization powered by Gemini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Strategy Action Pills */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'EXECUTIVE', label: 'Executive Briefing', icon: Lightbulb },
                  { id: 'BUDGET', label: 'Capital Allocation Audit', icon: DollarSign },
                  { id: 'FUNNEL', label: 'Funnel Leakage & Retention', icon: Workflow },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = aiReportType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleGenerateExecutiveBrief(item.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Context: <strong>628 Contacts • 357 MQLs • $7,180 Spend</strong>
              </span>
            </div>

            {/* Report Content Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {aiAnalysisLoading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
                  <div className="p-3 bg-indigo-50 rounded-full border border-indigo-100">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Gemini is synthesizing marketing telemetry...</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Cross-referencing lead tags, unit economic spend, broadcast opens, and event cohorts.
                    </p>
                  </div>
                </div>
              )}

              {!aiAnalysisLoading && aiAnalysisResult && (
                <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200">
                  <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {aiAnalysisResult}
                  </div>
                </div>
              )}

              {/* Custom Prompt Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!aiCustomPrompt.trim()) return;
                  handleGenerateExecutiveBrief('CUSTOM', aiCustomPrompt);
                }}
                className="pt-3 border-t border-slate-200 space-y-2"
              >
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Ask a Custom Strategy Question to the Marketing AI</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="e.g. Why is Google Event producing MQLs at $13.33 while other channels have higher CPL?"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={aiAnalysisLoading || !aiCustomPrompt.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    Analyze
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Calculated from single source of truth database records</span>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= ACTIVECAMPAIGN CONNECTION & SYNC MANAGER MODAL ================= */}
      {isConnectModalOpen && (
        <div className="bg-slate-900/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ActiveCampaign API Connection</h3>
                  <p className="text-xs text-slate-500">Live proxy & real-time webhook status</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 flex items-start space-x-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-900">Live Proxy Ingestion Running</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    Connected to ActiveCampaign account <strong className="font-mono text-emerald-900">{apiConfig.accountName}</strong>. Webhook endpoints are actively receiving contact and campaign events.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Backend Proxy URL</label>
                <input
                  type="text"
                  value={apiConfig.backendUrl}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, backendUrl: e.target.value }))}
                  className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block">
                  Keep secret API keys safe on your backend proxy (e.g. Node.js Express server).
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Connection Health</span>
                  <span className="text-emerald-600 font-semibold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    200 OK
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Webhook Event Stream</span>
                  <span className="font-medium text-slate-800">Active (Deduplicated)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Last Automated Reconciliation</span>
                  <span className="text-slate-800 font-medium">{apiConfig.lastSync}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Real-Time ActiveCampaign Feed</span>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
