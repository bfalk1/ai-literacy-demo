"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

interface Company {
  id: string;
  name: string;
  slug: string;
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
  const [activeTab, setActiveTab] = useState<'assessments' | 'api' | 'settings'>('assessments');
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

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

    // Load company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
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

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/auth/login");
  };

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
        {(['assessments', 'api', 'settings'] as const).map(tab => (
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
            {tab === 'api' ? 'API Keys' : tab}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {activeTab === 'assessments' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Assessment Link</h2>
              <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#a1a1aa', wordBreak: 'break-all' }}>
                {assessmentLink}
              </div>
              <p style={{ fontSize: '12px', color: '#52525b', marginTop: '8px' }}>
                Send this link to candidates. Results will appear below.
              </p>
            </div>

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
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: '32px' }}>Webhooks</h2>
            <p style={{ fontSize: '14px', color: '#52525b' }}>Coming soon — configure webhooks to push results to your ATS.</p>
          </>
        )}
      </main>
    </div>
  );
}
