// import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

// // ── Visual config per type ────────────────────────────────────────────────────
// const CFG = {
//   success: {
//     bg:     "linear-gradient(135deg,rgba(21,128,61,0.97),rgba(20,83,45,0.97))",
//     border: "rgba(34,197,94,0.45)",
//     icon:   "✓",
//     sub:    "#bbf7d0",
//   },
//   error: {
//     bg:     "linear-gradient(135deg,rgba(185,28,28,0.97),rgba(153,27,27,0.97))",
//     border: "rgba(239,68,68,0.45)",
//     icon:   "✕",
//     sub:    "#fecaca",
//   },
//   warning: {
//     bg:     "linear-gradient(135deg,rgba(161,98,7,0.97),rgba(133,77,14,0.97))",
//     border: "rgba(234,179,8,0.45)",
//     icon:   "⚠",
//     sub:    "#fef08a",
//   },
//   info: {
//     bg:     "linear-gradient(135deg,rgba(29,78,216,0.97),rgba(30,58,138,0.97))",
//     border: "rgba(96,165,250,0.45)",
//     icon:   "ℹ",
//     sub:    "#bfdbfe",
//   },
//   wishlist_add: {
//     bg:     "linear-gradient(135deg,rgba(159,18,57,0.97),rgba(136,19,55,0.97))",
//     border: "rgba(251,113,133,0.45)",
//     icon:   "❤️",
//     sub:    "#fecdd3",
//   },
//   wishlist_remove: {
//     bg:     "linear-gradient(135deg,rgba(51,65,85,0.98),rgba(30,41,59,0.98))",
//     border: "rgba(148,163,184,0.3)",
//     icon:   "🤍",
//     sub:    "#cbd5e1",
//   },
//   booking: {
//     bg:     "linear-gradient(135deg,rgba(120,53,15,0.97),rgba(92,45,12,0.97))",
//     border: "rgba(201,169,110,0.5)",
//     icon:   "🏠",
//     sub:    "#fde68a",
//   },
// };

// // ── CSS injected once into <head> ─────────────────────────────────────────────
// const ANIM_CSS = `
// @keyframes _tst_in  {
//   0%   { opacity:0; transform:translateX(110%) scale(.88); }
//   65%  { transform:translateX(-6px) scale(1.02); }
//   100% { opacity:1; transform:translateX(0) scale(1); }
// }
// @keyframes _tst_out {
//   0%   { opacity:1; transform:translateX(0) scale(1); }
//   100% { opacity:0; transform:translateX(110%) scale(.88); }
// }
// @keyframes _tst_progress {
//   from { width:100%; }
//   to   { width:0%; }
// }
// ._tst      { animation: _tst_in  .42s cubic-bezier(.34,1.56,.64,1) forwards; }
// ._tst._out { animation: _tst_out .34s ease forwards; }
// `;

// let _cssInjected = false;
// let _toastId = 0;

// function injectCss() {
//   if (_cssInjected || typeof document === "undefined") return;
//   const s = document.createElement("style");
//   s.textContent = ANIM_CSS;
//   document.head.appendChild(s);
//   _cssInjected = true;
// }

// // ── Context ───────────────────────────────────────────────────────────────────
// const ToastContext = createContext(null);

// // ── Provider — wrap your whole app with this once ─────────────────────────────
// export function ToastProvider({ children }) {
//   const [toasts, setToasts] = useState([]);
//   const timers = useRef({});

//   useEffect(() => { injectCss(); }, []);

//   const dismiss = useCallback((id) => {
//     setToasts((p) => p.map((t) => (t.id === id ? { ...t, out: true } : t)));
//     setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 360);
//     clearTimeout(timers.current[id]);
//     delete timers.current[id];
//   }, []);

//   // ── showToast(message, type, duration)
//   //   duration = 0 → stays until user dismisses manually
//   const showToast = useCallback(
//     (message, type = "info", duration = 3500) => {
//       const id = ++_toastId;
//       setToasts((p) => [...p.slice(-4), { id, message, type, out: false, duration }]);
//       if (duration > 0) {
//         timers.current[id] = setTimeout(() => dismiss(id), duration);
//       }
//       return id;
//     },
//     [dismiss],
//   );

//   return (
//     <ToastContext.Provider value={{ showToast, dismiss }}>
//       {children}
//       <ToastContainer toasts={toasts} dismiss={dismiss} />
//     </ToastContext.Provider>
//   );
// }

// // ── Hook — use in any component ───────────────────────────────────────────────
// export function useToast() {
//   const ctx = useContext(ToastContext);
//   if (!ctx) {
//     // Fallback if used outside provider — won't crash, just logs warning
//     console.warn("useToast: must be used inside <ToastProvider>");
//     return { showToast: () => {}, dismiss: () => {} };
//   }
//   return ctx;
// }

// // ── Toast container — rendered once inside the provider (bottom-right) ────────
// function ToastContainer({ toasts, dismiss }) {
//   if (!toasts.length) return null;

//   return (
//     <div
//       style={{
//         position:      "fixed",
//         bottom:        "24px",
//         right:         "20px",
//         zIndex:        999999,
//         display:       "flex",
//         flexDirection: "column-reverse",   // newest toast appears at bottom
//         gap:           "10px",
//         width:         "min(380px, calc(100vw - 40px))",
//         pointerEvents: "none",
//       }}
//     >
//       {toasts.map((t) => {
//         const c = CFG[t.type] || CFG.info;
//         return (
//           <div
//             key={t.id}
//             className={`_tst${t.out ? " _out" : ""}`}
//             onClick={() => dismiss(t.id)}
//             style={{
//               position:       "relative",
//               overflow:       "hidden",
//               display:        "flex",
//               alignItems:     "center",
//               gap:            "13px",
//               padding:        "14px 14px 18px",
//               borderRadius:   "16px",
//               background:     c.bg,
//               border:         `1px solid ${c.border}`,
//               boxShadow:      "0 16px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
//               cursor:         "pointer",
//               pointerEvents:  "auto",
//               userSelect:     "none",
//             }}
//           >
//             {/* Icon badge */}
//             <div
//               style={{
//                 width:           "44px",
//                 height:          "44px",
//                 borderRadius:    "12px",
//                 background:      "rgba(255,255,255,0.15)",
//                 border:          "1px solid rgba(255,255,255,0.15)",
//                 display:         "flex",
//                 alignItems:      "center",
//                 justifyContent:  "center",
//                 fontSize:        "21px",
//                 flexShrink:      0,
//               }}
//             >
//               {c.icon}
//             </div>

//             {/* Text */}
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div
//                 style={{
//                   fontSize:      "13.5px",
//                   fontWeight:    "700",
//                   color:         "#ffffff",
//                   lineHeight:    1.35,
//                   letterSpacing: "-0.1px",
//                 }}
//               >
//                 {t.message}
//               </div>
//               <div
//                 style={{
//                   fontSize:   "11px",
//                   color:      c.sub,
//                   marginTop:  "3px",
//                   opacity:    0.8,
//                 }}
//               >
//                 Tap to dismiss
//               </div>
//             </div>

//             {/* Dismiss × */}
//             <div
//               style={{
//                 fontSize:   "19px",
//                 color:      "rgba(255,255,255,0.35)",
//                 flexShrink: 0,
//                 alignSelf:  "flex-start",
//                 lineHeight: 1,
//                 marginTop:  "1px",
//               }}
//             >
//               ×
//             </div>

//             {/* Progress bar — shrinks left to right showing time remaining */}
//             {t.duration > 0 && (
//               <div
//                 style={{
//                   position:     "absolute",
//                   bottom:       0,
//                   left:         0,
//                   height:       "3px",
//                   background:   "rgba(255,255,255,0.35)",
//                   borderRadius: "0 0 16px 16px",
//                   animation:    `_tst_progress ${t.duration}ms linear forwards`,
//                 }}
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }


import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

// ── Visual config per type ────────────────────────────────────────────────────
const CFG = {
  success: {
    bg:     "linear-gradient(135deg,rgba(21,128,61,0.97),rgba(20,83,45,0.97))",
    border: "rgba(34,197,94,0.45)",
    icon:   "✓",
    sub:    "#bbf7d0",
  },
  error: {
    bg:     "linear-gradient(135deg,rgba(185,28,28,0.97),rgba(153,27,27,0.97))",
    border: "rgba(239,68,68,0.45)",
    icon:   "✕",
    sub:    "#fecaca",
  },
  warning: {
    bg:     "linear-gradient(135deg,rgba(161,98,7,0.97),rgba(133,77,14,0.97))",
    border: "rgba(234,179,8,0.45)",
    icon:   "⚠",
    sub:    "#fef08a",
  },
  info: {
    bg:     "linear-gradient(135deg,rgba(29,78,216,0.97),rgba(30,58,138,0.97))",
    border: "rgba(96,165,250,0.45)",
    icon:   "ℹ",
    sub:    "#bfdbfe",
  },
  wishlist_add: {
    bg:     "linear-gradient(135deg,rgba(159,18,57,0.97),rgba(136,19,55,0.97))",
    border: "rgba(251,113,133,0.45)",
    icon:   "❤️",
    sub:    "#fecdd3",
  },
  wishlist_remove: {
    bg:     "linear-gradient(135deg,rgba(51,65,85,0.98),rgba(30,41,59,0.98))",
    border: "rgba(148,163,184,0.3)",
    icon:   "🤍",
    sub:    "#cbd5e1",
  },
  booking: {
    bg:     "linear-gradient(135deg,rgba(120,53,15,0.97),rgba(92,45,12,0.97))",
    border: "rgba(201,169,110,0.5)",
    icon:   "🏠",
    sub:    "#fde68a",
  },
};

// ── CSS injected once into <head> ─────────────────────────────────────────────
const ANIM_CSS = `
@keyframes _tst_in  {
  0%   { opacity:0; transform:translateX(110%) scale(.88); }
  65%  { transform:translateX(-6px) scale(1.02); }
  100% { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes _tst_out {
  0%   { opacity:1; transform:translateX(0) scale(1); }
  100% { opacity:0; transform:translateX(110%) scale(.88); }
}
@keyframes _tst_progress {
  from { width:100%; }
  to   { width:0%; }
}
._tst      { animation: _tst_in  .42s cubic-bezier(.34,1.56,.64,1) forwards; }
._tst._out { animation: _tst_out .34s ease forwards; }
`;

let _cssInjected = false;
let _toastId = 0;

function injectCss() {
  if (_cssInjected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = ANIM_CSS;
  document.head.appendChild(s);
  _cssInjected = true;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Provider — wrap your whole app with this once ─────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  useEffect(() => { injectCss(); }, []);

  const dismiss = useCallback((id) => {
    setToasts((p) => p.map((t) => (t.id === id ? { ...t, out: true } : t)));
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 360);
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  // ── showToast(message, type, duration)
  //   duration = 0 → stays until user dismisses manually
  const showToast = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = ++_toastId;
      setToasts((p) => [...p.slice(-4), { id, message, type, out: false, duration }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Hook — use in any component ───────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider — won't crash, just logs warning
    console.warn("useToast: must be used inside <ToastProvider>");
    return { showToast: () => {}, dismiss: () => {} };
  }
  return ctx;
}

// ── Toast container — rendered once inside the provider (bottom-right) ────────
function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position:      "fixed",
        bottom:        "24px",
        right:         "20px",
        zIndex:        999999,
        display:       "flex",
        flexDirection: "column-reverse",   // newest toast appears at bottom
        gap:           "10px",
        width:         "min(380px, calc(100vw - 40px))",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const c = CFG[t.type] || CFG.info;
        return (
          <div
            key={t.id}
            className={`_tst${t.out ? " _out" : ""}`}
            onClick={() => dismiss(t.id)}
            style={{
              position:       "relative",
              overflow:       "hidden",
              display:        "flex",
              alignItems:     "center",
              gap:            "13px",
              padding:        "14px 14px 18px",
              borderRadius:   "16px",
              background:     c.bg,
              border:         `1px solid ${c.border}`,
              boxShadow:      "0 16px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
              cursor:         "pointer",
              pointerEvents:  "auto",
              userSelect:     "none",
            }}
          >
            {/* Icon badge */}
            <div
              style={{
                width:           "44px",
                height:          "44px",
                borderRadius:    "12px",
                background:      "rgba(255,255,255,0.15)",
                border:          "1px solid rgba(255,255,255,0.15)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                fontSize:        "21px",
                flexShrink:      0,
              }}
            >
              {c.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize:      "13.5px",
                  fontWeight:    "700",
                  color:         "#ffffff",
                  lineHeight:    1.35,
                  letterSpacing: "-0.1px",
                }}
              >
                {t.message}
              </div>
              <div
                style={{
                  fontSize:   "11px",
                  color:      c.sub,
                  marginTop:  "3px",
                  opacity:    0.8,
                }}
              >
                Tap to dismiss
              </div>
            </div>

            {/* Dismiss × */}
            <div
              style={{
                fontSize:   "19px",
                color:      "rgba(255,255,255,0.35)",
                flexShrink: 0,
                alignSelf:  "flex-start",
                lineHeight: 1,
                marginTop:  "1px",
              }}
            >
              ×
            </div>

            {/* Progress bar — shrinks left to right showing time remaining */}
            {t.duration > 0 && (
              <div
                style={{
                  position:     "absolute",
                  bottom:       0,
                  left:         0,
                  height:       "3px",
                  background:   "rgba(255,255,255,0.35)",
                  borderRadius: "0 0 16px 16px",
                  animation:    `_tst_progress ${t.duration}ms linear forwards`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
