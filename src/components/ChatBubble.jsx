// import { useState, useEffect, useRef, useCallback } from "react";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";
// import { useMessages } from "../hooks/useMessages";
// import { useToast } from "../context/ToastContext";

// export default function ChatBubble() {
//   const user        = useSelector(selectUser);
//   const { showToast } = useToast();
//   const {
//     messages, unread, loading, sending,
//     loadMessages, sendMessage, setUnread, setOpen,
//   } = useMessages(user);

//   const [isOpen,   setIsOpen]   = useState(false);
//   const [input,    setInput]    = useState("");
//   const [animOut,  setAnimOut]  = useState(false);
//   const bottomRef  = useRef(null);
//   const inputRef   = useRef(null);
//   const prevUnread = useRef(0);

//   // ── Toast when new admin message arrives while panel is closed ─────────────
//   useEffect(() => {
//     if (!isOpen && unread > prevUnread.current) {
//       showToast("💬 New message from Support", "info", 5000);
//     }
//     prevUnread.current = unread;
//   }, [unread, isOpen, showToast]);

//   // ── Scroll to bottom on new messages ──────────────────────────────────────
//   useEffect(() => {
//     if (isOpen && bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isOpen]);

//   // ── Open panel ─────────────────────────────────────────────────────────────
//   const handleOpen = useCallback(() => {
//     setAnimOut(false);
//     setIsOpen(true);
//     setOpen(true);
//     loadMessages();
//     setUnread(0);
//     setTimeout(() => inputRef.current?.focus(), 300);
//   }, [loadMessages, setUnread, setOpen]);

//   // ── Close panel ────────────────────────────────────────────────────────────
//   const handleClose = useCallback(() => {
//     setAnimOut(true);
//     setOpen(false);
//     setTimeout(() => { setIsOpen(false); setAnimOut(false); }, 220);
//   }, [setOpen]);

//   // ── Send message ───────────────────────────────────────────────────────────
//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || sending) return;
//     setInput("");
//     const ok = await sendMessage(text);
//     if (ok) {
//       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
//     }
//   }, [input, sending, sendMessage]);

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//   };

//   // Don't render if not logged in
//   if (!user?.token) return null;

//   const timeStr = (d) => d
//     ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
//     : "";

//   return (
//     <>
//       {/* ── Chat panel ──────────────────────────────────────────────────────── */}
//       {isOpen && (
//         <div style={{
//           position:      "fixed",
//           bottom:        "90px",
//           right:         "20px",
//           width:         "min(380px, calc(100vw - 40px))",
//           height:        "480px",
//           zIndex:        999990,
//           display:       "flex",
//           flexDirection: "column",
//           borderRadius:  "20px",
//           overflow:      "hidden",
//           background:    "linear-gradient(180deg,#0f172a,#080812)",
//           border:        "1px solid rgba(201,169,110,0.25)",
//           boxShadow:     "0 20px 60px rgba(0,0,0,0.7)",
//           fontFamily:    "'DM Sans',sans-serif",
//           opacity:       animOut ? 0 : 1,
//           transform:     animOut ? "scale(.88) translateY(10px)" : "scale(1) translateY(0)",
//           transition:    "opacity .22s ease, transform .22s cubic-bezier(.34,1.3,.64,1)",
//         }}>

//           {/* Header */}
//           <div style={{
//             padding:      "14px 18px",
//             background:   "rgba(201,169,110,0.1)",
//             borderBottom: "1px solid rgba(201,169,110,0.2)",
//             display:      "flex", alignItems: "center", gap: "12px", flexShrink: 0,
//           }}>
//             <div style={{
//               width:"38px",height:"38px",borderRadius:"50%",flexShrink:0,
//               background:"linear-gradient(135deg,#c9a96e,#a07840)",
//               display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",
//             }}>🏠</div>
//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize:"14px",fontWeight:"700",color:"#e2e8f0" }}>Support Chat</div>
//               <div style={{ fontSize:"11px",color:"#22c55e",display:"flex",alignItems:"center",gap:"5px" }}>
//                 <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e",display:"inline-block" }}/>
//                 Online · Replies within an hour
//               </div>
//             </div>
//             <button onClick={handleClose} style={{
//               background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",
//               color:"#64748b",width:"30px",height:"30px",borderRadius:"8px",
//               cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",
//             }}>×</button>
//           </div>

//           {/* Messages */}
//           <div style={{
//             flex:1,overflowY:"auto",padding:"16px",
//             display:"flex",flexDirection:"column",gap:"10px",
//           }}>
//             {loading && (
//               <div style={{ textAlign:"center",color:"#475569",fontSize:"13px",padding:"20px" }}>
//                 Loading messages...
//               </div>
//             )}
//             {!loading && messages.length === 0 && (
//               <div style={{ textAlign:"center",padding:"30px 20px" }}>
//                 <div style={{ fontSize:"40px",marginBottom:"10px" }}>👋</div>
//                 <div style={{ fontSize:"14px",fontWeight:"700",color:"#e2e8f0",marginBottom:"6px" }}>
//                   Hi {user?.name?.split(" ")[0]}!
//                 </div>
//                 <div style={{ fontSize:"13px",color:"#475569",lineHeight:1.6 }}>
//                   Have a question about your booking? We're here to help.
//                 </div>
//               </div>
//             )}

//             {messages.map((m) => {
//               const isUser = m.sender === "user";
//               return (
//                 <div key={m.id} style={{ display:"flex",justifyContent:isUser?"flex-end":"flex-start",alignItems:"flex-end",gap:"8px" }}>
//                   {!isUser && (
//                     <div style={{
//                       width:"28px",height:"28px",borderRadius:"50%",flexShrink:0,
//                       background:"linear-gradient(135deg,#c9a96e,#a07840)",
//                       display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",
//                     }}>🏠</div>
//                   )}
//                   <div style={{ maxWidth:"76%" }}>
//                     <div style={{
//                       padding:"10px 13px",
//                       borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
//                       background:   isUser ? "linear-gradient(135deg,#c9a96e,#a07840)" : "rgba(255,255,255,0.08)",
//                       color:        isUser ? "#000" : "#e2e8f0",
//                       fontSize:"13px",lineHeight:1.5,
//                       border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
//                       wordBreak:"break-word",whiteSpace:"pre-wrap",
//                     }}>
//                       {m.message}
//                     </div>
//                     <div style={{
//                       fontSize:"10px",color:"#334155",marginTop:"3px",
//                       textAlign:isUser?"right":"left",
//                       paddingLeft:isUser?0:"4px",
//                     }}>
//                       {timeStr(m.created_at)}{isUser ? " ✓" : ""}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//             <div ref={bottomRef} />
//           </div>

//           {/* Input */}
//           <div style={{
//             padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.07)",
//             display:"flex",gap:"8px",alignItems:"flex-end",flexShrink:0,
//             background:"rgba(0,0,0,0.2)",
//           }}>
//             <textarea
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type a message... (Enter to send)"
//               rows={1}
//               style={{
//                 flex:1,padding:"9px 13px",borderRadius:"10px",resize:"none",
//                 background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",
//                 color:"#e2e8f0",fontSize:"13px",outline:"none",
//                 lineHeight:1.5,maxHeight:"80px",overflowY:"auto",fontFamily:"inherit",
//               }}
//             />
//             <button
//               onClick={handleSend}
//               disabled={sending || !input.trim()}
//               style={{
//                 width:"38px",height:"38px",borderRadius:"10px",border:"none",
//                 cursor: sending || !input.trim() ? "not-allowed" : "pointer",
//                 background: sending || !input.trim()
//                   ? "rgba(201,169,110,0.3)"
//                   : "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color:"#000",fontSize:"16px",
//                 display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
//                 transition:"opacity 0.2s",
//               }}
//             >
//               {sending ? "⏳" : "➤"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Floating bubble ──────────────────────────────────────────────────── */}
//       <button
//         onClick={isOpen ? handleClose : handleOpen}
//         style={{
//           position:"fixed",bottom:"24px",right:"20px",
//           width:"56px",height:"56px",borderRadius:"50%",
//           border:"none",cursor:"pointer",
//           background: isOpen
//             ? "rgba(255,255,255,0.12)"
//             : "linear-gradient(135deg,#c9a96e,#a07840)",
//           boxShadow: isOpen
//             ? "0 4px 20px rgba(0,0,0,0.3)"
//             : "0 8px 30px rgba(201,169,110,0.5)",
//           zIndex:999991,
//           display:"flex",alignItems:"center",justifyContent:"center",
//           fontSize:"24px",
//           transition:"all 0.2s",
//           animation: unread > 0 && !isOpen ? "pulse_bubble 1.4s ease infinite" : "none",
//         }}
//       >
//         <style>{`
//           @keyframes pulse_bubble {
//             0%,100% { transform:scale(1); box-shadow:0 8px 30px rgba(201,169,110,0.5); }
//             50%      { transform:scale(1.1); box-shadow:0 8px 40px rgba(201,169,110,0.8); }
//           }
//         `}</style>

//         {isOpen ? "×" : "💬"}

//         {!isOpen && unread > 0 && (
//           <span style={{
//             position:"absolute",top:"-3px",right:"-3px",
//             minWidth:"20px",height:"20px",borderRadius:"10px",
//             background:"#ef4444",border:"2px solid #080812",
//             color:"white",fontSize:"10px",fontWeight:"800",
//             display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",
//           }}>
//             {unread > 9 ? "9+" : unread}
//           </span>
//         )}
//       </button>
//     </>
//   );
// }

// import { useState, useEffect, useRef, useCallback } from "react";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";
// import { useMessages } from "../hooks/useMessages";
// import { useToast } from "../context/ToastContext";

// export default function ChatBubble() {
//   const user        = useSelector(selectUser);
//   const { showToast } = useToast();
//   const {
//     messages, unread, loading, sending,
//     loadMessages, sendMessage, setUnread, setOpen,
//   } = useMessages(user);

//   const [isOpen,   setIsOpen]   = useState(false);
//   const [input,    setInput]    = useState("");
//   const [animOut,  setAnimOut]  = useState(false);
//   const bottomRef  = useRef(null);
//   const inputRef   = useRef(null);
//   const prevUnread = useRef(0);

//   // ── Reset local state when user changes ────────────────────────────────────
//   // useMessages already clears messages/unread, but we also reset the
//   // prevUnread ref so we don't fire a stale "new message" toast for next user.
//   const prevUserIdRef = useRef(null);
//   useEffect(() => {
//     const uid = user?.id ?? null;
//     if (prevUserIdRef.current !== null && prevUserIdRef.current !== uid) {
//       prevUnread.current = 0;
//       // Close panel if open for a different user
//       setIsOpen(false);
//       setInput("");
//     }
//     prevUserIdRef.current = uid;
//   }, [user?.id]);

//   // ── Toast when new admin message arrives while panel is closed ─────────────
//   useEffect(() => {
//     if (!isOpen && unread > prevUnread.current) {
//       showToast("💬 New message from Support", "info", 5000);
//     }
//     prevUnread.current = unread;
//   }, [unread, isOpen, showToast]);

//   // ── Scroll to bottom on new messages ──────────────────────────────────────
//   useEffect(() => {
//     if (isOpen && bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isOpen]);

//   // ── Open panel ─────────────────────────────────────────────────────────────
//   const handleOpen = useCallback(() => {
//     setAnimOut(false);
//     setIsOpen(true);
//     setOpen(true);
//     loadMessages();
//     setUnread(0);
//     setTimeout(() => inputRef.current?.focus(), 300);
//   }, [loadMessages, setUnread, setOpen]);

//   // ── Close panel ────────────────────────────────────────────────────────────
//   const handleClose = useCallback(() => {
//     setAnimOut(true);
//     setOpen(false);
//     setTimeout(() => { setIsOpen(false); setAnimOut(false); }, 220);
//   }, [setOpen]);

//   // ── Send message ───────────────────────────────────────────────────────────
//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || sending) return;
//     setInput("");
//     const ok = await sendMessage(text);
//     if (ok) {
//       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
//     }
//   }, [input, sending, sendMessage]);

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//   };

//   // Don't render if not logged in
//   if (!user?.token) return null;

//   const timeStr = (d) => d
//     ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
//     : "";

//   return (
//     <>
//       {/* ── Chat panel ──────────────────────────────────────────────────────── */}
//       {isOpen && (
//         <div style={{
//           position:      "fixed",
//           bottom:        "90px",
//           right:         "20px",
//           width:         "min(380px, calc(100vw - 40px))",
//           height:        "480px",
//           zIndex:        999990,
//           display:       "flex",
//           flexDirection: "column",
//           borderRadius:  "20px",
//           overflow:      "hidden",
//           background:    "linear-gradient(180deg,#0f172a,#080812)",
//           border:        "1px solid rgba(201,169,110,0.25)",
//           boxShadow:     "0 20px 60px rgba(0,0,0,0.7)",
//           fontFamily:    "'DM Sans',sans-serif",
//           opacity:       animOut ? 0 : 1,
//           transform:     animOut ? "scale(.88) translateY(10px)" : "scale(1) translateY(0)",
//           transition:    "opacity .22s ease, transform .22s cubic-bezier(.34,1.3,.64,1)",
//         }}>

//           {/* Header */}
//           <div style={{
//             padding:      "14px 18px",
//             background:   "rgba(201,169,110,0.1)",
//             borderBottom: "1px solid rgba(201,169,110,0.2)",
//             display:      "flex", alignItems: "center", gap: "12px", flexShrink: 0,
//           }}>
//             <div style={{
//               width:"38px",height:"38px",borderRadius:"50%",flexShrink:0,
//               background:"linear-gradient(135deg,#c9a96e,#a07840)",
//               display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",
//             }}>🏠</div>
//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize:"14px",fontWeight:"700",color:"#e2e8f0" }}>Support Chat</div>
//               <div style={{ fontSize:"11px",color:"#22c55e",display:"flex",alignItems:"center",gap:"5px" }}>
//                 <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e",display:"inline-block" }}/>
//                 Online · Replies within an hour
//               </div>
//             </div>
//             <button onClick={handleClose} style={{
//               background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",
//               color:"#64748b",width:"30px",height:"30px",borderRadius:"8px",
//               cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",
//             }}>×</button>
//           </div>

//           {/* Messages */}
//           <div style={{
//             flex:1,overflowY:"auto",padding:"16px",
//             display:"flex",flexDirection:"column",gap:"10px",
//           }}>
//             {loading && (
//               <div style={{ textAlign:"center",color:"#475569",fontSize:"13px",padding:"20px" }}>
//                 Loading messages...
//               </div>
//             )}
//             {!loading && messages.length === 0 && (
//               <div style={{ textAlign:"center",padding:"30px 20px" }}>
//                 <div style={{ fontSize:"40px",marginBottom:"10px" }}>👋</div>
//                 <div style={{ fontSize:"14px",fontWeight:"700",color:"#e2e8f0",marginBottom:"6px" }}>
//                   Hi {user?.name?.split(" ")[0]}!
//                 </div>
//                 <div style={{ fontSize:"13px",color:"#475569",lineHeight:1.6 }}>
//                   Have a question about your booking? We're here to help.
//                 </div>
//               </div>
//             )}

//             {messages.map((m) => {
//               const isUser = m.sender === "user";
//               return (
//                 <div key={m.id} style={{ display:"flex",justifyContent:isUser?"flex-end":"flex-start",alignItems:"flex-end",gap:"8px" }}>
//                   {!isUser && (
//                     <div style={{
//                       width:"28px",height:"28px",borderRadius:"50%",flexShrink:0,
//                       background:"linear-gradient(135deg,#c9a96e,#a07840)",
//                       display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",
//                     }}>🏠</div>
//                   )}
//                   <div style={{ maxWidth:"76%" }}>
//                     <div style={{
//                       padding:"10px 13px",
//                       borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
//                       background:   isUser ? "linear-gradient(135deg,#c9a96e,#a07840)" : "rgba(255,255,255,0.08)",
//                       color:        isUser ? "#000" : "#e2e8f0",
//                       fontSize:"13px",lineHeight:1.5,
//                       border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
//                       wordBreak:"break-word",whiteSpace:"pre-wrap",
//                     }}>
//                       {m.message}
//                     </div>
//                     <div style={{
//                       fontSize:"10px",color:"#334155",marginTop:"3px",
//                       textAlign:isUser?"right":"left",
//                       paddingLeft:isUser?0:"4px",
//                     }}>
//                       {timeStr(m.created_at)}{isUser ? " ✓" : ""}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//             <div ref={bottomRef} />
//           </div>

//           {/* Input */}
//           <div style={{
//             padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.07)",
//             display:"flex",gap:"8px",alignItems:"flex-end",flexShrink:0,
//             background:"rgba(0,0,0,0.2)",
//           }}>
//             <textarea
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type a message... (Enter to send)"
//               rows={1}
//               style={{
//                 flex:1,padding:"9px 13px",borderRadius:"10px",resize:"none",
//                 background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",
//                 color:"#e2e8f0",fontSize:"13px",outline:"none",
//                 lineHeight:1.5,maxHeight:"80px",overflowY:"auto",fontFamily:"inherit",
//               }}
//             />
//             <button
//               onClick={handleSend}
//               disabled={sending || !input.trim()}
//               style={{
//                 width:"38px",height:"38px",borderRadius:"10px",border:"none",
//                 cursor: sending || !input.trim() ? "not-allowed" : "pointer",
//                 background: sending || !input.trim()
//                   ? "rgba(201,169,110,0.3)"
//                   : "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color:"#000",fontSize:"16px",
//                 display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
//                 transition:"opacity 0.2s",
//               }}
//             >
//               {sending ? "⏳" : "➤"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Floating bubble ──────────────────────────────────────────────────── */}
//       <button
//         onClick={isOpen ? handleClose : handleOpen}
//         style={{
//           position:"fixed",bottom:"24px",right:"20px",
//           width:"56px",height:"56px",borderRadius:"50%",
//           border:"none",cursor:"pointer",
//           background: isOpen
//             ? "rgba(255,255,255,0.12)"
//             : "linear-gradient(135deg,#c9a96e,#a07840)",
//           boxShadow: isOpen
//             ? "0 4px 20px rgba(0,0,0,0.3)"
//             : "0 8px 30px rgba(201,169,110,0.5)",
//           zIndex:999991,
//           display:"flex",alignItems:"center",justifyContent:"center",
//           fontSize:"24px",
//           transition:"all 0.2s",
//           animation: unread > 0 && !isOpen ? "pulse_bubble 1.4s ease infinite" : "none",
//         }}
//       >
//         <style>{`
//           @keyframes pulse_bubble {
//             0%,100% { transform:scale(1); box-shadow:0 8px 30px rgba(201,169,110,0.5); }
//             50%      { transform:scale(1.1); box-shadow:0 8px 40px rgba(201,169,110,0.8); }
//           }
//         `}</style>

//         {isOpen ? "×" : "💬"}

//         {!isOpen && unread > 0 && (
//           <span style={{
//             position:"absolute",top:"-3px",right:"-3px",
//             minWidth:"20px",height:"20px",borderRadius:"10px",
//             background:"#ef4444",border:"2px solid #080812",
//             color:"white",fontSize:"10px",fontWeight:"800",
//             display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",
//           }}>
//             {unread > 9 ? "9+" : unread}
//           </span>
//         )}
//       </button>
//     </>
//   );
// }


// import { useState, useEffect, useRef, useCallback } from "react";
// import { useSelector } from "react-redux";
// import { selectUser } from "../redux/authSlice";
// import { useMessages } from "../hooks/useMessages";
// import { useToast } from "../context/ToastContext";

// // ── Typing indicator dots ──────────────────────────────────────────────────
// const TypingDots = () => (
//   <div style={{
//     display: "flex", alignItems: "center", gap: "8px",
//     justifyContent: "flex-start",
//   }}>
//     <div style={{
//       width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
//       background: "linear-gradient(135deg,#c9a96e,#a07840)",
//       display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
//     }}>🏠</div>
//     <div style={{
//       padding: "10px 16px",
//       borderRadius: "14px 14px 14px 2px",
//       background: "rgba(255,255,255,0.08)",
//       border: "1px solid rgba(255,255,255,0.08)",
//       display: "flex", alignItems: "center", gap: "4px",
//     }}>
//       {[0, 1, 2].map((i) => (
//         <span key={i} style={{
//           width: "6px", height: "6px", borderRadius: "50%",
//           background: "#c9a96e", display: "inline-block",
//           animation: `typing_dot 1.2s ease infinite`,
//           animationDelay: `${i * 0.2}s`,
//           opacity: 0.4,
//         }} />
//       ))}
//     </div>
//   </div>
// );

// // ── Single message bubble ──────────────────────────────────────────────────
// const MessageBubble = ({ m, timeStr, isNew }) => {
//   const isUser = m.sender === "user";
//   return (
//     <div style={{
//       display: "flex",
//       justifyContent: isUser ? "flex-end" : "flex-start",
//       alignItems: "flex-end",
//       gap: "8px",
//       animation: isNew ? "msg_in .28s cubic-bezier(.34,1.3,.64,1) forwards" : "none",
//     }}>
//       {!isUser && (
//         <div style={{
//           width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
//           background: "linear-gradient(135deg,#c9a96e,#a07840)",
//           display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
//         }}>🏠</div>
//       )}
//       <div style={{ maxWidth: "76%" }}>
//         <div style={{
//           padding: "10px 13px",
//           borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
//           background: isUser
//             ? "linear-gradient(135deg,#c9a96e,#a07840)"
//             : "rgba(255,255,255,0.08)",
//           color: isUser ? "#000" : "#e2e8f0",
//           fontSize: "13px", lineHeight: 1.5,
//           border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
//           wordBreak: "break-word", whiteSpace: "pre-wrap",
//           boxShadow: isUser
//             ? "0 2px 12px rgba(201,169,110,0.3)"
//             : "0 2px 8px rgba(0,0,0,0.2)",
//         }}>
//           {m.message}
//         </div>
//         <div style={{
//           fontSize: "10px", color: "#334155", marginTop: "3px",
//           textAlign: isUser ? "right" : "left",
//           paddingLeft: isUser ? 0 : "4px",
//           display: "flex", alignItems: "center",
//           justifyContent: isUser ? "flex-end" : "flex-start",
//           gap: "3px",
//         }}>
//           <span>{timeStr(m.created_at)}</span>
//           {isUser && (
//             <span style={{ color: "#c9a96e", fontSize: "11px" }}>✓✓</span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function ChatBubble() {
//   const user          = useSelector(selectUser);
//   const { showToast } = useToast();
//   const {
//     messages, unread, loading, sending,
//     loadMessages, sendMessage, setUnread, setOpen,
//   } = useMessages(user);

//   const [isOpen,       setIsOpen]       = useState(false);
//   const [input,        setInput]        = useState("");
//   const [animOut,      setAnimOut]      = useState(false);
//   const [isTyping,     setIsTyping]     = useState(false);   // admin typing indicator
//   const [newMsgIds,    setNewMsgIds]    = useState(new Set()); // for entry animations
//   const [bubblePop,    setBubblePop]    = useState(false);   // bubble pop on new msg
//   const [inputFocused, setInputFocused] = useState(false);
//   const bottomRef     = useRef(null);
//   const inputRef      = useRef(null);
//   const prevUnread    = useRef(0);
//   const prevMsgCount  = useRef(0);
//   const prevUserIdRef = useRef(null);
//   const typingTimer   = useRef(null);

//   // ── Reset on user change ───────────────────────────────────────────────────
//   useEffect(() => {
//     const uid = user?.id ?? null;
//     if (prevUserIdRef.current !== null && prevUserIdRef.current !== uid) {
//       prevUnread.current   = 0;
//       prevMsgCount.current = 0;
//       setIsOpen(false);
//       setInput("");
//       setIsTyping(false);
//       setNewMsgIds(new Set());
//     }
//     prevUserIdRef.current = uid;
//   }, [user?.id]);

//   // ── Simulate admin typing before a new admin message ──────────────────────
//   useEffect(() => {
//     const newCount = messages.length;
//     if (newCount > prevMsgCount.current && prevMsgCount.current > 0) {
//       // Detect new admin messages
//       const newAdminMsgs = messages.slice(prevMsgCount.current).filter(m => m.sender !== "user");
//       if (newAdminMsgs.length > 0) {
//         // Mark them as "new" for animation
//         setNewMsgIds(prev => {
//           const next = new Set(prev);
//           newAdminMsgs.forEach(m => next.add(m.id));
//           return next;
//         });
//         // Clear new flag after animation
//         setTimeout(() => {
//           setNewMsgIds(prev => {
//             const next = new Set(prev);
//             newAdminMsgs.forEach(m => next.delete(m.id));
//             return next;
//           });
//         }, 600);
//       }
//     }
//     prevMsgCount.current = newCount;
//   }, [messages]);

//   // ── Toast + bubble pop on new unread ──────────────────────────────────────
//   useEffect(() => {
//     if (!isOpen && unread > prevUnread.current) {
//       showToast("💬 New message from Support", "info", 5000);
//       setBubblePop(true);
//       setTimeout(() => setBubblePop(false), 600);
//     }
//     prevUnread.current = unread;
//   }, [unread, isOpen, showToast]);

//   // ── Simulate admin typing indicator (shows after user sends) ──────────────
//   // In a real system you'd get this from a websocket/polling endpoint.
//   // Here we simulate it: show "typing..." for ~2s after user sends a message.
//   const simulateAdminTyping = useCallback(() => {
//     clearTimeout(typingTimer.current);
//     setIsTyping(true);
//     typingTimer.current = setTimeout(() => setIsTyping(false), 2500);
//   }, []);

//   // ── Scroll to bottom ───────────────────────────────────────────────────────
//   useEffect(() => {
//     if (isOpen && bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isOpen, isTyping]);

//   // ── Open ───────────────────────────────────────────────────────────────────
//   const handleOpen = useCallback(() => {
//     setAnimOut(false);
//     setIsOpen(true);
//     setOpen(true);
//     loadMessages();
//     setUnread(0);
//     setTimeout(() => inputRef.current?.focus(), 300);
//   }, [loadMessages, setUnread, setOpen]);

//   // ── Close ──────────────────────────────────────────────────────────────────
//   const handleClose = useCallback(() => {
//     setAnimOut(true);
//     setOpen(false);
//     setTimeout(() => { setIsOpen(false); setAnimOut(false); }, 220);
//   }, [setOpen]);

//   // ── Send ───────────────────────────────────────────────────────────────────
//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || sending) return;
//     setInput("");
//     const ok = await sendMessage(text);
//     if (ok) {
//       simulateAdminTyping();
//       setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
//     }
//   }, [input, sending, sendMessage, simulateAdminTyping]);

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//   };

//   if (!user?.token) return null;

//   const timeStr = (d) => d
//     ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
//     : "";

//   return (
//     <>
//       <style>{`
//         @keyframes typing_dot {
//           0%,60%,100% { transform:translateY(0); opacity:0.4; }
//           30%          { transform:translateY(-5px); opacity:1; }
//         }
//         @keyframes msg_in {
//           0%   { opacity:0; transform:translateY(8px) scale(.95); }
//           100% { opacity:1; transform:translateY(0)   scale(1); }
//         }
//         @keyframes panel_in {
//           0%   { opacity:0; transform:scale(.88) translateY(16px); }
//           100% { opacity:1; transform:scale(1)   translateY(0); }
//         }
//         @keyframes pulse_bubble {
//           0%,100% { transform:scale(1);   box-shadow:0 8px 30px rgba(201,169,110,0.5); }
//           50%     { transform:scale(1.1); box-shadow:0 8px 40px rgba(201,169,110,0.8); }
//         }
//         @keyframes bubble_pop {
//           0%   { transform:scale(1); }
//           40%  { transform:scale(1.22); }
//           70%  { transform:scale(.94); }
//           100% { transform:scale(1); }
//         }
//         @keyframes online_pulse {
//           0%,100% { opacity:1; transform:scale(1); }
//           50%     { opacity:.5; transform:scale(1.5); }
//         }
//         @keyframes badge_in {
//           0%   { transform:scale(0); }
//           70%  { transform:scale(1.2); }
//           100% { transform:scale(1); }
//         }
//         .chat-input:focus { outline:none; border-color:rgba(201,169,110,0.5) !important; }
//         .chat-input::placeholder { color:#334155; }
//         .chat-scroll::-webkit-scrollbar { width:4px; }
//         .chat-scroll::-webkit-scrollbar-track { background:transparent; }
//         .chat-scroll::-webkit-scrollbar-thumb { background:rgba(201,169,110,0.2); border-radius:4px; }
//         .chat-scroll::-webkit-scrollbar-thumb:hover { background:rgba(201,169,110,0.4); }
//       `}</style>

//       {/* ── Chat panel ──────────────────────────────────────────────────────── */}
//       {isOpen && (
//         <div style={{
//           position:      "fixed",
//           bottom:        "90px",
//           right:         "20px",
//           width:         "min(380px, calc(100vw - 40px))",
//           height:        "500px",
//           zIndex:        999990,
//           display:       "flex",
//           flexDirection: "column",
//           borderRadius:  "22px",
//           overflow:      "hidden",
//           background:    "linear-gradient(180deg,#0d1424 0%,#080812 100%)",
//           border:        "1px solid rgba(201,169,110,0.2)",
//           boxShadow:     "0 24px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)",
//           fontFamily:    "'DM Sans',sans-serif",
//           opacity:       animOut ? 0 : 1,
//           transform:     animOut ? "scale(.88) translateY(10px)" : "scale(1) translateY(0)",
//           transition:    animOut
//             ? "opacity .22s ease, transform .22s ease"
//             : "none",
//           animation:     animOut ? "none" : "panel_in .3s cubic-bezier(.34,1.2,.64,1) forwards",
//         }}>

//           {/* ── Header ─────────────────────────────────────────────────────── */}
//           <div style={{
//             padding:    "14px 18px",
//             background: "linear-gradient(135deg,rgba(201,169,110,0.14),rgba(201,169,110,0.06))",
//             borderBottom: "1px solid rgba(201,169,110,0.15)",
//             display: "flex", alignItems: "center", gap: "12px", flexShrink: 0,
//           }}>
//             {/* Avatar with online ring */}
//             <div style={{ position: "relative", flexShrink: 0 }}>
//               <div style={{
//                 width: "40px", height: "40px", borderRadius: "50%",
//                 background: "linear-gradient(135deg,#c9a96e,#a07840)",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: "18px", border: "2px solid rgba(201,169,110,0.4)",
//               }}>🏠</div>
//               {/* Online indicator */}
//               <span style={{
//                 position: "absolute", bottom: "1px", right: "1px",
//                 width: "10px", height: "10px", borderRadius: "50%",
//                 background: "#22c55e",
//                 border: "2px solid #0d1424",
//                 boxShadow: "0 0 0 0 rgba(34,197,94,0.4)",
//                 animation: "online_pulse 2s ease infinite",
//               }} />
//             </div>

//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>
//                 Support Chat
//               </div>
//               <div style={{
//                 fontSize: "11px", color: "#22c55e",
//                 display: "flex", alignItems: "center", gap: "5px",
//               }}>
//                 {isTyping ? (
//                   <span style={{ color: "#c9a96e", fontStyle: "italic" }}>
//                     Support is typing...
//                   </span>
//                 ) : (
//                   <>
//                     <span style={{
//                       width: "6px", height: "6px", borderRadius: "50%",
//                       background: "#22c55e", display: "inline-block",
//                     }} />
//                     Online · Replies within an hour
//                   </>
//                 )}
//               </div>
//             </div>

//             <button onClick={handleClose} style={{
//               background: "rgba(255,255,255,0.07)",
//               border: "1px solid rgba(255,255,255,0.1)",
//               color: "#64748b", width: "32px", height: "32px", borderRadius: "10px",
//               cursor: "pointer", fontSize: "18px",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               transition: "background 0.15s",
//             }}
//               onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
//               onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
//             >×</button>
//           </div>

//           {/* ── Messages ───────────────────────────────────────────────────── */}
//           <div className="chat-scroll" style={{
//             flex: 1, overflowY: "auto", padding: "16px",
//             display: "flex", flexDirection: "column", gap: "10px",
//           }}>
//             {loading && (
//               <div style={{
//                 textAlign: "center", color: "#475569", fontSize: "13px",
//                 padding: "30px 20px",
//               }}>
//                 <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
//                 Loading messages...
//               </div>
//             )}

//             {!loading && messages.length === 0 && (
//               <div style={{ textAlign: "center", padding: "30px 20px" }}>
//                 <div style={{ fontSize: "44px", marginBottom: "12px" }}>👋</div>
//                 <div style={{
//                   fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px",
//                 }}>
//                   Hi {user?.name?.split(" ")[0]}!
//                 </div>
//                 <div style={{
//                   fontSize: "13px", color: "#475569", lineHeight: 1.7,
//                   background: "rgba(255,255,255,0.03)",
//                   border: "1px solid rgba(255,255,255,0.06)",
//                   borderRadius: "12px", padding: "12px 14px",
//                 }}>
//                   Have a question about your booking or unit?<br />
//                   We typically reply within an hour. 🕐
//                 </div>
//               </div>
//             )}

//             {/* Date separators + messages */}
//             {messages.reduce((acc, m, idx) => {
//               const date = m.created_at
//                 ? new Date(m.created_at).toLocaleDateString("en-IN", {
//                     day: "numeric", month: "short", year: "numeric",
//                   })
//                 : null;
//               const prevDate = idx > 0 && messages[idx - 1].created_at
//                 ? new Date(messages[idx - 1].created_at).toLocaleDateString("en-IN", {
//                     day: "numeric", month: "short", year: "numeric",
//                   })
//                 : null;

//               if (date && date !== prevDate) {
//                 acc.push(
//                   <div key={`sep-${idx}`} style={{
//                     display: "flex", alignItems: "center", gap: "10px",
//                     margin: "6px 0",
//                   }}>
//                     <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
//                     <span style={{
//                       fontSize: "10px", color: "#334155", fontWeight: "600",
//                       padding: "2px 10px", borderRadius: "10px",
//                       background: "rgba(255,255,255,0.04)",
//                       border: "1px solid rgba(255,255,255,0.06)",
//                       whiteSpace: "nowrap",
//                     }}>{date}</span>
//                     <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
//                   </div>
//                 );
//               }

//               acc.push(
//                 <MessageBubble
//                   key={m.id}
//                   m={m}
//                   timeStr={timeStr}
//                   isNew={newMsgIds.has(m.id)}
//                 />
//               );
//               return acc;
//             }, [])}

//             {/* Typing indicator */}
//             {isTyping && <TypingDots />}

//             <div ref={bottomRef} />
//           </div>

//           {/* ── Input ──────────────────────────────────────────────────────── */}
//           <div style={{
//             padding: "10px 12px",
//             borderTop: "1px solid rgba(255,255,255,0.07)",
//             display: "flex", gap: "8px", alignItems: "flex-end", flexShrink: 0,
//             background: "rgba(0,0,0,0.25)",
//           }}>
//             <textarea
//               ref={inputRef}
//               className="chat-input"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               onFocus={() => setInputFocused(true)}
//               onBlur={() => setInputFocused(false)}
//               placeholder="Type a message..."
//               rows={1}
//               style={{
//                 flex: 1, padding: "10px 13px", borderRadius: "12px", resize: "none",
//                 background: inputFocused
//                   ? "rgba(255,255,255,0.09)"
//                   : "rgba(255,255,255,0.06)",
//                 border: `1px solid ${inputFocused ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.08)"}`,
//                 color: "#e2e8f0", fontSize: "13px",
//                 lineHeight: 1.5, maxHeight: "80px", overflowY: "auto",
//                 fontFamily: "inherit", outline: "none",
//                 transition: "border-color 0.15s, background 0.15s",
//               }}
//             />
//             <button
//               onClick={handleSend}
//               disabled={sending || !input.trim()}
//               style={{
//                 width: "40px", height: "40px", borderRadius: "12px", border: "none",
//                 cursor: sending || !input.trim() ? "not-allowed" : "pointer",
//                 background: sending || !input.trim()
//                   ? "rgba(201,169,110,0.2)"
//                   : "linear-gradient(135deg,#c9a96e,#a07840)",
//                 color: sending || !input.trim() ? "rgba(201,169,110,0.4)" : "#000",
//                 fontSize: "17px",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 flexShrink: 0,
//                 transition: "all 0.15s",
//                 transform: input.trim() && !sending ? "scale(1.04)" : "scale(1)",
//                 boxShadow: input.trim() && !sending
//                   ? "0 4px 14px rgba(201,169,110,0.35)"
//                   : "none",
//               }}
//             >
//               {sending ? "⏳" : "➤"}
//             </button>
//           </div>

//           {/* ── "Press Enter to send" hint ─────────────────────────────────── */}
//           {inputFocused && input.trim() && (
//             <div style={{
//               textAlign: "center", fontSize: "10px", color: "#334155",
//               paddingBottom: "6px", background: "rgba(0,0,0,0.25)",
//               marginTop: "-2px",
//             }}>
//               Press <kbd style={{
//                 padding: "1px 5px", borderRadius: "4px",
//                 background: "rgba(255,255,255,0.07)",
//                 border: "1px solid rgba(255,255,255,0.1)",
//                 fontFamily: "monospace",
//               }}>Enter</kbd> to send · <kbd style={{
//                 padding: "1px 5px", borderRadius: "4px",
//                 background: "rgba(255,255,255,0.07)",
//                 border: "1px solid rgba(255,255,255,0.1)",
//                 fontFamily: "monospace",
//               }}>Shift+Enter</kbd> for newline
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Floating bubble ─────────────────────────────────────────────────── */}
//       <button
//         onClick={isOpen ? handleClose : handleOpen}
//         style={{
//           position: "fixed", bottom: "24px", right: "20px",
//           width: "58px", height: "58px", borderRadius: "50%",
//           border: "none", cursor: "pointer",
//           background: isOpen
//             ? "rgba(30,30,50,0.95)"
//             : "linear-gradient(135deg,#c9a96e,#a07840)",
//           boxShadow: isOpen
//             ? "0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)"
//             : "0 8px 30px rgba(201,169,110,0.5), 0 2px 8px rgba(0,0,0,0.3)",
//           zIndex: 999991,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           fontSize: "24px",
//           transition: "background 0.2s, box-shadow 0.2s",
//           animation: bubblePop
//             ? "bubble_pop .5s ease forwards"
//             : (unread > 0 && !isOpen ? "pulse_bubble 1.6s ease infinite" : "none"),
//         }}
//       >
//         {/* Outer ring when not open */}
//         {!isOpen && (
//           <span style={{
//             position: "absolute", inset: "-4px", borderRadius: "50%",
//             border: "2px solid rgba(201,169,110,0.3)",
//             animation: "online_pulse 2.5s ease infinite",
//             pointerEvents: "none",
//           }} />
//         )}

//         <span style={{
//           transition: "transform 0.2s, opacity 0.15s",
//           transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
//           display: "inline-block",
//           lineHeight: 1,
//         }}>
//           {isOpen ? "×" : "💬"}
//         </span>

//         {/* Unread badge */}
//         {!isOpen && unread > 0 && (
//           <span style={{
//             position: "absolute", top: "-4px", right: "-4px",
//             minWidth: "20px", height: "20px", borderRadius: "10px",
//             background: "#ef4444",
//             border: "2px solid #080812",
//             color: "white", fontSize: "10px", fontWeight: "800",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             padding: "0 4px",
//             animation: "badge_in .3s cubic-bezier(.34,1.5,.64,1) forwards",
//           }}>
//             {unread > 9 ? "9+" : unread}
//           </span>
//         )}
//       </button>
//     </>
//   );
// }


import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import { useMessages } from "../hooks/useMessages";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// ── Typing indicator dots ──────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display:"flex", alignItems:"center", gap:"8px", justifyContent:"flex-start" }}>
    <div style={{
      width:"28px", height:"28px", borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#c9a96e,#a07840)",
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px",
    }}>🏠</div>
    <div style={{
      padding:"10px 16px",
      borderRadius:"14px 14px 14px 2px",
      background:"rgba(255,255,255,0.08)",
      border:"1px solid rgba(255,255,255,0.08)",
      display:"flex", alignItems:"center", gap:"4px",
    }}>
      {[0,1,2].map((i) => (
        <span key={i} style={{
          width:"6px", height:"6px", borderRadius:"50%",
          background:"#c9a96e", display:"inline-block",
          animation:"typing_dot 1.2s ease infinite",
          animationDelay:`${i * 0.2}s`,
          opacity:0.4,
        }} />
      ))}
    </div>
  </div>
);

// ── Single message bubble ──────────────────────────────────────────────────
const MessageBubble = ({ m, timeStr, isNew }) => {
  const isUser = m.sender === "user";
  return (
    <div style={{
      display:"flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      alignItems:"flex-end",
      gap:"8px",
      animation: isNew ? "msg_in .28s cubic-bezier(.34,1.3,.64,1) forwards" : "none",
    }}>
      {!isUser && (
        <div style={{
          width:"28px", height:"28px", borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#c9a96e,#a07840)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px",
        }}>🏠</div>
      )}
      <div style={{ maxWidth:"76%" }}>
        <div style={{
          padding:"10px 13px",
          borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
          background: isUser ? "linear-gradient(135deg,#c9a96e,#a07840)" : "rgba(255,255,255,0.08)",
          color: isUser ? "#000" : "#e2e8f0",
          fontSize:"13px", lineHeight:1.5,
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
          wordBreak:"break-word", whiteSpace:"pre-wrap",
          boxShadow: isUser ? "0 2px 12px rgba(201,169,110,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
        }}>
          {m.message}
        </div>
        <div style={{
          fontSize:"10px", color:"#334155", marginTop:"3px",
          textAlign: isUser ? "right" : "left",
          paddingLeft: isUser ? 0 : "4px",
          display:"flex", alignItems:"center",
          justifyContent: isUser ? "flex-end" : "flex-start",
          gap:"3px",
        }}>
          <span>{timeStr(m.created_at)}</span>
          {isUser && <span style={{ color:"#c9a96e", fontSize:"11px" }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
};

export default function ChatBubble() {
  const user          = useSelector(selectUser);
  const { showToast } = useToast();
  const {
    messages, unread, loading, sending,
    loadMessages, sendMessage, setUnread, setOpen,
  } = useMessages(user);

  const [isOpen,        setIsOpen]        = useState(false);
  const [input,         setInput]         = useState("");
  const [animOut,       setAnimOut]       = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [newMsgIds,     setNewMsgIds]     = useState(new Set());
  const [bubblePop,     setBubblePop]     = useState(false);
  const [inputFocused,  setInputFocused]  = useState(false);

  const bottomRef       = useRef(null);
  const inputRef        = useRef(null);
  const prevUnread      = useRef(0);
  const prevMsgCount    = useRef(0);
  const prevUserIdRef   = useRef(null);
  const typingPollRef   = useRef(null);
  const userTypingTimer = useRef(null);

  // ── Reset on user change ───────────────────────────────────────────────────
  useEffect(() => {
    const uid = user?.id ?? null;
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== uid) {
      prevUnread.current   = 0;
      prevMsgCount.current = 0;
      setIsOpen(false);
      setInput("");
      setIsAdminTyping(false);
      setNewMsgIds(new Set());
    }
    prevUserIdRef.current = uid;
  }, [user?.id]);

  // ── Poll admin typing every 2s while panel is open ────────────────────────
  const startTypingPoll = useCallback(() => {
    if (typingPollRef.current) clearInterval(typingPollRef.current);
    typingPollRef.current = setInterval(async () => {
      if (!user?.token) return;
      try {
        const res  = await fetch(`${API_BASE}/messages/typing`, {
          headers: { Authorization:`Bearer ${user.token}`, Accept:"application/json" },
        });
        const data = await res.json();
        setIsAdminTyping(data.typing === true);
      } catch (_) {}
    }, 2000);
  }, [user?.token]);

  const stopTypingPoll = useCallback(() => {
    if (typingPollRef.current) { clearInterval(typingPollRef.current); typingPollRef.current = null; }
    setIsAdminTyping(false);
  }, []);

  // Cleanup
  useEffect(() => () => { stopTypingPoll(); clearTimeout(userTypingTimer.current); }, [stopTypingPoll]);

  // ── Send user typing signal (debounced 300ms) ──────────────────────────────
  const sendUserTypingSignal = useCallback(() => {
    if (!user?.token) return;
    clearTimeout(userTypingTimer.current);
    userTypingTimer.current = setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/messages/typing`, {
          method:"POST",
          headers: { Authorization:`Bearer ${user.token}`, "Content-Type":"application/json" },
        });
      } catch (_) {}
    }, 300);
  }, [user?.token]);

  // ── Animate new admin messages + hide typing when they reply ──────────────
  useEffect(() => {
    const newCount = messages.length;
    if (newCount > prevMsgCount.current && prevMsgCount.current > 0) {
      const newAdminMsgs = messages.slice(prevMsgCount.current).filter(m => m.sender !== "user");
      if (newAdminMsgs.length > 0) {
        setIsAdminTyping(false); // admin sent message → hide typing dots
        setNewMsgIds(prev => {
          const next = new Set(prev);
          newAdminMsgs.forEach(m => next.add(m.id));
          return next;
        });
        setTimeout(() => {
          setNewMsgIds(prev => {
            const next = new Set(prev);
            newAdminMsgs.forEach(m => next.delete(m.id));
            return next;
          });
        }, 600);
      }
    }
    prevMsgCount.current = newCount;
  }, [messages]);

  // ── Toast + bubble pop on new unread ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen && unread > prevUnread.current) {
      showToast("💬 New message from Support", "info", 5000);
      setBubblePop(true);
      setTimeout(() => setBubblePop(false), 600);
    }
    prevUnread.current = unread;
  }, [unread, isOpen, showToast]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior:"smooth" });
    }
  }, [messages, isOpen, isAdminTyping]);

  // ── Open ───────────────────────────────────────────────────────────────────
  // const handleOpen = useCallback(() => {
  //   setAnimOut(false);
  //   setIsOpen(true);
  //   setOpen(true);
  //   loadMessages();
  //   setUnread(0);
  //   // startTypingPoll();
  //   setTimeout(() => inputRef.current?.focus(), 300);
  // }, [loadMessages, setUnread, setOpen, startTypingPoll]);

  // // ── Close ──────────────────────────────────────────────────────────────────
  // const handleClose = useCallback(() => {
  //   setAnimOut(true);
  //   setOpen(false);
  //   // stopTypingPoll();
  //   setTimeout(() => { setIsOpen(false); setAnimOut(false); }, 220);
  // }, [setOpen, stopTypingPoll]);

  const handleOpen = useCallback(() => {
    setAnimOut(false);
    setIsOpen(true);
    setOpen(true);
    loadMessages();
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 300);
}, [loadMessages, setUnread, setOpen]);

// handleClose becomes:
const handleClose = useCallback(() => {
    setAnimOut(true);
    setOpen(false);
    setTimeout(() => { setIsOpen(false); setAnimOut(false); }, 220);
}, [setOpen]);

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    clearTimeout(userTypingTimer.current);
    const ok = await sendMessage(text);
    if (ok) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 80);
  }, [input, sending, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim()) sendUserTypingSignal();
  };

  if (!user?.token) return null;

  const timeStr = (d) => d
    ? new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })
    : "";

  return (
    <>
      <style>{`
        @keyframes typing_dot {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes msg_in {
          0%   { opacity:0; transform:translateY(8px) scale(.95); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes panel_in {
          0%   { opacity:0; transform:scale(.88) translateY(16px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes pulse_bubble {
          0%,100% { transform:scale(1); box-shadow:0 8px 30px rgba(201,169,110,0.5); }
          50%     { transform:scale(1.1); box-shadow:0 8px 40px rgba(201,169,110,0.8); }
        }
        @keyframes bubble_pop {
          0%   { transform:scale(1); }
          40%  { transform:scale(1.22); }
          70%  { transform:scale(.94); }
          100% { transform:scale(1); }
        }
        @keyframes online_pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.4; transform:scale(1.6); }
        }
        @keyframes badge_in {
          0%   { transform:scale(0); }
          70%  { transform:scale(1.2); }
          100% { transform:scale(1); }
        }
        @keyframes typing_appear {
          0%   { opacity:0; transform:translateY(6px); }
          100% { opacity:1; transform:translateY(0); }
        }
        .chat-input::placeholder { color:#334155; }
        .chat-scroll::-webkit-scrollbar { width:4px; }
        .chat-scroll::-webkit-scrollbar-track { background:transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background:rgba(201,169,110,0.2); border-radius:4px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background:rgba(201,169,110,0.4); }
        .typing-appear { animation: typing_appear 0.2s ease forwards; }
      `}</style>

      {isOpen && (
        <div style={{
          position:"fixed", bottom:"90px", right:"20px",
          width:"min(380px, calc(100vw - 40px))", height:"500px",
          zIndex:999990, display:"flex", flexDirection:"column",
          borderRadius:"22px", overflow:"hidden",
          background:"linear-gradient(180deg,#0d1424 0%,#080812 100%)",
          border:"1px solid rgba(201,169,110,0.2)",
          boxShadow:"0 24px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)",
          fontFamily:"'DM Sans',sans-serif",
          opacity: animOut ? 0 : 1,
          transform: animOut ? "scale(.88) translateY(10px)" : "scale(1) translateY(0)",
          transition: animOut ? "opacity .22s ease, transform .22s ease" : "none",
          animation: animOut ? "none" : "panel_in .3s cubic-bezier(.34,1.2,.64,1) forwards",
        }}>

          {/* Header */}
          <div style={{
            padding:"14px 18px",
            background:"linear-gradient(135deg,rgba(201,169,110,0.14),rgba(201,169,110,0.06))",
            borderBottom:"1px solid rgba(201,169,110,0.15)",
            display:"flex", alignItems:"center", gap:"12px", flexShrink:0,
          }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{
                width:"40px", height:"40px", borderRadius:"50%",
                background:"linear-gradient(135deg,#c9a96e,#a07840)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"18px", border:"2px solid rgba(201,169,110,0.4)",
              }}>🏠</div>
              <span style={{
                position:"absolute", bottom:"1px", right:"1px",
                width:"10px", height:"10px", borderRadius:"50%",
                background:"#22c55e", border:"2px solid #0d1424",
                animation:"online_pulse 2s ease infinite",
              }} />
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#e2e8f0" }}>Support Chat</div>
              <div style={{
                fontSize:"11px", minHeight:"16px",
                display:"flex", alignItems:"center", gap:"5px",
                color: isAdminTyping ? "#c9a96e" : "#22c55e",
                transition:"color 0.3s",
              }}>
                {isAdminTyping ? (
                  <span style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <span style={{ fontStyle:"italic" }}>Support is typing</span>
                    <span style={{ display:"flex", gap:"3px", alignItems:"center" }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{
                          width:"4px", height:"4px", borderRadius:"50%",
                          background:"#c9a96e", display:"inline-block",
                          animation:"typing_dot 1.2s ease infinite",
                          animationDelay:`${i*0.2}s`,
                        }} />
                      ))}
                    </span>
                  </span>
                ) : (
                  <>
                    <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                    Online · Replies within an hour
                  </>
                )}
              </div>
            </div>

            <button onClick={handleClose} style={{
              background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
              color:"#64748b", width:"32px", height:"32px", borderRadius:"10px",
              cursor:"pointer", fontSize:"18px",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}
            >×</button>
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{
            flex:1, overflowY:"auto", padding:"16px",
            display:"flex", flexDirection:"column", gap:"10px",
          }}>
            {loading && (
              <div style={{ textAlign:"center", color:"#475569", fontSize:"13px", padding:"30px 20px" }}>
                <div style={{ fontSize:"28px", marginBottom:"8px" }}>💬</div>Loading messages...
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div style={{ textAlign:"center", padding:"30px 20px" }}>
                <div style={{ fontSize:"44px", marginBottom:"12px" }}>👋</div>
                <div style={{ fontSize:"15px", fontWeight:"700", color:"#e2e8f0", marginBottom:"8px" }}>
                  Hi {user?.name?.split(" ")[0]}!
                </div>
                <div style={{
                  fontSize:"13px", color:"#475569", lineHeight:1.7,
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:"12px", padding:"12px 14px",
                }}>
                  Have a question about your booking?<br />We typically reply within an hour. 🕐
                </div>
              </div>
            )}

            {messages.reduce((acc, m, idx) => {
              const date     = m.created_at ? new Date(m.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : null;
              const prevDate = idx > 0 && messages[idx-1].created_at ? new Date(messages[idx-1].created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : null;
              if (date && date !== prevDate) {
                acc.push(
                  <div key={`sep-${idx}`} style={{ display:"flex", alignItems:"center", gap:"10px", margin:"6px 0" }}>
                    <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.06)" }} />
                    <span style={{ fontSize:"10px", color:"#334155", fontWeight:"600", padding:"2px 10px", borderRadius:"10px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap" }}>{date}</span>
                    <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.06)" }} />
                  </div>
                );
              }
              acc.push(<MessageBubble key={m.id} m={m} timeStr={timeStr} isNew={newMsgIds.has(m.id)} />);
              return acc;
            }, [])}

            {/* Real typing — only shown when admin IS actually typing */}
            {isAdminTyping && (
              <div className="typing-appear"><TypingDots /></div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding:"10px 12px", borderTop:"1px solid rgba(255,255,255,0.07)",
            display:"flex", gap:"8px", alignItems:"flex-end", flexShrink:0,
            background:"rgba(0,0,0,0.25)",
          }}>
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type a message..."
              rows={1}
              style={{
                flex:1, padding:"10px 13px", borderRadius:"12px", resize:"none",
                background: inputFocused ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.06)",
                border:`1px solid ${inputFocused ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.08)"}`,
                color:"#e2e8f0", fontSize:"13px",
                lineHeight:1.5, maxHeight:"80px", overflowY:"auto",
                fontFamily:"inherit", outline:"none",
                transition:"border-color 0.15s, background 0.15s",
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              style={{
                width:"40px", height:"40px", borderRadius:"12px", border:"none",
                cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                background: sending || !input.trim() ? "rgba(201,169,110,0.2)" : "linear-gradient(135deg,#c9a96e,#a07840)",
                color: sending || !input.trim() ? "rgba(201,169,110,0.4)" : "#000",
                fontSize:"17px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                transition:"all 0.15s",
                transform: input.trim() && !sending ? "scale(1.04)" : "scale(1)",
                boxShadow: input.trim() && !sending ? "0 4px 14px rgba(201,169,110,0.35)" : "none",
              }}
            >{sending ? "⏳" : "➤"}</button>
          </div>

          {inputFocused && input.trim() && (
            <div style={{ textAlign:"center", fontSize:"10px", color:"#334155", paddingBottom:"6px", background:"rgba(0,0,0,0.25)", marginTop:"-2px" }}>
              Press <kbd style={{ padding:"1px 5px", borderRadius:"4px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"monospace" }}>Enter</kbd> to send ·{" "}
              <kbd style={{ padding:"1px 5px", borderRadius:"4px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"monospace" }}>Shift+Enter</kbd> for newline
            </div>
          )}
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        style={{
          position:"fixed", bottom:"24px", right:"20px",
          width:"58px", height:"58px", borderRadius:"50%",
          border:"none", cursor:"pointer",
          background: isOpen ? "rgba(30,30,50,0.95)" : "linear-gradient(135deg,#c9a96e,#a07840)",
          boxShadow: isOpen
            ? "0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)"
            : "0 8px 30px rgba(201,169,110,0.5), 0 2px 8px rgba(0,0,0,0.3)",
          zIndex:999991, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"24px", transition:"background 0.2s, box-shadow 0.2s",
          animation: bubblePop ? "bubble_pop .5s ease forwards" : (unread > 0 && !isOpen ? "pulse_bubble 1.6s ease infinite" : "none"),
        }}
      >
        {!isOpen && (
          <span style={{ position:"absolute", inset:"-4px", borderRadius:"50%", border:"2px solid rgba(201,169,110,0.3)", animation:"online_pulse 2.5s ease infinite", pointerEvents:"none" }} />
        )}
        <span style={{ transition:"transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", display:"inline-block", lineHeight:1 }}>
          {isOpen ? "×" : "💬"}
        </span>
        {!isOpen && unread > 0 && (
          <span style={{ position:"absolute", top:"-4px", right:"-4px", minWidth:"20px", height:"20px", borderRadius:"10px", background:"#ef4444", border:"2px solid #080812", color:"white", fontSize:"10px", fontWeight:"800", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px", animation:"badge_in .3s cubic-bezier(.34,1.5,.64,1) forwards" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
