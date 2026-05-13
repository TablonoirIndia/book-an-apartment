// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// const makeFmt =
//   (symbol = "₹", code = "INR", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", {
//       maximumFractionDigits: 0,
//     }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol} ${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: {
//     color: "#22c55e",
//     bg: "rgba(34,197,94,0.12)",
//     label: "Confirmed",
//   },
//   pending: {
//     color: "#f59e0b",
//     bg: "rgba(245,158,11,0.12)",
//     label: "Pending Payment",
//   },
//   cancelled: {
//     color: "#ef4444",
//     bg: "rgba(239,68,68,0.12)",
//     label: "Cancelled",
//   },
// };

// const COMM_CFG = {
//   pending: { color: "#f59e0b", label: "Pending Approval" },
//   approved: { color: "#3b82f6", label: "Approved" },
//   paid: { color: "#22c55e", label: "Paid" },
//   rejected: { color: "#ef4444", label: "Rejected" },
// };

// // ── Milestone tracker ──────────────────────────────────────────────
// const MilestoneTracker = ({ booking, fmt }) => {
//   const plan = booking.payment_plan;
//   if (!plan?.milestones?.length) return null;
//   const price = parseFloat(booking.price || 0);
//   const isConfirmed = booking.booking_status === "confirmed";

//   return (
//     <div style={{ marginTop: "16px" }}>
//       <div
//         style={{
//           fontSize: "11px",
//           color: "#64748b",
//           fontWeight: "700",
//           letterSpacing: "1px",
//           textTransform: "uppercase",
//           marginBottom: "10px",
//         }}
//       >
//         Payment Schedule — {plan.name}
//       </div>
//       {plan.milestones.map((m, i) => {
//         const amt = m.percentage
//           ? Math.round((price * m.percentage) / 100)
//           : m.fixed_amount;
//         const isPaid = i === 0 && isConfirmed;
//         const isDue = i === 0 && !isConfirmed;
//         return (
//           <div
//             key={i}
//             style={{
//               display: "flex",
//               gap: "12px",
//               alignItems: "flex-start",
//               marginBottom: "8px",
//             }}
//           >
//             <div
//               style={{
//                 width: "28px",
//                 height: "28px",
//                 borderRadius: "50%",
//                 flexShrink: 0,
//                 marginTop: "2px",
//                 background: isPaid
//                   ? "#c9a96e"
//                   : isDue
//                     ? "rgba(201,169,110,0.2)"
//                     : "rgba(255,255,255,0.04)",
//                 border: `2px solid ${isPaid ? "#c9a96e" : isDue ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: "11px",
//                 fontWeight: "800",
//                 color: isPaid ? "#000" : isDue ? "#c9a96e" : "#334155",
//               }}
//             >
//               {isPaid ? "✓" : i + 1}
//             </div>
//             <div
//               style={{
//                 flex: 1,
//                 padding: "8px 12px",
//                 borderRadius: "8px",
//                 background: isPaid
//                   ? "rgba(201,169,110,0.08)"
//                   : isDue
//                     ? "rgba(201,169,110,0.04)"
//                     : "rgba(255,255,255,0.02)",
//                 border: `1px solid ${isPaid ? "rgba(201,169,110,0.25)" : isDue ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.05)"}`,
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <div>
//                   <div
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: "700",
//                       color: isPaid ? "#c9a96e" : isDue ? "#e2e8f0" : "#475569",
//                     }}
//                   >
//                     {m.label}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "11px",
//                       color: "#475569",
//                       marginTop: "1px",
//                     }}
//                   >
//                     {m.percentage}% of total
//                     {isDue && (
//                       <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
//                         ← Due now
//                       </span>
//                     )}
//                     {isPaid && (
//                       <span style={{ color: "#22c55e", marginLeft: "8px" }}>
//                         Paid
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "800",
//                     color: isPaid ? "#c9a96e" : isDue ? "#e2e8f0" : "#334155",
//                   }}
//                 >
//                   {fmt(amt)}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// // ── Booking Card ───────────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmt }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [cancelling, setCancelling] = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);
//   const cfg = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan = booking.payment_plan;
//   const price = parseFloat(booking.price || 0);
//   const downAmt = booking.down_payment_amount
//     ? parseFloat(booking.down_payment_amount)
//     : plan?.milestones?.[0]?.percentage
//       ? Math.round((price * plan.milestones[0].percentage) / 100)
//       : price;
//   const isPending = booking.booking_status === "pending";

//   return (
//     <div
//       style={{
//         background:
//           "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//         border: "1px solid rgba(255,255,255,0.07)",
//         borderRadius: "16px",
//         overflow: "hidden",
//         transition: "border-color 0.2s",
//       }}
//       onMouseEnter={(e) =>
//         (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")
//       }
//       onMouseLeave={(e) =>
//         (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
//       }
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             gap: "12px",
//           }}
//         >
//           <div style={{ flex: 1 }}>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: "17px",
//                   fontWeight: "800",
//                   color: "#e2e8f0",
//                 }}
//               >
//                 Unit {booking.plot_number}
//               </span>
//               <span
//                 style={{
//                   padding: "2px 10px",
//                   borderRadius: "20px",
//                   fontSize: "11px",
//                   fontWeight: "700",
//                   background: cfg.bg,
//                   color: cfg.color,
//                   border: `1px solid ${cfg.color}33`,
//                 }}
//               >
//                 {cfg.label}
//               </span>
//             </div>
//             <div
//               style={{
//                 marginTop: "3px",
//                 fontSize: "12px",
//                 color: "#64748b",
//                 display: "flex",
//                 gap: "10px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <span>{booking.plot_type}</span>
//               {booking.area && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div
//                 style={{
//                   marginTop: "6px",
//                   padding: "6px 10px",
//                   background: "rgba(201,169,110,0.06)",
//                   border: "1px solid rgba(201,169,110,0.12)",
//                   borderRadius: "8px",
//                   fontSize: "12px",
//                 }}
//               >
//                 <span style={{ color: "#64748b" }}>Client: </span>
//                 <span style={{ color: "#c9a96e", fontWeight: "600" }}>
//                   {booking.client_name}
//                 </span>
//                 {booking.client_phone && (
//                   <span style={{ color: "#64748b" }}>
//                     {" "}
//                     · {booking.client_phone}
//                   </span>
//                 )}
//                 {booking.client_email && (
//                   <span style={{ color: "#64748b" }}>
//                     {" "}
//                     · {booking.client_email}
//                   </span>
//                 )}
//               </div>
//             )}
//             <div
//               style={{ marginTop: "4px", fontSize: "11px", color: "#334155" }}
//             >
//               #{booking.id} ·{" "}
//               {new Date(booking.created_at).toLocaleDateString("en-IN", {
//                 day: "numeric",
//                 month: "short",
//                 year: "numeric",
//               })}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div
//               style={{
//                 fontSize: "11px",
//                 color: "#475569",
//                 marginBottom: "2px",
//               }}
//             >
//               {isPending ? "Amount Due" : "Amount Paid"}
//             </div>
//             <div
//               style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}
//             >
//               {fmt(downAmt)}
//             </div>
//             {plan && (
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 Total: {fmt(price)}
//               </div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               marginTop: "10px",
//               padding: "7px 12px",
//               background: "rgba(201,169,110,0.06)",
//               border: "1px solid rgba(201,169,110,0.15)",
//               borderRadius: "8px",
//             }}
//           >
//             <span style={{ fontSize: "13px" }}>💰</span>
//             <span style={{ fontSize: "12px", color: "#64748b" }}>
//               Commission:
//             </span>
//             <span
//               style={{ fontSize: "13px", fontWeight: "800", color: "#c9a96e" }}
//             >
//               {fmt(booking.commission_amount)}
//             </span>
//             {booking.commission_status &&
//               (() => {
//                 const cs =
//                   COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//                 return (
//                   <span
//                     style={{
//                       marginLeft: "auto",
//                       fontSize: "11px",
//                       fontWeight: "700",
//                       color: cs.color,
//                     }}
//                   >
//                     {cs.label}
//                   </span>
//                 );
//               })()}
//           </div>
//         )}

//         <div
//           style={{
//             display: "flex",
//             gap: "8px",
//             marginTop: "12px",
//             flexWrap: "wrap",
//           }}
//         >
//           {isPending && (
//             <button
//               onClick={() => onPay(booking.id)}
//               style={{
//                 padding: "8px 18px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color: "#fff",
//                 border: "none",
//               }}
//             >
//               💳 Complete Payment
//             </button>
//           )}
//           <button
//             onClick={() => setExpanded((e) => !e)}
//             style={{
//               padding: "8px 14px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "12px",
//               background: "transparent",
//               color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)",
//             }}
//           >
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button
//               onClick={() => setConfirmCancel(true)}
//               style={{
//                 padding: "8px 14px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "12px",
//                 background: "transparent",
//                 color: "#ef4444",
//                 border: "1px solid rgba(239,68,68,0.25)",
//                 marginLeft: "auto",
//               }}
//             >
//               ✕ Cancel
//             </button>
//           )}
//           {isPending && confirmCancel && (
//             <div
//               style={{
//                 marginLeft: "auto",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//               }}
//             >
//               <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sure?</span>
//               <button
//                 disabled={cancelling}
//                 onClick={async () => {
//                   setCancelling(true);
//                   await onCancel(booking.id);
//                   setCancelling(false);
//                   setConfirmCancel(false);
//                 }}
//                 style={{
//                   padding: "7px 14px",
//                   borderRadius: "7px",
//                   cursor: "pointer",
//                   fontSize: "12px",
//                   fontWeight: "700",
//                   background: "rgba(239,68,68,0.15)",
//                   color: "#ef4444",
//                   border: "1px solid rgba(239,68,68,0.3)",
//                 }}
//               >
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button
//                 onClick={() => setConfirmCancel(false)}
//                 style={{
//                   padding: "7px 10px",
//                   borderRadius: "7px",
//                   cursor: "pointer",
//                   fontSize: "12px",
//                   background: "transparent",
//                   color: "#64748b",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                 }}
//               >
//                 No
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div
//           style={{
//             padding: "0 20px 16px",
//             borderTop: "1px solid rgba(255,255,255,0.05)",
//             paddingTop: "14px",
//           }}
//         >
//           <MilestoneTracker booking={booking} fmt={fmt} />
//           {!plan && (
//             <div
//               style={{
//                 color: "#475569",
//                 fontSize: "13px",
//                 padding: "10px",
//                 background: "rgba(255,255,255,0.02)",
//                 borderRadius: "8px",
//               }}
//             >
//               💰 Full payment — no instalment plan selected
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Edit Panel ─────────────────────────────────────────────
// // showToast is passed as a prop from the parent so ProfilePanel can use global toasts
// const ProfilePanel = ({ user, onSaved, showToast }) => {
//   const [form, setForm] = useState({
//     name: user.name || "",
//     phone: user.phone || "",
//     current_password: "",
//     new_password: "",
//     confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500);
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) {
//         payload.current_password = form.current_password;
//         payload.new_password = form.new_password;
//       }
//       const res = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${user.token}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok)
//         throw new Error(
//           data.message ||
//             Object.values(data.errors || {})
//               .flat()
//               .join(", ") ||
//             "Update failed",
//         );

//       // ── Toast: profile saved ──────────────────────────────────────
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({
//         ...f,
//         current_password: "",
//         new_password: "",
//         confirm_password: "",
//       }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) {
//       // ── Toast: profile save error ─────────────────────────────────
//       showToast("❌ " + e.message, "error", 4000);
//     }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";

//   const inp = (placeholder, key, type = "text", readOnly = false) => (
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={form[key] ?? ""}
//       readOnly={readOnly}
//       onChange={(e) =>
//         !readOnly && setForm((f) => ({ ...f, [key]: e.target.value }))
//       }
//       style={{
//         width: "100%",
//         padding: "10px 14px",
//         marginBottom: "10px",
//         background: readOnly
//           ? "rgba(255,255,255,0.02)"
//           : "rgba(255,255,255,0.05)",
//         border: "1px solid rgba(255,255,255,0.1)",
//         borderRadius: "8px",
//         color: readOnly ? "#475569" : "#e2e8f0",
//         fontSize: "13px",
//         outline: "none",
//         boxSizing: "border-box",
//         cursor: readOnly ? "not-allowed" : "text",
//       }}
//     />
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <div
//         style={{
//           background: "rgba(255,255,255,0.02)",
//           border: "1px solid rgba(255,255,255,0.07)",
//           borderRadius: "14px",
//           padding: "20px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "16px",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               width: "56px",
//               height: "56px",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "22px",
//               fontWeight: "800",
//               color: "#000",
//               flexShrink: 0,
//             }}
//           >
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div
//               style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}
//             >
//               {user.name}
//             </div>
//             <div
//               style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}
//             >
//               {user.email}
//             </div>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#c9a96e",
//                 marginTop: "2px",
//                 fontWeight: "600",
//                 textTransform: "capitalize",
//               }}
//             >
//               {isBroker
//                 ? `🤝 Broker${user.broker_company ? " · " + user.broker_company : ""}`
//                 : "👤 Buyer"}
//             </div>
//           </div>
//         </div>

//         {isBroker && (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "8px",
//               marginBottom: "16px",
//             }}
//           >
//             {[
//               {
//                 label: "Commission Rate",
//                 value: `${user.commission_rate || 2}%`,
//               },
//               {
//                 label: "Account Status",
//                 value: user.status || "active",
//                 color: user.status === "active" ? "#22c55e" : "#ef4444",
//               },
//             ].map(({ label, value, color }) => (
//               <div
//                 key={label}
//                 style={{
//                   padding: "10px 14px",
//                   background: "rgba(201,169,110,0.06)",
//                   border: "1px solid rgba(201,169,110,0.12)",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "11px",
//                     color: "#64748b",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.5px",
//                   }}
//                 >
//                   {label}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "14px",
//                     fontWeight: "700",
//                     color: color || "#c9a96e",
//                     marginTop: "2px",
//                   }}
//                 >
//                   {value}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <div
//           style={{
//             fontSize: "13px",
//             fontWeight: "700",
//             color: "#e2e8f0",
//             marginBottom: "12px",
//           }}
//         >
//           ✏️ Edit Profile
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "0 12px",
//           }}
//         >
//           <div style={{ gridColumn: "1/-1" }}>{inp("Full Name *", "name")}</div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input
//               value={user.email}
//               readOnly
//               placeholder="Email"
//               style={{
//                 width: "100%",
//                 padding: "10px 14px",
//                 marginBottom: "10px",
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 borderRadius: "8px",
//                 color: "#475569",
//                 fontSize: "13px",
//                 outline: "none",
//                 boxSizing: "border-box",
//                 cursor: "not-allowed",
//               }}
//             />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>
//             {inp("Phone Number", "phone", "tel")}
//           </div>
//         </div>

//         <div
//           style={{
//             fontSize: "12px",
//             color: "#475569",
//             marginBottom: "10px",
//             marginTop: "4px",
//             letterSpacing: "0.5px",
//             textTransform: "uppercase",
//           }}
//         >
//           Change Password (leave blank to keep current)
//         </div>
//         {inp("Current Password", "current_password", "password")}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "0 12px",
//           }}
//         >
//           <div>{inp("New Password", "new_password", "password")}</div>
//           <div>{inp("Confirm Password", "confirm_password", "password")}</div>
//         </div>

//         <button
//           onClick={handleSave}
//           disabled={saving || !form.name}
//           style={{
//             width: "100%",
//             padding: "11px",
//             borderRadius: "8px",
//             cursor: saving ? "not-allowed" : "pointer",
//             background: "linear-gradient(135deg,#c9a96e,#a07840)",
//             color: "#fff",
//             border: "none",
//             fontWeight: "700",
//             fontSize: "13px",
//             marginTop: "4px",
//             opacity: saving ? 0.7 : 1,
//           }}
//         >
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Commission Stats ────────────────────────────────────────
// const BrokerStats = ({ bookings, fmt }) => {
//   const commPending = bookings
//     .filter((b) => b.commission_status === "pending")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings
//     .filter((b) => b.commission_status === "approved")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid = bookings
//     .filter((b) => b.commission_status === "paid")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//         gap: "10px",
//         marginBottom: "20px",
//       }}
//     >
//       {[
//         {
//           label: "Pending Commission",
//           value: fmt(commPending),
//           color: "#f59e0b",
//           icon: "⏳",
//         },
//         {
//           label: "Approved Commission",
//           value: fmt(commApproved),
//           color: "#3b82f6",
//           icon: "✅",
//         },
//         {
//           label: "Commission Paid",
//           value: fmt(commPaid),
//           color: "#22c55e",
//           icon: "💰",
//         },
//         {
//           label: "Total Clients",
//           value: bookings.length,
//           color: "#c9a96e",
//           icon: "👥",
//         },
//       ].map(({ label, value, color, icon }) => (
//         <div
//           key={label}
//           style={{
//             background: "rgba(255,255,255,0.03)",
//             border: "1px solid rgba(255,255,255,0.07)",
//             borderRadius: "12px",
//             padding: "14px 16px",
//           }}
//         >
//           <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//           <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//             {value}
//           </div>
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//             {label}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications Tab ──────────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder: {
//     icon: "💳",
//     color: "#f59e0b",
//     bg: "rgba(245,158,11,0.10)",
//     label: "Payment Reminder",
//   },
//   booking_confirmed: {
//     icon: "✅",
//     color: "#22c55e",
//     bg: "rgba(34,197,94,0.10)",
//     label: "Booking Confirmed",
//   },
//   booking_cancelled: {
//     icon: "❌",
//     color: "#ef4444",
//     bg: "rgba(239,68,68,0.10)",
//     label: "Booking Cancelled",
//   },
//   project_launch: {
//     icon: "🏗️",
//     color: "#c9a96e",
//     bg: "rgba(201,169,110,0.10)",
//     label: "Project Launch",
//   },
//   offer: {
//     icon: "🎁",
//     color: "#8b5cf6",
//     bg: "rgba(139,92,246,0.10)",
//     label: "Special Offer",
//   },
//   general: {
//     icon: "🔔",
//     color: "#c9a96e",
//     bg: "rgba(201,169,110,0.10)",
//     label: "General",
//   },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate }) => {
//   const cfg = notif
//     ? NOTIF_CFG[notif.type] || NOTIF_CFG.general
//     : NOTIF_CFG.general;

//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);

//   if (!notif) return null;

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7
//       ? `${d}d ago`
//       : new Date(dateStr).toLocaleDateString("en-IN", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         });
//   };

//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 1000,
//         background: "rgba(0,0,0,0.7)",
//         backdropFilter: "blur(6px)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "linear-gradient(135deg,#0f0f1e,#12121f)",
//           border: `1px solid ${cfg.color}33`,
//           borderTop: `3px solid ${cfg.color}`,
//           borderRadius: "16px",
//           maxWidth: "520px",
//           width: "100%",
//           boxShadow: `0 20px 60px rgba(0,0,0,0.6)`,
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             padding: "20px 24px 16px",
//             borderBottom: "1px solid rgba(255,255,255,0.06)",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               justifyContent: "space-between",
//               gap: "12px",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//                 flex: 1,
//                 minWidth: 0,
//               }}
//             >
//               <div
//                 style={{
//                   width: "44px",
//                   height: "44px",
//                   borderRadius: "12px",
//                   flexShrink: 0,
//                   background: cfg.bg,
//                   border: `1px solid ${cfg.color}33`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "20px",
//                 }}
//               >
//                 {cfg.icon}
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "800",
//                     color: "#e2e8f0",
//                     lineHeight: "1.3",
//                   }}
//                 >
//                   {notif.title}
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     marginTop: "4px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "10px",
//                       fontWeight: "700",
//                       padding: "2px 8px",
//                       borderRadius: "10px",
//                       background: cfg.bg,
//                       color: cfg.color,
//                       border: `1px solid ${cfg.color}33`,
//                     }}
//                   >
//                     {cfg.label}
//                   </span>
//                   <span style={{ fontSize: "11px", color: "#475569" }}>
//                     🕐 {timeAgo(notif.created_at)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               style={{
//                 background: "rgba(255,255,255,0.05)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 color: "#64748b",
//                 width: "32px",
//                 height: "32px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "16px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               ×
//             </button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div
//             style={{
//               fontSize: "14px",
//               color: "#cbd5e1",
//               lineHeight: "1.75",
//               whiteSpace: "pre-line",
//               background: "rgba(255,255,255,0.02)",
//               border: "1px solid rgba(255,255,255,0.05)",
//               borderRadius: "10px",
//               padding: "16px",
//             }}
//           >
//             {notif.message}
//           </div>
//           <div
//             style={{
//               display: "flex",
//               gap: "8px",
//               marginTop: "16px",
//               flexWrap: "wrap",
//             }}
//           >
//             {notif.booking_id && (
//               <button
//                 onClick={() => {
//                   onClose();
//                   onNavigate(`/payment/${notif.booking_id}`);
//                 }}
//                 style={{
//                   padding: "9px 20px",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: "13px",
//                   fontWeight: "700",
//                   background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                   color: "#fff",
//                   border: "none",
//                 }}
//               >
//                 View Booking →
//               </button>
//             )}
//             <button
//               onClick={onClose}
//               style={{
//                 padding: "9px 16px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 background: "transparent",
//                 color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({
//   notifications,
//   loading,
//   unreadCount,
//   onMarkRead,
//   onMarkAllRead,
//   onNavigate,
// }) => {
//   const [filter, setFilter] = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);

//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read") return n.is_read;
//     return true;
//   });

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//     });
//   };

//   if (loading)
//     return (
//       <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//         <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
//         Loading notifications...
//       </div>
//     );

//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal
//           notif={selectedNotif}
//           onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead}
//           onNavigate={onNavigate}
//         />
//       )}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "14px",
//           flexWrap: "wrap",
//           gap: "10px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             gap: "4px",
//             background: "rgba(255,255,255,0.03)",
//             padding: "4px",
//             borderRadius: "8px",
//           }}
//         >
//           {[
//             ["all", "All"],
//             ["unread", "Unread"],
//             ["read", "Read"],
//           ].map(([val, label]) => (
//             <button
//               key={val}
//               onClick={() => setFilter(val)}
//               style={{
//                 padding: "5px 14px",
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 fontSize: "12px",
//                 fontWeight: "600",
//                 background:
//                   filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//                 color: filter === val ? "#c9a96e" : "#64748b",
//                 border:
//                   filter === val
//                     ? "1px solid rgba(201,169,110,0.25)"
//                     : "1px solid transparent",
//               }}
//             >
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span
//                   style={{
//                     marginLeft: "5px",
//                     padding: "0 5px",
//                     borderRadius: "10px",
//                     fontSize: "10px",
//                     background: "#f59e0b",
//                     color: "#000",
//                     fontWeight: "800",
//                   }}
//                 >
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button
//             onClick={onMarkAllRead}
//             style={{
//               padding: "6px 14px",
//               borderRadius: "7px",
//               cursor: "pointer",
//               fontSize: "12px",
//               fontWeight: "600",
//               background: "rgba(201,169,110,0.08)",
//               color: "#c9a96e",
//               border: "1px solid rgba(201,169,110,0.2)",
//             }}
//           >
//             ✓ Mark all read
//           </button>
//         )}
//       </div>

//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>
//           <div
//             style={{
//               fontSize: "15px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             {filter === "unread"
//               ? "No unread notifications"
//               : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Payment reminders and booking updates will appear here.
//           </div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {filtered.map((n) => {
//           const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.general;
//           return (
//             <div
//               key={n.id}
//               onClick={() => setSelectedNotif(n)}
//               style={{
//                 display: "flex",
//                 gap: "14px",
//                 alignItems: "flex-start",
//                 padding: "14px 16px",
//                 borderRadius: "12px",
//                 cursor: "pointer",
//                 background: n.is_read
//                   ? "rgba(255,255,255,0.02)"
//                   : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`,
//                 border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"}`,
//                 transition: "all 0.2s",
//                 position: "relative",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.borderColor = cfg.color + "55";
//                 e.currentTarget.style.transform = "translateY(-1px)";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.borderColor = n.is_read
//                   ? "rgba(255,255,255,0.06)"
//                   : cfg.color + "33";
//                 e.currentTarget.style.transform = "none";
//               }}
//             >
//               {!n.is_read && (
//                 <div
//                   style={{
//                     position: "absolute",
//                     top: "14px",
//                     right: "14px",
//                     width: "8px",
//                     height: "8px",
//                     borderRadius: "50%",
//                     background: cfg.color,
//                     boxShadow: `0 0 6px ${cfg.color}`,
//                   }}
//                 />
//               )}
//               <div
//                 style={{
//                   width: "40px",
//                   height: "40px",
//                   borderRadius: "10px",
//                   flexShrink: 0,
//                   background: cfg.bg,
//                   border: `1px solid ${cfg.color}33`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "18px",
//                 }}
//               >
//                 {cfg.icon}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     marginBottom: "3px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: n.is_read ? "600" : "700",
//                       color: n.is_read ? "#94a3b8" : "#e2e8f0",
//                     }}
//                   >
//                     {n.title}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "10px",
//                       fontWeight: "700",
//                       padding: "1px 7px",
//                       borderRadius: "10px",
//                       background: cfg.bg,
//                       color: cfg.color,
//                       border: `1px solid ${cfg.color}33`,
//                     }}
//                   >
//                     {cfg.label}
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "12px",
//                     color: n.is_read ? "#475569" : "#94a3b8",
//                     lineHeight: "1.5",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   {n.message.length > 80
//                     ? n.message.slice(0, 80) + "…"
//                     : n.message}
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span style={{ fontSize: "11px", color: "#334155" }}>
//                     🕐 {timeAgo(n.created_at)}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "11px",
//                       color: cfg.color,
//                       fontWeight: "600",
//                     }}
//                   >
//                     Click to read →
//                   </span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Payments Tab ───────────────────────────────────────────────────
// const GW_CFG = {
//   razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
//   stripe: { icon: "💎", color: "#8b5cf6", label: "Stripe" },
//   phonepe: { icon: "📱", color: "#f59e0b", label: "PhonePe" },
//   cash: { icon: "💵", color: "#22c55e", label: "Cash" },
//   manual: { icon: "🏦", color: "#64748b", label: "Manual" },
// };
// const TXN_STATUS = {
//   success: { color: "#22c55e", bg: "rgba(34,197,94,0.10)", label: "Success" },
//   pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", label: "Pending" },
//   failed: { color: "#ef4444", bg: "rgba(239,68,68,0.10)", label: "Failed" },
//   refunded: {
//     color: "#94a3b8",
//     bg: "rgba(148,163,184,0.10)",
//     label: "Refunded",
//   },
// };

// const PaymentsTab = ({ payments, loading, fmt }) => {
//   const totalPaid = payments
//     .filter((p) => p.status === "success")
//     .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
//   const successCount = payments.filter((p) => p.status === "success").length;

//   if (loading)
//     return (
//       <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//         <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
//         Loading payment history...
//       </div>
//     );

//   return (
//     <div>
//       {payments.length > 0 && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//             gap: "10px",
//             marginBottom: "20px",
//           }}
//         >
//           {[
//             {
//               label: "Total Paid",
//               value: fmt(totalPaid),
//               color: "#22c55e",
//               icon: "💰",
//             },
//             {
//               label: "Transactions",
//               value: successCount,
//               color: "#c9a96e",
//               icon: "🧾",
//             },
//             {
//               label: "Pending",
//               value: payments.filter((p) => p.status === "pending").length,
//               color: "#f59e0b",
//               icon: "⏳",
//             },
//           ].map(({ label, value, color, icon }) => (
//             <div
//               key={label}
//               style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "14px 16px",
//               }}
//             >
//               <div style={{ fontSize: "18px", marginBottom: "6px" }}>
//                 {icon}
//               </div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//                 {value}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 {label}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//       {payments.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
//           <div
//             style={{
//               fontSize: "14px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             No payment history yet
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Your payment transactions will appear here once you make a booking
//             payment.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {payments.map((p) => {
//           const gw = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
//           const txn = TXN_STATUS[p.status] || TXN_STATUS.pending;
//           return (
//             <div
//               key={p.id}
//               style={{
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "16px 18px",
//                 borderLeft: `3px solid ${txn.color}`,
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "flex-start",
//                   gap: "12px",
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <div style={{ flex: 1 }}>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "10px",
//                       flexWrap: "wrap",
//                       marginBottom: "4px",
//                     }}
//                   >
//                     <span style={{ fontSize: "16px" }}>{gw.icon}</span>
//                     <span
//                       style={{
//                         fontSize: "14px",
//                         fontWeight: "700",
//                         color: "#e2e8f0",
//                       }}
//                     >
//                       {gw.label}
//                     </span>
//                     <span
//                       style={{
//                         fontSize: "10px",
//                         fontWeight: "700",
//                         padding: "1px 8px",
//                         borderRadius: "10px",
//                         background: txn.bg,
//                         color: txn.color,
//                         border: `1px solid ${txn.color}33`,
//                       }}
//                     >
//                       {txn.label}
//                     </span>
//                     {p._synthetic && (
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           fontWeight: "700",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           background: "rgba(251,191,36,0.1)",
//                           color: "#fbbf24",
//                           border: "1px solid rgba(251,191,36,0.25)",
//                         }}
//                       >
//                         🏢 Walk-in / Cash
//                       </span>
//                     )}
//                     {!p._synthetic && p.mode && p.mode !== "online" && (
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 7px",
//                           borderRadius: "10px",
//                           background: "rgba(255,255,255,0.05)",
//                           color: "#64748b",
//                           border: "1px solid rgba(255,255,255,0.08)",
//                           textTransform: "capitalize",
//                         }}
//                       >
//                         {p.mode}
//                       </span>
//                     )}
//                   </div>
//                   {p.booking && (
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#64748b",
//                         marginBottom: "3px",
//                       }}
//                     >
//                       🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
//                     </div>
//                   )}
//                   {(p.gateway_payment_id || p.gateway_order_id) && (
//                     <div
//                       style={{
//                         fontSize: "11px",
//                         color: "#334155",
//                         fontFamily: "monospace",
//                       }}
//                     >
//                       Ref: {p.gateway_payment_id || p.gateway_order_id}
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ textAlign: "right", flexShrink: 0 }}>
//                   <div
//                     style={{
//                       fontSize: "20px",
//                       fontWeight: "800",
//                       color: txn.color,
//                     }}
//                   >
//                     {fmt(p.amount)}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "11px",
//                       color: "#475569",
//                       marginTop: "2px",
//                     }}
//                   >
//                     {p.paid_at
//                       ? new Date(p.paid_at).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })
//                       : new Date(p.created_at).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         })}
//                   </div>
//                 </div>
//               </div>
//               {p.notes && (
//                 <div
//                   style={{
//                     marginTop: "8px",
//                     fontSize: "12px",
//                     color: "#475569",
//                     padding: "6px 10px",
//                     background: "rgba(255,255,255,0.02)",
//                     borderRadius: "6px",
//                   }}
//                 >
//                   📝 {p.notes}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ───────────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { icon: "💬", color: "#6c757d" },
//   service: { icon: "🛎️", color: "#3b82f6" },
//   unit: { icon: "🏠", color: "#c9a96e" },
//   payment: { icon: "💳", color: "#f59e0b" },
//   staff: { icon: "👤", color: "#8b5cf6" },
// };

// const StarRating = ({ value, onChange }) => (
//   <div style={{ display: "flex", gap: "4px" }}>
//     {[1, 2, 3, 4, 5].map((s) => (
//       <button
//         key={s}
//         type="button"
//         onClick={() => onChange(s)}
//         style={{
//           background: "none",
//           border: "none",
//           cursor: "pointer",
//           fontSize: "24px",
//           padding: "0 2px",
//           color: s <= value ? "#c9a96e" : "rgba(255,255,255,0.15)",
//           transition: "color 0.15s",
//         }}
//       >
//         ★
//       </button>
//     ))}
//   </div>
// );

// // showToast passed as prop so FeedbackTab can use global toasts
// const FeedbackTab = ({
//   feedbacks,
//   bookings,
//   token,
//   onSubmitted,
//   showToast,
// }) => {
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({
//     rating: 5,
//     category: "general",
//     subject: "",
//     message: "",
//     booking_id: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) {
//       // ── Toast: validation error ──────────────────────────────────
//       showToast("⚠️ Subject and message are required", "warning", 3500);
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...form,
//           booking_id: form.booking_id || undefined,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");

//       // ── Toast: feedback submitted ────────────────────────────────
//       showToast(
//         "🙏 Thank you! Your feedback has been submitted",
//         "success",
//         4000,
//       );
//       setForm({
//         rating: 5,
//         category: "general",
//         subject: "",
//         message: "",
//         booking_id: "",
//       });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) {
//       // ── Toast: feedback error ────────────────────────────────────
//       showToast("❌ " + e.message, "error", 4000);
//     }
//     setSubmitting(false);
//   };

//   const inp = (style = {}) => ({
//     width: "100%",
//     padding: "10px 14px",
//     marginBottom: "10px",
//     background: "rgba(255,255,255,0.05)",
//     border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: "8px",
//     color: "#e2e8f0",
//     fontSize: "13px",
//     outline: "none",
//     boxSizing: "border-box",
//     ...style,
//   });

//   const confirmedBookings = bookings.filter(
//     (b) => b.booking_status === "confirmed",
//   );

//   return (
//     <div>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "16px",
//         }}
//       >
//         <div>
//           <div
//             style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}
//           >
//             Your Feedback
//           </div>
//           <div style={{ fontSize: "12px", color: "#475569" }}>
//             Share your experience with us
//           </div>
//         </div>
//         <button
//           onClick={() => setShowForm((f) => !f)}
//           style={{
//             padding: "8px 16px",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontSize: "13px",
//             fontWeight: "700",
//             background: showForm
//               ? "rgba(255,255,255,0.05)"
//               : "linear-gradient(135deg,#c9a96e,#a07840)",
//             color: showForm ? "#64748b" : "#fff",
//             border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
//           }}
//         >
//           {showForm ? "✕ Cancel" : "+ New Feedback"}
//         </button>
//       </div>

//       {showForm && (
//         <div
//           style={{
//             background: "rgba(255,255,255,0.02)",
//             border: "1px solid rgba(201,169,110,0.2)",
//             borderRadius: "14px",
//             padding: "20px",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               fontSize: "13px",
//               fontWeight: "700",
//               color: "#c9a96e",
//               marginBottom: "16px",
//             }}
//           >
//             ✍️ New Feedback
//           </div>
//           <div style={{ marginBottom: "14px" }}>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#64748b",
//                 marginBottom: "8px",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Rating *
//             </div>
//             <StarRating
//               value={form.rating}
//               onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
//             />
//             <div
//               style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}
//             >
//               {
//                 ["", "Very Poor", "Poor", "Average", "Good", "Excellent"][
//                   form.rating
//                 ]
//               }
//             </div>
//           </div>
//           <div style={{ marginBottom: "10px" }}>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#64748b",
//                 marginBottom: "6px",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Category *
//             </div>
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => (
//                 <button
//                   key={cat}
//                   type="button"
//                   onClick={() => setForm((f) => ({ ...f, category: cat }))}
//                   style={{
//                     padding: "5px 12px",
//                     borderRadius: "20px",
//                     cursor: "pointer",
//                     fontSize: "12px",
//                     fontWeight: "600",
//                     background:
//                       form.category === cat
//                         ? `${cfg.color}22`
//                         : "rgba(255,255,255,0.03)",
//                     color: form.category === cat ? cfg.color : "#64748b",
//                     border: `1px solid ${form.category === cat ? cfg.color + "55" : "rgba(255,255,255,0.08)"}`,
//                     textTransform: "capitalize",
//                   }}
//                 >
//                   {cfg.icon} {cat}
//                 </button>
//               ))}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select
//               value={form.booking_id}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, booking_id: e.target.value }))
//               }
//               style={{ ...inp(), marginBottom: "10px" }}
//             >
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => (
//                 <option key={b.id} value={b.id}>
//                   Unit {b.plot_number} — Booking #{b.id}
//                 </option>
//               ))}
//             </select>
//           )}
//           <input
//             type="text"
//             placeholder="Subject *"
//             value={form.subject}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, subject: e.target.value }))
//             }
//             style={inp()}
//           />
//           <textarea
//             placeholder="Your message... (tell us about your experience)"
//             value={form.message}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, message: e.target.value }))
//             }
//             rows={4}
//             style={{ ...inp(), resize: "vertical" }}
//           />
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button
//               onClick={handleSubmit}
//               disabled={submitting}
//               style={{
//                 padding: "10px 22px",
//                 borderRadius: "8px",
//                 cursor: submitting ? "not-allowed" : "pointer",
//                 fontSize: "13px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color: "#fff",
//                 border: "none",
//                 opacity: submitting ? 0.7 : 1,
//               }}
//             >
//               {submitting ? "Submitting…" : "Submit Feedback →"}
//             </button>
//             <button
//               onClick={() => setShowForm(false)}
//               style={{
//                 padding: "10px 14px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 background: "transparent",
//                 color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
//           <div
//             style={{
//               fontSize: "14px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             No feedback yet
//           </div>
//           <div
//             style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}
//           >
//             Share your experience to help us improve.
//           </div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {feedbacks.map((fb) => {
//           const catCfg = CATEGORY_CFG[fb.category] || CATEGORY_CFG.general;
//           const ratingColor =
//             fb.rating >= 4 ? "#22c55e" : fb.rating >= 3 ? "#f59e0b" : "#ef4444";
//           return (
//             <div
//               key={fb.id}
//               style={{
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 overflow: "hidden",
//               }}
//             >
//               <div style={{ padding: "14px 16px" }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     gap: "10px",
//                   }}
//                 >
//                   <div style={{ flex: 1 }}>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "8px",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <span
//                         style={{
//                           fontSize: "14px",
//                           fontWeight: "700",
//                           color: "#e2e8f0",
//                         }}
//                       >
//                         {fb.subject}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           background: `${catCfg.color}22`,
//                           color: catCfg.color,
//                           border: `1px solid ${catCfg.color}33`,
//                           textTransform: "capitalize",
//                         }}
//                       >
//                         {catCfg.icon} {fb.category}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           background:
//                             fb.status === "resolved"
//                               ? "rgba(34,197,94,0.1)"
//                               : fb.status === "reviewed"
//                                 ? "rgba(59,130,246,0.1)"
//                                 : "rgba(245,158,11,0.1)",
//                           color:
//                             fb.status === "resolved"
//                               ? "#22c55e"
//                               : fb.status === "reviewed"
//                                 ? "#3b82f6"
//                                 : "#f59e0b",
//                           fontWeight: "700",
//                           textTransform: "capitalize",
//                         }}
//                       >
//                         {fb.status}
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#475569",
//                         marginTop: "4px",
//                       }}
//                     >
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </div>
//                   </div>
//                   <div
//                     style={{
//                       color: ratingColor,
//                       fontSize: "16px",
//                       fontWeight: "800",
//                       flexShrink: 0,
//                     }}
//                   >
//                     {"★".repeat(fb.rating)}
//                   </div>
//                 </div>
//                 <div
//                   style={{
//                     marginTop: "8px",
//                     fontSize: "13px",
//                     color: "#94a3b8",
//                     lineHeight: "1.6",
//                   }}
//                 >
//                   {fb.message}
//                 </div>
//                 {fb.admin_reply && (
//                   <div
//                     style={{
//                       marginTop: "12px",
//                       padding: "10px 14px",
//                       background: "rgba(34,197,94,0.06)",
//                       border: "1px solid rgba(34,197,94,0.15)",
//                       borderRadius: "8px",
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontSize: "11px",
//                         color: "#22c55e",
//                         fontWeight: "700",
//                         marginBottom: "4px",
//                         textTransform: "uppercase",
//                         letterSpacing: "0.5px",
//                       }}
//                     >
//                       💬 Admin Reply
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "13px",
//                         color: "#cbd5e1",
//                         lineHeight: "1.6",
//                         whiteSpace: "pre-line",
//                       }}
//                     >
//                       {fb.admin_reply}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ─────────────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user = useSelector(selectUser);

//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [activeTab, setActiveTab] = useState("bookings");
//   const [notifications, setNotifications] = useState([]);
//   const [notifsLoading, setNotifsLoading] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);

//   const [unreadMessages, setUnreadMessages] = useState(0);

//   // ── Global toast hook ──────────────────────────────────────────────
//   const { showToast } = useToast();

//   const {
//     wishlist,
//     wishedIds,
//     toggle: toggleWishRaw,
//     loading: wishLoading,
//   } = useWishlist(user?.token);

//   // ── Wrap toggleWish to show add/remove toasts ──────────────────────
//   const handleWishlistToggle = useCallback(
//     async (plotId) => {
//       const wasWished =
//         wishedIds instanceof Set && wishedIds.has(Number(plotId));
//       await toggleWishRaw(Number(plotId));
//       if (wasWished) {
//         showToast("🤍 Removed from Wishlist", "wishlist_remove", 2800);
//       } else {
//         showToast("❤️ Added to Wishlist", "wishlist_add", 2800);
//       }
//     },
//     [wishedIds, toggleWishRaw, showToast],
//   );

//   const [currency, setCurrency] = useState({
//     symbol: "₹",
//     code: "INR",
//     position: "before",
//   });
//   const fmt = useCallback(
//     (n) => makeFmt(currency.symbol, currency.code, currency.position)(n),
//     [currency],
//   );

//   const isBroker = user?.role === "broker";

//   useEffect(() => {
//     if (!user?.token) {
//       navigate("/");
//       return;
//     }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => {
//           if (d)
//             setCurrency({
//               symbol: d.symbol || "₹",
//               code: d.code || "INR",
//               position: d.position || "before",
//             });
//         })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//     ]);

//     const params = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     const txnId = params.get("txn");

//     if (bookingId && (sessionId || txnId)) {
//       const confirmPayment = async () => {
//         try {
//           if (sessionId) {
//             await fetch(`${API_BASE}/payment/stripe/confirm`, {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//                 Authorization: `Bearer ${user.token}`,
//               },
//               body: JSON.stringify({
//                 booking_id: bookingId,
//                 session_id: sessionId,
//               }),
//             });
//           }
//           await Promise.all([
//             fetchBookings(),
//             fetchNotifications(),
//             fetchPayments(),
//           ]);
//           // ── Toast: payment confirmed after redirect ────────────────
//           showToast(
//             "🎉 Payment confirmed! Your booking is now active.",
//             "booking",
//             5000,
//           );
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }
//     fetch(`${API_BASE}/messages/unread`, {
//       headers: { Authorization: `Bearer ${user.token}` },
//     })
//       .then((r) => r.json())
//       .then((d) => setUnreadMessages(d.unread || 0));
//   }, [user]);

//   const fetchPayments = async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//             Accept: "application/json",
//           },
//         }),
//         fetch(`${API_BASE}/bookings`, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//             Accept: "application/json",
//           },
//         }),
//       ]);
//       const txns = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter(
//           (b) =>
//             b.booking_status === "confirmed" &&
//             !txnBookingIds.has(String(b.id)),
//         )
//         .map((b) => ({
//           id: `booking_${b.id}`,
//           booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR",
//           status: "success",
//           mode: "manual",
//           gateway: "cash / manual",
//           paid_at: b.created_at,
//           _synthetic: true,
//           booking: {
//             id: b.id,
//             plot_number: b.plot_number,
//             plot_type: b.plot_type,
//             booking_status: b.booking_status,
//           },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {
//     } finally {
//       setPaymentsLoading(false);
//     }
//   };

//   const fetchFeedbacks = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   };

//   const fetchNotifications = async () => {
//     setNotifsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/notifications`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {
//     } finally {
//       setNotifsLoading(false);
//     }
//   };

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
//       );
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       // ── Toast: all marked read ─────────────────────────────────────
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const fetchBookings = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${API_BASE}/bookings`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       setBookings(Array.isArray(data) ? data : data.data || []);
//     } catch (e) {
//       setError(e.message);
//       // ── Toast: bookings load error ─────────────────────────────────
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePay = (id) => navigate(`/payment/${id}`);

//   // ── Logout with toast ──────────────────────────────────────────────
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => {
//       dispatch(clearUser());
//       navigate("/");
//     }, 600);
//   };

//   const handleSaved = (updated) => dispatch(setUser(updated));

//   // ── Cancel booking with toast ──────────────────────────────────────
//   const handleCancel = async (bookingId) => {
//     try {
//       const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) =>
//         prev.map((b) =>
//           b.id === bookingId ? { ...b, booking_status: "cancelled" } : b,
//         ),
//       );
//       // ── Toast: booking cancelled ───────────────────────────────────
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) {
//       // ── Toast: cancel error ────────────────────────────────────────
//       showToast("❌ " + e.message, "error", 4000);
//     }
//   };

//   const confirmed = bookings.filter(
//     (b) => b.booking_status === "confirmed",
//   ).length;
//   const pending = bookings.filter((b) => b.booking_status === "pending").length;
//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => s + parseFloat(b.down_payment_amount || b.price || 0), 0);

//   const tabs = [
//     {
//       id: "bookings",
//       label: isBroker ? "Client Bookings" : "My Bookings",
//       count: bookings.length,
//     },
//     { id: "wishlist", label: "Wishlist", count: wishlist.length },
//     { id: "payments", label: "Payments", count: 0 },
//     { id: "notifications", label: "Notifications", count: unreadCount },
//     { id: "feedback", label: "Feedback", count: 0 },
//     { id: "messages", label: "Messages", count: unreadMessages },
//     { id: "profile", label: "My Profile", count: 0 },

//   ];

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#080812",
//         fontFamily: "'DM Sans', sans-serif",
//         color: "#e2e8f0",
//       }}
//     >
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />

//       {/* ── Sticky Header ── */}
//       <div
//         style={{
//           background: "rgba(8,8,18,0.96)",
//           borderBottom: "1px solid rgba(255,255,255,0.06)",
//           padding: "0 24px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           height: "62px",
//           position: "sticky",
//           top: 0,
//           zIndex: 100,
//           backdropFilter: "blur(12px)",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//           <button
//             onClick={() => navigate(-1)}
//             style={{
//               background: "none",
//               border: "none",
//               color: "#64748b",
//               cursor: "pointer",
//               fontSize: "13px",
//               padding: "6px 10px",
//               borderRadius: "6px",
//             }}
//           >
//             ← Back
//           </button>
//           <div
//             style={{
//               width: "1px",
//               height: "18px",
//               background: "rgba(255,255,255,0.08)",
//             }}
//           />
//           <span
//             style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}
//           >
//             {isBroker ? "🤝 Broker Dashboard" : "🏠 My Dashboard"}
//           </span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div style={{ textAlign: "right" }}>
//             <div
//               style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}
//             >
//               {user?.name}
//             </div>
//             <div style={{ fontSize: "11px", color: "#475569" }}>
//               {isBroker
//                 ? `🤝 Broker${user?.broker_company ? " · " + user.broker_company : ""}`
//                 : "👤 Buyer"}
//             </div>
//           </div>
//           <div
//             style={{
//               width: "34px",
//               height: "34px",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontWeight: "800",
//               fontSize: "13px",
//               color: "#000",
//             }}
//           >
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button
//             onClick={handleLogout}
//             style={{
//               background: "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b",
//               padding: "6px 12px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "12px",
//             }}
//           >
//             Logout
//           </button>
//           <button
//             onClick={() => setActiveTab("notifications")}
//             style={{
//               position: "relative",
//               background: "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b",
//               padding: "6px 10px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "15px",
//             }}
//           >
//             🔔
//             {unreadCount > 0 && (
//               <span
//                 style={{
//                   position: "absolute",
//                   top: "-5px",
//                   right: "-5px",
//                   minWidth: "16px",
//                   height: "16px",
//                   borderRadius: "10px",
//                   background: "#f59e0b",
//                   color: "#000",
//                   fontSize: "9px",
//                   fontWeight: "800",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   padding: "0 3px",
//                 }}
//               >
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div
//         style={{ maxWidth: "920px", margin: "0 auto", padding: "28px 18px" }}
//       >
//         <div style={{ marginBottom: "22px" }}>
//           <div
//             style={{
//               fontSize: "24px",
//               fontWeight: "800",
//               color: "#e2e8f0",
//               letterSpacing: "-0.4px",
//             }}
//           >
//             Welcome back, {user?.name?.split(" ")[0]} 👋
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569", marginTop: "3px" }}>
//             {isBroker
//               ? "Manage your client bookings and track your commissions."
//               : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* ── Summary stat cards ── */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//             gap: "10px",
//             marginBottom: "20px",
//           }}
//         >
//           {[
//             {
//               label: "Total Bookings",
//               value: bookings.length,
//               icon: "🏠",
//               color: "#c9a96e",
//             },
//             {
//               label: "Confirmed",
//               value: confirmed,
//               icon: "✅",
//               color: "#22c55e",
//             },
//             {
//               label: "Pending Payment",
//               value: pending,
//               icon: "⏳",
//               color: "#f59e0b",
//             },
//             ...(!isBroker
//               ? [
//                   {
//                     label: "Amount Invested",
//                     value: fmt(totalInvested),
//                     icon: "💰",
//                     color: "#c9a96e",
//                   },
//                 ]
//               : []),
//           ].map(({ label, value, icon, color }) => (
//             <div
//               key={label}
//               style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "14px 16px",
//               }}
//             >
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>
//                 {icon}
//               </div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//                 {value}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 {label}
//               </div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && (
//           <BrokerStats bookings={bookings} fmt={fmt} />
//         )}

//         {/* ── Tabs ── */}
//         <div
//           style={{
//             display: "flex",
//             gap: "4px",
//             marginBottom: "18px",
//             background: "rgba(255,255,255,0.03)",
//             padding: "4px",
//             borderRadius: "10px",
//             overflowX: "auto",
//           }}
//         >
//           {tabs.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setActiveTab(t.id)}
//               style={{
//                 padding: "7px 16px",
//                 borderRadius: "7px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 fontWeight: "600",
//                 whiteSpace: "nowrap",
//                 background:
//                   activeTab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
//                 color: activeTab === t.id ? "#c9a96e" : "#64748b",
//                 border:
//                   activeTab === t.id
//                     ? "1px solid rgba(201,169,110,0.25)"
//                     : "1px solid transparent",
//               }}
//             >
//               {t.label}
//               {t.count > 0 && (
//                 <span
//                   style={{
//                     marginLeft: "6px",
//                     padding: "1px 6px",
//                     borderRadius: "20px",
//                     fontSize: "11px",
//                     background:
//                       activeTab === t.id
//                         ? "rgba(201,169,110,0.2)"
//                         : "rgba(255,255,255,0.07)",
//                     color: activeTab === t.id ? "#c9a96e" : "#475569",
//                   }}
//                 >
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* ── Bookings tab ── */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: "60px 0",
//                   color: "#475569",
//                 }}
//               >
//                 <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
//                 Loading bookings...
//               </div>
//             )}
//             {error && (
//               <div
//                 style={{
//                   padding: "14px",
//                   background: "rgba(239,68,68,0.08)",
//                   border: "1px solid rgba(239,68,68,0.2)",
//                   borderRadius: "10px",
//                   color: "#fca5a5",
//                   fontSize: "13px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                 }}
//               >
//                 <span>⚠ {error}</span>
//                 <button
//                   onClick={fetchBookings}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "#c9a96e",
//                     cursor: "pointer",
//                     fontSize: "13px",
//                     textDecoration: "underline",
//                   }}
//                 >
//                   Retry
//                 </button>
//               </div>
//             )}
//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏠</div>
//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "600",
//                     color: "#e2e8f0",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#475569",
//                     marginBottom: "20px",
//                   }}
//                 >
//                   {isBroker
//                     ? "Book a unit for your clients from the unit page."
//                     : "Browse available units to make your first booking."}
//                 </div>
//                 <button
//                   onClick={() => navigate("/")}
//                   style={{
//                     padding: "10px 22px",
//                     background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: "10px",
//                     cursor: "pointer",
//                     fontWeight: "700",
//                   }}
//                 >
//                   Browse Units →
//                 </button>
//               </div>
//             )}
//             <div
//               style={{ display: "flex", flexDirection: "column", gap: "10px" }}
//             >
//               {!loading &&
//                 bookings.map((b) => (
//                   <BookingCard
//                     key={b.id}
//                     booking={b}
//                     onPay={handlePay}
//                     onCancel={handleCancel}
//                     isBroker={isBroker}
//                     fmt={fmt}
//                   />
//                 ))}
//             </div>
//           </div>
//         )}

//         {/* ── Wishlist tab — uses handleWishlistToggle for toasts ── */}
//         {activeTab === "wishlist" && (
//           <WishlistTab
//             wishlist={wishlist}
//             wishedIds={wishedIds}
//             onToggle={handleWishlistToggle}
//             loading={wishLoading}
//             token={user?.token}
//             onNavigate={navigate}
//             fmt={fmt}
//           />
//         )}

//         {activeTab === "payments" && (
//           <PaymentsTab
//             payments={payments}
//             loading={paymentsLoading}
//             fmt={fmt}
//           />
//         )}

//         {activeTab === "notifications" && (
//           <NotificationsTab
//             notifications={notifications}
//             loading={notifsLoading}
//             unreadCount={unreadCount}
//             onMarkRead={markRead}
//             onMarkAllRead={markAllRead}
//             onNavigate={navigate}
//           />
//         )}

//         {/* FeedbackTab receives showToast as prop ── */}
//         {activeTab === "feedback" && (
//           <FeedbackTab
//             feedbacks={feedbacks}
//             bookings={bookings}
//             token={user?.token}
//             showToast={showToast}
//             onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])}
//           />
//         )}

//         {activeTab === "messages" && <MessagesTab user={user} />}

//         {/* ProfilePanel receives showToast as prop ── */}
//         {activeTab === "profile" && (
//           <ProfilePanel
//             user={user}
//             onSaved={handleSaved}
//             showToast={showToast}
//           />
//         )}

//       </div>
//     </div>
//   );
// }

// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// const makeFmt =
//   (symbol = "₹", code = "INR", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol} ${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   label: "Confirmed"       },
//   pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Pending Payment" },
//   cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Cancelled"       },
// };

// const COMM_CFG = {
//   pending:  { color: "#f59e0b", label: "Pending Approval" },
//   approved: { color: "#3b82f6", label: "Approved"         },
//   paid:     { color: "#22c55e", label: "Paid"             },
//   rejected: { color: "#ef4444", label: "Rejected"         },
// };

// // ── Real Milestone Tracker (uses booking_milestones from API) ─────────────────
// const MilestoneTracker = ({ bookingId, token, fmt, booking }) => {
//   const [data,    setData]    = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => { setData(d); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   // Fall back to plan template if no snapshot yet
//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan  = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div style={{ color: "#475569", fontSize: "13px", padding: "10px",
//                       background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
//           💰 Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     return (
//       <div style={{ marginTop: "8px" }}>
//         <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700",
//                       letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
//           Payment Schedule — {plan.name}
//           <span style={{ fontWeight: "400", color: "#475569", marginLeft: "6px", fontSize: "10px" }}>
//             (estimated)
//           </span>
//         </div>
//         {plan.milestones.map((m, i) => {
//           const amt    = m.percentage ? Math.round((price * m.percentage) / 100) : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue  = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow key={i} label={m.label} percentage={m.percentage}
//               amount={amt} isPaid={isPaid} isDue={isDue} index={i} fmt={fmt} />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading) return (
//     <div style={{ color: "#475569", fontSize: "12px", padding: "10px" }}>
//       Loading payment schedule...
//     </div>
//   );

//   const { milestones, total_amount, paid_amount, balance_due } = data;
//   const pct = total_amount > 0 ? Math.round((paid_amount / total_amount) * 100) : 0;

//   return (
//     <div style={{ marginTop: "8px" }}>
//       {/* Progress bar */}
//       <div style={{ marginBottom: "14px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between",
//                       fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
//           <span>Payment Progress</span>
//           <span>{pct}% complete</span>
//         </div>
//         <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px",
//                       height: "6px", overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${pct}%`, borderRadius: "20px",
//                         background: "linear-gradient(90deg,#c9a96e,#a07840)",
//                         transition: "width 0.4s" }} />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between",
//                       fontSize: "11px", marginTop: "4px" }}>
//           <span style={{ color: "#22c55e" }}>Paid: {fmt(paid_amount)}</span>
//           <span style={{ color: balance_due > 0 ? "#f59e0b" : "#22c55e" }}>
//             Balance: {fmt(balance_due)}
//           </span>
//         </div>
//       </div>

//       {/* Milestone rows */}
//       {milestones.map((m, i) => {
//         const isPaid    = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived  = m.status === "waived";
//         const isDue     = !isPaid && !isWaived && i === milestones.findIndex(x => x.status === "pending" || x.status === "overdue");
//         return (
//           <MilestoneRow
//             key={m.id}
//             label={m.label}
//             percentage={m.percentage}
//             amount={m.amount}
//             isPaid={isPaid}
//             isDue={isDue}
//             isOverdue={isOverdue}
//             isWaived={isWaived}
//             dueDate={m.due_date}
//             paidAt={m.paid_at}
//             index={i}
//             fmt={fmt}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({ label, percentage, amount, isPaid, isDue, isOverdue, isWaived, dueDate, paidAt, index, fmt }) => {
//   const color = isPaid ? "#c9a96e" : isOverdue ? "#ef4444" : isWaived ? "#64748b" : isDue ? "#e2e8f0" : "#475569";
//   const dotColor = isPaid ? "#22c55e" : isOverdue ? "#ef4444" : isWaived ? "#64748b" : isDue ? "#f59e0b" : "rgba(255,255,255,0.1)";

//   return (
//     <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "8px" }}>
//       <div style={{
//         width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
//         background: isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.15)" : isDue ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.04)",
//         border: `2px solid ${isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.5)" : isDue ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: "11px", fontWeight: "800",
//         color: isPaid ? "#000" : isOverdue ? "#ef4444" : isDue ? "#c9a96e" : "#334155",
//       }}>
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div style={{
//         flex: 1, padding: "8px 12px", borderRadius: "8px",
//         background: isPaid ? "rgba(201,169,110,0.08)" : isOverdue ? "rgba(239,68,68,0.06)" : isDue ? "rgba(201,169,110,0.04)" : "rgba(255,255,255,0.02)",
//         border: `1px solid ${isPaid ? "rgba(201,169,110,0.25)" : isOverdue ? "rgba(239,68,68,0.2)" : isDue ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.05)"}`,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color }}>
//               {label}
//             </div>
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "1px" }}>
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? "8px" : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "4px" }}>⚠ Overdue</span>}
//                 </span>
//               )}
//               {isPaid && paidAt && (
//                 <span style={{ color: "#22c55e", marginLeft: "4px" }}>✓ Paid {paidAt}</span>
//               )}
//               {isDue && !isOverdue && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>← Due now</span>}
//               {isWaived && <span style={{ color: "#64748b", marginLeft: "8px" }}>Waived</span>}
//             </div>
//           </div>
//           <div style={{ fontSize: "15px", fontWeight: "800", color, flexShrink: 0, marginLeft: "12px" }}>
//             {fmt(amount)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ────────────────────────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmt, onNavigate }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId }))
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;

//   const overdueCount = dues.filter((d) => d.status === "overdue").length;

//   return (
//     <div style={{
//       marginBottom: "20px",
//       background: overdueCount > 0 ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
//       border: `1px solid ${overdueCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
//       borderRadius: "14px", padding: "16px 18px",
//     }}>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
//         <div style={{ fontSize: "13px", fontWeight: "700",
//                       color: overdueCount > 0 ? "#ef4444" : "#f59e0b" }}>
//           💳 Upcoming Payments
//           {overdueCount > 0 && (
//             <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "10px",
//                            background: "rgba(239,68,68,0.15)", color: "#ef4444",
//                            fontSize: "11px", fontWeight: "700" }}>
//               {overdueCount} overdue
//             </span>
//           )}
//         </div>
//         <div style={{ fontSize: "12px", color: "#64748b" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {dues.map((d, i) => (
//           <div key={i} style={{
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             padding: "10px 14px", borderRadius: "10px",
//             background: d.status === "overdue" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.06)",
//             border: `1px solid ${d.status === "overdue" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)"}`,
//             cursor: "pointer",
//           }}
//             onClick={() => onNavigate(`/payment/${d.bookingId}`)}
//           >
//             <div>
//               <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>
//                 {d.label}
//               </div>
//               <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && (
//                   <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "8px" }}>
//                     ⚠ Overdue
//                   </span>
//                 )}
//                 <span style={{ color: "#475569", marginLeft: "8px" }}>
//                   · Booking #{d.bookingId}
//                 </span>
//               </div>
//             </div>
//             <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
//               <div style={{
//                 fontSize: "16px", fontWeight: "800",
//                 color: d.status === "overdue" ? "#ef4444" : "#f59e0b",
//               }}>
//                 {fmt(d.amount)}
//               </div>
//               <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
//                 Tap to pay →
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Booking Card ───────────────────────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmt, token }) => {
//   const [expanded,      setExpanded]      = useState(false);
//   const [cancelling,    setCancelling]    = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);
//   const cfg      = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan     = booking.payment_plan;
//   const price    = parseFloat(booking.price || 0);
//   const downAmt  = booking.down_payment_amount
//     ? parseFloat(booking.down_payment_amount)
//     : plan?.milestones?.[0]?.percentage
//       ? Math.round((price * plan.milestones[0].percentage) / 100)
//       : price;
//   const isPending = booking.booking_status === "pending";

//   return (
//     <div style={{
//       background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//       border: "1px solid rgba(255,255,255,0.07)",
//       borderRadius: "16px", overflow: "hidden", transition: "border-color 0.2s",
//     }}
//       onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")}
//       onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between",
//                       alignItems: "flex-start", gap: "12px" }}>
//           <div style={{ flex: 1 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//               <span style={{ fontSize: "17px", fontWeight: "800", color: "#e2e8f0" }}>
//                 Unit {booking.plot_number}
//               </span>
//               <span style={{
//                 padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
//                 background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
//               }}>
//                 {cfg.label}
//               </span>
//             </div>
//             <div style={{ marginTop: "3px", fontSize: "12px", color: "#64748b",
//                           display: "flex", gap: "10px", flexWrap: "wrap" }}>
//               <span>{booking.plot_type}</span>
//               {booking.area      && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div style={{ marginTop: "6px", padding: "6px 10px",
//                             background: "rgba(201,169,110,0.06)",
//                             border: "1px solid rgba(201,169,110,0.12)",
//                             borderRadius: "8px", fontSize: "12px" }}>
//                 <span style={{ color: "#64748b" }}>Client: </span>
//                 <span style={{ color: "#c9a96e", fontWeight: "600" }}>{booking.client_name}</span>
//                 {booking.client_phone && <span style={{ color: "#64748b" }}> · {booking.client_phone}</span>}
//                 {booking.client_email && <span style={{ color: "#64748b" }}> · {booking.client_email}</span>}
//               </div>
//             )}
//             <div style={{ marginTop: "4px", fontSize: "11px", color: "#334155" }}>
//               #{booking.id} ·{" "}
//               {new Date(booking.created_at).toLocaleDateString("en-IN", {
//                 day: "numeric", month: "short", year: "numeric",
//               })}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: "11px", color: "#475569", marginBottom: "2px" }}>
//               {isPending ? "Amount Due" : "Amount Paid"}
//             </div>
//             <div style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}>
//               {fmt(downAmt)}
//             </div>
//             {plan && (
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//                 Total: {fmt(price)}
//               </div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px",
//                         padding: "7px 12px", background: "rgba(201,169,110,0.06)",
//                         border: "1px solid rgba(201,169,110,0.15)", borderRadius: "8px" }}>
//             <span style={{ fontSize: "13px" }}>💰</span>
//             <span style={{ fontSize: "12px", color: "#64748b" }}>Commission:</span>
//             <span style={{ fontSize: "13px", fontWeight: "800", color: "#c9a96e" }}>
//               {fmt(booking.commission_amount)}
//             </span>
//             {booking.commission_status && (() => {
//               const cs = COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//               return (
//                 <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: cs.color }}>
//                   {cs.label}
//                 </span>
//               );
//             })()}
//           </div>
//         )}

//         <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
//           {isPending && (
//             <button onClick={() => onPay(booking.id)} style={{
//               padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "13px", fontWeight: "700",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               color: "#fff", border: "none",
//             }}>
//               💳 Complete Payment
//             </button>
//           )}
//           <button onClick={() => setExpanded((e) => !e)} style={{
//             padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//             fontSize: "12px", background: "transparent", color: "#64748b",
//             border: "1px solid rgba(255,255,255,0.08)",
//           }}>
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button onClick={() => setConfirmCancel(true)} style={{
//               padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "12px", background: "transparent", color: "#ef4444",
//               border: "1px solid rgba(239,68,68,0.25)", marginLeft: "auto",
//             }}>
//               ✕ Cancel
//             </button>
//           )}
//           {isPending && confirmCancel && (
//             <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
//               <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sure?</span>
//               <button disabled={cancelling} onClick={async () => {
//                 setCancelling(true);
//                 await onCancel(booking.id);
//                 setCancelling(false);
//                 setConfirmCancel(false);
//               }} style={{
//                 padding: "7px 14px", borderRadius: "7px", cursor: "pointer",
//                 fontSize: "12px", fontWeight: "700",
//                 background: "rgba(239,68,68,0.15)", color: "#ef4444",
//                 border: "1px solid rgba(239,68,68,0.3)",
//               }}>
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button onClick={() => setConfirmCancel(false)} style={{
//                 padding: "7px 10px", borderRadius: "7px", cursor: "pointer",
//                 fontSize: "12px", background: "transparent", color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}>
//                 No
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div style={{ padding: "0 20px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
//           <MilestoneTracker bookingId={booking.id} token={token} fmt={fmt} booking={booking} />
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Edit Panel ─────────────────────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast }) => {
//   const [form, setForm] = useState({
//     name: user.name || "", phone: user.phone || "",
//     current_password: "", new_password: "", confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500);
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) {
//         payload.current_password = form.current_password;
//         payload.new_password = form.new_password;
//       }
//       const res = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json",
//                    Authorization: `Bearer ${user.token}` },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(
//         data.message || Object.values(data.errors || {}).flat().join(", ") || "Update failed"
//       );
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) {
//       showToast("❌ " + e.message, "error", 4000);
//     }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";
//   const inp = (placeholder, key, type = "text", readOnly = false) => (
//     <input type={type} placeholder={placeholder} value={form[key] ?? ""} readOnly={readOnly}
//       onChange={(e) => !readOnly && setForm((f) => ({ ...f, [key]: e.target.value }))}
//       style={{
//         width: "100%", padding: "10px 14px", marginBottom: "10px",
//         background: readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
//         border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
//         color: readOnly ? "#475569" : "#e2e8f0", fontSize: "13px", outline: "none",
//         boxSizing: "border-box", cursor: readOnly ? "not-allowed" : "text",
//       }}
//     />
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
//                     borderRadius: "14px", padding: "20px" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
//           <div style={{ width: "56px", height: "56px", borderRadius: "50%",
//                         background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         fontSize: "22px", fontWeight: "800", color: "#000", flexShrink: 0 }}>
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}>{user.name}</div>
//             <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{user.email}</div>
//             <div style={{ fontSize: "12px", color: "#c9a96e", marginTop: "2px",
//                           fontWeight: "600", textTransform: "capitalize" }}>
//               {isBroker ? `🤝 Broker${user.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//         </div>
//         {isBroker && (
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
//             {[
//               { label: "Commission Rate", value: `${user.commission_rate || 2}%` },
//               { label: "Account Status", value: user.status || "active",
//                 color: user.status === "active" ? "#22c55e" : "#ef4444" },
//             ].map(({ label, value, color }) => (
//               <div key={label} style={{ padding: "10px 14px", background: "rgba(201,169,110,0.06)",
//                                         border: "1px solid rgba(201,169,110,0.12)", borderRadius: "8px" }}>
//                 <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//                   {label}
//                 </div>
//                 <div style={{ fontSize: "14px", fontWeight: "700", color: color || "#c9a96e", marginTop: "2px" }}>
//                   {value}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px" }}>
//           ✏️ Edit Profile
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Full Name *", "name")}</div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input value={user.email} readOnly placeholder="Email" style={{
//               width: "100%", padding: "10px 14px", marginBottom: "10px",
//               background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
//               borderRadius: "8px", color: "#475569", fontSize: "13px", outline: "none",
//               boxSizing: "border-box", cursor: "not-allowed",
//             }} />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Phone Number", "phone", "tel")}</div>
//         </div>
//         <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px", marginTop: "4px",
//                       letterSpacing: "0.5px", textTransform: "uppercase" }}>
//           Change Password (leave blank to keep current)
//         </div>
//         {inp("Current Password", "current_password", "password")}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div>{inp("New Password", "new_password", "password")}</div>
//           <div>{inp("Confirm Password", "confirm_password", "password")}</div>
//         </div>
//         <button onClick={handleSave} disabled={saving || !form.name} style={{
//           width: "100%", padding: "11px", borderRadius: "8px",
//           cursor: saving ? "not-allowed" : "pointer",
//           background: "linear-gradient(135deg,#c9a96e,#a07840)",
//           color: "#fff", border: "none", fontWeight: "700", fontSize: "13px",
//           marginTop: "4px", opacity: saving ? 0.7 : 1,
//         }}>
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Stats ───────────────────────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmt }) => {
//   const commPending  = bookings.filter((b) => b.commission_status === "pending").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings.filter((b) => b.commission_status === "approved").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid     = bookings.filter((b) => b.commission_status === "paid").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//                   gap: "10px", marginBottom: "20px" }}>
//       {[
//         { label: "Pending Commission",  value: fmt(commPending),  color: "#f59e0b", icon: "⏳" },
//         { label: "Approved Commission", value: fmt(commApproved), color: "#3b82f6", icon: "✅" },
//         { label: "Commission Paid",     value: fmt(commPaid),     color: "#22c55e", icon: "💰" },
//         { label: "Total Clients",       value: bookings.length,   color: "#c9a96e", icon: "👥" },
//       ].map(({ label, value, color, icon }) => (
//         <div key={label} style={{ background: "rgba(255,255,255,0.03)",
//                                    border: "1px solid rgba(255,255,255,0.07)",
//                                    borderRadius: "12px", padding: "14px 16px" }}>
//           <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//           <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications Tab ──────────────────────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder: { icon: "💳", color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Payment Reminder"  },
//   booking_confirmed:{ icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Booking Confirmed" },
//   booking_cancelled:{ icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Booking Cancelled" },
//   project_launch:   { icon: "🏗️", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "Project Launch"    },
//   offer:            { icon: "🎁", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)",  label: "Special Offer"     },
//   general:          { icon: "🔔", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "General"           },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate }) => {
//   const cfg = notif ? NOTIF_CFG[notif.type] || NOTIF_CFG.general : NOTIF_CFG.general;
//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);
//   if (!notif) return null;
//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   };
//   return (
//     <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000,
//       background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
//       display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
//       <div onClick={(e) => e.stopPropagation()} style={{
//         background: "linear-gradient(135deg,#0f0f1e,#12121f)",
//         border: `1px solid ${cfg.color}33`, borderTop: `3px solid ${cfg.color}`,
//         borderRadius: "16px", maxWidth: "520px", width: "100%",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
//         <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
//               <div style={{ width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div style={{ fontSize: "15px", fontWeight: "800", color: "#e2e8f0", lineHeight: "1.3" }}>
//                   {notif.title}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                   <span style={{ fontSize: "11px", color: "#475569" }}>🕐 {timeAgo(notif.created_at)}</span>
//                 </div>
//               </div>
//             </div>
//             <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.08)", color: "#64748b",
//               width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.75", whiteSpace: "pre-line",
//                         background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
//                         borderRadius: "10px", padding: "16px" }}>
//             {notif.message}
//           </div>
//           <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
//             {notif.booking_id && (
//               <button onClick={() => { onClose(); onNavigate(`/payment/${notif.booking_id}`); }}
//                 style={{ padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
//                          fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                          color: "#fff", border: "none" }}>
//                 View Booking →
//               </button>
//             )}
//             <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "13px", background: "transparent", color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)" }}>Close</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({ notifications, loading, unreadCount, onMarkRead, onMarkAllRead, onNavigate }) => {
//   const [filter, setFilter] = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);
//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read")   return n.is_read;
//     return true;
//   });
//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
//   };
//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading notifications...
//     </div>
//   );
//   return (
//     <div>
//       {selectedNotif && <NotificationModal notif={selectedNotif} onClose={() => setSelectedNotif(null)}
//         onMarkRead={onMarkRead} onNavigate={onNavigate} />}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
//         <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)",
//                       padding: "4px", borderRadius: "8px" }}>
//           {[["all","All"],["unread","Unread"],["read","Read"]].map(([val, label]) => (
//             <button key={val} onClick={() => setFilter(val)} style={{
//               padding: "5px 14px", borderRadius: "6px", cursor: "pointer",
//               fontSize: "12px", fontWeight: "600",
//               background: filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//               color: filter === val ? "#c9a96e" : "#64748b",
//               border: filter === val ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span style={{ marginLeft: "5px", padding: "0 5px", borderRadius: "10px",
//                                fontSize: "10px", background: "#f59e0b", color: "#000", fontWeight: "800" }}>
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button onClick={onMarkAllRead} style={{ padding: "6px 14px", borderRadius: "7px", cursor: "pointer",
//             fontSize: "12px", fontWeight: "600", background: "rgba(201,169,110,0.08)",
//             color: "#c9a96e", border: "1px solid rgba(201,169,110,0.2)" }}>✓ Mark all read</button>
//         )}
//       </div>
//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>
//           <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//             {filter === "unread" ? "No unread notifications" : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Payment reminders and booking updates will appear here.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {filtered.map((n) => {
//           const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.general;
//           return (
//             <div key={n.id} onClick={() => setSelectedNotif(n)} style={{
//               display: "flex", gap: "14px", alignItems: "flex-start",
//               padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
//               background: n.is_read ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`,
//               border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"}`,
//               transition: "all 0.2s", position: "relative",
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color + "55"; e.currentTarget.style.transform = "translateY(-1px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.borderColor = n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"; e.currentTarget.style.transform = "none"; }}
//             >
//               {!n.is_read && (
//                 <div style={{ position: "absolute", top: "14px", right: "14px", width: "8px", height: "8px",
//                               borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
//               )}
//               <div style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "13px", fontWeight: n.is_read ? "600" : "700", color: n.is_read ? "#94a3b8" : "#e2e8f0" }}>
//                     {n.title}
//                   </span>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 7px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                 </div>
//                 <div style={{ fontSize: "12px", color: n.is_read ? "#475569" : "#94a3b8", lineHeight: "1.5", marginBottom: "6px" }}>
//                   {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "11px", color: "#334155" }}>🕐 {timeAgo(n.created_at)}</span>
//                   <span style={{ fontSize: "11px", color: cfg.color, fontWeight: "600" }}>Click to read →</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Payments Tab ───────────────────────────────────────────────────────────────
// const GW_CFG = {
//   razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
//   stripe:   { icon: "💎", color: "#8b5cf6", label: "Stripe"   },
//   phonepe:  { icon: "📱", color: "#f59e0b", label: "PhonePe"  },
//   cash:     { icon: "💵", color: "#22c55e", label: "Cash"     },
//   manual:   { icon: "🏦", color: "#64748b", label: "Manual"   },
// };
// const TXN_STATUS = {
//   success:  { color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Success"  },
//   pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Pending"  },
//   failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Failed"   },
//   refunded: { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", label: "Refunded" },
// };

// const PaymentsTab = ({ payments, loading, fmt }) => {
//   const totalPaid    = payments.filter((p) => p.status === "success").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
//   const successCount = payments.filter((p) => p.status === "success").length;
//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading payment history...
//     </div>
//   );
//   return (
//     <div>
//       {payments.length > 0 && (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//                       gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Paid",   value: fmt(totalPaid),                                           color: "#22c55e", icon: "💰" },
//             { label: "Transactions", value: successCount,                                              color: "#c9a96e", icon: "🧾" },
//             { label: "Pending",      value: payments.filter((p) => p.status === "pending").length,    color: "#f59e0b", icon: "⏳" },
//           ].map(({ label, value, color, icon }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)",
//                                        border: "1px solid rgba(255,255,255,0.07)",
//                                        borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       )}
//       {payments.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
//           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//             No payment history yet
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Your payment transactions will appear here once you make a booking payment.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {payments.map((p) => {
//           const gw  = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
//           const txn = TXN_STATUS[p.status] || TXN_STATUS.pending;
//           return (
//             <div key={p.id} style={{ background: "rgba(255,255,255,0.02)",
//                                       border: "1px solid rgba(255,255,255,0.07)",
//                                       borderRadius: "12px", padding: "16px 18px",
//                                       borderLeft: `3px solid ${txn.color}` }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
//                             gap: "12px", flexWrap: "wrap" }}>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
//                     <span style={{ fontSize: "16px" }}>{gw.icon}</span>
//                     <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{gw.label}</span>
//                     <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
//                                    background: txn.bg, color: txn.color, border: `1px solid ${txn.color}33` }}>
//                       {txn.label}
//                     </span>
//                     {p._synthetic && (
//                       <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
//                                      background: "rgba(251,191,36,0.1)", color: "#fbbf24",
//                                      border: "1px solid rgba(251,191,36,0.25)" }}>🏢 Walk-in / Cash</span>
//                     )}
//                     {!p._synthetic && p.mode && p.mode !== "online" && (
//                       <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "10px",
//                                      background: "rgba(255,255,255,0.05)", color: "#64748b",
//                                      border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize" }}>
//                         {p.mode}
//                       </span>
//                     )}
//                   </div>
//                   {p.booking && (
//                     <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
//                       🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
//                     </div>
//                   )}
//                   {(p.gateway_payment_id || p.gateway_order_id) && (
//                     <div style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace" }}>
//                       Ref: {p.gateway_payment_id || p.gateway_order_id}
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ textAlign: "right", flexShrink: 0 }}>
//                   <div style={{ fontSize: "20px", fontWeight: "800", color: txn.color }}>{fmt(p.amount)}</div>
//                   <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//                     {p.paid_at
//                       ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
//                       : new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                   </div>
//                 </div>
//               </div>
//               {p.notes && (
//                 <div style={{ marginTop: "8px", fontSize: "12px", color: "#475569",
//                               padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
//                   📝 {p.notes}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ───────────────────────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { icon: "💬", color: "#6c757d" },
//   service: { icon: "🛎️", color: "#3b82f6" },
//   unit:    { icon: "🏠", color: "#c9a96e" },
//   payment: { icon: "💳", color: "#f59e0b" },
//   staff:   { icon: "👤", color: "#8b5cf6" },
// };
// const StarRating = ({ value, onChange }) => (
//   <div style={{ display: "flex", gap: "4px" }}>
//     {[1,2,3,4,5].map((s) => (
//       <button key={s} type="button" onClick={() => onChange(s)} style={{
//         background: "none", border: "none", cursor: "pointer", fontSize: "24px",
//         padding: "0 2px", color: s <= value ? "#c9a96e" : "rgba(255,255,255,0.15)", transition: "color 0.15s",
//       }}>★</button>
//     ))}
//   </div>
// );
// const FeedbackTab = ({ feedbacks, bookings, token, onSubmitted, showToast }) => {
//   const [showForm,   setShowForm]   = useState(false);
//   const [form,       setForm]       = useState({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//   const [submitting, setSubmitting] = useState(false);
//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) { showToast("⚠️ Subject and message are required", "warning", 3500); return; }
//     setSubmitting(true);
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ ...form, booking_id: form.booking_id || undefined }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast("🙏 Thank you! Your feedback has been submitted", "success", 4000);
//       setForm({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSubmitting(false);
//   };
//   const inp = (style = {}) => ({ width: "100%", padding: "10px 14px", marginBottom: "10px",
//     background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box", ...style });
//   const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed");
//   return (
//     <div>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//         <div>
//           <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>Your Feedback</div>
//           <div style={{ fontSize: "12px", color: "#475569" }}>Share your experience with us</div>
//         </div>
//         <button onClick={() => setShowForm((f) => !f)} style={{
//           padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
//           background: showForm ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#c9a96e,#a07840)",
//           color: showForm ? "#64748b" : "#fff", border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
//         }}>{showForm ? "✕ Cancel" : "+ New Feedback"}</button>
//       </div>
//       {showForm && (
//         <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.2)",
//                       borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
//           <div style={{ fontSize: "13px", fontWeight: "700", color: "#c9a96e", marginBottom: "16px" }}>✍️ New Feedback</div>
//           <div style={{ marginBottom: "14px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rating *</div>
//             <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
//               {["","Very Poor","Poor","Average","Good","Excellent"][form.rating]}
//             </div>
//           </div>
//           <div style={{ marginBottom: "10px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category *</div>
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => (
//                 <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} style={{
//                   padding: "5px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
//                   background: form.category === cat ? `${cfg.color}22` : "rgba(255,255,255,0.03)",
//                   color: form.category === cat ? cfg.color : "#64748b",
//                   border: `1px solid ${form.category === cat ? cfg.color + "55" : "rgba(255,255,255,0.08)"}`,
//                   textTransform: "capitalize",
//                 }}>{cfg.icon} {cat}</button>
//               ))}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select value={form.booking_id} onChange={(e) => setForm((f) => ({ ...f, booking_id: e.target.value }))}
//               style={{ ...inp(), marginBottom: "10px" }}>
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => (
//                 <option key={b.id} value={b.id}>Unit {b.plot_number} — Booking #{b.id}</option>
//               ))}
//             </select>
//           )}
//           <input type="text" placeholder="Subject *" value={form.subject}
//             onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inp()} />
//           <textarea placeholder="Your message..." value={form.message}
//             onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
//             rows={4} style={{ ...inp(), resize: "vertical" }} />
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button onClick={handleSubmit} disabled={submitting} style={{
//               padding: "10px 22px", borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
//               fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               color: "#fff", border: "none", opacity: submitting ? 0.7 : 1,
//             }}>{submitting ? "Submitting…" : "Submit Feedback →"}</button>
//             <button onClick={() => setShowForm(false)} style={{ padding: "10px 14px", borderRadius: "8px",
//               cursor: "pointer", fontSize: "13px", background: "transparent", color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
//           </div>
//         </div>
//       )}
//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
//           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No feedback yet</div>
//           <div style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>Share your experience to help us improve.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {feedbacks.map((fb) => {
//           const catCfg     = CATEGORY_CFG[fb.category] || CATEGORY_CFG.general;
//           const ratingColor = fb.rating >= 4 ? "#22c55e" : fb.rating >= 3 ? "#f59e0b" : "#ef4444";
//           return (
//             <div key={fb.id} style={{ background: "rgba(255,255,255,0.02)",
//                                        border: "1px solid rgba(255,255,255,0.07)",
//                                        borderRadius: "12px", overflow: "hidden" }}>
//               <div style={{ padding: "14px 16px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
//                       <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{fb.subject}</span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px",
//                                      background: `${catCfg.color}22`, color: catCfg.color,
//                                      border: `1px solid ${catCfg.color}33`, textTransform: "capitalize" }}>
//                         {catCfg.icon} {fb.category}
//                       </span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px", fontWeight: "700",
//                                      textTransform: "capitalize",
//                                      background: fb.status === "resolved" ? "rgba(34,197,94,0.1)" : fb.status === "reviewed" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
//                                      color: fb.status === "resolved" ? "#22c55e" : fb.status === "reviewed" ? "#3b82f6" : "#f59e0b" }}>
//                         {fb.status}
//                       </span>
//                     </div>
//                     <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                     </div>
//                   </div>
//                   <div style={{ color: ratingColor, fontSize: "16px", fontWeight: "800", flexShrink: 0 }}>
//                     {"★".repeat(fb.rating)}
//                   </div>
//                 </div>
//                 <div style={{ marginTop: "8px", fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>{fb.message}</div>
//                 {fb.admin_reply && (
//                   <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(34,197,94,0.06)",
//                                 border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px" }}>
//                     <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "700", marginBottom: "4px",
//                                   textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 Admin Reply</div>
//                     <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", whiteSpace: "pre-line" }}>
//                       {fb.admin_reply}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ─────────────────────────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user     = useSelector(selectUser);

//   const [bookings,        setBookings]        = useState([]);
//   const [milestoneMap,    setMilestoneMap]    = useState({}); // bookingId -> milestones data
//   const [loading,         setLoading]         = useState(true);
//   const [error,           setError]           = useState("");
//   const [activeTab,       setActiveTab]       = useState("bookings");
//   const [notifications,   setNotifications]   = useState([]);
//   const [notifsLoading,   setNotifsLoading]   = useState(false);
//   const [unreadCount,     setUnreadCount]     = useState(0);
//   const [feedbacks,       setFeedbacks]       = useState([]);
//   const [payments,        setPayments]        = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages,  setUnreadMessages]  = useState(0);

//   const { showToast } = useToast();
//   const { wishlist, wishedIds, toggle: toggleWishRaw, loading: wishLoading } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(async (plotId) => {
//     const wasWished = wishedIds instanceof Set && wishedIds.has(Number(plotId));
//     await toggleWishRaw(Number(plotId));
//     showToast(wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//               wasWished ? "wishlist_remove" : "wishlist_add", 2800);
//   }, [wishedIds, toggleWishRaw, showToast]);

//   const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", position: "before" });
//   const fmt = useCallback((n) => makeFmt(currency.symbol, currency.code, currency.position)(n), [currency]);
//   const isBroker = user?.role === "broker";

//   // Fetch milestones for confirmed bookings that have a payment plan
//   const fetchMilestones = useCallback(async (bookingsList) => {
//     const targets = bookingsList.filter(
//       (b) => b.booking_status === "confirmed" && b.payment_plan_id
//     );
//     if (!targets.length) return;
//     const results = await Promise.all(
//       targets.map((b) =>
//         fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//           headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//         }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
//       )
//     );
//     const map = {};
//     targets.forEach((b, i) => { if (results[i]) map[b.id] = results[i]; });
//     setMilestoneMap(map);
//   }, [user?.token]);

//   useEffect(() => {
//     if (!user?.token) { navigate("/"); return; }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => { if (d) setCurrency({ symbol: d.symbol || "₹", code: d.code || "INR", position: d.position || "before" }); })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//     ]);

//     const params     = new URLSearchParams(window.location.search);
//     const bookingId  = params.get("booking");
//     const sessionId  = params.get("session_id");
//     const txnId      = params.get("txn");
//     if (bookingId && (sessionId || txnId)) {
//       const confirmPayment = async () => {
//         try {
//           if (sessionId) {
//             await fetch(`${API_BASE}/payment/stripe/confirm`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//               body: JSON.stringify({ booking_id: bookingId, session_id: sessionId }),
//             });
//           }
//           await Promise.all([fetchBookings(), fetchNotifications(), fetchPayments()]);
//           showToast("🎉 Payment confirmed! Your booking is now active.", "booking", 5000);
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, { headers: { Authorization: `Bearer ${user.token}` } })
//       .then((r) => r.json()).then((d) => setUnreadMessages(d.unread || 0));
//   }, [user]);

//   const fetchBookings = async () => {
//     setLoading(true); setError("");
//     try {
//       const res  = await fetch(`${API_BASE}/bookings`, {
//         headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       // Fetch milestones after bookings loaded
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally { setLoading(false); }
//   };

//   const fetchPayments = async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//         fetch(`${API_BASE}/bookings`,         { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//       ]);
//       const txns     = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books    = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList  = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter((b) => b.booking_status === "confirmed" && !txnBookingIds.has(String(b.id)))
//         .map((b) => ({
//           id: `booking_${b.id}`, booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR", status: "success", mode: "manual",
//           gateway: "cash / manual", paid_at: b.created_at, _synthetic: true,
//           booking: { id: b.id, plot_number: b.plot_number, plot_type: b.plot_type, booking_status: b.booking_status },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {} finally { setPaymentsLoading(false); }
//   };

//   const fetchFeedbacks = async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   };

//   const fetchNotifications = async () => {
//     setNotifsLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {} finally { setNotifsLoading(false); }
//   };

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const handlePay    = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 600);
//   };
//   const handleSaved = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res  = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, booking_status: "cancelled" } : b));
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//   };

//   const confirmed     = bookings.filter((b) => b.booking_status === "confirmed").length;
//   const pending       = bookings.filter((b) => b.booking_status === "pending").length;
//   const totalInvested = bookings.filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => s + parseFloat(b.down_payment_amount || b.price || 0), 0);

//   const tabs = [
//     { id: "bookings",      label: isBroker ? "Client Bookings" : "My Bookings", count: bookings.length },
//     { id: "wishlist",      label: "Wishlist",       count: wishlist.length  },
//     { id: "payments",      label: "Payments",       count: 0               },
//     { id: "notifications", label: "Notifications",  count: unreadCount     },
//     { id: "feedback",      label: "Feedback",       count: 0               },
//     { id: "messages",      label: "Messages",       count: unreadMessages  },
//     { id: "profile",       label: "My Profile",     count: 0               },
//   ];

//   return (
//     <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* Header */}
//       <div style={{ background: "rgba(8,8,18,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)",
//                     padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
//                     height: "62px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//           <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#64748b",
//             cursor: "pointer", fontSize: "13px", padding: "6px 10px", borderRadius: "6px" }}>← Back</button>
//           <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)" }} />
//           <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>
//             {isBroker ? "🤝 Broker Dashboard" : "🏠 My Dashboard"}
//           </span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{user?.name}</div>
//             <div style={{ fontSize: "11px", color: "#475569" }}>
//               {isBroker ? `🤝 Broker${user?.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//           <div style={{ width: "34px", height: "34px", borderRadius: "50%",
//                         background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         fontWeight: "800", fontSize: "13px", color: "#000" }}>
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)",
//             border: "1px solid rgba(255,255,255,0.08)", color: "#64748b",
//             padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
//           <button onClick={() => setActiveTab("notifications")} style={{ position: "relative",
//             background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//             color: "#64748b", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
//             🔔
//             {unreadCount > 0 && (
//               <span style={{ position: "absolute", top: "-5px", right: "-5px", minWidth: "16px", height: "16px",
//                              borderRadius: "10px", background: "#f59e0b", color: "#000", fontSize: "9px",
//                              fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: "920px", margin: "0 auto", padding: "28px 18px" }}>
//         <div style={{ marginBottom: "22px" }}>
//           <div style={{ fontSize: "24px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.4px" }}>
//             Welcome back, {user?.name?.split(" ")[0]} 👋
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569", marginTop: "3px" }}>
//             {isBroker ? "Manage your client bookings and track your commissions." : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* Stat cards */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//                       gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Bookings", value: bookings.length,    icon: "🏠", color: "#c9a96e" },
//             { label: "Confirmed",      value: confirmed,           icon: "✅", color: "#22c55e" },
//             { label: "Pending Payment",value: pending,             icon: "⏳", color: "#f59e0b" },
//             ...(!isBroker ? [{ label: "Amount Invested", value: fmt(totalInvested), icon: "💰", color: "#c9a96e" }] : []),
//           ].map(({ label, value, icon, color }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)",
//                                        border: "1px solid rgba(255,255,255,0.07)",
//                                        borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && <BrokerStats bookings={bookings} fmt={fmt} />}

//         {/* Tabs */}
//         <div style={{ display: "flex", gap: "4px", marginBottom: "18px",
//                       background: "rgba(255,255,255,0.03)", padding: "4px",
//                       borderRadius: "10px", overflowX: "auto" }}>
//           {tabs.map((t) => (
//             <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
//               padding: "7px 16px", borderRadius: "7px", cursor: "pointer",
//               fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap",
//               background: activeTab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
//               color: activeTab === t.id ? "#c9a96e" : "#64748b",
//               border: activeTab === t.id ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {t.label}
//               {t.count > 0 && (
//                 <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "20px", fontSize: "11px",
//                                background: activeTab === t.id ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.07)",
//                                color: activeTab === t.id ? "#c9a96e" : "#475569" }}>
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Bookings tab */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && (
//               <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//                 <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading bookings...
//               </div>
//             )}
//             {error && (
//               <div style={{ padding: "14px", background: "rgba(239,68,68,0.08)",
//                             border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px",
//                             color: "#fca5a5", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
//                 <span>⚠ {error}</span>
//                 <button onClick={fetchBookings} style={{ background: "none", border: "none",
//                   color: "#c9a96e", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>Retry</button>
//               </div>
//             )}

//             {/* Dues banner — only when not loading */}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner milestoneMap={milestoneMap} fmt={fmt} onNavigate={navigate} />
//             )}

//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏠</div>
//                 <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div style={{ fontSize: "13px", color: "#475569", marginBottom: "20px" }}>
//                   {isBroker ? "Book a unit for your clients from the unit page." : "Browse available units to make your first booking."}
//                 </div>
//                 <button onClick={() => navigate("/")} style={{ padding: "10px 22px",
//                   background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff",
//                   border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>
//                   Browse Units →
//                 </button>
//               </div>
//             )}

//             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//               {!loading && bookings.map((b) => (
//                 <BookingCard key={b.id} booking={b} onPay={handlePay} onCancel={handleCancel}
//                   isBroker={isBroker} fmt={fmt} token={user?.token} />
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab wishlist={wishlist} wishedIds={wishedIds} onToggle={handleWishlistToggle}
//             loading={wishLoading} token={user?.token} onNavigate={navigate} fmt={fmt} />
//         )}
//         {activeTab === "payments" && <PaymentsTab payments={payments} loading={paymentsLoading} fmt={fmt} />}
//         {activeTab === "notifications" && (
//           <NotificationsTab notifications={notifications} loading={notifsLoading} unreadCount={unreadCount}
//             onMarkRead={markRead} onMarkAllRead={markAllRead} onNavigate={navigate} />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab feedbacks={feedbacks} bookings={bookings} token={user?.token}
//             showToast={showToast} onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])} />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "profile" && <ProfilePanel user={user} onSaved={handleSaved} showToast={showToast} />}
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// const makeFmt =
//   (symbol = "₹", code = "INR", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", {
//       maximumFractionDigits: 0,
//     }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol} ${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: {
//     color: "#22c55e",
//     bg: "rgba(34,197,94,0.12)",
//     label: "Confirmed",
//   },
//   pending: {
//     color: "#f59e0b",
//     bg: "rgba(245,158,11,0.12)",
//     label: "Pending Payment",
//   },
//   cancelled: {
//     color: "#ef4444",
//     bg: "rgba(239,68,68,0.12)",
//     label: "Cancelled",
//   },
// };

// const COMM_CFG = {
//   pending: { color: "#f59e0b", label: "Pending Approval" },
//   approved: { color: "#3b82f6", label: "Approved" },
//   paid: { color: "#22c55e", label: "Paid" },
//   rejected: { color: "#ef4444", label: "Rejected" },
// };

// // ── Real Milestone Tracker (uses booking_milestones from API) ─────────────────
// const MilestoneTracker = ({ bookingId, token, fmt, booking }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => {
//         setData(d);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   // Fall back to plan template if no snapshot yet
//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div
//           style={{
//             color: "#475569",
//             fontSize: "13px",
//             padding: "10px",
//             background: "rgba(255,255,255,0.02)",
//             borderRadius: "8px",
//           }}
//         >
//           💰 Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     return (
//       <div style={{ marginTop: "8px" }}>
//         <div
//           style={{
//             fontSize: "11px",
//             color: "#64748b",
//             fontWeight: "700",
//             letterSpacing: "1px",
//             textTransform: "uppercase",
//             marginBottom: "10px",
//           }}
//         >
//           Payment Schedule — {plan.name}
//           <span
//             style={{
//               fontWeight: "400",
//               color: "#475569",
//               marginLeft: "6px",
//               fontSize: "10px",
//             }}
//           >
//             (estimated)
//           </span>
//         </div>
//         {plan.milestones.map((m, i) => {
//           const amt = m.percentage
//             ? Math.round((price * m.percentage) / 100)
//             : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow
//               key={i}
//               label={m.label}
//               percentage={m.percentage}
//               amount={amt}
//               isPaid={isPaid}
//               isDue={isDue}
//               index={i}
//               fmt={fmt}
//             />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading)
//     return (
//       <div style={{ color: "#475569", fontSize: "12px", padding: "10px" }}>
//         Loading payment schedule...
//       </div>
//     );

//   const { milestones, total_amount, paid_amount, balance_due } = data;
//   const pct =
//     total_amount > 0 ? Math.round((paid_amount / total_amount) * 100) : 0;

//   return (
//     <div style={{ marginTop: "8px" }}>
//       {/* Progress bar */}
//       <div style={{ marginBottom: "14px" }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             fontSize: "11px",
//             color: "#64748b",
//             marginBottom: "4px",
//           }}
//         >
//           <span>Payment Progress</span>
//           <span>{pct}% complete</span>
//         </div>
//         <div
//           style={{
//             background: "rgba(255,255,255,0.08)",
//             borderRadius: "20px",
//             height: "6px",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               height: "100%",
//               width: `${pct}%`,
//               borderRadius: "20px",
//               background: "linear-gradient(90deg,#c9a96e,#a07840)",
//               transition: "width 0.4s",
//             }}
//           />
//         </div>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             fontSize: "11px",
//             marginTop: "4px",
//           }}
//         >
//           <span style={{ color: "#22c55e" }}>Paid: {fmt(paid_amount)}</span>
//           <span style={{ color: balance_due > 0 ? "#f59e0b" : "#22c55e" }}>
//             Balance: {fmt(balance_due)}
//           </span>
//         </div>
//       </div>

//       {/* Milestone rows */}
//       {milestones.map((m, i) => {
//         const isPaid = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived = m.status === "waived";
//         const isDue =
//           !isPaid &&
//           !isWaived &&
//           i ===
//             milestones.findIndex(
//               (x) => x.status === "pending" || x.status === "overdue",
//             );
//         return (
//           <MilestoneRow
//             key={m.id}
//             label={m.label}
//             percentage={m.percentage}
//             amount={m.amount}
//             isPaid={isPaid}
//             isDue={isDue}
//             isOverdue={isOverdue}
//             isWaived={isWaived}
//             dueDate={m.due_date}
//             paidAt={m.paid_at}
//             index={i}
//             fmt={fmt}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({
//   label,
//   percentage,
//   amount,
//   isPaid,
//   isDue,
//   isOverdue,
//   isWaived,
//   dueDate,
//   paidAt,
//   index,
//   fmt,
// }) => {
//   const color = isPaid
//     ? "#c9a96e"
//     : isOverdue
//       ? "#ef4444"
//       : isWaived
//         ? "#64748b"
//         : isDue
//           ? "#e2e8f0"
//           : "#475569";
//   const dotColor = isPaid
//     ? "#22c55e"
//     : isOverdue
//       ? "#ef4444"
//       : isWaived
//         ? "#64748b"
//         : isDue
//           ? "#f59e0b"
//           : "rgba(255,255,255,0.1)";

//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: "12px",
//         alignItems: "flex-start",
//         marginBottom: "8px",
//       }}
//     >
//       <div
//         style={{
//           width: "28px",
//           height: "28px",
//           borderRadius: "50%",
//           flexShrink: 0,
//           marginTop: "2px",
//           background: isPaid
//             ? "#c9a96e"
//             : isOverdue
//               ? "rgba(239,68,68,0.15)"
//               : isDue
//                 ? "rgba(201,169,110,0.2)"
//                 : "rgba(255,255,255,0.04)",
//           border: `2px solid ${isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.5)" : isDue ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: "11px",
//           fontWeight: "800",
//           color: isPaid
//             ? "#000"
//             : isOverdue
//               ? "#ef4444"
//               : isDue
//                 ? "#c9a96e"
//                 : "#334155",
//         }}
//       >
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div
//         style={{
//           flex: 1,
//           padding: "8px 12px",
//           borderRadius: "8px",
//           background: isPaid
//             ? "rgba(201,169,110,0.08)"
//             : isOverdue
//               ? "rgba(239,68,68,0.06)"
//               : isDue
//                 ? "rgba(201,169,110,0.04)"
//                 : "rgba(255,255,255,0.02)",
//           border: `1px solid ${isPaid ? "rgba(201,169,110,0.25)" : isOverdue ? "rgba(239,68,68,0.2)" : isDue ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.05)"}`,
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color }}>
//               {label}
//             </div>
//             <div
//               style={{ fontSize: "11px", color: "#475569", marginTop: "1px" }}
//             >
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? "8px" : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && (
//                     <span
//                       style={{
//                         color: "#ef4444",
//                         fontWeight: "700",
//                         marginLeft: "4px",
//                       }}
//                     >
//                       ⚠ Overdue
//                     </span>
//                   )}
//                 </span>
//               )}
//               {isPaid && paidAt && (
//                 <span style={{ color: "#22c55e", marginLeft: "4px" }}>
//                   ✓ Paid {paidAt}
//                 </span>
//               )}
//               {isDue && !isOverdue && (
//                 <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
//                   ← Due now
//                 </span>
//               )}
//               {isWaived && (
//                 <span style={{ color: "#64748b", marginLeft: "8px" }}>
//                   Waived
//                 </span>
//               )}
//             </div>
//           </div>
//           <div
//             style={{
//               fontSize: "15px",
//               fontWeight: "800",
//               color,
//               flexShrink: 0,
//               marginLeft: "12px",
//             }}
//           >
//             {fmt(amount)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ────────────────────────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmt, onNavigate }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId })),
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;

//   const overdueCount = dues.filter((d) => d.status === "overdue").length;

//   return (
//     <div
//       style={{
//         marginBottom: "20px",
//         background:
//           overdueCount > 0 ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
//         border: `1px solid ${overdueCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
//         borderRadius: "14px",
//         padding: "16px 18px",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "12px",
//           flexWrap: "wrap",
//           gap: "8px",
//         }}
//       >
//         <div
//           style={{
//             fontSize: "13px",
//             fontWeight: "700",
//             color: overdueCount > 0 ? "#ef4444" : "#f59e0b",
//           }}
//         >
//           💳 Upcoming Payments
//           {overdueCount > 0 && (
//             <span
//               style={{
//                 marginLeft: "8px",
//                 padding: "2px 8px",
//                 borderRadius: "10px",
//                 background: "rgba(239,68,68,0.15)",
//                 color: "#ef4444",
//                 fontSize: "11px",
//                 fontWeight: "700",
//               }}
//             >
//               {overdueCount} overdue
//             </span>
//           )}
//         </div>
//         <div style={{ fontSize: "12px", color: "#64748b" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {dues.map((d, i) => (
//           <div
//             key={i}
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               padding: "10px 14px",
//               borderRadius: "10px",
//               background:
//                 d.status === "overdue"
//                   ? "rgba(239,68,68,0.08)"
//                   : "rgba(245,158,11,0.06)",
//               border: `1px solid ${d.status === "overdue" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)"}`,
//               cursor: "pointer",
//             }}
//             onClick={() =>
//               onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)
//             }
//           >
//             <div>
//               <div
//                 style={{
//                   fontSize: "13px",
//                   fontWeight: "700",
//                   color: "#e2e8f0",
//                 }}
//               >
//                 {d.label}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}
//               >
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && (
//                   <span
//                     style={{
//                       color: "#ef4444",
//                       fontWeight: "700",
//                       marginLeft: "8px",
//                     }}
//                   >
//                     ⚠ Overdue
//                   </span>
//                 )}
//                 <span style={{ color: "#475569", marginLeft: "8px" }}>
//                   · Booking #{d.bookingId}
//                 </span>
//               </div>
//             </div>
//             <div
//               style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}
//             >
//               <div
//                 style={{
//                   fontSize: "16px",
//                   fontWeight: "800",
//                   color: d.status === "overdue" ? "#ef4444" : "#f59e0b",
//                 }}
//               >
//                 {fmt(d.amount)}
//               </div>
//               <div
//                 style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}
//               >
//                 Tap to pay →
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Booking Card ───────────────────────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmt, token }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [cancelling, setCancelling] = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);
//   const cfg = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan = booking.payment_plan;
//   const price = parseFloat(booking.price || 0);

//   const isConfirmed = booking.booking_status === "confirmed";
//   const isPending = booking.booking_status === "pending";

//   const downAmt = (() => {
//     // If confirmed and transactions exist, sum successful transactions
//     if (isConfirmed && booking.milestones?.length > 0) {
//       const paid = booking.milestones
//         .filter((t) => t.status === "paid")
//         .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
//       if (paid > 0) return paid;
//     }

//     console.log(booking.milestones);

//     // Fall back to down_payment_amount stored on booking
//     if (
//       booking.down_payment_amount &&
//       parseFloat(booking.down_payment_amount) > 0
//     ) {
//       return parseFloat(booking.down_payment_amount);
//     }
//     // Fall back to first milestone calculation
//     if (plan?.milestones?.[0]?.percentage) {
//       return Math.round((price * plan.milestones[0].percentage) / 100);
//     }
//     // Fall back to full price
//     return price;
//   })();

//   return (
//     <div
//       id={`booking-card-${booking.id}`}
//       style={{
//         background:
//           "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//         border: "1px solid rgba(255,255,255,0.07)",
//         borderRadius: "16px",
//         overflow: "hidden",
//         transition: "border-color 0.2s, box-shadow 0.3s",
//       }}
//       onMouseEnter={(e) =>
//         (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")
//       }
//       onMouseLeave={(e) =>
//         (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
//       }
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             gap: "12px",
//           }}
//         >
//           <div style={{ flex: 1 }}>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: "17px",
//                   fontWeight: "800",
//                   color: "#e2e8f0",
//                 }}
//               >
//                 Unit {booking.plot_number}
//               </span>
//               <span
//                 style={{
//                   padding: "2px 10px",
//                   borderRadius: "20px",
//                   fontSize: "11px",
//                   fontWeight: "700",
//                   background: cfg.bg,
//                   color: cfg.color,
//                   border: `1px solid ${cfg.color}33`,
//                 }}
//               >
//                 {cfg.label}
//               </span>
//             </div>
//             <div
//               style={{
//                 marginTop: "3px",
//                 fontSize: "12px",
//                 color: "#64748b",
//                 display: "flex",
//                 gap: "10px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <span>{booking.plot_type}</span>
//               {booking.area && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div
//                 style={{
//                   marginTop: "6px",
//                   padding: "6px 10px",
//                   background: "rgba(201,169,110,0.06)",
//                   border: "1px solid rgba(201,169,110,0.12)",
//                   borderRadius: "8px",
//                   fontSize: "12px",
//                 }}
//               >
//                 <span style={{ color: "#64748b" }}>Client: </span>
//                 <span style={{ color: "#c9a96e", fontWeight: "600" }}>
//                   {booking.client_name}
//                 </span>
//                 {booking.client_phone && (
//                   <span style={{ color: "#64748b" }}>
//                     {" "}
//                     · {booking.client_phone}
//                   </span>
//                 )}
//                 {booking.client_email && (
//                   <span style={{ color: "#64748b" }}>
//                     {" "}
//                     · {booking.client_email}
//                   </span>
//                 )}
//               </div>
//             )}
//             <div
//               style={{ marginTop: "4px", fontSize: "11px", color: "#334155" }}
//             >
//               #{booking.id} ·{" "}
//               {new Date(booking.created_at).toLocaleDateString("en-IN", {
//                 day: "numeric",
//                 month: "short",
//                 year: "numeric",
//               })}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div
//               style={{
//                 fontSize: "11px",
//                 color: "#475569",
//                 marginBottom: "2px",
//               }}
//             >
//               {isPending
//                 ? "Down Payment Due"
//                 : isConfirmed
//                   ? "Amount Paid"
//                   : "Amount"}
//             </div>
//             <div
//               style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}
//             >
//               {fmt(downAmt)}
//             </div>
//             {plan && (
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 Total: {fmt(price)}
//               </div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               marginTop: "10px",
//               padding: "7px 12px",
//               background: "rgba(201,169,110,0.06)",
//               border: "1px solid rgba(201,169,110,0.15)",
//               borderRadius: "8px",
//             }}
//           >
//             <span style={{ fontSize: "13px" }}>💰</span>
//             <span style={{ fontSize: "12px", color: "#64748b" }}>
//               Commission:
//             </span>
//             <span
//               style={{ fontSize: "13px", fontWeight: "800", color: "#c9a96e" }}
//             >
//               {fmt(booking.commission_amount)}
//             </span>
//             {booking.commission_status &&
//               (() => {
//                 const cs =
//                   COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//                 return (
//                   <span
//                     style={{
//                       marginLeft: "auto",
//                       fontSize: "11px",
//                       fontWeight: "700",
//                       color: cs.color,
//                     }}
//                   >
//                     {cs.label}
//                   </span>
//                 );
//               })()}
//           </div>
//         )}

//         <div
//           style={{
//             display: "flex",
//             gap: "8px",
//             marginTop: "12px",
//             flexWrap: "wrap",
//           }}
//         >
//           {isPending && (
//             <button
//               onClick={() => onPay(booking.id)}
//               style={{
//                 padding: "8px 18px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color: "#fff",
//                 border: "none",
//               }}
//             >
//               💳 Complete Payment
//             </button>
//           )}
//           <button
//             onClick={() => setExpanded((e) => !e)}
//             style={{
//               padding: "8px 14px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "12px",
//               background: "transparent",
//               color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)",
//             }}
//           >
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button
//               onClick={() => setConfirmCancel(true)}
//               style={{
//                 padding: "8px 14px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "12px",
//                 background: "transparent",
//                 color: "#ef4444",
//                 border: "1px solid rgba(239,68,68,0.25)",
//                 marginLeft: "auto",
//               }}
//             >
//               ✕ Cancel
//             </button>
//           )}
//           {isPending && confirmCancel && (
//             <div
//               style={{
//                 marginLeft: "auto",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//               }}
//             >
//               <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sure?</span>
//               <button
//                 disabled={cancelling}
//                 onClick={async () => {
//                   setCancelling(true);
//                   await onCancel(booking.id);
//                   setCancelling(false);
//                   setConfirmCancel(false);
//                 }}
//                 style={{
//                   padding: "7px 14px",
//                   borderRadius: "7px",
//                   cursor: "pointer",
//                   fontSize: "12px",
//                   fontWeight: "700",
//                   background: "rgba(239,68,68,0.15)",
//                   color: "#ef4444",
//                   border: "1px solid rgba(239,68,68,0.3)",
//                 }}
//               >
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button
//                 onClick={() => setConfirmCancel(false)}
//                 style={{
//                   padding: "7px 10px",
//                   borderRadius: "7px",
//                   cursor: "pointer",
//                   fontSize: "12px",
//                   background: "transparent",
//                   color: "#64748b",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                 }}
//               >
//                 No
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div
//           style={{
//             padding: "0 20px 16px",
//             borderTop: "1px solid rgba(255,255,255,0.05)",
//             paddingTop: "14px",
//           }}
//         >
//           <MilestoneTracker
//             bookingId={booking.id}
//             token={token}
//             fmt={fmt}
//             booking={booking}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Edit Panel ─────────────────────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast }) => {
//   const [form, setForm] = useState({
//     name: user.name || "",
//     phone: user.phone || "",
//     current_password: "",
//     new_password: "",
//     confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500);
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) {
//         payload.current_password = form.current_password;
//         payload.new_password = form.new_password;
//       }
//       const res = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${user.token}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok)
//         throw new Error(
//           data.message ||
//             Object.values(data.errors || {})
//               .flat()
//               .join(", ") ||
//             "Update failed",
//         );
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({
//         ...f,
//         current_password: "",
//         new_password: "",
//         confirm_password: "",
//       }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) {
//       showToast("❌ " + e.message, "error", 4000);
//     }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";
//   const inp = (placeholder, key, type = "text", readOnly = false) => (
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={form[key] ?? ""}
//       readOnly={readOnly}
//       onChange={(e) =>
//         !readOnly && setForm((f) => ({ ...f, [key]: e.target.value }))
//       }
//       style={{
//         width: "100%",
//         padding: "10px 14px",
//         marginBottom: "10px",
//         background: readOnly
//           ? "rgba(255,255,255,0.02)"
//           : "rgba(255,255,255,0.05)",
//         border: "1px solid rgba(255,255,255,0.1)",
//         borderRadius: "8px",
//         color: readOnly ? "#475569" : "#e2e8f0",
//         fontSize: "13px",
//         outline: "none",
//         boxSizing: "border-box",
//         cursor: readOnly ? "not-allowed" : "text",
//       }}
//     />
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <div
//         style={{
//           background: "rgba(255,255,255,0.02)",
//           border: "1px solid rgba(255,255,255,0.07)",
//           borderRadius: "14px",
//           padding: "20px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "16px",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               width: "56px",
//               height: "56px",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "22px",
//               fontWeight: "800",
//               color: "#000",
//               flexShrink: 0,
//             }}
//           >
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div
//               style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}
//             >
//               {user.name}
//             </div>
//             <div
//               style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}
//             >
//               {user.email}
//             </div>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#c9a96e",
//                 marginTop: "2px",
//                 fontWeight: "600",
//                 textTransform: "capitalize",
//               }}
//             >
//               {isBroker
//                 ? `🤝 Broker${user.broker_company ? " · " + user.broker_company : ""}`
//                 : "👤 Buyer"}
//             </div>
//           </div>
//         </div>
//         {isBroker && (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "8px",
//               marginBottom: "16px",
//             }}
//           >
//             {[
//               {
//                 label: "Commission Rate",
//                 value: `${user.commission_rate || 2}%`,
//               },
//               {
//                 label: "Account Status",
//                 value: user.status || "active",
//                 color: user.status === "active" ? "#22c55e" : "#ef4444",
//               },
//             ].map(({ label, value, color }) => (
//               <div
//                 key={label}
//                 style={{
//                   padding: "10px 14px",
//                   background: "rgba(201,169,110,0.06)",
//                   border: "1px solid rgba(201,169,110,0.12)",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "11px",
//                     color: "#64748b",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.5px",
//                   }}
//                 >
//                   {label}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "14px",
//                     fontWeight: "700",
//                     color: color || "#c9a96e",
//                     marginTop: "2px",
//                   }}
//                 >
//                   {value}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div
//           style={{
//             fontSize: "13px",
//             fontWeight: "700",
//             color: "#e2e8f0",
//             marginBottom: "12px",
//           }}
//         >
//           ✏️ Edit Profile
//         </div>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "0 12px",
//           }}
//         >
//           <div style={{ gridColumn: "1/-1" }}>{inp("Full Name *", "name")}</div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input
//               value={user.email}
//               readOnly
//               placeholder="Email"
//               style={{
//                 width: "100%",
//                 padding: "10px 14px",
//                 marginBottom: "10px",
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 borderRadius: "8px",
//                 color: "#475569",
//                 fontSize: "13px",
//                 outline: "none",
//                 boxSizing: "border-box",
//                 cursor: "not-allowed",
//               }}
//             />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>
//             {inp("Phone Number", "phone", "tel")}
//           </div>
//         </div>
//         <div
//           style={{
//             fontSize: "12px",
//             color: "#475569",
//             marginBottom: "10px",
//             marginTop: "4px",
//             letterSpacing: "0.5px",
//             textTransform: "uppercase",
//           }}
//         >
//           Change Password (leave blank to keep current)
//         </div>
//         {inp("Current Password", "current_password", "password")}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "0 12px",
//           }}
//         >
//           <div>{inp("New Password", "new_password", "password")}</div>
//           <div>{inp("Confirm Password", "confirm_password", "password")}</div>
//         </div>
//         <button
//           onClick={handleSave}
//           disabled={saving || !form.name}
//           style={{
//             width: "100%",
//             padding: "11px",
//             borderRadius: "8px",
//             cursor: saving ? "not-allowed" : "pointer",
//             background: "linear-gradient(135deg,#c9a96e,#a07840)",
//             color: "#fff",
//             border: "none",
//             fontWeight: "700",
//             fontSize: "13px",
//             marginTop: "4px",
//             opacity: saving ? 0.7 : 1,
//           }}
//         >
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Stats ───────────────────────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmt }) => {
//   const commPending = bookings
//     .filter((b) => b.commission_status === "pending")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings
//     .filter((b) => b.commission_status === "approved")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid = bookings
//     .filter((b) => b.commission_status === "paid")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//         gap: "10px",
//         marginBottom: "20px",
//       }}
//     >
//       {[
//         {
//           label: "Pending Commission",
//           value: fmt(commPending),
//           color: "#f59e0b",
//           icon: "⏳",
//         },
//         {
//           label: "Approved Commission",
//           value: fmt(commApproved),
//           color: "#3b82f6",
//           icon: "✅",
//         },
//         {
//           label: "Commission Paid",
//           value: fmt(commPaid),
//           color: "#22c55e",
//           icon: "💰",
//         },
//         {
//           label: "Total Clients",
//           value: bookings.length,
//           color: "#c9a96e",
//           icon: "👥",
//         },
//       ].map(({ label, value, color, icon }) => (
//         <div
//           key={label}
//           style={{
//             background: "rgba(255,255,255,0.03)",
//             border: "1px solid rgba(255,255,255,0.07)",
//             borderRadius: "12px",
//             padding: "14px 16px",
//           }}
//         >
//           <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//           <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//             {value}
//           </div>
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//             {label}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications Tab ──────────────────────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder: {
//     icon: "💳",
//     color: "#f59e0b",
//     bg: "rgba(245,158,11,0.10)",
//     label: "Payment Reminder",
//   },
//   booking_confirmed: {
//     icon: "✅",
//     color: "#22c55e",
//     bg: "rgba(34,197,94,0.10)",
//     label: "Booking Confirmed",
//   },
//   booking_cancelled: {
//     icon: "❌",
//     color: "#ef4444",
//     bg: "rgba(239,68,68,0.10)",
//     label: "Booking Cancelled",
//   },
//   project_launch: {
//     icon: "🏗️",
//     color: "#c9a96e",
//     bg: "rgba(201,169,110,0.10)",
//     label: "Project Launch",
//   },
//   offer: {
//     icon: "🎁",
//     color: "#8b5cf6",
//     bg: "rgba(139,92,246,0.10)",
//     label: "Special Offer",
//   },
//   general: {
//     icon: "🔔",
//     color: "#c9a96e",
//     bg: "rgba(201,169,110,0.10)",
//     label: "General",
//   },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate }) => {
//   const cfg = notif
//     ? NOTIF_CFG[notif.type] || NOTIF_CFG.general
//     : NOTIF_CFG.general;
//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);
//   if (!notif) return null;
//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7
//       ? `${d}d ago`
//       : new Date(dateStr).toLocaleDateString("en-IN", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         });
//   };
//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 1000,
//         background: "rgba(0,0,0,0.7)",
//         backdropFilter: "blur(6px)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "linear-gradient(135deg,#0f0f1e,#12121f)",
//           border: `1px solid ${cfg.color}33`,
//           borderTop: `3px solid ${cfg.color}`,
//           borderRadius: "16px",
//           maxWidth: "520px",
//           width: "100%",
//           boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             padding: "20px 24px 16px",
//             borderBottom: "1px solid rgba(255,255,255,0.06)",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               justifyContent: "space-between",
//               gap: "12px",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//                 flex: 1,
//                 minWidth: 0,
//               }}
//             >
//               <div
//                 style={{
//                   width: "44px",
//                   height: "44px",
//                   borderRadius: "12px",
//                   flexShrink: 0,
//                   background: cfg.bg,
//                   border: `1px solid ${cfg.color}33`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "20px",
//                 }}
//               >
//                 {cfg.icon}
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "800",
//                     color: "#e2e8f0",
//                     lineHeight: "1.3",
//                   }}
//                 >
//                   {notif.title}
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     marginTop: "4px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "10px",
//                       fontWeight: "700",
//                       padding: "2px 8px",
//                       borderRadius: "10px",
//                       background: cfg.bg,
//                       color: cfg.color,
//                       border: `1px solid ${cfg.color}33`,
//                     }}
//                   >
//                     {cfg.label}
//                   </span>
//                   <span style={{ fontSize: "11px", color: "#475569" }}>
//                     🕐 {timeAgo(notif.created_at)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               style={{
//                 background: "rgba(255,255,255,0.05)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 color: "#64748b",
//                 width: "32px",
//                 height: "32px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "16px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               ×
//             </button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div
//             style={{
//               fontSize: "14px",
//               color: "#cbd5e1",
//               lineHeight: "1.75",
//               whiteSpace: "pre-line",
//               background: "rgba(255,255,255,0.02)",
//               border: "1px solid rgba(255,255,255,0.05)",
//               borderRadius: "10px",
//               padding: "16px",
//             }}
//           >
//             {notif.message}
//           </div>
//           <div
//             style={{
//               display: "flex",
//               gap: "8px",
//               marginTop: "16px",
//               flexWrap: "wrap",
//             }}
//           >
//             {notif.booking_id && (
//               <button
//                 onClick={() => {
//                   onClose();
//                   // If notification type is payment_reminder, go to payment page.
//                   // For booking_confirmed / general — go to dashboard bookings tab.
//                   if (notif.type === "payment_reminder") {
//                     onNavigate(`/payment/${notif.booking_id}`);
//                   } else {
//                     // Navigate to dashboard and highlight bookings tab
//                     onNavigate(
//                       `/dashboard?tab=bookings&highlight=${notif.booking_id}`,
//                     );
//                   }
//                 }}
//                 style={{
//                   padding: "9px 20px",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: "13px",
//                   fontWeight: "700",
//                   background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                   color: "#fff",
//                   border: "none",
//                 }}
//               >
//                 {notif.type === "payment_reminder"
//                   ? "Complete Payment →"
//                   : "View Booking →"}
//               </button>
//             )}
//             <button
//               onClick={onClose}
//               style={{
//                 padding: "9px 16px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 background: "transparent",
//                 color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({
//   notifications,
//   loading,
//   unreadCount,
//   onMarkRead,
//   onMarkAllRead,
//   onNavigate,
// }) => {
//   const [filter, setFilter] = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);
//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read") return n.is_read;
//     return true;
//   });
//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//     });
//   };
//   if (loading)
//     return (
//       <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//         <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading
//         notifications...
//       </div>
//     );
//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal
//           notif={selectedNotif}
//           onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead}
//           onNavigate={onNavigate}
//         />
//       )}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "14px",
//           flexWrap: "wrap",
//           gap: "10px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             gap: "4px",
//             background: "rgba(255,255,255,0.03)",
//             padding: "4px",
//             borderRadius: "8px",
//           }}
//         >
//           {[
//             ["all", "All"],
//             ["unread", "Unread"],
//             ["read", "Read"],
//           ].map(([val, label]) => (
//             <button
//               key={val}
//               onClick={() => setFilter(val)}
//               style={{
//                 padding: "5px 14px",
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 fontSize: "12px",
//                 fontWeight: "600",
//                 background:
//                   filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//                 color: filter === val ? "#c9a96e" : "#64748b",
//                 border:
//                   filter === val
//                     ? "1px solid rgba(201,169,110,0.25)"
//                     : "1px solid transparent",
//               }}
//             >
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span
//                   style={{
//                     marginLeft: "5px",
//                     padding: "0 5px",
//                     borderRadius: "10px",
//                     fontSize: "10px",
//                     background: "#f59e0b",
//                     color: "#000",
//                     fontWeight: "800",
//                   }}
//                 >
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button
//             onClick={onMarkAllRead}
//             style={{
//               padding: "6px 14px",
//               borderRadius: "7px",
//               cursor: "pointer",
//               fontSize: "12px",
//               fontWeight: "600",
//               background: "rgba(201,169,110,0.08)",
//               color: "#c9a96e",
//               border: "1px solid rgba(201,169,110,0.2)",
//             }}
//           >
//             ✓ Mark all read
//           </button>
//         )}
//       </div>
//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>
//           <div
//             style={{
//               fontSize: "15px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             {filter === "unread"
//               ? "No unread notifications"
//               : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Payment reminders and booking updates will appear here.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {filtered.map((n) => {
//           const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.general;
//           return (
//             <div
//               key={n.id}
//               onClick={() => setSelectedNotif(n)}
//               style={{
//                 display: "flex",
//                 gap: "14px",
//                 alignItems: "flex-start",
//                 padding: "14px 16px",
//                 borderRadius: "12px",
//                 cursor: "pointer",
//                 background: n.is_read
//                   ? "rgba(255,255,255,0.02)"
//                   : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`,
//                 border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"}`,
//                 transition: "all 0.2s",
//                 position: "relative",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.borderColor = cfg.color + "55";
//                 e.currentTarget.style.transform = "translateY(-1px)";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.borderColor = n.is_read
//                   ? "rgba(255,255,255,0.06)"
//                   : cfg.color + "33";
//                 e.currentTarget.style.transform = "none";
//               }}
//             >
//               {!n.is_read && (
//                 <div
//                   style={{
//                     position: "absolute",
//                     top: "14px",
//                     right: "14px",
//                     width: "8px",
//                     height: "8px",
//                     borderRadius: "50%",
//                     background: cfg.color,
//                     boxShadow: `0 0 6px ${cfg.color}`,
//                   }}
//                 />
//               )}
//               <div
//                 style={{
//                   width: "40px",
//                   height: "40px",
//                   borderRadius: "10px",
//                   flexShrink: 0,
//                   background: cfg.bg,
//                   border: `1px solid ${cfg.color}33`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "18px",
//                 }}
//               >
//                 {cfg.icon}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     marginBottom: "3px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: n.is_read ? "600" : "700",
//                       color: n.is_read ? "#94a3b8" : "#e2e8f0",
//                     }}
//                   >
//                     {n.title}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "10px",
//                       fontWeight: "700",
//                       padding: "1px 7px",
//                       borderRadius: "10px",
//                       background: cfg.bg,
//                       color: cfg.color,
//                       border: `1px solid ${cfg.color}33`,
//                     }}
//                   >
//                     {cfg.label}
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "12px",
//                     color: n.is_read ? "#475569" : "#94a3b8",
//                     lineHeight: "1.5",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   {n.message.length > 80
//                     ? n.message.slice(0, 80) + "…"
//                     : n.message}
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span style={{ fontSize: "11px", color: "#334155" }}>
//                     🕐 {timeAgo(n.created_at)}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "11px",
//                       color: cfg.color,
//                       fontWeight: "600",
//                     }}
//                   >
//                     Click to read →
//                   </span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Payments Tab ───────────────────────────────────────────────────────────────
// const GW_CFG = {
//   razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
//   stripe: { icon: "💎", color: "#8b5cf6", label: "Stripe" },
//   phonepe: { icon: "📱", color: "#f59e0b", label: "PhonePe" },
//   cash: { icon: "💵", color: "#22c55e", label: "Cash" },
//   manual: { icon: "🏦", color: "#64748b", label: "Manual" },
// };
// const TXN_STATUS = {
//   success: { color: "#22c55e", bg: "rgba(34,197,94,0.10)", label: "Success" },
//   pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", label: "Pending" },
//   failed: { color: "#ef4444", bg: "rgba(239,68,68,0.10)", label: "Failed" },
//   refunded: {
//     color: "#94a3b8",
//     bg: "rgba(148,163,184,0.10)",
//     label: "Refunded",
//   },
// };

// const PaymentsTab = ({ payments, loading, fmt }) => {
//   const totalPaid = payments
//     .filter((p) => p.status === "success")
//     .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
//   const successCount = payments.filter((p) => p.status === "success").length;
//   if (loading)
//     return (
//       <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//         <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading
//         payment history...
//       </div>
//     );
//   return (
//     <div>
//       {payments.length > 0 && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//             gap: "10px",
//             marginBottom: "20px",
//           }}
//         >
//           {[
//             {
//               label: "Total Paid",
//               value: fmt(totalPaid),
//               color: "#22c55e",
//               icon: "💰",
//             },
//             {
//               label: "Transactions",
//               value: successCount,
//               color: "#c9a96e",
//               icon: "🧾",
//             },
//             {
//               label: "Pending",
//               value: payments.filter((p) => p.status === "pending").length,
//               color: "#f59e0b",
//               icon: "⏳",
//             },
//           ].map(({ label, value, color, icon }) => (
//             <div
//               key={label}
//               style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "14px 16px",
//               }}
//             >
//               <div style={{ fontSize: "18px", marginBottom: "6px" }}>
//                 {icon}
//               </div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//                 {value}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 {label}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//       {payments.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
//           <div
//             style={{
//               fontSize: "14px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             No payment history yet
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Your payment transactions will appear here once you make a booking
//             payment.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {payments.map((p) => {
//           const gw = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
//           const txn = TXN_STATUS[p.status] || TXN_STATUS.pending;
//           return (
//             <div
//               key={p.id}
//               style={{
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "16px 18px",
//                 borderLeft: `3px solid ${txn.color}`,
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "flex-start",
//                   gap: "12px",
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <div style={{ flex: 1 }}>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "10px",
//                       flexWrap: "wrap",
//                       marginBottom: "4px",
//                     }}
//                   >
//                     <span style={{ fontSize: "16px" }}>{gw.icon}</span>
//                     <span
//                       style={{
//                         fontSize: "14px",
//                         fontWeight: "700",
//                         color: "#e2e8f0",
//                       }}
//                     >
//                       {gw.label}
//                     </span>
//                     <span
//                       style={{
//                         fontSize: "10px",
//                         fontWeight: "700",
//                         padding: "1px 8px",
//                         borderRadius: "10px",
//                         background: txn.bg,
//                         color: txn.color,
//                         border: `1px solid ${txn.color}33`,
//                       }}
//                     >
//                       {txn.label}
//                     </span>
//                     {p._synthetic && (
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           fontWeight: "700",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           background: "rgba(251,191,36,0.1)",
//                           color: "#fbbf24",
//                           border: "1px solid rgba(251,191,36,0.25)",
//                         }}
//                       >
//                         🏢 Walk-in / Cash
//                       </span>
//                     )}
//                     {!p._synthetic && p.mode && p.mode !== "online" && (
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 7px",
//                           borderRadius: "10px",
//                           background: "rgba(255,255,255,0.05)",
//                           color: "#64748b",
//                           border: "1px solid rgba(255,255,255,0.08)",
//                           textTransform: "capitalize",
//                         }}
//                       >
//                         {p.mode}
//                       </span>
//                     )}
//                   </div>
//                   {p.booking && (
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#64748b",
//                         marginBottom: "3px",
//                       }}
//                     >
//                       🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
//                     </div>
//                   )}
//                   {(p.gateway_payment_id || p.gateway_order_id) && (
//                     <div
//                       style={{
//                         fontSize: "11px",
//                         color: "#334155",
//                         fontFamily: "monospace",
//                       }}
//                     >
//                       Ref: {p.gateway_payment_id || p.gateway_order_id}
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ textAlign: "right", flexShrink: 0 }}>
//                   <div
//                     style={{
//                       fontSize: "20px",
//                       fontWeight: "800",
//                       color: txn.color,
//                     }}
//                   >
//                     {fmt(p.amount)}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "11px",
//                       color: "#475569",
//                       marginTop: "2px",
//                     }}
//                   >
//                     {p.paid_at
//                       ? new Date(p.paid_at).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })
//                       : new Date(p.created_at).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         })}
//                   </div>
//                 </div>
//               </div>
//               {p.notes && (
//                 <div
//                   style={{
//                     marginTop: "8px",
//                     fontSize: "12px",
//                     color: "#475569",
//                     padding: "6px 10px",
//                     background: "rgba(255,255,255,0.02)",
//                     borderRadius: "6px",
//                   }}
//                 >
//                   📝 {p.notes}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ───────────────────────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { icon: "💬", color: "#6c757d" },
//   service: { icon: "🛎️", color: "#3b82f6" },
//   unit: { icon: "🏠", color: "#c9a96e" },
//   payment: { icon: "💳", color: "#f59e0b" },
//   staff: { icon: "👤", color: "#8b5cf6" },
// };
// const StarRating = ({ value, onChange }) => (
//   <div style={{ display: "flex", gap: "4px" }}>
//     {[1, 2, 3, 4, 5].map((s) => (
//       <button
//         key={s}
//         type="button"
//         onClick={() => onChange(s)}
//         style={{
//           background: "none",
//           border: "none",
//           cursor: "pointer",
//           fontSize: "24px",
//           padding: "0 2px",
//           color: s <= value ? "#c9a96e" : "rgba(255,255,255,0.15)",
//           transition: "color 0.15s",
//         }}
//       >
//         ★
//       </button>
//     ))}
//   </div>
// );
// const FeedbackTab = ({
//   feedbacks,
//   bookings,
//   token,
//   onSubmitted,
//   showToast,
// }) => {
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({
//     rating: 5,
//     category: "general",
//     subject: "",
//     message: "",
//     booking_id: "",
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) {
//       showToast("⚠️ Subject and message are required", "warning", 3500);
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...form,
//           booking_id: form.booking_id || undefined,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast(
//         "🙏 Thank you! Your feedback has been submitted",
//         "success",
//         4000,
//       );
//       setForm({
//         rating: 5,
//         category: "general",
//         subject: "",
//         message: "",
//         booking_id: "",
//       });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) {
//       showToast("❌ " + e.message, "error", 4000);
//     }
//     setSubmitting(false);
//   };
//   const inp = (style = {}) => ({
//     width: "100%",
//     padding: "10px 14px",
//     marginBottom: "10px",
//     background: "rgba(255,255,255,0.05)",
//     border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: "8px",
//     color: "#e2e8f0",
//     fontSize: "13px",
//     outline: "none",
//     boxSizing: "border-box",
//     ...style,
//   });
//   const confirmedBookings = bookings.filter(
//     (b) => b.booking_status === "confirmed",
//   );
//   return (
//     <div>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "16px",
//         }}
//       >
//         <div>
//           <div
//             style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}
//           >
//             Your Feedback
//           </div>
//           <div style={{ fontSize: "12px", color: "#475569" }}>
//             Share your experience with us
//           </div>
//         </div>
//         <button
//           onClick={() => setShowForm((f) => !f)}
//           style={{
//             padding: "8px 16px",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontSize: "13px",
//             fontWeight: "700",
//             background: showForm
//               ? "rgba(255,255,255,0.05)"
//               : "linear-gradient(135deg,#c9a96e,#a07840)",
//             color: showForm ? "#64748b" : "#fff",
//             border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
//           }}
//         >
//           {showForm ? "✕ Cancel" : "+ New Feedback"}
//         </button>
//       </div>
//       {showForm && (
//         <div
//           style={{
//             background: "rgba(255,255,255,0.02)",
//             border: "1px solid rgba(201,169,110,0.2)",
//             borderRadius: "14px",
//             padding: "20px",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               fontSize: "13px",
//               fontWeight: "700",
//               color: "#c9a96e",
//               marginBottom: "16px",
//             }}
//           >
//             ✍️ New Feedback
//           </div>
//           <div style={{ marginBottom: "14px" }}>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#64748b",
//                 marginBottom: "8px",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Rating *
//             </div>
//             <StarRating
//               value={form.rating}
//               onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
//             />
//             <div
//               style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}
//             >
//               {
//                 ["", "Very Poor", "Poor", "Average", "Good", "Excellent"][
//                   form.rating
//                 ]
//               }
//             </div>
//           </div>
//           <div style={{ marginBottom: "10px" }}>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#64748b",
//                 marginBottom: "6px",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Category *
//             </div>
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => (
//                 <button
//                   key={cat}
//                   type="button"
//                   onClick={() => setForm((f) => ({ ...f, category: cat }))}
//                   style={{
//                     padding: "5px 12px",
//                     borderRadius: "20px",
//                     cursor: "pointer",
//                     fontSize: "12px",
//                     fontWeight: "600",
//                     background:
//                       form.category === cat
//                         ? `${cfg.color}22`
//                         : "rgba(255,255,255,0.03)",
//                     color: form.category === cat ? cfg.color : "#64748b",
//                     border: `1px solid ${form.category === cat ? cfg.color + "55" : "rgba(255,255,255,0.08)"}`,
//                     textTransform: "capitalize",
//                   }}
//                 >
//                   {cfg.icon} {cat}
//                 </button>
//               ))}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select
//               value={form.booking_id}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, booking_id: e.target.value }))
//               }
//               style={{ ...inp(), marginBottom: "10px" }}
//             >
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => (
//                 <option key={b.id} value={b.id}>
//                   Unit {b.plot_number} — Booking #{b.id}
//                 </option>
//               ))}
//             </select>
//           )}
//           <input
//             type="text"
//             placeholder="Subject *"
//             value={form.subject}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, subject: e.target.value }))
//             }
//             style={inp()}
//           />
//           <textarea
//             placeholder="Your message..."
//             value={form.message}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, message: e.target.value }))
//             }
//             rows={4}
//             style={{ ...inp(), resize: "vertical" }}
//           />
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button
//               onClick={handleSubmit}
//               disabled={submitting}
//               style={{
//                 padding: "10px 22px",
//                 borderRadius: "8px",
//                 cursor: submitting ? "not-allowed" : "pointer",
//                 fontSize: "13px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color: "#fff",
//                 border: "none",
//                 opacity: submitting ? 0.7 : 1,
//               }}
//             >
//               {submitting ? "Submitting…" : "Submit Feedback →"}
//             </button>
//             <button
//               onClick={() => setShowForm(false)}
//               style={{
//                 padding: "10px 14px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 background: "transparent",
//                 color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
//           <div
//             style={{
//               fontSize: "14px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             No feedback yet
//           </div>
//           <div
//             style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}
//           >
//             Share your experience to help us improve.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {feedbacks.map((fb) => {
//           const catCfg = CATEGORY_CFG[fb.category] || CATEGORY_CFG.general;
//           const ratingColor =
//             fb.rating >= 4 ? "#22c55e" : fb.rating >= 3 ? "#f59e0b" : "#ef4444";
//           return (
//             <div
//               key={fb.id}
//               style={{
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 overflow: "hidden",
//               }}
//             >
//               <div style={{ padding: "14px 16px" }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     gap: "10px",
//                   }}
//                 >
//                   <div style={{ flex: 1 }}>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "8px",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <span
//                         style={{
//                           fontSize: "14px",
//                           fontWeight: "700",
//                           color: "#e2e8f0",
//                         }}
//                       >
//                         {fb.subject}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           background: `${catCfg.color}22`,
//                           color: catCfg.color,
//                           border: `1px solid ${catCfg.color}33`,
//                           textTransform: "capitalize",
//                         }}
//                       >
//                         {catCfg.icon} {fb.category}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           fontWeight: "700",
//                           textTransform: "capitalize",
//                           background:
//                             fb.status === "resolved"
//                               ? "rgba(34,197,94,0.1)"
//                               : fb.status === "reviewed"
//                                 ? "rgba(59,130,246,0.1)"
//                                 : "rgba(245,158,11,0.1)",
//                           color:
//                             fb.status === "resolved"
//                               ? "#22c55e"
//                               : fb.status === "reviewed"
//                                 ? "#3b82f6"
//                                 : "#f59e0b",
//                         }}
//                       >
//                         {fb.status}
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#475569",
//                         marginTop: "4px",
//                       }}
//                     >
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </div>
//                   </div>
//                   <div
//                     style={{
//                       color: ratingColor,
//                       fontSize: "16px",
//                       fontWeight: "800",
//                       flexShrink: 0,
//                     }}
//                   >
//                     {"★".repeat(fb.rating)}
//                   </div>
//                 </div>
//                 <div
//                   style={{
//                     marginTop: "8px",
//                     fontSize: "13px",
//                     color: "#94a3b8",
//                     lineHeight: "1.6",
//                   }}
//                 >
//                   {fb.message}
//                 </div>
//                 {fb.admin_reply && (
//                   <div
//                     style={{
//                       marginTop: "12px",
//                       padding: "10px 14px",
//                       background: "rgba(34,197,94,0.06)",
//                       border: "1px solid rgba(34,197,94,0.15)",
//                       borderRadius: "8px",
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontSize: "11px",
//                         color: "#22c55e",
//                         fontWeight: "700",
//                         marginBottom: "4px",
//                         textTransform: "uppercase",
//                         letterSpacing: "0.5px",
//                       }}
//                     >
//                       💬 Admin Reply
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "13px",
//                         color: "#cbd5e1",
//                         lineHeight: "1.6",
//                         whiteSpace: "pre-line",
//                       }}
//                     >
//                       {fb.admin_reply}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ─────────────────────────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user = useSelector(selectUser);

//   const [bookings, setBookings] = useState([]);
//   const [milestoneMap, setMilestoneMap] = useState({}); // bookingId -> milestones data
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [activeTab, setActiveTab] = useState("bookings");
//   const [notifications, setNotifications] = useState([]);
//   const [notifsLoading, setNotifsLoading] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages, setUnreadMessages] = useState(0);

//   const { showToast } = useToast();
//   const {
//     wishlist,
//     wishedIds,
//     toggle: toggleWishRaw,
//     loading: wishLoading,
//   } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(
//     async (plotId) => {
//       const wasWished =
//         wishedIds instanceof Set && wishedIds.has(Number(plotId));
//       await toggleWishRaw(Number(plotId));
//       showToast(
//         wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//         wasWished ? "wishlist_remove" : "wishlist_add",
//         2800,
//       );
//     },
//     [wishedIds, toggleWishRaw, showToast],
//   );

//   const [currency, setCurrency] = useState({
//     symbol: "₹",
//     code: "INR",
//     position: "before",
//   });
//   const fmt = useCallback(
//     (n) => makeFmt(currency.symbol, currency.code, currency.position)(n),
//     [currency],
//   );
//   const isBroker = user?.role === "broker";

//   // Fetch milestones for confirmed bookings that have a payment plan
//   const fetchMilestones = useCallback(
//     async (bookingsList) => {
//       const targets = bookingsList.filter(
//         (b) => b.booking_status === "confirmed" && b.payment_plan_id,
//       );
//       if (!targets.length) return;
//       const results = await Promise.all(
//         targets.map((b) =>
//           fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//             headers: {
//               Authorization: `Bearer ${user?.token}`,
//               Accept: "application/json",
//             },
//           })
//             .then((r) => (r.ok ? r.json() : null))
//             .catch(() => null),
//         ),
//       );
//       const map = {};
//       targets.forEach((b, i) => {
//         if (results[i]) map[b.id] = results[i];
//       });
//       setMilestoneMap(map);
//     },
//     [user?.token],
//   );

//   useEffect(() => {
//     if (!user?.token) {
//       navigate("/");
//       return;
//     }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => {
//           if (d)
//             setCurrency({
//               symbol: d.symbol || "₹",
//               code: d.code || "INR",
//               position: d.position || "before",
//             });
//         })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//     ]);

//     const params = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     const txnId = params.get("txn");
//     if (bookingId && (sessionId || txnId)) {
//       const confirmPayment = async () => {
//         try {
//           if (sessionId) {
//             await fetch(`${API_BASE}/payment/stripe/confirm`, {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//                 Authorization: `Bearer ${user.token}`,
//               },
//               body: JSON.stringify({
//                 booking_id: bookingId,
//                 session_id: sessionId,
//               }),
//             });
//           }
//           await Promise.all([
//             fetchBookings(),
//             fetchNotifications(),
//             fetchPayments(),
//           ]);
//           showToast(
//             "🎉 Payment confirmed! Your booking is now active.",
//             "booking",
//             5000,
//           );
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     // Handle tab navigation from notification clicks
//     const tabParam = params.get("tab");
//     const highlightId = params.get("highlight");
//     if (tabParam) {
//       setActiveTab(tabParam);
//       if (highlightId) {
//         // Scroll to and briefly highlight the booking card
//         setTimeout(() => {
//           const el = document.getElementById(`booking-card-${highlightId}`);
//           if (el) {
//             el.scrollIntoView({ behavior: "smooth", block: "center" });
//             el.style.boxShadow =
//               "0 0 0 2px #c9a96e, 0 0 20px rgba(201,169,110,0.3)";
//             el.style.transition = "box-shadow 0.3s";
//             setTimeout(() => {
//               el.style.boxShadow = "";
//             }, 3000);
//           }
//         }, 500);
//       }
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, {
//       headers: { Authorization: `Bearer ${user.token}` },
//     })
//       .then((r) => r.json())
//       .then((d) => setUnreadMessages(d.unread || 0));
//   }, [user]);

//   const fetchBookings = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${API_BASE}/bookings`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       // Fetch milestones after bookings loaded
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPayments = async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//             Accept: "application/json",
//           },
//         }),
//         fetch(`${API_BASE}/bookings`, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//             Accept: "application/json",
//           },
//         }),
//       ]);
//       const txns = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter(
//           (b) =>
//             b.booking_status === "confirmed" &&
//             !txnBookingIds.has(String(b.id)),
//         )
//         .map((b) => ({
//           id: `booking_${b.id}`,
//           booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR",
//           status: "success",
//           mode: "manual",
//           gateway: "cash / manual",
//           paid_at: b.created_at,
//           _synthetic: true,
//           booking: {
//             id: b.id,
//             plot_number: b.plot_number,
//             plot_type: b.plot_type,
//             booking_status: b.booking_status,
//           },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {
//     } finally {
//       setPaymentsLoading(false);
//     }
//   };

//   const fetchFeedbacks = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   };

//   const fetchNotifications = async () => {
//     setNotifsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/notifications`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {
//     } finally {
//       setNotifsLoading(false);
//     }
//   };

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
//       );
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const handlePay = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => {
//       dispatch(clearUser());
//       navigate("/");
//     }, 600);
//   };
//   const handleSaved = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) =>
//         prev.map((b) =>
//           b.id === bookingId ? { ...b, booking_status: "cancelled" } : b,
//         ),
//       );
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) {
//       showToast("❌ " + e.message, "error", 4000);
//     }
//   };

//   const confirmed = bookings.filter(
//     (b) => b.booking_status === "confirmed",
//   ).length;
//   const pending = bookings.filter((b) => b.booking_status === "pending").length;
//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => s + parseFloat(b.down_payment_amount || b.price || 0), 0);

//   const tabs = [
//     {
//       id: "bookings",
//       label: isBroker ? "Client Bookings" : "My Bookings",
//       count: bookings.length,
//     },
//     { id: "wishlist", label: "Wishlist", count: wishlist.length },
//     { id: "payments", label: "Payments", count: 0 },
//     { id: "notifications", label: "Notifications", count: unreadCount },
//     { id: "feedback", label: "Feedback", count: 0 },
//     { id: "messages", label: "Messages", count: unreadMessages },
//     { id: "profile", label: "My Profile", count: 0 },
//   ];

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#080812",
//         fontFamily: "'DM Sans', sans-serif",
//         color: "#e2e8f0",
//       }}
//     >
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />

//       {/* Header */}
//       <div
//         style={{
//           background: "rgba(8,8,18,0.96)",
//           borderBottom: "1px solid rgba(255,255,255,0.06)",
//           padding: "0 24px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           height: "62px",
//           position: "sticky",
//           top: 0,
//           zIndex: 100,
//           backdropFilter: "blur(12px)",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//           <button
//             onClick={() => navigate(-1)}
//             style={{
//               background: "none",
//               border: "none",
//               color: "#64748b",
//               cursor: "pointer",
//               fontSize: "13px",
//               padding: "6px 10px",
//               borderRadius: "6px",
//             }}
//           >
//             ← Back
//           </button>
//           <div
//             style={{
//               width: "1px",
//               height: "18px",
//               background: "rgba(255,255,255,0.08)",
//             }}
//           />
//           <span
//             style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}
//           >
//             {isBroker ? "🤝 Broker Dashboard" : "🏠 My Dashboard"}
//           </span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div style={{ textAlign: "right" }}>
//             <div
//               style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}
//             >
//               {user?.name}
//             </div>
//             <div style={{ fontSize: "11px", color: "#475569" }}>
//               {isBroker
//                 ? `🤝 Broker${user?.broker_company ? " · " + user.broker_company : ""}`
//                 : "👤 Buyer"}
//             </div>
//           </div>
//           <div
//             style={{
//               width: "34px",
//               height: "34px",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontWeight: "800",
//               fontSize: "13px",
//               color: "#000",
//             }}
//           >
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button
//             onClick={handleLogout}
//             style={{
//               background: "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b",
//               padding: "6px 12px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "12px",
//             }}
//           >
//             Logout
//           </button>
//           <button
//             onClick={() => setActiveTab("notifications")}
//             style={{
//               position: "relative",
//               background: "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b",
//               padding: "6px 10px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "15px",
//             }}
//           >
//             🔔
//             {unreadCount > 0 && (
//               <span
//                 style={{
//                   position: "absolute",
//                   top: "-5px",
//                   right: "-5px",
//                   minWidth: "16px",
//                   height: "16px",
//                   borderRadius: "10px",
//                   background: "#f59e0b",
//                   color: "#000",
//                   fontSize: "9px",
//                   fontWeight: "800",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   padding: "0 3px",
//                 }}
//               >
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div
//         style={{ maxWidth: "920px", margin: "0 auto", padding: "28px 18px" }}
//       >
//         <div style={{ marginBottom: "22px" }}>
//           <div
//             style={{
//               fontSize: "24px",
//               fontWeight: "800",
//               color: "#e2e8f0",
//               letterSpacing: "-0.4px",
//             }}
//           >
//             Welcome back, {user?.name?.split(" ")[0]} 👋
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569", marginTop: "3px" }}>
//             {isBroker
//               ? "Manage your client bookings and track your commissions."
//               : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* Stat cards */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//             gap: "10px",
//             marginBottom: "20px",
//           }}
//         >
//           {[
//             {
//               label: "Total Bookings",
//               value: bookings.length,
//               icon: "🏠",
//               color: "#c9a96e",
//             },
//             {
//               label: "Confirmed",
//               value: confirmed,
//               icon: "✅",
//               color: "#22c55e",
//             },
//             {
//               label: "Pending Payment",
//               value: pending,
//               icon: "⏳",
//               color: "#f59e0b",
//             },
//             ...(!isBroker
//               ? [
//                   {
//                     label: "Amount Invested",
//                     value: fmt(totalInvested),
//                     icon: "💰",
//                     color: "#c9a96e",
//                   },
//                 ]
//               : []),
//           ].map(({ label, value, icon, color }) => (
//             <div
//               key={label}
//               style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "14px 16px",
//               }}
//             >
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>
//                 {icon}
//               </div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//                 {value}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 {label}
//               </div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && (
//           <BrokerStats bookings={bookings} fmt={fmt} />
//         )}

//         {/* Tabs */}
//         <div
//           style={{
//             display: "flex",
//             gap: "4px",
//             marginBottom: "18px",
//             background: "rgba(255,255,255,0.03)",
//             padding: "4px",
//             borderRadius: "10px",
//             overflowX: "auto",
//           }}
//         >
//           {tabs.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setActiveTab(t.id)}
//               style={{
//                 padding: "7px 16px",
//                 borderRadius: "7px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 fontWeight: "600",
//                 whiteSpace: "nowrap",
//                 background:
//                   activeTab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
//                 color: activeTab === t.id ? "#c9a96e" : "#64748b",
//                 border:
//                   activeTab === t.id
//                     ? "1px solid rgba(201,169,110,0.25)"
//                     : "1px solid transparent",
//               }}
//             >
//               {t.label}
//               {t.count > 0 && (
//                 <span
//                   style={{
//                     marginLeft: "6px",
//                     padding: "1px 6px",
//                     borderRadius: "20px",
//                     fontSize: "11px",
//                     background:
//                       activeTab === t.id
//                         ? "rgba(201,169,110,0.2)"
//                         : "rgba(255,255,255,0.07)",
//                     color: activeTab === t.id ? "#c9a96e" : "#475569",
//                   }}
//                 >
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Bookings tab */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: "60px 0",
//                   color: "#475569",
//                 }}
//               >
//                 <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
//                 Loading bookings...
//               </div>
//             )}
//             {error && (
//               <div
//                 style={{
//                   padding: "14px",
//                   background: "rgba(239,68,68,0.08)",
//                   border: "1px solid rgba(239,68,68,0.2)",
//                   borderRadius: "10px",
//                   color: "#fca5a5",
//                   fontSize: "13px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                 }}
//               >
//                 <span>⚠ {error}</span>
//                 <button
//                   onClick={fetchBookings}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "#c9a96e",
//                     cursor: "pointer",
//                     fontSize: "13px",
//                     textDecoration: "underline",
//                   }}
//                 >
//                   Retry
//                 </button>
//               </div>
//             )}

//             {/* Dues banner — only when not loading */}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner
//                 milestoneMap={milestoneMap}
//                 fmt={fmt}
//                 onNavigate={navigate}
//               />
//             )}

//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏠</div>
//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "600",
//                     color: "#e2e8f0",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#475569",
//                     marginBottom: "20px",
//                   }}
//                 >
//                   {isBroker
//                     ? "Book a unit for your clients from the unit page."
//                     : "Browse available units to make your first booking."}
//                 </div>
//                 <button
//                   onClick={() => navigate("/")}
//                   style={{
//                     padding: "10px 22px",
//                     background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: "10px",
//                     cursor: "pointer",
//                     fontWeight: "700",
//                   }}
//                 >
//                   Browse Units →
//                 </button>
//               </div>
//             )}

//             <div
//               style={{ display: "flex", flexDirection: "column", gap: "10px" }}
//             >
//               {!loading &&
//                 bookings.map((b) => (
//                   <BookingCard
//                     key={b.id}
//                     booking={b}
//                     onPay={handlePay}
//                     onCancel={handleCancel}
//                     isBroker={isBroker}
//                     fmt={fmt}
//                     token={user?.token}
//                   />
//                 ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab
//             wishlist={wishlist}
//             wishedIds={wishedIds}
//             onToggle={handleWishlistToggle}
//             loading={wishLoading}
//             token={user?.token}
//             onNavigate={navigate}
//             fmt={fmt}
//           />
//         )}
//         {activeTab === "payments" && (
//           <PaymentsTab
//             payments={payments}
//             loading={paymentsLoading}
//             fmt={fmt}
//           />
//         )}
//         {activeTab === "notifications" && (
//           <NotificationsTab
//             notifications={notifications}
//             loading={notifsLoading}
//             unreadCount={unreadCount}
//             onMarkRead={markRead}
//             onMarkAllRead={markAllRead}
//             onNavigate={navigate}
//           />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab
//             feedbacks={feedbacks}
//             bookings={bookings}
//             token={user?.token}
//             showToast={showToast}
//             onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])}
//           />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "profile" && (
//           <ProfilePanel
//             user={user}
//             onSaved={handleSaved}
//             showToast={showToast}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";
// import InvoicesTab from "./InvoicesTab";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// const makeFmt =
//   (symbol = "₹", code = "INR", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", {
//       maximumFractionDigits: 0,
//     }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol} ${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: {
//     color: "#22c55e",
//     bg: "rgba(34,197,94,0.12)",
//     label: "Confirmed",
//   },
//   pending: {
//     color: "#f59e0b",
//     bg: "rgba(245,158,11,0.12)",
//     label: "Pending Payment",
//   },
//   cancelled: {
//     color: "#ef4444",
//     bg: "rgba(239,68,68,0.12)",
//     label: "Cancelled",
//   },
// };
// const COMM_CFG = {
//   pending: { color: "#f59e0b", label: "Pending Approval" },
//   approved: { color: "#3b82f6", label: "Approved" },
//   paid: { color: "#22c55e", label: "Paid" },
//   rejected: { color: "#ef4444", label: "Rejected" },
// };

// // ── Milestone Tracker ─────────────────────────────────────────────────────────
// const MilestoneTracker = ({ bookingId, token, fmt, booking }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => {
//         setData(d);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div
//           style={{
//             color: "#475569",
//             fontSize: "13px",
//             padding: "10px",
//             background: "rgba(255,255,255,0.02)",
//             borderRadius: "8px",
//           }}
//         >
//           💰 Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     return (
//       <div style={{ marginTop: "8px" }}>
//         <div
//           style={{
//             fontSize: "11px",
//             color: "#64748b",
//             fontWeight: "700",
//             letterSpacing: "1px",
//             textTransform: "uppercase",
//             marginBottom: "10px",
//           }}
//         >
//           Payment Schedule — {plan.name}
//           <span
//             style={{
//               fontWeight: "400",
//               color: "#475569",
//               marginLeft: "6px",
//               fontSize: "10px",
//             }}
//           >
//             (estimated)
//           </span>
//         </div>
//         {plan.milestones.map((m, i) => {
//           const amt = m.percentage
//             ? Math.round((price * m.percentage) / 100)
//             : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow
//               key={i}
//               label={m.label}
//               percentage={m.percentage}
//               amount={amt}
//               isPaid={isPaid}
//               isDue={isDue}
//               index={i}
//               fmt={fmt}
//             />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading)
//     return (
//       <div style={{ color: "#475569", fontSize: "12px", padding: "10px" }}>
//         Loading payment schedule...
//       </div>
//     );

//   const { milestones, total_amount, paid_amount, balance_due } = data;
//   const pct =
//     total_amount > 0 ? Math.round((paid_amount / total_amount) * 100) : 0;

//   return (
//     <div style={{ marginTop: "8px" }}>
//       <div style={{ marginBottom: "14px" }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             fontSize: "11px",
//             color: "#64748b",
//             marginBottom: "4px",
//           }}
//         >
//           <span>Payment Progress</span>
//           <span>{pct}% complete</span>
//         </div>
//         <div
//           style={{
//             background: "rgba(255,255,255,0.08)",
//             borderRadius: "20px",
//             height: "6px",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               height: "100%",
//               width: `${pct}%`,
//               borderRadius: "20px",
//               background: "linear-gradient(90deg,#c9a96e,#a07840)",
//               transition: "width 0.4s",
//             }}
//           />
//         </div>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             fontSize: "11px",
//             marginTop: "4px",
//           }}
//         >
//           <span style={{ color: "#22c55e" }}>Paid: {fmt(paid_amount)}</span>
//           <span style={{ color: balance_due > 0 ? "#f59e0b" : "#22c55e" }}>
//             Balance: {fmt(balance_due)}
//           </span>
//         </div>
//       </div>
//       {milestones.map((m, i) => {
//         const isPaid = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived = m.status === "waived";
//         const isDue =
//           !isPaid &&
//           !isWaived &&
//           i ===
//             milestones.findIndex(
//               (x) => x.status === "pending" || x.status === "overdue",
//             );
//         return (
//           <MilestoneRow
//             key={m.id}
//             label={m.label}
//             percentage={m.percentage}
//             amount={m.amount}
//             isPaid={isPaid}
//             isDue={isDue}
//             isOverdue={isOverdue}
//             isWaived={isWaived}
//             dueDate={m.due_date}
//             paidAt={m.paid_at}
//             index={i}
//             fmt={fmt}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({
//   label,
//   percentage,
//   amount,
//   isPaid,
//   isDue,
//   isOverdue,
//   isWaived,
//   dueDate,
//   paidAt,
//   index,
//   fmt,
// }) => {
//   const color = isPaid
//     ? "#c9a96e"
//     : isOverdue
//       ? "#ef4444"
//       : isWaived
//         ? "#64748b"
//         : isDue
//           ? "#e2e8f0"
//           : "#475569";
//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: "12px",
//         alignItems: "flex-start",
//         marginBottom: "8px",
//       }}
//     >
//       <div
//         style={{
//           width: "28px",
//           height: "28px",
//           borderRadius: "50%",
//           flexShrink: 0,
//           marginTop: "2px",
//           background: isPaid
//             ? "#c9a96e"
//             : isOverdue
//               ? "rgba(239,68,68,0.15)"
//               : isDue
//                 ? "rgba(201,169,110,0.2)"
//                 : "rgba(255,255,255,0.04)",
//           border: `2px solid ${isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.5)" : isDue ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: "11px",
//           fontWeight: "800",
//           color: isPaid
//             ? "#000"
//             : isOverdue
//               ? "#ef4444"
//               : isDue
//                 ? "#c9a96e"
//                 : "#334155",
//         }}
//       >
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div
//         style={{
//           flex: 1,
//           padding: "8px 12px",
//           borderRadius: "8px",
//           background: isPaid
//             ? "rgba(201,169,110,0.08)"
//             : isOverdue
//               ? "rgba(239,68,68,0.06)"
//               : isDue
//                 ? "rgba(201,169,110,0.04)"
//                 : "rgba(255,255,255,0.02)",
//           border: `1px solid ${isPaid ? "rgba(201,169,110,0.25)" : isOverdue ? "rgba(239,68,68,0.2)" : isDue ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.05)"}`,
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color }}>
//               {label}
//             </div>
//             <div
//               style={{ fontSize: "11px", color: "#475569", marginTop: "1px" }}
//             >
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? "8px" : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && (
//                     <span
//                       style={{
//                         color: "#ef4444",
//                         fontWeight: "700",
//                         marginLeft: "4px",
//                       }}
//                     >
//                       ⚠ Overdue
//                     </span>
//                   )}
//                 </span>
//               )}
//               {isPaid && paidAt && (
//                 <span style={{ color: "#22c55e", marginLeft: "4px" }}>
//                   ✓ Paid {paidAt}
//                 </span>
//               )}
//               {isDue && !isOverdue && (
//                 <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
//                   ← Due now
//                 </span>
//               )}
//               {isWaived && (
//                 <span style={{ color: "#64748b", marginLeft: "8px" }}>
//                   Waived
//                 </span>
//               )}
//             </div>
//           </div>
//           <div
//             style={{
//               fontSize: "15px",
//               fontWeight: "800",
//               color,
//               flexShrink: 0,
//               marginLeft: "12px",
//             }}
//           >
//             {fmt(amount)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ───────────────────────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmt, onNavigate }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId })),
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;
//   const overdueCount = dues.filter((d) => d.status === "overdue").length;

//   return (
//     <div
//       style={{
//         marginBottom: "20px",
//         background:
//           overdueCount > 0 ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
//         border: `1px solid ${overdueCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
//         borderRadius: "14px",
//         padding: "16px 18px",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "12px",
//           flexWrap: "wrap",
//           gap: "8px",
//         }}
//       >
//         <div
//           style={{
//             fontSize: "13px",
//             fontWeight: "700",
//             color: overdueCount > 0 ? "#ef4444" : "#f59e0b",
//           }}
//         >
//           💳 Upcoming Payments
//           {overdueCount > 0 && (
//             <span
//               style={{
//                 marginLeft: "8px",
//                 padding: "2px 8px",
//                 borderRadius: "10px",
//                 background: "rgba(239,68,68,0.15)",
//                 color: "#ef4444",
//                 fontSize: "11px",
//                 fontWeight: "700",
//               }}
//             >
//               {overdueCount} overdue
//             </span>
//           )}
//         </div>
//         <div style={{ fontSize: "12px", color: "#64748b" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {dues.map((d, i) => (
//           <div
//             key={i}
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               padding: "10px 14px",
//               borderRadius: "10px",
//               cursor: "pointer",
//               background:
//                 d.status === "overdue"
//                   ? "rgba(239,68,68,0.08)"
//                   : "rgba(245,158,11,0.06)",
//               border: `1px solid ${d.status === "overdue" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)"}`,
//             }}
//             onClick={() =>
//               onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)
//             }
//           >
//             <div>
//               <div
//                 style={{
//                   fontSize: "13px",
//                   fontWeight: "700",
//                   color: "#e2e8f0",
//                 }}
//               >
//                 {d.label}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}
//               >
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && (
//                   <span
//                     style={{
//                       color: "#ef4444",
//                       fontWeight: "700",
//                       marginLeft: "8px",
//                     }}
//                   >
//                     ⚠ Overdue
//                   </span>
//                 )}
//                 <span style={{ color: "#475569", marginLeft: "8px" }}>
//                   · Booking #{d.bookingId}
//                 </span>
//               </div>
//             </div>
//             <div
//               style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}
//             >
//               <div
//                 style={{
//                   fontSize: "16px",
//                   fontWeight: "800",
//                   color: d.status === "overdue" ? "#ef4444" : "#f59e0b",
//                 }}
//               >
//                 {fmt(d.amount)}
//               </div>
//               <div
//                 style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}
//               >
//                 Tap to pay →
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Booking Card ──────────────────────────────────────────────────────────────
// // FIX 2: downAmt now uses total_amount for confirmed bookings (actual deal value),
// // and calculates down payment for pending bookings from the payment plan.
// // The label switches between "Down Payment Due" / "Amount Paid" correctly.
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmt, token }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [cancelling, setCancelling] = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);

//   const cfg = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan = booking.payment_plan;
//   const price = parseFloat(booking.price || 0);
//   const isConfirmed = booking.booking_status === "confirmed";
//   const isPending = booking.booking_status === "pending";

//   // ── FIX 2: amount logic ──────────────────────────────────────────────────
//   // For confirmed bookings: show total_amount (the full deal value — most meaningful).
//   // For pending bookings: show down_payment_amount (first instalment due), or
//   //   calculate it from the payment plan's first milestone, or fall back to full price.
//   // booking.milestones = booking_milestones snapshot rows (from API with(['milestones']))
//   // Each row: { id, booking_id, status: 'paid'|'pending'|'overdue', amount, percentage, label, ... }
//   const paidMilestones = (booking.milestones || []).filter(
//     (m) => m.status === "paid",
//   );
//   const paidTotal = paidMilestones.reduce(
//     (sum, m) => sum + parseFloat(m.amount || 0),
//     0,
//   );

//   const displayAmt = (() => {
//     // Confirmed — show what has actually been paid (sum of paid milestones)
//     if (isConfirmed && paidTotal > 0) return paidTotal;

//     // Confirmed with no milestone snapshots — fall back to total_amount
//     if (isConfirmed) {
//       const ta = parseFloat(booking.total_amount || 0);
//       return ta > 0 ? ta : price;
//     }

//     // Pending — show the first instalment due (down payment)
//     const dp = parseFloat(booking.down_payment_amount || 0);
//     if (dp > 0) return dp;

//     // Calculate from payment plan's first milestone percentage
//     if (plan?.milestones?.[0]?.percentage) {
//       return Math.round(
//         (price * parseFloat(plan.milestones[0].percentage)) / 100,
//       );
//     }

//     return price;
//   })();

//   // Label: show how much paid vs how much the first due is
//   const amountLabel = isPending
//     ? "Down Payment Due"
//     : isConfirmed && paidTotal > 0
//       ? `Paid (${paidMilestones.length} milestone${paidMilestones.length > 1 ? "s" : ""})`
//       : isConfirmed
//         ? "Total Amount"
//         : "Amount";

//   return (
//     // FIX 1 (part): add id for notification highlight scroll
//     <div
//       id={`booking-card-${booking.id}`}
//       style={{
//         background:
//           "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//         border: "1px solid rgba(255,255,255,0.07)",
//         borderRadius: "16px",
//         overflow: "hidden",
//         transition: "border-color 0.2s, box-shadow 0.3s",
//       }}
//       onMouseEnter={(e) =>
//         (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")
//       }
//       onMouseLeave={(e) =>
//         (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
//       }
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             gap: "12px",
//           }}
//         >
//           <div style={{ flex: 1 }}>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: "17px",
//                   fontWeight: "800",
//                   color: "#e2e8f0",
//                 }}
//               >
//                 Unit {booking.plot_number}
//               </span>
//               <span
//                 style={{
//                   padding: "2px 10px",
//                   borderRadius: "20px",
//                   fontSize: "11px",
//                   fontWeight: "700",
//                   background: cfg.bg,
//                   color: cfg.color,
//                   border: `1px solid ${cfg.color}33`,
//                 }}
//               >
//                 {cfg.label}
//               </span>
//             </div>
//             <div
//               style={{
//                 marginTop: "3px",
//                 fontSize: "12px",
//                 color: "#64748b",
//                 display: "flex",
//                 gap: "10px",
//                 flexWrap: "wrap",
//               }}
//             >
//               <span>{booking.plot_type}</span>
//               {booking.area && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div
//                 style={{
//                   marginTop: "6px",
//                   padding: "6px 10px",
//                   background: "rgba(201,169,110,0.06)",
//                   border: "1px solid rgba(201,169,110,0.12)",
//                   borderRadius: "8px",
//                   fontSize: "12px",
//                 }}
//               >
//                 <span style={{ color: "#64748b" }}>Client: </span>
//                 <span style={{ color: "#c9a96e", fontWeight: "600" }}>
//                   {booking.client_name}
//                 </span>
//                 {booking.client_phone && (
//                   <span style={{ color: "#64748b" }}>
//                     {" "}
//                     · {booking.client_phone}
//                   </span>
//                 )}
//                 {booking.client_email && (
//                   <span style={{ color: "#64748b" }}>
//                     {" "}
//                     · {booking.client_email}
//                   </span>
//                 )}
//               </div>
//             )}
//             <div
//               style={{ marginTop: "4px", fontSize: "11px", color: "#334155" }}
//             >
//               #{booking.id} ·{" "}
//               {new Date(booking.created_at).toLocaleDateString("en-IN", {
//                 day: "numeric",
//                 month: "short",
//                 year: "numeric",
//               })}
//             </div>
//           </div>

//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div
//               style={{
//                 fontSize: "11px",
//                 color: "#475569",
//                 marginBottom: "2px",
//               }}
//             >
//               {amountLabel}
//             </div>
//             <div
//               style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}
//             >
//               {fmt(displayAmt)}
//             </div>
//             {/* Show balance remaining for confirmed plan bookings */}
//             {isConfirmed &&
//               plan &&
//               paidTotal > 0 &&
//               parseFloat(booking.total_amount || 0) > paidTotal && (
//                 <div
//                   style={{
//                     fontSize: "11px",
//                     color: "#f59e0b",
//                     marginTop: "2px",
//                   }}
//                 >
//                   Balance:{" "}
//                   {fmt(parseFloat(booking.total_amount || 0) - paidTotal)}
//                 </div>
//               )}
//             {isConfirmed &&
//               plan &&
//               paidTotal > 0 &&
//               parseFloat(booking.total_amount || 0) <= paidTotal && (
//                 <div
//                   style={{
//                     fontSize: "11px",
//                     color: "#22c55e",
//                     marginTop: "2px",
//                   }}
//                 >
//                   ✓ Fully paid
//                 </div>
//               )}
//             {/* Show total for pending plan bookings */}
//             {isPending && plan && price > 0 && (
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 Total: {fmt(price)}
//               </div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               marginTop: "10px",
//               padding: "7px 12px",
//               background: "rgba(201,169,110,0.06)",
//               border: "1px solid rgba(201,169,110,0.15)",
//               borderRadius: "8px",
//             }}
//           >
//             <span style={{ fontSize: "13px" }}>💰</span>
//             <span style={{ fontSize: "12px", color: "#64748b" }}>
//               Commission:
//             </span>
//             <span
//               style={{ fontSize: "13px", fontWeight: "800", color: "#c9a96e" }}
//             >
//               {fmt(booking.commission_amount)}
//             </span>
//             {booking.commission_status &&
//               (() => {
//                 const cs =
//                   COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//                 return (
//                   <span
//                     style={{
//                       marginLeft: "auto",
//                       fontSize: "11px",
//                       fontWeight: "700",
//                       color: cs.color,
//                     }}
//                   >
//                     {cs.label}
//                   </span>
//                 );
//               })()}
//           </div>
//         )}

//         <div
//           style={{
//             display: "flex",
//             gap: "8px",
//             marginTop: "12px",
//             flexWrap: "wrap",
//           }}
//         >
//           {isPending && (
//             <button
//               onClick={() => onPay(booking.id)}
//               style={{
//                 padding: "8px 18px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color: "#fff",
//                 border: "none",
//               }}
//             >
//               💳 Complete Payment
//             </button>
//           )}
//           <button
//             onClick={() => setExpanded((e) => !e)}
//             style={{
//               padding: "8px 14px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "12px",
//               background: "transparent",
//               color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)",
//             }}
//           >
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button
//               onClick={() => setConfirmCancel(true)}
//               style={{
//                 padding: "8px 14px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "12px",
//                 background: "transparent",
//                 color: "#ef4444",
//                 border: "1px solid rgba(239,68,68,0.25)",
//                 marginLeft: "auto",
//               }}
//             >
//               ✕ Cancel
//             </button>
//           )}
//           {isPending && confirmCancel && (
//             <div
//               style={{
//                 marginLeft: "auto",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//               }}
//             >
//               <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sure?</span>
//               <button
//                 disabled={cancelling}
//                 onClick={async () => {
//                   setCancelling(true);
//                   await onCancel(booking.id);
//                   setCancelling(false);
//                   setConfirmCancel(false);
//                 }}
//                 style={{
//                   padding: "7px 14px",
//                   borderRadius: "7px",
//                   cursor: "pointer",
//                   fontSize: "12px",
//                   fontWeight: "700",
//                   background: "rgba(239,68,68,0.15)",
//                   color: "#ef4444",
//                   border: "1px solid rgba(239,68,68,0.3)",
//                 }}
//               >
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button
//                 onClick={() => setConfirmCancel(false)}
//                 style={{
//                   padding: "7px 10px",
//                   borderRadius: "7px",
//                   cursor: "pointer",
//                   fontSize: "12px",
//                   background: "transparent",
//                   color: "#64748b",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                 }}
//               >
//                 No
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div
//           style={{
//             padding: "0 20px 16px",
//             borderTop: "1px solid rgba(255,255,255,0.05)",
//             paddingTop: "14px",
//           }}
//         >
//           <MilestoneTracker
//             bookingId={booking.id}
//             token={token}
//             fmt={fmt}
//             booking={booking}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Panel ─────────────────────────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast }) => {
//   const [form, setForm] = useState({
//     name: user.name || "",
//     phone: user.phone || "",
//     current_password: "",
//     new_password: "",
//     confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500);
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) {
//         payload.current_password = form.current_password;
//         payload.new_password = form.new_password;
//       }
//       const res = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${user.token}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok)
//         throw new Error(
//           data.message ||
//             Object.values(data.errors || {})
//               .flat()
//               .join(", ") ||
//             "Update failed",
//         );
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({
//         ...f,
//         current_password: "",
//         new_password: "",
//         confirm_password: "",
//       }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) {
//       showToast("❌ " + e.message, "error", 4000);
//     }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";
//   const inp = (placeholder, key, type = "text", readOnly = false) => (
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={form[key] ?? ""}
//       readOnly={readOnly}
//       onChange={(e) =>
//         !readOnly && setForm((f) => ({ ...f, [key]: e.target.value }))
//       }
//       style={{
//         width: "100%",
//         padding: "10px 14px",
//         marginBottom: "10px",
//         background: readOnly
//           ? "rgba(255,255,255,0.02)"
//           : "rgba(255,255,255,0.05)",
//         border: "1px solid rgba(255,255,255,0.1)",
//         borderRadius: "8px",
//         color: readOnly ? "#475569" : "#e2e8f0",
//         fontSize: "13px",
//         outline: "none",
//         boxSizing: "border-box",
//         cursor: readOnly ? "not-allowed" : "text",
//       }}
//     />
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <div
//         style={{
//           background: "rgba(255,255,255,0.02)",
//           border: "1px solid rgba(255,255,255,0.07)",
//           borderRadius: "14px",
//           padding: "20px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "16px",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               width: "56px",
//               height: "56px",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "22px",
//               fontWeight: "800",
//               color: "#000",
//               flexShrink: 0,
//             }}
//           >
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div
//               style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}
//             >
//               {user.name}
//             </div>
//             <div
//               style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}
//             >
//               {user.email}
//             </div>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#c9a96e",
//                 marginTop: "2px",
//                 fontWeight: "600",
//                 textTransform: "capitalize",
//               }}
//             >
//               {isBroker
//                 ? `🤝 Broker${user.broker_company ? " · " + user.broker_company : ""}`
//                 : "👤 Buyer"}
//             </div>
//           </div>
//         </div>
//         {isBroker && (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "8px",
//               marginBottom: "16px",
//             }}
//           >
//             {[
//               {
//                 label: "Commission Rate",
//                 value: `${user.commission_rate || 2}%`,
//               },
//               {
//                 label: "Account Status",
//                 value: user.status || "active",
//                 color: user.status === "active" ? "#22c55e" : "#ef4444",
//               },
//             ].map(({ label, value, color }) => (
//               <div
//                 key={label}
//                 style={{
//                   padding: "10px 14px",
//                   background: "rgba(201,169,110,0.06)",
//                   border: "1px solid rgba(201,169,110,0.12)",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "11px",
//                     color: "#64748b",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.5px",
//                   }}
//                 >
//                   {label}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "14px",
//                     fontWeight: "700",
//                     color: color || "#c9a96e",
//                     marginTop: "2px",
//                   }}
//                 >
//                   {value}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div
//           style={{
//             fontSize: "13px",
//             fontWeight: "700",
//             color: "#e2e8f0",
//             marginBottom: "12px",
//           }}
//         >
//           ✏️ Edit Profile
//         </div>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "0 12px",
//           }}
//         >
//           <div style={{ gridColumn: "1/-1" }}>{inp("Full Name *", "name")}</div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input
//               value={user.email}
//               readOnly
//               placeholder="Email"
//               style={{
//                 width: "100%",
//                 padding: "10px 14px",
//                 marginBottom: "10px",
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 borderRadius: "8px",
//                 color: "#475569",
//                 fontSize: "13px",
//                 outline: "none",
//                 boxSizing: "border-box",
//                 cursor: "not-allowed",
//               }}
//             />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>
//             {inp("Phone Number", "phone", "tel")}
//           </div>
//         </div>
//         <div
//           style={{
//             fontSize: "12px",
//             color: "#475569",
//             marginBottom: "10px",
//             marginTop: "4px",
//             letterSpacing: "0.5px",
//             textTransform: "uppercase",
//           }}
//         >
//           Change Password (leave blank to keep current)
//         </div>
//         {inp("Current Password", "current_password", "password")}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "0 12px",
//           }}
//         >
//           <div>{inp("New Password", "new_password", "password")}</div>
//           <div>{inp("Confirm Password", "confirm_password", "password")}</div>
//         </div>
//         <button
//           onClick={handleSave}
//           disabled={saving || !form.name}
//           style={{
//             width: "100%",
//             padding: "11px",
//             borderRadius: "8px",
//             cursor: saving ? "not-allowed" : "pointer",
//             background: "linear-gradient(135deg,#c9a96e,#a07840)",
//             color: "#fff",
//             border: "none",
//             fontWeight: "700",
//             fontSize: "13px",
//             marginTop: "4px",
//             opacity: saving ? 0.7 : 1,
//           }}
//         >
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Stats ──────────────────────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmt }) => {
//   const commPending = bookings
//     .filter((b) => b.commission_status === "pending")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings
//     .filter((b) => b.commission_status === "approved")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid = bookings
//     .filter((b) => b.commission_status === "paid")
//     .reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//         gap: "10px",
//         marginBottom: "20px",
//       }}
//     >
//       {[
//         {
//           label: "Pending Commission",
//           value: fmt(commPending),
//           color: "#f59e0b",
//           icon: "⏳",
//         },
//         {
//           label: "Approved Commission",
//           value: fmt(commApproved),
//           color: "#3b82f6",
//           icon: "✅",
//         },
//         {
//           label: "Commission Paid",
//           value: fmt(commPaid),
//           color: "#22c55e",
//           icon: "💰",
//         },
//         {
//           label: "Total Clients",
//           value: bookings.length,
//           color: "#c9a96e",
//           icon: "👥",
//         },
//       ].map(({ label, value, color, icon }) => (
//         <div
//           key={label}
//           style={{
//             background: "rgba(255,255,255,0.03)",
//             border: "1px solid rgba(255,255,255,0.07)",
//             borderRadius: "12px",
//             padding: "14px 16px",
//           }}
//         >
//           <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//           <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//             {value}
//           </div>
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//             {label}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications ─────────────────────────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder: {
//     icon: "💳",
//     color: "#f59e0b",
//     bg: "rgba(245,158,11,0.10)",
//     label: "Payment Reminder",
//   },
//   booking_confirmed: {
//     icon: "✅",
//     color: "#22c55e",
//     bg: "rgba(34,197,94,0.10)",
//     label: "Booking Confirmed",
//   },
//   booking_cancelled: {
//     icon: "❌",
//     color: "#ef4444",
//     bg: "rgba(239,68,68,0.10)",
//     label: "Booking Cancelled",
//   },
//   project_launch: {
//     icon: "🏗️",
//     color: "#c9a96e",
//     bg: "rgba(201,169,110,0.10)",
//     label: "Project Launch",
//   },
//   offer: {
//     icon: "🎁",
//     color: "#8b5cf6",
//     bg: "rgba(139,92,246,0.10)",
//     label: "Special Offer",
//   },
//   general: {
//     icon: "🔔",
//     color: "#c9a96e",
//     bg: "rgba(201,169,110,0.10)",
//     label: "General",
//   },
// };

// // ── FIX 1: NotificationModal — smart navigate based on type ──────────────────
// // payment_reminder → /payment/{id}  (complete payment)
// // booking_confirmed / others → switch to bookings tab and highlight the card
// const NotificationModal = ({
//   notif,
//   onClose,
//   onMarkRead,
//   onNavigate,
//   onSwitchToBookings,
// }) => {
//   const cfg = notif
//     ? NOTIF_CFG[notif.type] || NOTIF_CFG.general
//     : NOTIF_CFG.general;

//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);

//   if (!notif) return null;

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7
//       ? `${d}d ago`
//       : new Date(dateStr).toLocaleDateString("en-IN", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         });
//   };

//   const handleViewBooking = () => {
//     onClose();
//     if (notif.type === "payment_reminder") {
//       // Go to payment page — user needs to pay
//       onNavigate(`/payment/${notif.booking_id}`);
//     } else {
//       // Switch to bookings tab and scroll to the card
//       onSwitchToBookings(notif.booking_id);
//     }
//   };

//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 1000,
//         background: "rgba(0,0,0,0.7)",
//         backdropFilter: "blur(6px)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "linear-gradient(135deg,#0f0f1e,#12121f)",
//           border: `1px solid ${cfg.color}33`,
//           borderTop: `3px solid ${cfg.color}`,
//           borderRadius: "16px",
//           maxWidth: "520px",
//           width: "100%",
//           boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             padding: "20px 24px 16px",
//             borderBottom: "1px solid rgba(255,255,255,0.06)",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               justifyContent: "space-between",
//               gap: "12px",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//                 flex: 1,
//                 minWidth: 0,
//               }}
//             >
//               <div
//                 style={{
//                   width: "44px",
//                   height: "44px",
//                   borderRadius: "12px",
//                   flexShrink: 0,
//                   background: cfg.bg,
//                   border: `1px solid ${cfg.color}33`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "20px",
//                 }}
//               >
//                 {cfg.icon}
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "800",
//                     color: "#e2e8f0",
//                     lineHeight: "1.3",
//                   }}
//                 >
//                   {notif.title}
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     marginTop: "4px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "10px",
//                       fontWeight: "700",
//                       padding: "2px 8px",
//                       borderRadius: "10px",
//                       background: cfg.bg,
//                       color: cfg.color,
//                       border: `1px solid ${cfg.color}33`,
//                     }}
//                   >
//                     {cfg.label}
//                   </span>
//                   <span style={{ fontSize: "11px", color: "#475569" }}>
//                     🕐 {timeAgo(notif.created_at)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               style={{
//                 background: "rgba(255,255,255,0.05)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 color: "#64748b",
//                 width: "32px",
//                 height: "32px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "16px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               ×
//             </button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div
//             style={{
//               fontSize: "14px",
//               color: "#cbd5e1",
//               lineHeight: "1.75",
//               whiteSpace: "pre-line",
//               background: "rgba(255,255,255,0.02)",
//               border: "1px solid rgba(255,255,255,0.05)",
//               borderRadius: "10px",
//               padding: "16px",
//             }}
//           >
//             {notif.message}
//           </div>
//           <div
//             style={{
//               display: "flex",
//               gap: "8px",
//               marginTop: "16px",
//               flexWrap: "wrap",
//             }}
//           >
//             {notif.booking_id && (
//               <button
//                 onClick={handleViewBooking}
//                 style={{
//                   padding: "9px 20px",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: "13px",
//                   fontWeight: "700",
//                   background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                   color: "#fff",
//                   border: "none",
//                 }}
//               >
//                 {notif.type === "payment_reminder"
//                   ? "💳 Complete Payment →"
//                   : "📋 View Booking →"}
//               </button>
//             )}
//             <button
//               onClick={onClose}
//               style={{
//                 padding: "9px 16px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 background: "transparent",
//                 color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({
//   notifications,
//   loading,
//   unreadCount,
//   onMarkRead,
//   onMarkAllRead,
//   onNavigate,
//   onSwitchToBookings,
// }) => {
//   const [filter, setFilter] = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);

//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read") return n.is_read;
//     return true;
//   });

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//     });
//   };

//   if (loading)
//     return (
//       <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//         <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading
//         notifications...
//       </div>
//     );

//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal
//           notif={selectedNotif}
//           onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead}
//           onNavigate={onNavigate}
//           onSwitchToBookings={onSwitchToBookings} // ← FIX 1
//         />
//       )}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "14px",
//           flexWrap: "wrap",
//           gap: "10px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             gap: "4px",
//             background: "rgba(255,255,255,0.03)",
//             padding: "4px",
//             borderRadius: "8px",
//           }}
//         >
//           {[
//             ["all", "All"],
//             ["unread", "Unread"],
//             ["read", "Read"],
//           ].map(([val, label]) => (
//             <button
//               key={val}
//               onClick={() => setFilter(val)}
//               style={{
//                 padding: "5px 14px",
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 fontSize: "12px",
//                 fontWeight: "600",
//                 background:
//                   filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//                 color: filter === val ? "#c9a96e" : "#64748b",
//                 border:
//                   filter === val
//                     ? "1px solid rgba(201,169,110,0.25)"
//                     : "1px solid transparent",
//               }}
//             >
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span
//                   style={{
//                     marginLeft: "5px",
//                     padding: "0 5px",
//                     borderRadius: "10px",
//                     fontSize: "10px",
//                     background: "#f59e0b",
//                     color: "#000",
//                     fontWeight: "800",
//                   }}
//                 >
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button
//             onClick={onMarkAllRead}
//             style={{
//               padding: "6px 14px",
//               borderRadius: "7px",
//               cursor: "pointer",
//               fontSize: "12px",
//               fontWeight: "600",
//               background: "rgba(201,169,110,0.08)",
//               color: "#c9a96e",
//               border: "1px solid rgba(201,169,110,0.2)",
//             }}
//           >
//             ✓ Mark all read
//           </button>
//         )}
//       </div>

//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>
//           <div
//             style={{
//               fontSize: "15px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             {filter === "unread"
//               ? "No unread notifications"
//               : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Payment reminders and booking updates will appear here.
//           </div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {filtered.map((n) => {
//           const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.general;
//           return (
//             <div
//               key={n.id}
//               onClick={() => setSelectedNotif(n)}
//               style={{
//                 display: "flex",
//                 gap: "14px",
//                 alignItems: "flex-start",
//                 padding: "14px 16px",
//                 borderRadius: "12px",
//                 cursor: "pointer",
//                 background: n.is_read
//                   ? "rgba(255,255,255,0.02)"
//                   : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`,
//                 border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"}`,
//                 transition: "all 0.2s",
//                 position: "relative",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.borderColor = cfg.color + "55";
//                 e.currentTarget.style.transform = "translateY(-1px)";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.borderColor = n.is_read
//                   ? "rgba(255,255,255,0.06)"
//                   : cfg.color + "33";
//                 e.currentTarget.style.transform = "none";
//               }}
//             >
//               {!n.is_read && (
//                 <div
//                   style={{
//                     position: "absolute",
//                     top: "14px",
//                     right: "14px",
//                     width: "8px",
//                     height: "8px",
//                     borderRadius: "50%",
//                     background: cfg.color,
//                     boxShadow: `0 0 6px ${cfg.color}`,
//                   }}
//                 />
//               )}
//               <div
//                 style={{
//                   width: "40px",
//                   height: "40px",
//                   borderRadius: "10px",
//                   flexShrink: 0,
//                   background: cfg.bg,
//                   border: `1px solid ${cfg.color}33`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "18px",
//                 }}
//               >
//                 {cfg.icon}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     marginBottom: "3px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: n.is_read ? "600" : "700",
//                       color: n.is_read ? "#94a3b8" : "#e2e8f0",
//                     }}
//                   >
//                     {n.title}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "10px",
//                       fontWeight: "700",
//                       padding: "1px 7px",
//                       borderRadius: "10px",
//                       background: cfg.bg,
//                       color: cfg.color,
//                       border: `1px solid ${cfg.color}33`,
//                     }}
//                   >
//                     {cfg.label}
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "12px",
//                     color: n.is_read ? "#475569" : "#94a3b8",
//                     lineHeight: "1.5",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   {n.message.length > 80
//                     ? n.message.slice(0, 80) + "…"
//                     : n.message}
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <span style={{ fontSize: "11px", color: "#334155" }}>
//                     🕐 {timeAgo(n.created_at)}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "11px",
//                       color: cfg.color,
//                       fontWeight: "600",
//                     }}
//                   >
//                     Click to read →
//                   </span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Payments Tab ──────────────────────────────────────────────────────────────
// const GW_CFG = {
//   razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
//   stripe: { icon: "💎", color: "#8b5cf6", label: "Stripe" },
//   phonepe: { icon: "📱", color: "#f59e0b", label: "PhonePe" },
//   cash: { icon: "💵", color: "#22c55e", label: "Cash" },
//   manual: { icon: "🏦", color: "#64748b", label: "Manual" },
// };
// const TXN_STATUS = {
//   success: { color: "#22c55e", bg: "rgba(34,197,94,0.10)", label: "Success" },
//   pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", label: "Pending" },
//   failed: { color: "#ef4444", bg: "rgba(239,68,68,0.10)", label: "Failed" },
//   refunded: {
//     color: "#94a3b8",
//     bg: "rgba(148,163,184,0.10)",
//     label: "Refunded",
//   },
// };

// const PaymentsTab = ({ payments, loading, fmt }) => {
//   const totalPaid = payments
//     .filter((p) => p.status === "success")
//     .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
//   const successCount = payments.filter((p) => p.status === "success").length;
//   if (loading)
//     return (
//       <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//         <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading
//         payment history...
//       </div>
//     );
//   return (
//     <div>
//       {payments.length > 0 && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//             gap: "10px",
//             marginBottom: "20px",
//           }}
//         >
//           {[
//             {
//               label: "Total Paid",
//               value: fmt(totalPaid),
//               color: "#22c55e",
//               icon: "💰",
//             },
//             {
//               label: "Transactions",
//               value: successCount,
//               color: "#c9a96e",
//               icon: "🧾",
//             },
//             {
//               label: "Pending",
//               value: payments.filter((p) => p.status === "pending").length,
//               color: "#f59e0b",
//               icon: "⏳",
//             },
//           ].map(({ label, value, color, icon }) => (
//             <div
//               key={label}
//               style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "14px 16px",
//               }}
//             >
//               <div style={{ fontSize: "18px", marginBottom: "6px" }}>
//                 {icon}
//               </div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//                 {value}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 {label}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//       {payments.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
//           <div
//             style={{
//               fontSize: "14px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             No payment history yet
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>
//             Your payment transactions will appear here once you make a booking
//             payment.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {payments.map((p) => {
//           const gw = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
//           const txn = TXN_STATUS[p.status] || TXN_STATUS.pending;
//           return (
//             <div
//               key={p.id}
//               style={{
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "16px 18px",
//                 borderLeft: `3px solid ${txn.color}`,
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "flex-start",
//                   gap: "12px",
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <div style={{ flex: 1 }}>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "10px",
//                       flexWrap: "wrap",
//                       marginBottom: "4px",
//                     }}
//                   >
//                     <span style={{ fontSize: "16px" }}>{gw.icon}</span>
//                     <span
//                       style={{
//                         fontSize: "14px",
//                         fontWeight: "700",
//                         color: "#e2e8f0",
//                       }}
//                     >
//                       {gw.label}
//                     </span>
//                     <span
//                       style={{
//                         fontSize: "10px",
//                         fontWeight: "700",
//                         padding: "1px 8px",
//                         borderRadius: "10px",
//                         background: txn.bg,
//                         color: txn.color,
//                         border: `1px solid ${txn.color}33`,
//                       }}
//                     >
//                       {txn.label}
//                     </span>
//                     {p._synthetic && (
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           fontWeight: "700",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           background: "rgba(251,191,36,0.1)",
//                           color: "#fbbf24",
//                           border: "1px solid rgba(251,191,36,0.25)",
//                         }}
//                       >
//                         🏢 Walk-in / Cash
//                       </span>
//                     )}
//                     {!p._synthetic && p.mode && p.mode !== "online" && (
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 7px",
//                           borderRadius: "10px",
//                           background: "rgba(255,255,255,0.05)",
//                           color: "#64748b",
//                           border: "1px solid rgba(255,255,255,0.08)",
//                           textTransform: "capitalize",
//                         }}
//                       >
//                         {p.mode}
//                       </span>
//                     )}
//                   </div>
//                   {p.booking && (
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#64748b",
//                         marginBottom: "3px",
//                       }}
//                     >
//                       🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
//                     </div>
//                   )}
//                   {(p.gateway_payment_id || p.gateway_order_id) && (
//                     <div
//                       style={{
//                         fontSize: "11px",
//                         color: "#334155",
//                         fontFamily: "monospace",
//                       }}
//                     >
//                       Ref: {p.gateway_payment_id || p.gateway_order_id}
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ textAlign: "right", flexShrink: 0 }}>
//                   <div
//                     style={{
//                       fontSize: "20px",
//                       fontWeight: "800",
//                       color: txn.color,
//                     }}
//                   >
//                     {fmt(p.amount)}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "11px",
//                       color: "#475569",
//                       marginTop: "2px",
//                     }}
//                   >
//                     {p.paid_at
//                       ? new Date(p.paid_at).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })
//                       : new Date(p.created_at).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         })}
//                   </div>
//                 </div>
//               </div>
//               {p.notes && (
//                 <div
//                   style={{
//                     marginTop: "8px",
//                     fontSize: "12px",
//                     color: "#475569",
//                     padding: "6px 10px",
//                     background: "rgba(255,255,255,0.02)",
//                     borderRadius: "6px",
//                   }}
//                 >
//                   📝 {p.notes}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ──────────────────────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { icon: "💬", color: "#6c757d" },
//   service: { icon: "🛎️", color: "#3b82f6" },
//   unit: { icon: "🏠", color: "#c9a96e" },
//   payment: { icon: "💳", color: "#f59e0b" },
//   staff: { icon: "👤", color: "#8b5cf6" },
// };
// const StarRating = ({ value, onChange }) => (
//   <div style={{ display: "flex", gap: "4px" }}>
//     {[1, 2, 3, 4, 5].map((s) => (
//       <button
//         key={s}
//         type="button"
//         onClick={() => onChange(s)}
//         style={{
//           background: "none",
//           border: "none",
//           cursor: "pointer",
//           fontSize: "24px",
//           padding: "0 2px",
//           color: s <= value ? "#c9a96e" : "rgba(255,255,255,0.15)",
//           transition: "color 0.15s",
//         }}
//       >
//         ★
//       </button>
//     ))}
//   </div>
// );
// const FeedbackTab = ({
//   feedbacks,
//   bookings,
//   token,
//   onSubmitted,
//   showToast,
// }) => {
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({
//     rating: 5,
//     category: "general",
//     subject: "",
//     message: "",
//     booking_id: "",
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) {
//       showToast("⚠️ Subject and message are required", "warning", 3500);
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...form,
//           booking_id: form.booking_id || undefined,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast(
//         "🙏 Thank you! Your feedback has been submitted",
//         "success",
//         4000,
//       );
//       setForm({
//         rating: 5,
//         category: "general",
//         subject: "",
//         message: "",
//         booking_id: "",
//       });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) {
//       showToast("❌ " + e.message, "error", 4000);
//     }
//     setSubmitting(false);
//   };
//   const inp = (style = {}) => ({
//     width: "100%",
//     padding: "10px 14px",
//     marginBottom: "10px",
//     background: "rgba(255,255,255,0.05)",
//     border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: "8px",
//     color: "#e2e8f0",
//     fontSize: "13px",
//     outline: "none",
//     boxSizing: "border-box",
//     ...style,
//   });
//   const confirmedBookings = bookings.filter(
//     (b) => b.booking_status === "confirmed",
//   );
//   return (
//     <div>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "16px",
//         }}
//       >
//         <div>
//           <div
//             style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}
//           >
//             Your Feedback
//           </div>
//           <div style={{ fontSize: "12px", color: "#475569" }}>
//             Share your experience with us
//           </div>
//         </div>
//         <button
//           onClick={() => setShowForm((f) => !f)}
//           style={{
//             padding: "8px 16px",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontSize: "13px",
//             fontWeight: "700",
//             background: showForm
//               ? "rgba(255,255,255,0.05)"
//               : "linear-gradient(135deg,#c9a96e,#a07840)",
//             color: showForm ? "#64748b" : "#fff",
//             border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
//           }}
//         >
//           {showForm ? "✕ Cancel" : "+ New Feedback"}
//         </button>
//       </div>
//       {showForm && (
//         <div
//           style={{
//             background: "rgba(255,255,255,0.02)",
//             border: "1px solid rgba(201,169,110,0.2)",
//             borderRadius: "14px",
//             padding: "20px",
//             marginBottom: "20px",
//           }}
//         >
//           <div
//             style={{
//               fontSize: "13px",
//               fontWeight: "700",
//               color: "#c9a96e",
//               marginBottom: "16px",
//             }}
//           >
//             ✍️ New Feedback
//           </div>
//           <div style={{ marginBottom: "14px" }}>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#64748b",
//                 marginBottom: "8px",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Rating *
//             </div>
//             <StarRating
//               value={form.rating}
//               onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
//             />
//             <div
//               style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}
//             >
//               {
//                 ["", "Very Poor", "Poor", "Average", "Good", "Excellent"][
//                   form.rating
//                 ]
//               }
//             </div>
//           </div>
//           <div style={{ marginBottom: "10px" }}>
//             <div
//               style={{
//                 fontSize: "12px",
//                 color: "#64748b",
//                 marginBottom: "6px",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.5px",
//               }}
//             >
//               Category *
//             </div>
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => (
//                 <button
//                   key={cat}
//                   type="button"
//                   onClick={() => setForm((f) => ({ ...f, category: cat }))}
//                   style={{
//                     padding: "5px 12px",
//                     borderRadius: "20px",
//                     cursor: "pointer",
//                     fontSize: "12px",
//                     fontWeight: "600",
//                     background:
//                       form.category === cat
//                         ? `${cfg.color}22`
//                         : "rgba(255,255,255,0.03)",
//                     color: form.category === cat ? cfg.color : "#64748b",
//                     border: `1px solid ${form.category === cat ? cfg.color + "55" : "rgba(255,255,255,0.08)"}`,
//                     textTransform: "capitalize",
//                   }}
//                 >
//                   {cfg.icon} {cat}
//                 </button>
//               ))}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select
//               value={form.booking_id}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, booking_id: e.target.value }))
//               }
//               style={{ ...inp(), marginBottom: "10px" }}
//             >
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => (
//                 <option key={b.id} value={b.id}>
//                   Unit {b.plot_number} — Booking #{b.id}
//                 </option>
//               ))}
//             </select>
//           )}
//           <input
//             type="text"
//             placeholder="Subject *"
//             value={form.subject}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, subject: e.target.value }))
//             }
//             style={inp()}
//           />
//           <textarea
//             placeholder="Your message..."
//             value={form.message}
//             onChange={(e) =>
//               setForm((f) => ({ ...f, message: e.target.value }))
//             }
//             rows={4}
//             style={{ ...inp(), resize: "vertical" }}
//           />
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button
//               onClick={handleSubmit}
//               disabled={submitting}
//               style={{
//                 padding: "10px 22px",
//                 borderRadius: "8px",
//                 cursor: submitting ? "not-allowed" : "pointer",
//                 fontSize: "13px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color: "#fff",
//                 border: "none",
//                 opacity: submitting ? 0.7 : 1,
//               }}
//             >
//               {submitting ? "Submitting…" : "Submit Feedback →"}
//             </button>
//             <button
//               onClick={() => setShowForm(false)}
//               style={{
//                 padding: "10px 14px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 background: "transparent",
//                 color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
//           <div
//             style={{
//               fontSize: "14px",
//               fontWeight: "600",
//               color: "#e2e8f0",
//               marginBottom: "6px",
//             }}
//           >
//             No feedback yet
//           </div>
//           <div
//             style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}
//           >
//             Share your experience to help us improve.
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {feedbacks.map((fb) => {
//           const catCfg = CATEGORY_CFG[fb.category] || CATEGORY_CFG.general;
//           const ratingColor =
//             fb.rating >= 4 ? "#22c55e" : fb.rating >= 3 ? "#f59e0b" : "#ef4444";
//           return (
//             <div
//               key={fb.id}
//               style={{
//                 background: "rgba(255,255,255,0.02)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 overflow: "hidden",
//               }}
//             >
//               <div style={{ padding: "14px 16px" }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     gap: "10px",
//                   }}
//                 >
//                   <div style={{ flex: 1 }}>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "8px",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <span
//                         style={{
//                           fontSize: "14px",
//                           fontWeight: "700",
//                           color: "#e2e8f0",
//                         }}
//                       >
//                         {fb.subject}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           background: `${catCfg.color}22`,
//                           color: catCfg.color,
//                           border: `1px solid ${catCfg.color}33`,
//                           textTransform: "capitalize",
//                         }}
//                       >
//                         {catCfg.icon} {fb.category}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: "10px",
//                           padding: "1px 8px",
//                           borderRadius: "10px",
//                           fontWeight: "700",
//                           textTransform: "capitalize",
//                           background:
//                             fb.status === "resolved"
//                               ? "rgba(34,197,94,0.1)"
//                               : fb.status === "reviewed"
//                                 ? "rgba(59,130,246,0.1)"
//                                 : "rgba(245,158,11,0.1)",
//                           color:
//                             fb.status === "resolved"
//                               ? "#22c55e"
//                               : fb.status === "reviewed"
//                                 ? "#3b82f6"
//                                 : "#f59e0b",
//                         }}
//                       >
//                         {fb.status}
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#475569",
//                         marginTop: "4px",
//                       }}
//                     >
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </div>
//                   </div>
//                   <div
//                     style={{
//                       color: ratingColor,
//                       fontSize: "16px",
//                       fontWeight: "800",
//                       flexShrink: 0,
//                     }}
//                   >
//                     {"★".repeat(fb.rating)}
//                   </div>
//                 </div>
//                 <div
//                   style={{
//                     marginTop: "8px",
//                     fontSize: "13px",
//                     color: "#94a3b8",
//                     lineHeight: "1.6",
//                   }}
//                 >
//                   {fb.message}
//                 </div>
//                 {fb.admin_reply && (
//                   <div
//                     style={{
//                       marginTop: "12px",
//                       padding: "10px 14px",
//                       background: "rgba(34,197,94,0.06)",
//                       border: "1px solid rgba(34,197,94,0.15)",
//                       borderRadius: "8px",
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontSize: "11px",
//                         color: "#22c55e",
//                         fontWeight: "700",
//                         marginBottom: "4px",
//                         textTransform: "uppercase",
//                         letterSpacing: "0.5px",
//                       }}
//                     >
//                       💬 Admin Reply
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "13px",
//                         color: "#cbd5e1",
//                         lineHeight: "1.6",
//                         whiteSpace: "pre-line",
//                       }}
//                     >
//                       {fb.admin_reply}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ─────────────────────────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user = useSelector(selectUser);

//   const [bookings, setBookings] = useState([]);
//   const [milestoneMap, setMilestoneMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [activeTab, setActiveTab] = useState("bookings");
//   const [notifications, setNotifications] = useState([]);
//   const [notifsLoading, setNotifsLoading] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages, setUnreadMessages] = useState(0);

//   const { showToast } = useToast();
//   const {
//     wishlist,
//     wishedIds,
//     toggle: toggleWishRaw,
//     loading: wishLoading,
//   } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(
//     async (plotId) => {
//       const wasWished =
//         wishedIds instanceof Set && wishedIds.has(Number(plotId));
//       await toggleWishRaw(Number(plotId));
//       showToast(
//         wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//         wasWished ? "wishlist_remove" : "wishlist_add",
//         2800,
//       );
//     },
//     [wishedIds, toggleWishRaw, showToast],
//   );

//   const [currency, setCurrency] = useState({
//     symbol: "₹",
//     code: "INR",
//     position: "before",
//   });
//   const fmt = useCallback(
//     (n) => makeFmt(currency.symbol, currency.code, currency.position)(n),
//     [currency],
//   );
//   const isBroker = user?.role === "broker";

//   const fetchMilestones = useCallback(
//     async (bookingsList) => {
//       const targets = bookingsList.filter(
//         (b) => b.booking_status === "confirmed" && b.payment_plan_id,
//       );
//       if (!targets.length) return;
//       const results = await Promise.all(
//         targets.map((b) =>
//           fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//             headers: {
//               Authorization: `Bearer ${user?.token}`,
//               Accept: "application/json",
//             },
//           })
//             .then((r) => (r.ok ? r.json() : null))
//             .catch(() => null),
//         ),
//       );
//       const map = {};
//       targets.forEach((b, i) => {
//         if (results[i]) map[b.id] = results[i];
//       });
//       setMilestoneMap(map);
//     },
//     [user?.token],
//   );

//   // ── FIX 1: switchToBookings — called by NotificationModal ─────────────────
//   // Switches to the bookings tab and scrolls + highlights the relevant booking card
//   const switchToBookings = useCallback((bookingId) => {
//     setActiveTab("bookings");
//     if (!bookingId) return;
//     setTimeout(() => {
//       const el = document.getElementById(`booking-card-${bookingId}`);
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//         el.style.boxShadow =
//           "0 0 0 2px #c9a96e, 0 0 24px rgba(201,169,110,0.35)";
//         el.style.transition = "box-shadow 0.3s";
//         setTimeout(() => {
//           el.style.boxShadow = "";
//         }, 3000);
//       }
//     }, 150);
//   }, []);

//   useEffect(() => {
//     if (!user?.token) {
//       navigate("/");
//       return;
//     }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => {
//           if (d)
//             setCurrency({
//               symbol: d.symbol || "₹",
//               code: d.code || "INR",
//               position: d.position || "before",
//             });
//         })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//     ]);

//     const params = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     const txnId = params.get("txn");
//     if (bookingId && (sessionId || txnId)) {
//       const confirmPayment = async () => {
//         try {
//           if (sessionId) {
//             await fetch(`${API_BASE}/payment/stripe/confirm`, {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//                 Authorization: `Bearer ${user.token}`,
//               },
//               body: JSON.stringify({
//                 booking_id: bookingId,
//                 session_id: sessionId,
//               }),
//             });
//           }
//           await Promise.all([
//             fetchBookings(),
//             fetchNotifications(),
//             fetchPayments(),
//           ]);
//           showToast(
//             "🎉 Payment confirmed! Your booking is now active.",
//             "booking",
//             5000,
//           );
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, {
//       headers: { Authorization: `Bearer ${user.token}` },
//     })
//       .then((r) => r.json())
//       .then((d) => setUnreadMessages(d.unread || 0))
//       .catch(() => {});
//   }, [user]);

//   const fetchBookings = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${API_BASE}/bookings`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPayments = async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//             Accept: "application/json",
//           },
//         }),
//         fetch(`${API_BASE}/bookings`, {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//             Accept: "application/json",
//           },
//         }),
//       ]);
//       const txns = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter(
//           (b) =>
//             b.booking_status === "confirmed" &&
//             !txnBookingIds.has(String(b.id)),
//         )
//         .map((b) => ({
//           id: `booking_${b.id}`,
//           booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR",
//           status: "success",
//           mode: "manual",
//           gateway: "cash / manual",
//           paid_at: b.created_at,
//           _synthetic: true,
//           booking: {
//             id: b.id,
//             plot_number: b.plot_number,
//             plot_type: b.plot_type,
//             booking_status: b.booking_status,
//           },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {
//     } finally {
//       setPaymentsLoading(false);
//     }
//   };

//   const fetchFeedbacks = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   };

//   const fetchNotifications = async () => {
//     setNotifsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/notifications`, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {
//     } finally {
//       setNotifsLoading(false);
//     }
//   };

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
//       );
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const handlePay = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => {
//       dispatch(clearUser());
//       navigate("/");
//     }, 600);
//   };
//   const handleSaved = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//           Accept: "application/json",
//         },
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) =>
//         prev.map((b) =>
//           b.id === bookingId ? { ...b, booking_status: "cancelled" } : b,
//         ),
//       );
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) {
//       showToast("❌ " + e.message, "error", 4000);
//     }
//   };

//   const confirmed = bookings.filter(
//     (b) => b.booking_status === "confirmed",
//   ).length;
//   const pending = bookings.filter((b) => b.booking_status === "pending").length;
//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => {
//       // Sum paid milestone amounts if available
//       const paidMs = (b.milestones || []).filter((m) => m.status === "paid");
//       const paidSum = paidMs.reduce(
//         (ms, m) => ms + parseFloat(m.amount || 0),
//         0,
//       );
//       if (paidSum > 0) return s + paidSum;
//       // Fall back to down_payment_amount or total_amount
//       return (
//         s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0)
//       );
//     }, 0);

//   const tabs = [
//     {
//       id: "bookings",
//       label: isBroker ? "Client Bookings" : "My Bookings",
//       count: bookings.length,
//     },
//     { id: "wishlist", label: "Wishlist", count: wishlist.length },
//     { id: "payments", label: "Payments", count: 0 },
//     { id: "notifications", label: "Notifications", count: unreadCount },
//     { id: "feedback", label: "Feedback", count: 0 },
//     { id: "messages", label: "Messages", count: unreadMessages },
//     { id: "invoices", label: "Invoices", count: invoices.length },
//     { id: "profile", label: "My Profile", count: 0 },
//   ];

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#080812",
//         fontFamily: "'DM Sans', sans-serif",
//         color: "#e2e8f0",
//       }}
//     >
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />

//       {/* Header */}
//       <div
//         style={{
//           background: "rgba(8,8,18,0.96)",
//           borderBottom: "1px solid rgba(255,255,255,0.06)",
//           padding: "0 24px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           height: "62px",
//           position: "sticky",
//           top: 0,
//           zIndex: 100,
//           backdropFilter: "blur(12px)",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//           <button
//             onClick={() => navigate(-1)}
//             style={{
//               background: "none",
//               border: "none",
//               color: "#64748b",
//               cursor: "pointer",
//               fontSize: "13px",
//               padding: "6px 10px",
//               borderRadius: "6px",
//             }}
//           >
//             ← Back
//           </button>
//           <div
//             style={{
//               width: "1px",
//               height: "18px",
//               background: "rgba(255,255,255,0.08)",
//             }}
//           />
//           <span
//             style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}
//           >
//             {isBroker ? "🤝 Broker Dashboard" : "🏠 My Dashboard"}
//           </span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div style={{ textAlign: "right" }}>
//             <div
//               style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}
//             >
//               {user?.name}
//             </div>
//             <div style={{ fontSize: "11px", color: "#475569" }}>
//               {isBroker
//                 ? `🤝 Broker${user?.broker_company ? " · " + user.broker_company : ""}`
//                 : "👤 Buyer"}
//             </div>
//           </div>
//           <div
//             style={{
//               width: "34px",
//               height: "34px",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontWeight: "800",
//               fontSize: "13px",
//               color: "#000",
//             }}
//           >
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button
//             onClick={handleLogout}
//             style={{
//               background: "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b",
//               padding: "6px 12px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "12px",
//             }}
//           >
//             Logout
//           </button>
//           <button
//             onClick={() => setActiveTab("notifications")}
//             style={{
//               position: "relative",
//               background: "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b",
//               padding: "6px 10px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "15px",
//             }}
//           >
//             🔔
//             {unreadCount > 0 && (
//               <span
//                 style={{
//                   position: "absolute",
//                   top: "-5px",
//                   right: "-5px",
//                   minWidth: "16px",
//                   height: "16px",
//                   borderRadius: "10px",
//                   background: "#f59e0b",
//                   color: "#000",
//                   fontSize: "9px",
//                   fontWeight: "800",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   padding: "0 3px",
//                 }}
//               >
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div
//         style={{ maxWidth: "920px", margin: "0 auto", padding: "28px 18px" }}
//       >
//         <div style={{ marginBottom: "22px" }}>
//           <div
//             style={{
//               fontSize: "24px",
//               fontWeight: "800",
//               color: "#e2e8f0",
//               letterSpacing: "-0.4px",
//             }}
//           >
//             Welcome back, {user?.name?.split(" ")[0]} 👋
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569", marginTop: "3px" }}>
//             {isBroker
//               ? "Manage your client bookings and track your commissions."
//               : "Track your property bookings and payments."}
//           </div>
//         </div>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//             gap: "10px",
//             marginBottom: "20px",
//           }}
//         >
//           {[
//             {
//               label: "Total Bookings",
//               value: bookings.length,
//               icon: "🏠",
//               color: "#c9a96e",
//             },
//             {
//               label: "Confirmed",
//               value: confirmed,
//               icon: "✅",
//               color: "#22c55e",
//             },
//             {
//               label: "Pending Payment",
//               value: pending,
//               icon: "⏳",
//               color: "#f59e0b",
//             },
//             ...(!isBroker
//               ? [
//                   {
//                     label: "Amount Invested",
//                     value: fmt(totalInvested),
//                     icon: "💰",
//                     color: "#c9a96e",
//                   },
//                 ]
//               : []),
//           ].map(({ label, value, icon, color }) => (
//             <div
//               key={label}
//               style={{
//                 background: "rgba(255,255,255,0.03)",
//                 border: "1px solid rgba(255,255,255,0.07)",
//                 borderRadius: "12px",
//                 padding: "14px 16px",
//               }}
//             >
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>
//                 {icon}
//               </div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>
//                 {value}
//               </div>
//               <div
//                 style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
//               >
//                 {label}
//               </div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && (
//           <BrokerStats bookings={bookings} fmt={fmt} />
//         )}

//         <div
//           style={{
//             display: "flex",
//             gap: "4px",
//             marginBottom: "18px",
//             background: "rgba(255,255,255,0.03)",
//             padding: "4px",
//             borderRadius: "10px",
//             overflowX: "auto",
//           }}
//         >
//           {tabs.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setActiveTab(t.id)}
//               style={{
//                 padding: "7px 16px",
//                 borderRadius: "7px",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 fontWeight: "600",
//                 whiteSpace: "nowrap",
//                 background:
//                   activeTab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
//                 color: activeTab === t.id ? "#c9a96e" : "#64748b",
//                 border:
//                   activeTab === t.id
//                     ? "1px solid rgba(201,169,110,0.25)"
//                     : "1px solid transparent",
//               }}
//             >
//               {t.label}
//               {t.count > 0 && (
//                 <span
//                   style={{
//                     marginLeft: "6px",
//                     padding: "1px 6px",
//                     borderRadius: "20px",
//                     fontSize: "11px",
//                     background:
//                       activeTab === t.id
//                         ? "rgba(201,169,110,0.2)"
//                         : "rgba(255,255,255,0.07)",
//                     color: activeTab === t.id ? "#c9a96e" : "#475569",
//                   }}
//                 >
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {activeTab === "bookings" && (
//           <div>
//             {loading && (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: "60px 0",
//                   color: "#475569",
//                 }}
//               >
//                 <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
//                 Loading bookings...
//               </div>
//             )}
//             {error && (
//               <div
//                 style={{
//                   padding: "14px",
//                   background: "rgba(239,68,68,0.08)",
//                   border: "1px solid rgba(239,68,68,0.2)",
//                   borderRadius: "10px",
//                   color: "#fca5a5",
//                   fontSize: "13px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                 }}
//               >
//                 <span>⚠ {error}</span>
//                 <button
//                   onClick={fetchBookings}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "#c9a96e",
//                     cursor: "pointer",
//                     fontSize: "13px",
//                     textDecoration: "underline",
//                   }}
//                 >
//                   Retry
//                 </button>
//               </div>
//             )}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner
//                 milestoneMap={milestoneMap}
//                 fmt={fmt}
//                 onNavigate={navigate}
//               />
//             )}
//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏠</div>
//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "600",
//                     color: "#e2e8f0",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "13px",
//                     color: "#475569",
//                     marginBottom: "20px",
//                   }}
//                 >
//                   {isBroker
//                     ? "Book a unit for your clients from the unit page."
//                     : "Browse available units to make your first booking."}
//                 </div>
//                 <button
//                   onClick={() => navigate("/")}
//                   style={{
//                     padding: "10px 22px",
//                     background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: "10px",
//                     cursor: "pointer",
//                     fontWeight: "700",
//                   }}
//                 >
//                   Browse Units →
//                 </button>
//               </div>
//             )}
//             <div
//               style={{ display: "flex", flexDirection: "column", gap: "10px" }}
//             >
//               {!loading &&
//                 bookings.map((b) => (
//                   <BookingCard
//                     key={b.id}
//                     booking={b}
//                     onPay={handlePay}
//                     onCancel={handleCancel}
//                     isBroker={isBroker}
//                     fmt={fmt}
//                     token={user?.token}
//                   />
//                 ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab
//             wishlist={wishlist}
//             wishedIds={wishedIds}
//             onToggle={handleWishlistToggle}
//             loading={wishLoading}
//             token={user?.token}
//             onNavigate={navigate}
//             fmt={fmt}
//           />
//         )}
//         {activeTab === "payments" && (
//           <PaymentsTab
//             payments={payments}
//             loading={paymentsLoading}
//             fmt={fmt}
//           />
//         )}
//         {activeTab === "notifications" && (
//           <NotificationsTab
//             notifications={notifications}
//             loading={notifsLoading}
//             unreadCount={unreadCount}
//             onMarkRead={markRead}
//             onMarkAllRead={markAllRead}
//             onNavigate={navigate}
//             onSwitchToBookings={switchToBookings}
//           />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab
//             feedbacks={feedbacks}
//             bookings={bookings}
//             token={user?.token}
//             showToast={showToast}
//             onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])}
//           />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "invoices" && (
//           <InvoicesTab user={user} fmt={fmt} settings={settings} />
//         )}
//         {activeTab === "profile" && (
//           <ProfilePanel
//             user={user}
//             onSaved={handleSaved}
//             showToast={showToast}
//           />
//         )}
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";
// import InvoicesTab from "./InvoicesTab";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// const makeFmt =
//   (symbol = "₹", code = "INR", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", {
//       maximumFractionDigits: 0,
//     }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol} ${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Confirmed"       },
//   pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Pending Payment" },
//   cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Cancelled"       },
// };
// const COMM_CFG = {
//   pending:  { color: "#f59e0b", label: "Pending Approval" },
//   approved: { color: "#3b82f6", label: "Approved"         },
//   paid:     { color: "#22c55e", label: "Paid"             },
//   rejected: { color: "#ef4444", label: "Rejected"         },
// };

// // ── Milestone Tracker ─────────────────────────────────────────────────────────
// const MilestoneTracker = ({ bookingId, token, fmt, booking }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => { setData(d); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan  = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div style={{ color: "#475569", fontSize: "13px", padding: "10px",
//                       background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
//           💰 Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     return (
//       <div style={{ marginTop: "8px" }}>
//         <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700",
//                       letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
//           Payment Schedule — {plan.name}
//           <span style={{ fontWeight: "400", color: "#475569", marginLeft: "6px", fontSize: "10px" }}>(estimated)</span>
//         </div>
//         {plan.milestones.map((m, i) => {
//           const amt    = m.percentage ? Math.round((price * m.percentage) / 100) : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue  = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow key={i} label={m.label} percentage={m.percentage}
//               amount={amt} isPaid={isPaid} isDue={isDue} index={i} fmt={fmt} />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading)
//     return <div style={{ color: "#475569", fontSize: "12px", padding: "10px" }}>Loading payment schedule...</div>;

//   const { milestones, total_amount, paid_amount, balance_due } = data;
//   const pct = total_amount > 0 ? Math.round((paid_amount / total_amount) * 100) : 0;

//   return (
//     <div style={{ marginTop: "8px" }}>
//       <div style={{ marginBottom: "14px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
//           <span>Payment Progress</span><span>{pct}% complete</span>
//         </div>
//         <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", height: "6px", overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${pct}%`, borderRadius: "20px",
//                         background: "linear-gradient(90deg,#c9a96e,#a07840)", transition: "width 0.4s" }} />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "4px" }}>
//           <span style={{ color: "#22c55e" }}>Paid: {fmt(paid_amount)}</span>
//           <span style={{ color: balance_due > 0 ? "#f59e0b" : "#22c55e" }}>Balance: {fmt(balance_due)}</span>
//         </div>
//       </div>
//       {milestones.map((m, i) => {
//         const isPaid    = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived  = m.status === "waived";
//         const isDue     = !isPaid && !isWaived &&
//           i === milestones.findIndex((x) => x.status === "pending" || x.status === "overdue");
//         return (
//           <MilestoneRow key={m.id} label={m.label} percentage={m.percentage} amount={m.amount}
//             isPaid={isPaid} isDue={isDue} isOverdue={isOverdue} isWaived={isWaived}
//             dueDate={m.due_date} paidAt={m.paid_at} index={i} fmt={fmt} />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({ label, percentage, amount, isPaid, isDue, isOverdue, isWaived, dueDate, paidAt, index, fmt }) => {
//   const color = isPaid ? "#c9a96e" : isOverdue ? "#ef4444" : isWaived ? "#64748b" : isDue ? "#e2e8f0" : "#475569";
//   return (
//     <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "8px" }}>
//       <div style={{
//         width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
//         background: isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.15)" : isDue ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.04)",
//         border: `2px solid ${isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.5)" : isDue ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: "11px", fontWeight: "800",
//         color: isPaid ? "#000" : isOverdue ? "#ef4444" : isDue ? "#c9a96e" : "#334155",
//       }}>
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div style={{
//         flex: 1, padding: "8px 12px", borderRadius: "8px",
//         background: isPaid ? "rgba(201,169,110,0.08)" : isOverdue ? "rgba(239,68,68,0.06)" : isDue ? "rgba(201,169,110,0.04)" : "rgba(255,255,255,0.02)",
//         border: `1px solid ${isPaid ? "rgba(201,169,110,0.25)" : isOverdue ? "rgba(239,68,68,0.2)" : isDue ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.05)"}`,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color }}>{label}</div>
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "1px" }}>
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? "8px" : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "4px" }}>⚠ Overdue</span>}
//                 </span>
//               )}
//               {isPaid && paidAt && <span style={{ color: "#22c55e", marginLeft: "4px" }}>✓ Paid {paidAt}</span>}
//               {isDue && !isOverdue && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>← Due now</span>}
//               {isWaived && <span style={{ color: "#64748b", marginLeft: "8px" }}>Waived</span>}
//             </div>
//           </div>
//           <div style={{ fontSize: "15px", fontWeight: "800", color, flexShrink: 0, marginLeft: "12px" }}>
//             {fmt(amount)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ───────────────────────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmt, onNavigate }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId })),
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;
//   const overdueCount = dues.filter((d) => d.status === "overdue").length;

//   return (
//     <div style={{
//       marginBottom: "20px",
//       background: overdueCount > 0 ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
//       border: `1px solid ${overdueCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
//       borderRadius: "14px", padding: "16px 18px",
//     }}>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
//         <div style={{ fontSize: "13px", fontWeight: "700", color: overdueCount > 0 ? "#ef4444" : "#f59e0b" }}>
//           💳 Upcoming Payments
//           {overdueCount > 0 && (
//             <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "10px",
//                            background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "11px", fontWeight: "700" }}>
//               {overdueCount} overdue
//             </span>
//           )}
//         </div>
//         <div style={{ fontSize: "12px", color: "#64748b" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {dues.map((d, i) => (
//           <div key={i} style={{
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
//             background: d.status === "overdue" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.06)",
//             border: `1px solid ${d.status === "overdue" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)"}`,
//           }} onClick={() => onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)}>
//             <div>
//               <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{d.label}</div>
//               <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "8px" }}>⚠ Overdue</span>}
//                 <span style={{ color: "#475569", marginLeft: "8px" }}>· Booking #{d.bookingId}</span>
//               </div>
//             </div>
//             <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
//               <div style={{ fontSize: "16px", fontWeight: "800", color: d.status === "overdue" ? "#ef4444" : "#f59e0b" }}>
//                 {fmt(d.amount)}
//               </div>
//               <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Tap to pay →</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Booking Card ──────────────────────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmt, token }) => {
//   const [expanded,      setExpanded]      = useState(false);
//   const [cancelling,    setCancelling]    = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);

//   const cfg         = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan        = booking.payment_plan;
//   const price       = parseFloat(booking.price || 0);
//   const isConfirmed = booking.booking_status === "confirmed";
//   const isPending   = booking.booking_status === "pending";

//   const paidMilestones = (booking.milestones || []).filter((m) => m.status === "paid");
//   const paidTotal      = paidMilestones.reduce((sum, m) => sum + parseFloat(m.amount || 0), 0);

//   const displayAmt = (() => {
//     if (isConfirmed && paidTotal > 0) return paidTotal;
//     if (isConfirmed) {
//       const ta = parseFloat(booking.total_amount || 0);
//       return ta > 0 ? ta : price;
//     }
//     const dp = parseFloat(booking.down_payment_amount || 0);
//     if (dp > 0) return dp;
//     if (plan?.milestones?.[0]?.percentage) {
//       return Math.round((price * parseFloat(plan.milestones[0].percentage)) / 100);
//     }
//     return price;
//   })();

//   const amountLabel = isPending
//     ? "Down Payment Due"
//     : isConfirmed && paidTotal > 0
//       ? `Paid (${paidMilestones.length} milestone${paidMilestones.length > 1 ? "s" : ""})`
//       : isConfirmed ? "Total Amount" : "Amount";

//   return (
//     <div id={`booking-card-${booking.id}`} style={{
//       background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//       border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px",
//       overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.3s",
//     }}
//       onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")}
//       onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
//           <div style={{ flex: 1 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//               <span style={{ fontSize: "17px", fontWeight: "800", color: "#e2e8f0" }}>Unit {booking.plot_number}</span>
//               <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
//                              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                 {cfg.label}
//               </span>
//             </div>
//             <div style={{ marginTop: "3px", fontSize: "12px", color: "#64748b", display: "flex", gap: "10px", flexWrap: "wrap" }}>
//               <span>{booking.plot_type}</span>
//               {booking.area      && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div style={{ marginTop: "6px", padding: "6px 10px", background: "rgba(201,169,110,0.06)",
//                             border: "1px solid rgba(201,169,110,0.12)", borderRadius: "8px", fontSize: "12px" }}>
//                 <span style={{ color: "#64748b" }}>Client: </span>
//                 <span style={{ color: "#c9a96e", fontWeight: "600" }}>{booking.client_name}</span>
//                 {booking.client_phone && <span style={{ color: "#64748b" }}> · {booking.client_phone}</span>}
//                 {booking.client_email && <span style={{ color: "#64748b" }}> · {booking.client_email}</span>}
//               </div>
//             )}
//             <div style={{ marginTop: "4px", fontSize: "11px", color: "#334155" }}>
//               #{booking.id} · {new Date(booking.created_at).toLocaleDateString("en-IN", {
//                 day: "numeric", month: "short", year: "numeric",
//               })}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: "11px", color: "#475569", marginBottom: "2px" }}>{amountLabel}</div>
//             <div style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}>{fmt(displayAmt)}</div>
//             {isConfirmed && plan && paidTotal > 0 && parseFloat(booking.total_amount || 0) > paidTotal && (
//               <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "2px" }}>
//                 Balance: {fmt(parseFloat(booking.total_amount || 0) - paidTotal)}
//               </div>
//             )}
//             {isConfirmed && plan && paidTotal > 0 && parseFloat(booking.total_amount || 0) <= paidTotal && (
//               <div style={{ fontSize: "11px", color: "#22c55e", marginTop: "2px" }}>✓ Fully paid</div>
//             )}
//             {isPending && plan && price > 0 && (
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Total: {fmt(price)}</div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px",
//                         padding: "7px 12px", background: "rgba(201,169,110,0.06)",
//                         border: "1px solid rgba(201,169,110,0.15)", borderRadius: "8px" }}>
//             <span style={{ fontSize: "13px" }}>💰</span>
//             <span style={{ fontSize: "12px", color: "#64748b" }}>Commission:</span>
//             <span style={{ fontSize: "13px", fontWeight: "800", color: "#c9a96e" }}>{fmt(booking.commission_amount)}</span>
//             {booking.commission_status && (() => {
//               const cs = COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//               return <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: cs.color }}>{cs.label}</span>;
//             })()}
//           </div>
//         )}

//         <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
//           {isPending && (
//             <button onClick={() => onPay(booking.id)} style={{
//               padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none",
//             }}>💳 Complete Payment</button>
//           )}
//           <button onClick={() => setExpanded((e) => !e)} style={{
//             padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//             fontSize: "12px", background: "transparent", color: "#64748b",
//             border: "1px solid rgba(255,255,255,0.08)",
//           }}>
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button onClick={() => setConfirmCancel(true)} style={{
//               padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "12px", background: "transparent", color: "#ef4444",
//               border: "1px solid rgba(239,68,68,0.25)", marginLeft: "auto",
//             }}>✕ Cancel</button>
//           )}
//           {isPending && confirmCancel && (
//             <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
//               <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sure?</span>
//               <button disabled={cancelling} onClick={async () => {
//                 setCancelling(true); await onCancel(booking.id); setCancelling(false); setConfirmCancel(false);
//               }} style={{ padding: "7px 14px", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "700",
//                           background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button onClick={() => setConfirmCancel(false)} style={{
//                 padding: "7px 10px", borderRadius: "7px", cursor: "pointer",
//                 fontSize: "12px", background: "transparent", color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}>No</button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div style={{ padding: "0 20px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
//           <MilestoneTracker bookingId={booking.id} token={token} fmt={fmt} booking={booking} />
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Panel ─────────────────────────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast }) => {
//   const [form, setForm] = useState({
//     name: user.name || "", phone: user.phone || "",
//     current_password: "", new_password: "", confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500); return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) { payload.current_password = form.current_password; payload.new_password = form.new_password; }
//       const res  = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Update failed");
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";
//   const inp = (placeholder, key, type = "text", readOnly = false) => (
//     <input type={type} placeholder={placeholder} value={form[key] ?? ""} readOnly={readOnly}
//       onChange={(e) => !readOnly && setForm((f) => ({ ...f, [key]: e.target.value }))}
//       style={{
//         width: "100%", padding: "10px 14px", marginBottom: "10px",
//         background: readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
//         border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
//         color: readOnly ? "#475569" : "#e2e8f0", fontSize: "13px", outline: "none",
//         boxSizing: "border-box", cursor: readOnly ? "not-allowed" : "text",
//       }}
//     />
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
//           <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "800", color: "#000", flexShrink: 0 }}>
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}>{user.name}</div>
//             <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{user.email}</div>
//             <div style={{ fontSize: "12px", color: "#c9a96e", marginTop: "2px", fontWeight: "600", textTransform: "capitalize" }}>
//               {isBroker ? `🤝 Broker${user.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//         </div>
//         {isBroker && (
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
//             {[
//               { label: "Commission Rate", value: `${user.commission_rate || 2}%` },
//               { label: "Account Status", value: user.status || "active", color: user.status === "active" ? "#22c55e" : "#ef4444" },
//             ].map(({ label, value, color }) => (
//               <div key={label} style={{ padding: "10px 14px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)", borderRadius: "8px" }}>
//                 <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
//                 <div style={{ fontSize: "14px", fontWeight: "700", color: color || "#c9a96e", marginTop: "2px" }}>{value}</div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px" }}>✏️ Edit Profile</div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Full Name *", "name")}</div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input value={user.email} readOnly placeholder="Email" style={{
//               width: "100%", padding: "10px 14px", marginBottom: "10px",
//               background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
//               borderRadius: "8px", color: "#475569", fontSize: "13px", outline: "none",
//               boxSizing: "border-box", cursor: "not-allowed",
//             }} />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Phone Number", "phone", "tel")}</div>
//         </div>
//         <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px", marginTop: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
//           Change Password (leave blank to keep current)
//         </div>
//         {inp("Current Password", "current_password", "password")}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div>{inp("New Password", "new_password", "password")}</div>
//           <div>{inp("Confirm Password", "confirm_password", "password")}</div>
//         </div>
//         <button onClick={handleSave} disabled={saving || !form.name} style={{
//           width: "100%", padding: "11px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer",
//           background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none",
//           fontWeight: "700", fontSize: "13px", marginTop: "4px", opacity: saving ? 0.7 : 1,
//         }}>
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Stats ──────────────────────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmt }) => {
//   const commPending  = bookings.filter((b) => b.commission_status === "pending").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings.filter((b) => b.commission_status === "approved").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid     = bookings.filter((b) => b.commission_status === "paid").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//       {[
//         { label: "Pending Commission",  value: fmt(commPending),  color: "#f59e0b", icon: "⏳" },
//         { label: "Approved Commission", value: fmt(commApproved), color: "#3b82f6", icon: "✅" },
//         { label: "Commission Paid",     value: fmt(commPaid),     color: "#22c55e", icon: "💰" },
//         { label: "Total Clients",       value: bookings.length,   color: "#c9a96e", icon: "👥" },
//       ].map(({ label, value, color, icon }) => (
//         <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//           <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//           <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications ─────────────────────────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder:  { icon: "💳", color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Payment Reminder"  },
//   booking_confirmed: { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Booking Confirmed" },
//   booking_cancelled: { icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Booking Cancelled" },
//   project_launch:    { icon: "🏗️", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "Project Launch"    },
//   offer:             { icon: "🎁", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)",  label: "Special Offer"     },
//   general:           { icon: "🔔", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "General"           },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate, onSwitchToBookings }) => {
//   const cfg = notif ? NOTIF_CFG[notif.type] || NOTIF_CFG.general : NOTIF_CFG.general;

//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);

//   if (!notif) return null;

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   };

//   const handleViewBooking = () => {
//     onClose();
//     if (notif.type === "payment_reminder") {
//       onNavigate(`/payment/${notif.booking_id}`);
//     } else {
//       onSwitchToBookings(notif.booking_id);
//     }
//   };

//   return (
//     <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000,
//       background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
//       display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
//       <div onClick={(e) => e.stopPropagation()} style={{
//         background: "linear-gradient(135deg,#0f0f1e,#12121f)",
//         border: `1px solid ${cfg.color}33`, borderTop: `3px solid ${cfg.color}`,
//         borderRadius: "16px", maxWidth: "520px", width: "100%",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
//         <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
//               <div style={{ width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div style={{ fontSize: "15px", fontWeight: "800", color: "#e2e8f0", lineHeight: "1.3" }}>{notif.title}</div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                   <span style={{ fontSize: "11px", color: "#475569" }}>🕐 {timeAgo(notif.created_at)}</span>
//                 </div>
//               </div>
//             </div>
//             <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.75", whiteSpace: "pre-line",
//                         background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
//                         borderRadius: "10px", padding: "16px" }}>
//             {notif.message}
//           </div>
//           <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
//             {notif.booking_id && (
//               <button onClick={handleViewBooking} style={{ padding: "9px 20px", borderRadius: "8px", cursor: "pointer",
//                 fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none" }}>
//                 {notif.type === "payment_reminder" ? "💳 Complete Payment →" : "📋 View Booking →"}
//               </button>
//             )}
//             <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "13px", background: "transparent", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({ notifications, loading, unreadCount, onMarkRead, onMarkAllRead, onNavigate, onSwitchToBookings }) => {
//   const [filter,       setFilter]       = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);

//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read")   return  n.is_read;
//     return true;
//   });

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
//   };

//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading notifications...
//     </div>
//   );

//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal notif={selectedNotif} onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead} onNavigate={onNavigate} onSwitchToBookings={onSwitchToBookings} />
//       )}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
//         <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "8px" }}>
//           {[["all","All"],["unread","Unread"],["read","Read"]].map(([val, label]) => (
//             <button key={val} onClick={() => setFilter(val)} style={{
//               padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
//               background: filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//               color: filter === val ? "#c9a96e" : "#64748b",
//               border: filter === val ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span style={{ marginLeft: "5px", padding: "0 5px", borderRadius: "10px",
//                                fontSize: "10px", background: "#f59e0b", color: "#000", fontWeight: "800" }}>
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button onClick={onMarkAllRead} style={{ padding: "6px 14px", borderRadius: "7px", cursor: "pointer",
//             fontSize: "12px", fontWeight: "600", background: "rgba(201,169,110,0.08)",
//             color: "#c9a96e", border: "1px solid rgba(201,169,110,0.2)" }}>✓ Mark all read</button>
//         )}
//       </div>

//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>
//           <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//             {filter === "unread" ? "No unread notifications" : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>Payment reminders and booking updates will appear here.</div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {filtered.map((n) => {
//           const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.general;
//           return (
//             <div key={n.id} onClick={() => setSelectedNotif(n)} style={{
//               display: "flex", gap: "14px", alignItems: "flex-start",
//               padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
//               background: n.is_read ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`,
//               border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"}`,
//               transition: "all 0.2s", position: "relative",
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color + "55"; e.currentTarget.style.transform = "translateY(-1px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.borderColor = n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"; e.currentTarget.style.transform = "none"; }}
//             >
//               {!n.is_read && (
//                 <div style={{ position: "absolute", top: "14px", right: "14px", width: "8px", height: "8px",
//                               borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
//               )}
//               <div style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "13px", fontWeight: n.is_read ? "600" : "700", color: n.is_read ? "#94a3b8" : "#e2e8f0" }}>
//                     {n.title}
//                   </span>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 7px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                 </div>
//                 <div style={{ fontSize: "12px", color: n.is_read ? "#475569" : "#94a3b8", lineHeight: "1.5", marginBottom: "6px" }}>
//                   {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "11px", color: "#334155" }}>🕐 {timeAgo(n.created_at)}</span>
//                   <span style={{ fontSize: "11px", color: cfg.color, fontWeight: "600" }}>Click to read →</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Payments Tab ──────────────────────────────────────────────────────────────
// const GW_CFG = {
//   razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
//   stripe:   { icon: "💎", color: "#8b5cf6", label: "Stripe"   },
//   phonepe:  { icon: "📱", color: "#f59e0b", label: "PhonePe"  },
//   cash:     { icon: "💵", color: "#22c55e", label: "Cash"     },
//   manual:   { icon: "🏦", color: "#64748b", label: "Manual"   },
// };
// const TXN_STATUS = {
//   success:  { color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Success"  },
//   pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Pending"  },
//   failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Failed"   },
//   refunded: { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", label: "Refunded" },
// };

// const PaymentsTab = ({ payments, loading, fmt }) => {
//   const totalPaid    = payments.filter((p) => p.status === "success").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
//   const successCount = payments.filter((p) => p.status === "success").length;
//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading payment history...
//     </div>
//   );
//   return (
//     <div>
//       {payments.length > 0 && (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Paid",   value: fmt(totalPaid),                                        color: "#22c55e", icon: "💰" },
//             { label: "Transactions", value: successCount,                                           color: "#c9a96e", icon: "🧾" },
//             { label: "Pending",      value: payments.filter((p) => p.status === "pending").length, color: "#f59e0b", icon: "⏳" },
//           ].map(({ label, value, color, icon }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       )}
//       {payments.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
//           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No payment history yet</div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>Your payment transactions will appear here once you make a booking payment.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {payments.map((p) => {
//           const gw  = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
//           const txn = TXN_STATUS[p.status] || TXN_STATUS.pending;
//           return (
//             <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
//                                       borderRadius: "12px", padding: "16px 18px", borderLeft: `3px solid ${txn.color}` }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
//                     <span style={{ fontSize: "16px" }}>{gw.icon}</span>
//                     <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{gw.label}</span>
//                     <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
//                                    background: txn.bg, color: txn.color, border: `1px solid ${txn.color}33` }}>{txn.label}</span>
//                     {p._synthetic && (
//                       <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
//                                      background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
//                         🏢 Walk-in / Cash
//                       </span>
//                     )}
//                     {!p._synthetic && p.mode && p.mode !== "online" && (
//                       <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "10px",
//                                      background: "rgba(255,255,255,0.05)", color: "#64748b",
//                                      border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize" }}>
//                         {p.mode}
//                       </span>
//                     )}
//                   </div>
//                   {p.booking && (
//                     <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
//                       🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
//                     </div>
//                   )}
//                   {(p.gateway_payment_id || p.gateway_order_id) && (
//                     <div style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace" }}>
//                       Ref: {p.gateway_payment_id || p.gateway_order_id}
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ textAlign: "right", flexShrink: 0 }}>
//                   <div style={{ fontSize: "20px", fontWeight: "800", color: txn.color }}>{fmt(p.amount)}</div>
//                   <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//                     {p.paid_at
//                       ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
//                       : new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                   </div>
//                 </div>
//               </div>
//               {p.notes && (
//                 <div style={{ marginTop: "8px", fontSize: "12px", color: "#475569", padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
//                   📝 {p.notes}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ──────────────────────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { icon: "💬", color: "#6c757d" },
//   service: { icon: "🛎️", color: "#3b82f6" },
//   unit:    { icon: "🏠", color: "#c9a96e" },
//   payment: { icon: "💳", color: "#f59e0b" },
//   staff:   { icon: "👤", color: "#8b5cf6" },
// };
// const StarRating = ({ value, onChange }) => (
//   <div style={{ display: "flex", gap: "4px" }}>
//     {[1,2,3,4,5].map((s) => (
//       <button key={s} type="button" onClick={() => onChange(s)} style={{
//         background: "none", border: "none", cursor: "pointer", fontSize: "24px",
//         padding: "0 2px", color: s <= value ? "#c9a96e" : "rgba(255,255,255,0.15)", transition: "color 0.15s",
//       }}>★</button>
//     ))}
//   </div>
// );
// const FeedbackTab = ({ feedbacks, bookings, token, onSubmitted, showToast }) => {
//   const [showForm,   setShowForm]   = useState(false);
//   const [form,       setForm]       = useState({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) { showToast("⚠️ Subject and message are required", "warning", 3500); return; }
//     setSubmitting(true);
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ ...form, booking_id: form.booking_id || undefined }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast("🙏 Thank you! Your feedback has been submitted", "success", 4000);
//       setForm({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSubmitting(false);
//   };

//   const inp = (style = {}) => ({
//     width: "100%", padding: "10px 14px", marginBottom: "10px",
//     background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box", ...style,
//   });

//   const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed");

//   return (
//     <div>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//         <div>
//           <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>Your Feedback</div>
//           <div style={{ fontSize: "12px", color: "#475569" }}>Share your experience with us</div>
//         </div>
//         <button onClick={() => setShowForm((f) => !f)} style={{
//           padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
//           background: showForm ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#c9a96e,#a07840)",
//           color: showForm ? "#64748b" : "#fff", border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
//         }}>{showForm ? "✕ Cancel" : "+ New Feedback"}</button>
//       </div>
//       {showForm && (
//         <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
//           <div style={{ fontSize: "13px", fontWeight: "700", color: "#c9a96e", marginBottom: "16px" }}>✍️ New Feedback</div>
//           <div style={{ marginBottom: "14px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rating *</div>
//             <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
//               {["","Very Poor","Poor","Average","Good","Excellent"][form.rating]}
//             </div>
//           </div>
//           <div style={{ marginBottom: "10px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category *</div>
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => (
//                 <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} style={{
//                   padding: "5px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
//                   background: form.category === cat ? `${cfg.color}22` : "rgba(255,255,255,0.03)",
//                   color: form.category === cat ? cfg.color : "#64748b",
//                   border: `1px solid ${form.category === cat ? cfg.color + "55" : "rgba(255,255,255,0.08)"}`,
//                   textTransform: "capitalize",
//                 }}>{cfg.icon} {cat}</button>
//               ))}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select value={form.booking_id} onChange={(e) => setForm((f) => ({ ...f, booking_id: e.target.value }))}
//               style={{ ...inp(), marginBottom: "10px" }}>
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => <option key={b.id} value={b.id}>Unit {b.plot_number} — Booking #{b.id}</option>)}
//             </select>
//           )}
//           <input type="text" placeholder="Subject *" value={form.subject}
//             onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inp()} />
//           <textarea placeholder="Your message..." value={form.message}
//             onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4} style={{ ...inp(), resize: "vertical" }} />
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button onClick={handleSubmit} disabled={submitting} style={{
//               padding: "10px 22px", borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
//               fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               color: "#fff", border: "none", opacity: submitting ? 0.7 : 1,
//             }}>{submitting ? "Submitting…" : "Submit Feedback →"}</button>
//             <button onClick={() => setShowForm(false)} style={{ padding: "10px 14px", borderRadius: "8px",
//               cursor: "pointer", fontSize: "13px", background: "transparent", color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
//           </div>
//         </div>
//       )}
//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
//           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No feedback yet</div>
//           <div style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>Share your experience to help us improve.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {feedbacks.map((fb) => {
//           const catCfg     = CATEGORY_CFG[fb.category] || CATEGORY_CFG.general;
//           const ratingColor = fb.rating >= 4 ? "#22c55e" : fb.rating >= 3 ? "#f59e0b" : "#ef4444";
//           return (
//             <div key={fb.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
//               <div style={{ padding: "14px 16px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
//                       <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{fb.subject}</span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px",
//                                      background: `${catCfg.color}22`, color: catCfg.color,
//                                      border: `1px solid ${catCfg.color}33`, textTransform: "capitalize" }}>
//                         {catCfg.icon} {fb.category}
//                       </span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px", fontWeight: "700", textTransform: "capitalize",
//                                      background: fb.status === "resolved" ? "rgba(34,197,94,0.1)" : fb.status === "reviewed" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
//                                      color: fb.status === "resolved" ? "#22c55e" : fb.status === "reviewed" ? "#3b82f6" : "#f59e0b" }}>
//                         {fb.status}
//                       </span>
//                     </div>
//                     <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                     </div>
//                   </div>
//                   <div style={{ color: ratingColor, fontSize: "16px", fontWeight: "800", flexShrink: 0 }}>{"★".repeat(fb.rating)}</div>
//                 </div>
//                 <div style={{ marginTop: "8px", fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>{fb.message}</div>
//                 {fb.admin_reply && (
//                   <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px" }}>
//                     <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 Admin Reply</div>
//                     <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", whiteSpace: "pre-line" }}>{fb.admin_reply}</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ─────────────────────────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user     = useSelector(selectUser);

//   const [bookings,        setBookings]        = useState([]);
//   const [milestoneMap,    setMilestoneMap]    = useState({});
//   const [loading,         setLoading]         = useState(true);
//   const [error,           setError]           = useState("");
//   const [activeTab,       setActiveTab]       = useState("bookings");
//   const [notifications,   setNotifications]   = useState([]);
//   const [notifsLoading,   setNotifsLoading]   = useState(false);
//   const [unreadCount,     setUnreadCount]     = useState(0);
//   const [feedbacks,       setFeedbacks]       = useState([]);
//   const [payments,        setPayments]        = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages,  setUnreadMessages]  = useState(0);

//   // ── FIX 1: invoices state — was missing, caused 'invoices is not defined' ──
//   const [invoices, setInvoices] = useState([]);

//   const { showToast } = useToast();
//   const { wishlist, wishedIds, toggle: toggleWishRaw, loading: wishLoading } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(async (plotId) => {
//     const wasWished = wishedIds instanceof Set && wishedIds.has(Number(plotId));
//     await toggleWishRaw(Number(plotId));
//     showToast(wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//               wasWished ? "wishlist_remove" : "wishlist_add", 2800);
//   }, [wishedIds, toggleWishRaw, showToast]);

//   const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", position: "before" });
//   const fmt      = useCallback((n) => makeFmt(currency.symbol, currency.code, currency.position)(n), [currency]);
//   const isBroker = user?.role === "broker";

//   const fetchMilestones = useCallback(async (bookingsList) => {
//     const targets = bookingsList.filter((b) => b.booking_status === "confirmed" && b.payment_plan_id);
//     if (!targets.length) return;
//     const results = await Promise.all(
//       targets.map((b) =>
//         fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//           headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//         }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
//       ),
//     );
//     const map = {};
//     targets.forEach((b, i) => { if (results[i]) map[b.id] = results[i]; });
//     setMilestoneMap(map);
//   }, [user?.token]);

//   const switchToBookings = useCallback((bookingId) => {
//     setActiveTab("bookings");
//     if (!bookingId) return;
//     setTimeout(() => {
//       const el = document.getElementById(`booking-card-${bookingId}`);
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//         el.style.boxShadow = "0 0 0 2px #c9a96e, 0 0 24px rgba(201,169,110,0.35)";
//         el.style.transition = "box-shadow 0.3s";
//         setTimeout(() => { el.style.boxShadow = ""; }, 3000);
//       }
//     }, 150);
//   }, []);

//   // ── FIX 2: fetch invoices ─────────────────────────────────────────────────
//   const fetchInvoices = useCallback(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/invoices`, {
//         headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       setInvoices(Array.isArray(data) ? data : []);
//     } catch (_) {}
//   }, [user?.token]);

//   useEffect(() => {
//     if (!user?.token) { navigate("/"); return; }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => { if (d) setCurrency({ symbol: d.symbol || "₹", code: d.code || "INR", position: d.position || "before" }); })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//       fetchInvoices(),   // ← fetch invoices on mount
//     ]);

//     const params    = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     const txnId     = params.get("txn");
//     if (bookingId && (sessionId || txnId)) {
//       const confirmPayment = async () => {
//         try {
//           if (sessionId) {
//             await fetch(`${API_BASE}/payment/stripe/confirm`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//               body: JSON.stringify({ booking_id: bookingId, session_id: sessionId }),
//             });
//           }
//           await Promise.all([fetchBookings(), fetchNotifications(), fetchPayments(), fetchInvoices()]);
//           showToast("🎉 Payment confirmed! Your booking is now active.", "booking", 5000);
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, { headers: { Authorization: `Bearer ${user.token}` } })
//       .then((r) => r.json()).then((d) => setUnreadMessages(d.unread || 0)).catch(() => {});
//   }, [user]);

//   const fetchBookings = async () => {
//     setLoading(true); setError("");
//     try {
//       const res  = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally { setLoading(false); }
//   };

//   const fetchPayments = async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//         fetch(`${API_BASE}/bookings`,         { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//       ]);
//       const txns     = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books    = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList  = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter((b) => b.booking_status === "confirmed" && !txnBookingIds.has(String(b.id)))
//         .map((b) => ({
//           id: `booking_${b.id}`, booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR", status: "success", mode: "manual",
//           gateway: "cash / manual", paid_at: b.created_at, _synthetic: true,
//           booking: { id: b.id, plot_number: b.plot_number, plot_type: b.plot_type, booking_status: b.booking_status },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {} finally { setPaymentsLoading(false); }
//   };

//   const fetchFeedbacks = async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   };

//   const fetchNotifications = async () => {
//     setNotifsLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {} finally { setNotifsLoading(false); }
//   };

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const handlePay    = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 600);
//   };
//   const handleSaved  = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res  = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, booking_status: "cancelled" } : b));
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//   };

//   const confirmed     = bookings.filter((b) => b.booking_status === "confirmed").length;
//   const pending       = bookings.filter((b) => b.booking_status === "pending").length;
//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => {
//       const paidMs  = (b.milestones || []).filter((m) => m.status === "paid");
//       const paidSum = paidMs.reduce((ms, m) => ms + parseFloat(m.amount || 0), 0);
//       if (paidSum > 0) return s + paidSum;
//       return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//     }, 0);

//   const tabs = [
//     { id: "bookings",      label: isBroker ? "Client Bookings" : "My Bookings", count: bookings.length },
//     { id: "wishlist",      label: "Wishlist",       count: wishlist.length  },
//     { id: "payments",      label: "Payments",       count: 0               },
//     { id: "invoices",      label: "Invoices",       count: invoices.length }, // ← uses invoices state
//     { id: "notifications", label: "Notifications",  count: unreadCount     },
//     { id: "feedback",      label: "Feedback",       count: 0               },
//     { id: "messages",      label: "Messages",       count: unreadMessages  },
//     { id: "profile",       label: "My Profile",     count: 0               },
//   ];

//   return (
//     <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* Header */}
//       <div style={{ background: "rgba(8,8,18,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)",
//                     padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
//                     height: "62px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//           <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px", padding: "6px 10px", borderRadius: "6px" }}>← Back</button>
//           <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)" }} />
//           <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{isBroker ? "🤝 Broker Dashboard" : "🏠 My Dashboard"}</span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{user?.name}</div>
//             <div style={{ fontSize: "11px", color: "#475569" }}>
//               {isBroker ? `🤝 Broker${user?.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//           <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", color: "#000" }}>
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//             color: "#64748b", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
//           <button onClick={() => setActiveTab("notifications")} style={{ position: "relative",
//             background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//             color: "#64748b", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
//             🔔
//             {unreadCount > 0 && (
//               <span style={{ position: "absolute", top: "-5px", right: "-5px", minWidth: "16px", height: "16px",
//                              borderRadius: "10px", background: "#f59e0b", color: "#000", fontSize: "9px",
//                              fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 18px" }}>
//         <div style={{ marginBottom: "22px" }}>
//           <div style={{ fontSize: "24px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.4px" }}>
//             Welcome back, {user?.name?.split(" ")[0]} 👋
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569", marginTop: "3px" }}>
//             {isBroker ? "Manage your client bookings and track your commissions." : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* Stat cards */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Bookings",  value: bookings.length, icon: "🏠", color: "#c9a96e" },
//             { label: "Confirmed",       value: confirmed,        icon: "✅", color: "#22c55e" },
//             { label: "Pending Payment", value: pending,          icon: "⏳", color: "#f59e0b" },
//             ...(!isBroker ? [{ label: "Amount Invested", value: fmt(totalInvested), icon: "💰", color: "#c9a96e" }] : []),
//           ].map(({ label, value, icon, color }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && <BrokerStats bookings={bookings} fmt={fmt} />}

//         {/* Tabs */}
//         <div style={{ display: "flex", gap: "4px", marginBottom: "18px", background: "rgba(255,255,255,0.03)",
//                       padding: "4px", borderRadius: "10px", overflowX: "auto" }}>
//           {tabs.map((t) => (
//             <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
//               padding: "7px 16px", borderRadius: "7px", cursor: "pointer",
//               fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap",
//               background: activeTab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
//               color:      activeTab === t.id ? "#c9a96e" : "#64748b",
//               border:     activeTab === t.id ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {t.label}
//               {t.count > 0 && (
//                 <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "20px", fontSize: "11px",
//                                background: activeTab === t.id ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.07)",
//                                color: activeTab === t.id ? "#c9a96e" : "#475569" }}>
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Bookings tab */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}><div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading bookings...</div>}
//             {error && (
//               <div style={{ padding: "14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
//                             borderRadius: "10px", color: "#fca5a5", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
//                 <span>⚠ {error}</span>
//                 <button onClick={fetchBookings} style={{ background: "none", border: "none", color: "#c9a96e", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>Retry</button>
//               </div>
//             )}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner milestoneMap={milestoneMap} fmt={fmt} onNavigate={navigate} />
//             )}
//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏠</div>
//                 <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div style={{ fontSize: "13px", color: "#475569", marginBottom: "20px" }}>
//                   {isBroker ? "Book a unit for your clients from the unit page." : "Browse available units to make your first booking."}
//                 </div>
//                 <button onClick={() => navigate("/")} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Browse Units →</button>
//               </div>
//             )}
//             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//               {!loading && bookings.map((b) => (
//                 <BookingCard key={b.id} booking={b} onPay={handlePay} onCancel={handleCancel}
//                   isBroker={isBroker} fmt={fmt} token={user?.token} />
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab wishlist={wishlist} wishedIds={wishedIds} onToggle={handleWishlistToggle}
//             loading={wishLoading} token={user?.token} onNavigate={navigate} fmt={fmt} />
//         )}
//         {activeTab === "payments" && <PaymentsTab payments={payments} loading={paymentsLoading} fmt={fmt} />}

//         {/* ── FIX 3: InvoicesTab — removed undefined 'settings' prop ── */}
//         {activeTab === "invoices" && <InvoicesTab user={user} fmt={fmt} />}

//         {activeTab === "notifications" && (
//           <NotificationsTab notifications={notifications} loading={notifsLoading} unreadCount={unreadCount}
//             onMarkRead={markRead} onMarkAllRead={markAllRead} onNavigate={navigate} onSwitchToBookings={switchToBookings} />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab feedbacks={feedbacks} bookings={bookings} token={user?.token}
//             showToast={showToast} onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])} />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "profile"  && <ProfilePanel user={user} onSaved={handleSaved} showToast={showToast} />}
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";
// import InvoicesTab from "./InvoicesTab";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// const makeFmt =
//   (symbol = "₹", code = "INR", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol} ${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Confirmed"       },
//   pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Pending Payment" },
//   cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Cancelled"       },
// };
// const COMM_CFG = {
//   pending:  { color: "#f59e0b", label: "Pending Approval" },
//   approved: { color: "#3b82f6", label: "Approved"         },
//   paid:     { color: "#22c55e", label: "Paid"             },
//   rejected: { color: "#ef4444", label: "Rejected"         },
// };

// // ── Helper: get the "true" amount for a milestone (with tax if available) ─────
// const msAmount = (m) => parseFloat(m.total_with_tax ?? m.amount ?? 0);

// // ── Milestone Tracker ─────────────────────────────────────────────────────────
// const MilestoneTracker = ({ bookingId, token, fmt, booking }) => {
//   const [data,    setData]    = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => { setData(d); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan  = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div style={{ color: "#475569", fontSize: "13px", padding: "10px",
//                       background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
//           💰 Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     // Use total_amount (grand total with tax) as base for % calculations
//     const grandTotal = parseFloat(booking.total_amount || price);
//     return (
//       <div style={{ marginTop: "8px" }}>
//         <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700",
//                       letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
//           Payment Schedule — {plan.name}
//           <span style={{ fontWeight: "400", color: "#475569", marginLeft: "6px", fontSize: "10px" }}>(estimated, incl. taxes)</span>
//         </div>
//         {plan.milestones.map((m, i) => {
//           // Use % of grand total so tax is included
//           const amt = m.percentage
//             ? Math.round((grandTotal * m.percentage) / 100)
//             : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue  = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow key={i} label={m.label} percentage={m.percentage}
//               amount={amt} isPaid={isPaid} isDue={isDue} index={i} fmt={fmt} />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading)
//     return <div style={{ color: "#475569", fontSize: "12px", padding: "10px" }}>Loading payment schedule...</div>;

//   const { milestones } = data;

//   // ── FIX: use total_with_tax for all milestone amounts ─────────────────────
//   const totalAmount = milestones.reduce((s, m) => s + msAmount(m), 0);
//   const paidAmount  = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + msAmount(m), 0);
//   const balanceDue  = totalAmount - paidAmount;
//   const pct         = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

//   return (
//     <div style={{ marginTop: "8px" }}>
//       <div style={{ marginBottom: "14px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
//           <span>Payment Progress (incl. taxes)</span><span>{pct}% complete</span>
//         </div>
//         <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", height: "6px", overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${pct}%`, borderRadius: "20px",
//                         background: "linear-gradient(90deg,#c9a96e,#a07840)", transition: "width 0.4s" }} />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "4px" }}>
//           <span style={{ color: "#22c55e" }}>Paid: {fmt(paidAmount)}</span>
//           <span style={{ color: balanceDue > 0 ? "#f59e0b" : "#22c55e" }}>
//             {balanceDue > 0 ? `Balance: ${fmt(balanceDue)}` : "✓ Fully Paid"}
//           </span>
//         </div>
//       </div>

//       {milestones.map((m, i) => {
//         const isPaid    = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived  = m.status === "waived";
//         const isDue     = !isPaid && !isWaived &&
//           i === milestones.findIndex((x) => x.status === "pending" || x.status === "overdue");

//         // Show tax breakdown hint if available
//         const hasTax = (m.tax_amount || 0) > 0;

//         return (
//           <MilestoneRow
//             key={m.id}
//             label={m.label}
//             percentage={m.percentage}
//             amount={msAmount(m)}               // ← total_with_tax
//             baseAmount={m.amount}
//             taxAmount={m.tax_amount}
//             taxLabel={m.tax_label}
//             taxRate={m.tax_rate}
//             hasTax={hasTax}
//             isPaid={isPaid}
//             isDue={isDue}
//             isOverdue={isOverdue}
//             isWaived={isWaived}
//             dueDate={m.due_date}
//             paidAt={m.paid_at}
//             index={i}
//             fmt={fmt}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({
//   label, percentage, amount, baseAmount, taxAmount, taxLabel, taxRate, hasTax,
//   isPaid, isDue, isOverdue, isWaived, dueDate, paidAt, index, fmt,
// }) => {
//   const [showTax, setShowTax] = useState(false);
//   const color = isPaid ? "#c9a96e" : isOverdue ? "#ef4444" : isWaived ? "#64748b" : isDue ? "#e2e8f0" : "#475569";

//   return (
//     <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "8px" }}>
//       <div style={{
//         width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
//         background: isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.15)" : isDue ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.04)",
//         border: `2px solid ${isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.5)" : isDue ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: "11px", fontWeight: "800",
//         color: isPaid ? "#000" : isOverdue ? "#ef4444" : isDue ? "#c9a96e" : "#334155",
//       }}>
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div style={{
//         flex: 1, padding: "8px 12px", borderRadius: "8px",
//         background: isPaid ? "rgba(201,169,110,0.08)" : isOverdue ? "rgba(239,68,68,0.06)" : isDue ? "rgba(201,169,110,0.04)" : "rgba(255,255,255,0.02)",
//         border: `1px solid ${isPaid ? "rgba(201,169,110,0.25)" : isOverdue ? "rgba(239,68,68,0.2)" : isDue ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.05)"}`,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color }}>{label}</div>
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "1px" }}>
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? "8px" : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "4px" }}>⚠ Overdue</span>}
//                 </span>
//               )}
//               {isPaid && paidAt && <span style={{ color: "#22c55e", marginLeft: "4px" }}>✓ Paid {paidAt}</span>}
//               {isDue && !isOverdue && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>← Due now</span>}
//               {isWaived && <span style={{ color: "#64748b", marginLeft: "8px" }}>Waived</span>}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
//             <div style={{ fontSize: "15px", fontWeight: "800", color }}>{fmt(amount)}</div>
//             {/* Tax breakdown toggle */}
//             {hasTax && (
//               <button
//                 type="button"
//                 onClick={() => setShowTax((s) => !s)}
//                 style={{ fontSize: "10px", color: "#f59e0b", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "2px" }}
//               >
//                 {taxLabel || "Tax"} {taxRate > 0 ? `${taxRate}%` : ""} {showTax ? "▲" : "▼"}
//               </button>
//             )}
//           </div>
//         </div>
//         {/* Tax breakdown expanded */}
//         {hasTax && showTax && (
//           <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "11px" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "2px" }}>
//               <span>Base amount</span><span>{fmt(baseAmount)}</span>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", color: "#f59e0b" }}>
//               <span>{taxLabel || "Tax"}{taxRate > 0 ? ` (${taxRate}%)` : ""}</span>
//               <span>{fmt(taxAmount)}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ───────────────────────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmt, onNavigate }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId, displayAmount: msAmount(m) })),  // ← total_with_tax
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;
//   const overdueCount = dues.filter((d) => d.status === "overdue").length;

//   return (
//     <div style={{
//       marginBottom: "20px",
//       background: overdueCount > 0 ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
//       border: `1px solid ${overdueCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
//       borderRadius: "14px", padding: "16px 18px",
//     }}>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
//         <div style={{ fontSize: "13px", fontWeight: "700", color: overdueCount > 0 ? "#ef4444" : "#f59e0b" }}>
//           💳 Upcoming Payments
//           {overdueCount > 0 && (
//             <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "10px",
//                            background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "11px", fontWeight: "700" }}>
//               {overdueCount} overdue
//             </span>
//           )}
//         </div>
//         <div style={{ fontSize: "12px", color: "#64748b" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {dues.map((d, i) => (
//           <div key={i} style={{
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
//             background: d.status === "overdue" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.06)",
//             border: `1px solid ${d.status === "overdue" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)"}`,
//           }} onClick={() => onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)}>
//             <div>
//               <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{d.label}</div>
//               <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "8px" }}>⚠ Overdue</span>}
//                 <span style={{ color: "#475569", marginLeft: "8px" }}>· Booking #{d.bookingId}</span>
//                 {(d.tax_amount || 0) > 0 && (
//                   <span style={{ color: "#f59e0b", marginLeft: "8px" }}>incl. {d.tax_label || "tax"}</span>
//                 )}
//               </div>
//             </div>
//             <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
//               <div style={{ fontSize: "16px", fontWeight: "800", color: d.status === "overdue" ? "#ef4444" : "#f59e0b" }}>
//                 {fmt(d.displayAmount)}  {/* ← total_with_tax */}
//               </div>
//               <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Tap to pay →</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Booking Card ──────────────────────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmt, token }) => {
//   const [expanded,      setExpanded]      = useState(false);
//   const [cancelling,    setCancelling]    = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);

//   const cfg         = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan        = booking.payment_plan;
//   const isConfirmed = booking.booking_status === "confirmed";
//   const isPending   = booking.booking_status === "pending";

//   // ── FIX: use total_with_tax for all milestone sum calculations ────────────
//   const paidMilestones = (booking.milestones || []).filter((m) => m.status === "paid");
//   const paidTotal      = paidMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const allMilestones  = booking.milestones || [];
//   const totalFromMs    = allMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const balanceFromMs  = totalFromMs - paidTotal;

//   // Grand total = booking.total_amount (stored with tax) or fallback to milestones sum
//   const grandTotal = parseFloat(booking.total_amount || 0) || totalFromMs;

//   const displayAmt = (() => {
//     if (isConfirmed && paidTotal > 0) return paidTotal;
//     if (isConfirmed) return grandTotal;
//     // Pending — show down payment (already stored with tax)
//     const dp = parseFloat(booking.down_payment_amount || 0);
//     if (dp > 0) return dp;
//     return grandTotal;
//   })();

//   const amountLabel = isPending
//     ? "Down Payment Due"
//     : isConfirmed && paidTotal > 0
//       ? `Paid (${paidMilestones.length} milestone${paidMilestones.length > 1 ? "s" : ""})`
//       : isConfirmed ? "Total Amount" : "Amount";

//   return (
//     <div id={`booking-card-${booking.id}`} style={{
//       background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//       border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px",
//       overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.3s",
//     }}
//       onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")}
//       onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
//           <div style={{ flex: 1 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//               <span style={{ fontSize: "17px", fontWeight: "800", color: "#e2e8f0" }}>Unit {booking.plot_number}</span>
//               <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
//                              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                 {cfg.label}
//               </span>
//             </div>
//             <div style={{ marginTop: "3px", fontSize: "12px", color: "#64748b", display: "flex", gap: "10px", flexWrap: "wrap" }}>
//               <span>{booking.plot_type}</span>
//               {booking.area      && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div style={{ marginTop: "6px", padding: "6px 10px", background: "rgba(201,169,110,0.06)",
//                             border: "1px solid rgba(201,169,110,0.12)", borderRadius: "8px", fontSize: "12px" }}>
//                 <span style={{ color: "#64748b" }}>Client: </span>
//                 <span style={{ color: "#c9a96e", fontWeight: "600" }}>{booking.client_name}</span>
//                 {booking.client_phone && <span style={{ color: "#64748b" }}> · {booking.client_phone}</span>}
//                 {booking.client_email && <span style={{ color: "#64748b" }}> · {booking.client_email}</span>}
//               </div>
//             )}
//             <div style={{ marginTop: "4px", fontSize: "11px", color: "#334155" }}>
//               #{booking.id} · {new Date(booking.created_at).toLocaleDateString("en-IN", {
//                 day: "numeric", month: "short", year: "numeric",
//               })}
//             </div>
//           </div>

//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: "11px", color: "#475569", marginBottom: "2px" }}>{amountLabel}</div>
//             <div style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}>{fmt(displayAmt)}</div>

//             {/* Balance due line */}
//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs > 0.01 && (
//               <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "2px" }}>
//                 Balance: {fmt(balanceFromMs)}
//               </div>
//             )}
//             {/* Fully paid line */}
//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs <= 0.01 && (
//               <div style={{ fontSize: "11px", color: "#22c55e", marginTop: "2px" }}>✓ Fully paid (incl. tax)</div>
//             )}
//             {/* Pending total */}
//             {isPending && grandTotal > 0 && (
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Grand total: {fmt(grandTotal)}</div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px",
//                         padding: "7px 12px", background: "rgba(201,169,110,0.06)",
//                         border: "1px solid rgba(201,169,110,0.15)", borderRadius: "8px" }}>
//             <span style={{ fontSize: "13px" }}>💰</span>
//             <span style={{ fontSize: "12px", color: "#64748b" }}>Commission:</span>
//             <span style={{ fontSize: "13px", fontWeight: "800", color: "#c9a96e" }}>{fmt(booking.commission_amount)}</span>
//             {booking.commission_status && (() => {
//               const cs = COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//               return <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: cs.color }}>{cs.label}</span>;
//             })()}
//           </div>
//         )}

//         <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
//           {isPending && (
//             <button onClick={() => onPay(booking.id)} style={{
//               padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none",
//             }}>💳 Complete Payment</button>
//           )}
//           <button onClick={() => setExpanded((e) => !e)} style={{
//             padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//             fontSize: "12px", background: "transparent", color: "#64748b",
//             border: "1px solid rgba(255,255,255,0.08)",
//           }}>
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button onClick={() => setConfirmCancel(true)} style={{
//               padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "12px", background: "transparent", color: "#ef4444",
//               border: "1px solid rgba(239,68,68,0.25)", marginLeft: "auto",
//             }}>✕ Cancel</button>
//           )}
//           {isPending && confirmCancel && (
//             <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
//               <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sure?</span>
//               <button disabled={cancelling} onClick={async () => {
//                 setCancelling(true); await onCancel(booking.id); setCancelling(false); setConfirmCancel(false);
//               }} style={{ padding: "7px 14px", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "700",
//                           background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button onClick={() => setConfirmCancel(false)} style={{
//                 padding: "7px 10px", borderRadius: "7px", cursor: "pointer",
//                 fontSize: "12px", background: "transparent", color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}>No</button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div style={{ padding: "0 20px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
//           <MilestoneTracker bookingId={booking.id} token={token} fmt={fmt} booking={booking} />
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Panel ─────────────────────────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast }) => {
//   const [form, setForm] = useState({
//     name: user.name || "", phone: user.phone || "",
//     current_password: "", new_password: "", confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500); return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) { payload.current_password = form.current_password; payload.new_password = form.new_password; }
//       const res  = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Update failed");
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";
//   const inp = (placeholder, key, type = "text", readOnly = false) => (
//     <input type={type} placeholder={placeholder} value={form[key] ?? ""} readOnly={readOnly}
//       onChange={(e) => !readOnly && setForm((f) => ({ ...f, [key]: e.target.value }))}
//       style={{
//         width: "100%", padding: "10px 14px", marginBottom: "10px",
//         background: readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
//         border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
//         color: readOnly ? "#475569" : "#e2e8f0", fontSize: "13px", outline: "none",
//         boxSizing: "border-box", cursor: readOnly ? "not-allowed" : "text",
//       }}
//     />
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
//           <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "800", color: "#000", flexShrink: 0 }}>
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}>{user.name}</div>
//             <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{user.email}</div>
//             <div style={{ fontSize: "12px", color: "#c9a96e", marginTop: "2px", fontWeight: "600", textTransform: "capitalize" }}>
//               {isBroker ? `🤝 Broker${user.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//         </div>
//         {isBroker && (
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
//             {[
//               { label: "Commission Rate", value: `${user.commission_rate || 2}%` },
//               { label: "Account Status", value: user.status || "active", color: user.status === "active" ? "#22c55e" : "#ef4444" },
//             ].map(({ label, value, color }) => (
//               <div key={label} style={{ padding: "10px 14px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)", borderRadius: "8px" }}>
//                 <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
//                 <div style={{ fontSize: "14px", fontWeight: "700", color: color || "#c9a96e", marginTop: "2px" }}>{value}</div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px" }}>✏️ Edit Profile</div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Full Name *", "name")}</div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input value={user.email} readOnly placeholder="Email" style={{
//               width: "100%", padding: "10px 14px", marginBottom: "10px",
//               background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
//               borderRadius: "8px", color: "#475569", fontSize: "13px", outline: "none",
//               boxSizing: "border-box", cursor: "not-allowed",
//             }} />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Phone Number", "phone", "tel")}</div>
//         </div>
//         <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px", marginTop: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
//           Change Password (leave blank to keep current)
//         </div>
//         {inp("Current Password", "current_password", "password")}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div>{inp("New Password", "new_password", "password")}</div>
//           <div>{inp("Confirm Password", "confirm_password", "password")}</div>
//         </div>
//         <button onClick={handleSave} disabled={saving || !form.name} style={{
//           width: "100%", padding: "11px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer",
//           background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none",
//           fontWeight: "700", fontSize: "13px", marginTop: "4px", opacity: saving ? 0.7 : 1,
//         }}>
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Stats ──────────────────────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmt }) => {
//   const commPending  = bookings.filter((b) => b.commission_status === "pending").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings.filter((b) => b.commission_status === "approved").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid     = bookings.filter((b) => b.commission_status === "paid").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//       {[
//         { label: "Pending Commission",  value: fmt(commPending),  color: "#f59e0b", icon: "⏳" },
//         { label: "Approved Commission", value: fmt(commApproved), color: "#3b82f6", icon: "✅" },
//         { label: "Commission Paid",     value: fmt(commPaid),     color: "#22c55e", icon: "💰" },
//         { label: "Total Clients",       value: bookings.length,   color: "#c9a96e", icon: "👥" },
//       ].map(({ label, value, color, icon }) => (
//         <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//           <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//           <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications ─────────────────────────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder:  { icon: "💳", color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Payment Reminder"  },
//   booking_confirmed: { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Booking Confirmed" },
//   booking_cancelled: { icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Booking Cancelled" },
//   project_launch:    { icon: "🏗️", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "Project Launch"    },
//   offer:             { icon: "🎁", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)",  label: "Special Offer"     },
//   general:           { icon: "🔔", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "General"           },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate, onSwitchToBookings }) => {
//   const cfg = notif ? NOTIF_CFG[notif.type] || NOTIF_CFG.general : NOTIF_CFG.general;

//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);

//   if (!notif) return null;

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   };

//   const handleViewBooking = () => {
//     onClose();
//     if (notif.type === "payment_reminder") onNavigate(`/payment/${notif.booking_id}`);
//     else onSwitchToBookings(notif.booking_id);
//   };

//   return (
//     <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000,
//       background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
//       display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
//       <div onClick={(e) => e.stopPropagation()} style={{
//         background: "linear-gradient(135deg,#0f0f1e,#12121f)",
//         border: `1px solid ${cfg.color}33`, borderTop: `3px solid ${cfg.color}`,
//         borderRadius: "16px", maxWidth: "520px", width: "100%",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
//         <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
//               <div style={{ width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div style={{ fontSize: "15px", fontWeight: "800", color: "#e2e8f0", lineHeight: "1.3" }}>{notif.title}</div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                   <span style={{ fontSize: "11px", color: "#475569" }}>🕐 {timeAgo(notif.created_at)}</span>
//                 </div>
//               </div>
//             </div>
//             <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.75", whiteSpace: "pre-line",
//                         background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
//                         borderRadius: "10px", padding: "16px" }}>
//             {notif.message}
//           </div>
//           <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
//             {notif.booking_id && (
//               <button onClick={handleViewBooking} style={{ padding: "9px 20px", borderRadius: "8px", cursor: "pointer",
//                 fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none" }}>
//                 {notif.type === "payment_reminder" ? "💳 Complete Payment →" : "📋 View Booking →"}
//               </button>
//             )}
//             <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "13px", background: "transparent", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({ notifications, loading, unreadCount, onMarkRead, onMarkAllRead, onNavigate, onSwitchToBookings }) => {
//   const [filter, setFilter] = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);

//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read")   return  n.is_read;
//     return true;
//   });

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
//   };

//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading notifications...
//     </div>
//   );

//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal notif={selectedNotif} onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead} onNavigate={onNavigate} onSwitchToBookings={onSwitchToBookings} />
//       )}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
//         <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "8px" }}>
//           {[["all","All"],["unread","Unread"],["read","Read"]].map(([val, label]) => (
//             <button key={val} onClick={() => setFilter(val)} style={{
//               padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
//               background: filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//               color: filter === val ? "#c9a96e" : "#64748b",
//               border: filter === val ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span style={{ marginLeft: "5px", padding: "0 5px", borderRadius: "10px",
//                                fontSize: "10px", background: "#f59e0b", color: "#000", fontWeight: "800" }}>
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button onClick={onMarkAllRead} style={{ padding: "6px 14px", borderRadius: "7px", cursor: "pointer",
//             fontSize: "12px", fontWeight: "600", background: "rgba(201,169,110,0.08)",
//             color: "#c9a96e", border: "1px solid rgba(201,169,110,0.2)" }}>✓ Mark all read</button>
//         )}
//       </div>
//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>
//           <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//             {filter === "unread" ? "No unread notifications" : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>Payment reminders and booking updates will appear here.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {filtered.map((n) => {
//           const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.general;
//           return (
//             <div key={n.id} onClick={() => setSelectedNotif(n)} style={{
//               display: "flex", gap: "14px", alignItems: "flex-start",
//               padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
//               background: n.is_read ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`,
//               border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"}`,
//               transition: "all 0.2s", position: "relative",
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color + "55"; e.currentTarget.style.transform = "translateY(-1px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.borderColor = n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"; e.currentTarget.style.transform = "none"; }}
//             >
//               {!n.is_read && (
//                 <div style={{ position: "absolute", top: "14px", right: "14px", width: "8px", height: "8px",
//                               borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
//               )}
//               <div style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "13px", fontWeight: n.is_read ? "600" : "700", color: n.is_read ? "#94a3b8" : "#e2e8f0" }}>
//                     {n.title}
//                   </span>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 7px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                 </div>
//                 <div style={{ fontSize: "12px", color: n.is_read ? "#475569" : "#94a3b8", lineHeight: "1.5", marginBottom: "6px" }}>
//                   {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "11px", color: "#334155" }}>🕐 {timeAgo(n.created_at)}</span>
//                   <span style={{ fontSize: "11px", color: cfg.color, fontWeight: "600" }}>Click to read →</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Payments Tab ──────────────────────────────────────────────────────────────
// const GW_CFG = {
//   razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
//   stripe:   { icon: "💎", color: "#8b5cf6", label: "Stripe"   },
//   phonepe:  { icon: "📱", color: "#f59e0b", label: "PhonePe"  },
//   cash:     { icon: "💵", color: "#22c55e", label: "Cash"     },
//   manual:   { icon: "🏦", color: "#64748b", label: "Manual"   },
// };
// const TXN_STATUS = {
//   success:  { color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Success"  },
//   pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Pending"  },
//   failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Failed"   },
//   refunded: { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", label: "Refunded" },
// };

// const PaymentsTab = ({ payments, loading, fmt }) => {
//   const totalPaid    = payments.filter((p) => p.status === "success").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
//   const successCount = payments.filter((p) => p.status === "success").length;
//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading payment history...
//     </div>
//   );
//   return (
//     <div>
//       {payments.length > 0 && (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Paid (incl. tax)", value: fmt(totalPaid),                                        color: "#22c55e", icon: "💰" },
//             { label: "Transactions",           value: successCount,                                           color: "#c9a96e", icon: "🧾" },
//             { label: "Pending",                value: payments.filter((p) => p.status === "pending").length, color: "#f59e0b", icon: "⏳" },
//           ].map(({ label, value, color, icon }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       )}
//       {payments.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
//           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No payment history yet</div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>Your payment transactions will appear here once you make a booking payment.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {payments.map((p) => {
//           const gw  = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
//           const txn = TXN_STATUS[p.status] || TXN_STATUS.pending;
//           return (
//             <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
//                                       borderRadius: "12px", padding: "16px 18px", borderLeft: `3px solid ${txn.color}` }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
//                     <span style={{ fontSize: "16px" }}>{gw.icon}</span>
//                     <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{gw.label}</span>
//                     <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
//                                    background: txn.bg, color: txn.color, border: `1px solid ${txn.color}33` }}>{txn.label}</span>
//                     {p._synthetic && (
//                       <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
//                                      background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
//                         🏢 Walk-in / Cash
//                       </span>
//                     )}
//                     {!p._synthetic && p.mode && p.mode !== "online" && (
//                       <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "10px",
//                                      background: "rgba(255,255,255,0.05)", color: "#64748b",
//                                      border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize" }}>
//                         {p.mode}
//                       </span>
//                     )}
//                   </div>
//                   {p.booking && (
//                     <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
//                       🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
//                     </div>
//                   )}
//                   {(p.gateway_payment_id || p.gateway_order_id) && (
//                     <div style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace" }}>
//                       Ref: {p.gateway_payment_id || p.gateway_order_id}
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ textAlign: "right", flexShrink: 0 }}>
//                   <div style={{ fontSize: "20px", fontWeight: "800", color: txn.color }}>{fmt(p.amount)}</div>
//                   <div style={{ fontSize: "11px", color: "#888", marginTop: "1px" }}>incl. taxes</div>
//                   <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//                     {p.paid_at
//                       ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
//                       : new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                   </div>
//                 </div>
//               </div>
//               {p.notes && (
//                 <div style={{ marginTop: "8px", fontSize: "12px", color: "#475569", padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
//                   📝 {p.notes}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ──────────────────────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { icon: "💬", color: "#6c757d" },
//   service: { icon: "🛎️", color: "#3b82f6" },
//   unit:    { icon: "🏠", color: "#c9a96e" },
//   payment: { icon: "💳", color: "#f59e0b" },
//   staff:   { icon: "👤", color: "#8b5cf6" },
// };
// const StarRating = ({ value, onChange }) => (
//   <div style={{ display: "flex", gap: "4px" }}>
//     {[1,2,3,4,5].map((s) => (
//       <button key={s} type="button" onClick={() => onChange(s)} style={{
//         background: "none", border: "none", cursor: "pointer", fontSize: "24px",
//         padding: "0 2px", color: s <= value ? "#c9a96e" : "rgba(255,255,255,0.15)", transition: "color 0.15s",
//       }}>★</button>
//     ))}
//   </div>
// );

// const FeedbackTab = ({ feedbacks, bookings, token, onSubmitted, showToast }) => {
//   const [showForm,   setShowForm]   = useState(false);
//   const [form,       setForm]       = useState({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) { showToast("⚠️ Subject and message are required", "warning", 3500); return; }
//     setSubmitting(true);
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ ...form, booking_id: form.booking_id || undefined }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast("🙏 Thank you! Your feedback has been submitted", "success", 4000);
//       setForm({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSubmitting(false);
//   };

//   const inp = (style = {}) => ({
//     width: "100%", padding: "10px 14px", marginBottom: "10px",
//     background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box", ...style,
//   });

//   const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed");

//   return (
//     <div>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//         <div>
//           <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>Your Feedback</div>
//           <div style={{ fontSize: "12px", color: "#475569" }}>Share your experience with us</div>
//         </div>
//         <button onClick={() => setShowForm((f) => !f)} style={{
//           padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
//           background: showForm ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#c9a96e,#a07840)",
//           color: showForm ? "#64748b" : "#fff", border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
//         }}>{showForm ? "✕ Cancel" : "+ New Feedback"}</button>
//       </div>
//       {showForm && (
//         <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
//           <div style={{ fontSize: "13px", fontWeight: "700", color: "#c9a96e", marginBottom: "16px" }}>✍️ New Feedback</div>
//           <div style={{ marginBottom: "14px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rating *</div>
//             <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
//               {["","Very Poor","Poor","Average","Good","Excellent"][form.rating]}
//             </div>
//           </div>
//           <div style={{ marginBottom: "10px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category *</div>
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => (
//                 <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} style={{
//                   padding: "5px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
//                   background: form.category === cat ? `${cfg.color}22` : "rgba(255,255,255,0.03)",
//                   color: form.category === cat ? cfg.color : "#64748b",
//                   border: `1px solid ${form.category === cat ? cfg.color + "55" : "rgba(255,255,255,0.08)"}`,
//                   textTransform: "capitalize",
//                 }}>{cfg.icon} {cat}</button>
//               ))}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select value={form.booking_id} onChange={(e) => setForm((f) => ({ ...f, booking_id: e.target.value }))}
//               style={{ ...inp(), marginBottom: "10px" }}>
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => <option key={b.id} value={b.id}>Unit {b.plot_number} — Booking #{b.id}</option>)}
//             </select>
//           )}
//           <input type="text" placeholder="Subject *" value={form.subject}
//             onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inp()} />
//           <textarea placeholder="Your message..." value={form.message}
//             onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4} style={{ ...inp(), resize: "vertical" }} />
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button onClick={handleSubmit} disabled={submitting} style={{
//               padding: "10px 22px", borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
//               fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               color: "#fff", border: "none", opacity: submitting ? 0.7 : 1,
//             }}>{submitting ? "Submitting…" : "Submit Feedback →"}</button>
//             <button onClick={() => setShowForm(false)} style={{ padding: "10px 14px", borderRadius: "8px",
//               cursor: "pointer", fontSize: "13px", background: "transparent", color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
//           </div>
//         </div>
//       )}
//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
//           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No feedback yet</div>
//           <div style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>Share your experience to help us improve.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {feedbacks.map((fb) => {
//           const catCfg     = CATEGORY_CFG[fb.category] || CATEGORY_CFG.general;
//           const ratingColor = fb.rating >= 4 ? "#22c55e" : fb.rating >= 3 ? "#f59e0b" : "#ef4444";
//           return (
//             <div key={fb.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
//               <div style={{ padding: "14px 16px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
//                       <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{fb.subject}</span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px",
//                                      background: `${catCfg.color}22`, color: catCfg.color,
//                                      border: `1px solid ${catCfg.color}33`, textTransform: "capitalize" }}>
//                         {catCfg.icon} {fb.category}
//                       </span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px", fontWeight: "700", textTransform: "capitalize",
//                                      background: fb.status === "resolved" ? "rgba(34,197,94,0.1)" : fb.status === "reviewed" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
//                                      color: fb.status === "resolved" ? "#22c55e" : fb.status === "reviewed" ? "#3b82f6" : "#f59e0b" }}>
//                         {fb.status}
//                       </span>
//                     </div>
//                     <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                     </div>
//                   </div>
//                   <div style={{ color: ratingColor, fontSize: "16px", fontWeight: "800", flexShrink: 0 }}>{"★".repeat(fb.rating)}</div>
//                 </div>
//                 <div style={{ marginTop: "8px", fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>{fb.message}</div>
//                 {fb.admin_reply && (
//                   <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px" }}>
//                     <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 Admin Reply</div>
//                     <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", whiteSpace: "pre-line" }}>{fb.admin_reply}</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ─────────────────────────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user     = useSelector(selectUser);

//   const [bookings,        setBookings]        = useState([]);
//   const [milestoneMap,    setMilestoneMap]    = useState({});
//   const [loading,         setLoading]         = useState(true);
//   const [error,           setError]           = useState("");
//   const [activeTab,       setActiveTab]       = useState("bookings");
//   const [notifications,   setNotifications]   = useState([]);
//   const [notifsLoading,   setNotifsLoading]   = useState(false);
//   const [unreadCount,     setUnreadCount]     = useState(0);
//   const [feedbacks,       setFeedbacks]       = useState([]);
//   const [payments,        setPayments]        = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages,  setUnreadMessages]  = useState(0);
//   const [invoices,        setInvoices]        = useState([]);

//   const { showToast } = useToast();
//   const { wishlist, wishedIds, toggle: toggleWishRaw, loading: wishLoading } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(async (plotId) => {
//     const wasWished = wishedIds instanceof Set && wishedIds.has(Number(plotId));
//     await toggleWishRaw(Number(plotId));
//     showToast(wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//               wasWished ? "wishlist_remove" : "wishlist_add", 2800);
//   }, [wishedIds, toggleWishRaw, showToast]);

//   const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", position: "before" });
//   const fmt      = useCallback((n) => makeFmt(currency.symbol, currency.code, currency.position)(n), [currency]);
//   const isBroker = user?.role === "broker";

//   const fetchMilestones = useCallback(async (bookingsList) => {
//     const targets = bookingsList.filter((b) => b.booking_status === "confirmed" && b.payment_plan_id);
//     if (!targets.length) return;
//     const results = await Promise.all(
//       targets.map((b) =>
//         fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//           headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//         }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
//       ),
//     );
//     const map = {};
//     targets.forEach((b, i) => { if (results[i]) map[b.id] = results[i]; });
//     setMilestoneMap(map);
//   }, [user?.token]);

//   const switchToBookings = useCallback((bookingId) => {
//     setActiveTab("bookings");
//     if (!bookingId) return;
//     setTimeout(() => {
//       const el = document.getElementById(`booking-card-${bookingId}`);
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//         el.style.boxShadow = "0 0 0 2px #c9a96e, 0 0 24px rgba(201,169,110,0.35)";
//         el.style.transition = "box-shadow 0.3s";
//         setTimeout(() => { el.style.boxShadow = ""; }, 3000);
//       }
//     }, 150);
//   }, []);

//   const fetchInvoices = useCallback(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/invoices`, {
//         headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       setInvoices(Array.isArray(data) ? data : []);
//     } catch (_) {}
//   }, [user?.token]);

//   const fetchBookings = useCallback(async () => {
//     setLoading(true); setError("");
//     try {
//       const res  = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally { setLoading(false); }
//   }, [user?.token, fetchMilestones, showToast]);

//   const fetchPayments = useCallback(async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//         fetch(`${API_BASE}/bookings`,         { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//       ]);
//       const txns     = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books    = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList  = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter((b) => b.booking_status === "confirmed" && !txnBookingIds.has(String(b.id)))
//         .map((b) => ({
//           id: `booking_${b.id}`, booking_id: b.id,
//           // Use down_payment_amount (includes tax) for the missing txn display
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR", status: "success", mode: "manual",
//           gateway: "cash / manual", paid_at: b.created_at, _synthetic: true,
//           booking: { id: b.id, plot_number: b.plot_number, plot_type: b.plot_type, booking_status: b.booking_status },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {} finally { setPaymentsLoading(false); }
//   }, [user?.token]);

//   const fetchFeedbacks = useCallback(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   }, [user?.token]);

//   const fetchNotifications = useCallback(async () => {
//     setNotifsLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {} finally { setNotifsLoading(false); }
//   }, [user?.token]);

//   useEffect(() => {
//     if (!user?.token) { navigate("/"); return; }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => { if (d) setCurrency({ symbol: d.symbol || "₹", code: d.code || "INR", position: d.position || "before" }); })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//       fetchInvoices(),
//     ]);

//     const params    = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     if (bookingId && sessionId) {
//       const confirmPayment = async () => {
//         try {
//           await fetch(`${API_BASE}/payment/stripe/confirm`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//             body: JSON.stringify({ booking_id: bookingId, session_id: sessionId }),
//           });
//           await Promise.all([fetchBookings(), fetchNotifications(), fetchPayments(), fetchInvoices()]);
//           showToast("🎉 Payment confirmed! Your booking is now active.", "booking", 5000);
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, { headers: { Authorization: `Bearer ${user.token}` } })
//       .then((r) => r.json()).then((d) => setUnreadMessages(d.unread || 0)).catch(() => {});
//   }, [user?.token]);

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const handlePay    = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 600);
//   };
//   const handleSaved  = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res  = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, booking_status: "cancelled" } : b));
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//   };

//   const confirmed = bookings.filter((b) => b.booking_status === "confirmed").length;
//   const pending   = bookings.filter((b) => b.booking_status === "pending").length;

//   // ── FIX: totalInvested uses total_with_tax from milestones API ────────────
//   // Prefer milestoneMap (has tax-inclusive totals) over booking-level fields
//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => {
//       const msData = milestoneMap[b.id];
//       if (msData?.milestones?.length) {
//         // Sum paid milestones using total_with_tax
//         const paidSum = msData.milestones
//           .filter((m) => m.status === "paid")
//           .reduce((ms, m) => ms + msAmount(m), 0);
//         if (paidSum > 0) return s + paidSum;
//         // No paid milestones yet but booking confirmed — use down_payment_amount
//         return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//       }
//       // No milestone data — use stored total (already includes tax from BookingsController)
//       return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//     }, 0);

//   const tabs = [
//     { id: "bookings",      label: isBroker ? "Client Bookings" : "My Bookings", count: bookings.length },
//     { id: "wishlist",      label: "Wishlist",      count: wishlist.length  },
//     { id: "payments",      label: "Payments",      count: 0               },
//     { id: "invoices",      label: "Invoices",      count: invoices.length },
//     { id: "notifications", label: "Notifications", count: unreadCount     },
//     { id: "feedback",      label: "Feedback",      count: 0               },
//     { id: "messages",      label: "Messages",      count: unreadMessages  },
//     { id: "profile",       label: "My Profile",    count: 0               },
//   ];

//   return (
//     <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* Header */}
//       <div style={{ background: "rgba(8,8,18,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)",
//                     padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
//                     height: "62px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//           <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px", padding: "6px 10px", borderRadius: "6px" }}>← Back</button>
//           <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)" }} />
//           <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{isBroker ? "🤝 Broker Dashboard" : "🏠 My Dashboard"}</span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{user?.name}</div>
//             <div style={{ fontSize: "11px", color: "#475569" }}>
//               {isBroker ? `🤝 Broker${user?.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//           <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", color: "#000" }}>
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//             color: "#64748b", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
//           <button onClick={() => setActiveTab("notifications")} style={{ position: "relative",
//             background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//             color: "#64748b", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
//             🔔
//             {unreadCount > 0 && (
//               <span style={{ position: "absolute", top: "-5px", right: "-5px", minWidth: "16px", height: "16px",
//                              borderRadius: "10px", background: "#f59e0b", color: "#000", fontSize: "9px",
//                              fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 18px" }}>
//         <div style={{ marginBottom: "22px" }}>
//           <div style={{ fontSize: "24px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.4px" }}>
//             Welcome back, {user?.name?.split(" ")[0]} 👋
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569", marginTop: "3px" }}>
//             {isBroker ? "Manage your client bookings and track your commissions." : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* Stat cards */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Bookings",  value: bookings.length, icon: "🏠", color: "#c9a96e" },
//             { label: "Confirmed",       value: confirmed,        icon: "✅", color: "#22c55e" },
//             { label: "Pending Payment", value: pending,          icon: "⏳", color: "#f59e0b" },
//             ...(!isBroker ? [{ label: "Amount Invested (incl. tax)", value: fmt(totalInvested), icon: "💰", color: "#c9a96e" }] : []),
//           ].map(({ label, value, icon, color }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && <BrokerStats bookings={bookings} fmt={fmt} />}

//         {/* Tabs */}
//         <div style={{ display: "flex", gap: "4px", marginBottom: "18px", background: "rgba(255,255,255,0.03)",
//                       padding: "4px", borderRadius: "10px", overflowX: "auto" }}>
//           {tabs.map((t) => (
//             <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
//               padding: "7px 16px", borderRadius: "7px", cursor: "pointer",
//               fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap",
//               background: activeTab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
//               color:      activeTab === t.id ? "#c9a96e" : "#64748b",
//               border:     activeTab === t.id ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {t.label}
//               {t.count > 0 && (
//                 <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "20px", fontSize: "11px",
//                                background: activeTab === t.id ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.07)",
//                                color: activeTab === t.id ? "#c9a96e" : "#475569" }}>
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Bookings tab */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}><div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading bookings...</div>}
//             {error && (
//               <div style={{ padding: "14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
//                             borderRadius: "10px", color: "#fca5a5", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
//                 <span>⚠ {error}</span>
//                 <button onClick={fetchBookings} style={{ background: "none", border: "none", color: "#c9a96e", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>Retry</button>
//               </div>
//             )}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner milestoneMap={milestoneMap} fmt={fmt} onNavigate={navigate} />
//             )}
//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏠</div>
//                 <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div style={{ fontSize: "13px", color: "#475569", marginBottom: "20px" }}>
//                   {isBroker ? "Book a unit for your clients from the unit page." : "Browse available units to make your first booking."}
//                 </div>
//                 <button onClick={() => navigate("/")} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Browse Units →</button>
//               </div>
//             )}
//             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//               {!loading && bookings.map((b) => (
//                 <BookingCard key={b.id} booking={b} onPay={handlePay} onCancel={handleCancel}
//                   isBroker={isBroker} fmt={fmt} token={user?.token} />
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab wishlist={wishlist} wishedIds={wishedIds} onToggle={handleWishlistToggle}
//             loading={wishLoading} token={user?.token} onNavigate={navigate} fmt={fmt} />
//         )}
//         {activeTab === "payments"      && <PaymentsTab payments={payments} loading={paymentsLoading} fmt={fmt} />}
//         {activeTab === "invoices"      && <InvoicesTab user={user} fmt={fmt} />}
//         {activeTab === "notifications" && (
//           <NotificationsTab notifications={notifications} loading={notifsLoading} unreadCount={unreadCount}
//             onMarkRead={markRead} onMarkAllRead={markAllRead} onNavigate={navigate} onSwitchToBookings={switchToBookings} />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab feedbacks={feedbacks} bookings={bookings} token={user?.token}
//             showToast={showToast} onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])} />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "profile"  && <ProfilePanel user={user} onSaved={handleSaved} showToast={showToast} />}
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";
// import InvoicesTab from "./InvoicesTab";
// import PaymentsTab from "./PaymentsTab";
// import { color } from "d3";

// import { apiUrl, imgUrl } from "../apiUrl";

// const API_BASE = `${apiUrl}/api`;

// // ── Formatters ────────────────────────────────────────────────────────────────
// // fmt      → rounded, for main prices / totals shown to users (₹1,23,456)
// // fmtExact → 2 decimal places, for tax/fee line items where precision matters
// const makeFmt =
//   (symbol = "₹", code = "INR", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
//   };

// const makeFmtExact =
//   (symbol = "₹", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Confirmed"       },
//   pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Pending Payment" },
//   cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Cancelled"       },
// };
// const COMM_CFG = {
//   pending:  { color: "#f59e0b", label: "Pending Approval" },
//   approved: { color: "#3b82f6", label: "Approved"         },
//   paid:     { color: "#22c55e", label: "Paid"             },
//   rejected: { color: "#ef4444", label: "Rejected"         },
// };

// // ── Helper: exact milestone total (stored total_with_tax preferred) ────────────
// const msAmount = (m) => parseFloat(m.total_with_tax ?? m.amount ?? 0);

// // ── Milestone Tracker ─────────────────────────────────────────────────────────
// const MilestoneTracker = ({ bookingId, token, fmt, fmtExact, booking }) => {
//   const [data,    setData]    = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => { setData(d); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan  = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div style={{ color: "#475569", fontSize: "13px", padding: "10px",
//                       background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
//           💰 Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     const grandTotal  = parseFloat(booking.total_amount || price);
//     return (
//       <div style={{ marginTop: "8px" }}>
//         <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700",
//                       letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
//           Payment Schedule — {plan.name}
//           <span style={{ fontWeight: "400", color: "#475569", marginLeft: "6px", fontSize: "10px" }}>(estimated, incl. taxes)</span>
//         </div>
//         {plan.milestones.map((m, i) => {
//           const amt = m.percentage
//             ? (grandTotal * m.percentage) / 100   // keep as float — MilestoneRow will format
//             : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue  = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow key={i} label={m.label} percentage={m.percentage}
//               amount={amt} isPaid={isPaid} isDue={isDue} index={i} fmt={fmt} fmtExact={fmtExact} />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading)
//     return <div style={{ color: "#475569", fontSize: "12px", padding: "10px" }}>Loading payment schedule...</div>;

//   const { milestones } = data;

//   // Use exact stored totals for all sums — no rounding at display level
//   const totalAmount = milestones.reduce((s, m) => s + msAmount(m), 0);
//   const paidAmount  = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + msAmount(m), 0);
//   const balanceDue  = totalAmount - paidAmount;
//   const pct         = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

//   return (
//     <div style={{ marginTop: "8px" }}>
//       <div style={{ marginBottom: "14px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
//           <span>Payment Progress (incl. taxes)</span><span>{pct}% complete</span>
//         </div>
//         <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", height: "6px", overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${pct}%`, borderRadius: "20px",
//                         background: "linear-gradient(90deg,#c9a96e,#a07840)", transition: "width 0.4s" }} />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "4px" }}>
//           <span style={{ color: "#22c55e" }}>Paid: {fmtExact(paidAmount)}</span>
//           <span style={{ color: balanceDue > 0 ? "#f59e0b" : "#22c55e" }}>
//             {balanceDue > 0 ? `Balance: ${fmtExact(balanceDue)}` : "✓ Fully Paid"}
//           </span>
//         </div>
//       </div>

//       {milestones.map((m, i) => {
//         const isPaid    = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived  = m.status === "waived";
//         const isDue     = !isPaid && !isWaived &&
//           i === milestones.findIndex((x) => x.status === "pending" || x.status === "overdue");
//         const hasTax = (m.tax_amount || 0) > 0;

//         return (
//           <MilestoneRow
//             key={m.id}
//             label={m.label}
//             percentage={m.percentage}
//             amount={msAmount(m)}          // exact total_with_tax
//             baseAmount={m.amount}
//             taxAmount={m.tax_amount}
//             extraFees={m.extra_fees}
//             taxLabel={m.tax_label}
//             taxRate={m.tax_rate}
//             hasTax={hasTax}
//             isPaid={isPaid}
//             isDue={isDue}
//             isOverdue={isOverdue}
//             isWaived={isWaived}
//             dueDate={m.due_date}
//             paidAt={m.paid_at}
//             index={i}
//             fmt={fmt}
//             fmtExact={fmtExact}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({
//   label, percentage, amount, baseAmount, taxAmount, extraFees, taxLabel, taxRate, hasTax,
//   isPaid, isDue, isOverdue, isWaived, dueDate, paidAt, index, fmt, fmtExact,
// }) => {
//   const [showTax, setShowTax] = useState(false);
//   const color = isPaid ? "#c9a96e" : isOverdue ? "#ef4444" : isWaived ? "#64748b" : isDue ? "#e2e8f0" : "#475569";

//   return (
//     <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "8px" }}>
//       <div style={{
//         width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
//         background: isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.15)" : isDue ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.04)",
//         border: `2px solid ${isPaid ? "#c9a96e" : isOverdue ? "rgba(239,68,68,0.5)" : isDue ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.1)"}`,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: "11px", fontWeight: "800",
//         color: isPaid ? "#000" : isOverdue ? "#ef4444" : isDue ? "#c9a96e" : "#334155",
//       }}>
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div style={{
//         flex: 1, padding: "8px 12px", borderRadius: "8px",
//         background: isPaid ? "rgba(201,169,110,0.08)" : isOverdue ? "rgba(239,68,68,0.06)" : isDue ? "rgba(201,169,110,0.04)" : "rgba(255,255,255,0.02)",
//         border: `1px solid ${isPaid ? "rgba(201,169,110,0.25)" : isOverdue ? "rgba(239,68,68,0.2)" : isDue ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.05)"}`,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color }}>{label}</div>
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "1px" }}>
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? "8px" : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "4px" }}>⚠ Overdue</span>}
//                 </span>
//               )}
//               {isPaid && paidAt && <span style={{ color: "#22c55e", marginLeft: "4px" }}>✓ Paid {paidAt}</span>}
//               {isDue && !isOverdue && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>← Due now</span>}
//               {isWaived && <span style={{ color: "#64748b", marginLeft: "8px" }}>Waived</span>}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
//             {/* Exact amount with 2dp for milestone totals */}
//             <div style={{ fontSize: "15px", fontWeight: "800", color }}>{fmtExact(amount)}</div>
//             {hasTax && (
//               <button
//                 type="button"
//                 onClick={() => setShowTax((s) => !s)}
//                 style={{ fontSize: "10px", color: "#f59e0b", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "2px" }}
//               >
//                 {taxLabel || "Tax"}{taxRate > 0 ? ` ${taxRate}%` : ""} {showTax ? "▲" : "▼"}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Exact tax breakdown — all values at full precision */}
//         {hasTax && showTax && (
//           <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "11px" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "2px" }}>
//               <span>Base amount</span><span>{fmtExact(baseAmount)}</span>
//             </div>
//             {(extraFees || 0) > 0 && (
//               <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "2px" }}>
//                 <span>Additional fees</span><span>{fmtExact(extraFees)}</span>
//               </div>
//             )}
//             <div style={{ display: "flex", justifyContent: "space-between", color: "#f59e0b" }}>
//               <span>{taxLabel || "Tax"}{taxRate > 0 ? ` (${taxRate}%)` : ""}</span>
//               <span>{fmtExact(taxAmount)}</span>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", color: "#c9a96e", fontWeight: "700",
//                           borderTop: "1px solid rgba(201,169,110,0.2)", paddingTop: "4px", marginTop: "4px" }}>
//               <span>Total payable</span><span>{fmtExact(amount)}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ───────────────────────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmt, fmtExact, onNavigate }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId, displayAmount: msAmount(m) })),
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;
//   const overdueCount = dues.filter((d) => d.status === "overdue").length;

//   return (
//     <div style={{
//       marginBottom: "20px",
//       background: overdueCount > 0 ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
//       border: `1px solid ${overdueCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
//       borderRadius: "14px", padding: "16px 18px",
//     }}>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
//         <div style={{ fontSize: "13px", fontWeight: "700", color: overdueCount > 0 ? "#ef4444" : "#f59e0b" }}>
//           💳 Upcoming Payments
//           {overdueCount > 0 && (
//             <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "10px",
//                            background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "11px", fontWeight: "700" }}>
//               {overdueCount} overdue
//             </span>
//           )}
//         </div>
//         <div style={{ fontSize: "12px", color: "#64748b" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {dues.map((d, i) => (
//           <div key={i} style={{
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
//             background: d.status === "overdue" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.06)",
//             border: `1px solid ${d.status === "overdue" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)"}`,
//           }} onClick={() => onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)}>
//             <div>
//               <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{d.label}</div>
//               <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && <span style={{ color: "#ef4444", fontWeight: "700", marginLeft: "8px" }}>⚠ Overdue</span>}
//                 <span style={{ color: "#475569", marginLeft: "8px" }}>· Booking #{d.bookingId}</span>
//                 {(d.tax_amount || 0) > 0 && (
//                   <span style={{ color: "#f59e0b", marginLeft: "8px" }}>incl. {d.tax_label || "tax"}</span>
//                 )}
//               </div>
//             </div>
//             <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
//               {/* Exact amount so user sees the precise figure they'll pay */}
//               <div style={{ fontSize: "16px", fontWeight: "800", color: d.status === "overdue" ? "#ef4444" : "#f59e0b" }}>
//                 {fmtExact(d.displayAmount)}
//               </div>
//               <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Tap to pay →</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Booking Card ──────────────────────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmt, fmtExact, token }) => {
//   const [expanded,      setExpanded]      = useState(false);
//   const [cancelling,    setCancelling]    = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);

//   const cfg         = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan        = booking.payment_plan;
//   const isConfirmed = booking.booking_status === "confirmed";
//   const isPending   = booking.booking_status === "pending";

//   const paidMilestones = (booking.milestones || []).filter((m) => m.status === "paid");
//   const paidTotal      = paidMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const allMilestones  = booking.milestones || [];
//   const totalFromMs    = allMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const balanceFromMs  = totalFromMs - paidTotal;
//   const grandTotal     = parseFloat(booking.total_amount || 0) || totalFromMs;

//   const displayAmt = (() => {
//     if (isConfirmed && paidTotal > 0) return paidTotal;
//     if (isConfirmed) return grandTotal;
//     const dp = parseFloat(booking.down_payment_amount || 0);
//     if (dp > 0) return dp;
//     return grandTotal;
//   })();

//   const amountLabel = isPending
//     ? "Down Payment Due"
//     : isConfirmed && paidTotal > 0
//       ? `Paid (${paidMilestones.length} milestone${paidMilestones.length > 1 ? "s" : ""})`
//       : isConfirmed ? "Total Amount" : "Amount";

//   return (
//     <div id={`booking-card-${booking.id}`} style={{
//       background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
//       border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px",
//       overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.3s",
//     }}
//       onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)")}
//       onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
//           <div style={{ flex: 1 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//               <span style={{ fontSize: "17px", fontWeight: "800", color: "#e2e8f0" }}>Unit {booking.plot_number}</span>
//               <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
//                              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                 {cfg.label}
//               </span>
//             </div>
//             <div style={{ marginTop: "3px", fontSize: "12px", color: "#64748b", display: "flex", gap: "10px", flexWrap: "wrap" }}>
//               <span>{booking.plot_type}</span>
//               {booking.area      && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div style={{ marginTop: "6px", padding: "6px 10px", background: "rgba(201,169,110,0.06)",
//                             border: "1px solid rgba(201,169,110,0.12)", borderRadius: "8px", fontSize: "12px" }}>
//                 <span style={{ color: "#64748b" }}>Client: </span>
//                 <span style={{ color: "#c9a96e", fontWeight: "600" }}>{booking.client_name}</span>
//                 {booking.client_phone && <span style={{ color: "#64748b" }}> · {booking.client_phone}</span>}
//                 {booking.client_email && <span style={{ color: "#64748b" }}> · {booking.client_email}</span>}
//               </div>
//             )}
//             <div style={{ marginTop: "4px", fontSize: "11px", color: "#334155" }}>
//               #{booking.id} · {new Date(booking.created_at).toLocaleDateString("en-IN", {
//                 day: "numeric", month: "short", year: "numeric",
//               })}
//             </div>
//           </div>

//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: "11px", color: "#475569", marginBottom: "2px" }}>{amountLabel}</div>
//             {/* Exact 2dp amount so user sees what they actually paid/owe */}
//             <div style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}>{fmtExact(displayAmt)}</div>

//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs > 0.01 && (
//               <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "2px" }}>
//                 Balance: {fmtExact(balanceFromMs)}
//               </div>
//             )}
//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs <= 0.01 && (
//               <div style={{ fontSize: "11px", color: "#22c55e", marginTop: "2px" }}>✓ Fully paid (incl. tax)</div>
//             )}
//             {isPending && grandTotal > 0 && (
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
//                 Grand total: {fmtExact(grandTotal)}
//               </div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px",
//                         padding: "7px 12px", background: "rgba(201,169,110,0.06)",
//                         border: "1px solid rgba(201,169,110,0.15)", borderRadius: "8px" }}>
//             <span style={{ fontSize: "13px" }}>💰</span>
//             <span style={{ fontSize: "12px", color: "#64748b" }}>Commission:</span>
//             <span style={{ fontSize: "13px", fontWeight: "800", color: "#c9a96e" }}>{fmtExact(booking.commission_amount)}</span>
//             {booking.commission_status && (() => {
//               const cs = COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//               return <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: cs.color }}>{cs.label}</span>;
//             })()}
//           </div>
//         )}

//         <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
//           {isPending && (
//             <button onClick={() => onPay(booking.id)} style={{
//               padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
//               background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none",
//             }}>💳 Complete Payment</button>
//           )}
//           <button onClick={() => setExpanded((e) => !e)} style={{
//             padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//             fontSize: "12px", background: "transparent", color: "#64748b",
//             border: "1px solid rgba(255,255,255,0.08)",
//           }}>
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button onClick={() => setConfirmCancel(true)} style={{
//               padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "12px", background: "transparent", color: "#ef4444",
//               border: "1px solid rgba(239,68,68,0.25)", marginLeft: "auto",
//             }}>✕ Cancel</button>
//           )}
//           {isPending && confirmCancel && (
//             <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
//               <span style={{ fontSize: "12px", color: "#94a3b8" }}>Sure?</span>
//               <button disabled={cancelling} onClick={async () => {
//                 setCancelling(true); await onCancel(booking.id); setCancelling(false); setConfirmCancel(false);
//               }} style={{ padding: "7px 14px", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "700",
//                           background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button onClick={() => setConfirmCancel(false)} style={{
//                 padding: "7px 10px", borderRadius: "7px", cursor: "pointer",
//                 fontSize: "12px", background: "transparent", color: "#64748b",
//                 border: "1px solid rgba(255,255,255,0.08)",
//               }}>No</button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div style={{ padding: "0 20px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
//           <MilestoneTracker bookingId={booking.id} token={token} fmt={fmt} fmtExact={fmtExact} booking={booking} />
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Panel ─────────────────────────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast }) => {
//   const [form, setForm] = useState({
//     name: user.name || "", phone: user.phone || "",
//     current_password: "", new_password: "", confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500); return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) { payload.current_password = form.current_password; payload.new_password = form.new_password; }
//       const res  = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Update failed");
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";
//   const inp = (placeholder, key, type = "text", readOnly = false) => (
//     <input type={type} placeholder={placeholder} value={form[key] ?? ""} readOnly={readOnly}
//       onChange={(e) => !readOnly && setForm((f) => ({ ...f, [key]: e.target.value }))}
//       style={{
//         width: "100%", padding: "10px 14px", marginBottom: "10px",
//         background: readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
//         border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
//         color: readOnly ? "#475569" : "#e2e8f0", fontSize: "13px", outline: "none",
//         boxSizing: "border-box", cursor: readOnly ? "not-allowed" : "text",
//       }}
//     />
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//       <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
//           <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "800", color: "#000", flexShrink: 0 }}>
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}>{user.name}</div>
//             <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{user.email}</div>
//             <div style={{ fontSize: "12px", color: "#c9a96e", marginTop: "2px", fontWeight: "600", textTransform: "capitalize" }}>
//               {isBroker ? `🤝 Broker${user.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//         </div>
//         {isBroker && (
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
//             {[
//               { label: "Commission Rate", value: `${user.commission_rate || 2}%` },
//               { label: "Account Status", value: user.status || "active", color: user.status === "active" ? "#22c55e" : "#ef4444" },
//             ].map(({ label, value, color }) => (
//               <div key={label} style={{ padding: "10px 14px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.12)", borderRadius: "8px" }}>
//                 <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
//                 <div style={{ fontSize: "14px", fontWeight: "700", color: color || "#c9a96e", marginTop: "2px" }}>{value}</div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px" }}>✏️ Edit Profile</div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Full Name *", "name")}</div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input value={user.email} readOnly placeholder="Email" style={{
//               width: "100%", padding: "10px 14px", marginBottom: "10px",
//               background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
//               borderRadius: "8px", color: "#475569", fontSize: "13px", outline: "none",
//               boxSizing: "border-box", cursor: "not-allowed",
//             }} />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>{inp("Phone Number", "phone", "tel")}</div>
//         </div>
//         <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px", marginTop: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
//           Change Password (leave blank to keep current)
//         </div>
//         {inp("Current Password", "current_password", "password")}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div>{inp("New Password", "new_password", "password")}</div>
//           <div>{inp("Confirm Password", "confirm_password", "password")}</div>
//         </div>
//         <button onClick={handleSave} disabled={saving || !form.name} style={{
//           width: "100%", padding: "11px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer",
//           background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none",
//           fontWeight: "700", fontSize: "13px", marginTop: "4px", opacity: saving ? 0.7 : 1,
//         }}>
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Stats ──────────────────────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmtExact }) => {
//   const commPending  = bookings.filter((b) => b.commission_status === "pending").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings.filter((b) => b.commission_status === "approved").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid     = bookings.filter((b) => b.commission_status === "paid").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//       {[
//         { label: "Pending Commission",  value: fmtExact(commPending),  color: "#f59e0b", icon: "⏳" },
//         { label: "Approved Commission", value: fmtExact(commApproved), color: "#3b82f6", icon: "✅" },
//         { label: "Commission Paid",     value: fmtExact(commPaid),     color: "#22c55e", icon: "💰" },
//         { label: "Total Clients",       value: bookings.length,        color: "#c9a96e", icon: "👥" },
//       ].map(({ label, value, color, icon }) => (
//         <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//           <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
//           <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//           <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications ─────────────────────────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder:  { icon: "💳", color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Payment Reminder"  },
//   booking_confirmed: { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Booking Confirmed" },
//   booking_cancelled: { icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Booking Cancelled" },
//   project_launch:    { icon: "🏗️", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "Project Launch"    },
//   offer:             { icon: "🎁", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)",  label: "Special Offer"     },
//   general:           { icon: "🔔", color: "#c9a96e", bg: "rgba(201,169,110,0.10)", label: "General"           },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate, onSwitchToBookings }) => {
//   const cfg = notif ? NOTIF_CFG[notif.type] || NOTIF_CFG.general : NOTIF_CFG.general;

//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);

//   if (!notif) return null;

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   };

//   const handleViewBooking = () => {
//     onClose();
//     if (notif.type === "payment_reminder") onNavigate(`/payment/${notif.booking_id}`);
//     else onSwitchToBookings(notif.booking_id);
//   };

//   return (
//     <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000,
//       background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
//       display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
//       <div onClick={(e) => e.stopPropagation()} style={{
//         background: "linear-gradient(135deg,#0f0f1e,#12121f)",
//         border: `1px solid ${cfg.color}33`, borderTop: `3px solid ${cfg.color}`,
//         borderRadius: "16px", maxWidth: "520px", width: "100%",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
//         <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
//               <div style={{ width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div style={{ fontSize: "15px", fontWeight: "800", color: "#e2e8f0", lineHeight: "1.3" }}>{notif.title}</div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                   <span style={{ fontSize: "11px", color: "#475569" }}>🕐 {timeAgo(notif.created_at)}</span>
//                 </div>
//               </div>
//             </div>
//             <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//               color: "#64748b", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.75", whiteSpace: "pre-line",
//                         background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
//                         borderRadius: "10px", padding: "16px" }}>
//             {notif.message}
//           </div>
//           <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
//             {notif.booking_id && (
//               <button onClick={handleViewBooking} style={{ padding: "9px 20px", borderRadius: "8px", cursor: "pointer",
//                 fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none" }}>
//                 {notif.type === "payment_reminder" ? "💳 Complete Payment →" : "📋 View Booking →"}
//               </button>
//             )}
//             <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: "8px", cursor: "pointer",
//               fontSize: "13px", background: "transparent", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({ notifications, loading, unreadCount, onMarkRead, onMarkAllRead, onNavigate, onSwitchToBookings }) => {
//   const [filter, setFilter] = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);

//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read")   return  n.is_read;
//     return true;
//   });

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
//   };

//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
//       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading notifications...
//     </div>
//   );

//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal notif={selectedNotif} onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead} onNavigate={onNavigate} onSwitchToBookings={onSwitchToBookings} />
//       )}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
//                     marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
//         <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "8px" }}>
//           {[["all","All"],["unread","Unread"],["read","Read"]].map(([val, label]) => (
//             <button key={val} onClick={() => setFilter(val)} style={{
//               padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
//               background: filter === val ? "rgba(201,169,110,0.15)" : "transparent",
//               color: filter === val ? "#c9a96e" : "#64748b",
//               border: filter === val ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span style={{ marginLeft: "5px", padding: "0 5px", borderRadius: "10px",
//                                fontSize: "10px", background: "#f59e0b", color: "#000", fontWeight: "800" }}>
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button onClick={onMarkAllRead} style={{ padding: "6px 14px", borderRadius: "7px", cursor: "pointer",
//             fontSize: "12px", fontWeight: "600", background: "rgba(201,169,110,0.08)",
//             color: "#c9a96e", border: "1px solid rgba(201,169,110,0.2)" }}>✓ Mark all read</button>
//         )}
//       </div>
//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔔</div>
//           <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//             {filter === "unread" ? "No unread notifications" : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569" }}>Payment reminders and booking updates will appear here.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//         {filtered.map((n) => {
//           const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.general;
//           return (
//             <div key={n.id} onClick={() => setSelectedNotif(n)} style={{
//               display: "flex", gap: "14px", alignItems: "flex-start",
//               padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
//               background: n.is_read ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`,
//               border: `1px solid ${n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"}`,
//               transition: "all 0.2s", position: "relative",
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color + "55"; e.currentTarget.style.transform = "translateY(-1px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.borderColor = n.is_read ? "rgba(255,255,255,0.06)" : cfg.color + "33"; e.currentTarget.style.transform = "none"; }}
//             >
//               {!n.is_read && (
//                 <div style={{ position: "absolute", top: "14px", right: "14px", width: "8px", height: "8px",
//                               borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
//               )}
//               <div style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
//                             background: cfg.bg, border: `1px solid ${cfg.color}33`,
//                             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
//                 {cfg.icon}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "13px", fontWeight: n.is_read ? "600" : "700", color: n.is_read ? "#94a3b8" : "#e2e8f0" }}>
//                     {n.title}
//                   </span>
//                   <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 7px", borderRadius: "10px",
//                                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
//                     {cfg.label}
//                   </span>
//                 </div>
//                 <div style={{ fontSize: "12px", color: n.is_read ? "#475569" : "#94a3b8", lineHeight: "1.5", marginBottom: "6px" }}>
//                   {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
//                   <span style={{ fontSize: "11px", color: "#334155" }}>🕐 {timeAgo(n.created_at)}</span>
//                   <span style={{ fontSize: "11px", color: cfg.color, fontWeight: "600" }}>Click to read →</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Payments Tab ──────────────────────────────────────────────────────────────
// // const GW_CFG = {
// //   razorpay: { icon: "💳", color: "#3b82f6", label: "Razorpay" },
// //   stripe:   { icon: "💎", color: "#8b5cf6", label: "Stripe"   },
// //   phonepe:  { icon: "📱", color: "#f59e0b", label: "PhonePe"  },
// //   cash:     { icon: "💵", color: "#22c55e", label: "Cash"     },
// //   manual:   { icon: "🏦", color: "#64748b", label: "Manual"   },
// // };
// // const TXN_STATUS = {
// //   success:  { color: "#22c55e", bg: "rgba(34,197,94,0.10)",   label: "Success"  },
// //   pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  label: "Pending"  },
// //   failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   label: "Failed"   },
// //   refunded: { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", label: "Refunded" },
// // };

// // const PaymentsTab = ({ payments, loading, fmt, fmtExact }) => {
// //   const totalPaid     = payments.filter((p) => p.status === "success").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
// //   const totalRefunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
// //   const successCount  = payments.filter((p) => p.status === "success").length;

// //   if (loading) return (
// //     <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
// //       <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading payment history...
// //     </div>
// //   );

// //   // Stat cards — refunded card only shown when there are refunds
// //   const statCards = [
// //     { label: "Total Paid (incl. tax)", value: fmtExact(totalPaid),    color: "#22c55e", icon: "💰" },
// //     { label: "Transactions",           value: successCount,            color: "#c9a96e", icon: "🧾" },
// //     { label: "Pending",                value: payments.filter((p) => p.status === "pending").length, color: "#f59e0b", icon: "⏳" },
// //     ...(totalRefunded > 0 ? [{ label: "Refunded (incl. tax)", value: fmtExact(totalRefunded), color: "#ef4444", icon: "↩️" }] : []),
// //   ];

// //   return (
// //     <div>
// //       {payments.length > 0 && (
// //         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
// //           {statCards.map(({ label, value, color, icon }) => (
// //             <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
// //               <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
// //               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
// //               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {payments.length === 0 && (
// //         <div style={{ textAlign: "center", padding: "60px 0" }}>
// //           <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧾</div>
// //           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No payment history yet</div>
// //           <div style={{ fontSize: "13px", color: "#475569" }}>Your payment transactions will appear here once you make a booking payment.</div>
// //         </div>
// //       )}

// //       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
// //         {payments.map((p) => {
// //           const gw         = GW_CFG[p.gateway?.toLowerCase()] || GW_CFG.manual;
// //           const txn        = TXN_STATUS[p.status] || TXN_STATUS.pending;
// //           const isRefunded = p.status === "refunded";

// //           return (
// //             <div key={p.id} style={{
// //               background:   isRefunded ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)",
// //               border:       `1px solid ${isRefunded ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.07)"}`,
// //               borderRadius: "12px", padding: "16px 18px",
// //               borderLeft:   `3px solid ${txn.color}`,
// //             }}>
// //               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
// //                 <div style={{ flex: 1 }}>
// //                   <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
// //                     <span style={{ fontSize: "16px" }}>{gw.icon}</span>
// //                     <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{gw.label}</span>
// //                     <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
// //                                    background: txn.bg, color: txn.color, border: `1px solid ${txn.color}33` }}>
// //                       {txn.label}
// //                     </span>
// //                     {isRefunded && (
// //                       <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
// //                                      background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
// //                         ↩ Refunded
// //                       </span>
// //                     )}
// //                     {p._synthetic && (
// //                       <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 8px", borderRadius: "10px",
// //                                      background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
// //                         🏢 Walk-in / Cash
// //                       </span>
// //                     )}
// //                     {!p._synthetic && p.mode && p.mode !== "online" && (
// //                       <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "10px",
// //                                      background: "rgba(255,255,255,0.05)", color: "#64748b",
// //                                      border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize" }}>
// //                         {p.mode}
// //                       </span>
// //                     )}
// //                   </div>
// //                   {p.booking && (
// //                     <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>
// //                       🏠 Unit {p.booking.plot_number} · {p.booking.plot_type}
// //                     </div>
// //                   )}
// //                   {(p.gateway_payment_id || p.gateway_order_id) && (
// //                     <div style={{ fontSize: "11px", color: "#334155", fontFamily: "monospace" }}>
// //                       Ref: {p.gateway_payment_id || p.gateway_order_id}
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div style={{ textAlign: "right", flexShrink: 0 }}>
// //                   {/* Exact 2dp amounts — user paid this precise figure */}
// //                   {isRefunded ? (
// //                     <>
// //                       <div style={{ fontSize: "14px", fontWeight: "600", color: "#64748b", textDecoration: "line-through" }}>
// //                         {fmtExact(p.amount)}
// //                       </div>
// //                       <div style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444", marginTop: "2px" }}>
// //                         −{fmtExact(p.amount)}
// //                       </div>
// //                       <div style={{ fontSize: "11px", color: "#888", marginTop: "1px" }}>incl. taxes · refunded</div>
// //                     </>
// //                   ) : (
// //                     <>
// //                       <div style={{ fontSize: "20px", fontWeight: "800", color: txn.color }}>{fmtExact(p.amount)}</div>
// //                       <div style={{ fontSize: "11px", color: "#888", marginTop: "1px" }}>incl. taxes</div>
// //                     </>
// //                   )}
// //                   <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
// //                     {p.paid_at
// //                       ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
// //                       : new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
// //                   </div>
// //                 </div>
// //               </div>
// //               {p.notes && (
// //                 <div style={{ marginTop: "8px", fontSize: "12px", color: "#475569", padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
// //                   📝 {p.notes}
// //                 </div>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // };

// // ── Feedback Tab ──────────────────────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { icon: "💬", color: "#6c757d" },
//   service: { icon: "🛎️", color: "#3b82f6" },
//   unit:    { icon: "🏠", color: "#c9a96e" },
//   payment: { icon: "💳", color: "#f59e0b" },
//   staff:   { icon: "👤", color: "#8b5cf6" },
// };
// const StarRating = ({ value, onChange }) => (
//   <div style={{ display: "flex", gap: "4px" }}>
//     {[1,2,3,4,5].map((s) => (
//       <button key={s} type="button" onClick={() => onChange(s)} style={{
//         background: "none", border: "none", cursor: "pointer", fontSize: "24px",
//         padding: "0 2px", color: s <= value ? "#c9a96e" : "rgba(255,255,255,0.15)", transition: "color 0.15s",
//       }}>★</button>
//     ))}
//   </div>
// );

// const FeedbackTab = ({ feedbacks, bookings, token, onSubmitted, showToast }) => {
//   const [showForm,   setShowForm]   = useState(false);
//   const [form,       setForm]       = useState({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) { showToast("⚠️ Subject and message are required", "warning", 3500); return; }
//     setSubmitting(true);
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ ...form, booking_id: form.booking_id || undefined }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast("🙏 Thank you! Your feedback has been submitted", "success", 4000);
//       setForm({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSubmitting(false);
//   };

//   const inp = (style = {}) => ({
//     width: "100%", padding: "10px 14px", marginBottom: "10px",
//     background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box", ...style,
//   });

//   const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed");

//   return (
//     <div>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//         <div>
//           <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>Your Feedback</div>
//           <div style={{ fontSize: "12px", color: "#475569" }}>Share your experience with us</div>
//         </div>
//         <button onClick={() => setShowForm((f) => !f)} style={{
//           padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
//           background: showForm ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#c9a96e,#a07840)",
//           color: showForm ? "#64748b" : "#fff", border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
//         }}>{showForm ? "✕ Cancel" : "+ New Feedback"}</button>
//       </div>
//       {showForm && (
//         <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
//           <div style={{ fontSize: "13px", fontWeight: "700", color: "#c9a96e", marginBottom: "16px" }}>✍️ New Feedback</div>
//           <div style={{ marginBottom: "14px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rating *</div>
//             <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
//             <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
//               {["","Very Poor","Poor","Average","Good","Excellent"][form.rating]}
//             </div>
//           </div>
//           <div style={{ marginBottom: "10px" }}>
//             <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category *</div>
//             <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => (
//                 <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} style={{
//                   padding: "5px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
//                   background: form.category === cat ? `${cfg.color}22` : "rgba(255,255,255,0.03)",
//                   color: form.category === cat ? cfg.color : "#64748b",
//                   border: `1px solid ${form.category === cat ? cfg.color + "55" : "rgba(255,255,255,0.08)"}`,
//                   textTransform: "capitalize",
//                 }}>{cfg.icon} {cat}</button>
//               ))}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select value={form.booking_id} onChange={(e) => setForm((f) => ({ ...f, booking_id: e.target.value }))}
//               style={{ ...inp(), marginBottom: "10px", background: "#1e1e2e", color: "#e2e8f0", }}>
//               <option value="" style={{ background: "#1e1e2e", color: "#e2e8f0" }}>Select booking (optional)</option>
//               {confirmedBookings.map((b) => <option key={b.id} value={b.id} style={{ background: "#1e1e2e", color: "#e2e8f0" }}>Unit {b.plot_number} — Booking #{b.id}</option>)}
//             </select>
//           )}
//           <input type="text" placeholder="Subject *" value={form.subject}
//             onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inp()} />
//           <textarea placeholder="Your message..." value={form.message}
//             onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4} style={{ ...inp(), resize: "vertical" }} />
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button onClick={handleSubmit} disabled={submitting} style={{
//               padding: "10px 22px", borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
//               fontSize: "13px", fontWeight: "700", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//               color: "#fff", border: "none", opacity: submitting ? 0.7 : 1,
//             }}>{submitting ? "Submitting…" : "Submit Feedback →"}</button>
//             <button onClick={() => setShowForm(false)} style={{ padding: "10px 14px", borderRadius: "8px",
//               cursor: "pointer", fontSize: "13px", background: "transparent", color: "#64748b",
//               border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
//           </div>
//         </div>
//       )}
//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
//           <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No feedback yet</div>
//           <div style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>Share your experience to help us improve.</div>
//         </div>
//       )}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         {feedbacks.map((fb) => {
//           const catCfg     = CATEGORY_CFG[fb.category] || CATEGORY_CFG.general;
//           const ratingColor = fb.rating >= 4 ? "#22c55e" : fb.rating >= 3 ? "#f59e0b" : "#ef4444";
//           return (
//             <div key={fb.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
//               <div style={{ padding: "14px 16px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
//                       <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{fb.subject}</span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px",
//                                      background: `${catCfg.color}22`, color: catCfg.color,
//                                      border: `1px solid ${catCfg.color}33`, textTransform: "capitalize" }}>
//                         {catCfg.icon} {fb.category}
//                       </span>
//                       <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "10px", fontWeight: "700", textTransform: "capitalize",
//                                      background: fb.status === "resolved" ? "rgba(34,197,94,0.1)" : fb.status === "reviewed" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
//                                      color: fb.status === "resolved" ? "#22c55e" : fb.status === "reviewed" ? "#3b82f6" : "#f59e0b" }}>
//                         {fb.status}
//                       </span>
//                     </div>
//                     <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                     </div>
//                   </div>
//                   <div style={{ color: ratingColor, fontSize: "16px", fontWeight: "800", flexShrink: 0 }}>{"★".repeat(fb.rating)}</div>
//                 </div>
//                 <div style={{ marginTop: "8px", fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>{fb.message}</div>
//                 {fb.admin_reply && (
//                   <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "8px" }}>
//                     <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 Admin Reply</div>
//                     <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", whiteSpace: "pre-line" }}>{fb.admin_reply}</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ────────────────────────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user     = useSelector(selectUser);

//   const [bookings,        setBookings]        = useState([]);
//   const [milestoneMap,    setMilestoneMap]    = useState({});
//   const [loading,         setLoading]         = useState(true);
//   const [error,           setError]           = useState("");
//   const [activeTab,       setActiveTab]       = useState("bookings");
//   const [notifications,   setNotifications]   = useState([]);
//   const [notifsLoading,   setNotifsLoading]   = useState(false);
//   const [unreadCount,     setUnreadCount]     = useState(0);
//   const [feedbacks,       setFeedbacks]       = useState([]);
//   const [payments,        setPayments]        = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages,  setUnreadMessages]  = useState(0);
//   const [invoices,        setInvoices]        = useState([]);

//   const { showToast } = useToast();
//   const { wishlist, wishedIds, toggle: toggleWishRaw, loading: wishLoading } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(async (plotId) => {
//     const wasWished = wishedIds instanceof Set && wishedIds.has(Number(plotId));
//     await toggleWishRaw(Number(plotId));
//     showToast(wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//               wasWished ? "wishlist_remove" : "wishlist_add", 2800);
//   }, [wishedIds, toggleWishRaw, showToast]);

//   const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", position: "before" });

//   // fmt  → rounded (for summary stat cards, headings)
//   // fmtExact → 2dp (for every amount the user actually pays or tax line)
//   const fmt      = useCallback((n) => makeFmt(currency.symbol, currency.code, currency.position)(n), [currency]);
//   const fmtExact = useCallback((n) => makeFmtExact(currency.symbol, currency.position)(n), [currency]);

//   const isBroker = user?.role === "broker";

//   const fetchMilestones = useCallback(async (bookingsList) => {
//     const targets = bookingsList.filter((b) => b.booking_status === "confirmed" && b.payment_plan_id);
//     if (!targets.length) return;
//     const results = await Promise.all(
//       targets.map((b) =>
//         fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//           headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//         }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
//       ),
//     );
//     const map = {};
//     targets.forEach((b, i) => { if (results[i]) map[b.id] = results[i]; });
//     setMilestoneMap(map);
//   }, [user?.token]);

//   const switchToBookings = useCallback((bookingId) => {
//     setActiveTab("bookings");
//     if (!bookingId) return;
//     setTimeout(() => {
//       const el = document.getElementById(`booking-card-${bookingId}`);
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//         el.style.boxShadow = "0 0 0 2px #c9a96e, 0 0 24px rgba(201,169,110,0.35)";
//         el.style.transition = "box-shadow 0.3s";
//         setTimeout(() => { el.style.boxShadow = ""; }, 3000);
//       }
//     }, 150);
//   }, []);

//   const fetchInvoices = useCallback(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/invoices`, {
//         headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       setInvoices(Array.isArray(data) ? data : []);
//     } catch (_) {}
//   }, [user?.token]);

//   const fetchBookings = useCallback(async () => {
//     setLoading(true); setError("");
//     try {
//       const res  = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally { setLoading(false); }
//   }, [user?.token, fetchMilestones, showToast]);

//   const fetchPayments = useCallback(async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//         fetch(`${API_BASE}/bookings`,         { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//       ]);
//       const txns     = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books    = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList  = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter((b) => b.booking_status === "confirmed" && !txnBookingIds.has(String(b.id)))
//         .map((b) => ({
//           id: `booking_${b.id}`, booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR", status: "success", mode: "manual",
//           gateway: "cash / manual", paid_at: b.created_at, _synthetic: true,
//           booking: { id: b.id, plot_number: b.plot_number, plot_type: b.plot_type, booking_status: b.booking_status },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {} finally { setPaymentsLoading(false); }
//   }, [user?.token]);

//   const fetchFeedbacks = useCallback(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   }, [user?.token]);

//   const fetchNotifications = useCallback(async () => {
//     setNotifsLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {} finally { setNotifsLoading(false); }
//   }, [user?.token]);

//   useEffect(() => {
//     if (!user?.token) { navigate("/"); return; }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => { if (d) setCurrency({ symbol: d.symbol || "₹", code: d.code || "INR", position: d.position || "before" }); })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//       fetchInvoices(),
//     ]);

//     const params    = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     if (bookingId && sessionId) {
//       const confirmPayment = async () => {
//         try {
//           await fetch(`${API_BASE}/payment/stripe/confirm`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//             body: JSON.stringify({ booking_id: bookingId, session_id: sessionId }),
//           });
//           await Promise.all([fetchBookings(), fetchNotifications(), fetchPayments(), fetchInvoices()]);
//           showToast("🎉 Payment confirmed! Your booking is now active.", "booking", 5000);
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, { headers: { Authorization: `Bearer ${user.token}` } })
//       .then((r) => r.json()).then((d) => setUnreadMessages(d.unread || 0)).catch(() => {});
//   }, [user?.token]);

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const handlePay    = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 600);
//   };
//   const handleSaved  = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res  = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, booking_status: "cancelled" } : b));
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//   };

//   const confirmed = bookings.filter((b) => b.booking_status === "confirmed").length;
//   const pending   = bookings.filter((b) => b.booking_status === "pending").length;

//   // totalInvested — exact sum of what the user has actually paid (stored total_with_tax)
//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => {
//       const msData = milestoneMap[b.id];
//       if (msData?.milestones?.length) {
//         const paidSum = msData.milestones
//           .filter((m) => m.status === "paid")
//           .reduce((ms, m) => ms + msAmount(m), 0);
//         if (paidSum > 0) return s + paidSum;
//         return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//       }
//       return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//     }, 0);

//   const tabs = [
//     { id: "bookings",      label: isBroker ? "Client Bookings" : "My Bookings", count: bookings.length },
//     { id: "wishlist",      label: "Wishlist",      count: wishlist.length  },
//     { id: "payments",      label: "Payments",      count: 0               },
//     { id: "invoices",      label: "Invoices",      count: invoices.length },
//     { id: "notifications", label: "Notifications", count: unreadCount     },
//     { id: "feedback",      label: "Feedback",      count: 0               },
//     { id: "messages",      label: "Messages",      count: unreadMessages  },
//     { id: "profile",       label: "My Profile",    count: 0               },
//   ];

//   return (
//     <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* Header */}
//       <div style={{ background: "rgba(8,8,18,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)",
//                     padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
//                     height: "62px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
//           <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px", padding: "6px 10px", borderRadius: "6px" }}>← Back</button>
//           <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)" }} />
//           <span style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{isBroker ? "🤝 Broker Dashboard" : "🏠 My Dashboard"}</span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{user?.name}</div>
//             <div style={{ fontSize: "11px", color: "#475569" }}>
//               {isBroker ? `🤝 Broker${user?.broker_company ? " · " + user.broker_company : ""}` : "👤 Buyer"}
//             </div>
//           </div>
//           <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                         display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", color: "#000" }}>
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//             color: "#64748b", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
//           <button onClick={() => setActiveTab("notifications")} style={{ position: "relative",
//             background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
//             color: "#64748b", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
//             🔔
//             {unreadCount > 0 && (
//               <span style={{ position: "absolute", top: "-5px", right: "-5px", minWidth: "16px", height: "16px",
//                              borderRadius: "10px", background: "#f59e0b", color: "#000", fontSize: "9px",
//                              fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 18px" }}>
//         <div style={{ marginBottom: "22px" }}>
//           <div style={{ fontSize: "24px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.4px" }}>
//             Welcome back, {user?.name?.split(" ")[0]} 👋
//           </div>
//           <div style={{ fontSize: "13px", color: "#475569", marginTop: "3px" }}>
//             {isBroker ? "Manage your client bookings and track your commissions." : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* Stat cards — rounded ok for summary KPIs */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "20px" }}>
//           {[
//             { label: "Total Bookings",  value: bookings.length,        icon: "🏠", color: "#c9a96e" },
//             { label: "Confirmed",       value: confirmed,               icon: "✅", color: "#22c55e" },
//             { label: "Pending Payment", value: pending,                 icon: "⏳", color: "#f59e0b" },
//             // Amount Invested uses fmtExact — this is a real financial figure
//             ...(!isBroker ? [{ label: "Amount Invested (incl. tax)", value: fmtExact(totalInvested), icon: "💰", color: "#c9a96e" }] : []),
//           ].map(({ label, value, icon, color }) => (
//             <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
//               <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
//               <div style={{ fontSize: "20px", fontWeight: "800", color }}>{value}</div>
//               <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{label}</div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && <BrokerStats bookings={bookings} fmtExact={fmtExact} />}

//         {/* Tabs */}
//         <div style={{ display: "flex", gap: "4px", marginBottom: "18px", background: "rgba(255,255,255,0.03)",
//                       padding: "4px", borderRadius: "10px", overflowX: "auto" }}>
//           {tabs.map((t) => (
//             <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
//               padding: "7px 16px", borderRadius: "7px", cursor: "pointer",
//               fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap",
//               background: activeTab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
//               color:      activeTab === t.id ? "#c9a96e" : "#64748b",
//               border:     activeTab === t.id ? "1px solid rgba(201,169,110,0.25)" : "1px solid transparent",
//             }}>
//               {t.label}
//               {t.count > 0 && (
//                 <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "20px", fontSize: "11px",
//                                background: activeTab === t.id ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.07)",
//                                color: activeTab === t.id ? "#c9a96e" : "#475569" }}>
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Bookings tab */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}><div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>Loading bookings...</div>}
//             {error && (
//               <div style={{ padding: "14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
//                             borderRadius: "10px", color: "#fca5a5", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
//                 <span>⚠ {error}</span>
//                 <button onClick={fetchBookings} style={{ background: "none", border: "none", color: "#c9a96e", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>Retry</button>
//               </div>
//             )}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner milestoneMap={milestoneMap} fmt={fmt} fmtExact={fmtExact} onNavigate={navigate} />
//             )}
//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏠</div>
//                 <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div style={{ fontSize: "13px", color: "#475569", marginBottom: "20px" }}>
//                   {isBroker ? "Book a unit for your clients from the unit page." : "Browse available units to make your first booking."}
//                 </div>
//                 <button onClick={() => navigate("/")} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Browse Units →</button>
//               </div>
//             )}
//             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//               {!loading && bookings.map((b) => (
//                 <BookingCard key={b.id} booking={b} onPay={handlePay} onCancel={handleCancel}
//                   isBroker={isBroker} fmt={fmt} fmtExact={fmtExact} token={user?.token} />
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab wishlist={wishlist} wishedIds={wishedIds} onToggle={handleWishlistToggle}
//             loading={wishLoading} token={user?.token} onNavigate={navigate} fmt={fmt} />
//         )}
//         {activeTab === "payments"      && <PaymentsTab payments={payments} loading={paymentsLoading} fmt={fmt} fmtExact={fmtExact} user={user} />}
//         {activeTab === "invoices"      && <InvoicesTab user={user} fmt={fmt} />}
//         {activeTab === "notifications" && (
//           <NotificationsTab notifications={notifications} loading={notifsLoading} unreadCount={unreadCount}
//             onMarkRead={markRead} onMarkAllRead={markAllRead} onNavigate={navigate} onSwitchToBookings={switchToBookings} />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab feedbacks={feedbacks} bookings={bookings} token={user?.token}
//             showToast={showToast} onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])} />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "profile"  && <ProfilePanel user={user} onSaved={handleSaved} showToast={showToast} />}
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useSettings } from "../context/SettingsContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";
// import InvoicesTab from "./InvoicesTab";
// import PaymentsTab from "./PaymentsTab";

// import { apiUrl, imgUrl } from "../apiUrl";

// const API_BASE = `${apiUrl}/api`;

// // ── Formatters ─────────────────────────────────────────────
// const makeFmt =
//   (symbol = "₹", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
//   };

// const makeFmtExact =
//   (symbol = "₹", position = "before") =>
//   (n) => {
//     if (n == null) return "—";
//     const num = new Intl.NumberFormat("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(n);
//     return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
//   };

// const STATUS_CFG = {
//   confirmed: { color: "#16a34a", bg: "rgba(22,163,74,0.10)",   label: "Confirmed"       },
//   pending:   { color: "#d97706", bg: "rgba(217,119,6,0.10)",   label: "Pending Payment" },
//   cancelled: { color: "#dc2626", bg: "rgba(220,38,38,0.10)",   label: "Cancelled"       },
// };
// const COMM_CFG = {
//   pending:  { color: "#d97706", label: "Pending Approval" },
//   approved: { color: "#2563eb", label: "Approved"         },
//   paid:     { color: "#16a34a", label: "Paid"             },
//   rejected: { color: "#dc2626", label: "Rejected"         },
// };

// const msAmount = (m) => parseFloat(m.total_with_tax ?? m.amount ?? 0);

// // ── Inline styles helper using CSS variables (matches UnitPage) ──
// const card = (extra = {}) => ({
//   background: "var(--card-bg)",
//   border: "1px solid var(--card-border)",
//   borderRadius: 12,
//   ...extra,
// });

// const pill = (color, bgAlpha = 0.12) => ({
//   padding: "2px 10px",
//   borderRadius: 20,
//   fontSize: 11,
//   fontWeight: 700,
//   background: `${color}${Math.round(bgAlpha * 255).toString(16).padStart(2, "0")}`,
//   color,
//   border: `1px solid ${color}33`,
//   display: "inline-flex",
//   alignItems: "center",
// });

// // ── Milestone Tracker ──────────────────────────────────────
// const MilestoneTracker = ({ bookingId, token, fmtExact, booking, primaryColor }) => {
//   const [data,    setData]    = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => { setData(d); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan  = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "10px 12px", background: "var(--page-bg)", borderRadius: 8 }}>
//           Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     const grandTotal  = parseFloat(booking.total_amount || price);
//     return (
//       <div style={{ marginTop: 8 }}>
//         <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10 }}>
//           Payment Schedule — {plan.name}
//         </div>
//         {plan.milestones.map((m, i) => {
//           const amt    = m.percentage ? (grandTotal * m.percentage) / 100 : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue  = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow key={i} label={m.label} percentage={m.percentage}
//               amount={amt} isPaid={isPaid} isDue={isDue} index={i}
//               fmtExact={fmtExact} primaryColor={primaryColor} />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading) return <div style={{ color: "var(--text-muted)", fontSize: 12, padding: 10 }}>Loading payment schedule...</div>;

//   const { milestones } = data;
//   const totalAmount = milestones.reduce((s, m) => s + msAmount(m), 0);
//   const paidAmount  = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + msAmount(m), 0);
//   const balanceDue  = totalAmount - paidAmount;
//   const pct         = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

//   return (
//     <div style={{ marginTop: 8 }}>
//       <div style={{ marginBottom: 14 }}>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
//           <span>Payment Progress (incl. taxes)</span>
//           <span>{pct}% complete</span>
//         </div>
//         <div style={{ background: "var(--card-border)", borderRadius: 20, height: 5, overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${pct}%`, borderRadius: 20, background: primaryColor, transition: "width 0.4s" }} />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4 }}>
//           <span style={{ color: "#16a34a" }}>Paid: {fmtExact(paidAmount)}</span>
//           <span style={{ color: balanceDue > 0 ? "#d97706" : "#16a34a" }}>
//             {balanceDue > 0 ? `Balance: ${fmtExact(balanceDue)}` : "✓ Fully Paid"}
//           </span>
//         </div>
//       </div>

//       {milestones.map((m, i) => {
//         const isPaid    = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived  = m.status === "waived";
//         const isDue     = !isPaid && !isWaived &&
//           i === milestones.findIndex((x) => x.status === "pending" || x.status === "overdue");
//         return (
//           <MilestoneRow
//             key={m.id}
//             label={m.label}
//             percentage={m.percentage}
//             amount={msAmount(m)}
//             baseAmount={m.amount}
//             taxAmount={m.tax_amount}
//             extraFees={m.extra_fees}
//             taxLabel={m.tax_label}
//             taxRate={m.tax_rate}
//             hasTax={(m.tax_amount || 0) > 0}
//             isPaid={isPaid}
//             isDue={isDue}
//             isOverdue={isOverdue}
//             isWaived={isWaived}
//             dueDate={m.due_date}
//             paidAt={m.paid_at}
//             index={i}
//             fmtExact={fmtExact}
//             primaryColor={primaryColor}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({
//   label, percentage, amount, baseAmount, taxAmount, extraFees, taxLabel, taxRate, hasTax,
//   isPaid, isDue, isOverdue, isWaived, dueDate, paidAt, index, fmtExact, primaryColor,
// }) => {
//   const [showTax, setShowTax] = useState(false);
//   const textColor = isPaid ? primaryColor : isOverdue ? "#dc2626" : isWaived ? "var(--text-muted)" : isDue ? "var(--text-dark)" : "var(--text-muted)";

//   const dotColor  = isPaid ? primaryColor : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--card-border)";
//   const dotBorder = isPaid ? primaryColor : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--card-border)";

//   return (
//     <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
//       <div style={{
//         width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 2,
//         background: isPaid ? primaryColor : "transparent",
//         border: `2px solid ${dotBorder}`,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: 11, fontWeight: 700,
//         color: isPaid ? "#fff" : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--text-muted)",
//       }}>
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div style={{
//         flex: 1, padding: "8px 12px", borderRadius: 8,
//         background: isPaid ? `${primaryColor}08` : "var(--page-bg)",
//         border: `1px solid ${isPaid ? primaryColor + "25" : isOverdue ? "#dc262620" : isDue ? primaryColor + "20" : "var(--card-border)"}`,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{label}</div>
//             <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? 8 : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && <span style={{ color: "#dc2626", fontWeight: 700, marginLeft: 4 }}>⚠ Overdue</span>}
//                 </span>
//               )}
//               {isPaid && paidAt && <span style={{ color: "#16a34a", marginLeft: 4 }}>✓ Paid {paidAt}</span>}
//               {isDue && !isOverdue && <span style={{ color: "#d97706", marginLeft: 8 }}>← Due now</span>}
//               {isWaived && <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>Waived</span>}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
//             <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{fmtExact(amount)}</div>
//             {hasTax && (
//               <button type="button" onClick={() => setShowTax((s) => !s)}
//                 style={{ fontSize: 10, color: "#d97706", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2, fontFamily: "var(--font-body, inherit)" }}>
//                 {taxLabel || "Tax"}{taxRate > 0 ? ` ${taxRate}%` : ""} {showTax ? "▲" : "▼"}
//               </button>
//             )}
//           </div>
//         </div>

//         {hasTax && showTax && (
//           <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--card-border)", fontSize: 11 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 2 }}>
//               <span>Base amount</span><span>{fmtExact(baseAmount)}</span>
//             </div>
//             {(extraFees || 0) > 0 && (
//               <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 2 }}>
//                 <span>Additional fees</span><span>{fmtExact(extraFees)}</span>
//               </div>
//             )}
//             <div style={{ display: "flex", justifyContent: "space-between", color: "#d97706" }}>
//               <span>{taxLabel || "Tax"}{taxRate > 0 ? ` (${taxRate}%)` : ""}</span>
//               <span>{fmtExact(taxAmount)}</span>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", color: primaryColor, fontWeight: 700, borderTop: `1px solid ${primaryColor}25`, paddingTop: 4, marginTop: 4 }}>
//               <span>Total payable</span><span>{fmtExact(amount)}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ─────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmtExact, onNavigate, primaryColor }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId, displayAmount: msAmount(m) })),
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;
//   const overdueCount = dues.filter((d) => d.status === "overdue").length;
//   const accentColor  = overdueCount > 0 ? "#dc2626" : "#d97706";

//   return (
//     <div style={{ ...card({ marginBottom: 20, padding: "16px 18px", borderColor: `${accentColor}30`, borderLeft: `3px solid ${accentColor}` }) }}>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
//         <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, display: "flex", alignItems: "center", gap: 8 }}>
//           Upcoming Payments
//           {overdueCount > 0 && (
//             <span style={{ ...pill("#dc2626"), fontSize: 10 }}>{overdueCount} overdue</span>
//           )}
//         </div>
//         <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {dues.map((d, i) => (
//           <div key={i}
//             onClick={() => onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)}
//             style={{
//               display: "flex", justifyContent: "space-between", alignItems: "center",
//               padding: "10px 14px", borderRadius: 8, cursor: "pointer",
//               background: "var(--page-bg)",
//               border: `1px solid ${d.status === "overdue" ? "#dc262630" : "#d9770630"}`,
//               transition: "border-color 0.2s",
//             }}
//             onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor + "60")}
//             onMouseLeave={(e) => (e.currentTarget.style.borderColor = d.status === "overdue" ? "#dc262630" : "#d9770630")}
//           >
//             <div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>{d.label}</div>
//               <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && <span style={{ color: "#dc2626", fontWeight: 700, marginLeft: 8 }}>⚠ Overdue</span>}
//                 <span style={{ marginLeft: 8 }}>· Booking #{d.bookingId}</span>
//                 {(d.tax_amount || 0) > 0 && <span style={{ color: "#d97706", marginLeft: 8 }}>incl. {d.tax_label || "tax"}</span>}
//               </div>
//             </div>
//             <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
//               <div style={{ fontSize: 16, fontWeight: 800, color: d.status === "overdue" ? "#dc2626" : "#d97706" }}>
//                 {fmtExact(d.displayAmount)}
//               </div>
//               <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Tap to pay →</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Booking Card ────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmtExact, token, primaryColor }) => {
//   const [expanded,      setExpanded]      = useState(false);
//   const [cancelling,    setCancelling]    = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);

//   const cfg         = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan        = booking.payment_plan;
//   const isConfirmed = booking.booking_status === "confirmed";
//   const isPending   = booking.booking_status === "pending";

//   const paidMilestones = (booking.milestones || []).filter((m) => m.status === "paid");
//   const paidTotal      = paidMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const allMilestones  = booking.milestones || [];
//   const totalFromMs    = allMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const balanceFromMs  = totalFromMs - paidTotal;
//   const grandTotal     = parseFloat(booking.total_amount || 0) || totalFromMs;

//   const displayAmt = (() => {
//     if (isConfirmed && paidTotal > 0) return paidTotal;
//     if (isConfirmed) return grandTotal;
//     const dp = parseFloat(booking.down_payment_amount || 0);
//     if (dp > 0) return dp;
//     return grandTotal;
//   })();

//   const amountLabel = isPending
//     ? "Down Payment Due"
//     : isConfirmed && paidTotal > 0
//       ? `Paid (${paidMilestones.length} milestone${paidMilestones.length > 1 ? "s" : ""})`
//       : isConfirmed ? "Total Amount" : "Amount";

//   return (
//     <div
//       id={`booking-card-${booking.id}`}
//       style={{ ...card({ overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s" }) }}
//       onMouseEnter={(e) => { e.currentTarget.style.borderColor = primaryColor + "40"; e.currentTarget.style.boxShadow = `0 2px 12px ${primaryColor}10`; }}
//       onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
//           <div style={{ flex: 1 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//               <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//                 Unit {booking.plot_number}
//               </span>
//               <span style={pill(cfg.color)}>{cfg.label}</span>
//             </div>
//             <div style={{ marginTop: 3, fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <span>{booking.plot_type}</span>
//               {booking.area      && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div style={{ marginTop: 6, padding: "6px 10px", background: `${primaryColor}08`, border: `1px solid ${primaryColor}20`, borderRadius: 8, fontSize: 12 }}>
//                 <span style={{ color: "var(--text-muted)" }}>Client: </span>
//                 <span style={{ color: primaryColor, fontWeight: 600 }}>{booking.client_name}</span>
//                 {booking.client_phone && <span style={{ color: "var(--text-muted)" }}> · {booking.client_phone}</span>}
//                 {booking.client_email && <span style={{ color: "var(--text-muted)" }}> · {booking.client_email}</span>}
//               </div>
//             )}
//             <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>
//               #{booking.id} · {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//             </div>
//           </div>

//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{amountLabel}</div>
//             <div style={{ fontSize: 20, fontWeight: 800, color: primaryColor }}>{fmtExact(displayAmt)}</div>
//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs > 0.01 && (
//               <div style={{ fontSize: 11, color: "#d97706", marginTop: 2 }}>Balance: {fmtExact(balanceFromMs)}</div>
//             )}
//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs <= 0.01 && (
//               <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2 }}>✓ Fully paid (incl. tax)</div>
//             )}
//             {isPending && grandTotal > 0 && (
//               <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Grand total: {fmtExact(grandTotal)}</div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div style={{
//             display: "flex", alignItems: "center", gap: 8, marginTop: 10,
//             padding: "7px 12px", background: `${primaryColor}08`,
//             border: `1px solid ${primaryColor}20`, borderRadius: 8,
//           }}>
//             <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Commission:</span>
//             <span style={{ fontSize: 13, fontWeight: 800, color: primaryColor }}>{fmtExact(booking.commission_amount)}</span>
//             {booking.commission_status && (() => {
//               const cs = COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//               return <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: cs.color }}>{cs.label}</span>;
//             })()}
//           </div>
//         )}

//         <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
//           {isPending && (
//             <button onClick={() => onPay(booking.id)} className="book-btn" style={{
//               padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700,
//               background: primaryColor, color: "#fff", border: "none",
//             }}>
//               Complete Payment
//             </button>
//           )}
//           <button onClick={() => setExpanded((e) => !e)} style={{
//             padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12,
//             background: "transparent", color: "var(--text-muted)",
//             border: "1px solid var(--card-border)", fontFamily: "var(--font-body, inherit)",
//           }}>
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </button>
//           {isPending && !confirmCancel && (
//             <button onClick={() => setConfirmCancel(true)} style={{
//               padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12,
//               background: "transparent", color: "#dc2626",
//               border: "1px solid #dc262630", marginLeft: "auto", fontFamily: "var(--font-body, inherit)",
//             }}>
//               ✕ Cancel
//             </button>
//           )}
//           {isPending && confirmCancel && (
//             <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
//               <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Are you sure?</span>
//               <button disabled={cancelling} onClick={async () => {
//                 setCancelling(true); await onCancel(booking.id); setCancelling(false); setConfirmCancel(false);
//               }} style={{
//                 padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700,
//                 background: "#dc262615", color: "#dc2626", border: "1px solid #dc262640",
//                 fontFamily: "var(--font-body, inherit)",
//               }}>
//                 {cancelling ? "Cancelling…" : "Yes, Cancel"}
//               </button>
//               <button onClick={() => setConfirmCancel(false)} style={{
//                 padding: "7px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12,
//                 background: "transparent", color: "var(--text-muted)",
//                 border: "1px solid var(--card-border)", fontFamily: "var(--font-body, inherit)",
//               }}>
//                 No
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div style={{ padding: "14px 20px 16px", borderTop: "1px solid var(--card-border)" }}>
//           <MilestoneTracker bookingId={booking.id} token={token} fmtExact={fmtExact} booking={booking} primaryColor={primaryColor} />
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Profile Panel ───────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast, primaryColor }) => {
//   const [form, setForm] = useState({
//     name: user.name || "", phone: user.phone || "",
//     current_password: "", new_password: "", confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500); return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) { payload.current_password = form.current_password; payload.new_password = form.new_password; }
//       const res  = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Update failed");
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";

//   const inputStyle = (readOnly = false) => ({
//     width: "100%", padding: "10px 14px", marginBottom: 10,
//     background: readOnly ? "var(--page-bg)" : "var(--card-bg)",
//     border: "1.5px solid var(--card-border)", borderRadius: 8,
//     color: readOnly ? "var(--text-muted)" : "var(--text-dark)",
//     fontSize: 13, outline: "none", boxSizing: "border-box",
//     cursor: readOnly ? "not-allowed" : "text",
//     fontFamily: "var(--font-body, inherit)",
//   });

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <div style={card({ padding: 20 })}>
//         {/* Avatar row */}
//         <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
//           <div style={{
//             width: 56, height: 56, borderRadius: "50%", background: primaryColor,
//             display: "flex", alignItems: "center", justifyContent: "center",
//             fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0,
//           }}>
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>{user.name}</div>
//             <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{user.email}</div>
//             <div style={{ fontSize: 12, color: primaryColor, marginTop: 2, fontWeight: 600, textTransform: "capitalize" }}>
//               {isBroker ? `Broker${user.broker_company ? " · " + user.broker_company : ""}` : "Buyer"}
//             </div>
//           </div>
//         </div>

//         {isBroker && (
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
//             {[
//               { label: "Commission Rate", value: `${user.commission_rate || 2}%` },
//               { label: "Account Status",  value: user.status || "active", color: user.status === "active" ? "#16a34a" : "#dc2626" },
//             ].map(({ label, value, color }) => (
//               <div key={label} style={{ padding: "10px 14px", background: `${primaryColor}08`, border: `1px solid ${primaryColor}18`, borderRadius: 8 }}>
//                 <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: color || primaryColor, marginTop: 2 }}>{value}</div>
//               </div>
//             ))}
//           </div>
//         )}

//         <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>Edit Profile</div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input type="text" placeholder="Full Name *" value={form.name}
//               onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//               style={inputStyle()} />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input value={user.email} readOnly placeholder="Email" style={inputStyle(true)} />
//           </div>
//           <div style={{ gridColumn: "1/-1" }}>
//             <input type="tel" placeholder="Phone Number" value={form.phone}
//               onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
//               style={inputStyle()} />
//           </div>
//         </div>

//         <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, marginTop: 4, letterSpacing: "0.5px", textTransform: "uppercase" }}>
//           Change Password (leave blank to keep current)
//         </div>
//         <input type="password" placeholder="Current Password" value={form.current_password}
//           onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
//           style={inputStyle()} />
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
//           <div>
//             <input type="password" placeholder="New Password" value={form.new_password}
//               onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
//               style={inputStyle()} />
//           </div>
//           <div>
//             <input type="password" placeholder="Confirm Password" value={form.confirm_password}
//               onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
//               style={inputStyle()} />
//           </div>
//         </div>

//         <button onClick={handleSave} disabled={saving || !form.name} style={{
//           width: "100%", padding: 11, borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
//           background: primaryColor, color: "#fff", border: "none",
//           fontWeight: 700, fontSize: 13, marginTop: 4, opacity: saving ? 0.7 : 1,
//           fontFamily: "var(--font-body, inherit)",
//         }}>
//           {saving ? "Saving..." : "Save Changes →"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Broker Stats ────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmtExact, primaryColor }) => {
//   const commPending  = bookings.filter((b) => b.commission_status === "pending").reduce((s, b)  => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings.filter((b) => b.commission_status === "approved").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid     = bookings.filter((b) => b.commission_status === "paid").reduce((s, b)     => s + parseFloat(b.commission_amount || 0), 0);

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
//       {[
//         { label: "Pending Commission",  value: fmtExact(commPending),  color: "#d97706" },
//         { label: "Approved Commission", value: fmtExact(commApproved), color: "#2563eb" },
//         { label: "Commission Paid",     value: fmtExact(commPaid),     color: "#16a34a" },
//         { label: "Total Clients",       value: bookings.length,        color: primaryColor },
//       ].map(({ label, value, color }) => (
//         <div key={label} style={card({ padding: "14px 16px" })}>
//           <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
//           <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Notifications ───────────────────────────────────────────
// const NOTIF_CFG = {
//   payment_reminder:  { color: "#d97706", label: "Payment Reminder"  },
//   booking_confirmed: { color: "#16a34a", label: "Booking Confirmed" },
//   booking_cancelled: { color: "#dc2626", label: "Booking Cancelled" },
//   project_launch:    { color: null,      label: "Project Launch"    },
//   offer:             { color: "#7c3aed", label: "Special Offer"     },
//   general:           { color: null,      label: "General"           },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate, onSwitchToBookings, primaryColor }) => {
//   const cfg = notif ? { ...NOTIF_CFG[notif.type] || NOTIF_CFG.general } : NOTIF_CFG.general;
//   if (!cfg.color) cfg.color = primaryColor;

//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);

//   if (!notif) return null;

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   };

//   const handleViewBooking = () => {
//     onClose();
//     if (notif.type === "payment_reminder") onNavigate(`/payment/${notif.booking_id}`);
//     else onSwitchToBookings(notif.booking_id);
//   };

//   return (
//     <div onClick={onClose} style={{
//       position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)",
//       backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
//     }}>
//       <div onClick={(e) => e.stopPropagation()} style={{
//         ...card({ maxWidth: 520, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden", borderTop: `3px solid ${cfg.color}` }),
//         background: "var(--card-bg)",
//       }}>
//         <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--card-border)" }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
//               <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
//                 🔔
//               </div>
//               <div style={{ minWidth: 0 }}>
//                 <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", lineHeight: 1.3, fontFamily: "var(--font-heading, inherit)" }}>{notif.title}</div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
//                   <span style={pill(cfg.color, 0.1)}>{cfg.label}</span>
//                   <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(notif.created_at)}</span>
//                 </div>
//               </div>
//             </div>
//             <button onClick={onClose} style={{
//               background: "var(--page-bg)", border: "1px solid var(--card-border)",
//               color: "var(--text-muted)", width: 32, height: 32, borderRadius: 8, cursor: "pointer",
//               fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//             }}>×</button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.75, whiteSpace: "pre-line", background: "var(--page-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: 16 }}>
//             {notif.message}
//           </div>
//           <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
//             {notif.booking_id && (
//               <button onClick={handleViewBooking} style={{ padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, background: primaryColor, color: "#fff", border: "none", fontFamily: "var(--font-body, inherit)" }}>
//                 {notif.type === "payment_reminder" ? "Complete Payment →" : "View Booking →"}
//               </button>
//             )}
//             <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--card-border)", fontFamily: "var(--font-body, inherit)" }}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({ notifications, loading, unreadCount, onMarkRead, onMarkAllRead, onNavigate, onSwitchToBookings, primaryColor }) => {
//   const [filter,        setFilter]        = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);

//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read")   return  n.is_read;
//     return true;
//   });

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
//   };

//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading notifications...</div>
//   );

//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal notif={selectedNotif} onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead} onNavigate={onNavigate} onSwitchToBookings={onSwitchToBookings}
//           primaryColor={primaryColor} />
//       )}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
//         <div style={{ display: "flex", gap: 4, background: "var(--page-bg)", padding: 4, borderRadius: 8, border: "1px solid var(--card-border)" }}>
//           {[["all","All"],["unread","Unread"],["read","Read"]].map(([val, label]) => (
//             <button key={val} onClick={() => setFilter(val)} style={{
//               padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
//               background:   filter === val ? `${primaryColor}18` : "transparent",
//               color:        filter === val ? primaryColor : "var(--text-muted)",
//               border:       filter === val ? `1px solid ${primaryColor}30` : "1px solid transparent",
//               fontFamily:   "var(--font-body, inherit)",
//             }}>
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span style={{ marginLeft: 5, padding: "0 5px", borderRadius: 10, fontSize: 10, background: "#d97706", color: "#fff", fontWeight: 800 }}>
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <button onClick={onMarkAllRead} style={{
//             padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
//             background: `${primaryColor}08`, color: primaryColor, border: `1px solid ${primaryColor}25`,
//             fontFamily: "var(--font-body, inherit)",
//           }}>
//             ✓ Mark all read
//           </button>
//         )}
//       </div>

//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: 42, marginBottom: 10 }}>🔔</div>
//           <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-dark)", marginBottom: 6, fontFamily: "var(--font-heading, inherit)" }}>
//             {filter === "unread" ? "No unread notifications" : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Payment reminders and booking updates will appear here.</div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {filtered.map((n) => {
//           const cfg   = { ...NOTIF_CFG[n.type] || NOTIF_CFG.general };
//           if (!cfg.color) cfg.color = primaryColor;
//           return (
//             <div key={n.id} onClick={() => setSelectedNotif(n)} style={{
//               display: "flex", gap: 14, alignItems: "flex-start",
//               padding: "14px 16px", borderRadius: 12, cursor: "pointer",
//               background: n.is_read ? "var(--card-bg)" : `${cfg.color}08`,
//               border: `1px solid ${n.is_read ? "var(--card-border)" : cfg.color + "30"}`,
//               transition: "all 0.2s", position: "relative",
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color + "50"; e.currentTarget.style.transform = "translateY(-1px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.borderColor = n.is_read ? "var(--card-border)" : cfg.color + "30"; e.currentTarget.style.transform = "none"; }}
//             >
//               {!n.is_read && (
//                 <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
//               )}
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
//                   <span style={{ fontSize: 13, fontWeight: n.is_read ? 600 : 700, color: n.is_read ? "var(--text-muted)" : "var(--text-dark)" }}>
//                     {n.title}
//                   </span>
//                   <span style={pill(cfg.color, 0.1)}>{cfg.label}</span>
//                 </div>
//                 <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>
//                   {n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                   <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(n.created_at)}</span>
//                   <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>Click to read →</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { color: "#6b7280" },
//   service: { color: "#2563eb" },
//   unit:    { color: null      },  // filled in at render with primaryColor
//   payment: { color: "#d97706" },
//   staff:   { color: "#7c3aed" },
// };

// const StarRating = ({ value, onChange, primaryColor }) => (
//   <div style={{ display: "flex", gap: 4 }}>
//     {[1,2,3,4,5].map((s) => (
//       <button key={s} type="button" onClick={() => onChange(s)} style={{
//         background: "none", border: "none", cursor: "pointer", fontSize: 24,
//         padding: "0 2px", color: s <= value ? primaryColor : "var(--card-border)", transition: "color 0.15s",
//       }}>★</button>
//     ))}
//   </div>
// );

// const FeedbackTab = ({ feedbacks, bookings, token, onSubmitted, showToast, primaryColor }) => {
//   const [showForm,   setShowForm]   = useState(false);
//   const [form,       setForm]       = useState({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) { showToast("⚠️ Subject and message are required", "warning", 3500); return; }
//     setSubmitting(true);
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ ...form, booking_id: form.booking_id || undefined }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast("🙏 Thank you! Your feedback has been submitted", "success", 4000);
//       setForm({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSubmitting(false);
//   };

//   const inputStyle = {
//     width: "100%", padding: "10px 14px", marginBottom: 10,
//     background: "var(--card-bg)", border: "1.5px solid var(--card-border)", borderRadius: 8,
//     color: "var(--text-dark)", fontSize: 13, outline: "none", boxSizing: "border-box",
//     fontFamily: "var(--font-body, inherit)",
//   };

//   const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed");

//   return (
//     <div>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
//         <div>
//           <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>Your Feedback</div>
//           <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Share your experience with us</div>
//         </div>
//         <button onClick={() => setShowForm((f) => !f)} style={{
//           padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700,
//           background: showForm ? "var(--page-bg)" : primaryColor,
//           color: showForm ? "var(--text-muted)" : "#fff",
//           border: showForm ? "1px solid var(--card-border)" : "none",
//           fontFamily: "var(--font-body, inherit)",
//         }}>
//           {showForm ? "✕ Cancel" : "+ New Feedback"}
//         </button>
//       </div>

//       {showForm && (
//         <div style={{ ...card({ padding: 20, marginBottom: 20, borderColor: primaryColor + "25" }) }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: primaryColor, marginBottom: 16 }}>New Feedback</div>
//           <div style={{ marginBottom: 14 }}>
//             <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Rating *</div>
//             <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} primaryColor={primaryColor} />
//             <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
//               {["","Very Poor","Poor","Average","Good","Excellent"][form.rating]}
//             </div>
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Category *</div>
//             <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => {
//                 const catColor = cfg.color || primaryColor;
//                 const isActive = form.category === cat;
//                 return (
//                   <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} style={{
//                     padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
//                     background: isActive ? `${catColor}15` : "transparent",
//                     color: isActive ? catColor : "var(--text-muted)",
//                     border: `1px solid ${isActive ? catColor + "50" : "var(--card-border)"}`,
//                     textTransform: "capitalize", fontFamily: "var(--font-body, inherit)",
//                   }}>
//                     {cat}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//           {confirmedBookings.length > 0 && (
//             <select value={form.booking_id} onChange={(e) => setForm((f) => ({ ...f, booking_id: e.target.value }))}
//               style={{ ...inputStyle, marginBottom: 10 }}>
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => <option key={b.id} value={b.id}>Unit {b.plot_number} — Booking #{b.id}</option>)}
//             </select>
//           )}
//           <input type="text" placeholder="Subject *" value={form.subject}
//             onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inputStyle} />
//           <textarea placeholder="Your message..." value={form.message}
//             onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4}
//             style={{ ...inputStyle, resize: "vertical" }} />
//           <div style={{ display: "flex", gap: 8 }}>
//             <button onClick={handleSubmit} disabled={submitting} style={{
//               padding: "10px 22px", borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer",
//               fontSize: 13, fontWeight: 700, background: primaryColor, color: "#fff", border: "none",
//               opacity: submitting ? 0.7 : 1, fontFamily: "var(--font-body, inherit)",
//             }}>
//               {submitting ? "Submitting…" : "Submit Feedback →"}
//             </button>
//             <button onClick={() => setShowForm(false)} style={{
//               padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
//               background: "transparent", color: "var(--text-muted)",
//               border: "1px solid var(--card-border)", fontFamily: "var(--font-body, inherit)",
//             }}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "50px 0" }}>
//           <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
//           <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)", marginBottom: 6, fontFamily: "var(--font-heading, inherit)" }}>No feedback yet</div>
//           <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Share your experience to help us improve.</div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//         {feedbacks.map((fb) => {
//           const catColor    = CATEGORY_CFG[fb.category]?.color || primaryColor;
//           const ratingColor = fb.rating >= 4 ? "#16a34a" : fb.rating >= 3 ? "#d97706" : "#dc2626";
//           const statusColor = fb.status === "resolved" ? "#16a34a" : fb.status === "reviewed" ? "#2563eb" : "#d97706";
//           return (
//             <div key={fb.id} style={card({ overflow: "hidden" })}>
//               <div style={{ padding: "14px 16px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
//                       <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)" }}>{fb.subject}</span>
//                       <span style={pill(catColor, 0.1)}>{fb.category}</span>
//                       <span style={pill(statusColor, 0.1)}>{fb.status}</span>
//                     </div>
//                     <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
//                       {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                       {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                     </div>
//                   </div>
//                   <div style={{ color: ratingColor, fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{"★".repeat(fb.rating)}</div>
//                 </div>
//                 <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-dark)", lineHeight: 1.6 }}>{fb.message}</div>
//                 {fb.admin_reply && (
//                   <div style={{ marginTop: 12, padding: "10px 14px", background: "#16a34a08", border: "1px solid #16a34a20", borderRadius: 8 }}>
//                     <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Admin Reply</div>
//                     <div style={{ fontSize: 13, color: "var(--text-dark)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{fb.admin_reply}</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ──────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user     = useSelector(selectUser);
//   const { settings } = useSettings();

//   // Derive primary color from settings (same as UnitPage CSS variable)
//   const primaryColor = settings?.primary_color || "#c9a96e";

//   const [bookings,        setBookings]        = useState([]);
//   const [milestoneMap,    setMilestoneMap]    = useState({});
//   const [loading,         setLoading]         = useState(true);
//   const [error,           setError]           = useState("");
//   const [activeTab,       setActiveTab]       = useState("bookings");
//   const [notifications,   setNotifications]   = useState([]);
//   const [notifsLoading,   setNotifsLoading]   = useState(false);
//   const [unreadCount,     setUnreadCount]     = useState(0);
//   const [feedbacks,       setFeedbacks]       = useState([]);
//   const [payments,        setPayments]        = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages,  setUnreadMessages]  = useState(0);
//   const [invoices,        setInvoices]        = useState([]);

//   const { showToast } = useToast();
//   const { wishlist, wishedIds, toggle: toggleWishRaw, loading: wishLoading } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(async (plotId) => {
//     const wasWished = wishedIds instanceof Set && wishedIds.has(Number(plotId));
//     await toggleWishRaw(Number(plotId));
//     showToast(wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//               wasWished ? "wishlist_remove" : "wishlist_add", 2800);
//   }, [wishedIds, toggleWishRaw, showToast]);

//   const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", position: "before" });

//   const fmt      = useCallback((n) => makeFmt(currency.symbol, currency.position)(n), [currency]);
//   const fmtExact = useCallback((n) => makeFmtExact(currency.symbol, currency.position)(n), [currency]);

//   const isBroker = user?.role === "broker";

//   const fetchMilestones = useCallback(async (bookingsList) => {
//     const targets = bookingsList.filter((b) => b.booking_status === "confirmed" && b.payment_plan_id);
//     if (!targets.length) return;
//     const results = await Promise.all(
//       targets.map((b) =>
//         fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//           headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//         }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
//       ),
//     );
//     const map = {};
//     targets.forEach((b, i) => { if (results[i]) map[b.id] = results[i]; });
//     setMilestoneMap(map);
//   }, [user?.token]);

//   const switchToBookings = useCallback((bookingId) => {
//     setActiveTab("bookings");
//     if (!bookingId) return;
//     setTimeout(() => {
//       const el = document.getElementById(`booking-card-${bookingId}`);
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//         el.style.boxShadow = `0 0 0 2px ${primaryColor}, 0 0 24px ${primaryColor}30`;
//         el.style.transition = "box-shadow 0.3s";
//         setTimeout(() => { el.style.boxShadow = ""; }, 3000);
//       }
//     }, 150);
//   }, [primaryColor]);

//   const fetchInvoices = useCallback(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/invoices`, { headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setInvoices(Array.isArray(data) ? data : []);
//     } catch (_) {}
//   }, [user?.token]);

//   const fetchBookings = useCallback(async () => {
//     setLoading(true); setError("");
//     try {
//       const res  = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally { setLoading(false); }
//   }, [user?.token, fetchMilestones, showToast]);

//   const fetchPayments = useCallback(async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//         fetch(`${API_BASE}/bookings`,         { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//       ]);
//       const txns     = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books    = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList  = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter((b) => b.booking_status === "confirmed" && !txnBookingIds.has(String(b.id)))
//         .map((b) => ({
//           id: `booking_${b.id}`, booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR", status: "success", mode: "manual",
//           gateway: "cash / manual", paid_at: b.created_at, _synthetic: true,
//           booking: { id: b.id, plot_number: b.plot_number, plot_type: b.plot_type, booking_status: b.booking_status },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) {} finally { setPaymentsLoading(false); }
//   }, [user?.token]);

//   const fetchFeedbacks = useCallback(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) {}
//   }, [user?.token]);

//   const fetchNotifications = useCallback(async () => {
//     setNotifsLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) {} finally { setNotifsLoading(false); }
//   }, [user?.token]);

//   useEffect(() => {
//     if (!user?.token) { navigate("/"); return; }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => { if (d) setCurrency({ symbol: d.symbol || "₹", code: d.code || "INR", position: d.position || "before" }); })
//         .catch(() => {}),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//       fetchInvoices(),
//     ]);

//     const params    = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     if (bookingId && sessionId) {
//       const confirmPayment = async () => {
//         try {
//           await fetch(`${API_BASE}/payment/stripe/confirm`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//             body: JSON.stringify({ booking_id: bookingId, session_id: sessionId }),
//           });
//           await Promise.all([fetchBookings(), fetchNotifications(), fetchPayments(), fetchInvoices()]);
//           showToast("🎉 Payment confirmed! Your booking is now active.", "booking", 5000);
//         } catch (_) {}
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, { headers: { Authorization: `Bearer ${user.token}` } })
//       .then((r) => r.json()).then((d) => setUnreadMessages(d.unread || 0)).catch(() => {});
//   }, [user?.token]);

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) {}
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) {}
//   };

//   const handlePay    = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 600);
//   };
//   const handleSaved  = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res  = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, booking_status: "cancelled" } : b));
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//   };

//   const confirmed = bookings.filter((b) => b.booking_status === "confirmed").length;
//   const pending   = bookings.filter((b) => b.booking_status === "pending").length;

//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => {
//       const msData = milestoneMap[b.id];
//       if (msData?.milestones?.length) {
//         const paidSum = msData.milestones.filter((m) => m.status === "paid").reduce((ms, m) => ms + msAmount(m), 0);
//         if (paidSum > 0) return s + paidSum;
//         return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//       }
//       return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//     }, 0);

//   const tabs = [
//     { id: "bookings",      label: isBroker ? "Client Bookings" : "My Bookings", count: bookings.length },
//     { id: "wishlist",      label: "Wishlist",       count: wishlist.length },
//     { id: "payments",      label: "Payments",       count: 0               },
//     { id: "invoices",      label: "Invoices",       count: invoices.length },
//     { id: "notifications", label: "Notifications",  count: unreadCount     },
//     { id: "feedback",      label: "Feedback",       count: 0               },
//     { id: "messages",      label: "Messages",       count: unreadMessages  },
//     { id: "profile",       label: "My Profile",     count: 0               },
//   ];

//   // ── App logo (from settings) ──────────────────────────────
//   const logoUrl = settings?.app_logo_dark_url || settings?.app_logo_light_url || null;
//   const appName = settings?.app_name || "Dashboard";

//   return (
//     <div style={{
//       minHeight: "100vh",
//       background: "var(--page-bg)",
//       fontFamily: "var(--font-body, 'Jost', sans-serif)",
//       color: "var(--text-dark)",
//     }}>
//       {/* ── Header — mirrors UnitPage's unit-header ── */}
//       <div style={{
//         background: "var(--card-bg)",
//         borderBottom: "1px solid var(--card-border)",
//         padding: "0 24px",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         height: 62,
//         position: "sticky",
//         top: 0,
//         zIndex: 100,
//         backdropFilter: "blur(12px)",
//       }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//           <button onClick={() => navigate(-1)} style={{
//             background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
//             fontSize: 13, padding: "6px 10px", borderRadius: 6, fontFamily: "var(--font-body, inherit)",
//           }}>
//             ← Back
//           </button>
//           <div style={{ width: 1, height: 18, background: "var(--card-border)" }} />
//           {logoUrl
//             ? <img src={logoUrl} alt={appName} style={{ height: 28, objectFit: "contain" }} />
//             : <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//                 {isBroker ? "Broker Dashboard" : "My Dashboard"}
//               </span>
//           }
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>{user?.name}</div>
//             <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
//               {isBroker ? `Broker${user?.broker_company ? " · " + user.broker_company : ""}` : "Buyer"}
//             </div>
//           </div>
//           <div style={{
//             width: 34, height: 34, borderRadius: "50%", background: primaryColor,
//             display: "flex", alignItems: "center", justifyContent: "center",
//             fontWeight: 800, fontSize: 13, color: "#fff",
//           }}>
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <button onClick={handleLogout} style={{
//             background: "var(--page-bg)", border: "1px solid var(--card-border)",
//             color: "var(--text-muted)", padding: "6px 12px", borderRadius: 8,
//             cursor: "pointer", fontSize: 12, fontFamily: "var(--font-body, inherit)",
//           }}>
//             Logout
//           </button>
//           <button onClick={() => setActiveTab("notifications")} style={{
//             position: "relative", background: "var(--page-bg)", border: "1px solid var(--card-border)",
//             color: "var(--text-muted)", padding: "6px 10px", borderRadius: 8,
//             cursor: "pointer", fontSize: 15,
//           }}>
//             🔔
//             {unreadCount > 0 && (
//               <span style={{
//                 position: "absolute", top: -5, right: -5, minWidth: 16, height: 16, borderRadius: 10,
//                 background: "#d97706", color: "#fff", fontSize: 9, fontWeight: 800,
//                 display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
//               }}>
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 18px" }}>
//         {/* Welcome */}
//         <div style={{ marginBottom: 22 }}>
//           <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.4px", fontFamily: "var(--font-heading, inherit)" }}>
//             Welcome back, {user?.name?.split(" ")[0]}
//           </div>
//           <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
//             {isBroker ? "Manage your client bookings and track your commissions." : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* Stat cards — using UnitPage card design */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
//           {[
//             { label: "Total Bookings",  value: bookings.length, color: primaryColor },
//             { label: "Confirmed",       value: confirmed,        color: "#16a34a"   },
//             { label: "Pending Payment", value: pending,          color: "#d97706"   },
//             ...(!isBroker ? [{ label: "Amount Invested (incl. tax)", value: fmtExact(totalInvested), color: primaryColor }] : []),
//           ].map(({ label, value, color }) => (
//             <div key={label} style={card({ padding: "14px 16px" })}>
//               <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
//               <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
//             </div>
//           ))}
//         </div>

//         {isBroker && bookings.length > 0 && <BrokerStats bookings={bookings} fmtExact={fmtExact} primaryColor={primaryColor} />}

//         {/* Tabs — matches UnitPage's .unit-tabs aesthetic */}
//         <div style={{
//           display: "flex", gap: 4, marginBottom: 18,
//           background: "var(--card-bg)", padding: 4, borderRadius: 10,
//           border: "1px solid var(--card-border)", overflowX: "auto",
//         }}>
//           {tabs.map((t) => (
//             <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
//               padding: "7px 16px", borderRadius: 7, cursor: "pointer",
//               fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
//               background:   activeTab === t.id ? `${primaryColor}15` : "transparent",
//               color:        activeTab === t.id ? primaryColor : "var(--text-muted)",
//               border:       activeTab === t.id ? `1px solid ${primaryColor}30` : "1px solid transparent",
//               fontFamily:   "var(--font-body, inherit)",
//               transition:   "all 0.15s",
//             }}>
//               {t.label}
//               {t.count > 0 && (
//                 <span style={{
//                   marginLeft: 6, padding: "1px 6px", borderRadius: 20, fontSize: 11,
//                   background: activeTab === t.id ? `${primaryColor}20` : "var(--page-bg)",
//                   color: activeTab === t.id ? primaryColor : "var(--text-muted)",
//                   border: "1px solid var(--card-border)",
//                 }}>
//                   {t.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* ── Bookings Tab ── */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && (
//               <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
//                 <div style={{ marginBottom: 10, fontSize: 32 }}>⏳</div>Loading bookings...
//               </div>
//             )}
//             {error && (
//               <div style={{
//                 padding: 14, background: "#dc262608", border: "1px solid #dc262625",
//                 borderRadius: 10, color: "#dc2626", fontSize: 13,
//                 display: "flex", alignItems: "center", gap: 10,
//               }}>
//                 <span>⚠ {error}</span>
//                 <button onClick={fetchBookings} style={{ background: "none", border: "none", color: primaryColor, cursor: "pointer", fontSize: 13, textDecoration: "underline", fontFamily: "var(--font-body, inherit)" }}>Retry</button>
//               </div>
//             )}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner milestoneMap={milestoneMap} fmtExact={fmtExact} onNavigate={navigate} primaryColor={primaryColor} />
//             )}
//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0" }}>
//                 <div style={{ fontSize: 48, marginBottom: 10 }}>🏠</div>
//                 <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-dark)", marginBottom: 6, fontFamily: "var(--font-heading, inherit)" }}>
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
//                   {isBroker ? "Book a unit for your clients from the unit page." : "Browse available units to make your first booking."}
//                 </div>
//                 <button onClick={() => navigate("/")} style={{
//                   padding: "10px 22px", background: primaryColor, color: "#fff",
//                   border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700,
//                   fontFamily: "var(--font-body, inherit)",
//                 }}>
//                   Browse Units →
//                 </button>
//               </div>
//             )}
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               {!loading && bookings.map((b) => (
//                 <BookingCard key={b.id} booking={b} onPay={handlePay} onCancel={handleCancel}
//                   isBroker={isBroker} fmtExact={fmtExact} token={user?.token} primaryColor={primaryColor} />
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab wishlist={wishlist} wishedIds={wishedIds} onToggle={handleWishlistToggle}
//             loading={wishLoading} token={user?.token} onNavigate={navigate} fmt={fmt} />
//         )}
//         {activeTab === "payments" && (
//           <PaymentsTab payments={payments} loading={paymentsLoading} fmt={fmt} fmtExact={fmtExact} user={user} />
//         )}
//         {activeTab === "invoices" && <InvoicesTab user={user} fmt={fmt} />}
//         {activeTab === "notifications" && (
//           <NotificationsTab
//             notifications={notifications} loading={notifsLoading} unreadCount={unreadCount}
//             onMarkRead={markRead} onMarkAllRead={markAllRead} onNavigate={navigate}
//             onSwitchToBookings={switchToBookings} primaryColor={primaryColor}
//           />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab feedbacks={feedbacks} bookings={bookings} token={user?.token}
//             showToast={showToast} onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])}
//             primaryColor={primaryColor} />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "profile" && (
//           <ProfilePanel user={user} onSaved={handleSaved} showToast={showToast} primaryColor={primaryColor} />
//         )}
//       </div>
//     </div>
//   );
// }

// UserDashboard.jsx - Redesigned with elegant appearance
// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useToast } from "../context/ToastContext";
// import { useSettings } from "../context/SettingsContext";
// import { useWishlist } from "../hooks/useWishlist";
// import WishlistTab from "./WishlistTab";
// import MessagesTab from "./MessagesTab";
// import InvoicesTab from "./InvoicesTab";
// import PaymentsTab from "./PaymentsTab";
// import { apiUrl, imgUrl } from "../apiUrl";

// const API_BASE = `${apiUrl}/api`;

// // ── Formatters ─────────────────────────────────────────────
// const makeFmt = (symbol = "₹", position = "before") => (n) => {
//   if (n == null) return "—";
//   const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
//   return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
// };

// const makeFmtExact = (symbol = "₹", position = "before") => (n) => {
//   if (n == null) return "—";
//   const num = new Intl.NumberFormat("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(n);
//   return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
// };

// const STATUS_CFG = {
//   confirmed: { color: "#16a34a", bg: "rgba(22,163,74,0.10)", label: "Confirmed" },
//   pending: { color: "#d97706", bg: "rgba(217,119,6,0.10)", label: "Pending Payment" },
//   cancelled: { color: "#dc2626", bg: "rgba(220,38,38,0.10)", label: "Cancelled" },
// };
// const COMM_CFG = {
//   pending: { color: "#d97706", label: "Pending Approval" },
//   approved: { color: "#2563eb", label: "Approved" },
//   paid: { color: "#16a34a", label: "Paid" },
//   rejected: { color: "#dc2626", label: "Rejected" },
// };

// const msAmount = (m) => parseFloat(m.total_with_tax ?? m.amount ?? 0);

// // ── Elegant Card Component ─────────────────────────────────
// const ElegantCard = ({ children, noPadding, hover, onClick, className }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <div
//       className={className}
//       onClick={onClick}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       style={{
//         background: "var(--card-bg)",
//         border: `1px solid ${isHovered && hover ? "var(--primary-color)" : "var(--card-border)"}`,
//         borderRadius: "20px",
//         padding: noPadding ? 0 : "20px",
//         transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
//         boxShadow: isHovered && hover ? "0 8px 30px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.02)",
//         cursor: onClick ? "pointer" : "default",
//       }}
//     >
//       {children}
//     </div>
//   );
// };

// // ── Elegant Button ─────────────────────────────────────────
// const ElegantButton = ({ children, variant = "primary", onClick, disabled, loading, size = "md" }) => {
//   const sizes = { sm: "6px 14px", md: "10px 22px", lg: "12px 28px" };
//   const variants = {
//     primary: { bg: "var(--primary-color)", color: "#fff", hoverBg: "var(--primary-hover)" },
//     secondary: { bg: "transparent", color: "var(--text-dark)", hoverBg: "rgba(0,0,0,0.05)", border: "1px solid var(--card-border)" },
//     outline: { bg: "transparent", color: "var(--primary-color)", hoverBg: "rgba(var(--primary-rgb), 0.1)", border: "1px solid var(--primary-color)" },
//     ghost: { bg: "transparent", color: "var(--text-muted)", hoverBg: "rgba(0,0,0,0.03)" },
//   };
//   const style = variants[variant];
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled || loading}
//       style={{
//         padding: sizes[size],
//         background: style.bg,
//         color: style.color,
//         border: style.border || "none",
//         borderRadius: "12px",
//         fontSize: size === "sm" ? "12px" : size === "md" ? "14px" : "15px",
//         fontWeight: 600,
//         cursor: (disabled || loading) ? "not-allowed" : "pointer",
//         opacity: (disabled || loading) ? 0.6 : 1,
//         transition: "all 0.2s ease",
//         fontFamily: "var(--font-body, inherit)",
//         display: "inline-flex",
//         alignItems: "center",
//         gap: "8px",
//       }}
//     >
//       {loading && <span className="spinner" style={{ width: "14px", height: "14px", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
//       {children}
//     </button>
//   );
// };

// // ── Elegant Stat Card ──────────────────────────────────────
// const StatCard = ({ icon, label, value, color }) => (
//   <ElegantCard hover>
//     <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//       <div style={{
//         width: "48px", height: "48px", borderRadius: "16px",
//         background: `linear-gradient(135deg, ${color}15, ${color}08)`,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: "24px",
//       }}>
//         {icon}
//       </div>
//       <div>
//         <div style={{ fontSize: "20px", fontWeight: 700, color, fontFamily: "var(--font-heading, inherit)" }}>
//           {value}
//         </div>
//         <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
//           {label}
//         </div>
//       </div>
//     </div>
//   </ElegantCard>
// );

// // ── Tab Button ─────────────────────────────────────────────
// const TabButton = ({ active, onClick, label, count, primaryColor }) => (
//   <button
//     onClick={onClick}
//     style={{
//       padding: "10px 20px",
//       borderRadius: "14px",
//       cursor: "pointer",
//       fontSize: "14px",
//       fontWeight: 600,
//       background: active ? `${primaryColor}12` : "transparent",
//       color: active ? primaryColor : "var(--text-muted)",
//       border: active ? `1px solid ${primaryColor}25` : "1px solid transparent",
//       transition: "all 0.2s ease",
//       whiteSpace: "nowrap",
//       fontFamily: "var(--font-body, inherit)",
//       display: "flex",
//       alignItems: "center",
//       gap: "8px",
//     }}
//   >
//     {label}
//     {count > 0 && (
//       <span style={{
//         padding: "2px 8px",
//         borderRadius: "20px",
//         fontSize: "11px",
//         fontWeight: 700,
//         background: active ? `${primaryColor}20` : "var(--page-bg)",
//         color: active ? primaryColor : "var(--text-muted)",
//         border: "1px solid var(--card-border)",
//       }}>
//         {count}
//       </span>
//     )}
//   </button>
// );

// // ── Milestone Tracker (unchanged logic) ────────────────────
// const MilestoneTracker = ({ bookingId, token, fmtExact, booking, primaryColor }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!bookingId || !token) return;
//     fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//       headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//     })
//       .then((r) => (r.ok ? r.json() : null))
//       .then((d) => { setData(d); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [bookingId, token]);

//   if (!loading && (!data || !data.milestones?.length)) {
//     const plan = booking?.payment_plan;
//     const price = parseFloat(booking?.price || 0);
//     if (!plan?.milestones?.length) {
//       return (
//         <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 16px", background: "var(--page-bg)", borderRadius: "14px" }}>
//           Full payment — no instalment plan selected
//         </div>
//       );
//     }
//     const isConfirmed = booking.booking_status === "confirmed";
//     const grandTotal = parseFloat(booking.total_amount || price);
//     return (
//       <div style={{ marginTop: 12 }}>
//         <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
//           Payment Schedule — {plan.name}
//         </div>
//         {plan.milestones.map((m, i) => {
//           const amt = m.percentage ? (grandTotal * m.percentage) / 100 : m.fixed_amount;
//           const isPaid = i === 0 && isConfirmed;
//           const isDue = i === 0 && !isConfirmed;
//           return (
//             <MilestoneRow key={i} label={m.label} percentage={m.percentage}
//               amount={amt} isPaid={isPaid} isDue={isDue} index={i}
//               fmtExact={fmtExact} primaryColor={primaryColor} />
//           );
//         })}
//       </div>
//     );
//   }

//   if (loading) return <div style={{ color: "var(--text-muted)", fontSize: 12, padding: 12 }}>Loading payment schedule...</div>;

//   const { milestones } = data;
//   const totalAmount = milestones.reduce((s, m) => s + msAmount(m), 0);
//   const paidAmount = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + msAmount(m), 0);
//   const balanceDue = totalAmount - paidAmount;
//   const pct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

//   return (
//     <div style={{ marginTop: 12 }}>
//       <div style={{ marginBottom: 16 }}>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
//           <span>Payment Progress (incl. taxes)</span>
//           <span style={{ fontWeight: 600, color: primaryColor }}>{pct}% complete</span>
//         </div>
//         <div style={{ background: "var(--card-border)", borderRadius: 20, height: 6, overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${pct}%`, borderRadius: 20, background: primaryColor, transition: "width 0.5s ease" }} />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8 }}>
//           <span style={{ color: "#16a34a" }}>Paid: {fmtExact(paidAmount)}</span>
//           <span style={{ color: balanceDue > 0 ? "#d97706" : "#16a34a", fontWeight: 600 }}>
//             {balanceDue > 0 ? `Balance: ${fmtExact(balanceDue)}` : "✓ Fully Paid"}
//           </span>
//         </div>
//       </div>

//       {milestones.map((m, i) => {
//         const isPaid = m.status === "paid";
//         const isOverdue = m.status === "overdue";
//         const isWaived = m.status === "waived";
//         const isDue = !isPaid && !isWaived &&
//           i === milestones.findIndex((x) => x.status === "pending" || x.status === "overdue");
//         return (
//           <MilestoneRow
//             key={m.id}
//             label={m.label}
//             percentage={m.percentage}
//             amount={msAmount(m)}
//             baseAmount={m.amount}
//             taxAmount={m.tax_amount}
//             extraFees={m.extra_fees}
//             taxLabel={m.tax_label}
//             taxRate={m.tax_rate}
//             hasTax={(m.tax_amount || 0) > 0}
//             isPaid={isPaid}
//             isDue={isDue}
//             isOverdue={isOverdue}
//             isWaived={isWaived}
//             dueDate={m.due_date}
//             paidAt={m.paid_at}
//             index={i}
//             fmtExact={fmtExact}
//             primaryColor={primaryColor}
//           />
//         );
//       })}
//     </div>
//   );
// };

// const MilestoneRow = ({
//   label, percentage, amount, baseAmount, taxAmount, extraFees, taxLabel, taxRate, hasTax,
//   isPaid, isDue, isOverdue, isWaived, dueDate, paidAt, index, fmtExact, primaryColor,
// }) => {
//   const [showTax, setShowTax] = useState(false);
//   const textColor = isPaid ? primaryColor : isOverdue ? "#dc2626" : isWaived ? "var(--text-muted)" : isDue ? "var(--text-dark)" : "var(--text-muted)";

//   const dotColor = isPaid ? primaryColor : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--card-border)";
//   const dotBorder = isPaid ? primaryColor : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--card-border)";

//   return (
//     <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
//       <div style={{
//         width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 2,
//         background: isPaid ? primaryColor : "transparent",
//         border: `2px solid ${dotBorder}`,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: 12, fontWeight: 700,
//         color: isPaid ? "#fff" : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--text-muted)",
//       }}>
//         {isPaid ? "✓" : isWaived ? "–" : index + 1}
//       </div>
//       <div style={{
//         flex: 1, padding: "10px 14px", borderRadius: 14,
//         background: isPaid ? `${primaryColor}06` : "var(--page-bg)",
//         border: `1px solid ${isPaid ? primaryColor + "20" : isOverdue ? "#dc262620" : isDue ? primaryColor + "18" : "var(--card-border)"}`,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{label}</div>
//             <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
//               {percentage ? `${percentage}% of total` : ""}
//               {dueDate && !isPaid && (
//                 <span style={{ marginLeft: percentage ? 8 : 0 }}>
//                   Due: {dueDate}
//                   {isOverdue && <span style={{ color: "#dc2626", fontWeight: 700, marginLeft: 6 }}>⚠ Overdue</span>}
//                 </span>
//               )}
//               {isPaid && paidAt && <span style={{ color: "#16a34a", marginLeft: 6 }}>✓ Paid {paidAt}</span>}
//               {isDue && !isOverdue && <span style={{ color: "#d97706", marginLeft: 6 }}>← Due now</span>}
//               {isWaived && <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>Waived</span>}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
//             <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{fmtExact(amount)}</div>
//             {hasTax && (
//               <button type="button" onClick={() => setShowTax((s) => !s)}
//                 style={{ fontSize: 10, color: "#d97706", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 3, fontFamily: "var(--font-body, inherit)" }}>
//                 {taxLabel || "Tax"}{taxRate > 0 ? ` ${taxRate}%` : ""} {showTax ? "▲" : "▼"}
//               </button>
//             )}
//           </div>
//         </div>

//         {hasTax && showTax && (
//           <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--card-border)", fontSize: 11 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 4 }}>
//               <span>Base amount</span><span>{fmtExact(baseAmount)}</span>
//             </div>
//             {(extraFees || 0) > 0 && (
//               <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 4 }}>
//                 <span>Additional fees</span><span>{fmtExact(extraFees)}</span>
//               </div>
//             )}
//             <div style={{ display: "flex", justifyContent: "space-between", color: "#d97706" }}>
//               <span>{taxLabel || "Tax"}{taxRate > 0 ? ` (${taxRate}%)` : ""}</span>
//               <span>{fmtExact(taxAmount)}</span>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", color: primaryColor, fontWeight: 700, borderTop: `1px solid ${primaryColor}20`, paddingTop: 8, marginTop: 8 }}>
//               <span>Total payable</span><span>{fmtExact(amount)}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Dues Banner ─────────────────────────────────────────────
// const DuesBanner = ({ milestoneMap, fmtExact, onNavigate, primaryColor }) => {
//   const dues = Object.entries(milestoneMap)
//     .flatMap(([bookingId, data]) =>
//       (data.milestones || [])
//         .filter((m) => m.status === "pending" || m.status === "overdue")
//         .map((m) => ({ ...m, bookingId, displayAmount: msAmount(m) })),
//     )
//     .sort((a, b) => {
//       if (!a.due_date && !b.due_date) return 0;
//       if (!a.due_date) return 1;
//       if (!b.due_date) return -1;
//       return new Date(a.due_date) - new Date(b.due_date);
//     });

//   if (!dues.length) return null;
//   const overdueCount = dues.filter((d) => d.status === "overdue").length;
//   const accentColor = overdueCount > 0 ? "#dc2626" : "#d97706";

//   return (
//     <ElegantCard hover>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
//         <div style={{ fontSize: 14, fontWeight: 700, color: accentColor, display: "flex", alignItems: "center", gap: 10 }}>
//           <span style={{ fontSize: 20 }}>⏰</span>
//           Upcoming Payments
//           {overdueCount > 0 && (
//             <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#dc262615", color: "#dc2626" }}>
//               {overdueCount} overdue
//             </span>
//           )}
//         </div>
//         <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
//           {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
//         </div>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//         {dues.map((d, i) => (
//           <div key={i}
//             onClick={() => onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)}
//             style={{
//               display: "flex", justifyContent: "space-between", alignItems: "center",
//               padding: "14px 16px", borderRadius: 14, cursor: "pointer",
//               background: "var(--page-bg)",
//               border: `1px solid ${d.status === "overdue" ? "#dc262630" : "#d9770630"}`,
//               transition: "all 0.2s ease",
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor + "60"; e.currentTarget.style.transform = "translateX(4px)"; }}
//             onMouseLeave={(e) => { e.currentTarget.style.borderColor = d.status === "overdue" ? "#dc262630" : "#d9770630"; e.currentTarget.style.transform = "none"; }}
//           >
//             <div>
//               <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)" }}>{d.label}</div>
//               <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
//                 {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
//                 {d.status === "overdue" && <span style={{ color: "#dc2626", fontWeight: 700, marginLeft: 8 }}>⚠ Overdue</span>}
//                 <span style={{ marginLeft: 8 }}>· Booking #{d.bookingId}</span>
//                 {(d.tax_amount || 0) > 0 && <span style={{ color: "#d97706", marginLeft: 8 }}>incl. tax</span>}
//               </div>
//             </div>
//             <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
//               <div style={{ fontSize: 18, fontWeight: 800, color: d.status === "overdue" ? "#dc2626" : "#d97706" }}>
//                 {fmtExact(d.displayAmount)}
//               </div>
//               <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Tap to pay →</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </ElegantCard>
//   );
// };

// // ── Booking Card ────────────────────────────────────────────
// const BookingCard = ({ booking, onPay, onCancel, isBroker, fmtExact, token, primaryColor }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [cancelling, setCancelling] = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);

//   const cfg = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
//   const plan = booking.payment_plan;
//   const isConfirmed = booking.booking_status === "confirmed";
//   const isPending = booking.booking_status === "pending";

//   const paidMilestones = (booking.milestones || []).filter((m) => m.status === "paid");
//   const paidTotal = paidMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const allMilestones = booking.milestones || [];
//   const totalFromMs = allMilestones.reduce((sum, m) => sum + msAmount(m), 0);
//   const balanceFromMs = totalFromMs - paidTotal;
//   const grandTotal = parseFloat(booking.total_amount || 0) || totalFromMs;

//   const displayAmt = (() => {
//     if (isConfirmed && paidTotal > 0) return paidTotal;
//     if (isConfirmed) return grandTotal;
//     const dp = parseFloat(booking.down_payment_amount || 0);
//     if (dp > 0) return dp;
//     return grandTotal;
//   })();

//   const amountLabel = isPending
//     ? "Down Payment Due"
//     : isConfirmed && paidTotal > 0
//       ? `Paid (${paidMilestones.length} milestone${paidMilestones.length > 1 ? "s" : ""})`
//       : isConfirmed ? "Total Amount" : "Amount";

//   return (
//     <ElegantCard hover>
//       <div>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
//           <div style={{ flex: 1 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
//               <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//                 Unit {booking.plot_number}
//               </span>
//               <span style={{
//                 padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
//                 background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
//               }}>
//                 {cfg.label}
//               </span>
//             </div>
//             <div style={{ marginBottom: 4, fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
//               <span>{booking.plot_type}</span>
//               {booking.area && <span>· {booking.area} sqft</span>}
//               {booking.direction && <span>· {booking.direction}</span>}
//             </div>
//             {isBroker && (booking.client_name || booking.client_phone) && (
//               <div style={{
//                 marginTop: 10, padding: "10px 14px", background: `${primaryColor}06`,
//                 border: `1px solid ${primaryColor}18`, borderRadius: 12, fontSize: 12,
//               }}>
//                 <span style={{ color: "var(--text-muted)" }}>Client: </span>
//                 <span style={{ color: primaryColor, fontWeight: 600 }}>{booking.client_name}</span>
//                 {booking.client_phone && <span style={{ color: "var(--text-muted)" }}> · {booking.client_phone}</span>}
//                 {booking.client_email && <span style={{ color: "var(--text-muted)" }}> · {booking.client_email}</span>}
//               </div>
//             )}
//             <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
//               #{booking.id} · {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//             </div>
//           </div>

//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{amountLabel}</div>
//             <div style={{ fontSize: 24, fontWeight: 800, color: primaryColor }}>{fmtExact(displayAmt)}</div>
//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs > 0.01 && (
//               <div style={{ fontSize: 12, color: "#d97706", marginTop: 4, fontWeight: 600 }}>Balance: {fmtExact(balanceFromMs)}</div>
//             )}
//             {isConfirmed && plan && paidTotal > 0 && balanceFromMs <= 0.01 && (
//               <div style={{ fontSize: 12, color: "#16a34a", marginTop: 4, fontWeight: 600 }}>✓ Fully paid (incl. tax)</div>
//             )}
//             {isPending && grandTotal > 0 && (
//               <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Grand total: {fmtExact(grandTotal)}</div>
//             )}
//           </div>
//         </div>

//         {isBroker && booking.commission_amount && (
//           <div style={{
//             display: "flex", alignItems: "center", gap: 10, marginTop: 14,
//             padding: "10px 14px", background: `${primaryColor}06`,
//             border: `1px solid ${primaryColor}18`, borderRadius: 12,
//           }}>
//             <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Commission:</span>
//             <span style={{ fontSize: 15, fontWeight: 800, color: primaryColor }}>{fmtExact(booking.commission_amount)}</span>
//             {booking.commission_status && (() => {
//               const cs = COMM_CFG[booking.commission_status] || COMM_CFG.pending;
//               return <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: cs.color }}>{cs.label}</span>;
//             })()}
//           </div>
//         )}

//         <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
//           {isPending && (
//             <ElegantButton onClick={() => onPay(booking.id)} size="sm">
//               💳 Complete Payment
//             </ElegantButton>
//           )}
//           <ElegantButton variant="secondary" onClick={() => setExpanded((e) => !e)} size="sm">
//             {expanded ? "▲ Less" : "▼ Payment Schedule"}
//           </ElegantButton>
//           {isPending && !confirmCancel && (
//             <ElegantButton variant="ghost" onClick={() => setConfirmCancel(true)} size="sm">
//               ✕ Cancel
//             </ElegantButton>
//           )}
//           {isPending && confirmCancel && (
//             <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
//               <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Are you sure?</span>
//               <ElegantButton variant="secondary" onClick={async () => {
//                 setCancelling(true); await onCancel(booking.id); setCancelling(false); setConfirmCancel(false);
//               }} size="sm" loading={cancelling}>
//                 Yes, Cancel
//               </ElegantButton>
//               <ElegantButton variant="ghost" onClick={() => setConfirmCancel(false)} size="sm">
//                 No
//               </ElegantButton>
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--card-border)" }}>
//           <MilestoneTracker bookingId={booking.id} token={token} fmtExact={fmtExact} booking={booking} primaryColor={primaryColor} />
//         </div>
//       )}
//     </ElegantCard>
//   );
// };

// // ── Profile Panel ───────────────────────────────────────────
// const ProfilePanel = ({ user, onSaved, showToast, primaryColor }) => {
//   const [form, setForm] = useState({
//     name: user.name || "", phone: user.phone || "",
//     current_password: "", new_password: "", confirm_password: "",
//   });
//   const [saving, setSaving] = useState(false);

//   const handleSave = async () => {
//     if (form.new_password && form.new_password !== form.confirm_password) {
//       showToast("⚠️ New passwords do not match", "warning", 3500); return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name, phone: form.phone };
//       if (form.new_password) { payload.current_password = form.current_password; payload.new_password = form.new_password; }
//       const res = await fetch(`${API_BASE}/user/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Update failed");
//       showToast("✅ Profile updated successfully", "success", 3500);
//       setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
//       onSaved({ ...user, name: form.name, phone: form.phone });
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSaving(false);
//   };

//   const isBroker = user.role === "broker";

//   const inputStyle = (readOnly = false) => ({
//     width: "100%", padding: "12px 16px", marginBottom: 12,
//     background: readOnly ? "var(--page-bg)" : "var(--card-bg)",
//     border: `1.5px solid var(--card-border)`, borderRadius: 12,
//     color: readOnly ? "var(--text-muted)" : "var(--text-dark)",
//     fontSize: 14, outline: "none", boxSizing: "border-box",
//     cursor: readOnly ? "not-allowed" : "text",
//     fontFamily: "var(--font-body, inherit)",
//     transition: "border-color 0.2s ease",
//   });

//   return (
//     <ElegantCard>
//       <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
//         <div style={{
//           width: 72, height: 72, borderRadius: "50%",
//           background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           fontSize: 28, fontWeight: 800, color: "#fff", flexShrink: 0,
//           boxShadow: `0 4px 14px ${primaryColor}30`,
//         }}>
//           {user.name?.[0]?.toUpperCase()}
//         </div>
//         <div>
//           <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//             {user.name}
//           </div>
//           <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{user.email}</div>
//           <div style={{
//             fontSize: 13, color: primaryColor, marginTop: 4, fontWeight: 600,
//             textTransform: "capitalize",
//           }}>
//             {isBroker ? `Broker${user.broker_company ? " · " + user.broker_company : ""}` : "Buyer"}
//           </div>
//         </div>
//       </div>

//       {isBroker && (
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
//           {[
//             { label: "Commission Rate", value: `${user.commission_rate || 2}%` },
//             { label: "Account Status", value: user.status || "active", color: user.status === "active" ? "#16a34a" : "#dc2626" },
//           ].map(({ label, value, color }) => (
//             <div key={label} style={{ padding: "12px 16px", background: `${primaryColor}06`, border: `1px solid ${primaryColor}15`, borderRadius: 12 }}>
//               <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
//               <div style={{ fontSize: 16, fontWeight: 700, color: color || primaryColor, marginTop: 4 }}>{value}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 16, fontFamily: "var(--font-heading, inherit)" }}>
//         Edit Profile
//       </div>

//       <input
//         type="text" placeholder="Full Name *" value={form.name}
//         onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//         style={inputStyle()}
//       />
//       <input value={user.email} readOnly placeholder="Email" style={inputStyle(true)} />
//       <input
//         type="tel" placeholder="Phone Number" value={form.phone}
//         onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
//         style={inputStyle()}
//       />

//       <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, marginTop: 8, letterSpacing: "0.8px", textTransform: "uppercase" }}>
//         Change Password (leave blank to keep current)
//       </div>
//       <input type="password" placeholder="Current Password" value={form.current_password}
//         onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
//         style={inputStyle()} />
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//         <input type="password" placeholder="New Password" value={form.new_password}
//           onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
//           style={inputStyle()} />
//         <input type="password" placeholder="Confirm Password" value={form.confirm_password}
//           onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
//           style={inputStyle()} />
//       </div>

//       <ElegantButton onClick={handleSave} disabled={saving || !form.name} loading={saving} size="lg" style={{ width: "100%", marginTop: 8 }}>
//         Save Changes →
//       </ElegantButton>
//     </ElegantCard>
//   );
// };

// // ── Broker Stats ────────────────────────────────────────────
// const BrokerStats = ({ bookings, fmtExact, primaryColor }) => {
//   const commPending = bookings.filter((b) => b.commission_status === "pending").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commApproved = bookings.filter((b) => b.commission_status === "approved").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
//   const commPaid = bookings.filter((b) => b.commission_status === "paid").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
//       {[
//         { label: "Pending Commission", value: fmtExact(commPending), color: "#d97706", icon: "⏳" },
//         { label: "Approved Commission", value: fmtExact(commApproved), color: "#2563eb", icon: "✓" },
//         { label: "Commission Paid", value: fmtExact(commPaid), color: "#16a34a", icon: "💰" },
//         { label: "Total Clients", value: bookings.length, color: primaryColor, icon: "👥" },
//       ].map(({ label, value, color, icon }) => (
//         <ElegantCard key={label}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//             <span style={{ fontSize: 24 }}>{icon}</span>
//             <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
//           </div>
//           <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
//         </ElegantCard>
//       ))}
//     </div>
//   );
// };

// // ── Notifications (unchanged logic, styled elegantly) ──────
// const NOTIF_CFG = {
//   payment_reminder: { color: "#d97706", label: "Payment Reminder" },
//   booking_confirmed: { color: "#16a34a", label: "Booking Confirmed" },
//   booking_cancelled: { color: "#dc2626", label: "Booking Cancelled" },
//   project_launch: { color: null, label: "Project Launch" },
//   offer: { color: "#7c3aed", label: "Special Offer" },
//   general: { color: null, label: "General" },
// };

// const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate, onSwitchToBookings, primaryColor }) => {
//   const cfg = notif ? { ...NOTIF_CFG[notif.type] || NOTIF_CFG.general } : NOTIF_CFG.general;
//   if (!cfg.color) cfg.color = primaryColor;

//   useEffect(() => {
//     if (!notif) return;
//     if (!notif.is_read) onMarkRead(notif.id);
//     const onKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [notif?.id]);

//   if (!notif) return null;

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   };

//   const handleViewBooking = () => {
//     onClose();
//     if (notif.type === "payment_reminder") onNavigate(`/payment/${notif.booking_id}`);
//     else onSwitchToBookings(notif.booking_id);
//   };

//   return (
//     <div onClick={onClose} style={{
//       position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)",
//       backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
//     }}>
//       <div onClick={(e) => e.stopPropagation()} style={{
//         maxWidth: 540, width: "100%", background: "var(--card-bg)",
//         borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
//         borderTop: `3px solid ${cfg.color}`,
//       }}>
//         <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)" }}>
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
//               <div style={{
//                 width: 48, height: 48, borderRadius: 16, flexShrink: 0,
//                 background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: 22,
//               }}>🔔</div>
//               <div>
//                 <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//                   {notif.title}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
//                   <span style={{
//                     padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
//                     background: `${cfg.color}12`, color: cfg.color,
//                   }}>{cfg.label}</span>
//                   <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(notif.created_at)}</span>
//                 </div>
//               </div>
//             </div>
//             <button onClick={onClose} style={{
//               background: "var(--page-bg)", border: "1px solid var(--card-border)",
//               color: "var(--text-muted)", width: 34, height: 34, borderRadius: 10,
//               cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
//             }}>×</button>
//           </div>
//         </div>
//         <div style={{ padding: "20px 24px" }}>
//           <div style={{
//             fontSize: 14, color: "var(--text-dark)", lineHeight: 1.7,
//             background: "var(--page-bg)", border: "1px solid var(--card-border)",
//             borderRadius: 16, padding: 18, whiteSpace: "pre-line",
//           }}>
//             {notif.message}
//           </div>
//           <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
//             {notif.booking_id && (
//               <ElegantButton onClick={handleViewBooking}>
//                 {notif.type === "payment_reminder" ? "Complete Payment →" : "View Booking →"}
//               </ElegantButton>
//             )}
//             <ElegantButton variant="secondary" onClick={onClose}>
//               Close
//             </ElegantButton>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const NotificationsTab = ({ notifications, loading, unreadCount, onMarkRead, onMarkAllRead, onNavigate, onSwitchToBookings, primaryColor }) => {
//   const [filter, setFilter] = useState("all");
//   const [selectedNotif, setSelectedNotif] = useState(null);

//   const filtered = notifications.filter((n) => {
//     if (filter === "unread") return !n.is_read;
//     if (filter === "read") return n.is_read;
//     return true;
//   });

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const m = Math.floor(diff / 60000);
//     if (m < 1) return "Just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
//   };

//   if (loading) return (
//     <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
//       Loading notifications...
//     </div>
//   );

//   return (
//     <div>
//       {selectedNotif && (
//         <NotificationModal notif={selectedNotif} onClose={() => setSelectedNotif(null)}
//           onMarkRead={onMarkRead} onNavigate={onNavigate} onSwitchToBookings={onSwitchToBookings}
//           primaryColor={primaryColor} />
//       )}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
//         <div style={{ display: "flex", gap: 6, background: "var(--page-bg)", padding: 4, borderRadius: 12, border: "1px solid var(--card-border)" }}>
//           {[["all", "All"], ["unread", "Unread"], ["read", "Read"]].map(([val, label]) => (
//             <button key={val} onClick={() => setFilter(val)} style={{
//               padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
//               background: filter === val ? `${primaryColor}12` : "transparent",
//               color: filter === val ? primaryColor : "var(--text-muted)",
//               border: filter === val ? `1px solid ${primaryColor}25` : "1px solid transparent",
//               fontFamily: "var(--font-body, inherit)",
//             }}>
//               {label}
//               {val === "unread" && unreadCount > 0 && (
//                 <span style={{
//                   marginLeft: 6, padding: "1px 6px", borderRadius: 10, fontSize: 10,
//                   background: "#d97706", color: "#fff", fontWeight: 800,
//                 }}>
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//         {unreadCount > 0 && (
//           <ElegantButton variant="secondary" onClick={onMarkAllRead} size="sm">
//             ✓ Mark all read
//           </ElegantButton>
//         )}
//       </div>

//       {filtered.length === 0 && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: 52, marginBottom: 12 }}>🔔</div>
//           <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-dark)", marginBottom: 8, fontFamily: "var(--font-heading, inherit)" }}>
//             {filter === "unread" ? "No unread notifications" : "No notifications yet"}
//           </div>
//           <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Payment reminders and booking updates will appear here.</div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//         {filtered.map((n) => {
//           const cfg = { ...NOTIF_CFG[n.type] || NOTIF_CFG.general };
//           if (!cfg.color) cfg.color = primaryColor;
//           return (
//             <div key={n.id} onClick={() => setSelectedNotif(n)} style={{
//               display: "flex", gap: 14, alignItems: "flex-start",
//               padding: "16px 18px", borderRadius: 16, cursor: "pointer",
//               background: n.is_read ? "var(--card-bg)" : `${cfg.color}04`,
//               border: `1px solid ${n.is_read ? "var(--card-border)" : cfg.color + "25"}`,
//               transition: "all 0.2s ease", position: "relative",
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color + "40"; e.currentTarget.style.transform = "translateX(4px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.borderColor = n.is_read ? "var(--card-border)" : cfg.color + "25"; e.currentTarget.style.transform = "none"; }}
//             >
//               {!n.is_read && (
//                 <div style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
//               )}
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
//                   <span style={{ fontSize: 14, fontWeight: n.is_read ? 600 : 700, color: n.is_read ? "var(--text-muted)" : "var(--text-dark)" }}>
//                     {n.title}
//                   </span>
//                   <span style={{
//                     padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
//                     background: `${cfg.color}12`, color: cfg.color,
//                   }}>{cfg.label}</span>
//                 </div>
//                 <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 8 }}>
//                   {n.message.length > 100 ? n.message.slice(0, 100) + "…" : n.message}
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
//                   <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(n.created_at)}</span>
//                   <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>Click to read →</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Feedback Tab ────────────────────────────────────────────
// const CATEGORY_CFG = {
//   general: { color: "#6b7280" },
//   service: { color: "#2563eb" },
//   unit: { color: null },
//   payment: { color: "#d97706" },
//   staff: { color: "#7c3aed" },
// };

// const StarRating = ({ value, onChange, primaryColor }) => (
//   <div style={{ display: "flex", gap: 6 }}>
//     {[1, 2, 3, 4, 5].map((s) => (
//       <button key={s} type="button" onClick={() => onChange(s)} style={{
//         background: "none", border: "none", cursor: "pointer", fontSize: 28,
//         padding: "0 2px", color: s <= value ? primaryColor : "var(--card-border)",
//         transition: "all 0.15s ease",
//       }}>★</button>
//     ))}
//   </div>
// );

// const FeedbackTab = ({ feedbacks, bookings, token, onSubmitted, showToast, primaryColor }) => {
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.message.trim()) { showToast("⚠️ Subject and message are required", "warning", 3500); return; }
//     setSubmitting(true);
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ ...form, booking_id: form.booking_id || undefined }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Submission failed.");
//       showToast("🙏 Thank you! Your feedback has been submitted", "success", 4000);
//       setForm({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
//       setShowForm(false);
//       onSubmitted(data.feedback);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//     setSubmitting(false);
//   };

//   const inputStyle = {
//     width: "100%", padding: "12px 16px", marginBottom: 12,
//     background: "var(--card-bg)", border: "1.5px solid var(--card-border)", borderRadius: 12,
//     color: "var(--text-dark)", fontSize: 14, outline: "none", boxSizing: "border-box",
//     fontFamily: "var(--font-body, inherit)", transition: "border-color 0.2s ease", 
//   };

//   const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed");

//   return (
//     <div>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
//         <div>
//           <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>Your Feedback</div>
//           <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Share your experience with us</div>
//         </div>
//         <ElegantButton onClick={() => setShowForm((f) => !f)}>
//           {showForm ? "✕ Cancel" : "+ New Feedback"}
//         </ElegantButton>
//       </div>

//       {showForm && (
//         <ElegantCard hover style={{ borderColor: `${primaryColor}30`, marginBottom: 24 }}>
//           <div style={{ fontSize: 15, fontWeight: 700, color: primaryColor, marginBottom: 20 }}>New Feedback</div>
          
//           <div style={{ marginBottom: 16 }}>
//             <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.5px" }}>Rating *</div>
//             <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} primaryColor={primaryColor} />
//             <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
//               {["", "Very Poor", "Poor", "Average", "Good", "Excellent"][form.rating]}
//             </div>
//           </div>

//           <div style={{ marginBottom: 14 }}>
//             <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.5px" }}>Category *</div>
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//               {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => {
//                 const catColor = cfg.color || primaryColor;
//                 const isActive = form.category === cat;
//                 return (
//                   <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} style={{
//                     padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600,
//                     background: isActive ? `${catColor}12` : "transparent",
//                     color: isActive ? catColor : "var(--text-muted)",
//                     border: `1px solid ${isActive ? catColor + "40" : "var(--card-border)"}`,
//                     textTransform: "capitalize", fontFamily: "var(--font-body, inherit)",
//                     transition: "all 0.15s ease",
//                   }}>
//                     {cat}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {confirmedBookings.length > 0 && (
//             <select value={form.booking_id} onChange={(e) => setForm((f) => ({ ...f, booking_id: e.target.value }))}
//               style={{ ...inputStyle, marginBottom: 12, cursor: "pointer" }}>
//               <option value="">Select booking (optional)</option>
//               {confirmedBookings.map((b) => <option key={b.id} value={b.id}>Unit {b.plot_number} — Booking #{b.id}</option>)}
//             </select>
//           )}

//           <input type="text" placeholder="Subject *" value={form.subject}
//             onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inputStyle} />
          
//           <textarea placeholder="Your message..." value={form.message}
//             onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4}
//             style={{ ...inputStyle, resize: "vertical" }} />

//           <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
//             <ElegantButton onClick={handleSubmit} loading={submitting}>
//               Submit Feedback →
//             </ElegantButton>
//             <ElegantButton variant="secondary" onClick={() => setShowForm(false)}>
//               Cancel
//             </ElegantButton>
//           </div>
//         </ElegantCard>
//       )}

//       {feedbacks.length === 0 && !showForm && (
//         <div style={{ textAlign: "center", padding: "60px 0" }}>
//           <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
//           <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-dark)", marginBottom: 8, fontFamily: "var(--font-heading, inherit)" }}>No feedback yet</div>
//           <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Share your experience to help us improve.</div>
//         </div>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//         {feedbacks.map((fb) => {
//           const catColor = CATEGORY_CFG[fb.category]?.color || primaryColor;
//           const ratingColor = fb.rating >= 4 ? "#16a34a" : fb.rating >= 3 ? "#d97706" : "#dc2626";
//           const statusColor = fb.status === "resolved" ? "#16a34a" : fb.status === "reviewed" ? "#2563eb" : "#d97706";
//           return (
//             <ElegantCard key={fb.id}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
//                 <div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
//                     <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//                       {fb.subject}
//                     </span>
//                     <span style={{
//                       padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
//                       background: `${catColor}12`, color: catColor,
//                     }}>{fb.category}</span>
//                     <span style={{
//                       padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
//                       background: `${statusColor}12`, color: statusColor,
//                     }}>{fb.status}</span>
//                   </div>
//                   <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
//                     {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
//                     {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                   </div>
//                 </div>
//                 <div style={{ color: ratingColor, fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{"★".repeat(fb.rating)}</div>
//               </div>
//               <div style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6, marginBottom: fb.admin_reply ? 12 : 0 }}>
//                 {fb.message}
//               </div>
//               {fb.admin_reply && (
//                 <div style={{ marginTop: 12, padding: "12px 16px", background: "#16a34a08", border: "1px solid #16a34a20", borderRadius: 12 }}>
//                   <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>
//                     Admin Reply
//                   </div>
//                   <div style={{ fontSize: 13, color: "var(--text-dark)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{fb.admin_reply}</div>
//                 </div>
//               )}
//             </ElegantCard>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard ──────────────────────────────────────────
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user = useSelector(selectUser);
//   const { settings } = useSettings();

//   const primaryColor = settings?.primary_color || "#c9a96e";

//   const [bookings, setBookings] = useState([]);
//   const [milestoneMap, setMilestoneMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [activeTab, setActiveTab] = useState("bookings");
//   const [notifications, setNotifications] = useState([]);
//   const [notifsLoading, setNotifsLoading] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [paymentsLoading, setPaymentsLoading] = useState(false);
//   const [unreadMessages, setUnreadMessages] = useState(0);
//   const [invoices, setInvoices] = useState([]);

//   const { showToast } = useToast();
//   const { wishlist, wishedIds, toggle: toggleWishRaw, loading: wishLoading } = useWishlist(user?.token);

//   const handleWishlistToggle = useCallback(async (plotId) => {
//     const wasWished = wishedIds instanceof Set && wishedIds.has(Number(plotId));
//     await toggleWishRaw(Number(plotId));
//     showToast(wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
//       wasWished ? "wishlist_remove" : "wishlist_add", 2800);
//   }, [wishedIds, toggleWishRaw, showToast]);

//   const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", position: "before" });

//   const fmt = useCallback((n) => makeFmt(currency.symbol, currency.position)(n), [currency]);
//   const fmtExact = useCallback((n) => makeFmtExact(currency.symbol, currency.position)(n), [currency]);

//   const isBroker = user?.role === "broker";

//   const fetchMilestones = useCallback(async (bookingsList) => {
//     const targets = bookingsList.filter((b) => b.booking_status === "confirmed" && b.payment_plan_id);
//     if (!targets.length) return;
//     const results = await Promise.all(
//       targets.map((b) =>
//         fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
//           headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
//         }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
//       ),
//     );
//     const map = {};
//     targets.forEach((b, i) => { if (results[i]) map[b.id] = results[i]; });
//     setMilestoneMap(map);
//   }, [user?.token]);

//   const switchToBookings = useCallback((bookingId) => {
//     setActiveTab("bookings");
//     if (!bookingId) return;
//     setTimeout(() => {
//       const el = document.getElementById(`booking-card-${bookingId}`);
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//         el.style.boxShadow = `0 0 0 2px ${primaryColor}, 0 0 24px ${primaryColor}30`;
//         el.style.transition = "box-shadow 0.3s";
//         setTimeout(() => { el.style.boxShadow = ""; }, 3000);
//       }
//     }, 150);
//   }, [primaryColor]);

//   const fetchInvoices = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE}/invoices`, { headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setInvoices(Array.isArray(data) ? data : []);
//     } catch (_) { }
//   }, [user?.token]);

//   const fetchBookings = useCallback(async () => {
//     setLoading(true); setError("");
//     try {
//       const res = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) throw new Error("Failed to load bookings");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setBookings(list);
//       fetchMilestones(list);
//     } catch (e) {
//       setError(e.message);
//       showToast("❌ Could not load bookings. Please retry.", "error", 4000);
//     } finally { setLoading(false); }
//   }, [user?.token, fetchMilestones, showToast]);

//   const fetchPayments = useCallback(async () => {
//     setPaymentsLoading(true);
//     try {
//       const [txnRes, bookRes] = await Promise.all([
//         fetch(`${API_BASE}/payment/history`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//         fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
//       ]);
//       const txns = txnRes.ok ? await txnRes.json() : [];
//       const booksRaw = bookRes.ok ? await bookRes.json() : [];
//       const books = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
//       const txnList = Array.isArray(txns) ? txns : [];
//       const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
//       const missingTxns = books
//         .filter((b) => b.booking_status === "confirmed" && !txnBookingIds.has(String(b.id)))
//         .map((b) => ({
//           id: `booking_${b.id}`, booking_id: b.id,
//           amount: b.down_payment_amount || b.total_amount || 0,
//           currency: "INR", status: "success", mode: "manual",
//           gateway: "cash / manual", paid_at: b.created_at, _synthetic: true,
//           booking: { id: b.id, plot_number: b.plot_number, plot_type: b.plot_type, booking_status: b.booking_status },
//         }));
//       setPayments([...txnList, ...missingTxns]);
//     } catch (_) { } finally { setPaymentsLoading(false); }
//   }, [user?.token]);

//   const fetchFeedbacks = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       setFeedbacks(Array.isArray(data) ? data : data.data || []);
//     } catch (_) { }
//   }, [user?.token]);

//   const fetchNotifications = useCallback(async () => {
//     setNotifsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : data.data || [];
//       setNotifications(list);
//       setUnreadCount(list.filter((n) => !n.is_read).length);
//     } catch (_) { } finally { setNotifsLoading(false); }
//   }, [user?.token]);

//   useEffect(() => {
//     if (!user?.token) { navigate("/"); return; }
//     Promise.all([
//       fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((d) => { if (d) setCurrency({ symbol: d.symbol || "₹", code: d.code || "INR", position: d.position || "before" }); })
//         .catch(() => { }),
//       fetchBookings(),
//       fetchNotifications(),
//       fetchFeedbacks(),
//       fetchPayments(),
//       fetchInvoices(),
//     ]);

//     const params = new URLSearchParams(window.location.search);
//     const bookingId = params.get("booking");
//     const sessionId = params.get("session_id");
//     if (bookingId && sessionId) {
//       const confirmPayment = async () => {
//         try {
//           await fetch(`${API_BASE}/payment/stripe/confirm`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
//             body: JSON.stringify({ booking_id: bookingId, session_id: sessionId }),
//           });
//           await Promise.all([fetchBookings(), fetchNotifications(), fetchPayments(), fetchInvoices()]);
//           showToast("🎉 Payment confirmed! Your booking is now active.", "booking", 5000);
//         } catch (_) { }
//       };
//       confirmPayment();
//       window.history.replaceState({}, "", window.location.pathname);
//     }

//     fetch(`${API_BASE}/messages/unread`, { headers: { Authorization: `Bearer ${user.token}` } })
//       .then((r) => r.json()).then((d) => setUnreadMessages(d.unread || 0)).catch(() => { });
//   }, [user?.token]);

//   const markRead = async (id) => {
//     try {
//       await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (_) { }
//   };

//   const markAllRead = async () => {
//     try {
//       await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       showToast("✅ All notifications marked as read", "success", 2500);
//     } catch (_) { }
//   };

//   const handlePay = (id) => navigate(`/payment/${id}`);
//   const handleLogout = () => {
//     showToast("👋 Logged out successfully", "info", 2500);
//     setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 600);
//   };
//   const handleSaved = (updated) => dispatch(setUser(updated));
//   const handleCancel = async (bookingId) => {
//     try {
//       const res = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Cancellation failed.");
//       setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, booking_status: "cancelled" } : b));
//       showToast("✅ Booking cancelled successfully", "success", 3500);
//     } catch (e) { showToast("❌ " + e.message, "error", 4000); }
//   };

//   const confirmed = bookings.filter((b) => b.booking_status === "confirmed").length;
//   const pending = bookings.filter((b) => b.booking_status === "pending").length;

//   const totalInvested = bookings
//     .filter((b) => b.booking_status === "confirmed")
//     .reduce((s, b) => {
//       const msData = milestoneMap[b.id];
//       if (msData?.milestones?.length) {
//         const paidSum = msData.milestones.filter((m) => m.status === "paid").reduce((ms, m) => ms + msAmount(m), 0);
//         if (paidSum > 0) return s + paidSum;
//         return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//       }
//       return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
//     }, 0);

//   const tabs = [
//     { id: "bookings", label: isBroker ? "Client Bookings" : "My Bookings", count: bookings.length },
//     { id: "wishlist", label: "Wishlist", count: wishlist.length },
//     { id: "payments", label: "Payments", count: 0 },
//     { id: "invoices", label: "Invoices", count: invoices.length },
//     { id: "notifications", label: "Notifications", count: unreadCount },
//     { id: "feedback", label: "Feedback", count: 0 },
//     { id: "messages", label: "Messages", count: unreadMessages },
//     { id: "profile", label: "My Profile", count: 0 },
//   ];

//   const logoUrl = settings?.app_logo_dark_url || settings?.app_logo_light_url || null;
//   const appName = settings?.app_name || "Dashboard";

//   // Add CSS animation styles
//   useEffect(() => {
//     const style = document.createElement('style');
//     style.textContent = `
//       @keyframes spin {
//         to { transform: rotate(360deg); }
//       }
//     `;
//     document.head.appendChild(style);
//     return () => document.head.removeChild(style);
//   }, []);

//   return (
//     <div style={{
//       minHeight: "100vh",
//       background: "var(--page-bg)",
//       fontFamily: "var(--font-body, 'Jost', sans-serif)",
//       color: "var(--text-dark)",
//     }}>
//       {/* Header */}
//       <div style={{
//         background: "var(--card-bg)",
//         borderBottom: "1px solid var(--card-border)",
//         padding: "0 28px",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         height: 70,
//         position: "sticky",
//         top: 0,
//         zIndex: 100,
//         backdropFilter: "blur(12px)",
//       }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
//           <button onClick={() => navigate(-1)} style={{
//             background: "var(--page-bg)",
//             border: "1px solid var(--card-border)",
//             color: "var(--text-muted)",
//             cursor: "pointer",
//             padding: "8px 14px",
//             borderRadius: 12,
//             fontSize: 13,
//             fontWeight: 500,
//             fontFamily: "var(--font-body, inherit)",
//             transition: "all 0.2s ease",
//           }}
//             onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-color)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--primary-color)"; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = "var(--page-bg)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
//           >
//             ← Back
//           </button>
//           {logoUrl
//             ? <img src={logoUrl} alt={appName} style={{ height: 34, objectFit: "contain" }} />
//             : <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//               {isBroker ? "Broker Dashboard" : "My Dashboard"}
//             </span>
//           }
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-heading, inherit)" }}>
//               {user?.name}
//             </div>
//             <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
//               {isBroker ? `Broker${user?.broker_company ? " · " + user.broker_company : ""}` : "Buyer"}
//             </div>
//           </div>
//           <div style={{
//             width: 42, height: 42, borderRadius: "50%",
//             background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
//             display: "flex", alignItems: "center", justifyContent: "center",
//             fontWeight: 800, fontSize: 16, color: "#fff",
//             boxShadow: `0 2px 8px ${primaryColor}30`,
//           }}>
//             {user?.name?.[0]?.toUpperCase()}
//           </div>
//           <ElegantButton variant="secondary" onClick={handleLogout} size="sm">
//             Logout
//           </ElegantButton>
//           <button onClick={() => setActiveTab("notifications")} style={{
//             position: "relative", background: "var(--page-bg)", border: "1px solid var(--card-border)",
//             color: "var(--text-muted)", width: 40, height: 40, borderRadius: 12,
//             cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
//           }}>
//             🔔
//             {unreadCount > 0 && (
//               <span style={{
//                 position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 10,
//                 background: "#d97706", color: "#fff", fontSize: 10, fontWeight: 800,
//                 display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
//               }}>
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
//         {/* Welcome */}
//         <div style={{ marginBottom: 28 }}>
//           <div style={{
//             fontSize: 32, fontWeight: 800, color: "var(--text-dark)",
//             letterSpacing: "-0.5px", fontFamily: "var(--font-heading, inherit)",
//           }}>
//             Welcome back, {user?.name?.split(" ")[0]}
//           </div>
//           <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
//             {isBroker ? "Manage your client bookings and track your commissions." : "Track your property bookings and payments."}
//           </div>
//         </div>

//         {/* Stat cards */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
//           <StatCard icon="📋" label="Total Bookings" value={bookings.length} color={primaryColor} />
//           <StatCard icon="✓" label="Confirmed" value={confirmed} color="#16a34a" />
//           <StatCard icon="⏳" label="Pending Payment" value={pending} color="#d97706" />
//           {!isBroker && <StatCard icon="💰" label="Amount Invested" value={fmtExact(totalInvested)} color={primaryColor} />}
//         </div>

//         {isBroker && bookings.length > 0 && <BrokerStats bookings={bookings} fmtExact={fmtExact} primaryColor={primaryColor} />}

//         {/* Tabs */}
//         <div style={{
//           display: "flex", gap: 6, marginBottom: 28,
//           background: "var(--card-bg)", padding: 6, borderRadius: 18,
//           border: "1px solid var(--card-border)", overflowX: "auto",
//         }}>
//           {tabs.map((t) => (
//             <TabButton
//               key={t.id}
//               active={activeTab === t.id}
//               onClick={() => setActiveTab(t.id)}
//               label={t.label}
//               count={t.count}
//               primaryColor={primaryColor}
//             />
//           ))}
//         </div>

//         {/* Tab Content */}
//         {activeTab === "bookings" && (
//           <div>
//             {loading && (
//               <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
//                 <div style={{ marginBottom: 16, fontSize: 40 }}>⏳</div>
//                 <div>Loading bookings...</div>
//               </div>
//             )}
//             {error && (
//               <div style={{
//                 padding: 16, background: "#dc262608", border: "1px solid #dc262625",
//                 borderRadius: 16, color: "#dc2626", fontSize: 14,
//                 display: "flex", alignItems: "center", justifyContent: "space-between",
//                 gap: 16, flexWrap: "wrap",
//               }}>
//                 <span>⚠ {error}</span>
//                 <ElegantButton variant="secondary" onClick={fetchBookings} size="sm">
//                   Retry
//                 </ElegantButton>
//               </div>
//             )}
//             {!loading && Object.keys(milestoneMap).length > 0 && (
//               <DuesBanner milestoneMap={milestoneMap} fmtExact={fmtExact} onNavigate={navigate} primaryColor={primaryColor} />
//             )}
//             {!loading && !error && bookings.length === 0 && (
//               <div style={{ textAlign: "center", padding: "80px 0" }}>
//                 <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
//                 <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-dark)", marginBottom: 10, fontFamily: "var(--font-heading, inherit)" }}>
//                   {isBroker ? "No client bookings yet" : "No bookings yet"}
//                 </div>
//                 <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
//                   {isBroker ? "Book a unit for your clients from the unit page." : "Browse available units to make your first booking."}
//                 </div>
//                 <ElegantButton onClick={() => navigate("/")}>
//                   Browse Units →
//                 </ElegantButton>
//               </div>
//             )}
//             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//               {!loading && bookings.map((b) => (
//                 <BookingCard key={b.id} booking={b} onPay={handlePay} onCancel={handleCancel}
//                   isBroker={isBroker} fmtExact={fmtExact} token={user?.token} primaryColor={primaryColor} />
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "wishlist" && (
//           <WishlistTab wishlist={wishlist} wishedIds={wishedIds} onToggle={handleWishlistToggle}
//             loading={wishLoading} token={user?.token} onNavigate={navigate} fmt={fmt} />
//         )}
//         {activeTab === "payments" && (
//           <PaymentsTab payments={payments} loading={paymentsLoading} fmt={fmt} fmtExact={fmtExact} user={user} />
//         )}
//         {activeTab === "invoices" && <InvoicesTab user={user} fmt={fmt} />}
//         {activeTab === "notifications" && (
//           <NotificationsTab
//             notifications={notifications} loading={notifsLoading} unreadCount={unreadCount}
//             onMarkRead={markRead} onMarkAllRead={markAllRead} onNavigate={navigate}
//             onSwitchToBookings={switchToBookings} primaryColor={primaryColor}
//           />
//         )}
//         {activeTab === "feedback" && (
//           <FeedbackTab feedbacks={feedbacks} bookings={bookings} token={user?.token}
//             showToast={showToast} onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])}
//             primaryColor={primaryColor} />
//         )}
//         {activeTab === "messages" && <MessagesTab user={user} />}
//         {activeTab === "profile" && (
//           <ProfilePanel user={user} onSaved={handleSaved} showToast={showToast} primaryColor={primaryColor} />
//         )}
//       </div>
//     </div>
//   );
// }


// UserDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser, clearUser } from "../redux/authSlice";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";
import { useWishlist } from "../hooks/useWishlist";
import WishlistTab from "./WishlistTab";
import MessagesTab from "./MessagesTab";
import InvoicesTab from "./InvoicesTab";
import PaymentsTab from "./PaymentsTab";
import { apiUrl, imgUrl } from "../apiUrl";
import "../styles/UserDashboard.css";

const API_BASE = `${apiUrl}/api`;

// ── Formatters ─────────────────────────────────────────────
const makeFmt = (symbol = "₹", position = "before") => (n) => {
  if (n == null) return "—";
  const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
};

const makeFmtExact = (symbol = "₹", position = "before") => (n) => {
  if (n == null) return "—";
  const num = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return position === "after" ? `${num} ${symbol}` : `${symbol}${num}`;
};

const STATUS_CFG = {
  confirmed: { color: "#16a34a", bg: "rgba(22,163,74,0.10)", label: "Confirmed" },
  pending: { color: "#d97706", bg: "rgba(217,119,6,0.10)", label: "Pending Payment" },
  cancelled: { color: "#dc2626", bg: "rgba(220,38,38,0.10)", label: "Cancelled" },
};
const COMM_CFG = {
  pending: { color: "#d97706", label: "Pending Approval" },
  approved: { color: "#2563eb", label: "Approved" },
  paid: { color: "#16a34a", label: "Paid" },
  rejected: { color: "#dc2626", label: "Rejected" },
};

const msAmount = (m) => parseFloat(m.total_with_tax ?? m.amount ?? 0);

// ── Elegant Card Component ─────────────────────────────────
const ElegantCard = ({ children, noPadding, hover, onClick, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className={`elegant-card ${hover ? 'elegant-card-hover' : ''} ${noPadding ? 'elegant-card-no-padding' : 'elegant-card-padding'} ${onClick ? 'elegant-card-clickable' : ''} ${className || ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// ── Elegant Button ─────────────────────────────────────────
const ElegantButton = ({ children, variant = "primary", onClick, disabled, loading, size = "md" }) => {
  const sizeClass = `elegant-btn-${size}`;
  const variantClass = `elegant-btn-${variant}`;
  
  return (
    <button
      className={`elegant-btn ${sizeClass} ${variantClass}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="elegant-btn-spinner"></span>}
      {children}
    </button>
  );
};

// ── Elegant Stat Card ──────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-card-content">
      <div className="stat-card-icon" style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}>
        {icon}
      </div>
      <div>
        <div className="stat-card-value" style={{ color }}>{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  </div>
);

// ── Tab Button ─────────────────────────────────────────────
const TabButton = ({ active, onClick, label, count, primaryColor }) => (
  <button
    onClick={onClick}
    className={`dashboard-tab ${active ? 'dashboard-tab-active' : 'dashboard-tab-inactive'}`}
  >
    {label}
    {count > 0 && (
      <span className={`dashboard-tab-count ${active ? 'dashboard-tab-count-active' : 'dashboard-tab-count-inactive'}`}>
        {count}
      </span>
    )}
  </button>
);

// ── Milestone Tracker (unchanged logic, just using CSS classes where possible) ──
const MilestoneTracker = ({ bookingId, token, fmtExact, booking, primaryColor }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId || !token) return;
    fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId, token]);

  if (!loading && (!data || !data.milestones?.length)) {
    const plan = booking?.payment_plan;
    const price = parseFloat(booking?.price || 0);
    if (!plan?.milestones?.length) {
      return (
        <div className="milestone-tracker">
          <div className="booking-card-expanded" style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 16px", background: "var(--page-bg)", borderRadius: "14px" }}>
            Full payment — no instalment plan selected
          </div>
        </div>
      );
    }
    const isConfirmed = booking.booking_status === "confirmed";
    const grandTotal = parseFloat(booking.total_amount || price);
    return (
      <div className="milestone-tracker">
        <div className="booking-card-expanded">
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
            Payment Schedule — {plan.name}
          </div>
          {plan.milestones.map((m, i) => {
            const amt = m.percentage ? (grandTotal * m.percentage) / 100 : m.fixed_amount;
            const isPaid = i === 0 && isConfirmed;
            const isDue = i === 0 && !isConfirmed;
            return (
              <MilestoneRow key={i} label={m.label} percentage={m.percentage}
                amount={amt} isPaid={isPaid} isDue={isDue} index={i}
                fmtExact={fmtExact} primaryColor={primaryColor} />
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) return <div className="milestone-tracker"><div className="booking-card-expanded" style={{ color: "var(--text-muted)", fontSize: 12, padding: 12 }}>Loading payment schedule...</div></div>;

  const { milestones } = data;
  const totalAmount = milestones.reduce((s, m) => s + msAmount(m), 0);
  const paidAmount = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + msAmount(m), 0);
  const balanceDue = totalAmount - paidAmount;
  const pct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <div className="milestone-tracker">
      <div className="booking-card-expanded">
        <div className="milestone-progress">
          <div className="milestone-progress-header">
            <span>Payment Progress (incl. taxes)</span>
            <span className="milestone-progress-percent">{pct}% complete</span>
          </div>
          <div className="milestone-progress-bar">
            <div className="milestone-progress-fill" style={{ width: `${pct}%`, background: primaryColor }} />
          </div>
          <div className="milestone-progress-stats">
            <span className="milestone-progress-paid">Paid: {fmtExact(paidAmount)}</span>
            <span className="milestone-progress-balance" style={{ color: balanceDue > 0 ? "#d97706" : "#16a34a" }}>
              {balanceDue > 0 ? `Balance: ${fmtExact(balanceDue)}` : "✓ Fully Paid"}
            </span>
          </div>
        </div>

        {milestones.map((m, i) => {
          const isPaid = m.status === "paid";
          const isOverdue = m.status === "overdue";
          const isWaived = m.status === "waived";
          const isDue = !isPaid && !isWaived &&
            i === milestones.findIndex((x) => x.status === "pending" || x.status === "overdue");
          return (
            <MilestoneRow
              key={m.id}
              label={m.label}
              percentage={m.percentage}
              amount={msAmount(m)}
              baseAmount={m.amount}
              taxAmount={m.tax_amount}
              extraFees={m.extra_fees}
              taxLabel={m.tax_label}
              taxRate={m.tax_rate}
              hasTax={(m.tax_amount || 0) > 0}
              isPaid={isPaid}
              isDue={isDue}
              isOverdue={isOverdue}
              isWaived={isWaived}
              dueDate={m.due_date}
              paidAt={m.paid_at}
              index={i}
              fmtExact={fmtExact}
              primaryColor={primaryColor}
            />
          );
        })}
      </div>
    </div>
  );
};

const MilestoneRow = ({
  label, percentage, amount, baseAmount, taxAmount, extraFees, taxLabel, taxRate, hasTax,
  isPaid, isDue, isOverdue, isWaived, dueDate, paidAt, index, fmtExact, primaryColor,
}) => {
  const [showTax, setShowTax] = useState(false);
  const textColor = isPaid ? primaryColor : isOverdue ? "#dc2626" : isWaived ? "var(--text-muted)" : isDue ? "var(--text-dark)" : "var(--text-muted)";

  const dotColor = isPaid ? primaryColor : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--card-border)";
  const dotBorder = isPaid ? primaryColor : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--card-border)";

  return (
    <div className="milestone-row">
      <div className="milestone-dot" style={{
        background: isPaid ? primaryColor : "transparent",
        border: `2px solid ${dotBorder}`,
        color: isPaid ? "#fff" : isOverdue ? "#dc2626" : isDue ? primaryColor : "var(--text-muted)",
      }}>
        {isPaid ? "✓" : isWaived ? "–" : index + 1}
      </div>
      <div className="milestone-content" style={{
        background: isPaid ? `${primaryColor}06` : "var(--page-bg)",
        border: `1px solid ${isPaid ? primaryColor + "20" : isOverdue ? "#dc262620" : isDue ? primaryColor + "18" : "var(--card-border)"}`,
      }}>
        <div className="milestone-header">
          <div className="milestone-info">
            <div className="milestone-label" style={{ color: textColor }}>{label}</div>
            <div className="milestone-meta">
              {percentage ? `${percentage}% of total` : ""}
              {dueDate && !isPaid && (
                <span style={{ marginLeft: percentage ? 8 : 0 }}>
                  Due: {dueDate}
                  {isOverdue && <span style={{ color: "#dc2626", fontWeight: 700, marginLeft: 6 }}>⚠ Overdue</span>}
                </span>
              )}
              {isPaid && paidAt && <span style={{ color: "#16a34a", marginLeft: 6 }}>✓ Paid {paidAt}</span>}
              {isDue && !isOverdue && <span style={{ color: "#d97706", marginLeft: 6 }}>← Due now</span>}
              {isWaived && <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>Waived</span>}
            </div>
          </div>
          <div className="milestone-amount">
            <div className="milestone-amount-value" style={{ color: textColor }}>{fmtExact(amount)}</div>
            {hasTax && (
              <button type="button" className="milestone-tax-btn" onClick={() => setShowTax((s) => !s)}>
                {taxLabel || "Tax"}{taxRate > 0 ? ` ${taxRate}%` : ""} {showTax ? "▲" : "▼"}
              </button>
            )}
          </div>
        </div>

        {hasTax && showTax && (
          <div className="milestone-tax-details">
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 4 }}>
              <span>Base amount</span><span>{fmtExact(baseAmount)}</span>
            </div>
            {(extraFees || 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 4 }}>
                <span>Additional fees</span><span>{fmtExact(extraFees)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", color: "#d97706" }}>
              <span>{taxLabel || "Tax"}{taxRate > 0 ? ` (${taxRate}%)` : ""}</span>
              <span>{fmtExact(taxAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: primaryColor, fontWeight: 700, borderTop: `1px solid ${primaryColor}20`, paddingTop: 8, marginTop: 8 }}>
              <span>Total payable</span><span>{fmtExact(amount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Dues Banner ─────────────────────────────────────────────
const DuesBanner = ({ milestoneMap, fmtExact, onNavigate, primaryColor }) => {
  const dues = Object.entries(milestoneMap)
    .flatMap(([bookingId, data]) =>
      (data.milestones || [])
        .filter((m) => m.status === "pending" || m.status === "overdue")
        .map((m) => ({ ...m, bookingId, displayAmount: msAmount(m) })),
    )
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

  if (!dues.length) return null;
  const overdueCount = dues.filter((d) => d.status === "overdue").length;
  const accentColor = overdueCount > 0 ? "#dc2626" : "#d97706";

  return (
    <div className="dues-banner">
      <ElegantCard hover>
        <div className="dues-banner-header">
          <div className="dues-banner-title" style={{ color: accentColor }}>
            <span style={{ fontSize: 20 }}>⏰</span>
            Upcoming Payments
            {overdueCount > 0 && (
              <span className="dues-banner-badge">{overdueCount} overdue</span>
            )}
          </div>
          <div className="dues-banner-count">
            {dues.length} payment{dues.length > 1 ? "s" : ""} remaining
          </div>
        </div>
        <div className="dues-list">
          {dues.map((d, i) => (
            <div key={i}
              className="dues-item"
              onClick={() => onNavigate(`/payment/${d.bookingId}?milestone=${d.id}`)}
              style={{ borderColor: d.status === "overdue" ? "#dc262630" : "#d9770630" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor + "60"; e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = d.status === "overdue" ? "#dc262630" : "#d9770630"; e.currentTarget.style.transform = "none"; }}
            >
              <div>
                <div className="dues-item-title">{d.label}</div>
                <div className="dues-item-details">
                  {d.due_date ? `Due: ${d.due_date}` : "No due date set"}
                  {d.status === "overdue" && <span className="dues-item-overdue">⚠ Overdue</span>}
                  <span style={{ marginLeft: 8 }}>· Booking #{d.bookingId}</span>
                  {(d.tax_amount || 0) > 0 && <span className="dues-item-tax">incl. tax</span>}
                </div>
              </div>
              <div className="dues-item-amount" style={{ color: d.status === "overdue" ? "#dc2626" : "#d97706" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{fmtExact(d.displayAmount)}</div>
                <div className="dues-item-pay">Tap to pay →</div>
              </div>
            </div>
          ))}
        </div>
      </ElegantCard>
    </div>
  );
};

// ── Booking Card ────────────────────────────────────────────
const BookingCard = ({ booking, onPay, onCancel, isBroker, fmtExact, token, primaryColor }) => {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const cfg = STATUS_CFG[booking.booking_status] || STATUS_CFG.pending;
  const plan = booking.payment_plan;
  const isConfirmed = booking.booking_status === "confirmed";
  const isPending = booking.booking_status === "pending";

  const paidMilestones = (booking.milestones || []).filter((m) => m.status === "paid");
  const paidTotal = paidMilestones.reduce((sum, m) => sum + msAmount(m), 0);
  const allMilestones = booking.milestones || [];
  const totalFromMs = allMilestones.reduce((sum, m) => sum + msAmount(m), 0);
  const balanceFromMs = totalFromMs - paidTotal;
  const grandTotal = parseFloat(booking.total_amount || 0) || totalFromMs;

  const displayAmt = (() => {
    if (isConfirmed && paidTotal > 0) return paidTotal;
    if (isConfirmed) return grandTotal;
    const dp = parseFloat(booking.down_payment_amount || 0);
    if (dp > 0) return dp;
    return grandTotal;
  })();

  const amountLabel = isPending
    ? "Down Payment Due"
    : isConfirmed && paidTotal > 0
      ? `Paid (${paidMilestones.length} milestone${paidMilestones.length > 1 ? "s" : ""})`
      : isConfirmed ? "Total Amount" : "Amount";

  return (
    <ElegantCard hover>
      <div className="booking-card-header">
        <div className="booking-card-info">
          <div className="booking-card-title">
            <span className="booking-card-unit">Unit {booking.plot_number}</span>
            <span className="booking-card-status" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
              {cfg.label}
            </span>
          </div>
          <div className="booking-card-details">
            <span>{booking.plot_type}</span>
            {booking.area && <span>· {booking.area} sqft</span>}
            {booking.direction && <span>· {booking.direction}</span>}
          </div>
          {isBroker && (booking.client_name || booking.client_phone) && (
            <div className="booking-card-client" style={{ background: `${primaryColor}06`, border: `1px solid ${primaryColor}18` }}>
              <span style={{ color: "var(--text-muted)" }}>Client: </span>
              <span style={{ color: primaryColor, fontWeight: 600 }}>{booking.client_name}</span>
              {booking.client_phone && <span style={{ color: "var(--text-muted)" }}> · {booking.client_phone}</span>}
              {booking.client_email && <span style={{ color: "var(--text-muted)" }}> · {booking.client_email}</span>}
            </div>
          )}
          <div className="booking-card-id">
            #{booking.id} · {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        <div className="booking-card-amount">
          <div className="booking-card-amount-label">{amountLabel}</div>
          <div className="booking-card-amount-value">{fmtExact(displayAmt)}</div>
          {isConfirmed && plan && paidTotal > 0 && balanceFromMs > 0.01 && (
            <div className="booking-card-balance">Balance: {fmtExact(balanceFromMs)}</div>
          )}
          {isConfirmed && plan && paidTotal > 0 && balanceFromMs <= 0.01 && (
            <div className="booking-card-paid">✓ Fully paid (incl. tax)</div>
          )}
          {isPending && grandTotal > 0 && (
            <div className="booking-card-grand-total">Grand total: {fmtExact(grandTotal)}</div>
          )}
        </div>
      </div>

      {isBroker && booking.commission_amount && (
        <div className="booking-card-commission" style={{ background: `${primaryColor}06`, border: `1px solid ${primaryColor}18` }}>
          <span className="booking-card-commission-label">Commission:</span>
          <span className="booking-card-commission-value">{fmtExact(booking.commission_amount)}</span>
          {booking.commission_status && (() => {
            const cs = COMM_CFG[booking.commission_status] || COMM_CFG.pending;
            return <span className="booking-card-commission-status" style={{ color: cs.color }}>{cs.label}</span>;
          })()}
        </div>
      )}

      <div className="booking-card-actions">
        {isPending && (
          <ElegantButton onClick={() => onPay(booking.id)} size="sm">
            💳 Complete Payment
          </ElegantButton>
        )}
        <ElegantButton variant="secondary" onClick={() => setExpanded((e) => !e)} size="sm">
          {expanded ? "▲ Less" : "▼ Payment Schedule"}
        </ElegantButton>
        {isPending && !confirmCancel && (
          <ElegantButton variant="ghost" onClick={() => setConfirmCancel(true)} size="sm">
            ✕ Cancel
          </ElegantButton>
        )}
        {isPending && confirmCancel && (
          <div className="booking-card-cancel-confirm">
            <span className="booking-card-cancel-text">Are you sure?</span>
            <ElegantButton variant="secondary" onClick={async () => {
              setCancelling(true); await onCancel(booking.id); setCancelling(false); setConfirmCancel(false);
            }} size="sm" loading={cancelling}>
              Yes, Cancel
            </ElegantButton>
            <ElegantButton variant="ghost" onClick={() => setConfirmCancel(false)} size="sm">
              No
            </ElegantButton>
          </div>
        )}
      </div>

      {expanded && (
        <div className="booking-card-expanded">
          <MilestoneTracker bookingId={booking.id} token={token} fmtExact={fmtExact} booking={booking} primaryColor={primaryColor} />
        </div>
      )}
    </ElegantCard>
  );
};

// ── Profile Panel ───────────────────────────────────────────
const ProfilePanel = ({ user, onSaved, showToast, primaryColor }) => {
  const [form, setForm] = useState({
    name: user.name || "", phone: user.phone || "",
    current_password: "", new_password: "", confirm_password: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.new_password && form.new_password !== form.confirm_password) {
      showToast("⚠️ New passwords do not match", "warning", 3500); return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.new_password) { payload.current_password = form.current_password; payload.new_password = form.new_password; }
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Update failed");
      showToast("✅ Profile updated successfully", "success", 3500);
      setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
      onSaved({ ...user, name: form.name, phone: form.phone });
    } catch (e) { showToast("❌ " + e.message, "error", 4000); }
    setSaving(false);
  };

  const isBroker = user.role === "broker";

  return (
    <div className="profile-panel">
      <ElegantCard>
        <div className="profile-header">
          <div className="profile-avatar" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, boxShadow: `0 4px 14px ${primaryColor}30` }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <div className="profile-role" style={{ color: primaryColor }}>
              {isBroker ? `Broker${user.broker_company ? " · " + user.broker_company : ""}` : "Buyer"}
            </div>
          </div>
        </div>

        {isBroker && (
          <div className="profile-broker-stats">
            {[
              { label: "Commission Rate", value: `${user.commission_rate || 2}%` },
              { label: "Account Status", value: user.status || "active", color: user.status === "active" ? "#16a34a" : "#dc2626" },
            ].map(({ label, value, color }) => (
              <div key={label} className="profile-broker-stat" style={{ background: `${primaryColor}06`, border: `1px solid ${primaryColor}15` }}>
                <div className="profile-broker-stat-label">{label}</div>
                <div className="profile-broker-stat-value" style={{ color: color || primaryColor }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="profile-section-title">Edit Profile</div>

        <input
          type="text" placeholder="Full Name *" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="profile-input"
        />
        <input value={user.email} readOnly placeholder="Email" className="profile-input profile-input-readonly" />
        <input
          type="tel" placeholder="Phone Number" value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="profile-input"
        />

        <div className="profile-password-title">Change Password (leave blank to keep current)</div>
        <input type="password" placeholder="Current Password" value={form.current_password}
          onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
          className="profile-input" />
        <div className="profile-password-grid">
          <input type="password" placeholder="New Password" value={form.new_password}
            onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
            className="profile-input" />
          <input type="password" placeholder="Confirm Password" value={form.confirm_password}
            onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
            className="profile-input" />
        </div>

        <ElegantButton onClick={handleSave} disabled={saving || !form.name} loading={saving} size="lg" style={{ width: "100%", marginTop: 8 }}>
          Save Changes →
        </ElegantButton>
      </ElegantCard>
    </div>
  );
};

// ── Broker Stats ────────────────────────────────────────────
const BrokerStats = ({ bookings, fmtExact, primaryColor }) => {
  const commPending = bookings.filter((b) => b.commission_status === "pending").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
  const commApproved = bookings.filter((b) => b.commission_status === "approved").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);
  const commPaid = bookings.filter((b) => b.commission_status === "paid").reduce((s, b) => s + parseFloat(b.commission_amount || 0), 0);

  return (
    <div className="broker-stats">
      {[
        { label: "Pending Commission", value: fmtExact(commPending), color: "#d97706", icon: "⏳" },
        { label: "Approved Commission", value: fmtExact(commApproved), color: "#2563eb", icon: "✓" },
        { label: "Commission Paid", value: fmtExact(commPaid), color: "#16a34a", icon: "💰" },
        { label: "Total Clients", value: bookings.length, color: primaryColor, icon: "👥" },
      ].map(({ label, value, color, icon }) => (
        <div key={label} className="broker-stat-card">
          <div className="broker-stat-content">
            <span className="broker-stat-icon">{icon}</span>
            <div className="broker-stat-value" style={{ color }}>{value}</div>
          </div>
          <div className="broker-stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
};

// ── Notifications Tab ──────────────────────────────────────
const NOTIF_CFG = {
  payment_reminder: { color: "#d97706", label: "Payment Reminder" },
  booking_confirmed: { color: "#16a34a", label: "Booking Confirmed" },
  booking_cancelled: { color: "#dc2626", label: "Booking Cancelled" },
  project_launch: { color: null, label: "Project Launch" },
  offer: { color: "#7c3aed", label: "Special Offer" },
  general: { color: null, label: "General" },
};

const NotificationModal = ({ notif, onClose, onMarkRead, onNavigate, onSwitchToBookings, primaryColor }) => {
  const cfg = notif ? { ...NOTIF_CFG[notif.type] || NOTIF_CFG.general } : NOTIF_CFG.general;
  if (!cfg.color) cfg.color = primaryColor;

  useEffect(() => {
    if (!notif) return;
    if (!notif.is_read) onMarkRead(notif.id);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notif?.id]);

  if (!notif) return null;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return d < 7 ? `${d}d ago` : new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleViewBooking = () => {
    onClose();
    if (notif.type === "payment_reminder") onNavigate(`/payment/${notif.booking_id}`);
    else onSwitchToBookings(notif.booking_id);
  };

  return (
    <div onClick={onClose} className="notification-modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="notification-modal" style={{ borderTopColor: cfg.color }}>
        <div className="notification-modal-header">
          <div className="notification-modal-icon" style={{ background: `${cfg.color}12`, borderColor: `${cfg.color}25` }}>🔔</div>
          <div className="notification-modal-info">
            <div className="notification-modal-title">{notif.title}</div>
            <div className="notification-modal-meta">
              <span className="notification-modal-category" style={{ background: `${cfg.color}12`, color: cfg.color }}>{cfg.label}</span>
              <span className="notification-modal-time">{timeAgo(notif.created_at)}</span>
            </div>
          </div>
          <button onClick={onClose} className="notification-modal-close">×</button>
        </div>
        <div className="notification-modal-body">
          <div className="notification-modal-message">{notif.message}</div>
          <div className="notification-modal-actions">
            {notif.booking_id && (
              <ElegantButton onClick={handleViewBooking}>
                {notif.type === "payment_reminder" ? "Complete Payment →" : "View Booking →"}
              </ElegantButton>
            )}
            <ElegantButton variant="secondary" onClick={onClose}>Close</ElegantButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationsTab = ({ notifications, loading, unreadCount, onMarkRead, onMarkAllRead, onNavigate, onSwitchToBookings, primaryColor }) => {
  const [filter, setFilter] = useState("all");
  const [selectedNotif, setSelectedNotif] = useState(null);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="dashboard-loading-icon">⏳</div>
      <div className="dashboard-loading-text">Loading notifications...</div>
    </div>
  );

  return (
    <div className="notifications-tab">
      {selectedNotif && (
        <NotificationModal notif={selectedNotif} onClose={() => setSelectedNotif(null)}
          onMarkRead={onMarkRead} onNavigate={onNavigate} onSwitchToBookings={onSwitchToBookings}
          primaryColor={primaryColor} />
      )}
      <div className="notifications-filter">
        <div className="notifications-filter-group">
          {[["all", "All"], ["unread", "Unread"], ["read", "Read"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} className={`notifications-filter-btn ${filter === val ? 'notifications-filter-active' : 'notifications-filter-inactive'}`}>
              {label}
              {val === "unread" && unreadCount > 0 && (
                <span className="notifications-badge" style={{ background: "#d97706", color: "#fff" }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <ElegantButton variant="secondary" onClick={onMarkAllRead} size="sm">
            ✓ Mark all read
          </ElegantButton>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">🔔</div>
          <div className="dashboard-empty-title">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </div>
          <div className="dashboard-empty-subtitle">Payment reminders and booking updates will appear here.</div>
        </div>
      )}

      <div className="notifications-list">
        {filtered.map((n) => {
          const cfg = { ...NOTIF_CFG[n.type] || NOTIF_CFG.general };
          if (!cfg.color) cfg.color = primaryColor;
          return (
            <div key={n.id} onClick={() => setSelectedNotif(n)} className={`notification-item ${n.is_read ? 'notification-item-read' : 'notification-item-unread'}`}>
              {!n.is_read && <div className="notification-dot" style={{ background: cfg.color }} />}
              <div className="notification-content">
                <div className="notification-header">
                  <span className={`notification-title ${n.is_read ? 'notification-title-normal' : 'notification-title-bold'}`}>{n.title}</span>
                  <span className="notification-category" style={{ background: `${cfg.color}12`, color: cfg.color }}>{cfg.label}</span>
                </div>
                <div className="notification-message">{n.message.length > 100 ? n.message.slice(0, 100) + "…" : n.message}</div>
                <div className="notification-footer">
                  <span className="notification-time">{timeAgo(n.created_at)}</span>
                  <span className="notification-action" style={{ color: cfg.color }}>Click to read →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Feedback Tab ────────────────────────────────────────────
const CATEGORY_CFG = {
  general: { color: "#6b7280" },
  service: { color: "#2563eb" },
  unit: { color: null },
  payment: { color: "#d97706" },
  staff: { color: "#7c3aed" },
};

const StarRating = ({ value, onChange, primaryColor }) => (
  <div className="feedback-rating-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)} className="feedback-star" style={{ color: s <= value ? primaryColor : "var(--card-border)" }}>
        ★
      </button>
    ))}
  </div>
);

const FeedbackTab = ({ feedbacks, bookings, token, onSubmitted, showToast, primaryColor }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) { showToast("⚠️ Subject and message are required", "warning", 3500); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, booking_id: form.booking_id || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed.");
      showToast("🙏 Thank you! Your feedback has been submitted", "success", 4000);
      setForm({ rating: 5, category: "general", subject: "", message: "", booking_id: "" });
      setShowForm(false);
      onSubmitted(data.feedback);
    } catch (e) { showToast("❌ " + e.message, "error", 4000); }
    setSubmitting(false);
  };

  const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed");

  return (
    <div>
      <div className="feedback-header">
        <div>
          <div className="feedback-title">Your Feedback</div>
          <div className="feedback-subtitle">Share your experience with us</div>
        </div>
        <ElegantButton onClick={() => setShowForm((f) => !f)}>
          {showForm ? "✕ Cancel" : "+ New Feedback"}
        </ElegantButton>
      </div>

      {showForm && (
        <div className="feedback-form">
          <ElegantCard>
            <div className="feedback-form-title">New Feedback</div>
            
            <div className="feedback-rating">
              <div className="feedback-rating-label">Rating *</div>
              <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} primaryColor={primaryColor} />
              <div className="feedback-rating-text">
                {["", "Very Poor", "Poor", "Average", "Good", "Excellent"][form.rating]}
              </div>
            </div>

            <div className="feedback-category">
              <div className="feedback-category-label">Category *</div>
              <div className="feedback-category-group">
                {Object.entries(CATEGORY_CFG).map(([cat, cfg]) => {
                  const catColor = cfg.color || primaryColor;
                  const isActive = form.category === cat;
                  return (
                    <button key={cat} type="button" onClick={() => setForm((f) => ({ ...f, category: cat }))} className={`feedback-category-btn ${isActive ? 'feedback-category-active' : 'feedback-category-inactive'}`}>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {confirmedBookings.length > 0 && (
              <select value={form.booking_id} onChange={(e) => setForm((f) => ({ ...f, booking_id: e.target.value }))} className="feedback-select">
                <option value="">Select booking (optional)</option>
                {confirmedBookings.map((b) => <option key={b.id} value={b.id}>Unit {b.plot_number} — Booking #{b.id}</option>)}
              </select>
            )}

            <input type="text" placeholder="Subject *" value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="feedback-input" />
            
            <textarea placeholder="Your message..." value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4}
              className="feedback-textarea" />

            <div className="feedback-actions">
              <ElegantButton onClick={handleSubmit} loading={submitting}>
                Submit Feedback →
              </ElegantButton>
              <ElegantButton variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </ElegantButton>
            </div>
          </ElegantCard>
        </div>
      )}

      {feedbacks.length === 0 && !showForm && (
        <div className="feedback-empty">
          <div className="feedback-empty-icon">💬</div>
          <div className="feedback-empty-title">No feedback yet</div>
          <div className="feedback-empty-text">Share your experience to help us improve.</div>
        </div>
      )}

      <div className="feedback-list">
        {feedbacks.map((fb) => {
          const catColor = CATEGORY_CFG[fb.category]?.color || primaryColor;
          const ratingColor = fb.rating >= 4 ? "#16a34a" : fb.rating >= 3 ? "#d97706" : "#dc2626";
          const statusColor = fb.status === "resolved" ? "#16a34a" : fb.status === "reviewed" ? "#2563eb" : "#d97706";
          return (
            <div key={fb.id} className="feedback-card">
              <div className="feedback-card-header">
                <div className="feedback-card-info">
                  <div className="feedback-card-tags">
                    <span className="feedback-card-subject">{fb.subject}</span>
                    <span className="feedback-card-category" style={{ background: `${catColor}12`, color: catColor }}>{fb.category}</span>
                    <span className="feedback-card-status" style={{ background: `${statusColor}12`, color: statusColor }}>{fb.status}</span>
                  </div>
                  <div className="feedback-card-date">
                    {fb.booking ? `Unit ${fb.booking.plot_number} · ` : ""}
                    {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="feedback-card-rating" style={{ color: ratingColor }}>{"★".repeat(fb.rating)}</div>
              </div>
              <div className="feedback-card-message">{fb.message}</div>
              {fb.admin_reply && (
                <div className="feedback-card-reply" style={{ background: "#16a34a08", border: "1px solid #16a34a20" }}>
                  <div className="feedback-card-reply-title" style={{ color: "#16a34a" }}>Admin Reply</div>
                  <div className="feedback-card-reply-text">{fb.admin_reply}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────
export default function UserDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { settings } = useSettings();

  const primaryColor = settings?.primary_color || "#c9a96e";

  const [bookings, setBookings] = useState([]);
  const [milestoneMap, setMilestoneMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [invoices, setInvoices] = useState([]);

  const { showToast } = useToast();
  const { wishlist, wishedIds, toggle: toggleWishRaw, loading: wishLoading } = useWishlist(user?.token);

  const handleWishlistToggle = useCallback(async (plotId) => {
    const wasWished = wishedIds instanceof Set && wishedIds.has(Number(plotId));
    await toggleWishRaw(Number(plotId));
    showToast(wasWished ? "🤍 Removed from Wishlist" : "❤️ Added to Wishlist",
      wasWished ? "wishlist_remove" : "wishlist_add", 2800);
  }, [wishedIds, toggleWishRaw, showToast]);

  const [currency, setCurrency] = useState({ symbol: "₹", code: "INR", position: "before" });

  const fmt = useCallback((n) => makeFmt(currency.symbol, currency.position)(n), [currency]);
  const fmtExact = useCallback((n) => makeFmtExact(currency.symbol, currency.position)(n), [currency]);

  const isBroker = user?.role === "broker";

  const fetchMilestones = useCallback(async (bookingsList) => {
    const targets = bookingsList.filter((b) => b.booking_status === "confirmed" && b.payment_plan_id);
    if (!targets.length) return;
    const results = await Promise.all(
      targets.map((b) =>
        fetch(`${API_BASE}/bookings/${b.id}/milestones`, {
          headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" },
        }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ),
    );
    const map = {};
    targets.forEach((b, i) => { if (results[i]) map[b.id] = results[i]; });
    setMilestoneMap(map);
  }, [user?.token]);

  const switchToBookings = useCallback((bookingId) => {
    setActiveTab("bookings");
    if (!bookingId) return;
    setTimeout(() => {
      const el = document.getElementById(`booking-card-${bookingId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.boxShadow = `0 0 0 2px ${primaryColor}, 0 0 24px ${primaryColor}30`;
        el.style.transition = "box-shadow 0.3s";
        setTimeout(() => { el.style.boxShadow = ""; }, 3000);
      }
    }, 150);
  }, [primaryColor]);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/invoices`, { headers: { Authorization: `Bearer ${user?.token}`, Accept: "application/json" } });
      if (!res.ok) return;
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (_) { }
  }, [user?.token]);

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setBookings(list);
      fetchMilestones(list);
    } catch (e) {
      setError(e.message);
      showToast("❌ Could not load bookings. Please retry.", "error", 4000);
    } finally { setLoading(false); }
  }, [user?.token, fetchMilestones, showToast]);

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const [txnRes, bookRes] = await Promise.all([
        fetch(`${API_BASE}/payment/history`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
        fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } }),
      ]);
      const txns = txnRes.ok ? await txnRes.json() : [];
      const booksRaw = bookRes.ok ? await bookRes.json() : [];
      const books = Array.isArray(booksRaw) ? booksRaw : booksRaw.data || [];
      const txnList = Array.isArray(txns) ? txns : [];
      const txnBookingIds = new Set(txnList.map((t) => String(t.booking_id)));
      const missingTxns = books
        .filter((b) => b.booking_status === "confirmed" && !txnBookingIds.has(String(b.id)))
        .map((b) => ({
          id: `booking_${b.id}`, booking_id: b.id,
          amount: b.down_payment_amount || b.total_amount || 0,
          currency: "INR", status: "success", mode: "manual",
          gateway: "cash / manual", paid_at: b.created_at, _synthetic: true,
          booking: { id: b.id, plot_number: b.plot_number, plot_type: b.plot_type, booking_status: b.booking_status },
        }));
      setPayments([...txnList, ...missingTxns]);
    } catch (_) { } finally { setPaymentsLoading(false); }
  }, [user?.token]);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
      if (!res.ok) return;
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : data.data || []);
    } catch (_) { }
  }, [user?.token]);

  const fetchNotifications = useCallback(async () => {
    setNotifsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (_) { } finally { setNotifsLoading(false); }
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) { navigate("/"); return; }
    Promise.all([
      fetch(`${API_BASE}/currency`, { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) setCurrency({ symbol: d.symbol || "₹", code: d.code || "INR", position: d.position || "before" }); })
        .catch(() => { }),
      fetchBookings(),
      fetchNotifications(),
      fetchFeedbacks(),
      fetchPayments(),
      fetchInvoices(),
    ]);

    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("booking");
    const sessionId = params.get("session_id");
    if (bookingId && sessionId) {
      const confirmPayment = async () => {
        try {
          await fetch(`${API_BASE}/payment/stripe/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user.token}` },
            body: JSON.stringify({ booking_id: bookingId, session_id: sessionId }),
          });
          await Promise.all([fetchBookings(), fetchNotifications(), fetchPayments(), fetchInvoices()]);
          showToast("🎉 Payment confirmed! Your booking is now active.", "booking", 5000);
        } catch (_) { }
      };
      confirmPayment();
      window.history.replaceState({}, "", window.location.pathname);
    }

    fetch(`${API_BASE}/messages/unread`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((r) => r.json()).then((d) => setUnreadMessages(d.unread || 0)).catch(() => { });
  }, [user?.token]);

  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_) { }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast("✅ All notifications marked as read", "success", 2500);
    } catch (_) { }
  };

  const handlePay = (id) => navigate(`/payment/${id}`);
  const handleLogout = () => {
    showToast("👋 Logged out successfully", "info", 2500);
    setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 600);
  };
  const handleSaved = (updated) => dispatch(setUser(updated));
  const handleCancel = async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed.");
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, booking_status: "cancelled" } : b));
      showToast("✅ Booking cancelled successfully", "success", 3500);
    } catch (e) { showToast("❌ " + e.message, "error", 4000); }
  };

  const confirmed = bookings.filter((b) => b.booking_status === "confirmed").length;
  const pending = bookings.filter((b) => b.booking_status === "pending").length;

  const totalInvested = bookings
    .filter((b) => b.booking_status === "confirmed")
    .reduce((s, b) => {
      const msData = milestoneMap[b.id];
      if (msData?.milestones?.length) {
        const paidSum = msData.milestones.filter((m) => m.status === "paid").reduce((ms, m) => ms + msAmount(m), 0);
        if (paidSum > 0) return s + paidSum;
        return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
      }
      return s + parseFloat(b.down_payment_amount || b.total_amount || b.price || 0);
    }, 0);

  const tabs = [
    { id: "bookings", label: isBroker ? "Client Bookings" : "My Bookings", count: bookings.length },
    { id: "wishlist", label: "Wishlist", count: wishlist.length },
    { id: "payments", label: "Payments", count: 0 },
    { id: "invoices", label: "Invoices", count: invoices.length },
    { id: "notifications", label: "Notifications", count: unreadCount },
    { id: "feedback", label: "Feedback", count: 0 },
    { id: "messages", label: "Messages", count: unreadMessages },
    { id: "profile", label: "My Profile", count: 0 },
  ];

  const logoUrl = settings?.app_logo_dark_url || settings?.app_logo_light_url || null;
  const appName = settings?.app_name || "Dashboard";

  // Add CSS animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .notification-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .notification-modal {
        max-width: 540px;
        width: 100%;
        background: var(--card-bg);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 24px 64px rgba(0,0,0,0.2);
        border-top: 3px solid;
      }
      .notification-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--card-border);
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }
      .notification-modal-icon {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        border: 1px solid;
      }
      .notification-modal-info {
        flex: 1;
      }
      .notification-modal-title {
        font-size: 17px;
        font-weight: 700;
        color: var(--text-dark);
        font-family: var(--font-heading, inherit);
      }
      .notification-modal-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 6px;
        flex-wrap: wrap;
      }
      .notification-modal-category {
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
      }
      .notification-modal-time {
        font-size: 11px;
        color: var(--text-muted);
      }
      .notification-modal-close {
        background: var(--page-bg);
        border: 1px solid var(--card-border);
        color: var(--text-muted);
        width: 34px;
        height: 34px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .notification-modal-body {
        padding: 20px 24px;
      }
      .notification-modal-message {
        font-size: 14px;
        color: var(--text-dark);
        line-height: 1.7;
        background: var(--page-bg);
        border: 1px solid var(--card-border);
        border-radius: 16px;
        padding: 18px;
        white-space: pre-line;
      }
      .notification-modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <button onClick={() => navigate(-1)} className="dashboard-back-btn">
            ← Back
          </button>
          {logoUrl
            ? <img src={logoUrl} alt={appName} className="dashboard-logo" />
            : <span className="dashboard-logo-text">
              {isBroker ? "Broker Dashboard" : "My Dashboard"}
            </span>
          }
        </div>

        <div className="dashboard-header-right">
          <div className="dashboard-user-info">
            <div className="dashboard-user-name">{user?.name}</div>
            <div className="dashboard-user-role">
              {isBroker ? `Broker${user?.broker_company ? " · " + user.broker_company : ""}` : "Buyer"}
            </div>
          </div>
          <div className="dashboard-avatar" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, boxShadow: `0 2px 8px ${primaryColor}30` }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <ElegantButton variant="secondary" onClick={handleLogout} size="sm">
            Logout
          </ElegantButton>
          <button onClick={() => setActiveTab("notifications")} className="dashboard-notif-btn">
            🔔
            {unreadCount > 0 && (
              <span className="dashboard-notif-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Welcome */}
        <div className="dashboard-welcome">
          <div className="dashboard-welcome-title">
            Welcome back, {user?.name?.split(" ")[0]}
          </div>
          <div className="dashboard-welcome-subtitle">
            {isBroker ? "Manage your client bookings and track your commissions." : "Track your property bookings and payments."}
          </div>
        </div>

        {/* Stat cards */}
        <div className="dashboard-stats">
          <StatCard icon="📋" label="Total Bookings" value={bookings.length} color={primaryColor} />
          <StatCard icon="✓" label="Confirmed" value={confirmed} color="#16a34a" />
          <StatCard icon="⏳" label="Pending Payment" value={pending} color="#d97706" />
          {!isBroker && <StatCard icon="💰" label="Amount Invested" value={fmtExact(totalInvested)} color={primaryColor} />}
        </div>

        {isBroker && bookings.length > 0 && <BrokerStats bookings={bookings} fmtExact={fmtExact} primaryColor={primaryColor} />}

        {/* Tabs */}
        <div className="dashboard-tabs">
          {tabs.map((t) => (
            <TabButton
              key={t.id}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              label={t.label}
              count={t.count}
              primaryColor={primaryColor}
            />
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "bookings" && (
          <div>
            {loading && (
              <div className="dashboard-loading">
                <div className="dashboard-loading-icon">⏳</div>
                <div className="dashboard-loading-text">Loading bookings...</div>
              </div>
            )}
            {error && (
              <div className="dashboard-error">
                <span>⚠ {error}</span>
                <ElegantButton variant="secondary" onClick={fetchBookings} size="sm">
                  Retry
                </ElegantButton>
              </div>
            )}
            {!loading && Object.keys(milestoneMap).length > 0 && (
              <DuesBanner milestoneMap={milestoneMap} fmtExact={fmtExact} onNavigate={navigate} primaryColor={primaryColor} />
            )}
            {!loading && !error && bookings.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">🏠</div>
                <div className="dashboard-empty-title">
                  {isBroker ? "No client bookings yet" : "No bookings yet"}
                </div>
                <div className="dashboard-empty-subtitle">
                  {isBroker ? "Book a unit for your clients from the unit page." : "Browse available units to make your first booking."}
                </div>
                <ElegantButton onClick={() => navigate("/")}>
                  Browse Units →
                </ElegantButton>
              </div>
            )}
            <div className="dashboard-bookings">
              {!loading && bookings.map((b) => (
                <BookingCard key={b.id} booking={b} onPay={handlePay} onCancel={handleCancel}
                  isBroker={isBroker} fmtExact={fmtExact} token={user?.token} primaryColor={primaryColor} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "wishlist" && (
          <WishlistTab wishlist={wishlist} wishedIds={wishedIds} onToggle={handleWishlistToggle}
            loading={wishLoading} token={user?.token} onNavigate={navigate} fmt={fmt} />
        )}
        {activeTab === "payments" && (
          <PaymentsTab payments={payments} loading={paymentsLoading} fmt={fmt} fmtExact={fmtExact} user={user} />
        )}
        {activeTab === "invoices" && <InvoicesTab user={user} fmt={fmt} />}
        {activeTab === "notifications" && (
          <NotificationsTab
            notifications={notifications} loading={notifsLoading} unreadCount={unreadCount}
            onMarkRead={markRead} onMarkAllRead={markAllRead} onNavigate={navigate}
            onSwitchToBookings={switchToBookings} primaryColor={primaryColor}
          />
        )}
        {activeTab === "feedback" && (
          <FeedbackTab feedbacks={feedbacks} bookings={bookings} token={user?.token}
            showToast={showToast} onSubmitted={(newFb) => setFeedbacks((prev) => [newFb, ...prev])}
            primaryColor={primaryColor} />
        )}
        {activeTab === "messages" && <MessagesTab user={user} />}
        {activeTab === "profile" && (
          <ProfilePanel user={user} onSaved={handleSaved} showToast={showToast} primaryColor={primaryColor} />
        )}
      </div>
    </div>
  );
}