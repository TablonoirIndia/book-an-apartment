import { useState } from "react";

const GW_CFG = {
  razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
  stripe:   { icon: "💎", color: "#8b5cf6", label: "Stripe"   },
  phonepe:  { icon: "📱", color: "#f59e0b", label: "PhonePe"  },
  cash:     { icon: "💵", color: "#22c55e", label: "Cash"     },
  manual:   { icon: "🏦", color: "#64748b", label: "Manual"   },
};
const TXN_STATUS = {
  success:  { color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Success"  },
  pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Pending"  },
  failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Failed"   },
  refunded: { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", label: "Refunded" },
};

// Filter tab definitions — built dynamically so tabs only show when relevant records exist
const FILTER_TABS = [
  { val: "all",      label: "All"      },
  { val: "success",  label: "Paid"     },
  { val: "pending",  label: "Pending"  },
  { val: "failed",   label: "Failed"   },
  { val: "refunded", label: "Refunded" },
];



const PaymentsTab = ({ payments, loading, fmt, fmtExact, user }) => {


  const [filter, setFilter] = useState("all");

    if (!user) return null;

  const totalPaid     = payments.filter((p) => p.status === "success").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalRefunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const successCount  = payments.filter((p) => p.status === "success").length;

  // Only show filter tabs that have at least one matching record (+ always show "All")
  const visibleTabs = FILTER_TABS.filter(
    (t) => t.val === "all" || payments.some((p) => p.status === t.val)
  );

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading payment history...
    </div>
  );

  const statCards = [
    { label: "Total Paid (incl. tax)",  value: fmtExact(totalPaid),   color: "#22c55e", icon: "💰" },
    { label: "Transactions",            value: successCount,           color: "#c9a96e", icon: "🧾" },
    { label: "Pending",                 value: payments.filter((p) => p.status === "pending").length, color: "#f59e0b", icon: "⏳" },
    ...(totalRefunded > 0 ? [{ label: "Refunded (incl. tax)", value: fmtExact(totalRefunded), color: "#ef4444", icon: "↩️" }] : []),
  ];

  return (
    <div>
      {payments.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
          {statCards.map(({ label, value, color, icon }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs — mirrors the Invoice tab style */}
      {payments.length > 0 && visibleTabs.length > 1 && (
        <div style={{
          display: "flex", gap: "4px", marginBottom: "16px",
          background: "rgba(255,255,255,0.03)", padding: "4px",
          borderRadius: "8px", width: "fit-content",
        }}>
          {visibleTabs.map(({ val, label }) => {
            const count = val === "all" ? payments.length : payments.filter((p) => p.status === val).length;
            const active = filter === val;
            // Pick accent colour per status
            const activeColor = val === "success"  ? "#22c55e"
                              : val === "pending"   ? "#f59e0b"
                              : val === "failed"    ? "#ef4444"
                              : val === "refunded"  ? "#94a3b8"
                              : "#c9a96e"; // "all"
            return (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  padding: "5px 14px", borderRadius: "6px", cursor: "pointer",
                  fontSize: "12px", fontWeight: "600",
                  background: active ? `${activeColor}18` : "transparent",
                  color:      active ? activeColor         : "#64748b",
                  border:     active ? `1px solid ${activeColor}40` : "1px solid transparent",
                  display: "flex", alignItems: "center", gap: "5px",
                }}
              >
                {label}
                <span style={{
                  fontSize: "10px", fontWeight: "700",
                  background: active ? `${activeColor}25` : "rgba(255,255,255,0.06)",
                  color: active ? activeColor : "#475569",
                  padding: "1px 6px", borderRadius: "8px",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
            {filter === "all" ? "No payment history yet" : `No ${filter} payments`}
          </div>
          <div style={{ fontSize: "13px", color: "#475569" }}>
            {filter === "all"
              ? "Your payment transactions will appear here once you make a booking payment."
              : `You have no ${filter} transactions.`}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((p) => {
          const gw         = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
          const txn        = TXN_STATUS[p.status] || TXN_STATUS.pending;
          const isRefunded = p.status === "refunded";

          return (
            <div key={p.id} style={{
              background:   isRefunded ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)",
              border:       `1px solid ${isRefunded ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: "12px", padding: "16px 18px",
              borderLeft:   `3px solid ${txn.color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span style={{ fontSize: "16px" }}>{gw.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{gw.label}</span>
                    <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
                                   background: txn.bg, color: txn.color, border: `1px solid ${txn.color}33` }}>
                      {txn.label}
                    </span>
                    {isRefunded && (
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
                                     background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        ↩ Refunded
                      </span>
                    )}
                    {p._synthetic && (
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
                                     background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                        🏢 Walk-in / Cash
                      </span>
                    )}
                    {!p._synthetic && p.mode && p.mode !== "online" && (
                      <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "10px",
                                     background: "rgba(255,255,255,0.05)", color: "#64748b",
                                     border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize" }}>
                        {p.mode}
                      </span>
                    )}
                  </div>
                  {p.booking && (
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
                      🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
                    </div>
                  )}
                  {(p.gateway_payment_id || p.gateway_order_id) && (
                    <div style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace" }}>
                      Ref: {p.gateway_payment_id || p.gateway_order_id}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {isRefunded ? (
                    <>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#64748b", textDecoration: "line-through" }}>
                        {fmtExact(p.amount)}
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444", marginTop: "2px" }}>
                        −{fmtExact(p.amount)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "1px" }}>incl. taxes · refunded</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: txn.color }}>{fmtExact(p.amount)}</div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "1px" }}>incl. taxes</div>
                    </>
                  )}
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                    {p.paid_at
                      ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
              {p.notes && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#475569", padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                  📝 {p.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentsTab;
