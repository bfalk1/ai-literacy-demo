"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { ASSESSMENT_TYPES, getIndustries } from "@/lib/assessment-types";

interface Company {
  id: string;
  name: string;
  slug: string;
  ashby_enabled?: boolean;
  ashby_api_key?: string;
  greenhouse_enabled?: boolean;
  greenhouse_api_key?: string;
  lever_enabled?: boolean;
  lever_api_key?: string;
  default_assessment_type?: string;
}

interface Assessment {
  id: string;
  created_at: string;
  candidate_name: string;
  candidate_email: string;
  overall_score: number;
  status: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeTab, setActiveTab] = useState<'assessments' | 'integrations' | 'api' | 'settings'>('assessments');
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<'ashby' | 'greenhouse' | 'lever' | null>(null);
  const [integrationApiKey, setIntegrationApiKey] = useState("");
  const [savingIntegration, setSavingIntegration] = useState(false);
  
  // Assessment type config for ATS
  const [showAssessmentConfig, setShowAssessmentConfig] = useState(false);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState("");
  const [assessmentIndustryFilter, setAssessmentIndustryFilter] = useState<string | null>(null);
  const [savingAssessmentType, setSavingAssessmentType] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      console.error('[Dashboard] Supabase client not available');
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[Dashboard] Auth user:', user?.id, 'Error:', authError);
    
    if (!user) {
      console.log('[Dashboard] No user, redirecting to login');
      router.push("/auth/login");
      return;
    }

    // Load company with integration settings
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id, name, slug, ashby_enabled, ashby_api_key, greenhouse_enabled, greenhouse_api_key, lever_enabled, lever_api_key, default_assessment_type')
      .eq('owner_id', user.id)
      .single();

    console.log('[Dashboard] Company query for owner_id:', user.id);
    console.log('[Dashboard] Company data:', companyData);
    console.log('[Dashboard] Company error:', companyError);

    if (companyData) {
      setCompany(companyData);

      // Load assessments
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, created_at, candidate_name, candidate_email, overall_score, status')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('[Dashboard] Assessments:', assessmentData?.length, 'Error:', assessmentError);
      if (assessmentData) setAssessments(assessmentData);

      // Load API keys
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('id, name, key_prefix, created_at, last_used_at')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      console.log('[Dashboard] API Keys:', keyData?.length, 'Error:', keyError);
      if (keyData) setApiKeys(keyData);
    } else {
      console.error('[Dashboard] No company found for user:', user.id);
    }

    setLoading(false);
  };

  const createApiKey = async () => {
    if (!newKeyName.trim() || !company) return;
    
    const supabase = getSupabase();
    if (!supabase) return;

    // Generate a random key
    const key = 'tsk_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Hash it for storage (in production, use proper hashing)
    const keyHash = btoa(key);
    const keyPrefix = key.substring(0, 8);

    const { error } = await supabase
      .from('api_keys')
      .insert({
        company_id: company.id,
        name: newKeyName,
        key_hash: keyHash,
        key_prefix: keyPrefix,
      });

    if (!error) {
      setNewKey(key);
      setNewKeyName("");
      loadData();
    }
  };

  const deleteApiKey = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('api_keys').delete().eq('id', id);
    loadData();
  };

  const saveIntegration = async (provider: 'ashby' | 'greenhouse' | 'lever') => {
    if (!company) return;
    setSavingIntegration(true);

    const supabase = getSupabase();
    if (!supabase) return;

    const updates: Record<string, unknown> = {};
    updates[`${provider}_api_key`] = integrationApiKey || null;
    updates[`${provider}_enabled`] = !!integrationApiKey;

    await supabase
      .from('companies')
      .update(updates)
      .eq('id', company.id);

    setSavingIntegration(false);
    setEditingIntegration(null);
    setIntegrationApiKey("");
    loadData();
  };

  const disconnectIntegration = async (provider: 'ashby' | 'greenhouse' | 'lever') => {
    if (!company) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const updates: Record<string, unknown> = {};
    updates[`${provider}_api_key`] = null;
    updates[`${provider}_enabled`] = false;

    await supabase
      .from('companies')
      .update(updates)
      .eq('id', company.id);

    loadData();
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/auth/login");
  };

  const saveAssessmentType = async () => {
    if (!selectedAssessmentType || !company) return;
    setSavingAssessmentType(true);

    const supabase = getSupabase();
    if (!supabase) return;

    await supabase
      .from('companies')
      .update({ default_assessment_type: selectedAssessmentType })
      .eq('id', company.id);

    setCompany({ ...company, default_assessment_type: selectedAssessmentType });
    setShowAssessmentConfig(false);
    setSavingAssessmentType(false);
  };

  const filteredAssessmentTypes = assessmentIndustryFilter
    ? ASSESSMENT_TYPES.filter(a => a.industry === assessmentIndustryFilter)
    : ASSESSMENT_TYPES;

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#71717a' }}>Loading...</p>
      </div>
    );
  }

  const assessmentLink = company ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?company=${company.slug}` : '';

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#000', color: '#fff' }}>
      {/* Header */}
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a' }}>TELESCOPIC</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/docs" style={{ fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>
            Docs
          </Link>
          <span style={{ fontSize: '14px', color: '#a1a1aa' }}>{company?.name}</span>
          <button onClick={handleLogout} style={{ fontSize: '13px', color: '#71717a', background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ padding: '0 20px', borderBottom: '1px solid #27272a', display: 'flex', gap: '24px' }}>
        {(['assessments', 'integrations', 'api', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '16px 0',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === tab ? '#fff' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'api' ? 'API Keys' : tab === 'integrations' ? 'Integrations' : tab}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {activeTab === 'assessments' && (
          <>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Recent Assessments</h2>
            {assessments.length === 0 ? (
              <p style={{ color: '#52525b', fontSize: '14px' }}>No assessments yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessments.map(a => (
                  <div key={a.id} style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>{a.candidate_name}</p>
                      <p style={{ fontSize: '12px', color: '#71717a' }}>
                        {new Date(a.created_at).toLocaleDateString()} • {a.candidate_email || 'No email'}
                      </p>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 600 }}>{a.overall_score}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'integrations' && (
          <>
            {/* Assessment Type Config */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#18181b', borderRadius: '12px', border: company?.default_assessment_type ? '1px solid #27272a' : '1px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Assessment Type</h2>
                  <p style={{ fontSize: '13px', color: '#71717a' }}>
                    Choose which assessment candidates will receive
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedAssessmentType(company?.default_assessment_type || '');
                    setShowAssessmentConfig(true);
                  }}
                  style={{
                    fontSize: '13px',
                    color: '#fff',
                    backgroundColor: '#27272a',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {company?.default_assessment_type ? 'Change' : 'Configure'}
                </button>
              </div>
              {company?.default_assessment_type ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {(() => {
                    const type = ASSESSMENT_TYPES.find(t => t.id === company.default_assessment_type);
                    return type ? (
                      <>
                        <span style={{ fontSize: '24px' }}>{type.icon}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>{type.name}</div>
                          <div style={{ fontSize: '12px', color: '#71717a' }}>{type.industry} • {type.environment}</div>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#f59e0b' }}>
                  ⚠️ No assessment type configured. Configure one to start sending assessments.
                </p>
              )}
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>ATS Integrations</h2>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px' }}>
              Connect your ATS to automatically trigger assessments when candidates reach a specific stage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Ashby */}
              <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: company?.ashby_enabled ? '16px' : '0' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>Ashby</p>
                    <p style={{ fontSize: '12px', color: company?.ashby_enabled ? '#22c55e' : '#71717a' }}>
                      {company?.ashby_enabled ? '✓ Connected' : 'Not connected'}
                    </p>
                  </div>
                  {company?.ashby_enabled ? (
                    <button
                      onClick={() => disconnectIntegration('ashby')}
                      style={{ fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditingIntegration('ashby'); setIntegrationApiKey(''); }}
                      style={{ fontSize: '13px', color: '#fff', backgroundColor: '#27272a', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Connect
                    </button>
                  )}
                </div>
                {company?.ashby_enabled && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px' }}>Webhook URL</p>
                    <code style={{ fontSize: '11px', color: '#a1a1aa', backgroundColor: '#0a0a0a', padding: '8px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                      {typeof window !== 'undefined' ? window.location.origin : ''}/api/integrations/ashby/webhook?company_id={company?.id}
                    </code>
                    <p style={{ fontSize: '11px', color: '#52525b', marginTop: '8px' }}>
                      <Link href="/docs/integrations/ashby" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>View setup guide →</Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Greenhouse */}
              <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: company?.greenhouse_enabled ? '16px' : '0' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>Greenhouse</p>
                    <p style={{ fontSize: '12px', color: company?.greenhouse_enabled ? '#22c55e' : '#71717a' }}>
                      {company?.greenhouse_enabled ? '✓ Connected' : 'Not connected'}
                    </p>
                  </div>
                  {company?.greenhouse_enabled ? (
                    <button
                      onClick={() => disconnectIntegration('greenhouse')}
                      style={{ fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditingIntegration('greenhouse'); setIntegrationApiKey(''); }}
                      style={{ fontSize: '13px', color: '#fff', backgroundColor: '#27272a', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Connect
                    </button>
                  )}
                </div>
                {company?.greenhouse_enabled && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px' }}>Webhook URL</p>
                    <code style={{ fontSize: '11px', color: '#a1a1aa', backgroundColor: '#0a0a0a', padding: '8px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                      {typeof window !== 'undefined' ? window.location.origin : ''}/api/integrations/greenhouse/webhook?company_id={company?.id}
                    </code>
                    <p style={{ fontSize: '11px', color: '#52525b', marginTop: '8px' }}>
                      <Link href="/docs/integrations/greenhouse" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>View setup guide →</Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Lever */}
              <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: company?.lever_enabled ? '16px' : '0' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>Lever</p>
                    <p style={{ fontSize: '12px', color: company?.lever_enabled ? '#22c55e' : '#71717a' }}>
                      {company?.lever_enabled ? '✓ Connected' : 'Not connected'}
                    </p>
                  </div>
                  {company?.lever_enabled ? (
                    <button
                      onClick={() => disconnectIntegration('lever')}
                      style={{ fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditingIntegration('lever'); setIntegrationApiKey(''); }}
                      style={{ fontSize: '13px', color: '#fff', backgroundColor: '#27272a', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Connect
                    </button>
                  )}
                </div>
                {company?.lever_enabled && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px' }}>Webhook URL</p>
                    <code style={{ fontSize: '11px', color: '#a1a1aa', backgroundColor: '#0a0a0a', padding: '8px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                      {typeof window !== 'undefined' ? window.location.origin : ''}/api/integrations/lever/webhook?company_id={company?.id}
                    </code>
                    <p style={{ fontSize: '11px', color: '#52525b', marginTop: '8px' }}>
                      <Link href="/docs/integrations/lever" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>View setup guide →</Link>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Connect Modal */}
            {editingIntegration && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                <div style={{ backgroundColor: '#18181b', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', margin: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                    Connect {editingIntegration.charAt(0).toUpperCase() + editingIntegration.slice(1)}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
                    Enter your {editingIntegration.charAt(0).toUpperCase() + editingIntegration.slice(1)} API key to enable the integration.
                  </p>
                  <input
                    type="password"
                    value={integrationApiKey}
                    onChange={(e) => setIntegrationApiKey(e.target.value)}
                    placeholder="Paste API key here"
                    style={{
                      width: '100%',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      color: '#fff',
                      outline: 'none',
                      marginBottom: '16px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setEditingIntegration(null); setIntegrationApiKey(''); }}
                      style={{ fontSize: '13px', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveIntegration(editingIntegration)}
                      disabled={!integrationApiKey.trim() || savingIntegration}
                      style={{
                        fontSize: '13px',
                        color: '#000',
                        backgroundColor: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        opacity: integrationApiKey.trim() && !savingIntegration ? 1 : 0.5,
                      }}
                    >
                      {savingIntegration ? 'Saving...' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'api' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Create API Key</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g., Production)"
                  style={{
                    flex: 1,
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={createApiKey}
                  disabled={!newKeyName.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#fff',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    opacity: newKeyName.trim() ? 1 : 0.5,
                  }}
                >
                  Create
                </button>
              </div>

              {newKey && (
                <div style={{ marginTop: '16px', backgroundColor: '#14532d', border: '1px solid #166534', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#86efac', marginBottom: '8px' }}>Copy this key now — you won't see it again:</p>
                  <code style={{ fontSize: '13px', wordBreak: 'break-all' }}>{newKey}</code>
                </div>
              )}
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Active Keys</h2>
            {apiKeys.length === 0 ? (
              <p style={{ color: '#52525b', fontSize: '14px' }}>No API keys yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {apiKeys.map(k => (
                  <div key={k.id} style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>{k.name}</p>
                      <p style={{ fontSize: '12px', color: '#71717a' }}>
                        {k.key_prefix}... • Created {new Date(k.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteApiKey(k.id)}
                      style={{ fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#18181b', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>API Usage</h3>
              <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>Fetch assessments:</p>
              <code style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '6px', overflowX: 'auto' }}>
                curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                &nbsp;&nbsp;{typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/assessments
              </code>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Company Settings</h2>
            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontSize: '14px', color: '#a1a1aa' }}>Company: {company?.name}</p>
              <p style={{ fontSize: '14px', color: '#71717a', marginTop: '8px' }}>Slug: {company?.slug}</p>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #27272a' }}>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px' }}>Company ID</p>
                <code style={{ fontSize: '13px', color: '#fff', backgroundColor: '#0a0a0a', padding: '8px 12px', borderRadius: '6px', display: 'block', wordBreak: 'break-all' }}>
                  {company?.id}
                </code>
              </div>
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}>Webhook URLs</h2>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>Use these URLs to connect your ATS to Telescopic.</p>
            
            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>Ashby Webhook URL</p>
              <code style={{ fontSize: '12px', color: '#a1a1aa', backgroundColor: '#0a0a0a', padding: '8px 12px', borderRadius: '6px', display: 'block', wordBreak: 'break-all' }}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/api/integrations/ashby/webhook?company_id={company?.id}
              </code>
            </div>

            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>Greenhouse Webhook URL</p>
              <code style={{ fontSize: '12px', color: '#a1a1aa', backgroundColor: '#0a0a0a', padding: '8px 12px', borderRadius: '6px', display: 'block', wordBreak: 'break-all' }}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/api/integrations/greenhouse/webhook?company_id={company?.id}
              </code>
            </div>

            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>Lever Webhook URL</p>
              <code style={{ fontSize: '12px', color: '#a1a1aa', backgroundColor: '#0a0a0a', padding: '8px 12px', borderRadius: '6px', display: 'block', wordBreak: 'break-all' }}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/api/integrations/lever/webhook?company_id={company?.id}
              </code>
            </div>

            <p style={{ fontSize: '12px', color: '#52525b', marginTop: '16px' }}>
              See <Link href="/docs/integrations/ashby" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>Ashby</Link>,{' '}
              <Link href="/docs/integrations/greenhouse" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>Greenhouse</Link>, or{' '}
              <Link href="/docs/integrations/lever" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>Lever</Link> docs for setup instructions.
            </p>
          </>
        )}
      </main>

      {/* Assessment Type Config Modal */}
      {showAssessmentConfig && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '100%', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Select Assessment Type</h3>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '20px' }}>
              All candidates from your ATS will receive this assessment.
            </p>

            {/* Industry filter */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button
                onClick={() => setAssessmentIndustryFilter(null)}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  backgroundColor: !assessmentIndustryFilter ? '#fff' : 'transparent',
                  color: !assessmentIndustryFilter ? '#000' : '#71717a',
                  border: '1px solid #27272a',
                  borderRadius: '16px',
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              {getIndustries().map((industry) => (
                <button
                  key={industry}
                  onClick={() => setAssessmentIndustryFilter(industry)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    backgroundColor: assessmentIndustryFilter === industry ? '#fff' : 'transparent',
                    color: assessmentIndustryFilter === industry ? '#000' : '#71717a',
                    border: '1px solid #27272a',
                    borderRadius: '16px',
                    cursor: 'pointer',
                  }}
                >
                  {industry}
                </button>
              ))}
            </div>

            {/* Assessment type grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {filteredAssessmentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedAssessmentType(type.id)}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedAssessmentType === type.id ? '#3b82f6' : '#0a0a0a',
                    border: `1px solid ${selectedAssessmentType === type.id ? '#3b82f6' : '#27272a'}`,
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{type.icon}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{type.name}</div>
                      <div style={{ fontSize: '10px', color: selectedAssessmentType === type.id ? '#93c5fd' : '#71717a' }}>
                        {type.industry}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowAssessmentConfig(false); setSelectedAssessmentType(""); }}
                style={{ fontSize: '13px', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px' }}
              >
                Cancel
              </button>
              <button
                onClick={saveAssessmentType}
                disabled={!selectedAssessmentType || savingAssessmentType}
                style={{
                  fontSize: '13px',
                  color: '#000',
                  backgroundColor: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  opacity: selectedAssessmentType && !savingAssessmentType ? 1 : 0.5,
                }}
              >
                {savingAssessmentType ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
