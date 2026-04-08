// import { useState, useEffect, useCallback, useRef } from "react";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";
// const POLL_MS  = 8000;

// export function useMessages(user) {
//   const [messages, setMessages] = useState([]);
//   const [unread,   setUnread]   = useState(0);
//   const [loading,  setLoading]  = useState(false);
//   const [sending,  setSending]  = useState(false);

//   const lastIdRef    = useRef(null);
//   const pollTimerRef = useRef(null);
//   const isOpenRef    = useRef(false);

//   const authHeaders = useCallback(() => ({
//     Authorization:  `Bearer ${user?.token}`,
//     Accept:         "application/json",
//     "Content-Type": "application/json",
//   }), [user?.token]);

//   // ── Load full conversation (called when panel opens) ───────────────────────
//   const loadMessages = useCallback(async () => {
//     if (!user?.token) return;
//     setLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/messages`, { headers: authHeaders() });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = data.messages || [];
//       setMessages(list);
//       setUnread(0); // marked as read by the API
//       // Store the latest ID so polling knows what's "new"
//       if (list.length > 0) {
//         lastIdRef.current = list[list.length - 1].id;
//       }
//     } catch (_) {}
//     setLoading(false);
//   }, [user?.token, authHeaders]);

//   // ── Poll for new messages ──────────────────────────────────────────────────
//   // Only fetches unread count when panel is CLOSED (badge update)
//   // Fetches full new messages when panel is OPEN (live thread update)
//   const poll = useCallback(async () => {
//     if (!user?.token) return;
//     try {
//       if (isOpenRef.current) {
//         // Panel is open — fetch any new messages since lastId
//         const res  = await fetch(
//           `${API_BASE}/messages${lastIdRef.current ? `?after=${lastIdRef.current}` : ""}`,
//           { headers: authHeaders() }
//         );
//         if (!res.ok) return;
//         const data = await res.json();
//         const newMsgs = (data.messages || []).filter(
//           (m) => !lastIdRef.current || m.id > lastIdRef.current
//         );
//         if (newMsgs.length > 0) {
//           setMessages((prev) => {
//             // Avoid duplicates
//             const existingIds = new Set(prev.map((m) => m.id));
//             const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
//             if (!toAdd.length) return prev;
//             lastIdRef.current = Math.max(...toAdd.map((m) => m.id));
//             return [...prev, ...toAdd];
//           });
//         }
//       } else {
//         // Panel is closed — just check unread count for badge
//         const res  = await fetch(`${API_BASE}/messages/unread`, { headers: authHeaders() });
//         if (!res.ok) return;
//         const data = await res.json();
//         setUnread(data.unread || 0);
//       }
//     } catch (_) {}
//   }, [user?.token, authHeaders]);

//   // ── Send a message ─────────────────────────────────────────────────────────
//   const sendMessage = useCallback(async (text) => {
//     if (!text.trim() || !user?.token) return false;
//     setSending(true);
//     try {
//       const res  = await fetch(`${API_BASE}/messages/send`, {
//         method:  "POST",
//         headers: authHeaders(),
//         body:    JSON.stringify({ message: text.trim() }),
//       });
//       if (!res.ok) return false;
//       const data = await res.json();
//       if (data.message) {
//         setMessages((prev) => {
//           if (prev.find((m) => m.id === data.message.id)) return prev;
//           lastIdRef.current = data.message.id;
//           return [...prev, data.message];
//         });
//         setSending(false);
//         return true;
//       }
//     } catch (_) {}
//     setSending(false);
//     return false;
//   }, [user?.token, authHeaders]);

//   // ── Fetch unread count only (no marking as read) ───────────────────────────
//   const fetchUnread = useCallback(async () => {
//     if (!user?.token) return;
//     try {
//       const res  = await fetch(`${API_BASE}/messages/unread`, { headers: authHeaders() });
//       if (!res.ok) return;
//       const data = await res.json();
//       setUnread(data.unread || 0);
//     } catch (_) {}
//   }, [user?.token, authHeaders]);

//   // ── Mark chat as open/closed (controls what polling does) ─────────────────
//   const setOpen = useCallback((open) => {
//     isOpenRef.current = open;
//   }, []);

//   // ── Start polling on mount, stop on unmount ────────────────────────────────
//   useEffect(() => {
//     if (!user?.token) return;

//     // Fetch unread on mount
//     fetchUnread();

//     // Start polling interval
//     pollTimerRef.current = setInterval(poll, POLL_MS);

//     return () => {
//       if (pollTimerRef.current) clearInterval(pollTimerRef.current);
//     };
//   }, [user?.token, poll, fetchUnread]);

//   return {
//     messages,
//     unread,
//     loading,
//     sending,
//     loadMessages,
//     sendMessage,
//     fetchUnread,
//     setUnread,
//     setOpen,
//   };
// }

// import { useState, useEffect, useCallback, useRef } from "react";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";
// const POLL_MS  = 8000; // poll every 8 seconds

// export function useMessages(user) {
//   const [messages, setMessages] = useState([]);
//   const [unread,   setUnread]   = useState(0);
//   const [loading,  setLoading]  = useState(false);
//   const [sending,  setSending]  = useState(false);

//   const lastIdRef    = useRef(null);  // tracks latest message ID to detect new ones
//   const pollTimerRef = useRef(null);
//   const isOpenRef    = useRef(false); // tracks if chat panel is open

//   const [isAdminTyping, setIsAdminTyping] = useState(false);
//   const typingPollRef = useRef(null);

//   // Send typing signal when user is typing
// const sendTypingSignal = useCallback(
//   debounce(async () => {
//     if (!token) return;
//     try {
//       await fetch(`${API_BASE}/messages/typing`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       });
//     } catch (_) {}
//   }, 1000, { leading: true, trailing: false }),
//   [token]
// );

// // Poll whether admin is typing (every 2s when chat is open)
// const startTypingPoll = useCallback((userId) => {
//   if (typingPollRef.current) clearInterval(typingPollRef.current);
//   typingPollRef.current = setInterval(async () => {
//     try {
//       const res  = await fetch(`${API_BASE}/messages/typing?user_id=${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setIsAdminTyping(data.typing === true);
//     } catch (_) {}
//   }, 2000);
// }, [token]);

// const stopTypingPoll = useCallback(() => {
//   if (typingPollRef.current) clearInterval(typingPollRef.current);
//   typingPollRef.current = null;
//   setIsAdminTyping(false);
// }, []);

// // Cleanup on unmount
// useEffect(() => () => stopTypingPoll(), [stopTypingPoll]);

//   const authHeaders = useCallback(() => ({
//     Authorization:  `Bearer ${user?.token}`,
//     Accept:         "application/json",
//     "Content-Type": "application/json",
//   }), [user?.token]);

//   // ── Load full conversation (called when panel opens) ───────────────────────
//   const loadMessages = useCallback(async () => {
//     if (!user?.token) return;
//     setLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/messages`, { headers: authHeaders() });
//       if (!res.ok) return;
//       const data = await res.json();
//       const list = data.messages || [];
//       setMessages(list);
//       setUnread(0); // marked as read by the API
//       // Store the latest ID so polling knows what's "new"
//       if (list.length > 0) {
//         lastIdRef.current = list[list.length - 1].id;
//       }
//     } catch (_) {}
//     setLoading(false);
//   }, [user?.token, authHeaders]);

//   // ── Poll for new messages ──────────────────────────────────────────────────
//   // Only fetches unread count when panel is CLOSED (badge update)
//   // Fetches full new messages when panel is OPEN (live thread update)
//   const poll = useCallback(async () => {
//     if (!user?.token) return;
//     try {
//       if (isOpenRef.current) {
//         // Panel is open — fetch any new messages since lastId
//         const res  = await fetch(
//           `${API_BASE}/messages${lastIdRef.current ? `?after=${lastIdRef.current}` : ""}`,
//           { headers: authHeaders() }
//         );
//         if (!res.ok) return;
//         const data = await res.json();
//         const newMsgs = (data.messages || []).filter(
//           (m) => !lastIdRef.current || m.id > lastIdRef.current
//         );
//         if (newMsgs.length > 0) {
//           setMessages((prev) => {
//             // Avoid duplicates
//             const existingIds = new Set(prev.map((m) => m.id));
//             const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
//             if (!toAdd.length) return prev;
//             lastIdRef.current = Math.max(...toAdd.map((m) => m.id));
//             return [...prev, ...toAdd];
//           });
//         }
//       } else {
//         // Panel is closed — just check unread count for badge
//         const res  = await fetch(`${API_BASE}/messages/unread`, { headers: authHeaders() });
//         if (!res.ok) return;
//         const data = await res.json();
//         setUnread(data.unread || 0);
//       }
//     } catch (_) {}
//   }, [user?.token, authHeaders]);

//   // ── Send a message ─────────────────────────────────────────────────────────
//   const sendMessage = useCallback(async (text) => {
//     if (!text.trim() || !user?.token) return false;
//     setSending(true);
//     try {
//       const res  = await fetch(`${API_BASE}/messages/send`, {
//         method:  "POST",
//         headers: authHeaders(),
//         body:    JSON.stringify({ message: text.trim() }),
//       });
//       if (!res.ok) return false;
//       const data = await res.json();
//       if (data.message) {
//         setMessages((prev) => {
//           if (prev.find((m) => m.id === data.message.id)) return prev;
//           lastIdRef.current = data.message.id;
//           return [...prev, data.message];
//         });
//         setSending(false);
//         return true;
//       }
//     } catch (_) {}
//     setSending(false);
//     return false;
//   }, [user?.token, authHeaders]);

//   // ── Fetch unread count only (no marking as read) ───────────────────────────
//   const fetchUnread = useCallback(async () => {
//     if (!user?.token) return;
//     try {
//       const res  = await fetch(`${API_BASE}/messages/unread`, { headers: authHeaders() });
//       if (!res.ok) return;
//       const data = await res.json();
//       setUnread(data.unread || 0);
//     } catch (_) {}
//   }, [user?.token, authHeaders]);

//   // ── Mark chat as open/closed (controls what polling does) ─────────────────
//   const setOpen = useCallback((open) => {
//     isOpenRef.current = open;
//   }, []);

//   // ── Reset all state when user changes (logout / switch account) ─────────────
//   // Prevents previous user's messages showing to the next logged-in user.
//   const prevUserIdRef = useRef(null);
//   useEffect(() => {
//     const currentId = user?.id ?? null;
//     if (prevUserIdRef.current !== null && prevUserIdRef.current !== currentId) {
//       setMessages([]);
//       setUnread(0);
//       lastIdRef.current = null;
//       isOpenRef.current = false;
//       if (pollTimerRef.current) {
//         clearInterval(pollTimerRef.current);
//         pollTimerRef.current = null;
//       }
//     }
//     prevUserIdRef.current = currentId;
//   }, [user?.id]);

//   // ── Start polling on mount, stop on unmount ────────────────────────────────
//   useEffect(() => {
//     if (!user?.token) {
//       // Logged out — clear everything
//       setMessages([]);
//       setUnread(0);
//       lastIdRef.current = null;
//       if (pollTimerRef.current) clearInterval(pollTimerRef.current);
//       return;
//     }

//     fetchUnread();
//     pollTimerRef.current = setInterval(poll, POLL_MS);

//     return () => {
//       if (pollTimerRef.current) clearInterval(pollTimerRef.current);
//     };
//   }, [user?.token, poll, fetchUnread]);

//   return {
//     messages,
//     unread,
//     loading,
//     sending,
//     loadMessages,
//     sendMessage,
//     fetchUnread,
//     setUnread,
//     setOpen,
//     isAdminTyping,
//     sendTypingSignal,
//     startTypingPoll,
//     stopTypingPoll,
//   };
// }

import { useState, useEffect, useCallback, useRef } from "react";

import { apiUrl, imgUrl } from "../apiUrl";

const API_BASE = `${apiUrl}/api`;

const POLL_MS = 8000; // poll every 8 seconds

// ── Simple debounce (no lodash needed) ────────────────────────────────────────
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function useMessages(user) {
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  const lastIdRef = useRef(null);
  const pollTimerRef = useRef(null);
  const isOpenRef = useRef(false);
  const typingPollRef = useRef(null);
  const prevUserIdRef = useRef(null);

  const token = user?.token ?? null;

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    [token],
  );

  // ── User typing signal — debounced, fires 300ms after keystroke ───────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const sendTypingSignal = useCallback(
  //   debounce(async () => {
  //     if (!token) return;
  //     try {
  //       await fetch(`${API_BASE}/messages/typing`, {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       });
  //     } catch (_) {}
  //   }, 300),
  //   [token],
  // );

  // ── Poll whether admin is typing (every 2s when panel is open) ────────────
  // const startTypingPoll = useCallback(() => {
  //   if (typingPollRef.current) clearInterval(typingPollRef.current);
  //   typingPollRef.current = setInterval(async () => {
  //     if (!token) return;
  //     try {
  //       const res  = await fetch(`${API_BASE}/messages/typing`, {
  //         headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  //       });
  //       const data = await res.json();
  //       setIsAdminTyping(data.typing === true);
  //     } catch (_) {}
  //   }, 2000);
  // }, [token]);

  // const startTypingPoll = useCallback(() => {
  //   if (typingPollRef.current) clearInterval(typingPollRef.current);
  //   typingPollRef.current = setInterval(async () => {
  //     if (!token) return;
  //     try {
  //       const res = await fetch(`${API_BASE}/messages/typing`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           Accept: "application/json",
  //         },
  //       });
  //       const data = await res.json();
  //       setIsAdminTyping(data.typing === true);
  //     } catch (_) {}
  //   }, 4000); // ← was 2000, now 4000
  // }, [token]);

  // const stopTypingPoll = useCallback(() => {
  //   if (typingPollRef.current) {
  //     clearInterval(typingPollRef.current);
  //     typingPollRef.current = null;
  //   }
  //   setIsAdminTyping(false);
  // }, []);

  // // Cleanup typing poll on unmount
  // useEffect(() => () => stopTypingPoll(), [stopTypingPoll]);

  // ── Load full conversation (called when panel opens) ───────────────────────
  const loadMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.messages || [];
      setMessages(list);
      setUnread(0);
      if (list.length > 0) {
        lastIdRef.current = list[list.length - 1].id;
      }
    } catch (_) {}
    setLoading(false);
  }, [token, authHeaders]);

  // ── Poll for new messages or unread count ─────────────────────────────────
  // const poll = useCallback(async () => {
  //   if (!token) return;
  //   try {
  //     if (isOpenRef.current) {
  //       // Panel open — fetch new messages since lastId
  //       const url = `${API_BASE}/messages${lastIdRef.current ? `?after=${lastIdRef.current}` : ""}`;
  //       const res = await fetch(url, { headers: authHeaders() });
  //       if (!res.ok) return;
  //       const data = await res.json();
  //       const newMsgs = (data.messages || []).filter(
  //         (m) => !lastIdRef.current || m.id > lastIdRef.current,
  //       );
  //       if (newMsgs.length > 0) {
  //         setMessages((prev) => {
  //           const existingIds = new Set(prev.map((m) => m.id));
  //           const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
  //           if (!toAdd.length) return prev;
  //           lastIdRef.current = Math.max(...toAdd.map((m) => m.id));
  //           return [...prev, ...toAdd];
  //         });
  //       }
  //     } else {
  //       // Panel closed — just update badge
  //       const res = await fetch(`${API_BASE}/messages/unread`, {
  //         headers: authHeaders(),
  //       });
  //       if (!res.ok) return;
  //       const data = await res.json();
  //       setUnread(data.unread || 0);
  //     }
  //   } catch (_) {}
  // }, [token, authHeaders]);

  const poll = useCallback(async () => {
    if (!token) return;
    try {
      if (isOpenRef.current) {
        const url  = `${API_BASE}/messages${lastIdRef.current ? `?after=${lastIdRef.current}` : ""}`;
        const res  = await fetch(url, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();

        // ── Read typing state from same response ──────────────
        setIsAdminTyping(data.admin_typing === true);

        const newMsgs = (data.messages || []).filter(
          (m) => !lastIdRef.current || m.id > lastIdRef.current
        );
        if (newMsgs.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
            if (!toAdd.length) return prev;
            lastIdRef.current = Math.max(...toAdd.map((m) => m.id));
            return [...prev, ...toAdd];
          });
          // New message arrived → admin stopped typing
          setIsAdminTyping(false);
        }
      } else {
        const res  = await fetch(`${API_BASE}/messages/unread`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setUnread(data.unread || 0);
      }
    } catch (_) {}
  }, [token, authHeaders]);

  // ── Send a message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !token) return false;
      setSending(true);
      try {
        const res = await fetch(`${API_BASE}/messages/send`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ message: text.trim() }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === data.message.id)) return prev;
            lastIdRef.current = data.message.id;
            return [...prev, data.message];
          });
          setSending(false);
          return true;
        }
      } catch (_) {}
      setSending(false);
      return false;
    },
    [token, authHeaders],
  );

  // ── Fetch unread count only ────────────────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/messages/unread`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnread(data.unread || 0);
    } catch (_) {}
  }, [token, authHeaders]);

  // ── Mark panel as open/closed ─────────────────────────────────────────────
  const setOpen = useCallback((open) => {
    isOpenRef.current = open;
  }, []);

  // ── Reset state on user change (logout / account switch) ──────────────────
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== currentId) {
      setMessages([]);
      setUnread(0);
      setIsAdminTyping(false);
      lastIdRef.current = null;
      isOpenRef.current = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      // stopTypingPoll();
    }
    prevUserIdRef.current = currentId;
  }, [user?.id]);

  // ── Start polling on mount, stop on unmount ────────────────────────────────
  useEffect(() => {
    if (!token) {
      setMessages([]);
      setUnread(0);
      lastIdRef.current = null;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    fetchUnread();
    pollTimerRef.current = setInterval(poll, POLL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [token, poll, fetchUnread]);

  return {
    messages,
    unread,
    loading,
    sending,
    isAdminTyping,
    loadMessages,
    sendMessage,
    fetchUnread,
    setUnread,
    setOpen,
    // sendTypingSignal,
    // startTypingPoll,
    // stopTypingPoll,
  };
}
