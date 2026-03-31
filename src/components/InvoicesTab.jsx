// import { useEffect, useState, useCallback } from "react";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// // ── Config ────────────────────────────────────────────────────────────────────
// const TYPE_CFG = {
//   booking:   { icon: "📄", label: "Tax Invoice",      color: "#c9a96e", bg: "rgba(201,169,110,0.12)" },
//   milestone: { icon: "🧾", label: "Payment Receipt",  color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
// };
// const STATUS_CFG = {
//   issued:    { color: "#22c55e", label: "Issued"    },
//   cancelled: { color: "#ef4444", label: "Cancelled" },
//   revised:   { color: "#f59e0b", label: "Revised"   },
// };

// // ── Invoice Preview Modal ─────────────────────────────────────────────────────
// function InvoicePreviewModal({ invoiceId, token, onClose }) {
//   const [html,    setHtml]    = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [sent,    setSent]    = useState(false);

//   useEffect(() => {
//     if (!invoiceId) return;
//     fetch(`${API_BASE}/invoices/${invoiceId}/html`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => r.json())
//       .then((d) => { setHtml(d.html || ""); setLoading(false); })
//       .catch(() => setLoading(false));

//     const esc = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", esc);
//     return () => window.removeEventListener("keydown", esc);
//   }, [invoiceId]);

//   const handleResend = async () => {
//     setSending(true);
//     try {
//       await fetch(`${API_BASE}/invoices/${invoiceId}/resend`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//       });
//       setSent(true);
//       setTimeout(() => setSent(false), 3000);
//     } catch (_) {}
//     setSending(false);
//   };

//   const handlePrint = () => {
//     const frame = document.getElementById("inv-frame");
//     if (frame) { frame.contentWindow.focus(); frame.contentWindow.print(); }
//   };

//   return (
//     <div onClick={onClose} style={{
//       position: "fixed", inset: 0, zIndex: 2000,
//       background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)",
//       display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
//     }}>
//       <div onClick={(e) => e.stopPropagation()} style={{
//         background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "880px",
//         height: "90vh", display: "flex", flexDirection: "column",
//         boxShadow: "0 24px 80px rgba(0,0,0,0.5)", overflow: "hidden",
//       }}>
//         {/* Toolbar */}
//         <div style={{
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           padding: "12px 20px", background: "#1a1a2e",
//           borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0,
//         }}>
//           <div style={{ fontSize: "14px", fontWeight: "700", color: "#c9a96e" }}>📄 Invoice Preview</div>
//           <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//             {sent && <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>✓ Sent!</span>}
//             <button onClick={handleResend} disabled={sending} style={{
//               padding: "7px 16px", borderRadius: "7px", cursor: sending ? "not-allowed" : "pointer",
//               fontSize: "12px", fontWeight: "700",
//               background: "rgba(201,169,110,0.2)", color: "#c9a96e",
//               border: "1px solid rgba(201,169,110,0.35)", opacity: sending ? 0.6 : 1,
//             }}>
//               {sending ? "Sending…" : "📧 Resend Email"}
//             </button>
//             <button onClick={handlePrint} style={{
//               padding: "7px 16px", borderRadius: "7px", cursor: "pointer",
//               fontSize: "12px", fontWeight: "700",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none",
//             }}>🖨 Print / PDF</button>
//             <button onClick={onClose} style={{
//               background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
//               color: "#fff", width: "32px", height: "32px", borderRadius: "8px",
//               cursor: "pointer", fontSize: "16px", display: "flex",
//               alignItems: "center", justifyContent: "center",
//             }}>×</button>
//           </div>
//         </div>

//         {/* Invoice iframe */}
//         <div style={{ flex: 1, overflow: "hidden", background: "#f4f4f4" }}>
//           {loading ? (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
//                           height: "100%", color: "#64748b", flexDirection: "column", gap: "10px" }}>
//               <div style={{ fontSize: "32px" }}>⏳</div>
//               <div>Loading invoice…</div>
//             </div>
//           ) : (
//             <iframe
//               id="inv-frame"
//               srcDoc={html}
//               style={{ width: "100%", height: "100%", border: "none" }}
//               title="Invoice"
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Invoice Card ──────────────────────────────────────────────────────────────
// function InvoiceCard({ invoice, onView }) {
//   const type   = TYPE_CFG[invoice.type]     || TYPE_CFG.booking;
//   const status = STATUS_CFG[invoice.status] || STATUS_CFG.issued;

//   // Build currency formatter from invoice snapshot
//   const sym    = invoice.currency_symbol   || "₹";
//   const pos    = invoice.currency_symbol_position || "before";
//   const dec    = invoice.currency_decimals ?? 2;
//   const locale = invoice.number_format_locale || "en-IN";

//   const f = (n) => {
//     if (n == null) return "—";
//     const formatted = new Intl.NumberFormat(locale, {
//       minimumFractionDigits: dec, maximumFractionDigits: dec,
//     }).format(parseFloat(n));
//     return pos === "after" ? `${formatted} ${sym}` : `${sym}${formatted}`;
//   };

//   const labels = invoice.fee_labels || {};
//   const fees = [
//     invoice.processing_fee   > 0 && { label: labels.processing   || "Processing",   val: invoice.processing_fee   },
//     invoice.stamp_duty        > 0 && { label: labels.stamp_duty   || "Stamp Duty",   val: invoice.stamp_duty       },
//     invoice.registration_fee  > 0 && { label: labels.registration || "Reg Fee",      val: invoice.registration_fee },
//     invoice.maintenance_charge> 0 && { label: labels.maintenance  || "Maintenance",  val: invoice.maintenance_charge},
//     invoice.custom_fee1       > 0 && { label: labels.custom1      || "Custom 1",     val: invoice.custom_fee1      },
//     invoice.custom_fee2       > 0 && { label: labels.custom2      || "Custom 2",     val: invoice.custom_fee2      },
//     invoice.tax_amount        > 0 && { label: labels.tax          || invoice.tax_label || "Tax", val: invoice.tax_amount },
//   ].filter(Boolean);

//   return (
//     <div
//       onClick={() => onView(invoice.id)}
//       style={{
//         background: "rgba(255,255,255,0.03)",
//         border: "1px solid rgba(255,255,255,0.07)",
//         borderRadius: "14px", padding: "18px 20px",
//         cursor: "pointer", transition: "border-color 0.2s",
//       }}
//       onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.25)")}
//       onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
//     >
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
//         <div style={{ flex: 1 }}>
//           {/* Header row */}
//           <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
//             <span style={{
//               padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
//               background: type.bg, color: type.color, border: `1px solid ${type.color}33`,
//             }}>
//               {type.icon} {type.label}
//             </span>
//             <span style={{ fontSize: "15px", fontWeight: "800", color: "#e2e8f0" }}>
//               #{invoice.invoice_number}
//             </span>
//             <span style={{ fontSize: "11px", fontWeight: "700", color: status.color }}>
//               {status.label}
//             </span>
//           </div>

//           {/* Unit */}
//           <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "3px" }}>
//             🏠 Unit {invoice.plot_number}
//             {invoice.plot_type  && ` · ${invoice.plot_type}`}
//             {invoice.area       && ` · ${invoice.area} ${invoice.area_unit || ''}`}
//             {invoice.project_name && ` · ${invoice.project_name}`}
//           </div>

//           {/* Milestone label for receipts */}
//           {invoice.type === "milestone" && invoice.meta?.milestone_label && (
//             <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>
//               💳 {invoice.meta.milestone_label}
//             </div>
//           )}

//           {/* Date + booking */}
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
//             Booking #{invoice.booking_id} ·{" "}
//             {new Date(invoice.issued_at).toLocaleDateString("en-IN", {
//               day: "numeric", month: "short", year: "numeric",
//             })}
//             {invoice.email_sent_at && (
//               <span style={{ marginLeft: "10px", color: "#22c55e" }}>
//                 ✉ Sent {new Date(invoice.email_sent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
//                 {invoice.broker_copy_sent && " + broker copy"}
//               </span>
//             )}
//           </div>

//           {/* Fee pills */}
//           {fees.length > 0 && (
//             <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
//               {fees.map((fee, i) => (
//                 <span key={i} style={{
//                   fontSize: "10px", fontWeight: "600",
//                   padding: "2px 8px", borderRadius: "10px",
//                   background: "rgba(255,255,255,0.05)",
//                   color: "#94a3b8",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                 }}>
//                   {fee.label}: {f(fee.val)}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Amounts */}
//         <div style={{ textAlign: "right", flexShrink: 0 }}>
//           <div style={{ fontSize: "11px", color: "#475569", marginBottom: "2px" }}>
//             {invoice.type === "milestone" ? "Received" : "Amount Paid"}
//           </div>
//           <div style={{ fontSize: "22px", fontWeight: "800", color: "#c9a96e" }}>
//             {f(invoice.amount_paid)}
//           </div>
//           {invoice.total_amount > invoice.amount_paid && (
//             <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
//               of {f(invoice.total_amount)}
//             </div>
//           )}
//           {invoice.balance_due > 0 ? (
//             <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "3px", fontWeight: "600" }}>
//               Due: {f(invoice.balance_due)}
//             </div>
//           ) : invoice.type !== "milestone" && (
//             <div style={{ fontSize: "11px", color: "#22c55e", marginTop: "3px" }}>✓ Fully Paid</div>
//           )}
//         </div>
//       </div>

//       <div style={{ marginTop: "10px", fontSize: "11px", color: "#c9a96e", fontWeight: "600" }}>
//         🔍 Tap to view & print invoice →
//       </div>
//     </div>
//   );
// }

// // ── Main InvoicesTab ──────────────────────────────────────────────────────────
// export default function InvoicesTab({ user, fmt }) {
//   const [invoices,  setInvoices]  = useState([]);
//   const [loading,   setLoading]   = useState(true);
//   const [filter,    setFilter]    = useState("all");
//   const [previewId, setPreviewId] = useState(null);

//   const fetchInvoices = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/invoices`, {
//         headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       });
//       const data = await res.json();
//       setInvoices(Array.isArray(data) ? data : []);
//     } catch (_) {}
//     setLoading(false);
//   }, [user.token]);

//   useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

//   const filtered = filter === "all" ? invoices : invoices.filter((i) => i.type === filter);

//   // Stats using the invoice's own currency snapshot
//   const sym = invoices[0]?.currency_symbol || "₹";
//   const locale = invoices[0]?.number_format_locale || "en-IN";
//   const dec  = invoices[0]?.currency_decimals ?? 2;
//   const fStat = (n) => sym + new Intl.NumberFormat(locale, { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);

//   const totalPaid  = invoices.filter((i) => i.status === "issued").reduce((s, i) => s + parseFloat(i.amount_paid || 0), 0);
//   const totalDue   = invoices.filter((i) => i.status === "issued" && i.type !== "booking").reduce((s, i) => s + parseFloat(i.balance_due || 0), 0);

//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
//       Loading invoices…
//     </div>
//   );

//   return (
//     <div>
//       {previewId && (
//         <InvoicePreviewModal
//           invoiceId={previewId}
//           token={user.token}
//           onClose={() => setPreviewId(null)}
//         />
//       )}

//       {/* Stats */}
//       {invoices.length > 0 && (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Invoices", value: invoices.length,    icon: "📄", color: "#c9a96e" },
//             { label: "Total Paid",     value: fStat(totalPaid),   icon: "💰", color: "#22c55e" },
//             { label: "Balance Due",    value: fStat(totalDue),    icon: "⏳", color: totalDue > 0 ? "#f59e0b" : "#22c55e" },
//           ].map(({ label, value, icon, color }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "18px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Filter tabs */}
//       <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "8px", width: "fit-content" }}>
//         {[["all","All"],["booking","Tax Invoices"],["milestone","Receipts"]].map(([val, label]) => (
//           <button key={val} onClick={() => setFilter(val)} style={{
//             padding: "5px 14px", borderRadius: "6px", cursor: "pointer",
//             fontSize: "12px", fontWeight: "600",
//             background: filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//             color:      filter === val ? "#c9a96e" : "#64748b",
//             border:     filter === val ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//           }}>{label}</button>
//         ))}
//       </div>

//       {/* Empty */}
//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "48px", marginBottom: "10px" }}>📄</div>
//           <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//             No invoices yet
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Invoices are auto-generated when a booking is confirmed and for each milestone payment.
//           </div>
//         </div>
//       )}

//       {/* List */}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {filtered.map((inv) => (
//           <InvoiceCard key={inv.id} invoice={inv} onView={setPreviewId} />
//         ))}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

const TYPE_CFG = {
  booking: {
    icon: "📄",
    label: "Tax Invoice",
    color: "#c9a96e",
    bg: "rgba(201,169,110,0.12)",
  },
  milestone: {
    icon: "🧾",
    label: "Payment Receipt",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
};
const STATUS_CFG = {
  issued: { color: "#22c55e", label: "Issued" },
  cancelled: { color: "#ef4444", label: "Cancelled" },
  revised: { color: "#f59e0b", label: "Revised" },
};

function InvoicePreviewModal({ invoiceId, token, onClose }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;
    fetch(`${API_BASE}/invoices/${invoiceId}/html`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((d) => {
        setHtml(d.html || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [invoiceId]);

  const handleResend = async () => {
    setSending(true);
    try {
      await fetch(`${API_BASE}/invoices/${invoiceId}/resend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (_) {}
    setSending(false);
  };

  const handlePrint = () => {
    const frame = document.getElementById("inv-frame");
    if (frame) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "880px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
          }}
        >
          <div
            style={{ fontSize: "14px", fontWeight: "700", color: "#c9a96e" }}
          >
            📄 Invoice Preview
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {sent && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#22c55e",
                  fontWeight: "600",
                }}
              >
                ✓ Sent!
              </span>
            )}
            <button
              onClick={handleResend}
              disabled={sending}
              style={{
                padding: "7px 16px",
                borderRadius: "7px",
                cursor: sending ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "700",
                background: "rgba(201,169,110,0.2)",
                color: "#c9a96e",
                border: "1px solid rgba(201,169,110,0.35)",
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? "Sending…" : "📧 Resend Email"}
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: "7px 16px",
                borderRadius: "7px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "700",
                background: "linear-gradient(135deg,#c9a96e,#a07840)",
                color: "#fff",
                border: "none",
              }}
            >
              🖨 Print / PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", background: "#f4f4f4" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#64748b",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "32px" }}>⏳</div>
              <div>Loading invoice…</div>
            </div>
          ) : (
            <iframe
              id="inv-frame"
              srcDoc={html}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Invoice"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceCard({ invoice, onView }) {
  const type = TYPE_CFG[invoice.type] || TYPE_CFG.booking;
  const status = STATUS_CFG[invoice.status] || STATUS_CFG.issued;

  const sym = invoice.currency_symbol || "₹";
  const pos = invoice.currency_symbol_position || "before";
  const dec = invoice.currency_decimals ?? 2;
  const locale = invoice.number_format_locale || "en-IN";

  const f = (n) => {
    if (n == null) return "—";
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(parseFloat(n));
    return pos === "after" ? `${formatted} ${sym}` : `${sym}${formatted}`;
  };

  const labels = invoice.fee_labels || {};
  const fees = [
    invoice.processing_fee > 0 && {
      label: labels.processing || "Processing",
      val: invoice.processing_fee,
    },
    invoice.stamp_duty > 0 && {
      label: labels.stamp_duty || "Stamp Duty",
      val: invoice.stamp_duty,
    },
    invoice.registration_fee > 0 && {
      label: labels.registration || "Reg Fee",
      val: invoice.registration_fee,
    },
    invoice.maintenance_charge > 0 && {
      label: labels.maintenance || "Maintenance",
      val: invoice.maintenance_charge,
    },
    invoice.custom_fee1 > 0 && {
      label: labels.custom1 || "Custom 1",
      val: invoice.custom_fee1,
    },
    invoice.custom_fee2 > 0 && {
      label: labels.custom2 || "Custom 2",
      val: invoice.custom_fee2,
    },
    invoice.tax_amount > 0 && {
      label: labels.tax || invoice.tax_label || "Tax",
      val: invoice.tax_amount,
    },
  ].filter(Boolean);

  return (
    <div
      onClick={() => onView(invoice.id)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "18px 20px",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "rgba(201,169,110,0.25)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                padding: "2px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                background: type.bg,
                color: type.color,
                border: `1px solid ${type.color}33`,
              }}
            >
              {type.icon} {type.label}
            </span>
            <span
              style={{ fontSize: "15px", fontWeight: "800", color: "#e2e8f0" }}
            >
              #{invoice.invoice_number}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>

          <div
            style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "3px" }}
          >
            🏠 Unit {invoice.plot_number}
            {invoice.plot_type && ` · ${invoice.plot_type}`}
            {invoice.area && ` · ${invoice.area} ${invoice.area_unit || ""}`}
            {invoice.project_name && ` · ${invoice.project_name}`}
          </div>

          {invoice.type === "milestone" && invoice.meta?.milestone_label && (
            <div
              style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}
            >
              💳 {invoice.meta.milestone_label}
            </div>
          )}

          <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
            Booking #{invoice.booking_id} ·{" "}
            {new Date(invoice.issued_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {invoice.email_sent_at && (
              <span style={{ marginLeft: "10px", color: "#22c55e" }}>
                ✉ Sent{" "}
                {new Date(invoice.email_sent_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                {invoice.broker_copy_sent && " + broker copy"}
              </span>
            )}
          </div>

          {fees.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "5px",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              {fees.map((fee, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#94a3b8",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {fee.label}: {f(fee.val)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{ fontSize: "11px", color: "#475569", marginBottom: "2px" }}
          >
            {invoice.type === "milestone" ? "Received" : "Amount Paid"}
          </div>
          <div
            style={{ fontSize: "22px", fontWeight: "800", color: "#c9a96e" }}
          >
            {f(invoice.amount_paid)}
          </div>
          {parseFloat(invoice.total_amount) >
            parseFloat(invoice.amount_paid) && (
            <div
              style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}
            >
              of {f(invoice.total_amount)}
            </div>
          )}
          {parseFloat(invoice.balance_due) > 0 ? (
            <div
              style={{
                fontSize: "12px",
                color: "#f59e0b",
                marginTop: "3px",
                fontWeight: "600",
              }}
            >
              Due: {f(invoice.balance_due)}
            </div>
          ) : (
            invoice.type !== "milestone" && (
              <div
                style={{ fontSize: "11px", color: "#22c55e", marginTop: "3px" }}
              >
                ✓ Fully Paid
              </div>
            )
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "11px",
          color: "#c9a96e",
          fontWeight: "600",
        }}
      >
        🔍 Tap to view & print invoice →
      </div>
    </div>
  );
}

export default function InvoicesTab({ user, fmt }) {

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [previewId, setPreviewId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (_) {}
    setLoading(false);
  }, [user.token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

    if (!user) return null;

  const filtered =
    filter === "all" ? invoices : invoices.filter((i) => i.type === filter);

  const sym = invoices[0]?.currency_symbol || "₹";
  const locale = invoices[0]?.number_format_locale || "en-IN";
  const dec = invoices[0]?.currency_decimals ?? 2;
  const fStat = (n) =>
    sym +
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(n);

  // FIX: Use booking invoices only as the source of truth for money stats.
  // Milestone receipts record per-payment amounts that are already reflected
  // in the booking invoice's amount_paid — summing both would double-count.
  // const bookingInvoices = invoices.filter((i) => i.status === "issued" && i.type === "booking");
  // const totalPaid = bookingInvoices.reduce((s, i) => s + parseFloat(i.amount_paid  || 0), 0);
  // const totalDue  = bookingInvoices.reduce((s, i) => s + parseFloat(i.balance_due  || 0), 0);

  // Group milestone receipts by booking_id to get real paid amounts
  const milestonesByBooking = invoices
    .filter((i) => i.status === "issued" && i.type === "milestone")
    .reduce((acc, i) => {
      const bid = i.booking_id;
      acc[bid] = (acc[bid] || 0) + parseFloat(i.amount_paid || 0);
      return acc;
    }, {});

  // Booking invoices give us total_amount per booking
  const bookingInvoices = invoices.filter(
    (i) => i.status === "issued" && i.type === "booking",
  );

  const totalPaid = bookingInvoices.reduce((s, i) => {
    // Prefer sum of milestone receipts if any exist, else fall back to booking invoice amount_paid
    const milestonePaid = milestonesByBooking[i.booking_id];
    return (
      s +
      (milestonePaid != null ? milestonePaid : parseFloat(i.amount_paid || 0))
    );
  }, 0);

  const totalDue = bookingInvoices.reduce((s, i) => {
    const total = parseFloat(i.total_amount || 0);
    const milestonePaid = milestonesByBooking[i.booking_id];
    const paid =
      milestonePaid != null ? milestonePaid : parseFloat(i.amount_paid || 0);
    return s + Math.max(0, total - paid);
  }, 0);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
        Loading invoices…
      </div>
    );

  return (
    <div>
      {previewId && (
        <InvoicePreviewModal
          invoiceId={previewId}
          token={user.token}
          onClose={() => setPreviewId(null)}
        />
      )}

      {invoices.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              label: "Total Invoices",
              value: invoices.length,
              icon: "📄",
              color: "#c9a96e",
            },
            {
              label: "Total Paid",
              value: fStat(totalPaid),
              icon: "💰",
              color: "#22c55e",
            },
            {
              label: "Balance Due",
              value: fStat(totalDue),
              icon: "⏳",
              color: totalDue > 0 ? "#f59e0b" : "#22c55e",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>
                {icon}
              </div>
              <div style={{ fontSize: "18px", fontWeight: "800", color }}>
                {value}
              </div>
              <div
                style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "16px",
          background: "rgba(255,255,255,0.03)",
          padding: "4px",
          borderRadius: "8px",
          width: "fit-content",
        }}
      >
        {[
          ["all", "All"],
          ["booking", "Tax Invoices"],
          ["milestone", "Receipts"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: "5px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              background:
                filter === val ? "rgba(201,169,110,0.15)" : "transparent",
              color: filter === val ? "#c9a96e" : "#64748b",
              border:
                filter === val
                  ? "1px solid rgba(201,169,110,0.25)"
                  : "1px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📄</div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#e2e8f0",
              marginBottom: "6px",
            }}
          >
            No invoices yet
          </div>
          <div style={{ fontSize: "13px", color: "#475569" }}>
            Invoices are auto-generated when a booking is confirmed and for each
            milestone payment.
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((inv) => (
          <InvoiceCard key={inv.id} invoice={inv} onView={setPreviewId} />
        ))}
      </div>
    </div>
  );
}
