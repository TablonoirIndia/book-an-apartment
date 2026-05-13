// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// const fmt = (n, currency = "INR") =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

// function loadRazorpay() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const s = document.createElement("script");
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });
// }

// function loadStripe(publishableKey) {
//   return new Promise((resolve) => {
//     if (window.Stripe) return resolve(window.Stripe(publishableKey));
//     const s = document.createElement("script");
//     s.src = "https://js.stripe.com/v3/";
//     s.onload = () => resolve(window.Stripe(publishableKey));
//     s.onerror = () => resolve(null);
//     document.body.appendChild(s);
//   });
// }

// export default function PaymentPage() {
//   const { bookingId } = useParams();
//   const navigate      = useNavigate();
//   const user          = useSelector(selectUser);

//   const [booking,  setBooking]  = useState(null);
//   const [gateway,  setGateway]  = useState(null);
//   const [loading,  setLoading]  = useState(true);
//   const [paying,   setPaying]   = useState(false);
//   const [error,    setError]    = useState("");
//   const [success,  setSuccess]  = useState(false);

//   // ── Auth guard ────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!user?.token) navigate("/");
//   }, [user]);

//   // ── Fetch booking + gateway config ────────────────────────────────
//   useEffect(() => {
//     if (!user?.token || !bookingId) return;
//     (async () => {
//       try {
//         const [bRes, gRes] = await Promise.all([
//           fetch(`${API_BASE}/bookings/${bookingId}`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//           fetch(`${API_BASE}/payment/config`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//         ]);

//         if (!bRes.ok) throw new Error("Booking not found.");
//         if (!gRes.ok) throw new Error("Payment gateway not configured.");

//         const bData = await bRes.json();
//         const gData = await gRes.json();

//         setBooking(bData.booking);
//         setGateway(gData);

//         // ── If already paid, show success screen immediately ──────
//         if (bData.booking?.booking_status === "confirmed") {
//           setSuccess(true);
//         }
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [bookingId, user]);

//   // ── RAZORPAY ──────────────────────────────────────────────────────
//   const payWithRazorpay = async () => {
//     setPaying(true); setError("");
//     const ok = await loadRazorpay();
//     if (!ok) { setError("Razorpay failed to load."); setPaying(false); return; }

//     const res = await fetch(`${API_BASE}/payment/razorpay/create-order`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Order creation failed."); setPaying(false); return; }

//     const options = {
//       key:         gateway.key,
//       amount:      data.amount,
//       currency:    data.currency || "INR",
//       name:        data.app_name || "Property Booking",
//       description: `Unit ${booking?.plot_number} — Booking #${bookingId}`,
//       order_id:    data.order_id,
//       prefill: {
//         name:    user.name,
//         email:   user.email,
//         contact: (user.country_code || "+91") + user.phone,
//       },
//       theme: { color: "#c9a96e" },
//       handler: async (response) => {
//         const vRes = await fetch(`${API_BASE}/payment/razorpay/verify`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           body: JSON.stringify({ ...response, booking_id: bookingId }),
//         });
//         const vData = await vRes.json();
//         if (vRes.ok) { setSuccess(true); setPaying(false); }
//         else         { setError(vData.message || "Verification failed."); setPaying(false); }
//       },
//       modal: { ondismiss: () => setPaying(false) },
//     };

//     new window.Razorpay(options).open();
//   };

//   // ── STRIPE ────────────────────────────────────────────────────────
//   const payWithStripe = async () => {
//     setPaying(true); setError("");
//     const stripe = await loadStripe(gateway.key);
//     if (!stripe) { setError("Stripe failed to load."); setPaying(false); return; }

//     const res = await fetch(`${API_BASE}/payment/stripe/checkout`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Session creation failed."); setPaying(false); return; }

//     const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.session_id });
//     if (stripeError) { setError(stripeError.message); setPaying(false); }
//   };

//   // ── PHONEPE ───────────────────────────────────────────────────────
//   const payWithPhonePe = async () => {
//     setPaying(true); setError("");
//     const res = await fetch(`${API_BASE}/payment/phonepe/initiate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "PhonePe initiation failed."); setPaying(false); return; }
//     window.location.href = data.redirect_url;
//   };

//   const handlePay = () => {
//     if (!gateway) return;
//     const p = gateway.provider?.toLowerCase();
//     if      (p === "razorpay") payWithRazorpay();
//     else if (p === "stripe")   payWithStripe();
//     else if (p === "phonepe")  payWithPhonePe();
//     else setError(`Unknown payment provider: ${gateway.provider}`);
//   };

//   // ── Derive payment amount ─────────────────────────────────────────
//   // If payment plan selected → use down_payment_amount (first milestone)
//   // Else → total_amount → price
//   const plan         = booking?.payment_plan;
//   const firstMilestone = plan?.milestones?.[0];
//   const unitPrice    = parseFloat(booking?.price || 0);
//   const downPayment  = booking?.down_payment_amount
//     || (firstMilestone?.percentage ? Math.round(unitPrice * firstMilestone.percentage / 100) : null)
//     || booking?.total_amount
//     || booking?.price;

//   const isInstalment = plan && booking?.down_payment_amount && booking?.total_amount
//     && booking.down_payment_amount < booking.total_amount;

//   const providerLabel = gateway?.provider
//     ? { razorpay: "Pay with Razorpay", stripe: "Pay with Stripe", phonepe: "Pay with PhonePe" }
//         [gateway.provider.toLowerCase()] || "Proceed to Pay"
//     : "Proceed to Pay";

//   // ── Styles ────────────────────────────────────────────────────────
//   const S = {
//     page:      { minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "24px" },
//     card:      { background: "#161628", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "16px", padding: "40px", maxWidth: "500px", width: "100%" },
//     title:     { color: "#c9a96e", fontSize: "22px", fontWeight: "700", marginBottom: "6px" },
//     sub:       { color: "#888", fontSize: "13px", marginBottom: "28px" },
//     row:       { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#ccc", fontSize: "14px" },
//     label:     { color: "#888" },
//     planBox:   { margin: "20px 0 0", padding: "14px 16px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "10px" },
//     planTitle: { color: "#c9a96e", fontWeight: "700", fontSize: "13px", marginBottom: "8px" },
//     milestoneRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "12px" },
//     amount:    { color: "#c9a96e", fontSize: "32px", fontWeight: "800", margin: "24px 0 4px" },
//     amountLabel:{ color: "#666", fontSize: "12px", marginBottom: "6px" },
//     totalNote: { color: "#555", fontSize: "12px", marginBottom: "24px" },
//     btn:       { width: "100%", padding: "16px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px" },
//     btnDis:    { opacity: 0.6, cursor: "not-allowed" },
//     err:       { color: "#ff6b6b", fontSize: "13px", marginTop: "12px", padding: "10px", background: "rgba(255,107,107,0.08)", borderRadius: "8px" },
//     success:   { textAlign: "center", padding: "20px 0" },
//     tick:      { fontSize: "56px", marginBottom: "12px" },
//     sTitle:    { color: "#4caf50", fontSize: "20px", fontWeight: "700", marginBottom: "8px" },
//     sSub:      { color: "#888", fontSize: "14px", marginBottom: "24px" },
//     backBtn:   { background: "transparent", border: "1px solid rgba(201,169,110,0.4)", color: "#c9a96e", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
//   };

//   // ── Render states ─────────────────────────────────────────────────
//   if (loading) return (
//     <div style={S.page}>
//       <div style={{ color: "#c9a96e", fontSize: "16px" }}>Loading payment details…</div>
//     </div>
//   );

//   if (error && !booking) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={{ color: "#ff6b6b", fontSize: "16px", marginBottom: "16px" }}>⚠ {error}</div>
//         <button style={S.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
//       </div>
//     </div>
//   );

//   if (success) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Payment Successful!</div>
//           <div style={S.sSub}>
//             Your booking for Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> is confirmed.
//             <br />A confirmation will be sent to {user?.email}.
//           </div>
//           {/* Booking reference */}
//           <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "12px 16px", margin: "16px 0", fontSize: "13px", color: "#888" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//               <span>Booking ID</span><span style={{ color: "#ccc" }}>#{bookingId}</span>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//               <span>Unit</span><span style={{ color: "#ccc" }}>{booking?.plot_number}</span>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between" }}>
//               <span>Amount Paid</span><span style={{ color: "#c9a96e", fontWeight: "700" }}>{fmt(downPayment)}</span>
//             </div>
//           </div>
//           <button style={S.backBtn} onClick={() => navigate("/")}>← Back to Home</button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div style={S.page}>
//       <div style={S.card}>

//         {/* Header */}
//         <div style={S.title}>Complete Your Booking</div>
//         <div style={S.sub}>Booking #{bookingId} · {booking?.plot_type} — Unit {booking?.plot_number}</div>

//         {/* Booking summary rows */}
//         <div>
//           {[
//             ["Project",  booking?.project_name  || booking?.project?.name || "—"],
//             ["Floor",    booking?.block_name     || booking?.block?.name   || booking?.block || "—"],
//             ["Area",     booking?.area ? `${booking.area} sq.ft` : "—"],
//             ["Your Name",user?.name],
//             ["Email",    user?.email],
//           ].map(([k, v]) => (
//             <div key={k} style={S.row}>
//               <span style={S.label}>{k}</span>
//               <span>{v}</span>
//             </div>
//           ))}
//         </div>

//         {/* ── Payment plan breakdown ────────────────────────────── */}
//         {plan ? (
//           <div style={S.planBox}>
//             <div style={S.planTitle}>💳 {plan.name}</div>
//             {plan.milestones?.map((m, i) => {
//               const amt = m.calculated_amount
//                 || (m.percentage ? Math.round(unitPrice * m.percentage / 100) : null)
//                 || m.fixed_amount;
//               return (
//                 <div key={i} style={{
//                   ...S.milestoneRow,
//                   ...(i === 0 ? { color: "#c9a96e", fontWeight: "700" } : { color: "rgba(255,255,255,0.4)" }),
//                 }}>
//                   <span>
//                     {i === 0 && "👉 "}
//                     {m.label}
//                     {m.percentage ? ` (${m.percentage}%)` : ""}
//                     {i === 0 && <span style={{ fontSize: "10px", marginLeft: "6px", color: "#888" }}>← Due now</span>}
//                   </span>
//                   <span>{amt ? fmt(amt) : "—"}</span>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div style={{ margin: "16px 0 0", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
//             💰 Full Payment — no instalment plan selected
//           </div>
//         )}

//         {/* ── Amount due now ────────────────────────────────────── */}
//         <div style={S.amount}>{fmt(downPayment)}</div>
//         <div style={S.amountLabel}>
//           {plan ? `First payment (${firstMilestone?.label || "Down Payment"})` : "Total amount due"}
//         </div>
//         {isInstalment && (
//           <div style={S.totalNote}>
//             Total unit price: {fmt(booking.total_amount)} · Remaining: {fmt(booking.total_amount - downPayment)} in future instalments
//           </div>
//         )}

//         {/* ── No gateway warning ────────────────────────────────── */}
//         {!gateway && (
//           <div style={{ color: "#ff6b6b", fontSize: "13px", margin: "16px 0", padding: "10px", background: "rgba(255,107,107,0.06)", borderRadius: "8px" }}>
//             ⚠ No payment gateway configured. Please contact admin.
//           </div>
//         )}

//         {/* ── Pay button ────────────────────────────────────────── */}
//         <button
//           style={{ ...S.btn, marginTop: "20px", ...(paying || !gateway ? S.btnDis : {}) }}
//           onClick={handlePay}
//           disabled={paying || !gateway}
//         >
//           {paying ? "Processing…" : providerLabel}
//         </button>

//         {error && <div style={S.err}>⚠ {error}</div>}

//         <button
//           style={{ ...S.backBtn, marginTop: "14px", display: "block", width: "100%", textAlign: "center" }}
//           onClick={() => navigate(-1)}
//         >
//           ← Cancel &amp; Go Back
//         </button>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// const fmt = (n, currency = "INR") =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

// function loadRazorpay() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const s = document.createElement("script");
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });
// }

// function loadStripe(publishableKey) {
//   return new Promise((resolve) => {
//     if (window.Stripe) return resolve(window.Stripe(publishableKey));
//     const s = document.createElement("script");
//     s.src = "https://js.stripe.com/v3/";
//     s.onload = () => resolve(window.Stripe(publishableKey));
//     s.onerror = () => resolve(null);
//     document.body.appendChild(s);
//   });
// }

// export default function PaymentPage() {
//   const { bookingId } = useParams();
//   const navigate      = useNavigate();
//   const user          = useSelector(selectUser);

//   const [booking,  setBooking]  = useState(null);
//   const [gateway,  setGateway]  = useState(null);
//   const [loading,  setLoading]  = useState(true);
//   const [paying,   setPaying]   = useState(false);
//   const [error,    setError]    = useState("");
//   const [success,  setSuccess]  = useState(false);

//   // ── Milestone-specific state ──────────────────────────────────────
//   const [milestone,      setMilestone]      = useState(null);   // the specific milestone being paid
//   const [milestoneLoad,  setMilestoneLoad]  = useState(false);

//   // Read milestone ID from URL query param
//   const milestoneId = new URLSearchParams(window.location.search).get("milestone");
//   const isMilestonePayment = !!milestoneId && !!milestone;

//   // ── Auth guard ────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!user?.token) navigate("/");
//   }, [user]);

//   // ── Fetch booking + gateway + optional milestone ──────────────────
//   useEffect(() => {
//     if (!user?.token || !bookingId) return;
//     (async () => {
//       try {
//         const [bRes, gRes] = await Promise.all([
//           fetch(`${API_BASE}/bookings/${bookingId}`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//           fetch(`${API_BASE}/payment/config`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//         ]);

//         if (!bRes.ok) throw new Error("Booking not found.");
//         if (!gRes.ok) throw new Error("Payment gateway not configured.");

//         const bData = await bRes.json();
//         const gData = await gRes.json();

//         setBooking(bData.booking);
//         setGateway(gData);

//         // Auto-success only for full payment (no milestone) on a confirmed booking
//         if (bData.booking?.booking_status === "confirmed" && !milestoneId) {
//           setSuccess(true);
//         }

//         // ── Load specific milestone if ID in URL ──────────────────
//         if (milestoneId) {
//           setMilestoneLoad(true);
//           try {
//             const mRes = await fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//               headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//             });
//             if (mRes.ok) {
//               const mData = await mRes.json();
//               const found = (mData.milestones || []).find(
//                 (m) => String(m.id) === String(milestoneId)
//               );
//               if (!found) throw new Error("Milestone not found.");
//               if (found.status === "paid") {
//                 setError("This milestone has already been paid.");
//               }
//               setMilestone(found);
//             }
//           } catch (mErr) {
//             setError(mErr.message || "Failed to load milestone.");
//           } finally {
//             setMilestoneLoad(false);
//           }
//         }
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [bookingId, user]);

//   // ── Derive payment amount ─────────────────────────────────────────
//   const plan           = booking?.payment_plan;
//   const firstMilestone = plan?.milestones?.[0];
//   const unitPrice      = parseFloat(booking?.price || 0);

//   // Milestone payment uses that milestone's amount; otherwise full/down payment
//   const downPayment = isMilestonePayment
//     ? milestone.amount
//     : booking?.down_payment_amount
//       || (firstMilestone?.percentage ? Math.round(unitPrice * firstMilestone.percentage / 100) : null)
//       || booking?.total_amount
//       || booking?.price;

//   const isInstalment = !isMilestonePayment && plan
//     && booking?.down_payment_amount && booking?.total_amount
//     && booking.down_payment_amount < booking.total_amount;

//   // ── RAZORPAY ──────────────────────────────────────────────────────
//   const payWithRazorpay = async () => {
//     setPaying(true); setError("");
//     const ok = await loadRazorpay();
//     if (!ok) { setError("Razorpay failed to load."); setPaying(false); return; }

//     const res = await fetch(`${API_BASE}/payment/razorpay/create-order`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Order creation failed."); setPaying(false); return; }

//     const options = {
//       key:         gateway.key,
//       amount:      data.amount,
//       currency:    data.currency || "INR",
//       name:        data.app_name || "Property Booking",
//       description: isMilestonePayment
//         ? `${milestone.label} · Unit ${booking?.plot_number}`
//         : `Unit ${booking?.plot_number} — Booking #${bookingId}`,
//       order_id:    data.order_id,
//       prefill: {
//         name:    user.name,
//         email:   user.email,
//         contact: (user.country_code || "+91") + (user.phone || ""),
//       },
//       theme: { color: "#c9a96e" },
//       handler: async (response) => {
//         const vRes = await fetch(`${API_BASE}/payment/razorpay/verify`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           body: JSON.stringify({
//             ...response,
//             booking_id:   bookingId,
//             milestone_id: milestoneId || undefined,
//           }),
//         });
//         const vData = await vRes.json();
//         if (vRes.ok) { setSuccess(true); setPaying(false); }
//         else         { setError(vData.message || "Verification failed."); setPaying(false); }
//       },
//       modal: { ondismiss: () => setPaying(false) },
//     };

//     new window.Razorpay(options).open();
//   };

//   // ── STRIPE ────────────────────────────────────────────────────────
//   const payWithStripe = async () => {
//     setPaying(true); setError("");
//     const stripe = await loadStripe(gateway.key);
//     if (!stripe) { setError("Stripe failed to load."); setPaying(false); return; }

//     const res = await fetch(`${API_BASE}/payment/stripe/checkout`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Session creation failed."); setPaying(false); return; }

//     const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.session_id });
//     if (stripeError) { setError(stripeError.message); setPaying(false); }
//   };

//   // ── PHONEPE ───────────────────────────────────────────────────────
//   const payWithPhonePe = async () => {
//     setPaying(true); setError("");
//     const res = await fetch(`${API_BASE}/payment/phonepe/initiate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "PhonePe initiation failed."); setPaying(false); return; }
//     window.location.href = data.redirect_url;
//   };

//   const handlePay = () => {
//     if (!gateway) return;
//     const p = gateway.provider?.toLowerCase();
//     if      (p === "razorpay") payWithRazorpay();
//     else if (p === "stripe")   payWithStripe();
//     else if (p === "phonepe")  payWithPhonePe();
//     else setError(`Unknown payment provider: ${gateway.provider}`);
//   };

//   const providerLabel = gateway?.provider
//     ? { razorpay: "Pay with Razorpay", stripe: "Pay with Stripe", phonepe: "Pay with PhonePe" }
//         [gateway.provider.toLowerCase()] || "Proceed to Pay"
//     : "Proceed to Pay";

//   // ── Styles ────────────────────────────────────────────────────────
//   const S = {
//     page:         { minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "24px" },
//     card:         { background: "#161628", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "16px", padding: "40px", maxWidth: "500px", width: "100%" },
//     title:        { color: "#c9a96e", fontSize: "22px", fontWeight: "700", marginBottom: "6px" },
//     sub:          { color: "#888", fontSize: "13px", marginBottom: "28px" },
//     row:          { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#ccc", fontSize: "14px" },
//     label:        { color: "#888" },
//     planBox:      { margin: "20px 0 0", padding: "14px 16px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "10px" },
//     planTitle:    { color: "#c9a96e", fontWeight: "700", fontSize: "13px", marginBottom: "8px" },
//     milestoneRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "12px" },
//     amount:       { color: "#c9a96e", fontSize: "32px", fontWeight: "800", margin: "24px 0 4px" },
//     amountLabel:  { color: "#666", fontSize: "12px", marginBottom: "6px" },
//     totalNote:    { color: "#555", fontSize: "12px", marginBottom: "24px" },
//     btn:          { width: "100%", padding: "16px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px" },
//     btnDis:       { opacity: 0.6, cursor: "not-allowed" },
//     err:          { color: "#ff6b6b", fontSize: "13px", marginTop: "12px", padding: "10px", background: "rgba(255,107,107,0.08)", borderRadius: "8px" },
//     success:      { textAlign: "center", padding: "20px 0" },
//     tick:         { fontSize: "56px", marginBottom: "12px" },
//     sTitle:       { color: "#4caf50", fontSize: "20px", fontWeight: "700", marginBottom: "8px" },
//     sSub:         { color: "#888", fontSize: "14px", marginBottom: "24px" },
//     backBtn:      { background: "transparent", border: "1px solid rgba(201,169,110,0.4)", color: "#c9a96e", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
//   };

//   // ── Loading ───────────────────────────────────────────────────────
//   if (loading || milestoneLoad) return (
//     <div style={S.page}>
//       <div style={{ color: "#c9a96e", fontSize: "16px" }}>Loading payment details…</div>
//     </div>
//   );

//   if (error && !booking) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={{ color: "#ff6b6b", fontSize: "16px", marginBottom: "16px" }}>⚠ {error}</div>
//         <button style={S.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
//       </div>
//     </div>
//   );

//   // ── Already paid milestone ────────────────────────────────────────
//   if (milestoneId && milestone?.status === "paid") return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Already Paid</div>
//           <div style={S.sSub}>
//             {milestone.label} for Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> has already been paid.
//           </div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   // ── Success screen ────────────────────────────────────────────────
//   if (success) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Payment Successful!</div>
//           <div style={S.sSub}>
//             {isMilestonePayment
//               ? <>Your payment for <strong style={{ color: "#c9a96e" }}>{milestone?.label}</strong> on Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> has been confirmed.</>
//               : <>Your booking for Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> is confirmed.<br />A confirmation will be sent to {user?.email}.</>
//             }
//           </div>
//           <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "12px 16px", margin: "16px 0", fontSize: "13px", color: "#888" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//               <span>Booking ID</span><span style={{ color: "#ccc" }}>#{bookingId}</span>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//               <span>Unit</span><span style={{ color: "#ccc" }}>{booking?.plot_number}</span>
//             </div>
//             {isMilestonePayment && (
//               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//                 <span>Milestone</span><span style={{ color: "#ccc" }}>{milestone?.label}</span>
//               </div>
//             )}
//             <div style={{ display: "flex", justifyContent: "space-between" }}>
//               <span>Amount Paid</span>
//               <span style={{ color: "#c9a96e", fontWeight: "700" }}>{fmt(downPayment)}</span>
//             </div>
//           </div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   // ── Main payment page ─────────────────────────────────────────────
//   return (
//     <div style={S.page}>
//       <div style={S.card}>

//         {/* Header */}
//         <div style={S.title}>
//           {isMilestonePayment ? "Milestone Payment" : "Complete Your Booking"}
//         </div>
//         <div style={S.sub}>
//           {isMilestonePayment
//             ? `${milestone.label} · Booking #${bookingId} · Unit ${booking?.plot_number}`
//             : `Booking #${bookingId} · ${booking?.plot_type} — Unit ${booking?.plot_number}`
//           }
//         </div>

//         {/* Booking summary rows */}
//         <div>
//           {[
//             ["Project",   booking?.project_name || booking?.project?.name || "—"],
//             ["Floor",     booking?.block_name   || booking?.block?.name   || booking?.block || "—"],
//             ["Area",      booking?.area ? `${booking.area} sq.ft` : "—"],
//             ["Your Name", user?.name],
//             ["Email",     user?.email],
//           ].map(([k, v]) => (
//             <div key={k} style={S.row}>
//               <span style={S.label}>{k}</span>
//               <span>{v}</span>
//             </div>
//           ))}
//         </div>

//         {/* Plan / milestone breakdown */}
//         {isMilestonePayment ? (
//           // ── Specific milestone being paid ──────────────────────
//           <div style={S.planBox}>
//             <div style={S.planTitle}>💳 Milestone Payment</div>
//             <div style={{ ...S.milestoneRow, color: "#c9a96e", fontWeight: "700" }}>
//               <span>👉 {milestone.label}</span>
//               <span>{fmt(milestone.amount)}</span>
//             </div>
//             {milestone.due_date && (
//               <div style={{ fontSize: "11px", color: "#888", marginTop: "8px" }}>
//                 Due date: {milestone.due_date}
//               </div>
//             )}
//             {milestone.notes && (
//               <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
//                 Note: {milestone.notes}
//               </div>
//             )}
//           </div>
//         ) : plan ? (
//           // ── Full payment with plan — show all milestones ────────
//           <div style={S.planBox}>
//             <div style={S.planTitle}>💳 {plan.name}</div>
//             {plan.milestones?.map((m, i) => {
//               const amt = m.calculated_amount
//                 || (m.percentage ? Math.round(unitPrice * m.percentage / 100) : null)
//                 || m.fixed_amount;
//               return (
//                 <div key={i} style={{
//                   ...S.milestoneRow,
//                   ...(i === 0 ? { color: "#c9a96e", fontWeight: "700" } : { color: "rgba(255,255,255,0.4)" }),
//                 }}>
//                   <span>
//                     {i === 0 && "👉 "}
//                     {m.label}
//                     {m.percentage ? ` (${m.percentage}%)` : ""}
//                     {i === 0 && <span style={{ fontSize: "10px", marginLeft: "6px", color: "#888" }}>← Due now</span>}
//                   </span>
//                   <span>{amt ? fmt(amt) : "—"}</span>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           // ── Full payment, no plan ──────────────────────────────
//           <div style={{ margin: "16px 0 0", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
//             💰 Full Payment — no instalment plan selected
//           </div>
//         )}

//         {/* Amount due */}
//         <div style={S.amount}>{fmt(downPayment)}</div>
//         <div style={S.amountLabel}>
//           {isMilestonePayment
//             ? milestone.label
//             : plan
//               ? `First payment (${firstMilestone?.label || "Down Payment"})`
//               : "Total amount due"
//           }
//         </div>
//         {isInstalment && (
//           <div style={S.totalNote}>
//             Total unit price: {fmt(booking.total_amount)} · Remaining: {fmt(booking.total_amount - downPayment)} in future instalments
//           </div>
//         )}

//         {/* No gateway warning */}
//         {!gateway && (
//           <div style={{ color: "#ff6b6b", fontSize: "13px", margin: "16px 0", padding: "10px", background: "rgba(255,107,107,0.06)", borderRadius: "8px" }}>
//             ⚠ No payment gateway configured. Please contact admin.
//           </div>
//         )}

//         {/* Error */}
//         {error && <div style={S.err}>⚠ {error}</div>}

//         {/* Pay button — disabled if milestone already paid */}
//         <button
//           style={{ ...S.btn, marginTop: "20px", ...(paying || !gateway || milestone?.status === "paid" ? S.btnDis : {}) }}
//           onClick={handlePay}
//           disabled={paying || !gateway || milestone?.status === "paid"}
//         >
//           {paying ? "Processing…" : providerLabel}
//         </button>

//         <button
//           style={{ ...S.backBtn, marginTop: "14px", display: "block", width: "100%", textAlign: "center" }}
//           onClick={() => navigate(-1)}
//         >
//           ← Cancel &amp; Go Back
//         </button>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// const fmt = (n, sym = "₹") => {
//   if (n == null || n === "") return "—";
//   return sym + parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// function loadRazorpay() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const s = document.createElement("script");
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });
// }

// function loadStripe(publishableKey) {
//   return new Promise((resolve) => {
//     if (window.Stripe) return resolve(window.Stripe(publishableKey));
//     const s = document.createElement("script");
//     s.src = "https://js.stripe.com/v3/";
//     s.onload = () => resolve(window.Stripe(publishableKey));
//     s.onerror = () => resolve(null);
//     document.body.appendChild(s);
//   });
// }

// // ── Fee Breakdown Card ────────────────────────────────────────────────────────
// function FeeBreakdown({ breakdown, sym = "₹" }) {
//   if (!breakdown || !breakdown.tax_enabled) return null;

//   const f = (n) => fmt(n, sym);
//   const labels = breakdown.fee_labels || {};

//   const extraFees = [
//     breakdown.processing_fee   > 0 && { label: labels.processing   || "Processing Fee",   val: breakdown.processing_fee   },
//     breakdown.stamp_duty        > 0 && { label: labels.stamp_duty   || "Stamp Duty",       val: breakdown.stamp_duty        },
//     breakdown.registration_fee  > 0 && { label: labels.registration || "Registration Fee", val: breakdown.registration_fee  },
//     breakdown.maintenance_charge> 0 && { label: labels.maintenance  || "Maintenance",      val: breakdown.maintenance_charge },
//     breakdown.custom_fee1       > 0 && { label: labels.custom1      || "Custom Fee 1",     val: breakdown.custom_fee1       },
//     breakdown.custom_fee2       > 0 && { label: labels.custom2      || "Custom Fee 2",     val: breakdown.custom_fee2       },
//   ].filter(Boolean);

//   const hasExtras = extraFees.length > 0 || breakdown.tax_amount > 0;
//   if (!hasExtras) return null;

//   return (
//     <div style={{
//       background: "rgba(201,169,110,0.06)",
//       border: "1px solid rgba(201,169,110,0.2)",
//       borderRadius: "10px",
//       padding: "14px 16px",
//       marginBottom: "16px",
//     }}>
//       <div style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
//         📄 Charges Breakdown
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
//         {/* Unit Price */}
//         <div style={{ display: "flex", justifyContent: "space-between", color: "#888" }}>
//           <span>Unit Price</span>
//           <span>{f(breakdown.unit_price)}</span>
//         </div>

//         {/* Additional fees */}
//         {extraFees.map((fee, i) => (
//           <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "#888" }}>
//             <span>{fee.label}</span>
//             <span>{f(fee.val)}</span>
//           </div>
//         ))}

//         {/* Tax */}
//         {breakdown.tax_amount > 0 && (
//           <div style={{
//             display: "flex", justifyContent: "space-between",
//             color: "#f59e0b", fontWeight: "600",
//             borderTop: "1px solid rgba(255,255,255,0.08)",
//             paddingTop: "6px", marginTop: "2px",
//           }}>
//             <span>
//               {breakdown.tax_label || "Tax"}
//               {breakdown.tax_rate > 0 && (
//                 <span style={{ fontSize: "11px", marginLeft: "6px", opacity: 0.8 }}>
//                   ({breakdown.tax_rate}%
//                   {breakdown.tax_system ? ` · ${breakdown.tax_system.toUpperCase()}` : ""}
//                   {breakdown.tax_inclusive ? " · Incl." : ""})
//                 </span>
//               )}
//             </span>
//             <span>{f(breakdown.tax_amount)}</span>
//           </div>
//         )}

//         {/* Grand total */}
//         <div style={{
//           display: "flex", justifyContent: "space-between",
//           color: "#c9a96e", fontWeight: "800", fontSize: "15px",
//           borderTop: "1px solid rgba(201,169,110,0.3)",
//           paddingTop: "8px", marginTop: "4px",
//         }}>
//           <span>Grand Total</span>
//           <span>{f(breakdown.total_amount)}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function PaymentPage() {
//   const { bookingId } = useParams();
//   const navigate      = useNavigate();
//   const user          = useSelector(selectUser);

//   const [booking,       setBooking]       = useState(null);
//   const [gateway,       setGateway]       = useState(null);
//   const [loading,       setLoading]       = useState(true);
//   const [paying,        setPaying]        = useState(false);
//   const [error,         setError]         = useState("");
//   const [success,       setSuccess]       = useState(false);
//   const [milestone,     setMilestone]     = useState(null);
//   const [milestoneLoad, setMilestoneLoad] = useState(false);

//   const milestoneId        = new URLSearchParams(window.location.search).get("milestone");
//   const isMilestonePayment = !!milestoneId && !!milestone;

//   useEffect(() => { if (!user?.token) navigate("/"); }, [user]);

//   useEffect(() => {
//     if (!user?.token || !bookingId) return;
//     (async () => {
//       try {
//         const [bRes, gRes] = await Promise.all([
//           fetch(`${API_BASE}/bookings/${bookingId}`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//           fetch(`${API_BASE}/payment/config`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//         ]);

//         if (!bRes.ok) throw new Error("Booking not found.");
//         if (!gRes.ok) throw new Error("Payment gateway not configured.");

//         const bData = await bRes.json();
//         const gData = await gRes.json();

//         setBooking(bData.booking);
//         setGateway(gData);

//         if (bData.booking?.booking_status === "confirmed" && !milestoneId) {
//           setSuccess(true);
//         }

//         if (milestoneId) {
//           setMilestoneLoad(true);
//           try {
//             const mRes = await fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//               headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//             });
//             if (mRes.ok) {
//               const mData = await mRes.json();
//               const found = (mData.milestones || []).find((m) => String(m.id) === String(milestoneId));
//               if (!found) throw new Error("Milestone not found.");
//               if (found.status === "paid") setError("This milestone has already been paid.");
//               setMilestone(found);
//             }
//           } catch (mErr) {
//             setError(mErr.message || "Failed to load milestone.");
//           } finally {
//             setMilestoneLoad(false);
//           }
//         }
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [bookingId, user]);

//   // ── Derive amounts ─────────────────────────────────────────────────────────
//   const feeBreakdown = booking?.fee_breakdown || null;
//   const currSym      = feeBreakdown?.currency_symbol || "₹";
//   const fmtAmt       = (n) => fmt(n, currSym);

//   const plan           = booking?.payment_plan;
//   const firstMilestone = plan?.milestones?.[0];
//   const unitPrice      = parseFloat(booking?.price || 0);

//   // Milestone payment uses total_with_tax from the milestones API
//   // Full payment uses total_amount (grand total with tax)
//   const downPayment = isMilestonePayment
//     ? (milestone.total_with_tax ?? milestone.amount)
//     : booking?.down_payment_amount
//       || booking?.total_amount
//       || unitPrice;

//   const isInstalment = !isMilestonePayment && plan
//     && booking?.down_payment_amount
//     && booking?.total_amount
//     && booking.down_payment_amount < booking.total_amount;

//   // ── RAZORPAY ───────────────────────────────────────────────────────────────
//   const payWithRazorpay = async () => {
//     setPaying(true); setError("");
//     const ok = await loadRazorpay();
//     if (!ok) { setError("Razorpay failed to load."); setPaying(false); return; }

//     const res = await fetch(`${API_BASE}/payment/razorpay/create-order`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Order creation failed."); setPaying(false); return; }

//     const options = {
//       key:         gateway.key,
//       amount:      data.amount,
//       currency:    data.currency || "INR",
//       name:        data.app_name || "Property Booking",
//       description: isMilestonePayment
//         ? `${milestone.label} · Unit ${booking?.plot_number}`
//         : `Unit ${booking?.plot_number} — Booking #${bookingId}`,
//       order_id: data.order_id,
//       prefill:  { name: user.name, email: user.email, contact: (user.country_code || "+91") + (user.phone || "") },
//       theme:    { color: "#c9a96e" },
//       handler: async (response) => {
//         const vRes = await fetch(`${API_BASE}/payment/razorpay/verify`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           body: JSON.stringify({ ...response, booking_id: bookingId, milestone_id: milestoneId || undefined }),
//         });
//         const vData = await vRes.json();
//         if (vRes.ok) { setSuccess(true); setPaying(false); }
//         else { setError(vData.message || "Verification failed."); setPaying(false); }
//       },
//       modal: { ondismiss: () => setPaying(false) },
//     };
//     new window.Razorpay(options).open();
//   };

//   // ── STRIPE ─────────────────────────────────────────────────────────────────
//   const payWithStripe = async () => {
//     setPaying(true); setError("");
//     const stripe = await loadStripe(gateway.key);
//     if (!stripe) { setError("Stripe failed to load."); setPaying(false); return; }
//     const res = await fetch(`${API_BASE}/payment/stripe/checkout`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Session creation failed."); setPaying(false); return; }
//     const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.session_id });
//     if (stripeError) { setError(stripeError.message); setPaying(false); }
//   };

//   // ── PHONEPE ────────────────────────────────────────────────────────────────
//   const payWithPhonePe = async () => {
//     setPaying(true); setError("");
//     const res = await fetch(`${API_BASE}/payment/phonepe/initiate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "PhonePe initiation failed."); setPaying(false); return; }
//     window.location.href = data.redirect_url;
//   };

//   const handlePay = () => {
//     if (!gateway) return;
//     const p = gateway.provider?.toLowerCase();
//     if      (p === "razorpay") payWithRazorpay();
//     else if (p === "stripe")   payWithStripe();
//     else if (p === "phonepe")  payWithPhonePe();
//     else setError(`Unknown payment provider: ${gateway.provider}`);
//   };

//   const providerLabel = gateway?.provider
//     ? { razorpay: "Pay with Razorpay", stripe: "Pay with Stripe", phonepe: "Pay with PhonePe" }[gateway.provider.toLowerCase()] || "Proceed to Pay"
//     : "Proceed to Pay";

//   // ── Styles ─────────────────────────────────────────────────────────────────
//   const S = {
//     page:      { minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "24px" },
//     card:      { background: "#161628", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "16px", padding: "36px", maxWidth: "520px", width: "100%" },
//     title:     { color: "#c9a96e", fontSize: "22px", fontWeight: "700", marginBottom: "6px" },
//     sub:       { color: "#888", fontSize: "13px", marginBottom: "24px" },
//     row:       { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#ccc", fontSize: "14px" },
//     label:     { color: "#888" },
//     planBox:   { margin: "16px 0 0", padding: "14px 16px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "10px" },
//     planTitle: { color: "#c9a96e", fontWeight: "700", fontSize: "13px", marginBottom: "8px" },
//     msRow:     { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "12px" },
//     amount:    { color: "#c9a96e", fontSize: "34px", fontWeight: "800", margin: "20px 0 2px" },
//     amtLabel:  { color: "#666", fontSize: "12px", marginBottom: "4px" },
//     taxNote:   { color: "#f59e0b", fontSize: "12px", marginBottom: "6px" },
//     totalNote: { color: "#555", fontSize: "12px", marginBottom: "20px" },
//     btn:       { width: "100%", padding: "16px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px" },
//     btnDis:    { opacity: 0.6, cursor: "not-allowed" },
//     err:       { color: "#ff6b6b", fontSize: "13px", marginTop: "12px", padding: "10px", background: "rgba(255,107,107,0.08)", borderRadius: "8px" },
//     success:   { textAlign: "center", padding: "20px 0" },
//     tick:      { fontSize: "56px", marginBottom: "12px" },
//     sTitle:    { color: "#4caf50", fontSize: "20px", fontWeight: "700", marginBottom: "8px" },
//     sSub:      { color: "#888", fontSize: "14px", marginBottom: "24px" },
//     backBtn:   { background: "transparent", border: "1px solid rgba(201,169,110,0.4)", color: "#c9a96e", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
//   };

//   if (loading || milestoneLoad) return (
//     <div style={S.page}><div style={{ color: "#c9a96e", fontSize: "16px" }}>Loading payment details…</div></div>
//   );

//   if (error && !booking) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={{ color: "#ff6b6b", fontSize: "16px", marginBottom: "16px" }}>⚠ {error}</div>
//         <button style={S.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
//       </div>
//     </div>
//   );

//   if (milestoneId && milestone?.status === "paid") return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Already Paid</div>
//           <div style={S.sSub}>{milestone.label} for Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> has already been paid.</div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   if (success) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Payment Successful!</div>
//           <div style={S.sSub}>
//             {isMilestonePayment
//               ? <>Payment for <strong style={{ color: "#c9a96e" }}>{milestone?.label}</strong> on Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> confirmed.</>
//               : <>Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> booking confirmed. A receipt will be sent to {user?.email}.</>
//             }
//           </div>
//           <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "12px 16px", margin: "16px 0", fontSize: "13px", color: "#888" }}>
//             {[
//               ["Booking ID", `#${bookingId}`],
//               ["Unit", booking?.plot_number],
//               ...(isMilestonePayment ? [["Milestone", milestone?.label]] : []),
//               ["Amount Paid", fmtAmt(downPayment)],
//               ...(feeBreakdown?.tax_amount > 0 ? [[`${feeBreakdown.tax_label || "Tax"} included`, fmtAmt(feeBreakdown.tax_amount)]] : []),
//             ].map(([k, v]) => (
//               <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//                 <span>{k}</span>
//                 <span style={{ color: k === "Amount Paid" ? "#c9a96e" : "#ccc", fontWeight: k === "Amount Paid" ? "700" : "400" }}>{v}</span>
//               </div>
//             ))}
//           </div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div style={S.page}>
//       <div style={S.card}>

//         {/* Header */}
//         <div style={S.title}>{isMilestonePayment ? "Milestone Payment" : "Complete Your Booking"}</div>
//         <div style={S.sub}>
//           {isMilestonePayment
//             ? `${milestone.label} · Booking #${bookingId} · Unit ${booking?.plot_number}`
//             : `Booking #${bookingId} · ${booking?.plot_type} — Unit ${booking?.plot_number}`}
//         </div>

//         {/* Booking summary rows */}
//         <div>
//           {[
//             ["Project",   booking?.project_name || booking?.project?.name || "—"],
//             ["Floor",     booking?.block_name   || booking?.block?.name   || booking?.block || "—"],
//             ["Area",      booking?.area ? `${booking.area} sq.ft` : "—"],
//             ["Your Name", user?.name],
//             ["Email",     user?.email],
//           ].map(([k, v]) => (
//             <div key={k} style={S.row}>
//               <span style={S.label}>{k}</span>
//               <span>{v}</span>
//             </div>
//           ))}
//         </div>

//         {/* Plan / milestone breakdown */}
//         {isMilestonePayment ? (
//           <div style={S.planBox}>
//             <div style={S.planTitle}>💳 Milestone Payment</div>
//             <div style={{ ...S.msRow, color: "#c9a96e", fontWeight: "700" }}>
//               <span>👉 {milestone.label}</span>
//               <span>{fmtAmt(milestone.amount)}</span>
//             </div>
//             {/* Show tax on milestone */}
//             {milestone.tax_amount > 0 && (
//               <div style={{ ...S.msRow, color: "#f59e0b" }}>
//                 <span>{milestone.tax_label || "Tax"} ({milestone.tax_rate}%)</span>
//                 <span>{fmtAmt(milestone.tax_amount)}</span>
//               </div>
//             )}
//             {milestone.extra_fees > 0 && (
//               <div style={{ ...S.msRow, color: "#888" }}>
//                 <span>Additional Fees</span>
//                 <span>{fmtAmt(milestone.extra_fees)}</span>
//               </div>
//             )}
//             {(milestone.tax_amount > 0 || milestone.extra_fees > 0) && (
//               <div style={{ ...S.msRow, color: "#c9a96e", fontWeight: "700", borderTop: "1px solid rgba(201,169,110,0.3)", paddingTop: "8px" }}>
//                 <span>Total Due</span>
//                 <span>{fmtAmt(milestone.total_with_tax ?? milestone.amount)}</span>
//               </div>
//             )}
//             {milestone.due_date && (
//               <div style={{ fontSize: "11px", color: "#888", marginTop: "8px" }}>Due date: {milestone.due_date}</div>
//             )}
//           </div>
//         ) : plan ? (
//           <div style={S.planBox}>
//             <div style={S.planTitle}>💳 {plan.name}</div>
//             {plan.milestones?.map((m, i) => {
//               const amt = m.calculated_amount
//                 || (m.percentage ? Math.round(unitPrice * m.percentage / 100) : null)
//                 || m.fixed_amount;
//               return (
//                 <div key={i} style={{ ...S.msRow, ...(i === 0 ? { color: "#c9a96e", fontWeight: "700" } : { color: "rgba(255,255,255,0.4)" }) }}>
//                   <span>
//                     {i === 0 && "👉 "}{m.label}
//                     {m.percentage ? ` (${m.percentage}%)` : ""}
//                     {i === 0 && <span style={{ fontSize: "10px", marginLeft: "6px", color: "#888" }}>← Due now</span>}
//                   </span>
//                   <span>{amt ? fmtAmt(amt) : "—"}</span>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div style={{ margin: "16px 0 0", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
//             💰 Full Payment — no instalment plan
//           </div>
//         )}

//         {/* ── Fee / Tax Breakdown ── */}
//         {!isMilestonePayment && (
//           <div style={{ marginTop: "16px" }}>
//             <FeeBreakdown breakdown={feeBreakdown} sym={currSym} />
//           </div>
//         )}

//         {/* Amount due */}
//         <div style={S.amount}>{fmtAmt(downPayment)}</div>
//         <div style={S.amtLabel}>
//           {isMilestonePayment
//             ? `${milestone.label}${milestone.tax_amount > 0 ? " (incl. tax)" : ""}`
//             : plan
//               ? `First payment — ${firstMilestone?.label || "Down Payment"}${feeBreakdown?.tax_enabled ? " (incl. tax)" : ""}`
//               : `Total amount due${feeBreakdown?.tax_enabled ? " (incl. taxes & fees)" : ""}`
//           }
//         </div>

//         {/* Tax included note */}
//         {!isMilestonePayment && feeBreakdown?.tax_amount > 0 && (
//           <div style={S.taxNote}>
//             ✓ Includes {feeBreakdown.tax_label || "Tax"} of {fmtAmt(
//               isInstalment
//                 ? (feeBreakdown.tax_amount * (downPayment / feeBreakdown.total_amount))
//                 : feeBreakdown.tax_amount
//             )}
//           </div>
//         )}

//         {isInstalment && (
//           <div style={S.totalNote}>
//             Grand Total: {fmtAmt(booking.total_amount)} · Remaining: {fmtAmt(booking.total_amount - downPayment)} in future instalments
//           </div>
//         )}

//         {!gateway && (
//           <div style={{ color: "#ff6b6b", fontSize: "13px", margin: "16px 0", padding: "10px", background: "rgba(255,107,107,0.06)", borderRadius: "8px" }}>
//             ⚠ No payment gateway configured. Please contact admin.
//           </div>
//         )}

//         {error && <div style={S.err}>⚠ {error}</div>}

//         <button
//           style={{ ...S.btn, marginTop: "20px", ...(paying || !gateway || milestone?.status === "paid" ? S.btnDis : {}) }}
//           onClick={handlePay}
//           disabled={paying || !gateway || milestone?.status === "paid"}
//         >
//           {paying ? "Processing…" : providerLabel}
//         </button>

//         <button
//           style={{ ...S.backBtn, marginTop: "14px", display: "block", width: "100%", textAlign: "center" }}
//           onClick={() => navigate(-1)}
//         >
//           ← Cancel &amp; Go Back
//         </button>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// const fmt = (n, sym = "₹") => {
//   if (n == null || n === "") return "—";
//   return sym + parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// function loadRazorpay() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const s = document.createElement("script");
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });
// }

// function loadStripe(publishableKey) {
//   return new Promise((resolve) => {
//     if (window.Stripe) return resolve(window.Stripe(publishableKey));
//     const s = document.createElement("script");
//     s.src = "https://js.stripe.com/v3/";
//     s.onload = () => resolve(window.Stripe(publishableKey));
//     s.onerror = () => resolve(null);
//     document.body.appendChild(s);
//   });
// }

// // ── Shared row component ───────────────────────────────────────────────────────
// const BRow = ({ label, value, accent, bold, borderTop, sub }) => (
//   <div style={{
//     display: "flex", justifyContent: "space-between", alignItems: "flex-start",
//     padding: borderTop ? "8px 0 4px" : "4px 0",
//     borderTop: borderTop ? "1px solid rgba(255,255,255,0.07)" : "none",
//     marginTop: borderTop ? "4px" : 0,
//   }}>
//     <span style={{ fontSize: sub ? "11px" : "13px", color: accent || (bold ? "#c9a96e" : "#888"), fontWeight: bold ? "700" : "400", lineHeight: 1.4 }}>
//       {label}
//     </span>
//     <span style={{ fontSize: sub ? "11px" : "13px", color: accent || (bold ? "#c9a96e" : "#ccc"), fontWeight: bold ? "800" : "400", textAlign: "right", marginLeft: "12px" }}>
//       {value}
//     </span>
//   </div>
// );

// // ── GrandTotalBreakdown: detailed card with all fees + tax ─────────────────────
// function GrandTotalBreakdown({ breakdown, sym = "₹" }) {
//   const [expanded, setExpanded] = useState(false);
//   if (!breakdown) return null;

//   const f = (n) => fmt(n, sym);
//   const labels = breakdown.fee_labels || {};

//   const extraFees = [
//     breakdown.processing_fee    > 0 && { label: labels.processing   || "Processing Fee",   val: breakdown.processing_fee    },
//     breakdown.stamp_duty        > 0 && { label: labels.stamp_duty   || "Stamp Duty",       val: breakdown.stamp_duty         },
//     breakdown.registration_fee  > 0 && { label: labels.registration || "Registration Fee", val: breakdown.registration_fee   },
//     breakdown.maintenance_charge> 0 && { label: labels.maintenance  || "Maintenance",      val: breakdown.maintenance_charge  },
//     breakdown.custom_fee1       > 0 && { label: labels.custom1      || "Custom Fee 1",     val: breakdown.custom_fee1        },
//     breakdown.custom_fee2       > 0 && { label: labels.custom2      || "Custom Fee 2",     val: breakdown.custom_fee2        },
//   ].filter(Boolean);

//   const hasCharges = extraFees.length > 0 || breakdown.tax_amount > 0;
//   if (!hasCharges) return null;

//   return (
//     <div style={{
//       background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)",
//       borderRadius: "10px", overflow: "hidden", marginBottom: "16px",
//     }}>
//       {/* Header toggle */}
//       <button
//         type="button"
//         onClick={() => setExpanded((e) => !e)}
//         style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
//       >
//         <span style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//           📄 Grand Total Breakdown
//         </span>
//         <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{expanded ? "▲ Hide" : "▼ Show"}</span>
//       </button>

//       {expanded && (
//         <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px" }}>
//           <BRow label="Unit Price" value={f(breakdown.unit_price)} />
//           {extraFees.map((fee, i) => <BRow key={i} label={fee.label} value={f(fee.val)} />)}
//           {breakdown.tax_amount > 0 && (
//             <BRow
//               label={`${breakdown.tax_label || "Tax"} (${breakdown.tax_rate || 0}%${breakdown.tax_system ? ` · ${breakdown.tax_system.toUpperCase()}` : ""}${breakdown.tax_inclusive ? " · Incl." : ""})`}
//               value={f(breakdown.tax_amount)}
//               accent="#f59e0b"
//               borderTop
//             />
//           )}
//           <BRow label="Grand Total" value={f(breakdown.total_amount)} bold borderTop />
//         </div>
//       )}

//       {/* Collapsed summary line */}
//       {!expanded && (
//         <div style={{ padding: "0 16px 12px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
//           <span style={{ color: "#888" }}>
//             Unit {f(breakdown.unit_price)}
//             {breakdown.tax_amount > 0 && <span style={{ color: "#f59e0b", marginLeft: "6px" }}>+ {breakdown.tax_label || "Tax"} {f(breakdown.tax_amount)}</span>}
//             {extraFees.length > 0 && <span style={{ color: "#6b7f95", marginLeft: "6px" }}>+ {extraFees.length} fee{extraFees.length > 1 ? "s" : ""}</span>}
//           </span>
//           <span style={{ color: "#c9a96e", fontWeight: "800" }}>{f(breakdown.total_amount)}</span>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── MilestoneBreakdown: per-milestone tax/fee card ─────────────────────────────
// function MilestoneBreakdown({ milestone, sym = "₹" }) {
//   const f = (n) => fmt(n, sym);
//   const hasTax   = (milestone.tax_amount   || 0) > 0;
//   const hasFees  = (milestone.extra_fees   || 0) > 0;
//   if (!hasTax && !hasFees) return null;

//   return (
//     <div style={{
//       background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
//       borderRadius: "8px", padding: "10px 14px", marginTop: "10px",
//     }}>
//       <div style={{ fontSize: "10px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
//         Charges for this milestone
//       </div>
//       <BRow label="Base amount" value={f(milestone.amount)} />
//       {hasFees && <BRow label="Additional Fees" value={f(milestone.extra_fees)} />}
//       {hasTax && (
//         <BRow
//           label={`${milestone.tax_label || "Tax"}${milestone.tax_rate > 0 ? ` (${milestone.tax_rate}%)` : ""}`}
//           value={f(milestone.tax_amount)}
//           accent="#f59e0b"
//           borderTop
//         />
//       )}
//       <BRow
//         label="Milestone total"
//         value={f(milestone.total_with_tax ?? milestone.amount)}
//         bold
//         borderTop
//       />
//     </div>
//   );
// }

// // ── FullPaymentBreakdown: shows all milestones with per-row tax segregation ────
// function FullPaymentBreakdown({ plan, unitPrice, feeBreakdown, sym = "₹" }) {
//   if (!plan?.milestones?.length) return null;
//   const f = (n) => fmt(n, sym);
//   const basePrice = parseFloat(String(unitPrice || "0").replace(/[^0-9.]/g, "")) || 0;
//   const grandTotal = feeBreakdown?.total_amount || basePrice;

//   return (
//     <div style={{
//       background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
//       borderRadius: "10px", overflow: "hidden", marginTop: "16px",
//     }}>
//       <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(201,169,110,0.05)" }}>
//         <div style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//           💳 {plan.name} — Schedule
//         </div>
//         {feeBreakdown?.tax_enabled && (
//           <div style={{ fontSize: "11px", color: "#6b7f95", marginTop: "3px" }}>
//             Grand Total: {f(grandTotal)} · Each instalment includes proportional taxes &amp; fees
//           </div>
//         )}
//       </div>
//       {plan.milestones.map((m, i) => {
//         const isFirst = i === 0;
//         const pct = parseFloat(m.percentage) || 0;
//         const baseAmt = m.calculated_amount
//           || (pct > 0 && basePrice > 0 ? Math.round(basePrice * pct / 100) : null)
//           || m.fixed_amount || 0;
//         // Compute proportional tax from grand total breakdown
//         const propTax   = feeBreakdown?.tax_amount  ? feeBreakdown.tax_amount  * (pct / 100) : 0;
//         const propFees  = feeBreakdown ? (
//           (feeBreakdown.processing_fee     || 0) +
//           (feeBreakdown.stamp_duty         || 0) +
//           (feeBreakdown.registration_fee   || 0) +
//           (feeBreakdown.maintenance_charge || 0) +
//           (feeBreakdown.custom_fee1        || 0) +
//           (feeBreakdown.custom_fee2        || 0)
//         ) * (pct / 100) : 0;
//         const propTotal = baseAmt + propTax + propFees;

//         return (
//           <div key={i} style={{
//             padding: "12px 16px",
//             borderBottom: i < plan.milestones.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
//             background: isFirst ? "rgba(201,169,110,0.06)" : "transparent",
//           }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
//               <div style={{ flex: 1 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                   {isFirst && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "12px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontWeight: "700" }}>Due Now</span>}
//                   <span style={{ fontSize: "13px", fontWeight: isFirst ? "700" : "500", color: isFirst ? "#d8e6f0" : "rgba(255,255,255,0.5)" }}>{m.label}</span>
//                   {pct > 0 && <span style={{ fontSize: "11px", color: "#6b7f95" }}>({pct}%)</span>}
//                 </div>
//                 {m.due_date && <div style={{ fontSize: "11px", color: "#5a7a9a", marginTop: "4px" }}>📅 Due: {m.due_date}</div>}
//                 {m.due_after_days && !m.due_date && <div style={{ fontSize: "11px", color: "#5a7a9a", marginTop: "4px" }}>📅 Due: {m.due_after_days} days after booking</div>}
//               </div>
//               <div style={{ textAlign: "right", flexShrink: 0 }}>
//                 {/* Base amount (unit price portion) */}
//                 <div style={{ fontSize: "11px", color: "#6b7f95" }}>
//                   Base: {f(baseAmt)}
//                 </div>
//                 {/* Proportional tax */}
//                 {propTax > 0 && (
//                   <div style={{ fontSize: "11px", color: "#f59e0b" }}>
//                     {feeBreakdown.tax_label || "Tax"}: {f(propTax)}
//                   </div>
//                 )}
//                 {/* Proportional fees */}
//                 {propFees > 0 && (
//                   <div style={{ fontSize: "11px", color: "#6b7f95" }}>
//                     Fees: {f(propFees)}
//                   </div>
//                 )}
//                 {/* Instalment total */}
//                 <div style={{ fontSize: isFirst ? "16px" : "13px", fontWeight: "800", color: isFirst ? "#c9a96e" : "rgba(255,255,255,0.5)", marginTop: "3px" }}>
//                   {f(feeBreakdown?.tax_enabled ? propTotal : baseAmt)}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default function PaymentPage() {
//   const { bookingId } = useParams();
//   const navigate      = useNavigate();
//   const user          = useSelector(selectUser);

//   const [booking,       setBooking]       = useState(null);
//   const [gateway,       setGateway]       = useState(null);
//   const [loading,       setLoading]       = useState(true);
//   const [paying,        setPaying]        = useState(false);
//   const [error,         setError]         = useState("");
//   const [success,       setSuccess]       = useState(false);
//   const [milestone,     setMilestone]     = useState(null);
//   const [milestoneLoad, setMilestoneLoad] = useState(false);

//   const milestoneId        = new URLSearchParams(window.location.search).get("milestone");
//   const isMilestonePayment = !!milestoneId && !!milestone;

//   console.log(milestoneId);

//   useEffect(() => { if (!user?.token) navigate("/"); }, [user]);

//   useEffect(() => {
//     if (!user?.token || !bookingId) return;
//     (async () => {
//       try {
//         const [bRes, gRes] = await Promise.all([
//           fetch(`${API_BASE}/bookings/${bookingId}`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//           fetch(`${API_BASE}/payment/config`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//         ]);

//         if (!bRes.ok) throw new Error("Booking not found.");
//         if (!gRes.ok) throw new Error("Payment gateway not configured.");

//         const bData = await bRes.json();
//         const gData = await gRes.json();

//         setBooking(bData.booking);
//         setGateway(gData);

//         if (bData.booking?.booking_status === "confirmed" && !milestoneId) {
//           setSuccess(true);
//         }

//         if (milestoneId) {
//           setMilestoneLoad(true);
//           try {
//             const mRes = await fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//               headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//             });
//             if (mRes.ok) {
//               const mData = await mRes.json();
//               const found = (mData.milestones || []).find((m) => String(m.id) === String(milestoneId));
//               if (!found) throw new Error("Milestone not found.");
//               if (found.status === "paid") setError("This milestone has already been paid.");
//               setMilestone(found);
//             }
//           } catch (mErr) {
//             setError(mErr.message || "Failed to load milestone.");
//           } finally {
//             setMilestoneLoad(false);
//           }
//         }
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [bookingId, user]);

//   // ── Derived values ─────────────────────────────────────────────────────────
//   const feeBreakdown = booking?.fee_breakdown || null;
//   const currSym      = feeBreakdown?.currency_symbol || "₹";
//   const fmtAmt       = (n) => fmt(n, currSym);

//   const plan           = booking?.payment_plan;
//   const firstMilestone = plan?.milestones?.[0];
//   const unitPrice      = parseFloat(booking?.price || 0);

//   const downPayment = isMilestonePayment
//     ? (milestone.total_with_tax ?? milestone.amount)
//     : booking?.down_payment_amount
//       || booking?.total_amount
//       || unitPrice;

//   const isInstalment = !isMilestonePayment && plan
//     && booking?.down_payment_amount
//     && booking?.total_amount
//     && booking.down_payment_amount < booking.total_amount;

//   // First milestone amounts computed from fee_breakdown proportionally
//   const firstMsPct  = firstMilestone ? parseFloat(firstMilestone.percentage) || 0 : 100;
//   const firstMsBase = feeBreakdown ? (feeBreakdown.unit_price || unitPrice) * (firstMsPct / 100) : unitPrice;
//   const firstMsTax  = feeBreakdown?.tax_amount  ? feeBreakdown.tax_amount  * (firstMsPct / 100) : 0;
//   const firstMsFees = feeBreakdown ? (
//     (feeBreakdown.processing_fee     || 0) +
//     (feeBreakdown.stamp_duty         || 0) +
//     (feeBreakdown.registration_fee   || 0) +
//     (feeBreakdown.maintenance_charge || 0) +
//     (feeBreakdown.custom_fee1        || 0) +
//     (feeBreakdown.custom_fee2        || 0)
//   ) * (firstMsPct / 100) : 0;

//   // ── Payment handlers ───────────────────────────────────────────────────────
//   const payWithRazorpay = async () => {
//     setPaying(true); setError("");
//     const ok = await loadRazorpay();
//     if (!ok) { setError("Razorpay failed to load."); setPaying(false); return; }
//     const res = await fetch(`${API_BASE}/payment/razorpay/create-order`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();

//     console.log(data);

//     if (!res.ok) { setError(data.message || "Order creation failed."); setPaying(false); return; }
//     const options = {
//       key: gateway.key, amount: data.amount, currency: data.currency || "INR",
//       name: data.app_name || "Property Booking",
//       description: isMilestonePayment
//         ? `${milestone.label} · Unit ${booking?.plot_number}`
//         : `Unit ${booking?.plot_number} — Booking #${bookingId}`,
//       order_id: data.order_id,
//       prefill: { name: user.name, email: user.email, contact: (user.country_code || "+91") + (user.phone || "") },
//       theme: { color: "#c9a96e" },
//       handler: async (response) => {
//         const vRes = await fetch(`${API_BASE}/payment/razorpay/verify`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           body: JSON.stringify({ ...response, booking_id: bookingId, milestone_id: milestoneId || undefined }),
//         });
//         const vData = await vRes.json();
//         if (vRes.ok) { setSuccess(true); setPaying(false); }
//         else { setError(vData.message || "Verification failed."); setPaying(false); }
//       },
//       modal: { ondismiss: () => setPaying(false) },
//     };
//     new window.Razorpay(options).open();
//   };

//   const payWithStripe = async () => {
//     setPaying(true); setError("");
//     const stripe = await loadStripe(gateway.key);
//     if (!stripe) { setError("Stripe failed to load."); setPaying(false); return; }
//     const res = await fetch(`${API_BASE}/payment/stripe/checkout`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Session creation failed."); setPaying(false); return; }
//     const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.session_id });
//     if (stripeError) { setError(stripeError.message); setPaying(false); }
//   };

//   const payWithPhonePe = async () => {
//     setPaying(true); setError("");
//     const res = await fetch(`${API_BASE}/payment/phonepe/initiate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "PhonePe initiation failed."); setPaying(false); return; }
//     window.location.href = data.redirect_url;
//   };

//   const handlePay = () => {
//     if (!gateway) return;
//     const p = gateway.provider?.toLowerCase();
//     if      (p === "razorpay") payWithRazorpay();
//     else if (p === "stripe")   payWithStripe();
//     else if (p === "phonepe")  payWithPhonePe();
//     else setError(`Unknown payment provider: ${gateway.provider}`);
//   };

//   const providerLabel = gateway?.provider
//     ? { razorpay: "Pay with Razorpay", stripe: "Pay with Stripe", phonepe: "Pay with PhonePe" }[gateway.provider.toLowerCase()] || "Proceed to Pay"
//     : "Proceed to Pay";

//   // ── Styles ─────────────────────────────────────────────────────────────────
//   const S = {
//     page:    { minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "24px" },
//     card:    { background: "#161628", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "16px", padding: "36px", maxWidth: "520px", width: "100%" },
//     title:   { color: "#c9a96e", fontSize: "22px", fontWeight: "700", marginBottom: "6px" },
//     sub:     { color: "#888", fontSize: "13px", marginBottom: "24px" },
//     row:     { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#ccc", fontSize: "14px" },
//     label:   { color: "#888" },
//     amount:  { color: "#c9a96e", fontSize: "34px", fontWeight: "800", margin: "20px 0 2px" },
//     amtLabel:{ color: "#666", fontSize: "12px", marginBottom: "4px" },
//     btn:     { width: "100%", padding: "16px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px" },
//     btnDis:  { opacity: 0.6, cursor: "not-allowed" },
//     err:     { color: "#ff6b6b", fontSize: "13px", marginTop: "12px", padding: "10px", background: "rgba(255,107,107,0.08)", borderRadius: "8px" },
//     success: { textAlign: "center", padding: "20px 0" },
//     tick:    { fontSize: "56px", marginBottom: "12px" },
//     sTitle:  { color: "#4caf50", fontSize: "20px", fontWeight: "700", marginBottom: "8px" },
//     sSub:    { color: "#888", fontSize: "14px", marginBottom: "24px" },
//     backBtn: { background: "transparent", border: "1px solid rgba(201,169,110,0.4)", color: "#c9a96e", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
//   };

//   if (loading || milestoneLoad) return (
//     <div style={S.page}><div style={{ color: "#c9a96e", fontSize: "16px" }}>Loading payment details…</div></div>
//   );

//   if (error && !booking) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={{ color: "#ff6b6b", fontSize: "16px", marginBottom: "16px" }}>⚠ {error}</div>
//         <button style={S.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
//       </div>
//     </div>
//   );

//   if (milestoneId && milestone?.status === "paid") return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Already Paid</div>
//           <div style={S.sSub}>{milestone.label} for Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> has already been paid.</div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   if (success) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Payment Successful!</div>
//           <div style={S.sSub}>
//             {isMilestonePayment
//               ? <>Payment for <strong style={{ color: "#c9a96e" }}>{milestone?.label}</strong> on Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> confirmed.</>
//               : <>Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> booking confirmed. A receipt will be sent to {user?.email}.</>
//             }
//           </div>
//           <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "12px 16px", margin: "16px 0", fontSize: "13px", color: "#888" }}>
//             {[
//               ["Booking ID", `#${bookingId}`],
//               ["Unit", booking?.plot_number],
//               ...(isMilestonePayment ? [["Milestone", milestone?.label]] : []),
//               ["Amount Paid", fmtAmt(downPayment)],
//               ...(isMilestonePayment && milestone?.tax_amount > 0
//                 ? [[`${milestone.tax_label || "Tax"} included`, fmtAmt(milestone.tax_amount)]]
//                 : feeBreakdown?.tax_amount > 0
//                   ? [[`${feeBreakdown.tax_label || "Tax"} included`, fmtAmt(isInstalment ? feeBreakdown.tax_amount * (firstMsPct / 100) : feeBreakdown.tax_amount)]]
//                   : []
//               ),
//             ].map(([k, v]) => (
//               <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//                 <span>{k}</span>
//                 <span style={{ color: k === "Amount Paid" ? "#c9a96e" : "#ccc", fontWeight: k === "Amount Paid" ? "700" : "400" }}>{v}</span>
//               </div>
//             ))}
//           </div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div style={S.page}>
//       <div style={S.card}>

//         {/* ── Header ── */}
//         <div style={S.title}>{isMilestonePayment ? "Milestone Payment" : "Complete Your Booking"}</div>
//         <div style={S.sub}>
//           {isMilestonePayment
//             ? `${milestone.label} · Booking #${bookingId} · Unit ${booking?.plot_number}`
//             : `Booking #${bookingId} · ${booking?.plot_type} — Unit ${booking?.plot_number}`}
//         </div>

//         {/* ── Booking summary rows ── */}
//         <div>
//           {[
//             ["Project",   booking?.project_name || booking?.project?.name || "—"],
//             ["Floor",     booking?.block_name   || booking?.block?.name   || booking?.block || "—"],
//             ["Area",      booking?.area ? `${booking.area} sq.ft` : "—"],
//             ["Your Name", user?.name],
//             ["Email",     user?.email],
//           ].map(([k, v]) => (
//             <div key={k} style={S.row}>
//               <span style={S.label}>{k}</span>
//               <span>{v}</span>
//             </div>
//           ))}
//         </div>

//         {/* ── Milestone payment: detailed breakdown ── */}
//         {isMilestonePayment ? (
//           <div style={{ margin: "16px 0 0", padding: "14px 16px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "10px" }}>
//             <div style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
//               💳 Milestone Payment
//             </div>

//             {/* Base amount row */}
//             <BRow label={`${milestone.label} (base)`} value={fmtAmt(milestone.amount)} />

//             {/* Additional fees if any */}
//             {(milestone.extra_fees || 0) > 0 && (
//               <BRow label="Additional Fees" value={fmtAmt(milestone.extra_fees)} />
//             )}

//             {/* Tax row — prominent */}
//             {(milestone.tax_amount || 0) > 0 && (
//               <BRow
//                 label={`${milestone.tax_label || "Tax"}${milestone.tax_rate > 0 ? ` (${milestone.tax_rate}%)` : ""}`}
//                 value={fmtAmt(milestone.tax_amount)}
//                 accent="#f59e0b"
//                 borderTop
//               />
//             )}

//             {/* Grand total for this milestone */}
//             {((milestone.tax_amount || 0) > 0 || (milestone.extra_fees || 0) > 0) && (
//               <BRow
//                 label="Milestone Total"
//                 value={fmtAmt(milestone.total_with_tax ?? milestone.amount)}
//                 bold
//                 borderTop
//               />
//             )}

//             {milestone.due_date && (
//               <div style={{ fontSize: "11px", color: "#888", marginTop: "8px" }}>📅 Due: {milestone.due_date}</div>
//             )}
//           </div>
//         ) : plan ? (
//           <>
//             {/* ── Grand Total Breakdown (collapsible) ── */}
//             <div style={{ marginTop: "16px" }}>
//               <GrandTotalBreakdown breakdown={feeBreakdown} sym={currSym} />
//             </div>

//             {/* ── Full instalment schedule with per-row tax ── */}
//             <FullPaymentBreakdown plan={plan} unitPrice={unitPrice} feeBreakdown={feeBreakdown} sym={currSym} />

//             {/* ── First instalment segregated summary ── */}
//             {firstMilestone && (
//               <div style={{ marginTop: "16px", padding: "14px 16px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "10px" }}>
//                 <div style={{ fontSize: "11px", fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
//                   Due Now — {firstMilestone.label}{firstMsPct > 0 ? ` (${firstMsPct}%)` : ""}
//                 </div>
//                 <BRow label="Unit price portion" value={fmtAmt(firstMsBase)} />
//                 {firstMsFees > 0 && <BRow label="Fees (proportional)" value={fmtAmt(firstMsFees)} />}
//                 {firstMsTax > 0 && (
//                   <BRow
//                     label={`${feeBreakdown.tax_label || "Tax"} (${feeBreakdown.tax_rate || 0}%)`}
//                     value={fmtAmt(firstMsTax)}
//                     accent="#f59e0b"
//                     borderTop
//                   />
//                 )}
//                 {(firstMsTax > 0 || firstMsFees > 0) && (
//                   <BRow
//                     label="First instalment total"
//                     value={fmtAmt(feeBreakdown?.tax_enabled ? firstMsBase + firstMsTax + firstMsFees : firstMsBase)}
//                     bold
//                     borderTop
//                   />
//                 )}
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             {/* No plan — full payment with tax breakdown */}
//             <div style={{ marginTop: "16px" }}>
//               <GrandTotalBreakdown breakdown={feeBreakdown} sym={currSym} />
//             </div>
//             {!feeBreakdown && (
//               <div style={{ margin: "16px 0 0", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
//                 💰 Full Payment — no instalment plan
//               </div>
//             )}
//           </>
//         )}

//         {/* ── Amount due display ── */}
//         <div style={S.amount}>{fmtAmt(downPayment)}</div>
//         <div style={{ color: "#666", fontSize: "12px", marginBottom: "4px" }}>
//           {isMilestonePayment
//             ? `${milestone.label}${milestone.tax_amount > 0 ? " (base + tax)" : ""}`
//             : plan
//               ? `First payment — ${firstMilestone?.label || "Down Payment"}${feeBreakdown?.tax_enabled ? " (incl. taxes & fees)" : ""}`
//               : `Total amount due${feeBreakdown?.tax_enabled ? " (incl. all taxes & fees)" : ""}`
//           }
//         </div>

//         {/* Tax summary line under amount */}
//         {!isMilestonePayment && feeBreakdown?.tax_amount > 0 && (
//           <div style={{ color: "#f59e0b", fontSize: "12px", marginBottom: "6px" }}>
//             ✓ Includes {feeBreakdown.tax_label || "Tax"}: {fmtAmt(
//               isInstalment ? firstMsTax : feeBreakdown.tax_amount
//             )}
//             {feeBreakdown.tax_rate > 0 && ` (${feeBreakdown.tax_rate}%${feeBreakdown.tax_system ? ` · ${feeBreakdown.tax_system.toUpperCase()}` : ""})`}
//           </div>
//         )}

//         {/* Remaining in future instalments */}
//         {isInstalment && (
//           <div style={{ color: "#555", fontSize: "12px", marginBottom: "20px" }}>
//             Grand Total: {fmtAmt(booking.total_amount)} · Remaining: {fmtAmt(booking.total_amount - downPayment)} in future instalments
//           </div>
//         )}

//         {!gateway && (
//           <div style={{ color: "#ff6b6b", fontSize: "13px", margin: "16px 0", padding: "10px", background: "rgba(255,107,107,0.06)", borderRadius: "8px" }}>
//             ⚠ No payment gateway configured. Please contact admin.
//           </div>
//         )}

//         {error && <div style={S.err}>⚠ {error}</div>}

//         <button
//           style={{ ...S.btn, marginTop: "20px", ...(paying || !gateway || milestone?.status === "paid" ? S.btnDis : {}) }}
//           onClick={handlePay}
//           disabled={paying || !gateway || milestone?.status === "paid"}
//         >
//           {paying ? "Processing…" : providerLabel}
//         </button>

//         <button
//           style={{ ...S.backBtn, marginTop: "14px", display: "block", width: "100%", textAlign: "center" }}
//           onClick={() => navigate(-1)}
//         >
//           ← Cancel &amp; Go Back
//         </button>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { useParams, useNavigate, useSearchParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";

// import { apiUrl, imgUrl } from "../apiUrl";

// const API_BASE = `${apiUrl}/api`;

// const fmt = (n, sym = "₹") => {
//   if (n == null || n === "") return "—";
//   return sym + parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// function loadRazorpay() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const s = document.createElement("script");
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });
// }

// function loadStripe(publishableKey) {
//   return new Promise((resolve) => {
//     if (window.Stripe) return resolve(window.Stripe(publishableKey));
//     const s = document.createElement("script");
//     s.src = "https://js.stripe.com/v3/";
//     s.onload = () => resolve(window.Stripe(publishableKey));
//     s.onerror = () => resolve(null);
//     document.body.appendChild(s);
//   });
// }

// // ── Shared row component ───────────────────────────────────────────────────────
// const BRow = ({ label, value, accent, bold, borderTop, sub }) => (
//   <div style={{
//     display: "flex", justifyContent: "space-between", alignItems: "flex-start",
//     padding: borderTop ? "8px 0 4px" : "4px 0",
//     borderTop: borderTop ? "1px solid rgba(255,255,255,0.07)" : "none",
//     marginTop: borderTop ? "4px" : 0,
//   }}>
//     <span style={{ fontSize: sub ? "11px" : "13px", color: accent || (bold ? "#c9a96e" : "#888"), fontWeight: bold ? "700" : "400", lineHeight: 1.4 }}>
//       {label}
//     </span>
//     <span style={{ fontSize: sub ? "11px" : "13px", color: accent || (bold ? "#c9a96e" : "#ccc"), fontWeight: bold ? "800" : "400", textAlign: "right", marginLeft: "12px" }}>
//       {value}
//     </span>
//   </div>
// );

// // ── GrandTotalBreakdown: detailed card with all fees + tax ─────────────────────
// function GrandTotalBreakdown({ breakdown, sym = "₹" }) {
//   const [expanded, setExpanded] = useState(false);
//   if (!breakdown) return null;

//   const f = (n) => fmt(n, sym);
//   const labels = breakdown.fee_labels || {};

//   const extraFees = [
//     breakdown.processing_fee    > 0 && { label: labels.processing   || "Processing Fee",   val: breakdown.processing_fee    },
//     breakdown.stamp_duty        > 0 && { label: labels.stamp_duty   || "Stamp Duty",       val: breakdown.stamp_duty         },
//     breakdown.registration_fee  > 0 && { label: labels.registration || "Registration Fee", val: breakdown.registration_fee   },
//     breakdown.maintenance_charge> 0 && { label: labels.maintenance  || "Maintenance",      val: breakdown.maintenance_charge  },
//     breakdown.custom_fee1       > 0 && { label: labels.custom1      || "Custom Fee 1",     val: breakdown.custom_fee1        },
//     breakdown.custom_fee2       > 0 && { label: labels.custom2      || "Custom Fee 2",     val: breakdown.custom_fee2        },
//   ].filter(Boolean);

//   const hasCharges = extraFees.length > 0 || breakdown.tax_amount > 0;
//   if (!hasCharges) return null;

//   return (
//     <div style={{
//       background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)",
//       borderRadius: "10px", overflow: "hidden", marginBottom: "16px",
//     }}>
//       {/* Header toggle */}
//       <button
//         type="button"
//         onClick={() => setExpanded((e) => !e)}
//         style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
//       >
//         <span style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//           📄 Grand Total Breakdown
//         </span>
//         <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{expanded ? "▲ Hide" : "▼ Show"}</span>
//       </button>

//       {expanded && (
//         <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px" }}>
//           <BRow label="Unit Price" value={f(breakdown.unit_price)} />
//           {extraFees.map((fee, i) => <BRow key={i} label={fee.label} value={f(fee.val)} />)}
//           {breakdown.tax_amount > 0 && (
//             <BRow
//               label={`${breakdown.tax_label || "Tax"} (${breakdown.tax_rate || 0}%${breakdown.tax_system ? ` · ${breakdown.tax_system.toUpperCase()}` : ""}${breakdown.tax_inclusive ? " · Incl." : ""})`}
//               value={f(breakdown.tax_amount)}
//               accent="#f59e0b"
//               borderTop
//             />
//           )}
//           <BRow label="Grand Total" value={f(breakdown.total_amount)} bold borderTop />
//         </div>
//       )}

//       {/* Collapsed summary line */}
//       {!expanded && (
//         <div style={{ padding: "0 16px 12px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
//           <span style={{ color: "#888" }}>
//             Unit {f(breakdown.unit_price)}
//             {breakdown.tax_amount > 0 && <span style={{ color: "#f59e0b", marginLeft: "6px" }}>+ {breakdown.tax_label || "Tax"} {f(breakdown.tax_amount)}</span>}
//             {extraFees.length > 0 && <span style={{ color: "#6b7f95", marginLeft: "6px" }}>+ {extraFees.length} fee{extraFees.length > 1 ? "s" : ""}</span>}
//           </span>
//           <span style={{ color: "#c9a96e", fontWeight: "800" }}>{f(breakdown.total_amount)}</span>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── MilestoneBreakdown: per-milestone tax/fee card ─────────────────────────────
// function MilestoneBreakdown({ milestone, sym = "₹" }) {
//   const f = (n) => fmt(n, sym);
//   const hasTax   = (milestone.tax_amount   || 0) > 0;
//   const hasFees  = (milestone.extra_fees   || 0) > 0;
//   if (!hasTax && !hasFees) return null;

//   return (
//     <div style={{
//       background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
//       borderRadius: "8px", padding: "10px 14px", marginTop: "10px",
//     }}>
//       <div style={{ fontSize: "10px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
//         Charges for this milestone
//       </div>
//       <BRow label="Base amount" value={f(milestone.amount)} />
//       {hasFees && <BRow label="Additional Fees" value={f(milestone.extra_fees)} />}
//       {hasTax && (
//         <BRow
//           label={`${milestone.tax_label || "Tax"}${milestone.tax_rate > 0 ? ` (${milestone.tax_rate}%)` : ""}`}
//           value={f(milestone.tax_amount)}
//           accent="#f59e0b"
//           borderTop
//         />
//       )}
//       <BRow
//         label="Milestone total"
//         value={f(milestone.total_with_tax ?? milestone.amount)}
//         bold
//         borderTop
//       />
//     </div>
//   );
// }

// // ── FullPaymentBreakdown: shows all milestones with per-row tax segregation ────
// function FullPaymentBreakdown({ plan, unitPrice, feeBreakdown, sym = "₹" }) {
//   if (!plan?.milestones?.length) return null;
//   const f = (n) => fmt(n, sym);
//   const basePrice = parseFloat(String(unitPrice || "0").replace(/[^0-9.]/g, "")) || 0;
//   const grandTotal = feeBreakdown?.total_amount || basePrice;

//   return (
//     <div style={{
//       background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
//       borderRadius: "10px", overflow: "hidden", marginTop: "16px",
//     }}>
//       <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(201,169,110,0.05)" }}>
//         <div style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//           💳 {plan.name} — Schedule
//         </div>
//         {feeBreakdown?.tax_enabled && (
//           <div style={{ fontSize: "11px", color: "#6b7f95", marginTop: "3px" }}>
//             Grand Total: {f(grandTotal)} · Each instalment includes proportional taxes &amp; fees
//           </div>
//         )}
//       </div>
//       {plan.milestones.map((m, i) => {
//         const isFirst = i === 0;
//         const pct = parseFloat(m.percentage) || 0;
//         const baseAmt = m.calculated_amount
//           || (pct > 0 && basePrice > 0 ? Math.round(basePrice * pct / 100) : null)
//           || m.fixed_amount || 0;
//         // Compute proportional tax from grand total breakdown
//         const propTax   = feeBreakdown?.tax_amount  ? feeBreakdown.tax_amount  * (pct / 100) : 0;
//         const propFees  = feeBreakdown ? (
//           (feeBreakdown.processing_fee     || 0) +
//           (feeBreakdown.stamp_duty         || 0) +
//           (feeBreakdown.registration_fee   || 0) +
//           (feeBreakdown.maintenance_charge || 0) +
//           (feeBreakdown.custom_fee1        || 0) +
//           (feeBreakdown.custom_fee2        || 0)
//         ) * (pct / 100) : 0;
//         const propTotal = baseAmt + propTax + propFees;

//         return (
//           <div key={i} style={{
//             padding: "12px 16px",
//             borderBottom: i < plan.milestones.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
//             background: isFirst ? "rgba(201,169,110,0.06)" : "transparent",
//           }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
//               <div style={{ flex: 1 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                   {isFirst && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "12px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontWeight: "700" }}>Due Now</span>}
//                   <span style={{ fontSize: "13px", fontWeight: isFirst ? "700" : "500", color: isFirst ? "#d8e6f0" : "rgba(255,255,255,0.5)" }}>{m.label}</span>
//                   {pct > 0 && <span style={{ fontSize: "11px", color: "#6b7f95" }}>({pct}%)</span>}
//                 </div>
//                 {m.due_date && <div style={{ fontSize: "11px", color: "#5a7a9a", marginTop: "4px" }}>📅 Due: {m.due_date}</div>}
//                 {m.due_after_days && !m.due_date && <div style={{ fontSize: "11px", color: "#5a7a9a", marginTop: "4px" }}>📅 Due: {m.due_after_days} days after booking</div>}
//               </div>
//               <div style={{ textAlign: "right", flexShrink: 0 }}>
//                 {/* Base amount (unit price portion) */}
//                 <div style={{ fontSize: "11px", color: "#6b7f95" }}>
//                   Base: {f(baseAmt)}
//                 </div>
//                 {/* Proportional tax */}
//                 {propTax > 0 && (
//                   <div style={{ fontSize: "11px", color: "#f59e0b" }}>
//                     {feeBreakdown.tax_label || "Tax"}: {f(propTax)}
//                   </div>
//                 )}
//                 {/* Proportional fees */}
//                 {propFees > 0 && (
//                   <div style={{ fontSize: "11px", color: "#6b7f95" }}>
//                     Fees: {f(propFees)}
//                   </div>
//                 )}
//                 {/* Instalment total */}
//                 <div style={{ fontSize: isFirst ? "16px" : "13px", fontWeight: "800", color: isFirst ? "#c9a96e" : "rgba(255,255,255,0.5)", marginTop: "3px" }}>
//                   {f(feeBreakdown?.tax_enabled ? propTotal : baseAmt)}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default function PaymentPage() {
//   const { bookingId }  = useParams();
//   const navigate       = useNavigate();
//   const user           = useSelector(selectUser);
//   const [searchParams] = useSearchParams();

//   const [booking,       setBooking]       = useState(null);
//   const [gateway,       setGateway]       = useState(null);
//   const [loading,       setLoading]       = useState(true);
//   const [paying,        setPaying]        = useState(false);
//   const [error,         setError]         = useState("");
//   const [success,       setSuccess]       = useState(false);
//   const [milestone,     setMilestone]     = useState(null);
//   const [milestoneLoad, setMilestoneLoad] = useState(false);

//   const milestoneId        = new URLSearchParams(window.location.search).get("milestone");
//   const isMilestonePayment = !!milestoneId && !!milestone;

  


//   useEffect(() => { if (!user?.token) navigate("/"); }, [user]);

//   useEffect(() => {
//     if (!user?.token || !bookingId) return;
//     (async () => {
//       try {
//         const [bRes, gRes] = await Promise.all([
//           fetch(`${API_BASE}/bookings/${bookingId}`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//           fetch(`${API_BASE}/payment/config`, {
//             headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           }),
//         ]);

//         if (!bRes.ok) throw new Error("Booking not found.");
//         if (!gRes.ok) throw new Error("Payment gateway not configured.");

//         const bData = await bRes.json();
//         const gData = await gRes.json();

//         setBooking(bData.booking);
//         setGateway(gData);

//         if (bData.booking?.booking_status === "confirmed" && !milestoneId) {
//           setSuccess(true);
//         }

//         if (milestoneId) {          
//           setMilestoneLoad(true);
//           try {
//             const mRes = await fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
//               headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//             });
//             if (mRes.ok) {
//               const mData = await mRes.json();
//               const found = (mData.milestones || []).find((m) => String(m.id) === String(milestoneId));
//               if (!found) throw new Error("Milestone not found.");
//               if (found.status === "paid") setError("This milestone has already been paid.");
//               setMilestone(found);
//             }
//           } catch (mErr) {
//             setError(mErr.message || "Failed to load milestone.");
//           } finally {
//             setMilestoneLoad(false);
//           }
//         }
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [bookingId, user]);

//   // ── Derived values ─────────────────────────────────────────────────────────
//   const feeBreakdown = booking?.fee_breakdown || null;
//   const currSym      = feeBreakdown?.currency_symbol || "₹";
//   const fmtAmt       = (n) => fmt(n, currSym);

//   const plan           = booking?.payment_plan;
//   const firstMilestone = plan?.milestones?.[0];
//   const unitPrice      = parseFloat(booking?.price || 0);

//   const downPayment = isMilestonePayment
//     ? (milestone.total_with_tax ?? milestone.amount)
//     : booking?.down_payment_amount
//       || booking?.total_amount
//       || unitPrice;

//   const isInstalment = !isMilestonePayment && plan
//     && booking?.down_payment_amount
//     && booking?.total_amount
//     && booking.down_payment_amount < booking.total_amount;

//   // First milestone amounts computed from fee_breakdown proportionally
//   const firstMsPct  = firstMilestone ? parseFloat(firstMilestone.percentage) || 0 : 100;
//   const firstMsBase = feeBreakdown ? (feeBreakdown.unit_price || unitPrice) * (firstMsPct / 100) : unitPrice;
//   const firstMsTax  = feeBreakdown?.tax_amount  ? feeBreakdown.tax_amount  * (firstMsPct / 100) : 0;
//   const firstMsFees = feeBreakdown ? (
//     (feeBreakdown.processing_fee     || 0) +
//     (feeBreakdown.stamp_duty         || 0) +
//     (feeBreakdown.registration_fee   || 0) +
//     (feeBreakdown.maintenance_charge || 0) +
//     (feeBreakdown.custom_fee1        || 0) +
//     (feeBreakdown.custom_fee2        || 0)
//   ) * (firstMsPct / 100) : 0;

//   // ── Payment handlers ───────────────────────────────────────────────────────
//   const payWithRazorpay = async () => {
//     setPaying(true); setError("");
//     const ok = await loadRazorpay();
//     if (!ok) { setError("Razorpay failed to load."); setPaying(false); return; }
//     const res = await fetch(`${API_BASE}/payment/razorpay/create-order`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Order creation failed."); setPaying(false); return; }
//     const options = {
//       key: gateway.key, amount: data.amount, currency: data.currency || "INR",
//       name: data.app_name || "Property Booking",
//       description: isMilestonePayment
//         ? `${milestone.label} · Unit ${booking?.plot_number}`
//         : `Unit ${booking?.plot_number} — Booking #${bookingId}`,
//       order_id: data.order_id,
//       prefill: { name: user.name, email: user.email, contact: (user.country_code || "+91") + (user.phone || "") },
//       theme: { color: "#c9a96e" },
//       handler: async (response) => {
//         const vRes = await fetch(`${API_BASE}/payment/razorpay/verify`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//           body: JSON.stringify({ ...response, booking_id: bookingId, milestone_id: milestoneId || undefined }),
//         });
//         const vData = await vRes.json();
//         if (vRes.ok) { setSuccess(true); setPaying(false); }
//         else { setError(vData.message || "Verification failed."); setPaying(false); }
//       },
//       modal: { ondismiss: () => setPaying(false) },
//     };
//     new window.Razorpay(options).open();
//   };

//   const payWithStripe = async () => {
//     setPaying(true); setError("");
//     const stripe = await loadStripe(gateway.key);
//     if (!stripe) { setError("Stripe failed to load."); setPaying(false); return; }
//     const res = await fetch(`${API_BASE}/payment/stripe/checkout`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "Session creation failed."); setPaying(false); return; }
//     const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.session_id });
//     if (stripeError) { setError(stripeError.message); setPaying(false); }
//   };

//   const payWithPhonePe = async () => {
//     setPaying(true); setError("");
//     const res = await fetch(`${API_BASE}/payment/phonepe/initiate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
//       body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
//     });
//     const data = await res.json();
//     if (!res.ok) { setError(data.message || "PhonePe initiation failed."); setPaying(false); return; }
//     window.location.href = data.redirect_url;
//   };

//   const handlePay = () => {
//     if (!gateway) return;
//     const p = gateway.provider?.toLowerCase();
//     if      (p === "razorpay") payWithRazorpay();
//     else if (p === "stripe")   payWithStripe();
//     else if (p === "phonepe")  payWithPhonePe();
//     else setError(`Unknown payment provider: ${gateway.provider}`);
//   };

//   const providerLabel = gateway?.provider
//     ? { razorpay: "Pay with Razorpay", stripe: "Pay with Stripe", phonepe: "Pay with PhonePe" }[gateway.provider.toLowerCase()] || "Proceed to Pay"
//     : "Proceed to Pay";

//   // ── Styles ─────────────────────────────────────────────────────────────────
//   const S = {
//     page:    { minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "24px" },
//     card:    { background: "#161628", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "16px", padding: "36px", maxWidth: "520px", width: "100%" },
//     title:   { color: "#c9a96e", fontSize: "22px", fontWeight: "700", marginBottom: "6px" },
//     sub:     { color: "#888", fontSize: "13px", marginBottom: "24px" },
//     row:     { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#ccc", fontSize: "14px" },
//     label:   { color: "#888" },
//     amount:  { color: "#c9a96e", fontSize: "34px", fontWeight: "800", margin: "20px 0 2px" },
//     amtLabel:{ color: "#666", fontSize: "12px", marginBottom: "4px" },
//     btn:     { width: "100%", padding: "16px", background: "linear-gradient(135deg,#c9a96e,#a07840)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px" },
//     btnDis:  { opacity: 0.6, cursor: "not-allowed" },
//     err:     { color: "#ff6b6b", fontSize: "13px", marginTop: "12px", padding: "10px", background: "rgba(255,107,107,0.08)", borderRadius: "8px" },
//     success: { textAlign: "center", padding: "20px 0" },
//     tick:    { fontSize: "56px", marginBottom: "12px" },
//     sTitle:  { color: "#4caf50", fontSize: "20px", fontWeight: "700", marginBottom: "8px" },
//     sSub:    { color: "#888", fontSize: "14px", marginBottom: "24px" },
//     backBtn: { background: "transparent", border: "1px solid rgba(201,169,110,0.4)", color: "#c9a96e", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
//   };

//   if (loading || milestoneLoad) return (
//     <div style={S.page}><div style={{ color: "#c9a96e", fontSize: "16px" }}>Loading payment details…</div></div>
//   );

//   if (error && !booking) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={{ color: "#ff6b6b", fontSize: "16px", marginBottom: "16px" }}>⚠ {error}</div>
//         <button style={S.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
//       </div>
//     </div>
//   );

//   if (milestoneId && milestone?.status === "paid") return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Already Paid</div>
//           <div style={S.sSub}>{milestone.label} for Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> has already been paid.</div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   if (success) return (
//     <div style={S.page}>
//       <div style={S.card}>
//         <div style={S.success}>
//           <div style={S.tick}>✅</div>
//           <div style={S.sTitle}>Payment Successful!</div>
//           <div style={S.sSub}>
//             {isMilestonePayment
//               ? <>Payment for <strong style={{ color: "#c9a96e" }}>{milestone?.label}</strong> on Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> confirmed.</>
//               : <>Unit <strong style={{ color: "#c9a96e" }}>{booking?.plot_number}</strong> booking confirmed. A receipt will be sent to {user?.email}.</>
//             }
//           </div>
//           <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "12px 16px", margin: "16px 0", fontSize: "13px", color: "#888" }}>
//             {[
//               ["Booking ID", `#${bookingId}`],
//               ["Unit", booking?.plot_number],
//               ...(isMilestonePayment ? [["Milestone", milestone?.label]] : []),
//               ["Amount Paid", fmtAmt(downPayment)],
//               ...(isMilestonePayment && milestone?.tax_amount > 0
//                 ? [[`${milestone.tax_label || "Tax"} included`, fmtAmt(milestone.tax_amount)]]
//                 : feeBreakdown?.tax_amount > 0
//                   ? [[`${feeBreakdown.tax_label || "Tax"} included`, fmtAmt(isInstalment ? feeBreakdown.tax_amount * (firstMsPct / 100) : feeBreakdown.tax_amount)]]
//                   : []
//               ),
//             ].map(([k, v]) => (
//               <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//                 <span>{k}</span>
//                 <span style={{ color: k === "Amount Paid" ? "#c9a96e" : "#ccc", fontWeight: k === "Amount Paid" ? "700" : "400" }}>{v}</span>
//               </div>
//             ))}
//           </div>
//           <button style={S.backBtn} onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div style={S.page}>
//       <div style={S.card}>

//         {/* ── Header ── */}
//         <div style={S.title}>{isMilestonePayment ? "Milestone Payment" : "Complete Your Booking"}</div>
//         <div style={S.sub}>
//           {isMilestonePayment
//             ? `${milestone.label} · Booking #${bookingId} · Unit ${booking?.plot_number}`
//             : `Booking #${bookingId} · ${booking?.plot_type} — Unit ${booking?.plot_number}`}
//         </div>

//         {/* ── Booking summary rows ── */}
//         <div>
//           {[
//             ["Project",   booking?.project_name || booking?.project?.name || "—"],
//             ["Floor",     booking?.block_name   || booking?.block?.name   || booking?.block || "—"],
//             ["Area",      booking?.area ? `${booking.area} sq.ft` : "—"],
//             ["Your Name", user?.name],
//             ["Email",     user?.email],
//           ].map(([k, v]) => (
//             <div key={k} style={S.row}>
//               <span style={S.label}>{k}</span>
//               <span>{v}</span>
//             </div>
//           ))}
//         </div>

//         {/* ── Milestone payment: detailed breakdown ── */}
//         {isMilestonePayment ? (
//           <div style={{ margin: "16px 0 0", padding: "14px 16px", background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "10px" }}>
//             <div style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
//               💳 Milestone Payment
//             </div>

//             {/* Base amount row */}
//             <BRow label={`${milestone.label} (base)`} value={fmtAmt(milestone.amount)} />

//             {/* Additional fees if any */}
//             {(milestone.extra_fees || 0) > 0 && (
//               <BRow label="Additional Fees" value={fmtAmt(milestone.extra_fees)} />
//             )}

//             {/* Tax row — prominent */}
//             {(milestone.tax_amount || 0) > 0 && (
//               <BRow
//                 label={`${milestone.tax_label || "Tax"}${milestone.tax_rate > 0 ? ` (${milestone.tax_rate}%)` : ""}`}
//                 value={fmtAmt(milestone.tax_amount)}
//                 accent="#f59e0b"
//                 borderTop
//               />
//             )}

//             {/* Grand total for this milestone */}
//             {((milestone.tax_amount || 0) > 0 || (milestone.extra_fees || 0) > 0) && (
//               <BRow
//                 label="Milestone Total"
//                 value={fmtAmt(milestone.total_with_tax ?? milestone.amount)}
//                 bold
//                 borderTop
//               />
//             )}

//             {milestone.due_date && (
//               <div style={{ fontSize: "11px", color: "#888", marginTop: "8px" }}>📅 Due: {milestone.due_date}</div>
//             )}
//           </div>
//         ) : plan ? (
//           <>
//             {/* ── Grand Total Breakdown (collapsible) ── */}
//             <div style={{ marginTop: "16px" }}>
//               <GrandTotalBreakdown breakdown={feeBreakdown} sym={currSym} />
//             </div>

//             {/* ── Full instalment schedule with per-row tax ── */}
//             <FullPaymentBreakdown plan={plan} unitPrice={unitPrice} feeBreakdown={feeBreakdown} sym={currSym} />

//             {/* ── First instalment segregated summary ── */}
//             {firstMilestone && (
//               <div style={{ marginTop: "16px", padding: "14px 16px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "10px" }}>
//                 <div style={{ fontSize: "11px", fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
//                   Due Now — {firstMilestone.label}{firstMsPct > 0 ? ` (${firstMsPct}%)` : ""}
//                 </div>
//                 <BRow label="Unit price portion" value={fmtAmt(firstMsBase)} />
//                 {firstMsFees > 0 && <BRow label="Fees (proportional)" value={fmtAmt(firstMsFees)} />}
//                 {firstMsTax > 0 && (
//                   <BRow
//                     label={`${feeBreakdown.tax_label || "Tax"} (${feeBreakdown.tax_rate || 0}%)`}
//                     value={fmtAmt(firstMsTax)}
//                     accent="#f59e0b"
//                     borderTop
//                   />
//                 )}
//                 {(firstMsTax > 0 || firstMsFees > 0) && (
//                   <BRow
//                     label="First instalment total"
//                     value={fmtAmt(feeBreakdown?.tax_enabled ? firstMsBase + firstMsTax + firstMsFees : firstMsBase)}
//                     bold
//                     borderTop
//                   />
//                 )}
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             {/* No plan — full payment with tax breakdown */}
//             <div style={{ marginTop: "16px" }}>
//               <GrandTotalBreakdown breakdown={feeBreakdown} sym={currSym} />
//             </div>
//             {!feeBreakdown && (
//               <div style={{ margin: "16px 0 0", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
//                 💰 Full Payment — no instalment plan
//               </div>
//             )}
//           </>
//         )}

//         {/* ── Amount due display ── */}
//         <div style={S.amount}>{fmtAmt(downPayment)}</div>
//         <div style={{ color: "#666", fontSize: "12px", marginBottom: "4px" }}>
//           {isMilestonePayment
//             ? `${milestone.label}${milestone.tax_amount > 0 ? " (base + tax)" : ""}`
//             : plan
//               ? `First payment — ${firstMilestone?.label || "Down Payment"}${feeBreakdown?.tax_enabled ? " (incl. taxes & fees)" : ""}`
//               : `Total amount due${feeBreakdown?.tax_enabled ? " (incl. all taxes & fees)" : ""}`
//           }
//         </div>

//         {/* Tax summary line under amount */}
//         {!isMilestonePayment && feeBreakdown?.tax_amount > 0 && (
//           <div style={{ color: "#f59e0b", fontSize: "12px", marginBottom: "6px" }}>
//             ✓ Includes {feeBreakdown.tax_label || "Tax"}: {fmtAmt(
//               isInstalment ? firstMsTax : feeBreakdown.tax_amount
//             )}
//             {feeBreakdown.tax_rate > 0 && ` (${feeBreakdown.tax_rate}%${feeBreakdown.tax_system ? ` · ${feeBreakdown.tax_system.toUpperCase()}` : ""})`}
//           </div>
//         )}

//         {/* Remaining in future instalments */}
//         {isInstalment && (
//           <div style={{ color: "#555", fontSize: "12px", marginBottom: "20px" }}>
//             Grand Total: {fmtAmt(booking.total_amount)} · Remaining: {fmtAmt(booking.total_amount - downPayment)} in future instalments
//           </div>
//         )}

//         {!gateway && (
//           <div style={{ color: "#ff6b6b", fontSize: "13px", margin: "16px 0", padding: "10px", background: "rgba(255,107,107,0.06)", borderRadius: "8px" }}>
//             ⚠ No payment gateway configured. Please contact admin.
//           </div>
//         )}

//         {error && <div style={S.err}>⚠ {error}</div>}

//         <button
//           style={{ ...S.btn, marginTop: "20px", ...(paying || !gateway || milestone?.status === "paid" ? S.btnDis : {}) }}
//           onClick={handlePay}
//           disabled={paying || !gateway || milestone?.status === "paid"}
//         >
//           {paying ? "Processing…" : providerLabel}
//         </button>

//         <button
//           style={{ ...S.backBtn, marginTop: "14px", display: "block", width: "100%", textAlign: "center" }}
//           onClick={() => navigate(-1)}
//         >
//           ← Cancel &amp; Go Back
//         </button>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import { apiUrl } from "../apiUrl";
import "../styles/PaymentPage.css";

const API_BASE = `${apiUrl}/api`;

const fmt = (n, sym = "₹") => {
  if (n == null || n === "") return "—";
  return sym + parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function loadStripe(publishableKey) {
  return new Promise((resolve) => {
    if (window.Stripe) return resolve(window.Stripe(publishableKey));
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.onload = () => resolve(window.Stripe(publishableKey));
    s.onerror = () => resolve(null);
    document.body.appendChild(s);
  });
}

// Elegant Row Component
const ElegantRow = ({ label, value, accent, bold, borderTop, sub }) => {
  const rowClass = `payment-row ${borderTop ? 'payment-row-border-top' : ''}`;
  const labelClass = `payment-row-label ${sub ? 'payment-row-label-sub' : ''}`;
  const valueClass = `payment-row-value ${sub ? 'payment-row-value-sub' : ''}`;
  
  return (
    <div className={rowClass}>
      <span className={labelClass} style={{ color: accent || (bold ? 'var(--primary-color)' : 'var(--text-muted)'), fontWeight: bold ? '700' : '400' }}>
        {label}
      </span>
      <span className={valueClass} style={{ color: accent || (bold ? 'var(--primary-color)' : 'var(--text-dark)'), fontWeight: bold ? '800' : '400' }}>
        {value}
      </span>
    </div>
  );
};

// GrandTotalBreakdown Component
const GrandTotalBreakdown = ({ breakdown, sym = "₹" }) => {
  const [expanded, setExpanded] = useState(false);
  if (!breakdown) return null;

  const f = (n) => fmt(n, sym);
  const labels = breakdown.fee_labels || {};

  const extraFees = [
    breakdown.processing_fee > 0 && { label: labels.processing || "Processing Fee", val: breakdown.processing_fee },
    breakdown.stamp_duty > 0 && { label: labels.stamp_duty || "Stamp Duty", val: breakdown.stamp_duty },
    breakdown.registration_fee > 0 && { label: labels.registration || "Registration Fee", val: breakdown.registration_fee },
    breakdown.maintenance_charge > 0 && { label: labels.maintenance || "Maintenance", val: breakdown.maintenance_charge },
    breakdown.custom_fee1 > 0 && { label: labels.custom1 || "Custom Fee 1", val: breakdown.custom_fee1 },
    breakdown.custom_fee2 > 0 && { label: labels.custom2 || "Custom Fee 2", val: breakdown.custom_fee2 },
  ].filter(Boolean);

  const hasCharges = extraFees.length > 0 || breakdown.tax_amount > 0;
  if (!hasCharges) return null;

  return (
    <div className="payment-breakdown-card">
      <button type="button" className="payment-breakdown-header" onClick={() => setExpanded(e => !e)}>
        <span className="payment-breakdown-title">📄 Grand Total Breakdown</span>
        <span className="payment-breakdown-toggle">{expanded ? "▲ Hide" : "▼ Show"}</span>
      </button>

      {expanded && (
        <div className="payment-breakdown-content">
          <ElegantRow label="Unit Price" value={f(breakdown.unit_price)} />
          {extraFees.map((fee, i) => <ElegantRow key={i} label={fee.label} value={f(fee.val)} />)}
          {breakdown.tax_amount > 0 && (
            <ElegantRow
              label={`${breakdown.tax_label || "Tax"} (${breakdown.tax_rate || 0}%${breakdown.tax_system ? ` · ${breakdown.tax_system.toUpperCase()}` : ""}${breakdown.tax_inclusive ? " · Incl." : ""})`}
              value={f(breakdown.tax_amount)}
              accent="#f59e0b"
              borderTop
            />
          )}
          <ElegantRow label="Grand Total" value={f(breakdown.total_amount)} bold borderTop />
        </div>
      )}

      {!expanded && (
        <div className="payment-breakdown-summary">
          <span className="payment-breakdown-summary-text">
            Unit {f(breakdown.unit_price)}
            {breakdown.tax_amount > 0 && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>+ {breakdown.tax_label || "Tax"} {f(breakdown.tax_amount)}</span>}
            {extraFees.length > 0 && <span style={{ marginLeft: "8px" }}>+ {extraFees.length} fee{extraFees.length > 1 ? "s" : ""}</span>}
          </span>
          <span className="payment-breakdown-summary-highlight">{f(breakdown.total_amount)}</span>
        </div>
      )}
    </div>
  );
};

// FullPaymentBreakdown Component
const FullPaymentBreakdown = ({ plan, unitPrice, feeBreakdown, sym = "₹" }) => {
  if (!plan?.milestones?.length) return null;
  const f = (n) => fmt(n, sym);
  const basePrice = parseFloat(String(unitPrice || "0").replace(/[^0-9.]/g, "")) || 0;
  const grandTotal = feeBreakdown?.total_amount || basePrice;

  return (
    <div className="payment-full-breakdown">
      <div className="payment-full-header">
        <div className="payment-full-title">💳 {plan.name} — Schedule</div>
        {feeBreakdown?.tax_enabled && (
          <div className="payment-full-subtitle">Grand Total: {f(grandTotal)} · Each instalment includes proportional taxes &amp; fees</div>
        )}
      </div>
      {plan.milestones.map((m, i) => {
        const isFirst = i === 0;
        const pct = parseFloat(m.percentage) || 0;
        const baseAmt = m.calculated_amount
          || (pct > 0 && basePrice > 0 ? Math.round(basePrice * pct / 100) : null)
          || m.fixed_amount || 0;
        const propTax = feeBreakdown?.tax_amount ? feeBreakdown.tax_amount * (pct / 100) : 0;
        const propFees = feeBreakdown ? (
          (feeBreakdown.processing_fee || 0) +
          (feeBreakdown.stamp_duty || 0) +
          (feeBreakdown.registration_fee || 0) +
          (feeBreakdown.maintenance_charge || 0) +
          (feeBreakdown.custom_fee1 || 0) +
          (feeBreakdown.custom_fee2 || 0)
        ) * (pct / 100) : 0;
        const propTotal = baseAmt + propTax + propFees;

        return (
          <div key={i} className={`payment-milestone-item ${i < plan.milestones.length - 1 ? 'payment-milestone-item-border' : ''} ${isFirst ? 'payment-milestone-item-first' : ''}`}>
            <div className="payment-milestone-content">
              <div className="payment-milestone-info">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {isFirst && <span className="payment-milestone-badge">Due Now</span>}
                  <span className={`payment-milestone-label ${isFirst ? 'payment-milestone-label-bold' : ''}`}>{m.label}</span>
                  {pct > 0 && <span className="payment-milestone-percentage">({pct}%)</span>}
                </div>
                {m.due_date && (
                  <div className="payment-milestone-due">📅 Due: {m.due_date}</div>
                )}
                {m.due_after_days && !m.due_date && (
                  <div className="payment-milestone-due">📅 Due: {m.due_after_days} days after booking</div>
                )}
              </div>
              <div className="payment-milestone-amounts">
                <div className="payment-milestone-base">Base: {f(baseAmt)}</div>
                {propTax > 0 && <div className="payment-milestone-tax">{feeBreakdown.tax_label || "Tax"}: {f(propTax)}</div>}
                {propFees > 0 && <div className="payment-milestone-fees">Fees: {f(propFees)}</div>}
                <div className={`payment-milestone-total ${isFirst ? 'payment-milestone-total-large' : 'payment-milestone-total-muted'}`}>
                  {f(feeBreakdown?.tax_enabled ? propTotal : baseAmt)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Main PaymentPage Component
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [booking, setBooking] = useState(null);
  const [gateway, setGateway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [milestone, setMilestone] = useState(null);
  const [milestoneLoad, setMilestoneLoad] = useState(false);

  const milestoneId = new URLSearchParams(window.location.search).get("milestone");
  const isMilestonePayment = !!milestoneId && !!milestone;

  useEffect(() => { if (!user?.token) navigate("/"); }, [user]);

  useEffect(() => {
    if (!user?.token || !bookingId) return;
    (async () => {
      try {
        const [bRes, gRes] = await Promise.all([
          fetch(`${API_BASE}/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
          }),
          fetch(`${API_BASE}/payment/config`, {
            headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
          }),
        ]);

        if (!bRes.ok) throw new Error("Booking not found.");
        if (!gRes.ok) throw new Error("Payment gateway not configured.");

        const bData = await bRes.json();
        const gData = await gRes.json();

        setBooking(bData.booking);
        setGateway(gData);

        if (bData.booking?.booking_status === "confirmed" && !milestoneId) {
          setSuccess(true);
        }

        if (milestoneId) {
          setMilestoneLoad(true);
          try {
            const mRes = await fetch(`${API_BASE}/bookings/${bookingId}/milestones`, {
              headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" },
            });
            if (mRes.ok) {
              const mData = await mRes.json();
              const found = (mData.milestones || []).find((m) => String(m.id) === String(milestoneId));
              if (!found) throw new Error("Milestone not found.");
              if (found.status === "paid") setError("This milestone has already been paid.");
              setMilestone(found);
            }
          } catch (mErr) {
            setError(mErr.message || "Failed to load milestone.");
          } finally {
            setMilestoneLoad(false);
          }
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, user]);

  const feeBreakdown = booking?.fee_breakdown || null;
  const currSym = feeBreakdown?.currency_symbol || "₹";
  const fmtAmt = (n) => fmt(n, currSym);

  const plan = booking?.payment_plan;
  const firstMilestone = plan?.milestones?.[0];
  const unitPrice = parseFloat(booking?.price || 0);

  const downPayment = isMilestonePayment
    ? (milestone.total_with_tax ?? milestone.amount)
    : booking?.down_payment_amount || booking?.total_amount || unitPrice;

  const isInstalment = !isMilestonePayment && plan && booking?.down_payment_amount && booking?.total_amount && booking.down_payment_amount < booking.total_amount;

  const firstMsPct = firstMilestone ? parseFloat(firstMilestone.percentage) || 0 : 100;
  const firstMsBase = feeBreakdown ? (feeBreakdown.unit_price || unitPrice) * (firstMsPct / 100) : unitPrice;
  const firstMsTax = feeBreakdown?.tax_amount ? feeBreakdown.tax_amount * (firstMsPct / 100) : 0;
  const firstMsFees = feeBreakdown ? (
    (feeBreakdown.processing_fee || 0) + (feeBreakdown.stamp_duty || 0) +
    (feeBreakdown.registration_fee || 0) + (feeBreakdown.maintenance_charge || 0) +
    (feeBreakdown.custom_fee1 || 0) + (feeBreakdown.custom_fee2 || 0)
  ) * (firstMsPct / 100) : 0;

  const payWithRazorpay = async () => {
    setPaying(true); setError("");
    const ok = await loadRazorpay();
    if (!ok) { setError("Razorpay failed to load."); setPaying(false); return; }
    const res = await fetch(`${API_BASE}/payment/razorpay/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
      body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message || "Order creation failed."); setPaying(false); return; }
    const options = {
      key: gateway.key, amount: data.amount, currency: data.currency || "INR",
      name: data.app_name || "Property Booking",
      description: isMilestonePayment ? `${milestone.label} · Unit ${booking?.plot_number}` : `Unit ${booking?.plot_number} — Booking #${bookingId}`,
      order_id: data.order_id,
      prefill: { name: user.name, email: user.email, contact: (user.country_code || "+91") + (user.phone || "") },
      theme: { color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || "#c9a96e" },
      handler: async (response) => {
        const vRes = await fetch(`${API_BASE}/payment/razorpay/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
          body: JSON.stringify({ ...response, booking_id: bookingId, milestone_id: milestoneId || undefined }),
        });
        const vData = await vRes.json();
        if (vRes.ok) { setSuccess(true); setPaying(false); }
        else { setError(vData.message || "Verification failed."); setPaying(false); }
      },
      modal: { ondismiss: () => setPaying(false) },
    };
    new window.Razorpay(options).open();
  };

  const payWithStripe = async () => {
    setPaying(true); setError("");
    const stripe = await loadStripe(gateway.key);
    if (!stripe) { setError("Stripe failed to load."); setPaying(false); return; }
    const res = await fetch(`${API_BASE}/payment/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
      body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message || "Session creation failed."); setPaying(false); return; }
    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.session_id });
    if (stripeError) { setError(stripeError.message); setPaying(false); }
  };

  const payWithPhonePe = async () => {
    setPaying(true); setError("");
    const res = await fetch(`${API_BASE}/payment/phonepe/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}`, Accept: "application/json" },
      body: JSON.stringify({ booking_id: bookingId, milestone_id: milestoneId || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message || "PhonePe initiation failed."); setPaying(false); return; }
    window.location.href = data.redirect_url;
  };

  const handlePay = () => {
    if (!gateway) return;
    const p = gateway.provider?.toLowerCase();
    if (p === "razorpay") payWithRazorpay();
    else if (p === "stripe") payWithStripe();
    else if (p === "phonepe") payWithPhonePe();
    else setError(`Unknown payment provider: ${gateway.provider}`);
  };

  const providerLabel = gateway?.provider
    ? { razorpay: "Pay with Razorpay", stripe: "Pay with Stripe", phonepe: "Pay with PhonePe" }[gateway.provider.toLowerCase()] || "Proceed to Pay"
    : "Proceed to Pay";

  // Loading state
  if (loading || milestoneLoad) return (
    <div className="payment-page">
      <div className="payment-loading">
        <div className="payment-loading-spinner">⏳</div>
        <div className="payment-loading-text">Loading payment details…</div>
      </div>
    </div>
  );

  // Already paid milestone
  if (milestoneId && milestone?.status === "paid") return (
    <div className="payment-page">
      <div className="payment-card payment-card-centered">
        <div className="payment-success-icon">✅</div>
        <div className="payment-error-title">Already Paid</div>
        <div className="payment-success-message">
          {milestone.label} for Unit <strong style={{ color: 'var(--primary-color)' }}>{booking?.plot_number}</strong> has already been paid.
        </div>
        <button className="payment-btn-outline" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      </div>
    </div>
  );

  // Success state
  if (success) return (
    <div className="payment-page">
      <div className="payment-card-success payment-card-centered">
        <div className="payment-success-icon">🎉</div>
        <div className="payment-success-title">Payment Successful!</div>
        <div className="payment-success-message">
          {isMilestonePayment
            ? <>Payment for <strong style={{ color: 'var(--primary-color)' }}>{milestone?.label}</strong> on Unit <strong style={{ color: 'var(--primary-color)' }}>{booking?.plot_number}</strong> confirmed.</>
            : <>Unit <strong style={{ color: 'var(--primary-color)' }}>{booking?.plot_number}</strong> booking confirmed. A receipt will be sent to {user?.email}.</>
          }
        </div>
        <div className="payment-details-box">
          {[
            ["Booking ID", `#${bookingId}`],
            ["Unit", booking?.plot_number],
            ...(isMilestonePayment ? [["Milestone", milestone?.label]] : []),
            ["Amount Paid", fmtAmt(downPayment)],
            ...(isMilestonePayment && milestone?.tax_amount > 0 ? [[`${milestone.tax_label || "Tax"} included`, fmtAmt(milestone.tax_amount)]] : [])
          ].map(([k, v]) => (
            <div key={k} className="payment-detail-row">
              <span className="payment-detail-label">{k}</span>
              <span className={k === "Amount Paid" ? "payment-detail-highlight" : "payment-detail-value"}>{v}</span>
            </div>
          ))}
        </div>
        <button className="payment-btn-outline" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      </div>
    </div>
  );

  // Error state
  if (error && !booking) return (
    <div className="payment-page">
      <div className="payment-card-error payment-card-centered">
        <div className="payment-error-icon-large">⚠️</div>
        <div className="payment-error-message">{error}</div>
        <button className="payment-btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );

  // Main payment form
  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-header">{isMilestonePayment ? "Milestone Payment" : "Complete Your Booking"}</div>
        <div className="payment-subheader">
          {isMilestonePayment
            ? `${milestone.label} · Booking #${bookingId} · Unit ${booking?.plot_number}`
            : `Booking #${bookingId} · ${booking?.plot_type} — Unit ${booking?.plot_number}`}
        </div>

        {/* Booking Summary */}
        <div className="payment-summary">
          <div className="payment-section-title">📋 Booking Summary</div>
          <div className="payment-summary-content">
            {[
              ["Project", booking?.project_name || booking?.project?.name || "—"],
              ["Floor", booking?.block_name || booking?.block?.name || booking?.block || "—"],
              ["Area", booking?.area ? `${booking.area} sq.ft` : "—"],
              ["Your Name", user?.name],
              ["Email", user?.email],
            ].map(([k, v]) => (
              <div key={k} className="payment-summary-row">
                <span className="payment-summary-label">{k}</span>
                <span className="payment-summary-value">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown */}
        {isMilestonePayment ? (
          <div className="payment-milestone-card">
            <div className="payment-milestone-header">💳 Milestone Payment</div>
            <ElegantRow label={`${milestone.label} (base)`} value={fmtAmt(milestone.amount)} />
            {(milestone.extra_fees || 0) > 0 && <ElegantRow label="Additional Fees" value={fmtAmt(milestone.extra_fees)} />}
            {(milestone.tax_amount || 0) > 0 && (
              <ElegantRow label={`${milestone.tax_label || "Tax"}${milestone.tax_rate > 0 ? ` (${milestone.tax_rate}%)` : ""}`} value={fmtAmt(milestone.tax_amount)} accent="#f59e0b" borderTop />
            )}
            {((milestone.tax_amount || 0) > 0 || (milestone.extra_fees || 0) > 0) && (
              <ElegantRow label="Milestone Total" value={fmtAmt(milestone.total_with_tax ?? milestone.amount)} bold borderTop />
            )}
            {milestone.due_date && <div className="payment-milestone-due-date">📅 Due: {milestone.due_date}</div>}
          </div>
        ) : plan ? (
          <>
            <GrandTotalBreakdown breakdown={feeBreakdown} sym={currSym} />
            <FullPaymentBreakdown plan={plan} unitPrice={unitPrice} feeBreakdown={feeBreakdown} sym={currSym} />
            {firstMilestone && (
              <div className="payment-due-now">
                <div className="payment-due-now-header">💚 Due Now — {firstMilestone.label}{firstMsPct > 0 ? ` (${firstMsPct}%)` : ""}</div>
                <ElegantRow label="Unit price portion" value={fmtAmt(firstMsBase)} />
                {firstMsFees > 0 && <ElegantRow label="Fees (proportional)" value={fmtAmt(firstMsFees)} />}
                {firstMsTax > 0 && (
                  <ElegantRow label={`${feeBreakdown.tax_label || "Tax"} (${feeBreakdown.tax_rate || 0}%)`} value={fmtAmt(firstMsTax)} accent="#f59e0b" borderTop />
                )}
                {(firstMsTax > 0 || firstMsFees > 0) && (
                  <ElegantRow label="First instalment total" value={fmtAmt(feeBreakdown?.tax_enabled ? firstMsBase + firstMsTax + firstMsFees : firstMsBase)} bold borderTop />
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <GrandTotalBreakdown breakdown={feeBreakdown} sym={currSym} />
            {!feeBreakdown && (
              <div style={{ margin: "16px 0 0", padding: "12px 16px", background: "var(--page-bg)", border: "1px solid var(--card-border)", borderRadius: "14px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                💰 Full Payment — no instalment plan
              </div>
            )}
          </>
        )}

        {/* Amount Due */}
        <div className="payment-amount-section">
          <div className="payment-amount-label">
            {isMilestonePayment
              ? `${milestone.label}${milestone.tax_amount > 0 ? " (base + tax)" : ""}`
              : plan
                ? `First payment — ${firstMilestone?.label || "Down Payment"}${feeBreakdown?.tax_enabled ? " (incl. taxes & fees)" : ""}`
                : `Total amount due${feeBreakdown?.tax_enabled ? " (incl. all taxes & fees)" : ""}`
            }
          </div>
          <div className="payment-amount-value">{fmtAmt(downPayment)}</div>
          {!isMilestonePayment && feeBreakdown?.tax_amount > 0 && (
            <div className="payment-tax-badge">
              ✓ Includes {feeBreakdown.tax_label || "Tax"}: {fmtAmt(isInstalment ? firstMsTax : feeBreakdown.tax_amount)}
              {feeBreakdown.tax_rate > 0 && ` (${feeBreakdown.tax_rate}%${feeBreakdown.tax_system ? ` · ${feeBreakdown.tax_system.toUpperCase()}` : ""})`}
            </div>
          )}
          {isInstalment && (
            <div className="payment-instalment-note">
              Grand Total: {fmtAmt(booking.total_amount)} · Remaining: {fmtAmt(booking.total_amount - downPayment)} in future instalments
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="payment-error">
            <span className="payment-error-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Gateway Warning */}
        {!gateway && (
          <div className="payment-gateway-warning">⚠ No payment gateway configured. Please contact admin.</div>
        )}

        {/* Payment Button */}
        <button
          className={`payment-btn payment-btn-primary`}
          onClick={handlePay}
          disabled={paying || !gateway || milestone?.status === "paid"}
        >
          {paying ? (
            <span className="payment-btn-spinner">
              <span className="spinner"></span>
              Processing...
            </span>
          ) : providerLabel}
        </button>

        {/* Cancel Button */}
        <button className="payment-btn-secondary" onClick={() => navigate(-1)}>
          ← Cancel &amp; Go Back
        </button>
      </div>
    </div>
  );
}