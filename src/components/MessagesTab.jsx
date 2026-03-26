// import { useState, useEffect, useRef } from "react";
// import { useMessages } from "../hooks/useMessages";

// export default function MessagesTab({ user }) {
//   const {
//     messages, loading, sending,
//     loadMessages, sendMessage, setOpen,
//   } = useMessages(user);

//   const [input,   setInput]   = useState("");
//   const bottomRef = useRef(null);
//   const inputRef  = useRef(null);

//   // Mark as open so polling fetches full messages (not just unread count)
//   useEffect(() => {
//     setOpen(true);
//     loadMessages();
//     return () => setOpen(false);
//   }, [loadMessages, setOpen]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     if (bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const handleSend = async () => {
//     const text = input.trim();
//     if (!text || sending) return;
//     setInput("");
//     await sendMessage(text);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//   };

//   // Group messages by date for display
//   const grouped = messages.reduce((acc, m) => {
//     const day = new Date(m.created_at).toLocaleDateString("en-IN", {
//       day: "numeric", month: "long", year: "numeric",
//     });
//     if (!acc[day]) acc[day] = [];
//     acc[day].push(m);
//     return acc;
//   }, {});

//   return (
//     <div style={{
//       display:"flex",flexDirection:"column",
//       height:"560px",
//       background:"rgba(255,255,255,0.02)",
//       border:"1px solid rgba(255,255,255,0.07)",
//       borderRadius:"16px",overflow:"hidden",
//       fontFamily:"'DM Sans',sans-serif",
//     }}>

//       {/* ── Header ─────────────────────────────────────────────────────────── */}
//       <div style={{
//         padding:"16px 20px",
//         borderBottom:"1px solid rgba(255,255,255,0.07)",
//         display:"flex",alignItems:"center",gap:"12px",flexShrink:0,
//         background:"rgba(201,169,110,0.05)",
//       }}>
//         <div style={{
//           width:"44px",height:"44px",borderRadius:"50%",flexShrink:0,
//           background:"linear-gradient(135deg,#c9a96e,#a07840)",
//           display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",
//         }}>🏠</div>
//         <div style={{ flex:1 }}>
//           <div style={{ fontSize:"15px",fontWeight:"700",color:"#e2e8f0" }}>Support Team</div>
//           <div style={{ fontSize:"12px",color:"#22c55e",display:"flex",alignItems:"center",gap:"5px",marginTop:"2px" }}>
//             <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e",display:"inline-block" }}/>
//             Online · Typically replies within an hour
//           </div>
//         </div>
//         <div style={{
//           fontSize:"11px",color:"#475569",
//           background:"rgba(255,255,255,0.04)",
//           border:"1px solid rgba(255,255,255,0.08)",
//           borderRadius:"6px",padding:"4px 10px",
//         }}>
//           🔄 Live
//         </div>
//       </div>

//       {/* ── Messages area ──────────────────────────────────────────────────── */}
//       <div style={{
//         flex:1,overflowY:"auto",padding:"20px",
//         display:"flex",flexDirection:"column",
//       }}>
//         {loading && (
//           <div style={{ textAlign:"center",color:"#475569",fontSize:"13px",padding:"40px" }}>
//             ⏳ Loading messages...
//           </div>
//         )}

//         {!loading && messages.length === 0 && (
//           <div style={{ textAlign:"center",padding:"50px 20px",margin:"auto" }}>
//             <div style={{ fontSize:"52px",marginBottom:"14px" }}>💬</div>
//             <div style={{ fontSize:"16px",fontWeight:"700",color:"#e2e8f0",marginBottom:"8px" }}>
//               No messages yet
//             </div>
//             <div style={{ fontSize:"13px",color:"#475569",lineHeight:1.7,maxWidth:"300px",margin:"0 auto" }}>
//               Have a question about your booking or property? Send us a message below and our support team will get back to you shortly.
//             </div>
//           </div>
//         )}

//         {Object.entries(grouped).map(([day, dayMsgs]) => (
//           <div key={day}>
//             {/* Date divider */}
//             <div style={{ display:"flex",alignItems:"center",gap:"12px",margin:"20px 0 14px" }}>
//               <div style={{ flex:1,height:"1px",background:"rgba(255,255,255,0.06)" }}/>
//               <span style={{ fontSize:"11px",color:"#334155",fontWeight:"600",whiteSpace:"nowrap",
//                              padding:"3px 10px",background:"rgba(255,255,255,0.04)",borderRadius:"20px" }}>
//                 {day}
//               </span>
//               <div style={{ flex:1,height:"1px",background:"rgba(255,255,255,0.06)" }}/>
//             </div>

//             <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
//               {dayMsgs.map((m) => {
//                 const isUser = m.sender === "user";
//                 return (
//                   <div key={m.id} style={{
//                     display:"flex",
//                     justifyContent: isUser ? "flex-end" : "flex-start",
//                     alignItems:"flex-end",gap:"10px",
//                   }}>
//                     {!isUser && (
//                       <div style={{
//                         width:"32px",height:"32px",borderRadius:"50%",flexShrink:0,
//                         background:"linear-gradient(135deg,#c9a96e,#a07840)",
//                         display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",
//                       }}>🏠</div>
//                     )}
//                     <div style={{ maxWidth:"70%" }}>
//                       {!isUser && (
//                         <div style={{ fontSize:"11px",color:"#c9a96e",fontWeight:"600",
//                                       marginBottom:"4px",paddingLeft:"4px" }}>
//                           Support Team
//                         </div>
//                       )}
//                       <div style={{
//                         padding:"11px 15px",
//                         borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
//                         background:   isUser ? "linear-gradient(135deg,#c9a96e,#a07840)" : "rgba(255,255,255,0.08)",
//                         color:        isUser ? "#000" : "#e2e8f0",
//                         fontSize:"13px",lineHeight:1.6,
//                         border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
//                         whiteSpace:"pre-wrap",wordBreak:"break-word",
//                       }}>
//                         {m.message}
//                       </div>
//                       <div style={{
//                         fontSize:"10px",color:"#334155",marginTop:"4px",
//                         textAlign:isUser?"right":"left",
//                         paddingLeft:isUser?0:"4px",
//                       }}>
//                         {new Date(m.created_at).toLocaleTimeString("en-IN",{ hour:"2-digit",minute:"2-digit" })}
//                         {isUser && <span style={{ marginLeft:"4px",color:"#475569" }}>✓</span>}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}

//         <div ref={bottomRef} />
//       </div>

//       {/* ── Input area ─────────────────────────────────────────────────────── */}
//       <div style={{
//         padding:"14px 16px",
//         borderTop:"1px solid rgba(255,255,255,0.07)",
//         display:"flex",gap:"10px",alignItems:"flex-end",flexShrink:0,
//         background:"rgba(0,0,0,0.15)",
//       }}>
//         <textarea
//           ref={inputRef}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
//           rows={2}
//           style={{
//             flex:1,padding:"10px 14px",borderRadius:"12px",resize:"none",
//             background:"rgba(255,255,255,0.06)",
//             border:"1px solid rgba(255,255,255,0.1)",
//             color:"#e2e8f0",fontSize:"13px",outline:"none",
//             lineHeight:1.5,fontFamily:"inherit",
//           }}
//         />
//         <button
//           onClick={handleSend}
//           disabled={sending || !input.trim()}
//           style={{
//             padding:"10px 22px",borderRadius:"10px",border:"none",
//             cursor: sending || !input.trim() ? "not-allowed" : "pointer",
//             background: sending || !input.trim()
//               ? "rgba(201,169,110,0.3)"
//               : "linear-gradient(135deg,#c9a96e,#a07840)",
//             color:"#000",fontWeight:"700",fontSize:"13px",
//             flexShrink:0,transition:"opacity 0.2s",
//             opacity: sending || !input.trim() ? 0.6 : 1,
//           }}
//         >
//           {sending ? "Sending..." : "Send →"}
//         </button>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef, useCallback } from "react";
import { useMessages } from "../hooks/useMessages";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// ── Typing dots ────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px", justifyContent:"flex-start" }}>
    <div style={{
      width:"32px", height:"32px", borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#c9a96e,#a07840)",
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px",
    }}>🏠</div>
    <div style={{
      padding:"12px 18px", borderRadius:"16px 16px 16px 2px",
      background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.08)",
      display:"flex", alignItems:"center", gap:"5px",
    }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:"7px", height:"7px", borderRadius:"50%",
          background:"#c9a96e", display:"inline-block",
          animation:"tab_typing_dot 1.2s ease infinite",
          animationDelay:`${i * 0.2}s`,
          opacity:0.4,
        }} />
      ))}
    </div>
  </div>
);

export default function MessagesTab({ user }) {
  const {
    messages, loading, sending,
    loadMessages, sendMessage, setOpen,
  } = useMessages(user);

  const [input,         setInput]         = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [inputFocused,  setInputFocused]  = useState(false);
  const bottomRef       = useRef(null);
  const inputRef        = useRef(null);
  const typingPollRef   = useRef(null);
  const userTypingTimer = useRef(null);

  // Mark open so polling fetches full messages
  useEffect(() => {
    setOpen(true);
    loadMessages();
    return () => {
      setOpen(false);
      stopTypingPoll();
      clearTimeout(userTypingTimer.current);
    };
  }, [loadMessages, setOpen]);

  // Start typing poll on mount
  useEffect(() => {
    startTypingPoll();
    return () => stopTypingPoll();
  }, [user?.token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior:"smooth" });
  }, [messages, isAdminTyping]);

  // ── Poll admin typing every 2s ─────────────────────────────────────────────
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

  // ── Send user typing signal ────────────────────────────────────────────────
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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    clearTimeout(userTypingTimer.current);
    await sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim()) sendUserTypingSignal();
  };

  // Group messages by date
  const grouped = messages.reduce((acc, m) => {
    const day = new Date(m.created_at).toLocaleDateString("en-IN", {
      day:"numeric", month:"long", year:"numeric",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @keyframes tab_typing_dot {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30%          { transform:translateY(-6px); opacity:1; }
        }
        @keyframes tab_typing_appear {
          0%   { opacity:0; transform:translateY(8px); }
          100% { opacity:1; transform:translateY(0); }
        }
        .tab-chat-input:focus { outline:none; }
        .tab-chat-input::placeholder { color:#334155; }
        .tab-chat-scroll::-webkit-scrollbar { width:4px; }
        .tab-chat-scroll::-webkit-scrollbar-track { background:transparent; }
        .tab-chat-scroll::-webkit-scrollbar-thumb { background:rgba(201,169,110,0.2); border-radius:4px; }
      `}</style>

      <div style={{
        display:"flex", flexDirection:"column",
        height:"560px",
        background:"rgba(255,255,255,0.02)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:"16px", overflow:"hidden",
        fontFamily:"'DM Sans',sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding:"16px 20px",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", gap:"12px", flexShrink:0,
          background:"rgba(201,169,110,0.05)",
        }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{
              width:"44px", height:"44px", borderRadius:"50%",
              background:"linear-gradient(135deg,#c9a96e,#a07840)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
            }}>🏠</div>
            <span style={{
              position:"absolute", bottom:"1px", right:"1px",
              width:"11px", height:"11px", borderRadius:"50%",
              background:"#22c55e", border:"2px solid #080812",
            }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"15px", fontWeight:"700", color:"#e2e8f0" }}>Support Team</div>
            <div style={{
              fontSize:"12px", marginTop:"2px", minHeight:"18px",
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
                        animation:"tab_typing_dot 1.2s ease infinite",
                        animationDelay:`${i*0.2}s`,
                      }} />
                    ))}
                  </span>
                </span>
              ) : (
                <>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                  Online · Typically replies within an hour
                </>
              )}
            </div>
          </div>
          <div style={{
            fontSize:"11px", color:"#475569",
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:"6px", padding:"4px 10px",
          }}>🔄 Live</div>
        </div>

        {/* Messages */}
        <div className="tab-chat-scroll" style={{
          flex:1, overflowY:"auto", padding:"20px",
          display:"flex", flexDirection:"column",
        }}>
          {loading && (
            <div style={{ textAlign:"center", color:"#475569", fontSize:"13px", padding:"40px" }}>
              ⏳ Loading messages...
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div style={{ textAlign:"center", padding:"50px 20px", margin:"auto" }}>
              <div style={{ fontSize:"52px", marginBottom:"14px" }}>💬</div>
              <div style={{ fontSize:"16px", fontWeight:"700", color:"#e2e8f0", marginBottom:"8px" }}>
                No messages yet
              </div>
              <div style={{ fontSize:"13px", color:"#475569", lineHeight:1.7, maxWidth:"300px", margin:"0 auto" }}>
                Have a question about your booking or property? Send us a message and our support team will reply shortly.
              </div>
            </div>
          )}

          {Object.entries(grouped).map(([day, dayMsgs]) => (
            <div key={day}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"20px 0 14px" }}>
                <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.06)" }} />
                <span style={{
                  fontSize:"11px", color:"#334155", fontWeight:"600", whiteSpace:"nowrap",
                  padding:"3px 10px", background:"rgba(255,255,255,0.04)", borderRadius:"20px",
                }}>{day}</span>
                <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.06)" }} />
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {dayMsgs.map((m) => {
                  const isUser = m.sender === "user";
                  return (
                    <div key={m.id} style={{
                      display:"flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      alignItems:"flex-end", gap:"10px",
                    }}>
                      {!isUser && (
                        <div style={{
                          width:"32px", height:"32px", borderRadius:"50%", flexShrink:0,
                          background:"linear-gradient(135deg,#c9a96e,#a07840)",
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px",
                        }}>🏠</div>
                      )}
                      <div style={{ maxWidth:"70%" }}>
                        {!isUser && (
                          <div style={{ fontSize:"11px", color:"#c9a96e", fontWeight:"600", marginBottom:"4px", paddingLeft:"4px" }}>
                            Support Team
                          </div>
                        )}
                        <div style={{
                          padding:"11px 15px",
                          borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                          background: isUser ? "linear-gradient(135deg,#c9a96e,#a07840)" : "rgba(255,255,255,0.08)",
                          color: isUser ? "#000" : "#e2e8f0",
                          fontSize:"13px", lineHeight:1.6,
                          border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
                          whiteSpace:"pre-wrap", wordBreak:"break-word",
                          boxShadow: isUser ? "0 2px 12px rgba(201,169,110,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
                        }}>
                          {m.message}
                        </div>
                        <div style={{
                          fontSize:"10px", color:"#334155", marginTop:"4px",
                          textAlign: isUser ? "right" : "left",
                          paddingLeft: isUser ? 0 : "4px",
                          display:"flex", alignItems:"center",
                          justifyContent: isUser ? "flex-end" : "flex-start",
                          gap:"3px",
                        }}>
                          <span>{new Date(m.created_at).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}</span>
                          {isUser && <span style={{ color:"#c9a96e", fontSize:"11px" }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Real typing indicator */}
          {isAdminTyping && (
            <div style={{ marginTop:"10px", animation:"tab_typing_appear 0.2s ease forwards" }}>
              <TypingDots />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding:"14px 16px",
          borderTop:"1px solid rgba(255,255,255,0.07)",
          display:"flex", gap:"10px", alignItems:"flex-end", flexShrink:0,
          background:"rgba(0,0,0,0.15)",
        }}>
          <textarea
            ref={inputRef}
            className="tab-chat-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={2}
            style={{
              flex:1, padding:"10px 14px", borderRadius:"12px", resize:"none",
              background: inputFocused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)",
              border:`1px solid ${inputFocused ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.1)"}`,
              color:"#e2e8f0", fontSize:"13px", outline:"none",
              lineHeight:1.5, fontFamily:"inherit",
              transition:"border-color 0.15s, background 0.15s",
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            style={{
              padding:"10px 22px", borderRadius:"10px", border:"none",
              cursor: sending || !input.trim() ? "not-allowed" : "pointer",
              background: sending || !input.trim()
                ? "rgba(201,169,110,0.3)"
                : "linear-gradient(135deg,#c9a96e,#a07840)",
              color:"#000", fontWeight:"700", fontSize:"13px",
              flexShrink:0,
              opacity: sending || !input.trim() ? 0.6 : 1,
              transition:"all 0.15s",
              transform: input.trim() && !sending ? "scale(1.02)" : "scale(1)",
              boxShadow: input.trim() && !sending ? "0 4px 14px rgba(201,169,110,0.3)" : "none",
            }}
          >
            {sending ? "Sending..." : "Send →"}
          </button>
        </div>
      </div>
    </>
  );
}
