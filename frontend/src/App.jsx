import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, RefreshCw, Layers, Mail, 
  Search, Tag, Briefcase, BarChart2,
  X, Filter, Plus, ArrowUpRight, Building2
} from 'lucide-react';

const API_PROXY = 'https://fenyx-dashboard.onrender.com';

const PIPELINE_OPTIONS = [
  '—',
  'In contact',
  'Follow up 1',
  'Follow up 2',
  'Discovery Call booked',
  'Proposal Sent',
  'Won',
  'Lost',
  'No response',
  'Outreach Sent'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [rawContacts, setRawContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [syncStatus, setSyncStatus] = useState('Standby');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Search & Filters for All Leads
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeadType, setFilterLeadType] = useState('All');
  const [filterPipeline, setFilterPipeline] = useState('All');

  // Dynamic Tag Rules State for Lead Type Identification
  const [tagRules, setTagRules] = useState({
    MQL: ['mql', 'approved', 'waitlist', 'mql-qualified'],
    Hot: ['hot', 'demo-requested', 'high-intent', 'fpf-vip'],
    Warm: ['warm', 'engaged', 'newsletter-click'],
    Cold: ['cold', 'unengaged', 'prospect'],
    'Not Qualified': ['rejected', 'unqualified', 'archived', 'no-fit', 'spam']
  });

  const [newTagInput, setNewTagInput] = useState({ stage: 'MQL', tag: '' });

  // Custom pipeline assignments override map (leadId -> pipelineStage)
  const [pipelineOverrides, setPipelineOverrides] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setSyncStatus('Syncing...');
    try {
      const [contactsRes, campaignsRes, automationsRes] = await Promise.allSettled([
        fetch(`${API_PROXY}/api/contacts`),
        fetch(`${API_PROXY}/api/campaigns`),
        fetch(`${API_PROXY}/api/automations`)
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

      setSyncStatus('Connected');
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

  // Compute Lead Type dynamically & extract true company name
  const processedLeads = useMemo(() => {
    return rawContacts.map(c => {
      const tags = (c.rawTags || []).map(t => String(t).toLowerCase());

      // Extract actual company name from payload without defaulting to "Direct Lead"
      const extractedCompany = c.company && c.company !== 'Direct Lead' 
        ? c.company 
        : (c.orgname || c.organization || '—');

      let detectedType = 'Cold';
      
      // Match tag conditions against defined rules
      const isNotQual = tags.some(t => tagRules['Not Qualified']?.some(r => t.includes(r.toLowerCase())));
      const isMql = tags.some(t => tagRules['MQL']?.some(r => t.includes(r.toLowerCase())));
      const isHot = tags.some(t => tagRules['Hot']?.some(r => t.includes(r.toLowerCase())));
      const isWarm = tags.some(t => tagRules['Warm']?.some(r => t.includes(r.toLowerCase())));

      if (isNotQual) detectedType = 'Not Qualified';
      else if (isMql) detectedType = 'MQL';
      else if (isHot) detectedType = 'Hot';
      else if (isWarm) detectedType = 'Warm';
      else if (c.emailsOpened >= 3) detectedType = 'Warm';

      const pipelineStage = pipelineOverrides[c.id] || c.pipelineStage || '—';

      return {
        ...c,
        company: extractedCompany,
        leadType: detectedType,
        pipelineStage: pipelineStage
      };
    });
  }, [rawContacts, tagRules, pipelineOverrides]);

  // Lead Type Counts
  const leadTypeCounts = useMemo(() => {
    const counts = { Hot: 0, Warm: 0, MQL: 0, Cold: 0, 'Not Qualified': 0 };
    processedLeads.forEach(l => {
      if (counts[l.leadType] !== undefined) counts[l.leadType]++;
      else counts.Cold++;
    });
    return counts;
  }, [processedLeads]);

  // Lead Source Breakdown
  const sourceBreakdown = useMemo(() => {
    const map = {};
    processedLeads.forEach(l => {
      const src = l.company && l.company !== '—' ? l.company : 'ActiveCampaign Organic';
      if (!map[src]) map[src] = { count: 0, mqls: 0, hot: 0 };
      map[src].count++;
      if (l.leadType === 'MQL') map[src].mqls++;
      if (l.leadType === 'Hot') map[src].hot++;
    });
    return Object.entries(map).map(([source, data]) => ({ source, ...data }));
  }, [processedLeads]);

  // Roles / Job Titles Breakdown
  const roleBreakdown = useMemo(() => {
    const map = {};
    processedLeads.forEach(l => {
      const role = l.jobTitle && l.jobTitle !== 'Prospect' ? l.jobTitle : 'General / Uncategorized';
      if (!map[role]) map[role] = { total: 0, hot: 0, mql: 0, warm: 0, cold: 0, notQual: 0 };
      map[role].total++;
      if (l.leadType === 'Hot') map[role].hot++;
      if (l.leadType === 'MQL') map[role].mql++;
      if (l.leadType === 'Warm') map[role].warm++;
      if (l.leadType === 'Cold') map[role].cold++;
      if (l.leadType === 'Not Qualified') map[role].notQual++;
    });
    return Object.entries(map).map(([role, stats]) => ({ role, ...stats }));
  }, [processedLeads]);

  // Filtered leads for All Leads Tab
  const filteredLeads = useMemo(() => {
    return processedLeads.filter(l => {
      const matchesSearch = 
        l.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterLeadType === 'All' || l.leadType === filterLeadType;
      const matchesPipeline = filterPipeline === 'All' || l.pipelineStage === filterPipeline;

      return matchesSearch && matchesType && matchesPipeline;
    });
  }, [processedLeads, searchQuery, filterLeadType, filterPipeline]);

  // Tag Rules Handler
  const handleAddTagRule = (e) => {
    e.preventDefault();
    if (!newTagInput.tag.trim()) return;
    const stage = newTagInput.stage;
    const tag = newTagInput.tag.trim().toLowerCase();

    setTagRules(prev => ({
      ...prev,
      [stage]: [...(prev[stage] || []), tag]
    }));
    setNewTagInput({ ...newTagInput, tag: '' });
  };

  const handleRemoveTagRule = (stage, tagToRemove) => {
    setTagRules(prev => ({
      ...prev,
      [stage]: prev[stage].filter(t => t !== tagToRemove)
    }));
  };

  const handlePipelineChange = (leadId, newStage) => {
    setPipelineOverrides(prev => ({
      ...prev,
      [leadId]: newStage
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold tracking-wider">FENYX</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Lead Intelligence & Marketing Dashboard</h1>
              <p className="text-xs text-slate-500">Live ActiveCampaign API Integration</p>
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
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 border-t border-slate-100 text-sm font-medium">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'leads', label: `All Leads (${processedLeads.length})`, icon: Users },
            { id: 'roles', label: 'Roles Breakdown', icon: Briefcase },
            { id: 'tag-rules', label: 'Tag Rules & Identifiers', icon: Tag },
            { id: 'campaigns', label: `Campaigns (${campaigns.length})`, icon: Mail },
            { id: 'automations', label: `Automations (${automations.length})`, icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 border-b-2 transition ${
                  active 
                    ? 'border-indigo-600 text-indigo-600 font-semibold' 
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { label: 'Hot Leads', count: leadTypeCounts.Hot, color: 'text-red-600 bg-red-50 border-red-200' },
                { label: 'Warm Leads', count: leadTypeCounts.Warm, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                { label: 'MQLs', count: leadTypeCounts.MQL, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                { label: 'Cold Leads', count: leadTypeCounts.Cold, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                { label: 'Not Qualified', count: leadTypeCounts['Not Qualified'], color: 'text-slate-600 bg-slate-100 border-slate-200' }
              ].map((card, i) => (
                <div key={i} className={`p-4 rounded-xl border ${card.color} shadow-sm`}>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">{card.label}</p>
                  <p className="text-3xl font-extrabold mt-2">{card.count}</p>
                </div>
              ))}
            </div>

            {/* Lead Type Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lead Type Performance</h3>
                  <p className="text-xs text-slate-500">Categorized automatically via dynamic tag identifiers</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Lead Type</th>
                      <th className="px-6 py-3">Total Contacts</th>
                      <th className="px-6 py-3">% of Database</th>
                      <th className="px-6 py-3">Classification Mode</th>
                      <th className="px-6 py-3">Status Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Object.entries(leadTypeCounts).map(([type, count]) => {
                      const total = processedLeads.length || 1;
                      const pct = ((count / total) * 100).toFixed(1);
                      const badgeStyles = {
                        Hot: 'bg-red-100 text-red-800',
                        Warm: 'bg-amber-100 text-amber-800',
                        MQL: 'bg-indigo-100 text-indigo-800',
                        Cold: 'bg-blue-100 text-blue-800',
                        'Not Qualified': 'bg-slate-200 text-slate-700'
                      };
                      return (
                        <tr key={type} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">{type}</td>
                          <td className="px-6 py-4 font-semibold">{count}</td>
                          <td className="px-6 py-4">{pct}%</td>
                          <td className="px-6 py-4 text-xs text-slate-500">Auto-assigned via Tag Rules</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeStyles[type] || 'bg-slate-100'}`}>
                              {type}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lead Source Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Lead Source Performance</h3>
                <p className="text-xs text-slate-500">Volume and lead quality segmented by channel source</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Source / Organization</th>
                      <th className="px-6 py-3">Total Leads</th>
                      <th className="px-6 py-3">Hot Leads</th>
                      <th className="px-6 py-3">MQLs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sourceBreakdown.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.source}</td>
                        <td className="px-6 py-4 font-semibold">{item.count}</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{item.hot}</td>
                        <td className="px-6 py-4 text-indigo-600 font-bold">{item.mqls}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ALL LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
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
                    {PIPELINE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-6 py-3">Lead Type</th>
                      <th className="px-6 py-3">Pipeline Stage</th>
                      <th className="px-6 py-3">Engagement</th>
                      <th className="px-6 py-3">Event Status</th>
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
                          <select
                            value={lead.pipelineStage}
                            onChange={e => handlePipelineChange(lead.id, e.target.value)}
                            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500"
                          >
                            {PIPELINE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-800">{lead.emailsSent || 1} Sent</div>
                          <div className="text-xs text-slate-500">{lead.emailsOpened || 0} Opens | {lead.linksClicked || 0} Clicks</div>
                        </td>

                        <td className="px-6 py-4">
                          {lead.approvalStatus ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">
                              {lead.approvalStatus}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
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

        {/* ROLES BREAKDOWN TAB */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Breakdown by Job Role / Persona</h3>
              <p className="text-xs text-slate-500 mt-1">Lead distribution and engagement readiness across target job titles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roleBreakdown.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900 text-base">{item.role}</h4>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                      {item.total} Total Leads
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <p className="text-[10px] font-semibold text-red-600">Hot</p>
                      <p className="text-base font-bold text-red-700">{item.hot}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg">
                      <p className="text-[10px] font-semibold text-amber-600">Warm</p>
                      <p className="text-base font-bold text-amber-700">{item.warm}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <p className="text-[10px] font-semibold text-indigo-600">MQL</p>
                      <p className="text-base font-bold text-indigo-700">{item.mql}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <p className="text-[10px] font-semibold text-blue-600">Cold</p>
                      <p className="text-base font-bold text-blue-700">{item.cold}</p>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <p className="text-[10px] font-semibold text-slate-600">Not Qual</p>
                      <p className="text-base font-bold text-slate-700">{item.notQual}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAG RULES & IDENTIFIERS TAB */}
        {activeTab === 'tag-rules' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">Auto-Identify Lead Types via ActiveCampaign Tags</h3>
              <p className="text-xs text-slate-500">
                Configure tag keywords. When an ActiveCampaign contact possesses any of these tags, they are automatically categorized into the corresponding Lead Type.
              </p>
            </div>

            {/* Add New Tag Form */}
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center space-x-1 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Rule</span>
              </button>
            </form>

            {/* Active Tag Rules List */}
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

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Broadcast Campaigns</h3>
            </div>
            <div className="p-6 text-sm text-slate-500">
              {campaigns.length === 0 ? 'No broadcast campaigns found in ActiveCampaign.' : (
                <div className="space-y-4">
                  {campaigns.map(c => (
                    <div key={c.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">Status: {c.status} | Sent: {c.send_amt || 0}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-indigo-600">Opens: {c.opens || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUTOMATIONS TAB */}
        {activeTab === 'automations' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Active Automations</h3>
            </div>
            <div className="p-6 text-sm text-slate-500">
              {automations.length === 0 ? 'No automations found in ActiveCampaign.' : (
                <div className="space-y-4">
                  {automations.map(a => (
                    <div key={a.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{a.name}</div>
                        <div className="text-xs text-slate-500">Status: {a.status === '1' ? 'Active' : 'Inactive'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* VIEW DETAILS MODAL (Displays only non-blank fields) */}
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
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Populated Contact Fields</h4>
              
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
                className="px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-lg hover:bg-slate-900"
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
