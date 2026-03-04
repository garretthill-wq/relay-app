import { useState, useEffect } from "react";

const TEAM_B_MEMBERS = ["Lisa DC", "Rasha S", "Garrett H"];

const STATUS_CONFIG = {
  "Received":    { color: "#94a3b8", bg: "#1e293b" },
  "In Review":   { color: "#f59e0b", bg: "#2d1f00" },
  "In Progress": { color: "#3b82f6", bg: "#0d1f3c" },
  "Needs Info":  { color: "#ef4444", bg: "#2d0f0f" },
  "Completed":   { color: "#22c55e", bg: "#0d2a1a" },
};

const PRIORITY_CONFIG = {
  "Low":    { color: "#64748b" },
  "Medium": { color: "#f59e0b" },
  "High":   { color: "#ef4444" },
  "Urgent": { color: "#a855f7" },
};

const TOPIC_CATEGORIES = [
  {
    id: "benefits",
    label: "Benefits topics",
    options: [
      "Additional Types of Benefits", "Affordable Care Act (ACA)", "Cafeteria Plans",
      "ERISA", "Group Health Plans (GHP)", "Health Reimbursement Arrangements (HRA)",
      "Health Savings Accounts (HSA)", "HIPAA", "Life, Accident & Disability Benefits",
      "State-Mandated Benefits & Reporting",
    ],
  },
  {
    id: "discrimination",
    label: "Discrimination & Equal Employment",
    options: [
      "Accommodations", "Discrimination and Harassment Protections",
      "Equal Pay", "State Training Requirements",
    ],
  },
  {
    id: "hiring",
    label: "Hiring topics",
    options: [
      "Employment Agreement Restrictions", "Employment Verification & New Hire Reporting",
      "Job Postings, Interviews, & Inquiries", "Background Checks & Pre-Employment Screening",
    ],
  },
  {
    id: "leaves",
    label: "Leaves & Time Off topics",
    options: [
      "Emergency Response Leave", "Family and Medical Leave", "Jury Duty and Court Leave",
      "Medical Donor Leave", "Military Leave", "School-Involvement Leave",
      "Sick Leave and Earned Paid Leave", "Time Off", "Victim Leave", "Voting Leave",
    ],
  },
  {
    id: "managing",
    label: "Managing Employees topics",
    options: [
      "Culture", "Labor Relations", "Performance & Discipline", "Personnel Files",
      "Privacy and Technology", "Recordkeeping Requirements",
      "Posting Requirements", "Workplace Practices",
    ],
  },
  {
    id: "safety",
    label: "Safety & Health topics",
    options: [
      "Cybersecurity", "Drugs & Alcohol", "Workplace Safety & Violence", "Workers' Compensation",
    ],
  },
  {
    id: "termination",
    label: "Termination topics",
    options: ["Layoffs", "Separation", "Unemployment Compensation"],
  },
  {
    id: "wage",
    label: "Wage & Hour topics",
    options: [
      "Breaks and Rest Periods", "Child Labor", "Exemption Classifications",
      "Independent Contractors", "Interns", "Minimum Wage & Overtime", "Pay Practices",
    ],
  },
];

const SUPABASE_URL = "https://uxyxfnowkbeeoltiwpya.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eXhmbm93a2JlZW9sdGl3cHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjEyNzYsImV4cCI6MjA4ODIzNzI3Nn0.SUDHemapmWZ_FJA0bpeSHCtPDMhx4MPx1a_ikyQX1yQ";

async function dbGetRequests() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/requests?order=id.desc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows.map(r => ({ ...r.data, id: r.id, submittedAt: r.submitted_at }));
}

async function dbInsertRequest(req) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/requests`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json", Prefer: "return=representation",
    },
    body: JSON.stringify({ data: req, submitted_at: req.submittedAt }),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return { ...rows[0].data, id: rows[0].id, submittedAt: rows[0].submitted_at };
}

async function dbUpdateRequest(id, updates) {
  // Fetch current row first, then merge
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/requests?id=eq.${id}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const rows = await getRes.json();
  if (!rows.length) return;
  const current = rows[0].data;
  const merged = { ...current, ...updates };
  await fetch(`${SUPABASE_URL}/rest/v1/requests?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: merged }),
  });
}

function Label({ children, required }) {
  return (
    <label style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", display: "block", marginBottom: 6 }}>
      {children} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map(opt => (
        <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            border: `2px solid ${value === opt ? "#3b82f6" : "#334155"}`,
            background: value === opt ? "#3b82f6" : "transparent",
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {value === opt && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
          </div>
          <input type="radio" value={opt} checked={value === opt} onChange={() => onChange(opt)} style={{ display: "none" }} />
          <span style={{ fontSize: 14, color: value === opt ? "#e2e8f0" : "#94a3b8" }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({ options, selected = [], onChange }) {
  const toggle = (opt) => {
    const next = selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map(opt => (
        <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{
            width: 16, height: 16, borderRadius: 4,
            border: `2px solid ${selected.includes(opt) ? "#3b82f6" : "#334155"}`,
            background: selected.includes(opt) ? "#3b82f6" : "transparent",
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {selected.includes(opt) && <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>}
          </div>
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} style={{ display: "none" }} />
          <span style={{ fontSize: 13, color: selected.includes(opt) ? "#e2e8f0" : "#94a3b8" }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
        border: "1px solid #1e3a5f",
        borderRadius: "10px 10px 0 0",
        padding: "10px 18px",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {title}
        </span>
      </div>
      <div style={{
        background: "#0a0a14", border: "1px solid #1a1a2e", borderTop: "none",
        borderRadius: "0 0 10px 10px", padding: "20px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {children}
      </div>
    </div>
  );
}

export default function WorkflowTool() {
  const [view, setView] = useState("submit");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [teamNote, setTeamNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [topicsOpen, setTopicsOpen] = useState({});

  // Load requests from Supabase on mount
  useEffect(() => {
    dbGetRequests().then(data => {
      if (data) setRequests(data);
      setLoading(false);
    });
  }, []);

  // Poll for updates every 30 seconds so all users see fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      dbGetRequests().then(data => { if (data) setRequests(data); });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Intercept browser back button to go back within the app instead of leaving.
  useEffect(() => {
    const handlePop = (e) => {
      if (selectedRequest) {
        e.preventDefault();
        setSelectedRequest(null);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [selectedRequest]);

  const [f, setF] = useState({
    submitterName: "", reason: "", item: "", contentType: "",
    region: "", citation: "",
    assetsStatus: "", assetStyle: "",
    alertType: "", doesReplace: "", replacementLink: "",
    passageDate: "", effectiveDate: "", importantDate: "",
    displaySortBy: "", employeeCount: "", jurisdictionEmployeeCount: "",
    previewTime: "", complianceReminder: "", linkAlertTo: "", archiveDate: "",
    topicsSelected: {}, notes: "", priority: "Medium",
  });

  const setField = (key, val) => setF(prev => ({ ...prev, [key]: val }));
  const setTopics = (catId, val) => setF(prev => ({ ...prev, topicsSelected: { ...prev.topicsSelected, [catId]: val } }));

  const handleSubmit = async () => {
    if (!f.submitterName || !f.reason || !f.item || !f.contentType) return;
    const newReq = {
      ...f, attachments, status: "Received", assignedTo: "", teamNotes: [],
      submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    const saved = await dbInsertRequest(newReq);
    if (saved) setRequests(r => [saved, ...r]);
    setF({ submitterName: "", reason: "", item: "", contentType: "", region: "", citation: "",
      assetsStatus: "", assetStyle: "", alertType: "", doesReplace: "", replacementLink: "", passageDate: "",
      effectiveDate: "", importantDate: "", displaySortBy: "", employeeCount: "",
      jurisdictionEmployeeCount: "", previewTime: "", complianceReminder: "", linkAlertTo: "",
      archiveDate: "", topicsSelected: {}, notes: "", priority: "Medium" });
    setAttachments([]);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3500);
  };

  const updateRequest = async (id, updates) => {
    await dbUpdateRequest(id, updates);
    setRequests(r => r.map(req => req.id === id ? { ...req, ...updates } : req));
    if (selectedRequest?.id === id) setSelectedRequest(s => ({ ...s, ...updates }));
  };

  const addTeamNote = (id) => {
    if (!teamNote.trim()) return;
    const note = { author: "You (Team B)", text: teamNote, time: "Just now" };
    const req = requests.find(r => r.id === id);
    updateRequest(id, { teamNotes: [...(req?.teamNotes || []), note] });
    setTeamNote("");
  };

  const filteredRequests = requests
    .filter(r => filterStatus === "All" || r.status === filterStatus)
    .filter(r => filterAssignee === "All" || r.assignedTo === filterAssignee)
    .sort((a, b) => {
      // Completed always goes to the bottom
      const aComplete = a.status === "Completed";
      const bComplete = b.status === "Completed";
      if (aComplete && !bComplete) return 1;
      if (!aComplete && bComplete) return -1;
      // Within completed: most recently completed first (highest id = most recent)
      if (aComplete && bComplete) return b.id - a.id;
      // Active items: sort by content type then by date received (newest first)
      if (a.contentType !== b.contentType) return (a.contentType || "").localeCompare(b.contentType || "");
      return b.id - a.id;
    });

  const canSubmit = f.submitterName && f.reason && f.item && f.contentType;

  const inputStyle = { background: "#111827", border: "1px solid #1f2937", color: "#e2e8f0", borderRadius: 8, padding: "10px 14px", fontFamily: "inherit", fontSize: 13, width: "100%", outline: "none" };
  const selectStyle = { ...inputStyle };

  const renderSubmit = () => (
    <div className="fade-in" style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 60px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "#f8fafc", marginBottom: 6 }}>
          Submit a Content Request
        </h1>
        <p style={{ color: "#64748b", fontSize: 13 }}>
          Required fields are marked with <span style={{ color: "#ef4444" }}>*</span>. Additional questions will appear based on your content type.
        </p>
      </div>

      {submitSuccess && (
        <div className="fade-in" style={{ background: "#0d2a1a", border: "1px solid #166534", borderRadius: 10, padding: "13px 18px", marginBottom: 22, color: "#4ade80", fontSize: 14 }}>
          ✓ Request submitted successfully!
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        <Section title="Submitter Info">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <Label required>Your name</Label>
              <input style={inputStyle} placeholder="Full name" value={f.submitterName} onChange={e => setField("submitterName", e.target.value)} />
            </div>
            <div>
              <Label>Priority</Label>
              <select style={selectStyle} value={f.priority} onChange={e => setField("priority", e.target.value)}>
                {Object.keys(PRIORITY_CONFIG).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section title="Submission Type">
          <div>
            <Label required>Reason — What sort of request are you submitting?</Label>
            <RadioGroup options={["New", "Update", "Audit", "Other"]} value={f.reason} onChange={v => setField("reason", v)} />
          </div>
          <div>
            <Label required>Item</Label>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Name of page or asset; law alert title. If you need to include notes or add a link, there is space later in the form.</p>
            <input style={inputStyle} placeholder="e.g. California Minimum Wage Increase 2026" value={f.item} onChange={e => setField("item", e.target.value)} />
          </div>
          <div>
            <Label required>Content type</Label>
            <RadioGroup options={["Laws", "Asset", "Law alert", "Other"]} value={f.contentType} onChange={v => setField("contentType", v)} />
          </div>
        </Section>

        {f.contentType === "Laws" && (
          <div className="slide-in">
            <Section title="Laws">
              <div>
                <Label required>Region</Label>
                <RadioGroup options={["Federal", "State", "Locality", "Other"]} value={f.region} onChange={v => setField("region", v)} />
              </div>
              <div>
                <Label>Citation</Label>
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>If the request is the result of a bill or law, write it here.</p>
                <input style={inputStyle} placeholder="e.g. HB 1234, Cal. Lab. Code § 1182.12" value={f.citation} onChange={e => setField("citation", e.target.value)} />
              </div>
            </Section>
          </div>
        )}

        {f.contentType === "Asset" && (
          <div className="slide-in">
            <Section title="Assets">
              {f.reason === "New" && (
                <div>
                  <Label required>Asset style</Label>
                  <RadioGroup
                    options={["Designed", "Word", "Other"]}
                    value={f.assetStyle || ""}
                    onChange={v => setField("assetStyle", v)}
                  />
                </div>
              )}
            </Section>
          </div>
        )}

        {f.contentType === "Law alert" && (
          <div className="slide-in">
            <Section title="Law Alerts">
              <div>
                <Label>Alert type</Label>
                <RadioGroup options={["AA", "PLA", "NLA", "PLA+NLA"]} value={f.alertType} onChange={v => setField("alertType", v)} />
              </div>
              <div>
                <Label>Does this replace anything?</Label>
                <RadioGroup options={["Yes", "No"]} value={f.doesReplace} onChange={v => setField("doesReplace", v)} />
              </div>
              {f.doesReplace === "Yes" && (
                <div className="slide-in">
                  <Label>What does it replace (link)?</Label>
                  <input style={inputStyle} placeholder="https://..." value={f.replacementLink} onChange={e => setField("replacementLink", e.target.value)} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                {[["Passage date", "passageDate"], ["Effective date", "effectiveDate"], ["Important date", "importantDate"]].map(([label, key]) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <p style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>Use the popup calendar. Don't paste in a date.</p>
                    <input style={inputStyle} type="date" value={f[key]} onChange={e => setField(key, e.target.value)} />
                  </div>
                ))}
              </div>
              <div>
                <Label>Display/sort by date</Label>
                <RadioGroup options={["Passage date", "Effective date", "Important date"]} value={f.displaySortBy} onChange={v => setField("displaySortBy", v)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <Label>Employee count</Label>
                  <input style={inputStyle} placeholder="e.g. 50+" value={f.employeeCount} onChange={e => setField("employeeCount", e.target.value)} />
                </div>
                <div>
                  <Label>Jurisdiction employee count</Label>
                  <input style={inputStyle} placeholder="e.g. 15+" value={f.jurisdictionEmployeeCount} onChange={e => setField("jurisdictionEmployeeCount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Preview time</Label>
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Specify the time zone. Unless requested here, delivery time will be 24 hours after preview.</p>
                <input style={inputStyle} placeholder="e.g. 9:00 AM PT" value={f.previewTime} onChange={e => setField("previewTime", e.target.value)} />
              </div>
              <div>
                <Label>Compliance reminder?</Label>
                <RadioGroup options={["Yes", "No"]} value={f.complianceReminder} onChange={v => setField("complianceReminder", v)} />
              </div>
              <div>
                <Label>Link alert to:</Label>
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Optional. Provide a link to the page in the platform. Only a link! Anything that's not a valid link will cause the form to fail.</p>
                <input style={inputStyle} placeholder="https://..." value={f.linkAlertTo} onChange={e => setField("linkAlertTo", e.target.value)} />
              </div>
              <div>
                <Label>Archive date</Label>
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Optional. Standard is two years after the effective date. Minimum wage alerts are archived one year after the effective date. If entering a date, use the popup calendar. Don't paste in a date.</p>
                <input style={inputStyle} type="date" value={f.archiveDate} onChange={e => setField("archiveDate", e.target.value)} />
              </div>
            </Section>
          </div>
        )}

        <Section title="Categories and Topics">
          {TOPIC_CATEGORIES.map((cat) => {
            const isOpen = !!topicsOpen[cat.id];
            const selected = f.topicsSelected[cat.id] || [];
            return (
              <div key={cat.id}>
                <div
                  onClick={() => setTopicsOpen(prev => ({ ...prev, [cat.id]: !isOpen }))}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", padding: "8px 0",
                    borderBottom: isOpen ? "1px solid #1f2937" : "1px solid transparent",
                    marginBottom: isOpen ? 12 : 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: selected.length > 0 ? "#e2e8f0" : "#94a3b8" }}>
                      {cat.label}
                    </span>
                    {selected.length > 0 && (
                      <span style={{ background: "#1d4ed8", color: "white", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>
                        {selected.length}
                      </span>
                    )}
                  </div>
                  <span style={{ color: "#475569", fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                </div>
                {isOpen && (
                  <div className="slide-in">
                    <CheckboxGroup options={cat.options} selected={selected} onChange={vals => setTopics(cat.id, vals)} />
                  </div>
                )}
              </div>
            );
          })}
        </Section>

        <Section title="Notes">
          <div>
            <Label>Notes</Label>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Write further instructions or ask questions of the content editors here. (Optional)</p>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} rows={3}
              placeholder="Any additional context, instructions, or questions..."
              value={f.notes} onChange={e => setField("notes", e.target.value)} />
          </div>
        </Section>

        <Section title="Attachments">
          <div>
            <Label>SharePoint or OneDrive link</Label>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
              Paste a link to your file in SharePoint or OneDrive. Before submitting, make sure editing permissions are turned on so the Content Editors can access it.
            </p>
            <input
              style={inputStyle}
              placeholder="https://..."
              value={attachments[0] || ""}
              onChange={e => setAttachments(e.target.value ? [e.target.value] : [])}
            />
          </div>
        </Section>

        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          background: canSubmit ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "#1e293b",
          color: canSubmit ? "white" : "#475569",
          border: "none", borderRadius: 10, padding: "13px 28px",
          fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", transition: "transform 0.1s",
        }}
          onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          Submit Request →
        </button>
      </div>
    </div>
  );

  const renderTracker = () => (
    <div className="fade-in" style={{ padding: "32px" }}>
      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>Loading requests...</div>
      )}
      {!loading && <><div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "#f8fafc", marginBottom: 4 }}>Request Tracker</h1>
          <p style={{ color: "#475569", fontSize: 13 }}>{filteredRequests.length} requests · Content Editors workspace</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const count = requests.filter(r => r.status === status).length;
            return (
              <div key={status} style={{ background: cfg.bg, border: `1px solid ${cfg.color}22`, borderRadius: 8, padding: "5px 10px", textAlign: "center", minWidth: 56 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: cfg.color }}>{count}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{status}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...selectStyle, width: "auto", minWidth: 130 }}>
          <option value="All">All Statuses</option>
          {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={{ ...selectStyle, width: "auto", minWidth: 130 }}>
          <option value="All">All Assignees</option>
          <option value="">Unclaimed</option>
          {TEAM_B_MEMBERS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredRequests.map(req => {
          const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG["Incoming"];
          const priorityCfg = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG["Medium"];
          const topicCount = Object.values(req.topicsSelected || {}).flat().length;
          return (
            <div key={req.id} className="fade-in" onClick={() => setSelectedRequest(req)}
              style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 12, padding: "13px 16px", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", transition: "border-color 0.2s, transform 0.1s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2d3748"; e.currentTarget.style.transform = "translateX(2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a2e"; e.currentTarget.style.transform = "translateX(0)"; }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>#{req.id}</span>
                  <span style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.color}44`, borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>{req.status}</span>
                  <span style={{ color: priorityCfg.color, fontSize: 11, fontWeight: 600 }}>● {req.priority}</span>
                  <span style={{ background: "#1a1a2e", color: "#475569", borderRadius: 5, padding: "2px 7px", fontSize: 11 }}>{req.contentType}</span>
                  <span style={{ background: "#1a1a2e", color: "#475569", borderRadius: 5, padding: "2px 7px", fontSize: 11 }}>{req.reason}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{req.item}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  From <span style={{ color: "#94a3b8" }}>{req.submitterName}</span> · {req.submittedAt}
                  {topicCount > 0 && <> · <span style={{ color: "#60a5fa" }}>{topicCount} topic{topicCount > 1 ? "s" : ""}</span></>}
                  {(req.teamNotes?.length || 0) > 0 && <> · <span style={{ color: "#3b82f6" }}>💬 {req.teamNotes.length}</span></>}
                  {req.attachments?.length > 0 && <> · 📎</>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {req.assignedTo ? (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>{req.assignedTo[0]}</div>
                ) : (
                  <div style={{ fontSize: 11, color: "#475569", fontStyle: "italic" }}>Unclaimed</div>
                )}
                <span style={{ color: "#334155", fontSize: 16 }}>›</span>
              </div>
            </div>
          );
        })}
        {filteredRequests.length === 0 && <div style={{ textAlign: "center", padding: "60px", color: "#334155" }}>No requests match your filters.</div>}
      </div>
      </>}
    </div>
  );

  const renderDetail = () => {
    const req = requests.find(r => r.id === selectedRequest?.id) || selectedRequest;
    if (!req) return null;
    const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG["Incoming"];

    const DR = ({ label, value }) => value ? (
      <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 6, alignItems: "start" }}>
        <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 13, color: "#cbd5e1", wordBreak: "break-all" }}>{value}</span>
      </div>
    ) : null;

    const allTopics = Object.entries(req.topicsSelected || {}).flatMap(([catId, vals]) =>
      (vals || []).map(v => v)
    );

    const detailFields = [
      ["Region", req.region], ["Citation", req.citation],
      ["Asset style", req.assetStyle], ["Asset status", req.assetsStatus],
      ["Alert type", req.alertType], ["Does it replace?", req.doesReplace],
      ["Replacement link", req.replacementLink],
      ["Passage date", req.passageDate], ["Effective date", req.effectiveDate],
      ["Important date", req.importantDate], ["Display/sort by", req.displaySortBy],
      ["Employee count", req.employeeCount], ["Jurisdiction emp. count", req.jurisdictionEmployeeCount],
      ["Preview time", req.previewTime], ["Compliance reminder", req.complianceReminder],
      ["Link alert to", req.linkAlertTo], ["Archive date", req.archiveDate],
    ].filter(([, v]) => v);

    return (
      <div className="slide-in" style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "1px solid #1f2937", color: "#64748b", borderRadius: 8, padding: "6px 14px", fontSize: 13, marginBottom: 22 }}>
          ← Back to tracker
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 250px", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 16 }}>{req.item}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date Received</p>
                  <p style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{req.submittedAt}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Requested By</p>
                  <p style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{req.submitterName}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned To</p>
                  <p style={{ fontSize: 13, color: req.assignedTo ? "#e2e8f0" : "#64748b", fontWeight: 500, fontStyle: req.assignedTo ? "normal" : "italic" }}>{req.assignedTo || "Unclaimed"}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</p>
                  <span style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.color}44`, borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{req.status}</span>
                </div>
              </div>
            </div>

            {detailFields.length > 0 && (
              <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 11, color: "#334155", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Submission Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {detailFields.map(([label, value]) => <DR key={label} label={label} value={value} />)}
                </div>
              </div>
            )}

            {allTopics.length > 0 && (
              <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 11, color: "#334155", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Topics ({allTopics.length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {allTopics.map((t, i) => <span key={i} style={{ background: "#1e293b", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#94a3b8" }}>{t}</span>)}
                </div>
              </div>
            )}

            {req.notes && (
              <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 11, color: "#334155", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Submitter Notes</p>
                <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{req.notes}</p>
              </div>
            )}

            {req.attachments?.length > 0 && req.attachments[0] && (
              <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 11, color: "#334155", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>SharePoint / OneDrive</p>
                <a href={req.attachments[0]} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#60a5fa", wordBreak: "break-all", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >
                  🔗 {req.attachments[0]}
                </a>
              </div>
            )}

            <div>
              <p style={{ fontSize: 11, color: "#334155", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Team Notes {req.teamNotes?.length > 0 && `(${req.teamNotes.length})`}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {(req.teamNotes || []).map((note, i) => (
                  <div key={i} style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa" }}>{note.author}</span>
                      <span style={{ fontSize: 11, color: "#334155" }}>{note.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{note.text}</p>
                  </div>
                ))}
                {!req.teamNotes?.length && <p style={{ fontSize: 13, color: "#334155" }}>No notes yet.</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a note..." value={teamNote}
                  onChange={e => setTeamNote(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTeamNote(req.id)} />
                <button onClick={() => addTeamNote(req.id)} style={{ background: "#1d4ed8", border: "none", color: "white", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>Add</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Status", content: (
                <select value={req.status} onChange={e => updateRequest(req.id, { status: e.target.value })} style={selectStyle}>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
              )},
              { label: "Assigned To", content: (
                <select value={req.assignedTo || ""} onChange={e => updateRequest(req.id, { assignedTo: e.target.value })} style={selectStyle}>
                  <option value="">Unclaimed</option>
                  {TEAM_B_MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
              )},
            ].map(({ label, content }) => (
              <div key={label} style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 11, color: "#334155", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</p>
                {content}
              </div>
            ))}
            <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 11, color: "#334155", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Details</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Priority", <span style={{ color: PRIORITY_CONFIG[req.priority]?.color || "#94a3b8", fontWeight: 600 }}>● {req.priority}</span>],
                  ["Content type", req.contentType],
                  ["Reason", req.reason],
                  req.effectiveDate && ["Effective date", req.effectiveDate],
                  req.alertType && ["Alert type", req.alertType],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k}>
                    <p style={{ fontSize: 11, color: "#334155", marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: 13, color: "#94a3b8" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        button { cursor: pointer; font-family: inherit; }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.2s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ borderBottom: "1px solid #1a1a2e", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, background: "#080810", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: "#f8fafc" }}>Relay</span>
          <span style={{ color: "#334155", fontSize: 12 }}>/ HR Content Workflow</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["submit", "📬 Submit Request", "Incoming"], ["tracker", "📋 Tracker", "Content Editors"]].map(([v, label, team]) => (
            <button key={v} onClick={() => { setView(v); setSelectedRequest(null); }} style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid",
              borderColor: view === v ? "#3b82f6" : "#1a1a2e",
              background: view === v ? "#0d1f3c" : "transparent",
              color: view === v ? "#60a5fa" : "#64748b",
              fontSize: 12, fontWeight: 500,
              display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.3,
            }}>
              <span>{label}</span><span style={{ fontSize: 10, opacity: 0.6 }}>{team}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>
            {requests.filter(r => r.status === "Received").length}
          </div>
          <span style={{ fontSize: 11, color: "#64748b" }}>new</span>
        </div>
      </div>

      {view === "submit" && renderSubmit()}
      {view === "tracker" && !selectedRequest && renderTracker()}
      {view === "tracker" && selectedRequest && renderDetail()}
    </div>
  );
}
