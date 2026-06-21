'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  caseType: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: '#fefce8', text: '#854d0e', border: '#fde68a' },
  confirmed: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  cancelled: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
  completed: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
};

const STATUS_OPTIONS: StatusFilter[] = ['all', 'pending', 'confirmed', 'cancelled', 'completed'];

// ─── Inline styles (no Tailwind — admin layout has no CSS loaded) ─────────────

const S = {
  root: { minHeight: '100vh', background: '#f4f4f5' } as React.CSSProperties,

  // Top bar
  topbar: {
    background: '#111111',
    borderBottom: '1px solid #222',
    padding: '0 1.5rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  } as React.CSSProperties,

  topbarLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' } as React.CSSProperties,
  logoBox: {
    width: '32px', height: '32px', border: '1px solid #D4AF37',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#D4AF37', fontSize: '1rem',
  } as React.CSSProperties,
  topbarTitle: { color: '#fff', fontWeight: 600, fontSize: '0.9rem' } as React.CSSProperties,
  topbarSub: { color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const } as React.CSSProperties,

  logoutBtn: {
    background: 'transparent', border: '1px solid #333', color: '#888',
    padding: '0.4rem 1rem', fontSize: '0.75rem', cursor: 'pointer',
    transition: 'all 0.2s', letterSpacing: '0.05em',
  } as React.CSSProperties,

  // Main
  main: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' } as React.CSSProperties,

  // Stats row
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' } as React.CSSProperties,
  statCard: {
    background: '#fff', border: '1px solid #e5e7eb', padding: '1.25rem 1.5rem',
  } as React.CSSProperties,
  statLabel: { fontSize: '0.7rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '0.4rem' } as React.CSSProperties,
  statValue: { fontSize: '1.75rem', fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' } as React.CSSProperties,
  statGold: { width: '3px', height: '36px', background: '#D4AF37', marginRight: '1rem', flexShrink: 0 } as React.CSSProperties,
  statInner: { display: 'flex', alignItems: 'center' } as React.CSSProperties,

  // Toolbar
  toolbar: {
    background: '#fff', border: '1px solid #e5e7eb', padding: '1rem 1.25rem',
    marginBottom: '1rem', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '0.75rem',
  } as React.CSSProperties,

  filterRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const } as React.CSSProperties,

  filterBtn: (active: boolean): React.CSSProperties => ({
    padding: '0.35rem 0.9rem', fontSize: '0.75rem', border: '1px solid',
    cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all 0.15s',
    letterSpacing: '0.05em', textTransform: 'capitalize',
    background: active ? '#111' : '#fff',
    color: active ? '#D4AF37' : '#555',
    borderColor: active ? '#111' : '#ddd',
  }),

  searchInput: {
    border: '1px solid #ddd', padding: '0.4rem 0.75rem', fontSize: '0.8rem',
    outline: 'none', width: '220px', background: '#fafafa',
  } as React.CSSProperties,

  refreshBtn: {
    background: 'transparent', border: '1px solid #D4AF37', color: '#D4AF37',
    padding: '0.35rem 0.9rem', fontSize: '0.75rem', cursor: 'pointer',
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  // Table
  tableWrap: {
    background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' as const,
  } as React.CSSProperties,

  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.82rem' } as React.CSSProperties,
  th: {
    background: '#111', color: '#D4AF37', padding: '0.75rem 1rem',
    textAlign: 'left' as const, fontSize: '0.67rem', letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, fontWeight: 600, whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  td: {
    padding: '0.85rem 1rem', borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'top' as const, color: '#333',
  } as React.CSSProperties,
  trHover: { background: '#fafafa' } as React.CSSProperties,

  // Status badge
  badge: (status: string): React.CSSProperties => {
    const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
    return {
      display: 'inline-block', padding: '0.2rem 0.6rem', fontSize: '0.68rem',
      fontWeight: 600, letterSpacing: '0.05em', textTransform: 'capitalize',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    };
  },

  // Action buttons
  actionRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' as const } as React.CSSProperties,
  actionBtn: (variant: 'gold' | 'danger' | 'ghost'): React.CSSProperties => ({
    padding: '0.3rem 0.65rem', fontSize: '0.7rem', border: '1px solid',
    cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
    background: variant === 'gold' ? '#D4AF37' : variant === 'danger' ? 'transparent' : 'transparent',
    color: variant === 'gold' ? '#111' : variant === 'danger' ? '#dc2626' : '#555',
    borderColor: variant === 'gold' ? '#D4AF37' : variant === 'danger' ? '#fca5a5' : '#ddd',
  }),

  // Select
  select: {
    border: '1px solid #ddd', padding: '0.3rem 0.5rem', fontSize: '0.75rem',
    outline: 'none', background: '#fff', cursor: 'pointer',
  } as React.CSSProperties,

  // Notes textarea
  notesArea: {
    width: '100%', border: '1px solid #ddd', padding: '0.5rem',
    fontSize: '0.78rem', resize: 'vertical' as const, outline: 'none',
    minHeight: '60px', background: '#fafafa', marginTop: '0.4rem',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,

  // Empty / loading
  emptyCell: { textAlign: 'center' as const, padding: '3rem', color: '#aaa', fontSize: '0.85rem' } as React.CSSProperties,

  // Mobile card (hidden on wide screens via JS check)
  mobileCard: {
    background: '#fff', border: '1px solid #e5e7eb', padding: '1.25rem',
    marginBottom: '0.75rem',
  } as React.CSSProperties,

  // Detail label
  detailLabel: { fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#999', marginBottom: '0.2rem' } as React.CSSProperties,
  detailValue: { fontSize: '0.85rem', color: '#222', marginBottom: '0.75rem', fontWeight: 500 } as React.CSSProperties,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch]             = useState('');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [savingId, setSavingId]         = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  // Per-row editable notes state
  const [notesMap, setNotesMap]         = useState<Record<string, string>>({});

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = '/api/admin/appointments';
     
      const res = await fetch(url);
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAppointments(data.appointments ?? []);
      // Seed notes map from fetched data
      const nm: Record<string, string> = {};
      (data.appointments ?? []).forEach((a: Appointment) => {
        nm[a.id] = a.adminNotes ?? '';
      });
      setNotesMap(nm);
    } catch {
      setError('Could not load appointments. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: status as Appointment['status'] } : a)
      );
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const saveNotes = async (id: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesMap[id] ?? '' }),
      });
      if (!res.ok) throw new Error();
      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, adminNotes: notesMap[id] } : a)
      );
    } catch {
      alert('Failed to save notes. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteAppointment = async (id: string, name: string) => {
    if (!confirm(`Permanently delete appointment for "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredAppointments = appointments.filter((a) => {

  // Status Filter
  if (statusFilter !== 'all' && a.status !== statusFilter) {
    return false;
  }

  // Search Filter
  if (!search.trim()) return true;

  const q = search.toLowerCase();

  return (
    a.name?.toLowerCase().includes(q) ||
    a.phone?.includes(q) ||
    a.email?.toLowerCase().includes(q) ||
    a.caseType?.toLowerCase().includes(q)
  );
});

  const counts = {
    all:       appointments.length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };

  const formatTs = (iso: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={S.root}>

      {/* Top bar */}
      <div style={S.topbar}>
        <div style={S.topbarLeft}>
          <div style={S.logoBox}>⚖</div>
          <div>
            <div style={S.topbarTitle}>Legal Consultation</div>
            <div style={S.topbarSub}>Admin Dashboard</div>
          </div>
        </div>
        <button onClick={logout} style={S.logoutBtn}>Sign Out</button>
      </div>

      <div style={S.main}>

        {/* Stats row */}
        <div style={S.statsRow}>
          {([
            { label: 'Total', value: counts.all },
            { label: 'Pending', value: counts.pending },
            { label: 'Confirmed', value: counts.confirmed },
            { label: 'Completed', value: counts.completed },
          ] as const).map(({ label, value }) => (
            <div key={label} style={S.statCard}>
              <div style={S.statInner}>
                <div style={S.statGold} />
                <div>
                  <div style={S.statLabel}>{label}</div>
                  <div style={S.statValue}>{loading ? '—' : value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          {/* Status filters */}
          <div style={S.filterRow}>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                style={S.filterBtn(statusFilter === s)}
                onClick={() => setStatusFilter(s)}
              >
                {s}{s !== 'all' ? ` (${counts[s]})` : ''}
              </button>
            ))}
          </div>

          {/* Search + Refresh */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search name, phone, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={S.searchInput}
            />
            <button onClick={fetchAppointments} style={S.refreshBtn} disabled={loading}>
              {loading ? '…' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Client', 'Contact', 'Appointment', 'Case Type', 'Status', 'Received', 'Actions'].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={S.emptyCell}>Loading appointments…</td>
                </tr>
              )}
              {!loading && filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={7} style={S.emptyCell}>
                    {search ? 'No results match your search.' : 'No appointments found.'}
                  </td>
                </tr>
              )}
              {!loading && filteredAppointments.map((appt) => {
                const isExpanded = expandedId === appt.id;
                const isSaving   = savingId === appt.id;
                const isDeleting = deletingId === appt.id;

                return (
                  <>
                    <tr
                      key={appt.id}
                      style={{ borderBottom: '1px solid #f0f0f0', background: isExpanded ? '#fffdf5' : '#fff' }}
                    >
                      {/* Client */}
                      <td style={S.td}>
                        <div style={{ fontWeight: 600, color: '#111', marginBottom: '0.15rem' }}>{appt.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#999' }}>ID: {appt.id.slice(0, 8)}…</div>
                      </td>

                      {/* Contact */}
                      <td style={S.td}>
                        <div style={{ marginBottom: '0.2rem' }}>
                          <a href={`tel:${appt.phone}`} style={{ color: '#D4AF37', fontWeight: 500 }}>{appt.phone}</a>
                        </div>
                        {appt.email && (
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            <a href={`mailto:${appt.email}`}>{appt.email}</a>
                          </div>
                        )}
                        <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.35rem' }}>
                          <a
                            href={`https://wa.me/${appt.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(appt.name)}%2C%20regarding%20your%20appointment%20on%20${appt.preferredDate}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '0.68rem', color: '#25D366', border: '1px solid #25D366', padding: '0.15rem 0.4rem' }}
                          >
                            WhatsApp
                          </a>
                          <a
                            href={`tel:${appt.phone}`}
                            style={{ fontSize: '0.68rem', color: '#D4AF37', border: '1px solid #D4AF37', padding: '0.15rem 0.4rem' }}
                          >
                            Call
                          </a>
                        </div>
                      </td>

                      {/* Appointment */}
                      <td style={S.td}>
                        <div style={{ fontWeight: 500 }}>{formatDate(appt.preferredDate)}</div>
                        <div style={{ fontSize: '0.78rem', color: '#666' }}>{appt.preferredTime}</div>
                      </td>

                      {/* Case Type */}
                      <td style={{ ...S.td, maxWidth: '140px' }}>
                        <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{appt.caseType}</div>
                      </td>

                      {/* Status */}
                      <td style={S.td}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={S.badge(appt.status)}>{appt.status}</span>
                        </div>
                        <select
                          value={appt.status}
                          onChange={(e) => updateStatus(appt.id, e.target.value)}
                          disabled={isSaving}
                          style={S.select}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Received */}
                      <td style={{ ...S.td, fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>
                        {formatTs(appt.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={S.td}>
                        <div style={S.actionRow}>
                          <button
                            style={S.actionBtn('ghost')}
                            onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                          >
                            {isExpanded ? '▲ Less' : '▼ Notes'}
                          </button>
                          <button
                            style={S.actionBtn('danger')}
                            onClick={() => deleteAppointment(appt.id, appt.name)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded notes row */}
                    {isExpanded && (
                      <tr key={`${appt.id}-notes`} style={{ background: '#fffdf5' }}>
                        <td colSpan={7} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #fde68a' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                            <div>
                              <div style={S.detailLabel}>Full Name</div>
                              <div style={S.detailValue}>{appt.name}</div>
                              <div style={S.detailLabel}>Phone</div>
                              <div style={S.detailValue}>{appt.phone}</div>
                              <div style={S.detailLabel}>Email</div>
                              <div style={S.detailValue}>{appt.email || '—'}</div>
                            </div>
                            <div>
                              <div style={S.detailLabel}>Case Type</div>
                              <div style={S.detailValue}>{appt.caseType}</div>
                              <div style={S.detailLabel}>Preferred Date & Time</div>
                              <div style={S.detailValue}>{formatDate(appt.preferredDate)} at {appt.preferredTime}</div>
                              <div style={S.detailLabel}>Last Updated</div>
                              <div style={S.detailValue}>{formatTs(appt.updatedAt)}</div>
                            </div>
                          </div>

                          <div style={S.detailLabel}>Admin Notes</div>
                          <textarea
                            value={notesMap[appt.id] ?? ''}
                            onChange={(e) => setNotesMap((prev) => ({ ...prev, [appt.id]: e.target.value }))}
                            placeholder="Add internal notes about this appointment…"
                            style={S.notesArea}
                          />
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                              style={{ ...S.actionBtn('gold'), padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                              onClick={() => saveNotes(appt.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving…' : 'Save Notes'}
                            </button>
                            <a
                              href={`https://wa.me/${appt.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(appt.name)}%2C%20your%20appointment%20on%20${appt.preferredDate}%20at%20${appt.preferredTime}%20has%20been%20confirmed.`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ ...S.actionBtn('ghost'), padding: '0.4rem 1rem', fontSize: '0.75rem', display: 'inline-block', color: '#25D366', borderColor: '#25D366' }}
                            >
                              Send WhatsApp Confirmation
                            </a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: '#aaa', textAlign: 'center', padding: '0.5rem' }}>
          Showing {filteredAppointments.length} of {appointments.length} appointments · Data from Firebase Firestore
          · Session expires in 8 hours
        </div>
      </div>
    </div>
  );
}
