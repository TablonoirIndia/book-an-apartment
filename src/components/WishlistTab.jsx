// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const gold = "#c9a96e";

// // ── Status pill ───────────────────────────────────────────────────
// const StatusPill = ({ status }) => {
//   const s = (status || "").toLowerCase();
//   const styles = {
//     available: { bg: "rgba(34,197,94,0.15)",  color: "#22c55e" },
//     booked:    { bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
//     unknown:   { bg: "rgba(100,116,139,0.15)",color: "#64748b" },
//   };
//   const st = styles[s] || styles.unknown;
//   return (
//     <span style={{
//       padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
//       fontWeight: 700, background: st.bg, color: st.color,
//     }}>
//       {status || "Unknown"}
//     </span>
//   );
// };

// // ── Heart icon ────────────────────────────────────────────────────
// const HeartIcon = ({ filled, size = 16 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"}
//     stroke={filled ? "#ef4444" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//   </svg>
// );

// // ── WishlistTab ───────────────────────────────────────────────────
// export default function WishlistTab({ wishlist = [], loading, onRemove, currency = "₹" }) {
//   const navigate = useNavigate();
//   const [removing, setRemoving] = useState(null);

//   const handleRemove = async (item) => {
//     setRemoving(item.id);
//     await onRemove(item.id, item.plot_id);
//     setRemoving(null);
//   };

//   if (loading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: "#475569" }}>
//         <div style={{ textAlign: "center" }}>
//           <div style={{ fontSize: "32px", marginBottom: "12px" }}>❤️</div>
//           <div>Loading your wishlist…</div>
//         </div>
//       </div>
//     );
//   }

//   if (wishlist.length === 0) {
//     return (
//       <div style={{
//         textAlign: "center", padding: "60px 20px",
//         background: "rgba(255,255,255,0.03)", borderRadius: "16px",
//         border: "1px solid rgba(255,255,255,0.06)",
//       }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏠</div>
//         <div style={{ fontSize: "18px", fontWeight: 700, color: "#e2e8f0", marginBottom: "8px" }}>
//           No saved units yet
//         </div>
//         <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
//           Tap the ❤️ on any unit to save it here for easy access
//         </div>
//         <button
//           onClick={() => navigate("/")}
//           style={{
//             background: gold, color: "#fff", border: "none",
//             borderRadius: "10px", padding: "10px 24px",
//             fontWeight: 700, cursor: "pointer", fontSize: "14px",
//           }}
//         >
//           Browse Units
//         </button>
//       </div>
//     );
//   }

//   // Sort: available units first, then booked
//   const sorted = [...wishlist].sort((a, b) => {
//     const aAvail = a.live_status?.toLowerCase() === "available" ? 0 : 1;
//     const bAvail = b.live_status?.toLowerCase() === "available" ? 0 : 1;
//     return aAvail - bAvail;
//   });

//   const bookedCount   = wishlist.filter(w => w.live_status?.toLowerCase() === "booked").length;
//   const availCount    = wishlist.filter(w => w.live_status?.toLowerCase() === "available").length;

//   return (
//     <div>
//       {/* ── Summary row ── */}
//       <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
//         {[
//           ["Total Saved",    wishlist.length, gold,      "❤️"],
//           ["Still Available", availCount,    "#22c55e",  "✅"],
//           ["Now Booked",     bookedCount,    "#ef4444",  "🔒"],
//         ].map(([label, val, color, icon]) => (
//           <div key={label} style={{
//             flex: "1", minWidth: "100px",
//             background: "rgba(255,255,255,0.04)",
//             border: `1px solid ${color}33`,
//             borderRadius: "12px", padding: "12px 16px",
//           }}>
//             <div style={{ fontSize: "22px", fontWeight: 800, color }}>{val}</div>
//             <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
//               {icon} {label}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ── Booked warning banner ── */}
//       {bookedCount > 0 && (
//         <div style={{
//           background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
//           borderRadius: "10px", padding: "10px 16px", marginBottom: "16px",
//           fontSize: "13px", color: "#fca5a5",
//         }}>
//           ⚠️ <strong>{bookedCount} unit{bookedCount > 1 ? "s" : ""}</strong> you saved
//           {bookedCount > 1 ? " have" : " has"} been booked by someone else.
//           Browse similar units or contact our team.
//         </div>
//       )}

//       {/* ── Unit cards ── */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
//         {sorted.map((item) => {
//           const isAvail    = item.live_status?.toLowerCase() === "available";
//           const isBooked   = item.live_status?.toLowerCase() === "booked";
//           const isRemoving = removing === item.id;

//           // Price change detection
//           const savedPrice   = parseFloat(item.saved_price)   || 0;
//           const currentPrice = parseFloat(item.current_price) || 0;
//           const priceChanged = currentPrice > 0 && savedPrice > 0 && currentPrice !== savedPrice;
//           const priceDiff    = currentPrice - savedPrice;

//           return (
//             <div
//               key={item.id}
//               style={{
//                 background:  isBooked
//                   ? "rgba(239,68,68,0.06)"
//                   : "rgba(255,255,255,0.04)",
//                 border:      isBooked
//                   ? "1px solid rgba(239,68,68,0.2)"
//                   : `1px solid rgba(201,169,110,0.12)`,
//                 borderRadius: "14px",
//                 padding:      "16px",
//                 opacity:      isBooked ? 0.85 : 1,
//                 transition:   "all .2s",
//               }}
//             >
//               {/* Header */}
//               <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
//                 <div>
//                   <div style={{ fontWeight: 800, fontSize: "16px", color: "#f1f5f9" }}>
//                     Unit {item.plot_number}
//                   </div>
//                   <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
//                     {item.plot_type}
//                     {item.block ? ` • Block ${item.block}` : ""}
//                   </div>
//                 </div>
//                 <StatusPill status={item.live_status} />
//               </div>

//               {/* Price */}
//               <div style={{ marginBottom: "10px" }}>
//                 {currentPrice > 0 ? (
//                   <div>
//                     <span style={{ fontSize: "20px", fontWeight: 800, color: gold }}>
//                       {currency}{currentPrice.toLocaleString("en-IN")}
//                     </span>
//                     {priceChanged && (
//                       <span style={{
//                         marginLeft: "8px", fontSize: "11px", fontWeight: 600,
//                         color: priceDiff > 0 ? "#ef4444" : "#22c55e",
//                       }}>
//                         {priceDiff > 0 ? "▲" : "▼"} {currency}{Math.abs(priceDiff).toLocaleString("en-IN")} since saved
//                       </span>
//                     )}
//                   </div>
//                 ) : item.saved_price ? (
//                   <span style={{ fontSize: "20px", fontWeight: 800, color: gold }}>
//                     {currency}{parseFloat(item.saved_price).toLocaleString("en-IN")}
//                   </span>
//                 ) : null}
//               </div>

//               {/* Meta */}
//               {(item.area || item.direction || item.section) && (
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
//                   {[
//                     item.area      && `📐 ${item.area}`,
//                     item.direction && `🧭 ${item.direction}`,
//                     item.section   && `📍 ${item.section}`,
//                   ].filter(Boolean).map((tag, i) => (
//                     <span key={i} style={{
//                       background: "rgba(255,255,255,0.06)", borderRadius: "6px",
//                       padding: "2px 8px", fontSize: "11px", color: "#94a3b8",
//                     }}>{tag}</span>
//                   ))}
//                 </div>
//               )}

//               {/* Saved date */}
//               <div style={{ fontSize: "11px", color: "#475569", marginBottom: "12px" }}>
//                 Saved {new Date(item.saved_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
//               </div>

//               {/* Actions */}
//               <div style={{ display: "flex", gap: "8px" }}>
//                 {isAvail && (
//                   <button
//                     onClick={() => navigate(`/unit/${item.plot_id}`)}
//                     style={{
//                       flex: 1, background: gold, color: "#fff",
//                       border: "none", borderRadius: "8px",
//                       padding: "8px 12px", fontWeight: 700,
//                       cursor: "pointer", fontSize: "13px",
//                     }}
//                   >
//                     View & Book
//                   </button>
//                 )}
//                 {isBooked && (
//                   <button
//                     onClick={() => navigate("/")}
//                     style={{
//                       flex: 1, background: "rgba(255,255,255,0.06)", color: "#94a3b8",
//                       border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
//                       padding: "8px 12px", fontWeight: 600,
//                       cursor: "pointer", fontSize: "13px",
//                     }}
//                   >
//                     Browse Similar
//                   </button>
//                 )}
//                 <button
//                   onClick={() => handleRemove(item)}
//                   disabled={isRemoving}
//                   title="Remove from wishlist"
//                   style={{
//                     width: "36px", height: "36px",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     background: isRemoving ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.1)",
//                     border: "1px solid rgba(239,68,68,0.2)",
//                     borderRadius: "8px", cursor: isRemoving ? "not-allowed" : "pointer",
//                     transition: "all .2s",
//                   }}
//                 >
//                   {isRemoving
//                     ? <span style={{ fontSize: "12px", color: "#ef4444" }}>…</span>
//                     : <HeartIcon filled size={16} />
//                   }
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const gold = "#c9a96e";

// ── Status pill ───────────────────────────────────────────────────
// const StatusPill = ({ status }) => {
//   const s = (status || "").toLowerCase();
//   const styles = {
//     available: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
//     booked: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
//     unknown: { bg: "rgba(100,116,139,0.15)", color: "#64748b" },
//   };
//   const st = styles[s] || styles.unknown;
//   return (
//     <span
//       style={{
//         padding: "2px 8px",
//         borderRadius: "20px",
//         fontSize: "11px",
//         fontWeight: 700,
//         background: st.bg,
//         color: st.color,
//       }}
//     >
//       {status || "Unknown"}
//     </span>
//   );
// };

const StatusPill = ({ status, bookedByMe }) => {
  if (bookedByMe)
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 700,
          background: "rgba(201,169,110,0.15)",
          color: "#c9a96e",
        }}
      >
        ✅ Your Booking
      </span>
    );
  const s = (status || "").toLowerCase();
  const styles = {
    available: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
    booked: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    "not available": { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    unknown: { bg: "rgba(100,116,139,0.15)", color: "#64748b" },
  };
  const st = styles[s] || styles.unknown;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700,
        background: st.bg,
        color: st.color,
      }}
    >
      {status || "Unknown"}
    </span>
  );
};

// ── Heart icon ────────────────────────────────────────────────────
const HeartIcon = ({ filled, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "#94a3b8"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ── WishlistTab ───────────────────────────────────────────────────
// Props:
//   wishlist   – array of wishlist item objects from useWishlist()
//   wishedIds  – Set<number> from useWishlist()
//   onToggle   – toggle(plotId) from useWishlist()   ← was wrongly "onRemove"
//   loading    – boolean
//   fmt        – price formatter function from UserDashboard
//   onNavigate – navigate fn (optional, falls back to useNavigate)
export default function WishlistTab({
  wishlist = [],
  wishedIds, // Set<number> — normalised defensively below
  onToggle, // ← THE ONLY RENAMED PROP (was onRemove)
  loading,
  fmt,
  currency = "₹", // fallback if fmt not provided
  onNavigate,
}) {
  const _navigate = useNavigate();
  const navigate = onNavigate || _navigate;

  // Normalise wishedIds defensively — handles Set, array, or undefined
  const wishedSet =
    wishedIds instanceof Set
      ? wishedIds
      : new Set((Array.isArray(wishedIds) ? wishedIds : []).map(Number));

  // Price formatter fallback
  const fmtPrice =
    fmt ||
    ((n) => (n ? `${currency} ${Number(n).toLocaleString("en-IN")}` : "—"));

  const [removing, setRemoving] = useState(null);

  const handleRemove = async (item) => {
    if (typeof onToggle !== "function") {
      console.error("WishlistTab: onToggle prop is missing.");
      return;
    }
    setRemoving(item.id);
    await onToggle(item.plot_id ?? item.id);
    setRemoving(null);
  };

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "60px 0",
          color: "#475569",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>❤️</div>
          <div>Loading your wishlist…</div>
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────
  if (wishlist.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏠</div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: "8px",
          }}
        >
          No saved units yet
        </div>
        <div
          style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}
        >
          Tap the ❤️ on any unit to save it here for easy access
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: gold,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Browse Units
        </button>
      </div>
    );
  }

  // Sort: available first
  const sorted = [...wishlist].sort((a, b) => {
    const aAvail = a.live_status?.toLowerCase() === "available" ? 0 : 1;
    const bAvail = b.live_status?.toLowerCase() === "available" ? 0 : 1;
    return aAvail - bAvail;
  });

  // const bookedCount = wishlist.filter(
  //   (w) => w.live_status?.toLowerCase() === "booked",
  // ).length;

  const bookedCount = wishlist.filter(
    (w) =>
      !w.booked_by_me &&
      w.live_status !== "booked_by_me" &&
      ["booked", "not available"].includes(w.live_status?.toLowerCase()),
  ).length;

  const availCount = wishlist.filter(
    (w) => w.live_status?.toLowerCase() === "available",
  ).length;

  return (
    <div>
      {/* ── Summary row ── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {[
          ["Total Saved", wishlist.length, gold, "❤️"],
          ["Still Available", availCount, "#22c55e", "✅"],
          ["Now Booked", bookedCount, "#ef4444", "🔒"],
        ].map(([label, val, color, icon]) => (
          <div
            key={label}
            style={{
              flex: "1",
              minWidth: "100px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${color}33`,
              borderRadius: "12px",
              padding: "12px 16px",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 800, color }}>
              {val}
            </div>
            <div
              style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}
            >
              {icon} {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Booked warning ── */}
      {bookedCount > 0 && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "10px",
            padding: "10px 16px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "#fca5a5",
          }}
        >
          ⚠️{" "}
          <strong>
            {bookedCount} unit{bookedCount > 1 ? "s" : ""}
          </strong>{" "}
          you saved
          {bookedCount > 1 ? " have" : " has"} been booked by someone else.
          Browse similar units or contact our team.
        </div>
      )}

      {/* ── Unit cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "14px",
        }}
      >
        {sorted.map((item) => {
          // const isAvail    = item.live_status?.toLowerCase() === "available";
          // const isBooked   = item.live_status?.toLowerCase() === "booked";

          const isAvail = item.live_status?.toLowerCase() === "available";
          const isBookedByMe =
            item.live_status === "booked_by_me" || item.booked_by_me;
          const isBooked =
            !isAvail &&
            !isBookedByMe &&
            ["booked", "not available", "pre-booked"].includes(
              item.live_status?.toLowerCase(),
            );

          const isRemoving = removing === item.id;

          // Live heart state — check wishedSet on every render
          const plotKey = Number(item.plot_id ?? item.id);
          const isWished = wishedSet.has(plotKey);

          // Price change detection
          const savedPrice = parseFloat(item.saved_price) || 0;
          const currentPrice = parseFloat(item.current_price) || 0;
          const priceChanged =
            currentPrice > 0 && savedPrice > 0 && currentPrice !== savedPrice;
          const priceDiff = currentPrice - savedPrice;

          return (
            <div
              key={item.id}
              style={{
                background: isBooked
                  ? "rgba(239,68,68,0.06)"
                  : "rgba(255,255,255,0.04)",
                border: isBooked
                  ? "1px solid rgba(239,68,68,0.2)"
                  : "1px solid rgba(201,169,110,0.12)",
                borderRadius: "14px",
                padding: "16px",
                opacity: isBooked ? 0.85 : 1,
                transition: "all .2s",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "16px",
                      color: "#f1f5f9",
                    }}
                  >
                    Unit {item.plot_number}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    {item.plot_type}
                    {item.block ? ` • Block ${item.block}` : ""}
                  </div>
                </div>
                <StatusPill status={item.live_status} />
              </div>

              {/* Price */}
              <div style={{ marginBottom: "10px" }}>
                {currentPrice > 0 ? (
                  <div>
                    <span
                      style={{ fontSize: "20px", fontWeight: 800, color: gold }}
                    >
                      {fmtPrice(currentPrice)}
                    </span>
                    {priceChanged && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: priceDiff > 0 ? "#ef4444" : "#22c55e",
                        }}
                      >
                        {priceDiff > 0 ? "▲" : "▼"}{" "}
                        {fmtPrice(Math.abs(priceDiff))} since saved
                      </span>
                    )}
                  </div>
                ) : savedPrice > 0 ? (
                  <span
                    style={{ fontSize: "20px", fontWeight: 800, color: gold }}
                  >
                    {fmtPrice(savedPrice)}
                  </span>
                ) : null}
              </div>

              {/* Meta tags */}
              {(item.area || item.direction || item.section) && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "12px",
                  }}
                >
                  {[
                    item.area && `📐 ${item.area}`,
                    item.direction && `🧭 ${item.direction}`,
                    item.section && `📍 ${item.section}`,
                  ]
                    .filter(Boolean)
                    .map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              )}

              {/* Saved date */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#475569",
                  marginBottom: "12px",
                }}
              >
                Saved{" "}
                {new Date(item.saved_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                {isAvail && (
                  <button
                    onClick={() => navigate(`/unit/${item.plot_id}`)}
                    style={{
                      flex: 1,
                      background: gold,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    View & Book
                  </button>
                )}
                {isBooked && (
                  <button
                    onClick={() => navigate("/")}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.06)",
                      color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Browse Similar
                  </button>
                )}

                {isBookedByMe && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                      flex: 1,
                      background: "rgba(201,169,110,0.12)",
                      color: "#c9a96e",
                      border: "1px solid rgba(201,169,110,0.25)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    View My Booking
                  </button>
                )}

                {/* Heart / remove button — color reacts live to wishedSet */}
                <button
                  onClick={() => handleRemove(item)}
                  disabled={isRemoving}
                  title={isWished ? "Remove from wishlist" : "Save to wishlist"}
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isRemoving
                      ? "rgba(239,68,68,0.05)"
                      : isWished
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isWished ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "8px",
                    cursor: isRemoving ? "not-allowed" : "pointer",
                    transition: "all .2s",
                    flexShrink: 0,
                  }}
                >
                  {isRemoving ? (
                    <span style={{ fontSize: "12px", color: "#ef4444" }}>
                      …
                    </span>
                  ) : (
                    <HeartIcon filled={isWished} size={16} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
