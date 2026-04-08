// import { useEffect, useRef, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useWishlist } from "../hooks/useWishlist";
// import { useToast } from "../context/ToastContext";
// import { Viewer } from "@photo-sphere-viewer/core";
// import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
// import "@photo-sphere-viewer/core/index.css";
// import "@photo-sphere-viewer/markers-plugin/index.css";
// import "../styles/UnitPage.css";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";
// const toRad = (deg) => parseFloat((deg * (Math.PI / 180)).toFixed(6));

// const AMENITY_ICONS = {
//   "Swimming Pool": "🏊", Gym: "🏋️", Parking: "🚗", "24/7 Security": "🔒",
//   "Club House": "🏛️", "Children Play Area": "🛝", "Jogging Track": "🏃",
//   Garden: "🌿", Lift: "🛗", "Power Backup": "⚡", "CCTV Surveillance": "📹",
//   Intercom: "📞", "Visitor Parking": "🅿️", Terrace: "🏙️",
// };
// const amenityIcon = (name) => AMENITY_ICONS[name] || "✨";
// const toFt  = (m)  => (m * 3.28084).toFixed(1);
// const toFt2 = (m2) => (m2 * 10.7639).toFixed(1);

// const UnitPage = () => {
//   const { plotId } = useParams();
//   const navigate   = useNavigate();

//   const containerRef    = useRef(null);
//   const viewerRef       = useRef(null);
//   const markersRef      = useRef(null);
//   const overlayRef      = useRef(null);
//   const labelRef        = useRef(null);
//   const allMarkerIdsRef = useRef([]);

//   const [unit,          setUnit]          = useState(null);
//   const [hotspots,      setHotspots]      = useState(null);
//   const [fetchError,    setFetchError]    = useState(null);
//   const [isFetching,    setIsFetching]    = useState(true);
//   const [isLoaded,      setIsLoaded]      = useState(false);
//   const [loadProgress,  setLoadProgress]  = useState(0);
//   const [activeTab,     setActiveTab]     = useState("details");
//   const [sidebarOpen,   setSidebarOpen]   = useState(false);
//   const [bookingStep,   setBookingStep]   = useState("details");
//   const [selectedPlan,  setSelectedPlan]  = useState(null);
//   const [loginForm,     setLoginForm]     = useState({ email: "", password: "" });
//   const [registerForm,  setRegisterForm]  = useState({
//     name: "", email: "", country_code: "+91", phone: "",
//     password: "", role: "user", broker_company: "",
//   });
//   const [bookingForm, setBookingForm] = useState({
//     name: "", phone: "", notes: "",
//     client_name: "", client_phone: "", client_email: "", client_country_code: "+91",
//   });
//   const [authLoading,       setAuthLoading]      = useState(false);
//   const [authError,         setAuthError]        = useState("");
//   const [bookingDone,       setBookingDone]       = useState(false);
//   const [pendingUserId,     setPendingUserId]     = useState(null);
//   const [existingBookingId, setExistingBookingId] = useState(null);
//   const [currency,          setCurrency]          = useState("₹");

//   // ── Wishlist modal — completely separate state from booking sidebar ────────
//   const [loginModalOpen,     setLoginModalOpen]     = useState(false);
//   const [pendingWishlist,    setPendingWishlist]    = useState(false);
//   // modalStep: "login" | "register" | "verify_email" | "verify_phone"
//   const [modalStep,          setModalStep]          = useState("login");
//   const [modalPendingUserId, setModalPendingUserId] = useState(null);
//   const [modalAuthError,     setModalAuthError]     = useState("");

//   const dispatch = useDispatch();
//   const user     = useSelector(selectUser);
//   const { wishedIds, toggle: toggleWish } = useWishlist(user?.token);
//   const { showToast } = useToast();

//   // ── Direct wishlist API call with a known-fresh token ────────────────────
//   const wishlistWithToken = useCallback((freshToken, pid, plotNumber) => {
//     fetch(`${API_BASE}/wishlist/toggle`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json", Accept: "application/json" },
//       body: JSON.stringify({ plot_id: Number(pid) }),
//     })
//       .then((r) => r.json())
//       .then((d) => {
//         showToast(
//           d.wishlisted ? `❤️ Added to Wishlist — Unit ${plotNumber}` : `🤍 Removed from Wishlist — Unit ${plotNumber}`,
//           d.wishlisted ? "wishlist_add" : "wishlist_remove", 2800,
//         );
//       })
//       .catch(() => {});
//   }, [showToast]);

//   // ── Fetch ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [unitRes, hsRes, currRes] = await Promise.all([
//           fetch(`${API_BASE}/unit/${plotId}`,             { headers: { Accept: "application/json" } }),
//           fetch(`${API_BASE}/hotspots?plot_id=${plotId}`, { headers: { Accept: "application/json" } }),
//           fetch(`${API_BASE}/currency`,                   { headers: { Accept: "application/json" } }),
//         ]);
//         if (!unitRes.ok) throw new Error(`Unit API error ${unitRes.status}`);
//         const unitData = await unitRes.json();
//         const hsData   = hsRes.ok ? await hsRes.json() : [];
//         if (currRes.ok) {
//           const c = await currRes.json();
//           setCurrency(c.symbol || c.currency || c.data?.symbol || c.data?.currency || "₹");
//         }
//         setUnit(unitData);
//         setHotspots(hsData);
//       } catch (err) { setFetchError(err.message); }
//       finally { setIsFetching(false); }
//     };
//     fetchAll();
//   }, [plotId]);

//   // ── PSV ───────────────────────────────────────────────────────────────────
//   const destroyViewer = useCallback(() => {
//     if (!viewerRef.current) return;
//     try { viewerRef.current._cleanup?.(); } catch (e) {}
//     try { if (containerRef.current?.isConnected && containerRef.current?.hasChildNodes()) viewerRef.current.destroy(); } catch (e) {}
//     viewerRef.current = null; markersRef.current = null;
//   }, []);

//   const buildMarkers = useCallback((unitData, hsData) => {
//     const markers = [];
//     hsData.forEach((hs) => {
//       if (!hs.yaw || !hs.pitch) return;
//       if (hs.hotspot_type === "gallery") {
//         markers.push({ id: `hs-gallery-${hs.id}`, position: { yaw: toRad(parseFloat(hs.yaw)), pitch: toRad(parseFloat(hs.pitch)) }, html: `<div class="hs-marker hs-gallery">🖼 ${hs.title || hs.label}</div>`, size: { width: 170, height: 42 }, data: { type: "gallery", galleryIndex: hs.gallery_index ?? 0, name: hs.title || hs.label, yawRad: toRad(parseFloat(hs.yaw)), pitchRad: toRad(parseFloat(hs.pitch)) } });
//       } else {
//         const room = unitData.rooms?.find((r) => r.id === hs.room_panorama_id || r.room_label === (hs.title || hs.label));
//         markers.push({ id: `hs-room-${hs.id}`, position: { yaw: toRad(parseFloat(hs.yaw)), pitch: toRad(parseFloat(hs.pitch)) }, html: `<div class="hs-marker hs-room">🚪 ${hs.title || hs.label}</div>`, size: { width: 160, height: 42 }, data: { type: "room", roomId: room?.id || hs.room_panorama_id, name: hs.title || hs.label, yawRad: toRad(parseFloat(hs.yaw)), pitchRad: toRad(parseFloat(hs.pitch)) } });
//       }
//     });
//     if (markers.length === 0 && unitData.rooms?.length > 0) {
//       unitData.rooms.forEach((room, idx) => {
//         const yaw = (idx / unitData.rooms.length) * 360 - 180;
//         markers.push({ id: `fallback-room-${room.id}`, position: { yaw: toRad(yaw), pitch: toRad(-10) }, html: `<div class="hs-marker hs-room">🚪 ${room.room_label}</div>`, size: { width: 160, height: 42 }, data: { type: "room", roomId: room.id, name: room.room_label, yawRad: toRad(yaw), pitchRad: toRad(-10) } });
//       });
//     }
//     return markers;
//   }, []);

//   useEffect(() => {
//     if (!unit?.panorama_url || !hotspots || !containerRef.current || activeTab !== "panorama") return;
//     destroyViewer(); setIsLoaded(false); setLoadProgress(0);
//     let current = 0;
//     const interval = setInterval(() => { current += Math.random() * 10; if (current >= 90) { current = 90; clearInterval(interval); } setLoadProgress(Math.round(current)); }, 180);
//     const psvMarkers = buildMarkers(unit, hotspots);
//     allMarkerIdsRef.current = psvMarkers.map((m) => m.id);
//     const initTimer = setTimeout(() => {
//       if (!containerRef.current) return;
//       try {
//         viewerRef.current = new Viewer({ container: containerRef.current, panorama: unit.panorama_url, defaultZoomLvl: 50, mousewheelCtrlKey: false, loadingImg: null, loadingTxt: "", useXmpData: false, plugins: [[MarkersPlugin, { markers: psvMarkers }]] });
//       } catch (e) { console.error("PSV init error:", e); return; }
//       const handleResize = () => { try { viewerRef.current?.autoSize(); } catch (e) {} };
//       window.addEventListener("resize", handleResize);
//       document.addEventListener("fullscreenchange", handleResize);
//       document.addEventListener("webkitfullscreenchange", handleResize);
//       markersRef.current = viewerRef.current.getPlugin(MarkersPlugin);
//       viewerRef.current.addEventListener("ready", () => {
//         clearInterval(interval); setLoadProgress(100); setTimeout(() => setIsLoaded(true), 400);
//         let angle = 0, isInteracting = false, resumeTimer = null;
//         const swing = () => { if (!isInteracting) { angle += 0.0015; try { viewerRef.current?.rotate({ yaw: Math.sin(angle) * 0.06, pitch: 0 }); } catch (e) {} } if (viewerRef.current) viewerRef.current._rafId = requestAnimationFrame(swing); };
//         viewerRef.current._rafId = requestAnimationFrame(swing);
//         const onStart = () => { isInteracting = true; clearTimeout(resumeTimer); };
//         const onEnd   = () => { resumeTimer = setTimeout(() => { isInteracting = false; }, 2500); };
//         const el = containerRef.current;
//         if (el) { el.addEventListener("mousedown", onStart, { passive: true }); el.addEventListener("mouseup", onEnd, { passive: true }); el.addEventListener("touchstart", onStart, { passive: true }); el.addEventListener("touchend", onEnd, { passive: true }); }
//         viewerRef.current._cleanup = () => {
//           if (viewerRef.current?._rafId) cancelAnimationFrame(viewerRef.current._rafId);
//           clearTimeout(resumeTimer);
//           window.removeEventListener("resize", handleResize); document.removeEventListener("fullscreenchange", handleResize); document.removeEventListener("webkitfullscreenchange", handleResize);
//           if (el) { el.removeEventListener("mousedown", onStart); el.removeEventListener("mouseup", onEnd); el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); }
//         };
//       });
//       markersRef.current?.addEventListener("select-marker", ({ marker }) => {
//         const { type, roomId, galleryIndex, name, yawRad, pitchRad } = marker.data;
//         allMarkerIdsRef.current.forEach((id) => { try { markersRef.current?.updateMarker({ id, opacity: 0 }); } catch (e) {} });
//         if (labelRef.current) { labelRef.current.textContent = name; labelRef.current.style.opacity = "1"; }
//         viewerRef.current?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 60, speed: "4rpm" })
//           .then(() => viewerRef.current?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 100, speed: "20rpm" }))
//           .then(() => {
//             if (overlayRef.current) { overlayRef.current.style.transition = "opacity 0.4s ease-in"; overlayRef.current.style.opacity = "1"; }
//             setTimeout(() => { if (type === "gallery") navigate(`/unit/${plotId}/gallery/${galleryIndex}`); else navigate(`/unit/${plotId}/room/${roomId}`); }, 450);
//           });
//       });
//     }, 50);
//     return () => { clearInterval(interval); clearTimeout(initTimer); destroyViewer(); };
//   }, [unit, hotspots, activeTab]);

//   useEffect(() => {
//     if (!overlayRef.current) return;
//     overlayRef.current.style.opacity = "1"; overlayRef.current.style.transition = "none";
//     const t = setTimeout(() => { overlayRef.current.style.transition = "opacity 0.7s ease-out"; overlayRef.current.style.opacity = "0"; }, 50);
//     return () => clearTimeout(t);
//   }, []);

//   // ── BOOKING SIDEBAR auth (uses authError / pendingUserId) ─────────────────
//   const handleLogin = async () => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(loginForm) });
//       const data = await res.json();
//       if (data.step === "verify_email") { setPendingUserId(data.user_id); setBookingStep("verify_email"); setAuthLoading(false); return; }
//       if (data.step === "verify_phone") { setPendingUserId(data.user_id); setBookingStep("verify_phone"); setAuthLoading(false); return; }
//       if (!res.ok) throw new Error(data.message || "Login failed");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setBookingForm((f) => ({ ...f, name: userData.name || "", phone: (userData.country_code || "") + (userData.phone || "") }));
//       afterAuth();
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleRegister = async () => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(registerForm) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Registration failed");
//       setPendingUserId(data.user_id); setBookingStep("verify_email"); setAuthError("");
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleVerifyEmail = async (otp) => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-email`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       setPendingUserId(data.user_id); setBookingStep("verify_phone"); setAuthError("");
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleVerifyPhone = async (otp) => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-phone`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setBookingForm((f) => ({ ...f, name: userData.name || "", phone: (userData.country_code || "") + (userData.phone || "") }));
//       afterAuth();
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleResendOtp = async (type) => {
//     if (!pendingUserId) return;
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, type }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to resend");
//       setAuthError("✓ " + data.message);
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   // ── MODAL auth (wishlist flow — uses modalAuthError / modalPendingUserId) ──
//   const handleModalLogin = async () => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(loginForm) });
//       const data = await res.json();
//       // If OTP required, show it INSIDE the modal
//       if (data.step === "verify_email") { setModalPendingUserId(data.user_id); setModalStep("verify_email"); setAuthLoading(false); return; }
//       if (data.step === "verify_phone") { setModalPendingUserId(data.user_id); setModalStep("verify_phone"); setAuthLoading(false); return; }
//       if (!res.ok) throw new Error(data.message || "Login failed");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setLoginModalOpen(false);
//       if (pendingWishlist) { setPendingWishlist(false); wishlistWithToken(data.token, plotId, unit?.plot_number); }
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalRegister = async () => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(registerForm) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Registration failed");
//       // Registration done → show email OTP INSIDE the modal
//       setModalPendingUserId(data.user_id);
//       setModalStep("verify_email");
//       setModalAuthError("");
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalVerifyEmail = async (otp) => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-email`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       setModalPendingUserId(data.user_id);
//       setModalStep("verify_phone"); // move to phone OTP inside modal
//       setModalAuthError("");
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalVerifyPhone = async (otp) => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-phone`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setLoginModalOpen(false);
//       // Use fresh token directly — useWishlist hasn't re-initialised yet
//       if (pendingWishlist) { setPendingWishlist(false); wishlistWithToken(data.token, plotId, unit?.plot_number); }
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalResendOtp = async (type) => {
//     if (!modalPendingUserId) return;
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, type }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to resend");
//       setModalAuthError("✓ " + data.message);
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const closeModal = () => { setLoginModalOpen(false); setPendingWishlist(false); setModalStep("login"); setModalAuthError(""); };

//   // ── Booking ───────────────────────────────────────────────────────────────
//   const handleBooking = async () => {
//     setAuthLoading(true); setAuthError("");
//     const isBroker = user?.role === "broker";
//     if (isBroker && user?.status && user.status !== "active") { setAuthError("Your broker account is currently inactive. Please contact the admin to activate your account before booking."); setAuthLoading(false); return; }
//     try {
//       if (existingBookingId) {
//         const res  = await fetch(`${API_BASE}/bookings/${existingBookingId}/plan`, { method: "PATCH", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user?.token}` }, body: JSON.stringify({ payment_plan_id: selectedPlan }) });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Plan update failed");
//         setTimeout(() => navigate(`/payment/${existingBookingId}`), 400);
//         return;
//       }
//       const payload = { plot_id: plotId, plot_number: unit.plot_number, plot_type: unit.plot_type, block: unit.block, section: unit.section, direction: unit.direction, area: unit.plot_size ? String(unit.plot_size) : "", price: unit.offer_price ? String(unit.offer_price) : String(unit.actual_price || ""), project_id: unit.project_id, block_id: unit.block_id, name: bookingForm.name, phone: bookingForm.phone, notes: bookingForm.notes, payment_plan_id: selectedPlan, client_name: isBroker ? bookingForm.client_name : undefined, client_phone: isBroker ? bookingForm.client_country_code + bookingForm.client_phone : undefined, client_email: isBroker ? bookingForm.client_email : undefined };
//       const res  = await fetch(`${API_BASE}/bookings`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user?.token}` }, body: JSON.stringify(payload) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Booking failed");
//       const bookingId = data.booking?.id;
//       if (bookingId) { showToast(`🎉 Booking confirmed! Redirecting to payment…`, "success", 2500); setTimeout(() => navigate(`/payment/${bookingId}`), 400); }
//       else { setBookingDone(true); showToast(`✅ Booking received! We'll contact you shortly.`, "success", 4000); }
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleBack = () => {
//     if (overlayRef.current) { overlayRef.current.style.transition = "opacity 0.4s ease-in"; overlayRef.current.style.opacity = "1"; }
//     const dest = unit?.block_id ? `/floor/${unit.block_id}` : unit?.floor_id ? `/floor/${unit.floor_id}` : null;
//     setTimeout(() => (dest ? navigate(dest) : navigate(-1)), 450);
//   };

//   const switchToGallery  = () => { destroyViewer(); setActiveTab("gallery"); setIsLoaded(false); };
//   const switchToPanorama = () => setActiveTab("panorama");
//   const switchToDetails  = () => { destroyViewer(); setActiveTab("details"); };
//   const hasPlans         = (unit?.payment_plans?.length || 0) > 0;
//   const afterAuth        = () => setBookingStep(hasPlans ? "plan" : "form");

//   const openBooking = async () => {
//     setSidebarOpen(true); setBookingDone(false); setAuthError("");
//     if (user) {
//       if (user.role === "broker" && user.status && user.status !== "active") { setBookingStep("broker_inactive"); return; }
//       try {
//         const res = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//         if (res.ok) {
//           const data     = await res.json();
//           const bookings = Array.isArray(data) ? data : data.data || [];
//           const existing = bookings.find((b) => String(b.plot_id) === String(plotId) && b.booking_status !== "cancelled");
//           if (existing) {
//             setExistingBookingId(existing.id); setSelectedPlan(existing.payment_plan_id || null);
//             if (existing.booking_status === "confirmed") { setBookingDone(true); setBookingStep("details"); return; }
//             setBookingStep(hasPlans ? "plan" : "form"); return;
//           }
//         }
//       } catch (e) {}
//       setExistingBookingId(null); setBookingStep(hasPlans ? "plan" : "form");
//     } else { setExistingBookingId(null); setBookingStep("details"); }
//   };

//   const logout = () => { dispatch(clearUser()); setBookingStep("details"); setSelectedPlan(null); setExistingBookingId(null); };

//   useEffect(() => {
//     if (user) setBookingForm((f) => ({ ...f, name: f.name || user.name || "", phone: f.phone || (user.country_code || "") + (user.phone || "") }));
//   }, [user?.id]);

//   const fmtPrice       = (val) => val ? `${currency} ${Number(val).toLocaleString("en-IN")}` : null;
//   const getStatusColor = (s) => { const v = s?.toLowerCase(); return v === "available" ? "#22c55e" : v === "pre-booked" ? "#f59e0b" : "#ef4444"; };

//   if (isFetching) return <div className="unit-loading-screen"><div style={{ fontSize: "48px" }}>🏠</div><div style={{ color: "white", fontSize: "18px" }}>Loading unit...</div><div className="loading-bar-track"><div className="loading-bar-fill" /></div></div>;
//   if (fetchError || !unit) return <div className="unit-loading-screen"><div style={{ fontSize: "48px" }}>⚠️</div><h2 style={{ color: "white" }}>Unit Unavailable</h2><p style={{ color: "#666" }}>{fetchError || "Unit not found."}</p><button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>← Go Back</button></div>;

//   const gallery     = unit.gallery_images || [];
//   const hasPano     = !!unit.panorama_url;
//   const hasGal      = gallery.length > 0;
//   const hasRooms    = unit.rooms?.length > 0;
//   const isAvail     = unit.status?.toLowerCase() === "available";
//   const statusColor = getStatusColor(unit.status);
//   // FIX: use plotId (from URL) as the canonical identifier — consistent with API and useWishlist
//   const isWished    = wishedIds instanceof Set ? wishedIds.has(Number(plotId)) : false;

//   return (
//     <div className="unit-page">

//       {/* ── Wishlist login modal ─────────────────────────────────────────── */}
//       {loginModalOpen && (
//         <>
//           <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} />
//           <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "linear-gradient(135deg,#0f1623,#111827)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "16px", padding: "28px 28px 24px", width: "min(400px, 90vw)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>

//             {/* Modal header */}
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
//               <div style={{ color: "white", fontWeight: "800", fontSize: "17px" }}>
//                 {modalStep === "verify_email" ? "📧 Verify Email" : modalStep === "verify_phone" ? "📱 Verify Phone" : "❤️ Save to Wishlist"}
//               </div>
//               <button onClick={closeModal} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "22px", cursor: "pointer", lineHeight: 1 }}>×</button>
//             </div>

//             {/* FIX: OTP steps render inside the modal — registration triggers verify_email → verify_phone here */}
//             {modalStep === "verify_email" ? (
//               <StepOtp key="modal-otp-email" type="email"
//                 onVerify={handleModalVerifyEmail}
//                 onResend={() => handleModalResendOtp("email")}
//                 loading={authLoading} error={modalAuthError} setError={setModalAuthError}
//               />
//             ) : modalStep === "verify_phone" ? (
//               <StepOtp key="modal-otp-phone" type="phone"
//                 onVerify={handleModalVerifyPhone}
//                 onResend={() => handleModalResendOtp("phone")}
//                 loading={authLoading} error={modalAuthError} setError={setModalAuthError}
//               />
//             ) : (
//               <>
//                 {/* Login / Register tab switcher */}
//                 <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px" }}>
//                   {["login", "register"].map((tab) => (
//                     <button key={tab} onClick={() => { setModalStep(tab); setModalAuthError(""); }}
//                       style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "700", background: modalStep === tab ? "linear-gradient(135deg,#c9a96e,#a07840)" : "transparent", color: modalStep === tab ? "#000" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }}>
//                       {tab === "login" ? "Log In" : "Register"}
//                     </button>
//                   ))}
//                 </div>
//                 <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
//                   {modalStep === "login" ? "Log in to save this unit to your wishlist." : "Create an account to save this unit to your wishlist."}
//                 </p>
//                 {modalStep === "login" ? (
//                   <StepLogin form={loginForm} setForm={setLoginForm} onLogin={handleModalLogin} onSwitch={() => { setModalStep("register"); setModalAuthError(""); }} loading={authLoading} error={modalAuthError} />
//                 ) : (
//                   <StepRegister form={registerForm} setForm={setRegisterForm} onRegister={handleModalRegister} onSwitch={() => { setModalStep("login"); setModalAuthError(""); }} loading={authLoading} error={modalAuthError} />
//                 )}
//               </>
//             )}
//           </div>
//         </>
//       )}

//       {/* ── Header ── */}
//       <div className="unit-header">
//         <button className="unit-back-btn" onClick={handleBack}>← Floor</button>
//         <div className="unit-info">
//           <div className="unit-title-row">
//             <span className="unit-name">Unit {unit.plot_number}</span>
//             <span className="unit-status-badge" style={{ background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44` }}>{unit.status}</span>
//           </div>
//           <div className="unit-subtitle">{unit.plot_type} · {unit.plot_size} sqft{unit.direction ? ` · ${unit.direction}` : ""}</div>
//         </div>
//         <div className="unit-tabs">
//           <button className={`unit-tab${activeTab === "details"  ? " active" : ""}`} onClick={switchToDetails}>📋 Details</button>
//           {unit.payment_plans?.length > 0 && <button className={`unit-tab${activeTab === "payment" ? " active" : ""}`} onClick={() => { destroyViewer(); setActiveTab("payment"); }}>💳 Payment Plans</button>}
//           {hasPano && <button className={`unit-tab${activeTab === "panorama" ? " active" : ""}`} onClick={switchToPanorama}>🌐 360°</button>}
//           {hasGal  && <button className={`unit-tab${activeTab === "gallery"  ? " active" : ""}`} onClick={switchToGallery}>🖼 Gallery ({gallery.length})</button>}
//         </div>
//         <div className="unit-price-wrap">
//           {user && (
//             <button onClick={() => navigate("/dashboard")} title={`${user.name} — My Dashboard`}
//               style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "20px", padding: "5px 12px 5px 6px", cursor: "pointer", color: "#c9a96e", fontSize: "12px", fontWeight: "700", marginRight: "8px", flexShrink: 0 }}
//               onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.22)")}
//               onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.12)")}>
//               <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#000", flexShrink: 0 }}>{user.name?.[0]?.toUpperCase()}</span>
//               <span style={{ whiteSpace: "nowrap" }}>Dashboard</span>
//             </button>
//           )}
//           <div className="unit-price-box">
//             {unit.offer_price && <div className="unit-offer-price">{fmtPrice(unit.offer_price)}</div>}
//             <div className="unit-actual-price" style={{ color: unit.offer_price ? "rgba(255,255,255,0.35)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "11px" : "14px" }}>{fmtPrice(unit.actual_price)}</div>
//           </div>
//           {isAvail && <button className="book-now-btn" onClick={openBooking}>Book Now</button>}

//           {/* Wishlist button */}
//           {unit && (
//             <button onClick={() => {
//               if (!user?.token) {
//                 // Not logged in → open modal at login step
//                 setPendingWishlist(true);
//                 setModalStep("login");
//                 setModalAuthError("");
//                 setLoginModalOpen(true);
//               } else {
//                 // Logged in → toggle via useWishlist (has valid token)
//                 const willAdd = !isWished;
//                 toggleWish(Number(plotId));
//                 showToast(willAdd ? `❤️ Added to Wishlist — Unit ${unit.plot_number}` : `🤍 Removed from Wishlist — Unit ${unit.plot_number}`, willAdd ? "wishlist_add" : "wishlist_remove", 2800);
//               }
//             }}
//               title={isWished ? "Remove from Wishlist" : "Save to Wishlist"}
//               style={{ background: isWished ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${isWished ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.12)"}`, borderRadius: "8px", cursor: "pointer", padding: "6px 10px", fontSize: "18px", lineHeight: 1, transition: "all 0.2s", boxShadow: isWished ? "0 0 10px rgba(239,68,68,0.25)" : "none", transform: isWished ? "scale(1.08)" : "scale(1)", color: isWished ? "#ef4444" : "rgba(255,255,255,0.7)" }}>
//               {isWished ? "❤️" : "🤍"}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── Content ── */}
//       <div className="unit-content-area">
//         {activeTab === "details" && <UnitDetails unit={unit} currency={currency} fmtPrice={fmtPrice} statusColor={statusColor} />}
//         {activeTab === "payment" && <PaymentPlansTab plans={unit.payment_plans || []} fmtPrice={fmtPrice} currency={currency} unitPrice={unit.offer_price || unit.actual_price} />}
//         {activeTab === "panorama" && (
//           <>
//             <div ref={containerRef} className="psv-container-div" />
//             <div className={`pano-loader${isLoaded ? " gone" : ""}`}>
//               <div className="pano-loader-card">
//                 <div className="pano-loader-emoji">🏠</div>
//                 <div className="pano-loader-percent">{loadProgress}%</div>
//                 <div className="pano-loader-bar-track"><div className="pano-loader-bar-fill" style={{ width: `${loadProgress}%` }} /></div>
//                 <div className="pano-loader-text">{loadProgress < 40 ? "Preparing panorama..." : loadProgress < 80 ? "Loading image data..." : loadProgress < 100 ? "Almost ready..." : "✓ Ready"}</div>
//               </div>
//             </div>
//             {isLoaded && hasRooms && (
//               <div className="room-nav-strip">
//                 <span className="room-nav-label">Rooms</span>
//                 {unit.rooms.map((room) => (
//                   <button key={room.id} className="room-thumb-btn" onClick={() => navigate(`/unit/${plotId}/room/${room.id}`)}>
//                     {room.thumb_url ? <img src={room.thumb_url} alt={room.room_label} /> : <div className="room-thumb-placeholder">🚪</div>}
//                     <span>{room.room_label}</span>
//                   </button>
//                 ))}
//               </div>
//             )}
//             <div ref={labelRef} className="marker-label" />
//           </>
//         )}
//         {activeTab === "gallery" && hasGal && <GallerySlider gallery={gallery} plotId={plotId} navigate={navigate} />}
//       </div>

//       <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

//       {/* ── Booking sidebar ── */}
//       <div className={`booking-sidebar${sidebarOpen ? " open" : ""}`}>
//         <div className="sidebar-header">
//           <div>
//             <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Book Unit {unit.plot_number}</div>
//             <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "2px" }}>{unit.plot_type} · {unit.plot_size} sqft</div>
//           </div>
//           <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
//         </div>
//         <div className="sidebar-scroll">
//           <div className="unit-detail-card">
//             <div className="unit-detail-grid">
//               {[["Unit No", unit.plot_number], ["Type", unit.plot_type], ["Area", unit.plot_size ? `${unit.plot_size} sqft` : "—"], ["Direction", unit.direction || "—"], ["Rooms", unit.rooms?.length || 0], ["Gallery", gallery.length]].map(([lbl, val]) => (
//                 <div key={lbl}><div className="unit-detail-item-label">{lbl}</div><div className="unit-detail-item-value">{val}</div></div>
//               ))}
//             </div>
//             <div className="unit-price-row">
//               <div>
//                 <div className="unit-price-label">Price</div>
//                 {unit.offer_price && <div className="unit-offer-price-lg">{fmtPrice(unit.offer_price)}</div>}
//                 <div style={{ color: unit.offer_price ? "rgba(255,255,255,0.3)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "12px" : "18px", fontWeight: "600" }}>{fmtPrice(unit.actual_price)}</div>
//               </div>
//               <div className="unit-status-badge" style={{ background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44`, padding: "4px 12px", fontSize: "12px", fontWeight: "700" }}>{unit.status}</div>
//             </div>
//           </div>

//           {bookingStep === "broker_inactive" ? <BrokerInactiveScreen onClose={() => setSidebarOpen(false)} />
//            : bookingDone                     ? <BookingDone unit={unit} onClose={() => setSidebarOpen(false)} />
//            : bookingStep === "details"        ? <StepDetails user={user} onBook={() => user ? (hasPlans ? setBookingStep("plan") : setBookingStep("form")) : setBookingStep("login")} onLogout={logout} />
//            : bookingStep === "login"          ? <StepLogin form={loginForm} setForm={setLoginForm} onLogin={handleLogin} onSwitch={() => { setBookingStep("register"); setAuthError(""); }} loading={authLoading} error={authError} />
//            : bookingStep === "register"       ? <StepRegister form={registerForm} setForm={setRegisterForm} onRegister={handleRegister} onSwitch={() => { setBookingStep("login"); setAuthError(""); }} loading={authLoading} error={authError} />
//            : bookingStep === "verify_email"   ? <StepOtp key="otp-email"  type="email" onVerify={handleVerifyEmail}  onResend={() => handleResendOtp("email")}  loading={authLoading} error={authError} setError={setAuthError} />
//            : bookingStep === "verify_phone"   ? <StepOtp key="otp-phone"  type="phone" onVerify={handleVerifyPhone}  onResend={() => handleResendOtp("phone")}  loading={authLoading} error={authError} setError={setAuthError} />
//            : bookingStep === "plan"           ? <StepPlanSelect plans={unit.payment_plans || []} selected={selectedPlan} onSelect={setSelectedPlan} fmtPrice={fmtPrice} unitPrice={unit.actual_price} onNext={() => setBookingStep("form")} onBack={() => setBookingStep("details")} existingBookingId={existingBookingId} />
//            : bookingStep === "form"           ? <StepBookingForm user={user} form={bookingForm} setForm={setBookingForm} onSubmit={handleBooking} loading={authLoading} error={authError} selectedPlan={selectedPlan} plans={unit.payment_plans || []} onBack={() => hasPlans ? setBookingStep("plan") : setBookingStep("details")} unit={unit} existingBookingId={existingBookingId} />
//            : null}
//         </div>
//       </div>

//       <div ref={overlayRef} className="page-fade-overlay" />
//     </div>
//   );
// };

// /* ── Sub-components (unchanged logic, condensed) ─────────────────────────── */
// const BrokerInactiveScreen = ({ onClose }) => (
//   <div style={{ padding: "24px 0", textAlign: "center" }}>
//     <div style={{ fontSize: "48px", marginBottom: "14px" }}>🔒</div>
//     <div style={{ color: "white", fontWeight: "800", fontSize: "17px", marginBottom: "10px" }}>Account Inactive</div>
//     <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: "1.7", marginBottom: "20px" }}>Your broker account is currently <strong style={{ color: "#ef4444" }}>inactive</strong>. You cannot place bookings until your account is activated.</div>
//     <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#fca5a5", textAlign: "left" }}>
//       <div style={{ fontWeight: "700", marginBottom: "4px" }}>What to do next:</div>
//       <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: "1.8" }}><li>Contact your project administrator</li><li>Ask them to activate your broker account</li><li>You'll be able to book once your status is active</li></ul>
//     </div>
//     <button onClick={onClose} style={{ width: "100%", padding: "11px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Close</button>
//   </div>
// );

// const UnitDetails = ({ unit, currency, fmtPrice, statusColor }) => {
//   const hasDims = unit.room_dimensions?.length > 0, hasAmenities = unit.amenities?.length > 0;
//   const hasAreaData = unit.internal_area_sqft || unit.internal_area_sqm || unit.external_area_sqft;
//   return (
//     <div className="unit-details-page">
//       <div className="ud-hero"><div className="ud-hero-inner">
//         <div className="ud-stats">
//           {unit.bedrooms  != null && <StatPill icon="🛏"  label="Bedrooms"  value={unit.bedrooms}  />}
//           {unit.bathrooms != null && <StatPill icon="🚿"  label="Bathrooms" value={unit.bathrooms} />}
//           {unit.ensuites  != null && <StatPill icon="🛁"  label="Ensuites"  value={unit.ensuites}  />}
//           {unit.balconies != null && <StatPill icon="🌅"  label="Balconies" value={unit.balconies} />}
//           {unit.bedrooms == null && unit.rooms?.length > 0 && unit.rooms.map((r) => <StatPill key={r.id} icon="🚪" label={r.room_label} value="→" />)}
//         </div>
//         <div className="ud-hero-price">
//           {unit.offer_price && <div style={{ color: "#c9a96e", fontSize: "28px", fontWeight: "800" }}>{fmtPrice(unit.offer_price)}</div>}
//           <div style={{ color: unit.offer_price ? "rgba(255,255,255,0.4)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "14px" : "26px", fontWeight: "700" }}>{fmtPrice(unit.actual_price)}</div>
//           <div style={{ color: statusColor, fontSize: "12px", fontWeight: "600", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>● {unit.status}</div>
//         </div>
//       </div></div>
//       <div className="ud-body">
//         {hasAreaData && <Section title="📐 Floor Areas"><div className="ud-area-grid">
//           {unit.internal_area_sqft && <AreaCard label="Internal Area" sqft={unit.internal_area_sqft} sqm={unit.internal_area_sqm} accent="#c9a96e" />}
//           {unit.external_area_sqft && <AreaCard label="External Area" sqft={unit.external_area_sqft} sqm={unit.external_area_sqm} accent="#64748b" />}
//           {unit.internal_area_sqft && unit.external_area_sqft && <AreaCard label="Total Area" sqft={(parseFloat(unit.internal_area_sqft) + parseFloat(unit.external_area_sqft)).toFixed(2)} sqm={unit.internal_area_sqm && unit.external_area_sqm ? (parseFloat(unit.internal_area_sqm) + parseFloat(unit.external_area_sqm)).toFixed(2) : null} accent="#22c55e" />}
//         </div></Section>}
//         {hasDims      && <Section title="📏 Room Dimensions"><div className="ud-dims-list">{unit.room_dimensions.map((dim, i) => <DimRow key={i} dim={dim} />)}</div></Section>}
//         {hasAmenities && <Section title="✨ Amenities"><div className="ud-amenities-grid">{unit.amenities.map((a, i) => <div key={i} className="ud-amenity-chip"><span className="ud-amenity-icon">{amenityIcon(a)}</span><span>{a}</span></div>)}</div></Section>}
//         <Section title="ℹ️ Unit Info"><div className="ud-info-grid">
//           {[["Unit Number", unit.plot_number], ["Type", unit.plot_type], ["Total Size", unit.plot_size ? `${unit.plot_size} sqft` : "—"], ["Direction", unit.direction || "—"], ["Project", unit.project_name || "—"], ["Rooms", unit.rooms?.length || "—"]].map(([lbl, val]) => (
//             <div key={lbl} className="ud-info-item"><div className="ud-info-label">{lbl}</div><div className="ud-info-value">{val}</div></div>
//           ))}
//         </div></Section>
//         {unit.floor_plan_image && <Section title="🗺️ Floor Plan"><img src={unit.floor_plan_image} alt="Floor Plan" style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }} /></Section>}
//         {!hasAreaData && !hasDims && !hasAmenities && <div className="ud-empty"><div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px" }}>Detailed specifications coming soon.</div></div>}
//       </div>
//     </div>
//   );
// };
// const Section  = ({ title, children }) => <div className="ud-section"><div className="ud-section-title">{title}</div>{children}</div>;
// const StatPill = ({ icon, label, value }) => <div className="ud-stat-pill"><span className="ud-stat-icon">{icon}</span><div><div className="ud-stat-value">{value}</div><div className="ud-stat-label">{label}</div></div></div>;
// const AreaCard = ({ label, sqft, sqm, accent }) => (<div className="ud-area-card" style={{ borderColor: accent + "33" }}><div className="ud-area-label">{label}</div><div className="ud-area-sqft" style={{ color: accent }}>{Number(sqft).toLocaleString()} <span>sq ft</span></div>{sqm && <div className="ud-area-sqm">{Number(sqm).toLocaleString()} sq m</div>}{!sqm && sqft && <div className="ud-area-sqm">{(sqft / 10.764).toFixed(1)} sq m</div>}</div>);
// const DimRow   = ({ dim }) => {
//   const u = dim.unit || "m", w = parseFloat(dim.width), l = parseFloat(dim.length);
//   const wFt = u === "m" ? toFt(w) : w.toFixed(1), lFt = u === "m" ? toFt(l) : l.toFixed(1);
//   const wM  = u === "ft" ? (w / 3.28084).toFixed(1) : w.toFixed(1), lM = u === "ft" ? (l / 3.28084).toFixed(1) : l.toFixed(1);
//   const sqm = dim.area_sqm ? parseFloat(dim.area_sqm) : w && l ? u === "m" ? w * l : (w * l) / 10.7639 : null;
//   const sqft = dim.area_sqft ? parseFloat(dim.area_sqft) : sqm ? sqm * 10.7639 : null;
//   return <div className="ud-dim-row"><div className="ud-dim-label">{dim.label}</div><div className="ud-dim-measurements"><span className="ud-dim-primary">{wM} × {lM} m</span><span className="ud-dim-secondary">{wFt}' × {lFt}'</span>{sqm != null && <span className="ud-dim-area">{sqm.toFixed(1)} m² <span className="ud-dim-area-sep">/</span> {sqft.toFixed(1)} ft²</span>}</div></div>;
// };

// const TYPE_COLORS = { down_payment: { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" }, installment: { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" }, on_completion: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" }, on_handover: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" }, rental_guarantee: { bg: "#fce4ec", color: "#880e4f", border: "#f48fb1" }, custom: { bg: "#f5f5f5", color: "#424242", border: "#e0e0e0" } };
// const TYPE_ICONS = { down_payment: "💰", installment: "🔄", on_completion: "🏗️", on_handover: "🔑", rental_guarantee: "📈", custom: "⭐" };

// const PaymentPlansTab = ({ plans, fmtPrice, currency, unitPrice }) => {
//   const [activePlan, setActivePlan] = useState(0);
//   if (!plans?.length) return <div style={{ padding: "60px 20px", textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>💳</div><div style={{ fontSize: "16px", fontWeight: "600", color: "#e0e8f0" }}>No payment plans available</div></div>;
//   const basePrice = parseFloat(String(unitPrice || "0").replace(/[^0-9.]/g, "")) || 0;
//   const calcAmt   = (pct) => basePrice > 0 ? Math.round((basePrice * parseFloat(pct)) / 100) : null;
//   const plan      = plans[activePlan];
//   const totalPct  = plan.milestones.reduce((s, m) => s + (parseFloat(m.percentage) || 0), 0);
//   return (
//     <div style={{ padding: "20px 20px 40px", maxWidth: "680px", margin: "0 auto" }}>
//       {plans.length > 1 && <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>{plans.map((p, i) => <button key={p.id} onClick={() => setActivePlan(i)} style={{ padding: "8px 18px", borderRadius: "24px", cursor: "pointer", border: i === activePlan ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.1)", background: i === activePlan ? "rgba(201,169,110,0.15)" : "transparent", color: i === activePlan ? "#c9a96e" : "#6b7f95", fontWeight: i === activePlan ? "700" : "500", fontSize: "13px" }}>{p.name}</button>)}</div>}
//       <div style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "16px", padding: "20px 22px", marginBottom: "12px" }}>
//         <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
//           <div><div style={{ fontSize: "18px", fontWeight: "800", color: "#e8d5b0" }}>{plan.name}</div>{plan.description && <div style={{ fontSize: "13px", color: "#6b7f95", marginTop: "3px" }}>{plan.description}</div>}</div>
//           {totalPct === 100 && <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: "20px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: "11px", fontWeight: "700" }}>✓ 100%</span>}
//         </div>
//       </div>
//       <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" }}>
//         {plan.milestones.map((m, i) => {
//           const c = TYPE_COLORS[m.type] || TYPE_COLORS.custom, icon = TYPE_ICONS[m.type] || "⭐", isLast = i === plan.milestones.length - 1;
//           const displayAmt = m.calculated_amount ? fmtPrice(m.calculated_amount) : m.percentage && calcAmt(m.percentage) ? fmtPrice(calcAmt(m.percentage)) : m.fixed_amount ? fmtPrice(m.fixed_amount) : null;
//           return (
//             <div key={m.id || i} style={{ display: "flex", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
//               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "58px", flexShrink: 0, paddingTop: "18px" }}>
//                 <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: c.color }}>{i + 1}</div>
//                 {!isLast && <div style={{ width: "2px", flex: 1, background: "rgba(255,255,255,0.06)", minHeight: "24px", marginTop: "4px" }} />}
//               </div>
//               <div style={{ flex: 1, padding: "16px 18px 16px 0" }}>
//                 <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}><span style={{ fontSize: "16px" }}>{icon}</span><span style={{ padding: "2px 9px", borderRadius: "8px", fontSize: "10px", fontWeight: "700", background: c.bg, color: c.color, textTransform: "uppercase" }}>{m.type_label || m.type?.replace(/_/g, " ")}</span></div>
//                     <div style={{ fontSize: "15px", fontWeight: "700", color: "#d8e6f0" }}>{m.label}</div>
//                   </div>
//                   <div style={{ textAlign: "right", flexShrink: 0 }}>
//                     {m.percentage > 0 && <div style={{ fontSize: "24px", fontWeight: "900", color: "#c9a96e" }}>{m.percentage}%</div>}
//                     {displayAmt && <div style={{ fontSize: "12px", color: "#5a7a9a", marginTop: "2px" }}>≈ {displayAmt}</div>}
//                   </div>
//                 </div>
//                 {(m.due_date || m.due_after_days) && <div style={{ marginTop: "6px", fontSize: "12px", color: "#5a7a9a" }}>📅 {m.due_date ? `Due by ${m.due_date}` : `Due ${m.due_after_days} days after booking`}</div>}
//                 {m.note && <div style={{ marginTop: "7px", fontSize: "12px", color: "#7a90a4", fontStyle: "italic", padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", borderLeft: "2px solid rgba(201,169,110,0.3)" }}>{m.note}</div>}
//               </div>
//             </div>
//           );
//         })}
//         <div style={{ padding: "14px 20px 14px 58px", background: "rgba(0,0,0,0.15)", borderTop: "1px solid rgba(201,169,110,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <span style={{ fontSize: "13px", color: "#5a7a9a", fontWeight: "600" }}>Total payment mapped</span>
//           <span style={{ fontSize: "18px", fontWeight: "800", color: totalPct === 100 ? "#22c55e" : totalPct > 100 ? "#ef4444" : "#c9a96e" }}>{totalPct.toFixed(0)}%{totalPct === 100 ? " ✓" : ""}</span>
//         </div>
//       </div>
//       <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#3a4f62" }}>Amounts shown are estimates. Final figures confirmed at booking.</div>
//     </div>
//   );
// };

// const GallerySlider = ({ gallery, plotId, navigate }) => {
//   const [idx, setIdx] = useState(0);
//   return (
//     <div className="gallery-slider">
//       <div className="gallery-main">
//         <img src={gallery[idx]} alt={`Gallery ${idx + 1}`} className="gallery-img" />
//         {gallery.length > 1 && <><button className="gallery-nav-btn prev" onClick={() => setIdx((i) => (i - 1 + gallery.length) % gallery.length)}>‹</button><button className="gallery-nav-btn next" onClick={() => setIdx((i) => (i + 1) % gallery.length)}>›</button></>}
//         <div className="gallery-counter">{idx + 1} / {gallery.length}</div>
//         <button className="gallery-360-btn" onClick={() => navigate(`/unit/${plotId}/gallery/${idx}`)}>🌐 View 360°</button>
//       </div>
//       {gallery.length > 1 && <div className="gallery-thumbs">{gallery.map((img, i) => <img key={i} src={img} alt="" className={`gallery-thumb ${i === idx ? "active" : "inactive"}`} onClick={() => setIdx(i)} />)}</div>}
//     </div>
//   );
// };

// const COUNTRY_CODES = [
//   { code: "+91", flag: "🇮🇳", name: "India" }, { code: "+971", flag: "🇦🇪", name: "UAE" }, { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
//   { code: "+974", flag: "🇶🇦", name: "Qatar" }, { code: "+965", flag: "🇰🇼", name: "Kuwait" }, { code: "+973", flag: "🇧🇭", name: "Bahrain" },
//   { code: "+968", flag: "🇴🇲", name: "Oman" }, { code: "+1", flag: "🇺🇸", name: "USA / Canada" }, { code: "+44", flag: "🇬🇧", name: "UK" },
//   { code: "+61", flag: "🇦🇺", name: "Australia" }, { code: "+65", flag: "🇸🇬", name: "Singapore" }, { code: "+60", flag: "🇲🇾", name: "Malaysia" },
//   { code: "+86", flag: "🇨🇳", name: "China" }, { code: "+81", flag: "🇯🇵", name: "Japan" }, { code: "+49", flag: "🇩🇪", name: "Germany" },
//   { code: "+33", flag: "🇫🇷", name: "France" }, { code: "+39", flag: "🇮🇹", name: "Italy" }, { code: "+34", flag: "🇪🇸", name: "Spain" },
//   { code: "+7",  flag: "🇷🇺", name: "Russia" }, { code: "+55", flag: "🇧🇷", name: "Brazil" }, { code: "+92", flag: "🇵🇰", name: "Pakistan" },
//   { code: "+880",flag: "🇧🇩", name: "Bangladesh" }, { code: "+94", flag: "🇱🇰", name: "Sri Lanka" }, { code: "+977", flag: "🇳🇵", name: "Nepal" },
//   { code: "+20", flag: "🇪🇬", name: "Egypt" }, { code: "+234",flag: "🇳🇬", name: "Nigeria" }, { code: "+27", flag: "🇿🇦", name: "South Africa" },
//   { code: "+254",flag: "🇰🇪", name: "Kenya" }, { code: "+62", flag: "🇮🇩", name: "Indonesia" }, { code: "+63", flag: "🇵🇭", name: "Philippines" },
//   { code: "+66", flag: "🇹🇭", name: "Thailand" }, { code: "+84", flag: "🇻🇳", name: "Vietnam" }, { code: "+82", flag: "🇰🇷", name: "South Korea" },
//   { code: "+90", flag: "🇹🇷", name: "Turkey" }, { code: "+98", flag: "🇮🇷", name: "Iran" }, { code: "+964",flag: "🇮🇶", name: "Iraq" },
//   { code: "+961",flag: "🇱🇧", name: "Lebanon" }, { code: "+962",flag: "🇯🇴", name: "Jordan" },
// ];

// const CountryCodePicker = ({ value, onChange }) => {
//   const [open, setOpen] = useState(false), [search, setSearch] = useState("");
//   const selected = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];
//   const filtered = search.trim() ? COUNTRY_CODES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)) : COUNTRY_CODES;
//   return (
//     <div style={{ position: "relative" }}>
//       <button type="button" onClick={() => { setOpen((o) => !o); setSearch(""); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap", minWidth: "82px" }}>
//         <span style={{ fontSize: "16px" }}>{selected.flag}</span><span>{selected.code}</span><span style={{ fontSize: "10px", opacity: 0.5 }}>▼</span>
//       </button>
//       {open && (
//         <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999, background: "#1a2535", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", overflow: "hidden", minWidth: "220px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
//           <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
//             <input autoFocus type="text" placeholder="Search country..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "7px 10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
//           </div>
//           <div style={{ maxHeight: "240px", overflowY: "auto" }}>
//             {filtered.map((c) => (
//               <div key={c.code + c.name} onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
//                 style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", background: c.code === value ? "rgba(201,169,110,0.15)" : "transparent", color: c.code === value ? "#c9a96e" : "rgba(255,255,255,0.8)" }}
//                 onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
//                 onMouseOut={(e)  => (e.currentTarget.style.background = c.code === value ? "rgba(201,169,110,0.15)" : "transparent")}>
//                 <span style={{ fontSize: "16px", flexShrink: 0 }}>{c.flag}</span>
//                 <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
//                 <span style={{ opacity: 0.5, fontSize: "12px", flexShrink: 0 }}>{c.code}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const StepDetails  = ({ user, onBook, onLogout }) => (
//   <div>
//     {user ? <div className="logged-in-card"><div><div className="logged-in-label">✓ Logged in as</div><div className="logged-in-name">{user.name}</div><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{user.email}</div></div><button className="logout-btn" onClick={onLogout}>Logout</button></div>
//       : <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>To book this unit, please log in or create an account. Both email and phone will be verified.</p>}
//     <button className="book-btn" onClick={onBook}>{user ? "Continue to Booking →" : "Login / Register to Book →"}</button>
//   </div>
// );

// const StepLogin = ({ form, setForm, onLogin, onSwitch, loading, error }) => (
//   <div>
//     <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "16px" }}>Login to your account</div>
//     {error && <ErrorBox msg={error} />}
//     <input className="sidebar-input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
//     <input className="sidebar-input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && onLogin()} style={{ marginBottom: "16px" }} />
//     <button className="book-btn" onClick={onLogin} disabled={loading || !form.email || !form.password}>{loading ? "Logging in..." : "Login →"}</button>
//     {onSwitch && <p style={{ textAlign: "center", marginTop: "14px", color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Don't have an account? <button className="auth-link" onClick={onSwitch}>Register</button></p>}
//   </div>
// );

// const StepRegister = ({ form, setForm, onRegister, onSwitch, loading, error }) => {
//   const [showPass, setShowPass] = useState(false);
//   const strength = !form.password ? 0 : [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;
//   const strengthColor = ["#ef4444","#f59e0b","#f59e0b","#22c55e","#22c55e"][strength];
//   return (
//     <div>
//       <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Create an account</div>
//       <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "14px" }}>We'll verify your email and phone number</div>
//       {error && <ErrorBox msg={error} />}
//       <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
//         {[{ v: "user", label: "👤 Buyer" }, { v: "broker", label: "🤝 Broker" }].map(({ v, label }) => (
//           <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, role: v }))} style={{ flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", border: form.role === v ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.1)", background: form.role === v ? "rgba(201,169,110,0.15)" : "transparent", color: form.role === v ? "#c9a96e" : "rgba(255,255,255,0.5)", fontWeight: form.role === v ? "700" : "400" }}>{label}</button>
//         ))}
//       </div>
//       <input className="sidebar-input" type="text"  placeholder="Full Name *"     value={form.name}           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
//       {form.role === "broker" && <input className="sidebar-input" type="text" placeholder="Company / Agency Name" value={form.broker_company} onChange={(e) => setForm((f) => ({ ...f, broker_company: e.target.value }))} />}
//       <input className="sidebar-input" type="email" placeholder="Email Address *" value={form.email}          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
//       <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
//         <CountryCodePicker value={form.country_code} onChange={(v) => setForm((f) => ({ ...f, country_code: v }))} />
//         <input style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px" }} type="tel" placeholder="Phone number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} />
//       </div>
//       <div style={{ position: "relative", marginBottom: "4px" }}>
//         <input style={{ width: "100%", padding: "10px 40px 10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px", boxSizing: "border-box" }} type={showPass ? "text" : "password"} placeholder="Password (min 8 chars) *" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
//         <button type="button" onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "14px" }}>{showPass ? "🙈" : "👁"}</button>
//       </div>
//       {form.password && <div style={{ marginBottom: "12px" }}><div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>{[1,2,3,4].map((i) => <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }} />)}</div><div style={{ fontSize: "11px", color: strengthColor }}>{["","Weak","Fair","Good","Strong"][strength]}</div></div>}
//       <button className="book-btn" style={{ marginTop: "6px" }} onClick={onRegister} disabled={loading || !form.name || !form.email || !form.phone || !form.password || form.password.length < 8}>{loading ? "Creating account..." : "Register & Verify →"}</button>
//       <p style={{ textAlign: "center", marginTop: "14px", color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Already have an account? <button className="auth-link" onClick={onSwitch}>Login</button></p>
//     </div>
//   );
// };

// const StepOtp = ({ type, onVerify, onResend, loading, error, setError }) => {
//   const [otp, setOtp] = useState(["","","","","",""]);
//   const refs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
//   const isEmail = type === "email";
//   const handleKey = (i, e) => { if (e.key === "Backspace") { if (otp[i]) { const n=[...otp]; n[i]=""; setOtp(n); } else if (i > 0) refs[i-1].current?.focus(); } };
//   const handleChange = (i, val) => { const digit = val.replace(/\D/g,"").slice(-1), n = [...otp]; n[i] = digit; setOtp(n); if (digit && i < 5) refs[i+1].current?.focus(); if (digit && i === 5) { const full=[...n].join(""); if (full.length===6) { setError(""); onVerify(full); } } };
//   const handlePaste = (e) => { const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6); if (p.length===6) { setOtp(p.split("")); refs[5].current?.focus(); setError(""); onVerify(p); } };
//   const fullOtp = otp.join("");
//   return (
//     <div>
//       <div style={{ textAlign: "center", marginBottom: "20px" }}>
//         <div style={{ fontSize: "36px", marginBottom: "8px" }}>{isEmail ? "📧" : "📱"}</div>
//         <div style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>Verify your {isEmail ? "email" : "phone"}</div>
//         <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "6px" }}>Enter the 6-digit code sent to your {isEmail ? "email" : "phone"}.</div>
//       </div>
//       {error && <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "12px", background: error.startsWith("✓") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${error.startsWith("✓") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, color: error.startsWith("✓") ? "#22c55e" : "#fca5a5" }}>{error}</div>}
//       <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }} onPaste={handlePaste}>
//         {otp.map((digit, i) => <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)} style={{ width: "44px", height: "52px", textAlign: "center", fontSize: "22px", fontWeight: "700", background: digit ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.07)", border: `2px solid ${digit ? "#c9a96e" : "rgba(255,255,255,0.12)"}`, borderRadius: "10px", color: "white", outline: "none" }} />)}
//       </div>
//       <button className="book-btn" onClick={() => { if (fullOtp.length===6) onVerify(fullOtp); }} disabled={loading || fullOtp.length < 6}>{loading ? "Verifying..." : "Verify Code →"}</button>
//       <div style={{ textAlign: "center", marginTop: "16px" }}><span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Didn't receive the code? </span><button className="auth-link" onClick={() => { setOtp(["","","","","",""]); onResend(); }} disabled={loading}>Resend</button></div>
//     </div>
//   );
// };

// const StepPlanSelect = ({ plans, selected, onSelect, fmtPrice, unitPrice, onNext, onBack, existingBookingId }) => {
//   const [expanded, setExpanded] = useState(null);
//   const price = parseFloat(String(unitPrice || "0").replace(/,/g, "")) || 0;
//   const calcAmt = (pct) => price > 0 ? fmtPrice(((price * pct) / 100).toFixed(0)) : null;
//   return (
//     <div>
//       <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Choose a Payment Plan</div>
//       <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "14px" }}>Select how you'd like to pay for this unit</div>
//       <div onClick={() => onSelect(null)} style={{ padding: "12px 14px", borderRadius: "10px", marginBottom: "8px", cursor: "pointer", border: selected === null ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.08)", background: selected === null ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)" }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <div><div style={{ color: "#e0e8f0", fontWeight: "600", fontSize: "13px" }}>Full Payment</div><div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "2px" }}>Pay the full amount upfront</div></div>
//           <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: selected === null ? "#c9a96e" : "rgba(255,255,255,0.2)", background: selected === null ? "#c9a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{selected === null && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}</div>
//         </div>
//       </div>
//       {plans.map((plan) => {
//         const isSelected = selected === plan.id, isExpanded = expanded === plan.id;
//         const totalPct = plan.milestones.reduce((s, m) => s + (parseFloat(m.percentage) || 0), 0);
//         return (
//           <div key={plan.id} style={{ marginBottom: "8px" }}>
//             <div onClick={() => { onSelect(plan.id); setExpanded(isExpanded ? null : plan.id); }} style={{ padding: "12px 14px", borderRadius: "10px", cursor: "pointer", border: isSelected ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.08)", background: isSelected ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)" }}>
//               <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ color: "#e0e8f0", fontWeight: "700", fontSize: "13px" }}>{plan.name}</div>
//                   {plan.description && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>{plan.description}</div>}
//                   {!isExpanded && <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>{plan.milestones.slice(0,2).map((m,i) => <span key={i} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "8px", background: "rgba(201,169,110,0.15)", color: "#c9a96e", fontWeight: "600" }}>{m.label}{m.percentage ? ` · ${m.percentage}%` : ""}</span>)}{plan.milestones.length > 2 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+{plan.milestones.length - 2} more</span>}</div>}
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
//                   <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: isSelected ? "#c9a96e" : "rgba(255,255,255,0.2)", background: isSelected ? "#c9a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{isSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}</div>
//                   <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : plan.id); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "11px", cursor: "pointer", padding: 0 }}>{isExpanded ? "▲ Less" : "▼ Details"}</button>
//                 </div>
//               </div>
//             </div>
//             {isExpanded && (
//               <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "0 0 10px 10px", border: "1px solid rgba(201,169,110,0.15)", borderTop: "none", paddingTop: "4px" }}>
//                 {plan.milestones.map((m, i) => { const c = TYPE_COLORS[m.type] || TYPE_COLORS.custom, icon = TYPE_ICONS[m.type] || "⭐", amt = m.calculated_amount ? fmtPrice(m.calculated_amount) : m.percentage ? calcAmt(m.percentage) : null; return (<div key={i} style={{ padding: "10px 14px", borderBottom: i < plan.milestones.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}><span style={{ fontSize: "16px" }}>{icon}</span><div><span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "8px", background: c.bg, color: c.color, fontWeight: "700" }}>{m.type_label}</span> <span style={{ color: "#d0dce8", fontSize: "12px", fontWeight: "600" }}>{m.label}</span></div></div><div style={{ textAlign: "right" }}>{m.percentage > 0 && <div style={{ color: "#c9a96e", fontWeight: "800", fontSize: "15px" }}>{m.percentage}%</div>}{amt && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>≈ {amt}</div>}</div></div></div>); })}
//                 <div style={{ padding: "8px 14px", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.05)" }}><span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Total</span><span style={{ color: totalPct === 100 ? "#22c55e" : "#c9a96e", fontWeight: "700", fontSize: "13px" }}>{totalPct.toFixed(0)}%{totalPct === 100 ? " ✓" : ""}</span></div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//       <button className="book-btn" onClick={onNext} style={{ marginTop: "12px" }}>{existingBookingId ? "Update Plan & Pay →" : "Continue →"}</button>
//       <button type="button" onClick={onBack} style={{ display: "block", width: "100%", marginTop: "8px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.4)", padding: "10px", cursor: "pointer", fontSize: "13px" }}>← Back</button>
//     </div>
//   );
// };

// const StepBookingForm = ({ user, form, setForm, onSubmit, loading, error, selectedPlan, plans, onBack, unit, existingBookingId }) => {
//   const plan = plans.find((p) => p.id === selectedPlan), isBroker = user?.role === "broker";
//   const price = parseFloat((unit?.offer_price || unit?.actual_price || "").toString().replace(/[^0-9.]/g, "")) || 0;
//   const commissionRate = parseFloat(user?.commission_rate || 2), commissionAmt = price > 0 ? ((price * commissionRate) / 100).toFixed(2) : null;
//   const canSubmit = isBroker ? form.name && form.phone && form.client_name && form.client_phone : form.name && form.phone;
//   return (
//     <div>
//       <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>{existingBookingId ? "Update Payment Plan" : "Confirm Booking"}</div>
//       <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "12px" }}>{existingBookingId ? <span>Updating plan for booking <span style={{ color: "#c9a96e" }}>#{existingBookingId}</span></span> : isBroker ? <>Booking as broker <span style={{ color: "#c9a96e" }}>{user?.name}</span></> : <>Booking as <span style={{ color: "#c9a96e" }}>{user?.name}</span></>}</div>
//       {plan && <div style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px" }}><div style={{ color: "#c9a96e", fontWeight: "700", marginBottom: "2px" }}>💳 {plan.name}</div><div style={{ color: "rgba(255,255,255,0.45)" }}>Selected payment plan</div><button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "#8fa0b4", fontSize: "11px", padding: "0", marginTop: "4px", cursor: "pointer", textDecoration: "underline" }}>Change plan</button></div>}
//       {error && <ErrorBox msg={error} />}
//       {isBroker ? (
//         <>
//           {commissionAmt && <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px" }}>Your Commission</div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}>₹{parseFloat(commissionAmt).toLocaleString("en-IN")}</div><div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{commissionRate}% of price</div></div></div>}
//           <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", textTransform: "uppercase" }}>Your Contact Info</div>
//           <input className="sidebar-input" type="text" placeholder="Your Name *"  value={form.name}  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
//           <input className="sidebar-input" type="tel"  placeholder="Your Phone *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
//           <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", marginTop: "8px", textTransform: "uppercase" }}>Client Details</div>
//           <input className="sidebar-input" type="text" placeholder="Client Full Name *" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} />
//           <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}><CountryCodePicker value={form.client_country_code} onChange={(v) => setForm((f) => ({ ...f, client_country_code: v }))} /><input style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px" }} type="tel" placeholder="Client Phone *" value={form.client_phone} onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value.replace(/\D/g, "") }))} /></div>
//           <input className="sidebar-input" type="email" placeholder="Client Email (optional)" value={form.client_email} onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))} />
//           <textarea className="sidebar-input" placeholder="Notes (optional)" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "none", marginBottom: "16px" }} />
//         </>
//       ) : (
//         <>
//           <input className="sidebar-input" type="text" placeholder="Your Name *"   value={form.name}  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
//           <input className="sidebar-input" type="tel"  placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
//           <textarea className="sidebar-input" placeholder="Message / Notes (optional)" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "none", marginBottom: "16px" }} />
//         </>
//       )}
//       <button className="book-btn" onClick={onSubmit} disabled={loading || !canSubmit}>{loading ? "Submitting..." : existingBookingId ? "✓ Update Plan & Proceed to Payment" : isBroker ? "✓ Submit Booking for Client" : "✓ Confirm Booking"}</button>
//     </div>
//   );
// };

// const BookingDone = ({ unit, onClose }) => (
//   <div className="booking-done">
//     <div className="booking-done-emoji">🎉</div>
//     <div className="booking-done-title">Booking Received!</div>
//     <div className="booking-done-text">Your enquiry for Unit {unit.plot_number} has been submitted.<br />Our team will contact you shortly.</div>
//     <button className="book-btn" onClick={onClose}>Close</button>
//   </div>
// );

// const ErrorBox = ({ msg }) => <div className="error-box">⚠️ {msg}</div>;

// export default UnitPage;

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, setUser, clearUser } from "../redux/authSlice";
// import { useWishlist } from "../hooks/useWishlist";
// import { useToast } from "../context/ToastContext";
// import { Viewer } from "@photo-sphere-viewer/core";
// import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
// import "@photo-sphere-viewer/core/index.css";
// import "@photo-sphere-viewer/markers-plugin/index.css";
// import "../styles/UnitPage.css";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";
// const toRad = (deg) => parseFloat((deg * (Math.PI / 180)).toFixed(6));

// const AMENITY_ICONS = {
//   "Swimming Pool": "🏊", Gym: "🏋️", Parking: "🚗", "24/7 Security": "🔒",
//   "Club House": "🏛️", "Children Play Area": "🛝", "Jogging Track": "🏃",
//   Garden: "🌿", Lift: "🛗", "Power Backup": "⚡", "CCTV Surveillance": "📹",
//   Intercom: "📞", "Visitor Parking": "🅿️", Terrace: "🏙️",
// };
// const amenityIcon = (name) => AMENITY_ICONS[name] || "✨";
// const toFt  = (m)  => (m * 3.28084).toFixed(1);
// const toFt2 = (m2) => (m2 * 10.7639).toFixed(1);

// // ── Tax/Fee utility helpers ───────────────────────────────────────────────────
// /**
//  * Given a fee_breakdown object from the API, compute the per-milestone amount
//  * including its proportional tax and fees share.
//  *
//  * @param {number} milestonePercent  - e.g. 20 (for 20%)
//  * @param {object} feeBreakdown      - fee_breakdown from booking or /api/bookings/{id}
//  * @returns {{ base, tax, fees, total, breakdown }}
//  */
// const computeMilestoneAmounts = (milestonePercent, feeBreakdown) => {
//   if (!feeBreakdown || !milestonePercent) return null;
//   const pct   = parseFloat(milestonePercent) / 100;
//   const base  = (feeBreakdown.unit_price        || 0) * pct;
//   const tax   = (feeBreakdown.tax_amount        || 0) * pct;
//   const proc  = (feeBreakdown.processing_fee    || 0) * pct;
//   const stamp = (feeBreakdown.stamp_duty        || 0) * pct;
//   const reg   = (feeBreakdown.registration_fee  || 0) * pct;
//   const maint = (feeBreakdown.maintenance_charge|| 0) * pct;
//   const cf1   = (feeBreakdown.custom_fee1       || 0) * pct;
//   const cf2   = (feeBreakdown.custom_fee2       || 0) * pct;
//   const fees  = proc + stamp + reg + maint + cf1 + cf2;
//   const total = base + tax + fees;
//   return { base, tax, fees, total,
//     breakdown: { proc, stamp, reg, maint, cf1, cf2 },
//     labels: feeBreakdown.fee_labels || {},
//     taxLabel: feeBreakdown.tax_label || "Tax",
//     taxRate: feeBreakdown.tax_rate || 0,
//     taxSystem: feeBreakdown.tax_system || "",
//     currencySymbol: feeBreakdown.currency_symbol || "₹",
//   };
// };

// // ── TaxBreakdownBadge: inline mini chip shown next to a milestone amount ──────
// const TaxBreakdownBadge = ({ milestonePercent, feeBreakdown, sym = "₹" }) => {
//   const [open, setOpen] = useState(false);
//   const data = computeMilestoneAmounts(milestonePercent, feeBreakdown);
//   if (!data || (!data.tax && !data.fees)) return null;
//   const f = (n) => `${sym}${Math.round(n).toLocaleString("en-IN")}`;
//   const extraFees = [
//     data.breakdown.proc  > 0 && { label: data.labels.processing   || "Processing Fee",   val: data.breakdown.proc  },
//     data.breakdown.stamp > 0 && { label: data.labels.stamp_duty   || "Stamp Duty",        val: data.breakdown.stamp },
//     data.breakdown.reg   > 0 && { label: data.labels.registration || "Registration Fee",  val: data.breakdown.reg   },
//     data.breakdown.maint > 0 && { label: data.labels.maintenance  || "Maintenance",       val: data.breakdown.maint },
//     data.breakdown.cf1   > 0 && { label: data.labels.custom1      || "Custom Fee 1",      val: data.breakdown.cf1   },
//     data.breakdown.cf2   > 0 && { label: data.labels.custom2      || "Custom Fee 2",      val: data.breakdown.cf2   },
//   ].filter(Boolean);

//   return (
//     <span style={{ position: "relative", display: "inline-block" }}>
//       <button
//         type="button"
//         onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
//         style={{
//           background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)",
//           borderRadius: "6px", padding: "1px 6px", fontSize: "10px", fontWeight: "700",
//           color: "#f59e0b", cursor: "pointer", lineHeight: "1.6", marginLeft: "6px",
//         }}
//       >
//         +tax
//       </button>
//       {open && (
//         <div onClick={(e) => e.stopPropagation()} style={{
//           position: "absolute", bottom: "calc(100% + 6px)", right: 0, zIndex: 999,
//           background: "#1a2535", border: "1px solid rgba(201,169,110,0.25)",
//           borderRadius: "10px", padding: "12px 14px", minWidth: "220px",
//           boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
//         }}>
//           <div style={{ fontSize: "10px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
//             Charges for this instalment
//           </div>
//           {/* Base */}
//           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", paddingBottom: "4px" }}>
//             <span>Unit price portion</span><span>{f(data.base)}</span>
//           </div>
//           {/* Additional fees */}
//           {extraFees.map((fee, i) => (
//             <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", paddingBottom: "4px" }}>
//               <span>{fee.label}</span><span>{f(fee.val)}</span>
//             </div>
//           ))}
//           {/* Tax */}
//           {data.tax > 0 && (
//             <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#f59e0b", paddingBottom: "4px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "6px", marginTop: "2px" }}>
//               <span>
//                 {data.taxLabel}
//                 {data.taxRate > 0 && <span style={{ opacity: 0.7, marginLeft: "4px" }}>({data.taxRate}%{data.taxSystem ? ` · ${data.taxSystem.toUpperCase()}` : ""})</span>}
//               </span>
//               <span>{f(data.tax)}</span>
//             </div>
//           )}
//           {/* Total */}
//           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "800", color: "#c9a96e", borderTop: "1px solid rgba(201,169,110,0.3)", paddingTop: "7px", marginTop: "4px" }}>
//             <span>Instalment total</span><span>{f(data.total)}</span>
//           </div>
//           <button
//             type="button"
//             onClick={(e) => { e.stopPropagation(); setOpen(false); }}
//             style={{ position: "absolute", top: "6px", right: "8px", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}
//           >×</button>
//         </div>
//       )}
//     </span>
//   );
// };

// // ── MilestoneTaxRow: expanded view inside StepPlanSelect milestone details ────
// const MilestoneTaxRow = ({ milestone, feeBreakdown, fmtPrice }) => {
//   if (!feeBreakdown || !milestone.percentage) return null;
//   const data = computeMilestoneAmounts(milestone.percentage, feeBreakdown);
//   if (!data || (!data.tax && !data.fees)) return null;
//   const sym = data.currencySymbol;
//   const f = (n) => `${sym}${Math.round(n).toLocaleString("en-IN")}`;
//   const extraFees = [
//     data.breakdown.proc  > 0 && { label: data.labels.processing   || "Processing Fee",   val: data.breakdown.proc  },
//     data.breakdown.stamp > 0 && { label: data.labels.stamp_duty   || "Stamp Duty",        val: data.breakdown.stamp },
//     data.breakdown.reg   > 0 && { label: data.labels.registration || "Registration Fee",  val: data.breakdown.reg   },
//     data.breakdown.maint > 0 && { label: data.labels.maintenance  || "Maintenance",       val: data.breakdown.maint },
//     data.breakdown.cf1   > 0 && { label: data.labels.custom1      || "Custom Fee 1",      val: data.breakdown.cf1   },
//     data.breakdown.cf2   > 0 && { label: data.labels.custom2      || "Custom Fee 2",      val: data.breakdown.cf2   },
//   ].filter(Boolean);

//   return (
//     <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "8px", padding: "10px 12px", marginTop: "6px" }}>
//       <div style={{ fontSize: "10px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>Tax &amp; fees for this instalment</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8899aa" }}>
//           <span>Base ({milestone.percentage}% of unit price)</span><span>{f(data.base)}</span>
//         </div>
//         {extraFees.map((fee, i) => (
//           <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8899aa" }}>
//             <span>{fee.label}</span><span>{f(fee.val)}</span>
//           </div>
//         ))}
//         {data.tax > 0 && (
//           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#f59e0b", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "5px", marginTop: "2px" }}>
//             <span>{data.taxLabel}{data.taxRate > 0 ? ` (${data.taxRate}%)` : ""}</span>
//             <span>{f(data.tax)}</span>
//           </div>
//         )}
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "800", color: "#c9a96e", borderTop: "1px solid rgba(201,169,110,0.25)", paddingTop: "6px", marginTop: "3px" }}>
//           <span>Instalment total</span><span>{f(data.total)}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── BookingSummaryTaxCard: shown in StepBookingForm before submit ──────────────
// const BookingSummaryTaxCard = ({ feeBreakdown, selectedPlan, plans, unit, sym = "₹" }) => {
//   if (!feeBreakdown?.tax_enabled && !feeBreakdown?.processing_fee && !feeBreakdown?.stamp_duty) return null;
//   const f = (n) => `${sym}${parseFloat(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   const labels = feeBreakdown.fee_labels || {};

//   const extraFees = [
//     feeBreakdown.processing_fee    > 0 && { label: labels.processing   || "Processing Fee",   val: feeBreakdown.processing_fee    },
//     feeBreakdown.stamp_duty        > 0 && { label: labels.stamp_duty   || "Stamp Duty",       val: feeBreakdown.stamp_duty         },
//     feeBreakdown.registration_fee  > 0 && { label: labels.registration || "Registration Fee", val: feeBreakdown.registration_fee   },
//     feeBreakdown.maintenance_charge> 0 && { label: labels.maintenance  || "Maintenance",      val: feeBreakdown.maintenance_charge  },
//     feeBreakdown.custom_fee1       > 0 && { label: labels.custom1      || "Custom Fee 1",     val: feeBreakdown.custom_fee1        },
//     feeBreakdown.custom_fee2       > 0 && { label: labels.custom2      || "Custom Fee 2",     val: feeBreakdown.custom_fee2        },
//   ].filter(Boolean);

//   const plan     = plans.find((p) => p.id === selectedPlan);
//   const firstMs  = plan?.milestones?.[0];
//   const firstPct = firstMs?.percentage ? parseFloat(firstMs.percentage) / 100 : 1;
//   const dueNow   = feeBreakdown.total_amount * (plan ? firstPct : 1);

//   return (
//     <div style={{
//       background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.25)",
//       borderRadius: "10px", padding: "14px 14px", marginBottom: "16px",
//     }}>
//       <div style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
//         📄 Payment Breakdown
//       </div>

//       {/* Unit price */}
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", marginBottom: "5px" }}>
//         <span>Unit Price</span><span>{f(feeBreakdown.unit_price)}</span>
//       </div>

//       {/* Extra fees */}
//       {extraFees.map((fee, i) => (
//         <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", marginBottom: "5px" }}>
//           <span>{fee.label}</span><span>{f(fee.val)}</span>
//         </div>
//       ))}

//       {/* Tax */}
//       {feeBreakdown.tax_amount > 0 && (
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#f59e0b", fontWeight: "600", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "7px", marginTop: "4px", marginBottom: "5px" }}>
//           <span>
//             {feeBreakdown.tax_label || "Tax"}
//             {feeBreakdown.tax_rate > 0 && (
//               <span style={{ fontSize: "10px", marginLeft: "5px", opacity: 0.8 }}>
//                 ({feeBreakdown.tax_rate}%{feeBreakdown.tax_system ? ` · ${feeBreakdown.tax_system.toUpperCase()}` : ""}{feeBreakdown.tax_inclusive ? " · Incl." : ""})
//               </span>
//             )}
//           </span>
//           <span>{f(feeBreakdown.tax_amount)}</span>
//         </div>
//       )}

//       {/* Grand total */}
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800", color: "#c9a96e", borderTop: "1px solid rgba(201,169,110,0.3)", paddingTop: "8px", marginTop: "4px" }}>
//         <span>Grand Total</span><span>{f(feeBreakdown.total_amount)}</span>
//       </div>

//       {/* Due now (if instalment plan selected) */}
//       {plan && firstMs && (
//         <div style={{ marginTop: "10px", padding: "8px 10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "7px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
//             <span style={{ color: "#22c55e", fontWeight: "700" }}>
//               Due Now — {firstMs.label} ({firstMs.percentage}%)
//             </span>
//             <span style={{ color: "#22c55e", fontWeight: "800" }}>{f(dueNow)}</span>
//           </div>
//           <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>
//             Includes proportional taxes &amp; fees
//           </div>
//         </div>
//       )}

//       <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "8px", textAlign: "center" }}>
//         Amounts are estimates. Final figures confirmed at booking.
//       </div>
//     </div>
//   );
// };

// const UnitPage = () => {
//   const { plotId } = useParams();
//   const navigate   = useNavigate();

//   const containerRef    = useRef(null);
//   const viewerRef       = useRef(null);
//   const markersRef      = useRef(null);
//   const overlayRef      = useRef(null);
//   const labelRef        = useRef(null);
//   const allMarkerIdsRef = useRef([]);

//   const [unit,          setUnit]          = useState(null);
//   const [hotspots,      setHotspots]      = useState(null);
//   const [fetchError,    setFetchError]    = useState(null);
//   const [isFetching,    setIsFetching]    = useState(true);
//   const [isLoaded,      setIsLoaded]      = useState(false);
//   const [loadProgress,  setLoadProgress]  = useState(0);
//   const [activeTab,     setActiveTab]     = useState("details");
//   const [sidebarOpen,   setSidebarOpen]   = useState(false);
//   const [bookingStep,   setBookingStep]   = useState("details");
//   const [selectedPlan,  setSelectedPlan]  = useState(null);
//   const [loginForm,     setLoginForm]     = useState({ email: "", password: "" });
//   const [registerForm,  setRegisterForm]  = useState({
//     name: "", email: "", country_code: "+91", phone: "",
//     password: "", role: "user", broker_company: "",
//   });
//   const [bookingForm, setBookingForm] = useState({
//     name: "", phone: "", notes: "",
//     client_name: "", client_phone: "", client_email: "", client_country_code: "+91",
//   });
//   const [authLoading,       setAuthLoading]      = useState(false);
//   const [authError,         setAuthError]        = useState("");
//   const [bookingDone,       setBookingDone]       = useState(false);
//   const [pendingUserId,     setPendingUserId]     = useState(null);
//   const [existingBookingId, setExistingBookingId] = useState(null);
//   const [currency,          setCurrency]          = useState("₹");
//   // ── Fee breakdown fetched when booking is loaded or after creation ────────
//   const [feeBreakdown,      setFeeBreakdown]      = useState(null);

//   // ── Wishlist modal ────────────────────────────────────────────────────────
//   const [loginModalOpen,     setLoginModalOpen]     = useState(false);
//   const [pendingWishlist,    setPendingWishlist]    = useState(false);
//   const [modalStep,          setModalStep]          = useState("login");
//   const [modalPendingUserId, setModalPendingUserId] = useState(null);
//   const [modalAuthError,     setModalAuthError]     = useState("");

//   const dispatch = useDispatch();
//   const user     = useSelector(selectUser);
//   const { wishedIds, toggle: toggleWish } = useWishlist(user?.token);
//   const { showToast } = useToast();

//   const wishlistWithToken = useCallback((freshToken, pid, plotNumber) => {
//     fetch(`${API_BASE}/wishlist/toggle`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json", Accept: "application/json" },
//       body: JSON.stringify({ plot_id: Number(pid) }),
//     })
//       .then((r) => r.json())
//       .then((d) => {
//         showToast(
//           d.wishlisted ? `❤️ Added to Wishlist — Unit ${plotNumber}` : `🤍 Removed from Wishlist — Unit ${plotNumber}`,
//           d.wishlisted ? "wishlist_add" : "wishlist_remove", 2800,
//         );
//       })
//       .catch(() => {});
//   }, [showToast]);

//   // ── Fetch unit + hotspots + currency ─────────────────────────────────────
//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [unitRes, hsRes, currRes] = await Promise.all([
//           fetch(`${API_BASE}/unit/${plotId}`,             { headers: { Accept: "application/json" } }),
//           fetch(`${API_BASE}/hotspots?plot_id=${plotId}`, { headers: { Accept: "application/json" } }),
//           fetch(`${API_BASE}/currency`,                   { headers: { Accept: "application/json" } }),
//         ]);
//         if (!unitRes.ok) throw new Error(`Unit API error ${unitRes.status}`);
//         const unitData = await unitRes.json();
//         const hsData   = hsRes.ok ? await hsRes.json() : [];
//         if (currRes.ok) {
//           const c = await currRes.json();
//           setCurrency(c.symbol || c.currency || c.data?.symbol || c.data?.currency || "₹");
//         }
//         setUnit(unitData);
//         setHotspots(hsData);
//       } catch (err) { setFetchError(err.message); }
//       finally { setIsFetching(false); }
//     };
//     fetchAll();
//   }, [plotId]);

//   // ── Fetch fee breakdown for the unit price (used in plan selector) ────────
//   useEffect(() => {
//     if (!unit?.actual_price && !unit?.offer_price) return;
//     // Hit the payment/config endpoint to get invoice settings to derive breakdown.
//     // We compute breakdown client-side based on a fee preview endpoint if available,
//     // otherwise we rely on what comes back from booking creation / booking GET.
//     // If your backend exposes GET /api/payment/fee-preview?price=X, use that:
//     const price = unit.offer_price || unit.actual_price;
//     fetch(`${API_BASE}/payment/fee-preview?price=${encodeURIComponent(price)}`, {
//       headers: { Accept: "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
//     })
//       .then((r) => r.ok ? r.json() : null)
//       .then((d) => { if (d) setFeeBreakdown(d.fee_breakdown || d); })
//       .catch(() => {});
//   }, [unit, user?.token]);

//   // ── PSV ───────────────────────────────────────────────────────────────────
//   const destroyViewer = useCallback(() => {
//     if (!viewerRef.current) return;
//     try { viewerRef.current._cleanup?.(); } catch (e) {}
//     try { if (containerRef.current?.isConnected && containerRef.current?.hasChildNodes()) viewerRef.current.destroy(); } catch (e) {}
//     viewerRef.current = null; markersRef.current = null;
//   }, []);

//   const buildMarkers = useCallback((unitData, hsData) => {
//     const markers = [];
//     hsData.forEach((hs) => {
//       if (!hs.yaw || !hs.pitch) return;
//       if (hs.hotspot_type === "gallery") {
//         markers.push({ id: `hs-gallery-${hs.id}`, position: { yaw: toRad(parseFloat(hs.yaw)), pitch: toRad(parseFloat(hs.pitch)) }, html: `<div class="hs-marker hs-gallery">🖼 ${hs.title || hs.label}</div>`, size: { width: 170, height: 42 }, data: { type: "gallery", galleryIndex: hs.gallery_index ?? 0, name: hs.title || hs.label, yawRad: toRad(parseFloat(hs.yaw)), pitchRad: toRad(parseFloat(hs.pitch)) } });
//       } else {
//         const room = unitData.rooms?.find((r) => r.id === hs.room_panorama_id || r.room_label === (hs.title || hs.label));
//         markers.push({ id: `hs-room-${hs.id}`, position: { yaw: toRad(parseFloat(hs.yaw)), pitch: toRad(parseFloat(hs.pitch)) }, html: `<div class="hs-marker hs-room">🚪 ${hs.title || hs.label}</div>`, size: { width: 160, height: 42 }, data: { type: "room", roomId: room?.id || hs.room_panorama_id, name: hs.title || hs.label, yawRad: toRad(parseFloat(hs.yaw)), pitchRad: toRad(parseFloat(hs.pitch)) } });
//       }
//     });
//     if (markers.length === 0 && unitData.rooms?.length > 0) {
//       unitData.rooms.forEach((room, idx) => {
//         const yaw = (idx / unitData.rooms.length) * 360 - 180;
//         markers.push({ id: `fallback-room-${room.id}`, position: { yaw: toRad(yaw), pitch: toRad(-10) }, html: `<div class="hs-marker hs-room">🚪 ${room.room_label}</div>`, size: { width: 160, height: 42 }, data: { type: "room", roomId: room.id, name: room.room_label, yawRad: toRad(yaw), pitchRad: toRad(-10) } });
//       });
//     }
//     return markers;
//   }, []);

//   useEffect(() => {
//     if (!unit?.panorama_url || !hotspots || !containerRef.current || activeTab !== "panorama") return;
//     destroyViewer(); setIsLoaded(false); setLoadProgress(0);
//     let current = 0;
//     const interval = setInterval(() => { current += Math.random() * 10; if (current >= 90) { current = 90; clearInterval(interval); } setLoadProgress(Math.round(current)); }, 180);
//     const psvMarkers = buildMarkers(unit, hotspots);
//     allMarkerIdsRef.current = psvMarkers.map((m) => m.id);
//     const initTimer = setTimeout(() => {
//       if (!containerRef.current) return;
//       try {
//         viewerRef.current = new Viewer({ container: containerRef.current, panorama: unit.panorama_url, defaultZoomLvl: 50, mousewheelCtrlKey: false, loadingImg: null, loadingTxt: "", useXmpData: false, plugins: [[MarkersPlugin, { markers: psvMarkers }]] });
//       } catch (e) { console.error("PSV init error:", e); return; }
//       const handleResize = () => { try { viewerRef.current?.autoSize(); } catch (e) {} };
//       window.addEventListener("resize", handleResize);
//       document.addEventListener("fullscreenchange", handleResize);
//       document.addEventListener("webkitfullscreenchange", handleResize);
//       markersRef.current = viewerRef.current.getPlugin(MarkersPlugin);
//       viewerRef.current.addEventListener("ready", () => {
//         clearInterval(interval); setLoadProgress(100); setTimeout(() => setIsLoaded(true), 400);
//         let angle = 0, isInteracting = false, resumeTimer = null;
//         const swing = () => { if (!isInteracting) { angle += 0.0015; try { viewerRef.current?.rotate({ yaw: Math.sin(angle) * 0.06, pitch: 0 }); } catch (e) {} } if (viewerRef.current) viewerRef.current._rafId = requestAnimationFrame(swing); };
//         viewerRef.current._rafId = requestAnimationFrame(swing);
//         const onStart = () => { isInteracting = true; clearTimeout(resumeTimer); };
//         const onEnd   = () => { resumeTimer = setTimeout(() => { isInteracting = false; }, 2500); };
//         const el = containerRef.current;
//         if (el) { el.addEventListener("mousedown", onStart, { passive: true }); el.addEventListener("mouseup", onEnd, { passive: true }); el.addEventListener("touchstart", onStart, { passive: true }); el.addEventListener("touchend", onEnd, { passive: true }); }
//         viewerRef.current._cleanup = () => {
//           if (viewerRef.current?._rafId) cancelAnimationFrame(viewerRef.current._rafId);
//           clearTimeout(resumeTimer);
//           window.removeEventListener("resize", handleResize); document.removeEventListener("fullscreenchange", handleResize); document.removeEventListener("webkitfullscreenchange", handleResize);
//           if (el) { el.removeEventListener("mousedown", onStart); el.removeEventListener("mouseup", onEnd); el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); }
//         };
//       });
//       markersRef.current?.addEventListener("select-marker", ({ marker }) => {
//         const { type, roomId, galleryIndex, name, yawRad, pitchRad } = marker.data;
//         allMarkerIdsRef.current.forEach((id) => { try { markersRef.current?.updateMarker({ id, opacity: 0 }); } catch (e) {} });
//         if (labelRef.current) { labelRef.current.textContent = name; labelRef.current.style.opacity = "1"; }
//         viewerRef.current?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 60, speed: "4rpm" })
//           .then(() => viewerRef.current?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 100, speed: "20rpm" }))
//           .then(() => {
//             if (overlayRef.current) { overlayRef.current.style.transition = "opacity 0.4s ease-in"; overlayRef.current.style.opacity = "1"; }
//             setTimeout(() => { if (type === "gallery") navigate(`/unit/${plotId}/gallery/${galleryIndex}`); else navigate(`/unit/${plotId}/room/${roomId}`); }, 450);
//           });
//       });
//     }, 50);
//     return () => { clearInterval(interval); clearTimeout(initTimer); destroyViewer(); };
//   }, [unit, hotspots, activeTab]);

//   useEffect(() => {
//     if (!overlayRef.current) return;
//     overlayRef.current.style.opacity = "1"; overlayRef.current.style.transition = "none";
//     const t = setTimeout(() => { overlayRef.current.style.transition = "opacity 0.7s ease-out"; overlayRef.current.style.opacity = "0"; }, 50);
//     return () => clearTimeout(t);
//   }, []);

//   // ── BOOKING SIDEBAR auth ──────────────────────────────────────────────────
//   const handleLogin = async () => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(loginForm) });
//       const data = await res.json();
//       if (data.step === "verify_email") { setPendingUserId(data.user_id); setBookingStep("verify_email"); setAuthLoading(false); return; }
//       if (data.step === "verify_phone") { setPendingUserId(data.user_id); setBookingStep("verify_phone"); setAuthLoading(false); return; }
//       if (!res.ok) throw new Error(data.message || "Login failed");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setBookingForm((f) => ({ ...f, name: userData.name || "", phone: (userData.country_code || "") + (userData.phone || "") }));
//       afterAuth();
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleRegister = async () => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(registerForm) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Registration failed");
//       setPendingUserId(data.user_id); setBookingStep("verify_email"); setAuthError("");
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleVerifyEmail = async (otp) => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-email`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       setPendingUserId(data.user_id); setBookingStep("verify_phone"); setAuthError("");
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleVerifyPhone = async (otp) => {
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-phone`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setBookingForm((f) => ({ ...f, name: userData.name || "", phone: (userData.country_code || "") + (userData.phone || "") }));
//       afterAuth();
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleResendOtp = async (type) => {
//     if (!pendingUserId) return;
//     setAuthLoading(true); setAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, type }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to resend");
//       setAuthError("✓ " + data.message);
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   // ── MODAL auth (wishlist) ─────────────────────────────────────────────────
//   const handleModalLogin = async () => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(loginForm) });
//       const data = await res.json();
//       if (data.step === "verify_email") { setModalPendingUserId(data.user_id); setModalStep("verify_email"); setAuthLoading(false); return; }
//       if (data.step === "verify_phone") { setModalPendingUserId(data.user_id); setModalStep("verify_phone"); setAuthLoading(false); return; }
//       if (!res.ok) throw new Error(data.message || "Login failed");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setLoginModalOpen(false);
//       if (pendingWishlist) { setPendingWishlist(false); wishlistWithToken(data.token, plotId, unit?.plot_number); }
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalRegister = async () => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(registerForm) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Registration failed");
//       setModalPendingUserId(data.user_id);
//       setModalStep("verify_email");
//       setModalAuthError("");
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalVerifyEmail = async (otp) => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-email`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       setModalPendingUserId(data.user_id);
//       setModalStep("verify_phone");
//       setModalAuthError("");
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalVerifyPhone = async (otp) => {
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/verify-phone`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, otp }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Invalid code");
//       const userData = { ...data.user, token: data.token };
//       dispatch(setUser(userData));
//       setLoginModalOpen(false);
//       if (pendingWishlist) { setPendingWishlist(false); wishlistWithToken(data.token, plotId, unit?.plot_number); }
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleModalResendOtp = async (type) => {
//     if (!modalPendingUserId) return;
//     setAuthLoading(true); setModalAuthError("");
//     try {
//       const res  = await fetch(`${API_BASE}/user/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, type }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to resend");
//       setModalAuthError("✓ " + data.message);
//     } catch (err) { setModalAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const closeModal = () => { setLoginModalOpen(false); setPendingWishlist(false); setModalStep("login"); setModalAuthError(""); };

//   // ── Booking ───────────────────────────────────────────────────────────────
//   const handleBooking = async () => {
//     setAuthLoading(true); setAuthError("");
//     const isBroker = user?.role === "broker";
//     if (isBroker && user?.status && user.status !== "active") { setAuthError("Your broker account is currently inactive. Please contact the admin to activate your account before booking."); setAuthLoading(false); return; }
//     try {
//       if (existingBookingId) {
//         const res  = await fetch(`${API_BASE}/bookings/${existingBookingId}/plan`, { method: "PATCH", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user?.token}` }, body: JSON.stringify({ payment_plan_id: selectedPlan }) });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Plan update failed");
//         // Update local fee breakdown from response
//         if (data.booking?.fee_breakdown) setFeeBreakdown(data.booking.fee_breakdown);
//         setTimeout(() => navigate(`/payment/${existingBookingId}`), 400);
//         return;
//       }
//       const payload = { plot_id: plotId, plot_number: unit.plot_number, plot_type: unit.plot_type, block: unit.block, section: unit.section, direction: unit.direction, area: unit.plot_size ? String(unit.plot_size) : "", price: unit.offer_price ? String(unit.offer_price) : String(unit.actual_price || ""), project_id: unit.project_id, block_id: unit.block_id, name: bookingForm.name, phone: bookingForm.phone, notes: bookingForm.notes, payment_plan_id: selectedPlan, client_name: isBroker ? bookingForm.client_name : undefined, client_phone: isBroker ? bookingForm.client_country_code + bookingForm.client_phone : undefined, client_email: isBroker ? bookingForm.client_email : undefined };
//       const res  = await fetch(`${API_BASE}/bookings`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user?.token}` }, body: JSON.stringify(payload) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Booking failed");
//       // ── Capture the fee breakdown from booking response ──
//       if (data.booking?.fee_breakdown) setFeeBreakdown(data.booking.fee_breakdown);
//       const bookingId = data.booking?.id;
//       if (bookingId) { showToast(`🎉 Booking confirmed! Redirecting to payment…`, "success", 2500); setTimeout(() => navigate(`/payment/${bookingId}`), 400); }
//       else { setBookingDone(true); showToast(`✅ Booking received! We'll contact you shortly.`, "success", 4000); }
//     } catch (err) { setAuthError(err.message); }
//     setAuthLoading(false);
//   };

//   const handleBack = () => {
//     if (overlayRef.current) { overlayRef.current.style.transition = "opacity 0.4s ease-in"; overlayRef.current.style.opacity = "1"; }
//     const dest = unit?.block_id ? `/floor/${unit.block_id}` : unit?.floor_id ? `/floor/${unit.floor_id}` : null;
//     setTimeout(() => (dest ? navigate(dest) : navigate(-1)), 450);
//   };

//   const switchToGallery  = () => { destroyViewer(); setActiveTab("gallery"); setIsLoaded(false); };
//   const switchToPanorama = () => setActiveTab("panorama");
//   const switchToDetails  = () => { destroyViewer(); setActiveTab("details"); };
//   const hasPlans         = (unit?.payment_plans?.length || 0) > 0;
//   const afterAuth        = () => setBookingStep(hasPlans ? "plan" : "form");

//   const openBooking = async () => {
//     setSidebarOpen(true); setBookingDone(false); setAuthError("");
//     if (user) {
//       if (user.role === "broker" && user.status && user.status !== "active") { setBookingStep("broker_inactive"); return; }
//       try {
//         const res = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
//         if (res.ok) {
//           const data     = await res.json();
//           const bookings = Array.isArray(data) ? data : data.data || [];
//           const existing = bookings.find((b) => String(b.plot_id) === String(plotId) && b.booking_status !== "cancelled");
//           if (existing) {
//             setExistingBookingId(existing.id); setSelectedPlan(existing.payment_plan_id || null);
//             // Fetch full booking to get fee_breakdown
//             fetch(`${API_BASE}/bookings/${existing.id}`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } })
//               .then((r) => r.ok ? r.json() : null)
//               .then((d) => { if (d?.booking?.fee_breakdown) setFeeBreakdown(d.booking.fee_breakdown); })
//               .catch(() => {});
//             if (existing.booking_status === "confirmed") { setBookingDone(true); setBookingStep("details"); return; }
//             setBookingStep(hasPlans ? "plan" : "form"); return;
//           }
//         }
//       } catch (e) {}
//       setExistingBookingId(null); setBookingStep(hasPlans ? "plan" : "form");
//     } else { setExistingBookingId(null); setBookingStep("details"); }
//   };

//   const logout = () => { dispatch(clearUser()); setBookingStep("details"); setSelectedPlan(null); setExistingBookingId(null); };

//   useEffect(() => {
//     if (user) setBookingForm((f) => ({ ...f, name: f.name || user.name || "", phone: f.phone || (user.country_code || "") + (user.phone || "") }));
//   }, [user?.id]);

//   const fmtPrice       = (val) => val ? `${currency} ${Number(val).toLocaleString("en-IN")}` : null;
//   const getStatusColor = (s) => { const v = s?.toLowerCase(); return v === "available" ? "#22c55e" : v === "pre-booked" ? "#f59e0b" : "#ef4444"; };

//   if (isFetching) return <div className="unit-loading-screen"><div style={{ fontSize: "48px" }}>🏠</div><div style={{ color: "white", fontSize: "18px" }}>Loading unit...</div><div className="loading-bar-track"><div className="loading-bar-fill" /></div></div>;
//   if (fetchError || !unit) return <div className="unit-loading-screen"><div style={{ fontSize: "48px" }}>⚠️</div><h2 style={{ color: "white" }}>Unit Unavailable</h2><p style={{ color: "#666" }}>{fetchError || "Unit not found."}</p><button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>← Go Back</button></div>;

//   const gallery     = unit.gallery_images || [];
//   const hasPano     = !!unit.panorama_url;
//   const hasGal      = gallery.length > 0;
//   const hasRooms    = unit.rooms?.length > 0;
//   const isAvail     = unit.status?.toLowerCase() === "available";
//   const statusColor = getStatusColor(unit.status);
//   const isWished    = wishedIds instanceof Set ? wishedIds.has(Number(plotId)) : false;
//   const sym         = feeBreakdown?.currency_symbol || currency;

//   return (
//     <div className="unit-page">

//       {/* ── Wishlist login modal ─────────────────────────────────────────── */}
//       {loginModalOpen && (
//         <>
//           <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} />
//           <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "linear-gradient(135deg,#0f1623,#111827)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "16px", padding: "28px 28px 24px", width: "min(400px, 90vw)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
//               <div style={{ color: "white", fontWeight: "800", fontSize: "17px" }}>
//                 {modalStep === "verify_email" ? "📧 Verify Email" : modalStep === "verify_phone" ? "📱 Verify Phone" : "❤️ Save to Wishlist"}
//               </div>
//               <button onClick={closeModal} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "22px", cursor: "pointer", lineHeight: 1 }}>×</button>
//             </div>
//             {modalStep === "verify_email" ? (
//               <StepOtp key="modal-otp-email" type="email" onVerify={handleModalVerifyEmail} onResend={() => handleModalResendOtp("email")} loading={authLoading} error={modalAuthError} setError={setModalAuthError} />
//             ) : modalStep === "verify_phone" ? (
//               <StepOtp key="modal-otp-phone" type="phone" onVerify={handleModalVerifyPhone} onResend={() => handleModalResendOtp("phone")} loading={authLoading} error={modalAuthError} setError={setModalAuthError} />
//             ) : (
//               <>
//                 <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px" }}>
//                   {["login", "register"].map((tab) => (
//                     <button key={tab} onClick={() => { setModalStep(tab); setModalAuthError(""); }}
//                       style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "700", background: modalStep === tab ? "linear-gradient(135deg,#c9a96e,#a07840)" : "transparent", color: modalStep === tab ? "#000" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }}>
//                       {tab === "login" ? "Log In" : "Register"}
//                     </button>
//                   ))}
//                 </div>
//                 <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
//                   {modalStep === "login" ? "Log in to save this unit to your wishlist." : "Create an account to save this unit to your wishlist."}
//                 </p>
//                 {modalStep === "login" ? (
//                   <StepLogin form={loginForm} setForm={setLoginForm} onLogin={handleModalLogin} onSwitch={() => { setModalStep("register"); setModalAuthError(""); }} loading={authLoading} error={modalAuthError} />
//                 ) : (
//                   <StepRegister form={registerForm} setForm={setRegisterForm} onRegister={handleModalRegister} onSwitch={() => { setModalStep("login"); setModalAuthError(""); }} loading={authLoading} error={modalAuthError} />
//                 )}
//               </>
//             )}
//           </div>
//         </>
//       )}

//       {/* ── Header ── */}
//       <div className="unit-header">
//         <button className="unit-back-btn" onClick={handleBack}>← Floor</button>
//         <div className="unit-info">
//           <div className="unit-title-row">
//             <span className="unit-name">Unit {unit.plot_number}</span>
//             <span className="unit-status-badge" style={{ background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44` }}>{unit.status}</span>
//           </div>
//           <div className="unit-subtitle">{unit.plot_type} · {unit.plot_size} sqft{unit.direction ? ` · ${unit.direction}` : ""}</div>
//         </div>
//         <div className="unit-tabs">
//           <button className={`unit-tab${activeTab === "details"  ? " active" : ""}`} onClick={switchToDetails}>📋 Details</button>
//           {unit.payment_plans?.length > 0 && <button className={`unit-tab${activeTab === "payment" ? " active" : ""}`} onClick={() => { destroyViewer(); setActiveTab("payment"); }}>💳 Payment Plans</button>}
//           {hasPano && <button className={`unit-tab${activeTab === "panorama" ? " active" : ""}`} onClick={switchToPanorama}>🌐 360°</button>}
//           {hasGal  && <button className={`unit-tab${activeTab === "gallery"  ? " active" : ""}`} onClick={switchToGallery}>🖼 Gallery ({gallery.length})</button>}
//         </div>
//         <div className="unit-price-wrap">
//           {user && (
//             <button onClick={() => navigate("/dashboard")} title={`${user.name} — My Dashboard`}
//               style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "20px", padding: "5px 12px 5px 6px", cursor: "pointer", color: "#c9a96e", fontSize: "12px", fontWeight: "700", marginRight: "8px", flexShrink: 0 }}
//               onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.22)")}
//               onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.12)")}>
//               <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#000", flexShrink: 0 }}>{user.name?.[0]?.toUpperCase()}</span>
//               <span style={{ whiteSpace: "nowrap" }}>Dashboard</span>
//             </button>
//           )}
//           <div className="unit-price-box">
//             {unit.offer_price && <div className="unit-offer-price">{fmtPrice(unit.offer_price)}</div>}
//             <div className="unit-actual-price" style={{ color: unit.offer_price ? "rgba(255,255,255,0.35)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "11px" : "14px" }}>{fmtPrice(unit.actual_price)}</div>
//             {/* Tax indicator in header price box */}
//             {feeBreakdown?.tax_enabled && feeBreakdown?.tax_rate > 0 && (
//               <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "2px" }}>
//                 +{feeBreakdown.tax_rate}% {feeBreakdown.tax_label || "Tax"}
//               </div>
//             )}
//           </div>
//           {isAvail && <button className="book-now-btn" onClick={openBooking}>Book Now</button>}
//           {unit && (
//             <button onClick={() => {
//               if (!user?.token) { setPendingWishlist(true); setModalStep("login"); setModalAuthError(""); setLoginModalOpen(true); }
//               else { const willAdd = !isWished; toggleWish(Number(plotId)); showToast(willAdd ? `❤️ Added to Wishlist — Unit ${unit.plot_number}` : `🤍 Removed from Wishlist — Unit ${unit.plot_number}`, willAdd ? "wishlist_add" : "wishlist_remove", 2800); }
//             }}
//               title={isWished ? "Remove from Wishlist" : "Save to Wishlist"}
//               style={{ background: isWished ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${isWished ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.12)"}`, borderRadius: "8px", cursor: "pointer", padding: "6px 10px", fontSize: "18px", lineHeight: 1, transition: "all 0.2s", boxShadow: isWished ? "0 0 10px rgba(239,68,68,0.25)" : "none", transform: isWished ? "scale(1.08)" : "scale(1)", color: isWished ? "#ef4444" : "rgba(255,255,255,0.7)" }}>
//               {isWished ? "❤️" : "🤍"}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── Content ── */}
//       <div className="unit-content-area">
//         {activeTab === "details" && <UnitDetails unit={unit} currency={currency} fmtPrice={fmtPrice} statusColor={statusColor} />}
//         {activeTab === "payment" && <PaymentPlansTab plans={unit.payment_plans || []} fmtPrice={fmtPrice} currency={currency} unitPrice={unit.offer_price || unit.actual_price} feeBreakdown={feeBreakdown} sym={sym} />}
//         {activeTab === "panorama" && (
//           <>
//             <div ref={containerRef} className="psv-container-div" />
//             <div className={`pano-loader${isLoaded ? " gone" : ""}`}>
//               <div className="pano-loader-card">
//                 <div className="pano-loader-emoji">🏠</div>
//                 <div className="pano-loader-percent">{loadProgress}%</div>
//                 <div className="pano-loader-bar-track"><div className="pano-loader-bar-fill" style={{ width: `${loadProgress}%` }} /></div>
//                 <div className="pano-loader-text">{loadProgress < 40 ? "Preparing panorama..." : loadProgress < 80 ? "Loading image data..." : loadProgress < 100 ? "Almost ready..." : "✓ Ready"}</div>
//               </div>
//             </div>
//             {isLoaded && hasRooms && (
//               <div className="room-nav-strip">
//                 <span className="room-nav-label">Rooms</span>
//                 {unit.rooms.map((room) => (
//                   <button key={room.id} className="room-thumb-btn" onClick={() => navigate(`/unit/${plotId}/room/${room.id}`)}>
//                     {room.thumb_url ? <img src={room.thumb_url} alt={room.room_label} /> : <div className="room-thumb-placeholder">🚪</div>}
//                     <span>{room.room_label}</span>
//                   </button>
//                 ))}
//               </div>
//             )}
//             <div ref={labelRef} className="marker-label" />
//           </>
//         )}
//         {activeTab === "gallery" && hasGal && <GallerySlider gallery={gallery} plotId={plotId} navigate={navigate} />}
//       </div>

//       <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

//       {/* ── Booking sidebar ── */}
//       <div className={`booking-sidebar${sidebarOpen ? " open" : ""}`}>
//         <div className="sidebar-header">
//           <div>
//             <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Book Unit {unit.plot_number}</div>
//             <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "2px" }}>{unit.plot_type} · {unit.plot_size} sqft</div>
//           </div>
//           <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
//         </div>
//         <div className="sidebar-scroll">
//           <div className="unit-detail-card">
//             <div className="unit-detail-grid">
//               {[["Unit No", unit.plot_number], ["Type", unit.plot_type], ["Area", unit.plot_size ? `${unit.plot_size} sqft` : "—"], ["Direction", unit.direction || "—"], ["Rooms", unit.rooms?.length || 0], ["Gallery", gallery.length]].map(([lbl, val]) => (
//                 <div key={lbl}><div className="unit-detail-item-label">{lbl}</div><div className="unit-detail-item-value">{val}</div></div>
//               ))}
//             </div>
//             <div className="unit-price-row">
//               <div>
//                 <div className="unit-price-label">Price</div>
//                 {unit.offer_price && <div className="unit-offer-price-lg">{fmtPrice(unit.offer_price)}</div>}
//                 <div style={{ color: unit.offer_price ? "rgba(255,255,255,0.3)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "12px" : "18px", fontWeight: "600" }}>{fmtPrice(unit.actual_price)}</div>
//                 {/* Show grand total with tax in sidebar price row */}
//                 {feeBreakdown?.tax_enabled && feeBreakdown?.total_amount > 0 && (
//                   <div style={{ marginTop: "6px", padding: "4px 8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "6px", display: "inline-block" }}>
//                     <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "700" }}>
//                       Grand Total (incl. {feeBreakdown.tax_label || "Tax"}): {sym}{parseFloat(feeBreakdown.total_amount).toLocaleString("en-IN")}
//                     </span>
//                   </div>
//                 )}
//               </div>
//               <div className="unit-status-badge" style={{ background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44`, padding: "4px 12px", fontSize: "12px", fontWeight: "700" }}>{unit.status}</div>
//             </div>
//           </div>

//           {bookingStep === "broker_inactive" ? <BrokerInactiveScreen onClose={() => setSidebarOpen(false)} />
//            : bookingDone                     ? <BookingDone unit={unit} onClose={() => setSidebarOpen(false)} />
//            : bookingStep === "details"        ? <StepDetails user={user} onBook={() => user ? (hasPlans ? setBookingStep("plan") : setBookingStep("form")) : setBookingStep("login")} onLogout={logout} />
//            : bookingStep === "login"          ? <StepLogin form={loginForm} setForm={setLoginForm} onLogin={handleLogin} onSwitch={() => { setBookingStep("register"); setAuthError(""); }} loading={authLoading} error={authError} />
//            : bookingStep === "register"       ? <StepRegister form={registerForm} setForm={setRegisterForm} onRegister={handleRegister} onSwitch={() => { setBookingStep("login"); setAuthError(""); }} loading={authLoading} error={authError} />
//            : bookingStep === "verify_email"   ? <StepOtp key="otp-email" type="email" onVerify={handleVerifyEmail} onResend={() => handleResendOtp("email")} loading={authLoading} error={authError} setError={setAuthError} />
//            : bookingStep === "verify_phone"   ? <StepOtp key="otp-phone" type="phone" onVerify={handleVerifyPhone} onResend={() => handleResendOtp("phone")} loading={authLoading} error={authError} setError={setAuthError} />
//            : bookingStep === "plan"           ? <StepPlanSelect plans={unit.payment_plans || []} selected={selectedPlan} onSelect={setSelectedPlan} fmtPrice={fmtPrice} unitPrice={unit.actual_price} onNext={() => setBookingStep("form")} onBack={() => setBookingStep("details")} existingBookingId={existingBookingId} feeBreakdown={feeBreakdown} sym={sym} />
//            : bookingStep === "form"           ? <StepBookingForm user={user} form={bookingForm} setForm={setBookingForm} onSubmit={handleBooking} loading={authLoading} error={authError} selectedPlan={selectedPlan} plans={unit.payment_plans || []} onBack={() => hasPlans ? setBookingStep("plan") : setBookingStep("details")} unit={unit} existingBookingId={existingBookingId} feeBreakdown={feeBreakdown} sym={sym} />
//            : null}
//         </div>
//       </div>

//       <div ref={overlayRef} className="page-fade-overlay" />
//     </div>
//   );
// };

// /* ── Sub-components ──────────────────────────────────────────────────────── */
// const BrokerInactiveScreen = ({ onClose }) => (
//   <div style={{ padding: "24px 0", textAlign: "center" }}>
//     <div style={{ fontSize: "48px", marginBottom: "14px" }}>🔒</div>
//     <div style={{ color: "white", fontWeight: "800", fontSize: "17px", marginBottom: "10px" }}>Account Inactive</div>
//     <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: "1.7", marginBottom: "20px" }}>Your broker account is currently <strong style={{ color: "#ef4444" }}>inactive</strong>. You cannot place bookings until your account is activated.</div>
//     <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#fca5a5", textAlign: "left" }}>
//       <div style={{ fontWeight: "700", marginBottom: "4px" }}>What to do next:</div>
//       <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: "1.8" }}><li>Contact your project administrator</li><li>Ask them to activate your broker account</li><li>You'll be able to book once your status is active</li></ul>
//     </div>
//     <button onClick={onClose} style={{ width: "100%", padding: "11px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Close</button>
//   </div>
// );

// const UnitDetails = ({ unit, currency, fmtPrice, statusColor }) => {
//   const hasDims = unit.room_dimensions?.length > 0, hasAmenities = unit.amenities?.length > 0;
//   const hasAreaData = unit.internal_area_sqft || unit.internal_area_sqm || unit.external_area_sqft;
//   return (
//     <div className="unit-details-page">
//       <div className="ud-hero"><div className="ud-hero-inner">
//         <div className="ud-stats">
//           {unit.bedrooms  != null && <StatPill icon="🛏"  label="Bedrooms"  value={unit.bedrooms}  />}
//           {unit.bathrooms != null && <StatPill icon="🚿"  label="Bathrooms" value={unit.bathrooms} />}
//           {unit.ensuites  != null && <StatPill icon="🛁"  label="Ensuites"  value={unit.ensuites}  />}
//           {unit.balconies != null && <StatPill icon="🌅"  label="Balconies" value={unit.balconies} />}
//           {unit.bedrooms == null && unit.rooms?.length > 0 && unit.rooms.map((r) => <StatPill key={r.id} icon="🚪" label={r.room_label} value="→" />)}
//         </div>
//         <div className="ud-hero-price">
//           {unit.offer_price && <div style={{ color: "#c9a96e", fontSize: "28px", fontWeight: "800" }}>{fmtPrice(unit.offer_price)}</div>}
//           <div style={{ color: unit.offer_price ? "rgba(255,255,255,0.4)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "14px" : "26px", fontWeight: "700" }}>{fmtPrice(unit.actual_price)}</div>
//           <div style={{ color: statusColor, fontSize: "12px", fontWeight: "600", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>● {unit.status}</div>
//         </div>
//       </div></div>
//       <div className="ud-body">
//         {hasAreaData && <Section title="📐 Floor Areas"><div className="ud-area-grid">
//           {unit.internal_area_sqft && <AreaCard label="Internal Area" sqft={unit.internal_area_sqft} sqm={unit.internal_area_sqm} accent="#c9a96e" />}
//           {unit.external_area_sqft && <AreaCard label="External Area" sqft={unit.external_area_sqft} sqm={unit.external_area_sqm} accent="#64748b" />}
//           {unit.internal_area_sqft && unit.external_area_sqft && <AreaCard label="Total Area" sqft={(parseFloat(unit.internal_area_sqft) + parseFloat(unit.external_area_sqft)).toFixed(2)} sqm={unit.internal_area_sqm && unit.external_area_sqm ? (parseFloat(unit.internal_area_sqm) + parseFloat(unit.external_area_sqm)).toFixed(2) : null} accent="#22c55e" />}
//         </div></Section>}
//         {hasDims      && <Section title="📏 Room Dimensions"><div className="ud-dims-list">{unit.room_dimensions.map((dim, i) => <DimRow key={i} dim={dim} />)}</div></Section>}
//         {hasAmenities && <Section title="✨ Amenities"><div className="ud-amenities-grid">{unit.amenities.map((a, i) => <div key={i} className="ud-amenity-chip"><span className="ud-amenity-icon">{amenityIcon(a)}</span><span>{a}</span></div>)}</div></Section>}
//         <Section title="ℹ️ Unit Info"><div className="ud-info-grid">
//           {[["Unit Number", unit.plot_number], ["Type", unit.plot_type], ["Total Size", unit.plot_size ? `${unit.plot_size} sqft` : "—"], ["Direction", unit.direction || "—"], ["Project", unit.project_name || "—"], ["Rooms", unit.rooms?.length || "—"]].map(([lbl, val]) => (
//             <div key={lbl} className="ud-info-item"><div className="ud-info-label">{lbl}</div><div className="ud-info-value">{val}</div></div>
//           ))}
//         </div></Section>
//         {unit.floor_plan_image && <Section title="🗺️ Floor Plan"><img src={unit.floor_plan_image} alt="Floor Plan" style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }} /></Section>}
//         {!hasAreaData && !hasDims && !hasAmenities && <div className="ud-empty"><div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px" }}>Detailed specifications coming soon.</div></div>}
//       </div>
//     </div>
//   );
// };
// const Section  = ({ title, children }) => <div className="ud-section"><div className="ud-section-title">{title}</div>{children}</div>;
// const StatPill = ({ icon, label, value }) => <div className="ud-stat-pill"><span className="ud-stat-icon">{icon}</span><div><div className="ud-stat-value">{value}</div><div className="ud-stat-label">{label}</div></div></div>;
// const AreaCard = ({ label, sqft, sqm, accent }) => (<div className="ud-area-card" style={{ borderColor: accent + "33" }}><div className="ud-area-label">{label}</div><div className="ud-area-sqft" style={{ color: accent }}>{Number(sqft).toLocaleString()} <span>sq ft</span></div>{sqm && <div className="ud-area-sqm">{Number(sqm).toLocaleString()} sq m</div>}{!sqm && sqft && <div className="ud-area-sqm">{(sqft / 10.764).toFixed(1)} sq m</div>}</div>);
// const DimRow   = ({ dim }) => {
//   const u = dim.unit || "m", w = parseFloat(dim.width), l = parseFloat(dim.length);
//   const wFt = u === "m" ? toFt(w) : w.toFixed(1), lFt = u === "m" ? toFt(l) : l.toFixed(1);
//   const wM  = u === "ft" ? (w / 3.28084).toFixed(1) : w.toFixed(1), lM = u === "ft" ? (l / 3.28084).toFixed(1) : l.toFixed(1);
//   const sqm = dim.area_sqm ? parseFloat(dim.area_sqm) : w && l ? u === "m" ? w * l : (w * l) / 10.7639 : null;
//   const sqft = dim.area_sqft ? parseFloat(dim.area_sqft) : sqm ? sqm * 10.7639 : null;
//   return <div className="ud-dim-row"><div className="ud-dim-label">{dim.label}</div><div className="ud-dim-measurements"><span className="ud-dim-primary">{wM} × {lM} m</span><span className="ud-dim-secondary">{wFt}' × {lFt}'</span>{sqm != null && <span className="ud-dim-area">{sqm.toFixed(1)} m² <span className="ud-dim-area-sep">/</span> {sqft.toFixed(1)} ft²</span>}</div></div>;
// };

// const TYPE_COLORS = { down_payment: { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" }, installment: { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" }, on_completion: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" }, on_handover: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" }, rental_guarantee: { bg: "#fce4ec", color: "#880e4f", border: "#f48fb1" }, custom: { bg: "#f5f5f5", color: "#424242", border: "#e0e0e0" } };
// const TYPE_ICONS = { down_payment: "💰", installment: "🔄", on_completion: "🏗️", on_handover: "🔑", rental_guarantee: "📈", custom: "⭐" };

// // ── PaymentPlansTab: enhanced with per-milestone tax breakdown ────────────────
// const PaymentPlansTab = ({ plans, fmtPrice, currency, unitPrice, feeBreakdown, sym = "₹" }) => {
//   const [activePlan, setActivePlan] = useState(0);
//   if (!plans?.length) return <div style={{ padding: "60px 20px", textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>💳</div><div style={{ fontSize: "16px", fontWeight: "600", color: "#e0e8f0" }}>No payment plans available</div></div>;
//   const basePrice = parseFloat(String(unitPrice || "0").replace(/[^0-9.]/g, "")) || 0;
//   const calcAmt   = (pct) => basePrice > 0 ? Math.round((basePrice * parseFloat(pct)) / 100) : null;
//   const plan      = plans[activePlan];
//   const totalPct  = plan.milestones.reduce((s, m) => s + (parseFloat(m.percentage) || 0), 0);

//   return (
//     <div className="unit-details-page">
//     <div style={{ padding: "20px 20px 40px", maxWidth: "680px", margin: "0 auto" }}>
//       {plans.length > 1 && <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>{plans.map((p, i) => <button key={p.id} onClick={() => setActivePlan(i)} style={{ padding: "8px 18px", borderRadius: "24px", cursor: "pointer", border: i === activePlan ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.1)", background: i === activePlan ? "rgba(201,169,110,0.15)" : "transparent", color: i === activePlan ? "#c9a96e" : "#6b7f95", fontWeight: i === activePlan ? "700" : "500", fontSize: "13px" }}>{p.name}</button>)}</div>}
//       <div style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "16px", padding: "20px 22px", marginBottom: "12px" }}>
//         <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
//           <div><div style={{ fontSize: "18px", fontWeight: "800", color: "#e8d5b0" }}>{plan.name}</div>{plan.description && <div style={{ fontSize: "13px", color: "#6b7f95", marginTop: "3px" }}>{plan.description}</div>}</div>
//           {totalPct === 100 && <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: "20px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: "11px", fontWeight: "700" }}>✓ 100%</span>}
//         </div>
//       </div>

//       {/* Grand total with tax banner */}
//       {feeBreakdown?.tax_enabled && feeBreakdown?.total_amount > 0 && (
//         <div style={{ marginBottom: "12px", padding: "10px 14px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
//           <span style={{ fontSize: "12px", color: "#6b7f95" }}>
//             Unit {sym}{parseFloat(basePrice).toLocaleString("en-IN")} + {feeBreakdown.tax_label || "Tax"} ({feeBreakdown.tax_rate}%) + fees
//           </span>
//           <span style={{ fontSize: "14px", fontWeight: "800", color: "#f59e0b" }}>
//             Grand Total: {sym}{parseFloat(feeBreakdown.total_amount).toLocaleString("en-IN")}
//           </span>
//         </div>
//       )}

//       <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" }}>
//         {plan.milestones.map((m, i) => {
//           const c = TYPE_COLORS[m.type] || TYPE_COLORS.custom, icon = TYPE_ICONS[m.type] || "⭐", isLast = i === plan.milestones.length - 1;
//           const displayAmt = m.calculated_amount ? fmtPrice(m.calculated_amount) : m.percentage && calcAmt(m.percentage) ? fmtPrice(calcAmt(m.percentage)) : m.fixed_amount ? fmtPrice(m.fixed_amount) : null;
//           const msTaxData = feeBreakdown && m.percentage ? computeMilestoneAmounts(m.percentage, feeBreakdown) : null;

//           return (
//             <div key={m.id || i} style={{ display: "flex", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
//               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "58px", flexShrink: 0, paddingTop: "18px" }}>
//                 <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: c.color }}>{i + 1}</div>
//                 {!isLast && <div style={{ width: "2px", flex: 1, background: "rgba(255,255,255,0.06)", minHeight: "24px", marginTop: "4px" }} />}
//               </div>
//               <div style={{ flex: 1, padding: "16px 18px 16px 0" }}>
//                 <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}><span style={{ fontSize: "16px" }}>{icon}</span><span style={{ padding: "2px 9px", borderRadius: "8px", fontSize: "10px", fontWeight: "700", background: c.bg, color: c.color, textTransform: "uppercase" }}>{m.type_label || m.type?.replace(/_/g, " ")}</span></div>
//                     <div style={{ fontSize: "15px", fontWeight: "700", color: "#d8e6f0" }}>{m.label}</div>
//                   </div>
//                   <div style={{ textAlign: "right", flexShrink: 0 }}>
//                     {m.percentage > 0 && <div style={{ fontSize: "24px", fontWeight: "900", color: "#c9a96e" }}>{m.percentage}%</div>}
//                     {displayAmt && (
//                       <div style={{ fontSize: "12px", color: "#5a7a9a", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
//                         ≈ {displayAmt}
//                         {/* Tax badge on milestone amount */}
//                         {msTaxData && (msTaxData.tax > 0 || msTaxData.fees > 0) && (
//                           <TaxBreakdownBadge milestonePercent={m.percentage} feeBreakdown={feeBreakdown} sym={sym} />
//                         )}
//                       </div>
//                     )}
//                     {/* Total with tax line */}
//                     {msTaxData && msTaxData.total > 0 && (
//                       <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "3px", fontWeight: "700" }}>
//                         Total: {sym}{Math.round(msTaxData.total).toLocaleString("en-IN")}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {(m.due_date || m.due_after_days) && <div style={{ marginTop: "6px", fontSize: "12px", color: "#5a7a9a" }}>📅 {m.due_date ? `Due by ${m.due_date}` : `Due ${m.due_after_days} days after booking`}</div>}
//                 {m.note && <div style={{ marginTop: "7px", fontSize: "12px", color: "#7a90a4", fontStyle: "italic", padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", borderLeft: "2px solid rgba(201,169,110,0.3)" }}>{m.note}</div>}
//               </div>
//             </div>
//           );
//         })}
//         <div style={{ padding: "14px 20px 14px 58px", background: "rgba(0,0,0,0.15)", borderTop: "1px solid rgba(201,169,110,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
//           <span style={{ fontSize: "13px", color: "#5a7a9a", fontWeight: "600" }}>Total payment mapped</span>
//           <div style={{ textAlign: "right" }}>
//             <span style={{ fontSize: "18px", fontWeight: "800", color: totalPct === 100 ? "#22c55e" : totalPct > 100 ? "#ef4444" : "#c9a96e" }}>{totalPct.toFixed(0)}%{totalPct === 100 ? " ✓" : ""}</span>
//             {feeBreakdown?.total_amount > 0 && (
//               <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "2px" }}>
//                 = {sym}{parseFloat(feeBreakdown.total_amount).toLocaleString("en-IN")} (incl. all taxes &amp; fees)
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#3a4f62" }}>Amounts shown are estimates. Final figures confirmed at booking.</div>
//     </div>
//     </div>
//   );
// };

// const GallerySlider = ({ gallery, plotId, navigate }) => {
//   const [idx, setIdx] = useState(0);
//   return (
//     <div className="gallery-slider">
//       <div className="gallery-main">
//         <img src={gallery[idx]} alt={`Gallery ${idx + 1}`} className="gallery-img" />
//         {gallery.length > 1 && <><button className="gallery-nav-btn prev" onClick={() => setIdx((i) => (i - 1 + gallery.length) % gallery.length)}>‹</button><button className="gallery-nav-btn next" onClick={() => setIdx((i) => (i + 1) % gallery.length)}>›</button></>}
//         <div className="gallery-counter">{idx + 1} / {gallery.length}</div>
//         <button className="gallery-360-btn" onClick={() => navigate(`/unit/${plotId}/gallery/${idx}`)}>🌐 View 360°</button>
//       </div>
//       {gallery.length > 1 && <div className="gallery-thumbs">{gallery.map((img, i) => <img key={i} src={img} alt="" className={`gallery-thumb ${i === idx ? "active" : "inactive"}`} onClick={() => setIdx(i)} />)}</div>}
//     </div>
//   );
// };

// const COUNTRY_CODES = [
//   { code: "+91", flag: "🇮🇳", name: "India" }, { code: "+971", flag: "🇦🇪", name: "UAE" }, { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
//   { code: "+974", flag: "🇶🇦", name: "Qatar" }, { code: "+965", flag: "🇰🇼", name: "Kuwait" }, { code: "+973", flag: "🇧🇭", name: "Bahrain" },
//   { code: "+968", flag: "🇴🇲", name: "Oman" }, { code: "+1", flag: "🇺🇸", name: "USA / Canada" }, { code: "+44", flag: "🇬🇧", name: "UK" },
//   { code: "+61", flag: "🇦🇺", name: "Australia" }, { code: "+65", flag: "🇸🇬", name: "Singapore" }, { code: "+60", flag: "🇲🇾", name: "Malaysia" },
//   { code: "+86", flag: "🇨🇳", name: "China" }, { code: "+81", flag: "🇯🇵", name: "Japan" }, { code: "+49", flag: "🇩🇪", name: "Germany" },
//   { code: "+33", flag: "🇫🇷", name: "France" }, { code: "+39", flag: "🇮🇹", name: "Italy" }, { code: "+34", flag: "🇪🇸", name: "Spain" },
//   { code: "+7",  flag: "🇷🇺", name: "Russia" }, { code: "+55", flag: "🇧🇷", name: "Brazil" }, { code: "+92", flag: "🇵🇰", name: "Pakistan" },
//   { code: "+880",flag: "🇧🇩", name: "Bangladesh" }, { code: "+94", flag: "🇱🇰", name: "Sri Lanka" }, { code: "+977", flag: "🇳🇵", name: "Nepal" },
//   { code: "+20", flag: "🇪🇬", name: "Egypt" }, { code: "+234",flag: "🇳🇬", name: "Nigeria" }, { code: "+27", flag: "🇿🇦", name: "South Africa" },
//   { code: "+254",flag: "🇰🇪", name: "Kenya" }, { code: "+62", flag: "🇮🇩", name: "Indonesia" }, { code: "+63", flag: "🇵🇭", name: "Philippines" },
//   { code: "+66", flag: "🇹🇭", name: "Thailand" }, { code: "+84", flag: "🇻🇳", name: "Vietnam" }, { code: "+82", flag: "🇰🇷", name: "South Korea" },
//   { code: "+90", flag: "🇹🇷", name: "Turkey" }, { code: "+98", flag: "🇮🇷", name: "Iran" }, { code: "+964",flag: "🇮🇶", name: "Iraq" },
//   { code: "+961",flag: "🇱🇧", name: "Lebanon" }, { code: "+962",flag: "🇯🇴", name: "Jordan" },
// ];

// const CountryCodePicker = ({ value, onChange }) => {
//   const [open, setOpen] = useState(false), [search, setSearch] = useState("");
//   const selected = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];
//   const filtered = search.trim() ? COUNTRY_CODES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)) : COUNTRY_CODES;
//   return (
//     <div style={{ position: "relative" }}>
//       <button type="button" onClick={() => { setOpen((o) => !o); setSearch(""); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap", minWidth: "82px" }}>
//         <span style={{ fontSize: "16px" }}>{selected.flag}</span><span>{selected.code}</span><span style={{ fontSize: "10px", opacity: 0.5 }}>▼</span>
//       </button>
//       {open && (
//         <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999, background: "#1a2535", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", overflow: "hidden", minWidth: "220px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
//           <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
//             <input autoFocus type="text" placeholder="Search country..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "7px 10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
//           </div>
//           <div style={{ maxHeight: "240px", overflowY: "auto" }}>
//             {filtered.map((c) => (
//               <div key={c.code + c.name} onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
//                 style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", background: c.code === value ? "rgba(201,169,110,0.15)" : "transparent", color: c.code === value ? "#c9a96e" : "rgba(255,255,255,0.8)" }}
//                 onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
//                 onMouseOut={(e)  => (e.currentTarget.style.background = c.code === value ? "rgba(201,169,110,0.15)" : "transparent")}>
//                 <span style={{ fontSize: "16px", flexShrink: 0 }}>{c.flag}</span>
//                 <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
//                 <span style={{ opacity: 0.5, fontSize: "12px", flexShrink: 0 }}>{c.code}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const StepDetails  = ({ user, onBook, onLogout }) => (
//   <div>
//     {user ? <div className="logged-in-card"><div><div className="logged-in-label">✓ Logged in as</div><div className="logged-in-name">{user.name}</div><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{user.email}</div></div><button className="logout-btn" onClick={onLogout}>Logout</button></div>
//       : <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>To book this unit, please log in or create an account. Both email and phone will be verified.</p>}
//     <button className="book-btn" onClick={onBook}>{user ? "Continue to Booking →" : "Login / Register to Book →"}</button>
//   </div>
// );

// const StepLogin = ({ form, setForm, onLogin, onSwitch, loading, error }) => (
//   <div>
//     <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "16px" }}>Login to your account</div>
//     {error && <ErrorBox msg={error} />}
//     <input className="sidebar-input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
//     <input className="sidebar-input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && onLogin()} style={{ marginBottom: "16px" }} />
//     <button className="book-btn" onClick={onLogin} disabled={loading || !form.email || !form.password}>{loading ? "Logging in..." : "Login →"}</button>
//     {onSwitch && <p style={{ textAlign: "center", marginTop: "14px", color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Don't have an account? <button className="auth-link" onClick={onSwitch}>Register</button></p>}
//   </div>
// );

// const StepRegister = ({ form, setForm, onRegister, onSwitch, loading, error }) => {
//   const [showPass, setShowPass] = useState(false);
//   const strength = !form.password ? 0 : [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;
//   const strengthColor = ["#ef4444","#f59e0b","#f59e0b","#22c55e","#22c55e"][strength];
//   return (
//     <div>
//       <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Create an account</div>
//       <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "14px" }}>We'll verify your email and phone number</div>
//       {error && <ErrorBox msg={error} />}
//       <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
//         {[{ v: "user", label: "👤 Buyer" }, { v: "broker", label: "🤝 Broker" }].map(({ v, label }) => (
//           <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, role: v }))} style={{ flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", border: form.role === v ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.1)", background: form.role === v ? "rgba(201,169,110,0.15)" : "transparent", color: form.role === v ? "#c9a96e" : "rgba(255,255,255,0.5)", fontWeight: form.role === v ? "700" : "400" }}>{label}</button>
//         ))}
//       </div>
//       <input className="sidebar-input" type="text"  placeholder="Full Name *"     value={form.name}           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
//       {form.role === "broker" && <input className="sidebar-input" type="text" placeholder="Company / Agency Name" value={form.broker_company} onChange={(e) => setForm((f) => ({ ...f, broker_company: e.target.value }))} />}
//       <input className="sidebar-input" type="email" placeholder="Email Address *" value={form.email}          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
//       <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
//         <CountryCodePicker value={form.country_code} onChange={(v) => setForm((f) => ({ ...f, country_code: v }))} />
//         <input style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px" }} type="tel" placeholder="Phone number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} />
//       </div>
//       <div style={{ position: "relative", marginBottom: "4px" }}>
//         <input style={{ width: "100%", padding: "10px 40px 10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px", boxSizing: "border-box" }} type={showPass ? "text" : "password"} placeholder="Password (min 8 chars) *" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
//         <button type="button" onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "14px" }}>{showPass ? "🙈" : "👁"}</button>
//       </div>
//       {form.password && <div style={{ marginBottom: "12px" }}><div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>{[1,2,3,4].map((i) => <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }} />)}</div><div style={{ fontSize: "11px", color: strengthColor }}>{["","Weak","Fair","Good","Strong"][strength]}</div></div>}
//       <button className="book-btn" style={{ marginTop: "6px" }} onClick={onRegister} disabled={loading || !form.name || !form.email || !form.phone || !form.password || form.password.length < 8}>{loading ? "Creating account..." : "Register & Verify →"}</button>
//       <p style={{ textAlign: "center", marginTop: "14px", color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Already have an account? <button className="auth-link" onClick={onSwitch}>Login</button></p>
//     </div>
//   );
// };

// const StepOtp = ({ type, onVerify, onResend, loading, error, setError }) => {
//   const [otp, setOtp] = useState(["","","","","",""]);
//   const refs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
//   const isEmail = type === "email";
//   const handleKey = (i, e) => { if (e.key === "Backspace") { if (otp[i]) { const n=[...otp]; n[i]=""; setOtp(n); } else if (i > 0) refs[i-1].current?.focus(); } };
//   const handleChange = (i, val) => { const digit = val.replace(/\D/g,"").slice(-1), n = [...otp]; n[i] = digit; setOtp(n); if (digit && i < 5) refs[i+1].current?.focus(); if (digit && i === 5) { const full=[...n].join(""); if (full.length===6) { setError(""); onVerify(full); } } };
//   const handlePaste = (e) => { const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6); if (p.length===6) { setOtp(p.split("")); refs[5].current?.focus(); setError(""); onVerify(p); } };
//   const fullOtp = otp.join("");
//   return (
//     <div>
//       <div style={{ textAlign: "center", marginBottom: "20px" }}>
//         <div style={{ fontSize: "36px", marginBottom: "8px" }}>{isEmail ? "📧" : "📱"}</div>
//         <div style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>Verify your {isEmail ? "email" : "phone"}</div>
//         <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "6px" }}>Enter the 6-digit code sent to your {isEmail ? "email" : "phone"}.</div>
//       </div>
//       {error && <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "12px", background: error.startsWith("✓") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${error.startsWith("✓") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, color: error.startsWith("✓") ? "#22c55e" : "#fca5a5" }}>{error}</div>}
//       <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }} onPaste={handlePaste}>
//         {otp.map((digit, i) => <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)} style={{ width: "44px", height: "52px", textAlign: "center", fontSize: "22px", fontWeight: "700", background: digit ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.07)", border: `2px solid ${digit ? "#c9a96e" : "rgba(255,255,255,0.12)"}`, borderRadius: "10px", color: "white", outline: "none" }} />)}
//       </div>
//       <button className="book-btn" onClick={() => { if (fullOtp.length===6) onVerify(fullOtp); }} disabled={loading || fullOtp.length < 6}>{loading ? "Verifying..." : "Verify Code →"}</button>
//       <div style={{ textAlign: "center", marginTop: "16px" }}><span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Didn't receive the code? </span><button className="auth-link" onClick={() => { setOtp(["","","","","",""]); onResend(); }} disabled={loading}>Resend</button></div>
//     </div>
//   );
// };

// // ── StepPlanSelect: now shows per-milestone tax details inline ─────────────────
// const StepPlanSelect = ({ plans, selected, onSelect, fmtPrice, unitPrice, onNext, onBack, existingBookingId, feeBreakdown, sym = "₹" }) => {
//   const [expanded, setExpanded] = useState(null);
//   const price = parseFloat(String(unitPrice || "0").replace(/,/g, "")) || 0;
//   const calcAmt = (pct) => price > 0 ? fmtPrice(((price * pct) / 100).toFixed(0)) : null;

//   return (
//     <div>
//       <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Choose a Payment Plan</div>
//       <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "14px" }}>Select how you'd like to pay for this unit</div>

//       {/* Grand total banner if fees/tax available */}
//       {feeBreakdown?.tax_enabled && feeBreakdown?.total_amount > 0 && (
//         <div style={{ marginBottom: "14px", padding: "10px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", fontSize: "12px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//             <span style={{ color: "#8899aa" }}>Unit Price</span>
//             <span style={{ color: "#d0dce8" }}>{sym}{parseFloat(feeBreakdown.unit_price || price).toLocaleString("en-IN")}</span>
//           </div>
//           {feeBreakdown.tax_amount > 0 && (
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//               <span style={{ color: "#f59e0b" }}>{feeBreakdown.tax_label || "Tax"} ({feeBreakdown.tax_rate}%)</span>
//               <span style={{ color: "#f59e0b" }}>{sym}{parseFloat(feeBreakdown.tax_amount).toLocaleString("en-IN")}</span>
//             </div>
//           )}
//           <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "5px", marginTop: "2px" }}>
//             <span style={{ color: "#c9a96e", fontWeight: "700" }}>Grand Total</span>
//             <span style={{ color: "#c9a96e", fontWeight: "800" }}>{sym}{parseFloat(feeBreakdown.total_amount).toLocaleString("en-IN")}</span>
//           </div>
//         </div>
//       )}

//       {/* Full payment option */}
//       <div onClick={() => onSelect(null)} style={{ padding: "12px 14px", borderRadius: "10px", marginBottom: "8px", cursor: "pointer", border: selected === null ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.08)", background: selected === null ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)" }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <div>
//             <div style={{ color: "#e0e8f0", fontWeight: "600", fontSize: "13px" }}>Full Payment</div>
//             <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "2px" }}>
//               Pay {feeBreakdown?.total_amount ? `${sym}${parseFloat(feeBreakdown.total_amount).toLocaleString("en-IN")} (incl. taxes)` : "the full amount"} upfront
//             </div>
//           </div>
//           <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: selected === null ? "#c9a96e" : "rgba(255,255,255,0.2)", background: selected === null ? "#c9a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{selected === null && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}</div>
//         </div>
//       </div>

//       {plans.map((plan) => {
//         const isSelected = selected === plan.id, isExpanded = expanded === plan.id;
//         const totalPct = plan.milestones.reduce((s, m) => s + (parseFloat(m.percentage) || 0), 0);
//         return (
//           <div key={plan.id} style={{ marginBottom: "8px" }}>
//             <div onClick={() => { onSelect(plan.id); setExpanded(isExpanded ? null : plan.id); }} style={{ padding: "12px 14px", borderRadius: isExpanded ? "10px 10px 0 0" : "10px", cursor: "pointer", border: isSelected ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.08)", background: isSelected ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)" }}>
//               <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ color: "#e0e8f0", fontWeight: "700", fontSize: "13px" }}>{plan.name}</div>
//                   {plan.description && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>{plan.description}</div>}
//                   {!isExpanded && <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>{plan.milestones.slice(0,2).map((m,i) => <span key={i} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "8px", background: "rgba(201,169,110,0.15)", color: "#c9a96e", fontWeight: "600" }}>{m.label}{m.percentage ? ` · ${m.percentage}%` : ""}</span>)}{plan.milestones.length > 2 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+{plan.milestones.length - 2} more</span>}</div>}
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
//                   <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: isSelected ? "#c9a96e" : "rgba(255,255,255,0.2)", background: isSelected ? "#c9a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{isSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}</div>
//                   <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : plan.id); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "11px", cursor: "pointer", padding: 0 }}>{isExpanded ? "▲ Less" : "▼ Details"}</button>
//                 </div>
//               </div>
//             </div>
//             {isExpanded && (
//               <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "0 0 10px 10px", border: "1px solid rgba(201,169,110,0.15)", borderTop: "none", paddingTop: "4px" }}>
//                 {plan.milestones.map((m, i) => {
//                   const c = TYPE_COLORS[m.type] || TYPE_COLORS.custom, icon = TYPE_ICONS[m.type] || "⭐";
//                   const amt = m.calculated_amount ? fmtPrice(m.calculated_amount) : m.percentage ? calcAmt(m.percentage) : null;
//                   return (
//                     <div key={i} style={{ padding: "10px 14px", borderBottom: i < plan.milestones.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
//                       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
//                           <span style={{ fontSize: "16px" }}>{icon}</span>
//                           <div>
//                             <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "8px", background: c.bg, color: c.color, fontWeight: "700" }}>{m.type_label}</span>
//                             <span style={{ color: "#d0dce8", fontSize: "12px", fontWeight: "600", marginLeft: "6px" }}>{m.label}</span>
//                           </div>
//                         </div>
//                         <div style={{ textAlign: "right" }}>
//                           {m.percentage > 0 && <div style={{ color: "#c9a96e", fontWeight: "800", fontSize: "15px" }}>{m.percentage}%</div>}
//                           {amt && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>≈ {amt}</div>}
//                         </div>
//                       </div>
//                       {/* ── Per-milestone tax breakdown ── */}
//                       {feeBreakdown && m.percentage && <MilestoneTaxRow milestone={m} feeBreakdown={feeBreakdown} fmtPrice={fmtPrice} />}
//                     </div>
//                   );
//                 })}
//                 <div style={{ padding: "8px 14px", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.05)", flexWrap: "wrap", gap: "4px" }}>
//                   <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Total</span>
//                   <div style={{ textAlign: "right" }}>
//                     <span style={{ color: totalPct === 100 ? "#22c55e" : "#c9a96e", fontWeight: "700", fontSize: "13px" }}>{totalPct.toFixed(0)}%{totalPct === 100 ? " ✓" : ""}</span>
//                     {feeBreakdown?.total_amount > 0 && (
//                       <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "2px" }}>
//                         = {sym}{parseFloat(feeBreakdown.total_amount).toLocaleString("en-IN")} incl. taxes
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//       <button className="book-btn" onClick={onNext} style={{ marginTop: "12px" }}>{existingBookingId ? "Update Plan & Pay →" : "Continue →"}</button>
//       <button type="button" onClick={onBack} style={{ display: "block", width: "100%", marginTop: "8px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.4)", padding: "10px", cursor: "pointer", fontSize: "13px" }}>← Back</button>
//     </div>
//   );
// };

// // ── StepBookingForm: now shows BookingSummaryTaxCard before submit ─────────────
// const StepBookingForm = ({ user, form, setForm, onSubmit, loading, error, selectedPlan, plans, onBack, unit, existingBookingId, feeBreakdown, sym = "₹" }) => {
//   const plan = plans.find((p) => p.id === selectedPlan), isBroker = user?.role === "broker";
//   const price = parseFloat((unit?.offer_price || unit?.actual_price || "").toString().replace(/[^0-9.]/g, "")) || 0;
//   const commissionRate = parseFloat(user?.commission_rate || 2), commissionAmt = price > 0 ? ((price * commissionRate) / 100).toFixed(2) : null;
//   const canSubmit = isBroker ? form.name && form.phone && form.client_name && form.client_phone : form.name && form.phone;
//   return (
//     <div>
//       <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>{existingBookingId ? "Update Payment Plan" : "Confirm Booking"}</div>
//       <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "12px" }}>{existingBookingId ? <span>Updating plan for booking <span style={{ color: "#c9a96e" }}>#{existingBookingId}</span></span> : isBroker ? <>Booking as broker <span style={{ color: "#c9a96e" }}>{user?.name}</span></> : <>Booking as <span style={{ color: "#c9a96e" }}>{user?.name}</span></>}</div>
//       {plan && <div style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px" }}><div style={{ color: "#c9a96e", fontWeight: "700", marginBottom: "2px" }}>💳 {plan.name}</div><div style={{ color: "rgba(255,255,255,0.45)" }}>Selected payment plan</div><button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "#8fa0b4", fontSize: "11px", padding: "0", marginTop: "4px", cursor: "pointer", textDecoration: "underline" }}>Change plan</button></div>}

//       {/* ── Tax & fee summary card ── */}
//       <BookingSummaryTaxCard feeBreakdown={feeBreakdown} selectedPlan={selectedPlan} plans={plans} unit={unit} sym={sym} />

//       {error && <ErrorBox msg={error} />}
//       {isBroker ? (
//         <>
//           {commissionAmt && <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px" }}>Your Commission</div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}>₹{parseFloat(commissionAmt).toLocaleString("en-IN")}</div><div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{commissionRate}% of price</div></div></div>}
//           <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", textTransform: "uppercase" }}>Your Contact Info</div>
//           <input className="sidebar-input" type="text" placeholder="Your Name *"  value={form.name}  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
//           <input className="sidebar-input" type="tel"  placeholder="Your Phone *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
//           <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", marginTop: "8px", textTransform: "uppercase" }}>Client Details</div>
//           <input className="sidebar-input" type="text" placeholder="Client Full Name *" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} />
//           <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}><CountryCodePicker value={form.client_country_code} onChange={(v) => setForm((f) => ({ ...f, client_country_code: v }))} /><input style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px" }} type="tel" placeholder="Client Phone *" value={form.client_phone} onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value.replace(/\D/g, "") }))} /></div>
//           <input className="sidebar-input" type="email" placeholder="Client Email (optional)" value={form.client_email} onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))} />
//           <textarea className="sidebar-input" placeholder="Notes (optional)" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "none", marginBottom: "16px" }} />
//         </>
//       ) : (
//         <>
//           <input className="sidebar-input" type="text" placeholder="Your Name *"   value={form.name}  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
//           <input className="sidebar-input" type="tel"  placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
//           <textarea className="sidebar-input" placeholder="Message / Notes (optional)" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "none", marginBottom: "16px" }} />
//         </>
//       )}
//       <button className="book-btn" onClick={onSubmit} disabled={loading || !canSubmit}>{loading ? "Submitting..." : existingBookingId ? "✓ Update Plan & Proceed to Payment" : isBroker ? "✓ Submit Booking for Client" : "✓ Confirm Booking"}</button>
//     </div>
//   );
// };

// const BookingDone = ({ unit, onClose }) => (
//   <div className="booking-done">
//     <div className="booking-done-emoji">🎉</div>
//     <div className="booking-done-title">Booking Received!</div>
//     <div className="booking-done-text">Your enquiry for Unit {unit.plot_number} has been submitted.<br />Our team will contact you shortly.</div>
//     <button className="book-btn" onClick={onClose}>Close</button>
//   </div>
// );

// const ErrorBox = ({ msg }) => <div className="error-box">⚠️ {msg}</div>;

// export default UnitPage;


import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser, clearUser } from "../redux/authSlice";
import { useWishlist } from "../hooks/useWishlist";
import { useToast } from "../context/ToastContext";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import "../styles/UnitPage.css";

import { apiUrl, imgUrl } from "../apiUrl";

const API_BASE = `${apiUrl}/api`;

const toRad = (deg) => parseFloat((deg * (Math.PI / 180)).toFixed(6));

const AMENITY_ICONS = {
  "Swimming Pool": "🏊", Gym: "🏋️", Parking: "🚗", "24/7 Security": "🔒",
  "Club House": "🏛️", "Children Play Area": "🛝", "Jogging Track": "🏃",
  Garden: "🌿", Lift: "🛗", "Power Backup": "⚡", "CCTV Surveillance": "📹",
  Intercom: "📞", "Visitor Parking": "🅿️", Terrace: "🏙️",
};
const amenityIcon = (name) => AMENITY_ICONS[name] || "✨";
const toFt  = (m)  => (m * 3.28084).toFixed(1);

// ── Formatters ────────────────────────────────────────────────────────────────
// fmtExact → always 2 decimal places — used for every money amount shown to users.
//            Avoids the rounding mismatch where display differs from what gateway charges.
// fmtRound → 0 decimal places — only used for non-financial labels/headings where
//            a rounded number is fine and the user won't reconcile it against a receipt.
const fmtExact = (n, sym = "₹") => {
  if (n == null || n === "") return "—";
  return sym + parseFloat(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Legacy compat — PaymentPage already uses its own fmt() with 2dp, keep that unchanged.
// This alias is used only inside UnitPage components.
const fmtRound = (n, sym = "₹") => {
  if (n == null || n === "") return "—";
  return sym + parseFloat(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

// ── Tax/Fee utility helpers ───────────────────────────────────────────────────
const computeMilestoneAmounts = (milestonePercent, feeBreakdown) => {
  if (!feeBreakdown || !milestonePercent) return null;
  const pct   = parseFloat(milestonePercent) / 100;
  const base  = (feeBreakdown.unit_price         || 0) * pct;
  const tax   = (feeBreakdown.tax_amount         || 0) * pct;
  const proc  = (feeBreakdown.processing_fee     || 0) * pct;
  const stamp = (feeBreakdown.stamp_duty         || 0) * pct;
  const reg   = (feeBreakdown.registration_fee   || 0) * pct;
  const maint = (feeBreakdown.maintenance_charge || 0) * pct;
  const cf1   = (feeBreakdown.custom_fee1        || 0) * pct;
  const cf2   = (feeBreakdown.custom_fee2        || 0) * pct;
  const fees  = proc + stamp + reg + maint + cf1 + cf2;
  const total = base + tax + fees;
  return {
    base, tax, fees, total,
    breakdown: { proc, stamp, reg, maint, cf1, cf2 },
    labels:      feeBreakdown.fee_labels   || {},
    taxLabel:    feeBreakdown.tax_label    || "Tax",
    taxRate:     feeBreakdown.tax_rate     || 0,
    taxSystem:   feeBreakdown.tax_system   || "",
    currencySymbol: feeBreakdown.currency_symbol || "₹",
  };
};

// ── TaxBreakdownBadge ─────────────────────────────────────────────────────────
// FIX: replaced Math.round() with fmtExact() throughout so every figure
//      in the popover matches what the gateway will actually charge.
const TaxBreakdownBadge = ({ milestonePercent, feeBreakdown, sym = "₹" }) => {
  const [open, setOpen] = useState(false);
  const data = computeMilestoneAmounts(milestonePercent, feeBreakdown);
  if (!data || (!data.tax && !data.fees)) return null;

  // Use exact 2dp for all amounts inside the badge
  const f = (n) => fmtExact(n, sym);

  const extraFees = [
    data.breakdown.proc  > 0 && { label: data.labels.processing   || "Processing Fee",   val: data.breakdown.proc  },
    data.breakdown.stamp > 0 && { label: data.labels.stamp_duty   || "Stamp Duty",        val: data.breakdown.stamp },
    data.breakdown.reg   > 0 && { label: data.labels.registration || "Registration Fee",  val: data.breakdown.reg   },
    data.breakdown.maint > 0 && { label: data.labels.maintenance  || "Maintenance",       val: data.breakdown.maint },
    data.breakdown.cf1   > 0 && { label: data.labels.custom1      || "Custom Fee 1",      val: data.breakdown.cf1   },
    data.breakdown.cf2   > 0 && { label: data.labels.custom2      || "Custom Fee 2",      val: data.breakdown.cf2   },
  ].filter(Boolean);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)",
          borderRadius: "6px", padding: "1px 6px", fontSize: "10px", fontWeight: "700",
          color: "#f59e0b", cursor: "pointer", lineHeight: "1.6", marginLeft: "6px",
        }}
      >
        +tax
      </button>
      {open && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: "absolute", bottom: "calc(100% + 6px)", right: 0, zIndex: 999,
          background: "#1a2535", border: "1px solid rgba(201,169,110,0.25)",
          borderRadius: "10px", padding: "12px 14px", minWidth: "240px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
            Charges for this instalment
          </div>

          {/* Base — exact */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", paddingBottom: "4px" }}>
            <span>Unit price portion</span><span>{f(data.base)}</span>
          </div>

          {/* Extra fees — exact */}
          {extraFees.map((fee, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", paddingBottom: "4px" }}>
              <span>{fee.label}</span><span>{f(fee.val)}</span>
            </div>
          ))}

          {/* Tax — exact */}
          {data.tax > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#f59e0b", paddingBottom: "4px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "6px", marginTop: "2px" }}>
              <span>
                {data.taxLabel}
                {data.taxRate > 0 && <span style={{ opacity: 0.7, marginLeft: "4px" }}>({data.taxRate}%{data.taxSystem ? ` · ${data.taxSystem.toUpperCase()}` : ""})</span>}
              </span>
              <span>{f(data.tax)}</span>
            </div>
          )}

          {/* Total — exact */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "800", color: "#c9a96e", borderTop: "1px solid rgba(201,169,110,0.3)", paddingTop: "7px", marginTop: "4px" }}>
            <span>Instalment total</span><span>{f(data.total)}</span>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            style={{ position: "absolute", top: "6px", right: "8px", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}
          >×</button>
        </div>
      )}
    </span>
  );
};

// ── MilestoneTaxRow ───────────────────────────────────────────────────────────
// FIX: replaced Math.round() with fmtExact() so the expanded tax row
//      in StepPlanSelect shows the exact figure users will be charged.
const MilestoneTaxRow = ({ milestone, feeBreakdown }) => {
  if (!feeBreakdown || !milestone.percentage) return null;
  const data = computeMilestoneAmounts(milestone.percentage, feeBreakdown);
  if (!data || (!data.tax && !data.fees)) return null;

  const sym = data.currencySymbol;
  const f   = (n) => fmtExact(n, sym);

  const extraFees = [
    data.breakdown.proc  > 0 && { label: data.labels.processing   || "Processing Fee",   val: data.breakdown.proc  },
    data.breakdown.stamp > 0 && { label: data.labels.stamp_duty   || "Stamp Duty",        val: data.breakdown.stamp },
    data.breakdown.reg   > 0 && { label: data.labels.registration || "Registration Fee",  val: data.breakdown.reg   },
    data.breakdown.maint > 0 && { label: data.labels.maintenance  || "Maintenance",       val: data.breakdown.maint },
    data.breakdown.cf1   > 0 && { label: data.labels.custom1      || "Custom Fee 1",      val: data.breakdown.cf1   },
    data.breakdown.cf2   > 0 && { label: data.labels.custom2      || "Custom Fee 2",      val: data.breakdown.cf2   },
  ].filter(Boolean);

  return (
    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "8px", padding: "10px 12px", marginTop: "6px" }}>
      <div style={{ fontSize: "10px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>
        Tax &amp; fees for this instalment
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8899aa" }}>
          <span>Base ({milestone.percentage}% of unit price)</span><span>{f(data.base)}</span>
        </div>
        {extraFees.map((fee, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8899aa" }}>
            <span>{fee.label}</span><span>{f(fee.val)}</span>
          </div>
        ))}
        {data.tax > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#f59e0b", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "5px", marginTop: "2px" }}>
            <span>{data.taxLabel}{data.taxRate > 0 ? ` (${data.taxRate}%)` : ""}</span>
            <span>{f(data.tax)}</span>
          </div>
        )}
        {/* Total — exact, so user can verify base + fees + tax = total */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "800", color: "#c9a96e", borderTop: "1px solid rgba(201,169,110,0.25)", paddingTop: "6px", marginTop: "3px" }}>
          <span>Instalment total</span><span>{f(data.total)}</span>
        </div>
      </div>
    </div>
  );
};

// ── BookingSummaryTaxCard ─────────────────────────────────────────────────────
// FIX: already used a 2dp formatter internally — kept as-is but consolidated
//      to use fmtExact() for consistency.
const BookingSummaryTaxCard = ({ feeBreakdown, selectedPlan, plans, unit, sym = "₹" }) => {
  if (!feeBreakdown?.tax_enabled && !feeBreakdown?.processing_fee && !feeBreakdown?.stamp_duty) return null;

  // Always 2dp — this is the pre-booking cost summary the user signs off on
  const f = (n) => fmtExact(n, sym);
  const labels = feeBreakdown.fee_labels || {};

  const extraFees = [
    feeBreakdown.processing_fee    > 0 && { label: labels.processing   || "Processing Fee",   val: feeBreakdown.processing_fee    },
    feeBreakdown.stamp_duty        > 0 && { label: labels.stamp_duty   || "Stamp Duty",       val: feeBreakdown.stamp_duty         },
    feeBreakdown.registration_fee  > 0 && { label: labels.registration || "Registration Fee", val: feeBreakdown.registration_fee   },
    feeBreakdown.maintenance_charge> 0 && { label: labels.maintenance  || "Maintenance",      val: feeBreakdown.maintenance_charge  },
    feeBreakdown.custom_fee1       > 0 && { label: labels.custom1      || "Custom Fee 1",     val: feeBreakdown.custom_fee1        },
    feeBreakdown.custom_fee2       > 0 && { label: labels.custom2      || "Custom Fee 2",     val: feeBreakdown.custom_fee2        },
  ].filter(Boolean);

  const plan     = plans.find((p) => p.id === selectedPlan);
  const firstMs  = plan?.milestones?.[0];
  const firstPct = firstMs?.percentage ? parseFloat(firstMs.percentage) / 100 : 1;
  const dueNow   = feeBreakdown.total_amount * (plan ? firstPct : 1);

  return (
    <div style={{
      background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.25)",
      borderRadius: "10px", padding: "14px 14px", marginBottom: "16px",
    }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
        📄 Payment Breakdown
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", marginBottom: "5px" }}>
        <span>Unit Price</span><span>{f(feeBreakdown.unit_price)}</span>
      </div>
      {extraFees.map((fee, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8899aa", marginBottom: "5px" }}>
          <span>{fee.label}</span><span>{f(fee.val)}</span>
        </div>
      ))}
      {feeBreakdown.tax_amount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#f59e0b", fontWeight: "600", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "7px", marginTop: "4px", marginBottom: "5px" }}>
          <span>
            {feeBreakdown.tax_label || "Tax"}
            {feeBreakdown.tax_rate > 0 && (
              <span style={{ fontSize: "10px", marginLeft: "5px", opacity: 0.8 }}>
                ({feeBreakdown.tax_rate}%{feeBreakdown.tax_system ? ` · ${feeBreakdown.tax_system.toUpperCase()}` : ""}{feeBreakdown.tax_inclusive ? " · Incl." : ""})
              </span>
            )}
          </span>
          <span>{f(feeBreakdown.tax_amount)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800", color: "#c9a96e", borderTop: "1px solid rgba(201,169,110,0.3)", paddingTop: "8px", marginTop: "4px" }}>
        <span>Grand Total</span><span>{f(feeBreakdown.total_amount)}</span>
      </div>

      {plan && firstMs && (
        <div style={{ marginTop: "10px", padding: "8px 10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "7px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <span style={{ color: "#22c55e", fontWeight: "700" }}>
              Due Now — {firstMs.label} ({firstMs.percentage}%)
            </span>
            {/* Exact amount — this is what the gateway will charge */}
            <span style={{ color: "#22c55e", fontWeight: "800" }}>{f(dueNow)}</span>
          </div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>
            Includes proportional taxes &amp; fees
          </div>
        </div>
      )}

      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "8px", textAlign: "center" }}>
        Amounts are estimates. Final figures confirmed at booking.
      </div>
    </div>
  );
};

const UnitPage = () => {
  const { plotId } = useParams();
  const navigate   = useNavigate();

  const containerRef    = useRef(null);
  const viewerRef       = useRef(null);
  const markersRef      = useRef(null);
  const overlayRef      = useRef(null);
  const labelRef        = useRef(null);
  const allMarkerIdsRef = useRef([]);

  const [unit,          setUnit]          = useState(null);
  const [hotspots,      setHotspots]      = useState(null);
  const [fetchError,    setFetchError]    = useState(null);
  const [isFetching,    setIsFetching]    = useState(true);
  const [isLoaded,      setIsLoaded]      = useState(false);
  const [loadProgress,  setLoadProgress]  = useState(0);
  const [activeTab,     setActiveTab]     = useState("details");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [bookingStep,   setBookingStep]   = useState("details");
  const [selectedPlan,  setSelectedPlan]  = useState(null);
  const [loginForm,     setLoginForm]     = useState({ email: "", password: "" });
  const [registerForm,  setRegisterForm]  = useState({
    name: "", email: "", country_code: "+91", phone: "",
    password: "", role: "user", broker_company: "",
  });
  const [bookingForm, setBookingForm] = useState({
    name: "", phone: "", notes: "",
    client_name: "", client_phone: "", client_email: "", client_country_code: "+91",
  });
  const [authLoading,       setAuthLoading]       = useState(false);
  const [authError,         setAuthError]         = useState("");
  const [bookingDone,       setBookingDone]        = useState(false);
  const [pendingUserId,     setPendingUserId]      = useState(null);
  const [existingBookingId, setExistingBookingId]  = useState(null);
  const [currency,          setCurrency]           = useState("₹");
  const [feeBreakdown,      setFeeBreakdown]       = useState(null);

  const [loginModalOpen,     setLoginModalOpen]     = useState(false);
  const [pendingWishlist,    setPendingWishlist]    = useState(false);
  const [modalStep,          setModalStep]          = useState("login");
  const [modalPendingUserId, setModalPendingUserId] = useState(null);
  const [modalAuthError,     setModalAuthError]     = useState("");

  const dispatch = useDispatch();
  const user     = useSelector(selectUser);
  const { wishedIds, toggle: toggleWish } = useWishlist(user?.token);
  const { showToast } = useToast();

  const wishlistWithToken = useCallback((freshToken, pid, plotNumber) => {
    fetch(`${API_BASE}/wishlist/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ plot_id: Number(pid) }),
    })
      .then((r) => r.json())
      .then((d) => {
        showToast(
          d.wishlisted ? `❤️ Added to Wishlist — Unit ${plotNumber}` : `🤍 Removed from Wishlist — Unit ${plotNumber}`,
          d.wishlisted ? "wishlist_add" : "wishlist_remove", 2800,
        );
      })
      .catch(() => {});
  }, [showToast]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [unitRes, hsRes, currRes] = await Promise.all([
          fetch(`${API_BASE}/unit/${plotId}`,             { headers: { Accept: "application/json" } }),
          fetch(`${API_BASE}/hotspots?plot_id=${plotId}`, { headers: { Accept: "application/json" } }),
          fetch(`${API_BASE}/currency`,                   { headers: { Accept: "application/json" } }),
        ]);
        if (!unitRes.ok) throw new Error(`Unit API error ${unitRes.status}`);
        const unitData = await unitRes.json();
        const hsData   = hsRes.ok ? await hsRes.json() : [];
        if (currRes.ok) {
          const c = await currRes.json();
          setCurrency(c.symbol || c.currency || c.data?.symbol || c.data?.currency || "₹");
        }
        setUnit(unitData);
        setHotspots(hsData);
      } catch (err) { setFetchError(err.message); }
      finally { setIsFetching(false); }
    };
    fetchAll();
  }, [plotId]);

  useEffect(() => {
    if (!unit?.actual_price && !unit?.offer_price) return;
    const price = unit.offer_price || unit.actual_price;
    fetch(`${API_BASE}/payment/fee-preview?price=${encodeURIComponent(price)}`, {
      headers: { Accept: "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setFeeBreakdown(d.fee_breakdown || d); })
      .catch(() => {});
  }, [unit, user?.token]);

  const destroyViewer = useCallback(() => {
    if (!viewerRef.current) return;
    try { viewerRef.current._cleanup?.(); } catch (e) {}
    try { if (containerRef.current?.isConnected && containerRef.current?.hasChildNodes()) viewerRef.current.destroy(); } catch (e) {}
    viewerRef.current = null; markersRef.current = null;
  }, []);

  const buildMarkers = useCallback((unitData, hsData) => {
    const markers = [];
    hsData.forEach((hs) => {
      if (!hs.yaw || !hs.pitch) return;
      if (hs.hotspot_type === "gallery") {
        markers.push({ id: `hs-gallery-${hs.id}`, position: { yaw: toRad(parseFloat(hs.yaw)), pitch: toRad(parseFloat(hs.pitch)) }, html: `<div class="hs-marker hs-gallery">🖼 ${hs.title || hs.label}</div>`, size: { width: 170, height: 42 }, data: { type: "gallery", galleryIndex: hs.gallery_index ?? 0, name: hs.title || hs.label, yawRad: toRad(parseFloat(hs.yaw)), pitchRad: toRad(parseFloat(hs.pitch)) } });
      } else {
        const room = unitData.rooms?.find((r) => r.id === hs.room_panorama_id || r.room_label === (hs.title || hs.label));
        markers.push({ id: `hs-room-${hs.id}`, position: { yaw: toRad(parseFloat(hs.yaw)), pitch: toRad(parseFloat(hs.pitch)) }, html: `<div class="hs-marker hs-room">🚪 ${hs.title || hs.label}</div>`, size: { width: 160, height: 42 }, data: { type: "room", roomId: room?.id || hs.room_panorama_id, name: hs.title || hs.label, yawRad: toRad(parseFloat(hs.yaw)), pitchRad: toRad(parseFloat(hs.pitch)) } });
      }
    });
    if (markers.length === 0 && unitData.rooms?.length > 0) {
      unitData.rooms.forEach((room, idx) => {
        const yaw = (idx / unitData.rooms.length) * 360 - 180;
        markers.push({ id: `fallback-room-${room.id}`, position: { yaw: toRad(yaw), pitch: toRad(-10) }, html: `<div class="hs-marker hs-room">🚪 ${room.room_label}</div>`, size: { width: 160, height: 42 }, data: { type: "room", roomId: room.id, name: room.room_label, yawRad: toRad(yaw), pitchRad: toRad(-10) } });
      });
    }
    return markers;
  }, []);

  useEffect(() => {
    if (!unit?.panorama_url || !hotspots || !containerRef.current || activeTab !== "panorama") return;
    destroyViewer(); setIsLoaded(false); setLoadProgress(0);
    let current = 0;
    const interval = setInterval(() => { current += Math.random() * 10; if (current >= 90) { current = 90; clearInterval(interval); } setLoadProgress(Math.round(current)); }, 180);
    const psvMarkers = buildMarkers(unit, hotspots);
    allMarkerIdsRef.current = psvMarkers.map((m) => m.id);
    const initTimer = setTimeout(() => {
      if (!containerRef.current) return;
      try {
        viewerRef.current = new Viewer({ container: containerRef.current, panorama: unit.panorama_url, defaultZoomLvl: 50, mousewheelCtrlKey: false, loadingImg: null, loadingTxt: "", useXmpData: false, plugins: [[MarkersPlugin, { markers: psvMarkers }]] });
      } catch (e) { console.error("PSV init error:", e); return; }
      const handleResize = () => { try { viewerRef.current?.autoSize(); } catch (e) {} };
      window.addEventListener("resize", handleResize);
      document.addEventListener("fullscreenchange", handleResize);
      document.addEventListener("webkitfullscreenchange", handleResize);
      markersRef.current = viewerRef.current.getPlugin(MarkersPlugin);
      viewerRef.current.addEventListener("ready", () => {
        clearInterval(interval); setLoadProgress(100); setTimeout(() => setIsLoaded(true), 400);
        let angle = 0, isInteracting = false, resumeTimer = null;
        const swing = () => { if (!isInteracting) { angle += 0.0015; try { viewerRef.current?.rotate({ yaw: Math.sin(angle) * 0.06, pitch: 0 }); } catch (e) {} } if (viewerRef.current) viewerRef.current._rafId = requestAnimationFrame(swing); };
        viewerRef.current._rafId = requestAnimationFrame(swing);
        const onStart = () => { isInteracting = true; clearTimeout(resumeTimer); };
        const onEnd   = () => { resumeTimer = setTimeout(() => { isInteracting = false; }, 2500); };
        const el = containerRef.current;
        if (el) { el.addEventListener("mousedown", onStart, { passive: true }); el.addEventListener("mouseup", onEnd, { passive: true }); el.addEventListener("touchstart", onStart, { passive: true }); el.addEventListener("touchend", onEnd, { passive: true }); }
        viewerRef.current._cleanup = () => {
          if (viewerRef.current?._rafId) cancelAnimationFrame(viewerRef.current._rafId);
          clearTimeout(resumeTimer);
          window.removeEventListener("resize", handleResize); document.removeEventListener("fullscreenchange", handleResize); document.removeEventListener("webkitfullscreenchange", handleResize);
          if (el) { el.removeEventListener("mousedown", onStart); el.removeEventListener("mouseup", onEnd); el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); }
        };
      });
      markersRef.current?.addEventListener("select-marker", ({ marker }) => {
        const { type, roomId, galleryIndex, name, yawRad, pitchRad } = marker.data;
        allMarkerIdsRef.current.forEach((id) => { try { markersRef.current?.updateMarker({ id, opacity: 0 }); } catch (e) {} });
        if (labelRef.current) { labelRef.current.textContent = name; labelRef.current.style.opacity = "1"; }
        viewerRef.current?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 60, speed: "4rpm" })
          .then(() => viewerRef.current?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 100, speed: "20rpm" }))
          .then(() => {
            if (overlayRef.current) { overlayRef.current.style.transition = "opacity 0.4s ease-in"; overlayRef.current.style.opacity = "1"; }
            setTimeout(() => { if (type === "gallery") navigate(`/unit/${plotId}/gallery/${galleryIndex}`); else navigate(`/unit/${plotId}/room/${roomId}`); }, 450);
          });
      });
    }, 50);
    return () => { clearInterval(interval); clearTimeout(initTimer); destroyViewer(); };
  }, [unit, hotspots, activeTab]);

  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.style.opacity = "1"; overlayRef.current.style.transition = "none";
    const t = setTimeout(() => { overlayRef.current.style.transition = "opacity 0.7s ease-out"; overlayRef.current.style.opacity = "0"; }, 50);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (data.step === "verify_email") { setPendingUserId(data.user_id); setBookingStep("verify_email"); setAuthLoading(false); return; }
      if (data.step === "verify_phone") { setPendingUserId(data.user_id); setBookingStep("verify_phone"); setAuthLoading(false); return; }
      if (!res.ok) throw new Error(data.message || "Login failed");
      const userData = { ...data.user, token: data.token };
      dispatch(setUser(userData));
      setBookingForm((f) => ({ ...f, name: userData.name || "", phone: (userData.country_code || "") + (userData.phone || "") }));
      afterAuth();
    } catch (err) { setAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleRegister = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(registerForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Registration failed");
      setPendingUserId(data.user_id); setBookingStep("verify_email"); setAuthError("");
    } catch (err) { setAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleVerifyEmail = async (otp) => {
    setAuthLoading(true); setAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/verify-email`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
      setPendingUserId(data.user_id); setBookingStep("verify_phone"); setAuthError("");
    } catch (err) { setAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleVerifyPhone = async (otp) => {
    setAuthLoading(true); setAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/verify-phone`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
      const userData = { ...data.user, token: data.token };
      dispatch(setUser(userData));
      setBookingForm((f) => ({ ...f, name: userData.name || "", phone: (userData.country_code || "") + (userData.phone || "") }));
      afterAuth();
    } catch (err) { setAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleResendOtp = async (type) => {
    if (!pendingUserId) return;
    setAuthLoading(true); setAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: pendingUserId, type }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend");
      setAuthError("✓ " + data.message);
    } catch (err) { setAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleModalLogin = async () => {
    setAuthLoading(true); setModalAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (data.step === "verify_email") { setModalPendingUserId(data.user_id); setModalStep("verify_email"); setAuthLoading(false); return; }
      if (data.step === "verify_phone") { setModalPendingUserId(data.user_id); setModalStep("verify_phone"); setAuthLoading(false); return; }
      if (!res.ok) throw new Error(data.message || "Login failed");
      const userData = { ...data.user, token: data.token };
      dispatch(setUser(userData));
      setLoginModalOpen(false);
      if (pendingWishlist) { setPendingWishlist(false); wishlistWithToken(data.token, plotId, unit?.plot_number); }
    } catch (err) { setModalAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleModalRegister = async () => {
    setAuthLoading(true); setModalAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(registerForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(", ") || "Registration failed");
      setModalPendingUserId(data.user_id); setModalStep("verify_email"); setModalAuthError("");
    } catch (err) { setModalAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleModalVerifyEmail = async (otp) => {
    setAuthLoading(true); setModalAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/verify-email`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
      setModalPendingUserId(data.user_id); setModalStep("verify_phone"); setModalAuthError("");
    } catch (err) { setModalAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleModalVerifyPhone = async (otp) => {
    setAuthLoading(true); setModalAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/verify-phone`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
      const userData = { ...data.user, token: data.token };
      dispatch(setUser(userData));
      setLoginModalOpen(false);
      if (pendingWishlist) { setPendingWishlist(false); wishlistWithToken(data.token, plotId, unit?.plot_number); }
    } catch (err) { setModalAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleModalResendOtp = async (type) => {
    if (!modalPendingUserId) return;
    setAuthLoading(true); setModalAuthError("");
    try {
      const res  = await fetch(`${API_BASE}/user/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: modalPendingUserId, type }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend");
      setModalAuthError("✓ " + data.message);
    } catch (err) { setModalAuthError(err.message); }
    setAuthLoading(false);
  };

  const closeModal = () => { setLoginModalOpen(false); setPendingWishlist(false); setModalStep("login"); setModalAuthError(""); };

  const handleBooking = async () => {
    setAuthLoading(true); setAuthError("");
    const isBroker = user?.role === "broker";
    if (isBroker && user?.status && user.status !== "active") { setAuthError("Your broker account is currently inactive. Please contact the admin to activate your account before booking."); setAuthLoading(false); return; }
    try {
      if (existingBookingId) {
        const res  = await fetch(`${API_BASE}/bookings/${existingBookingId}/plan`, { method: "PATCH", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user?.token}` }, body: JSON.stringify({ payment_plan_id: selectedPlan }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Plan update failed");
        if (data.booking?.fee_breakdown) setFeeBreakdown(data.booking.fee_breakdown);
        setTimeout(() => navigate(`/payment/${existingBookingId}`), 400);
        return;
      }
      const payload = { plot_id: plotId, plot_number: unit.plot_number, plot_type: unit.plot_type, block: unit.block, section: unit.section, direction: unit.direction, area: unit.plot_size ? String(unit.plot_size) : "", price: unit.offer_price ? String(unit.offer_price) : String(unit.actual_price || ""), project_id: unit.project_id, block_id: unit.block_id, name: bookingForm.name, phone: bookingForm.phone, notes: bookingForm.notes, payment_plan_id: selectedPlan, client_name: isBroker ? bookingForm.client_name : undefined, client_phone: isBroker ? bookingForm.client_country_code + bookingForm.client_phone : undefined, client_email: isBroker ? bookingForm.client_email : undefined };
      const res  = await fetch(`${API_BASE}/bookings`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${user?.token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      if (data.booking?.fee_breakdown) setFeeBreakdown(data.booking.fee_breakdown);
      const bookingId = data.booking?.id;
      if (bookingId) { showToast(`🎉 Booking confirmed! Redirecting to payment…`, "success", 2500); setTimeout(() => navigate(`/payment/${bookingId}`), 400); }
      else { setBookingDone(true); showToast(`✅ Booking received! We'll contact you shortly.`, "success", 4000); }
    } catch (err) { setAuthError(err.message); }
    setAuthLoading(false);
  };

  const handleBack = () => {
    if (overlayRef.current) { overlayRef.current.style.transition = "opacity 0.4s ease-in"; overlayRef.current.style.opacity = "1"; }
    const dest = unit?.block_id ? `/floor/${unit.block_id}` : unit?.floor_id ? `/floor/${unit.floor_id}` : null;
    setTimeout(() => (dest ? navigate(dest) : navigate(-1)), 450);
  };

  const switchToGallery  = () => { destroyViewer(); setActiveTab("gallery"); setIsLoaded(false); };
  const switchToPanorama = () => setActiveTab("panorama");
  const switchToDetails  = () => { destroyViewer(); setActiveTab("details"); };
  const hasPlans         = (unit?.payment_plans?.length || 0) > 0;
  const afterAuth        = () => setBookingStep(hasPlans ? "plan" : "form");

  const openBooking = async () => {
    setSidebarOpen(true); setBookingDone(false); setAuthError("");
    if (user) {
      if (user.role === "broker" && user.status && user.status !== "active") { setBookingStep("broker_inactive"); return; }
      try {
        const res = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } });
        if (res.ok) {
          const data     = await res.json();
          const bookings = Array.isArray(data) ? data : data.data || [];
          const existing = bookings.find((b) => String(b.plot_id) === String(plotId) && b.booking_status !== "cancelled");
          if (existing) {
            setExistingBookingId(existing.id); setSelectedPlan(existing.payment_plan_id || null);
            fetch(`${API_BASE}/bookings/${existing.id}`, { headers: { Authorization: `Bearer ${user.token}`, Accept: "application/json" } })
              .then((r) => r.ok ? r.json() : null)
              .then((d) => { if (d?.booking?.fee_breakdown) setFeeBreakdown(d.booking.fee_breakdown); })
              .catch(() => {});
            if (existing.booking_status === "confirmed") { setBookingDone(true); setBookingStep("details"); return; }
            setBookingStep(hasPlans ? "plan" : "form"); return;
          }
        }
      } catch (e) {}
      setExistingBookingId(null); setBookingStep(hasPlans ? "plan" : "form");
    } else { setExistingBookingId(null); setBookingStep("details"); }
  };

  const logout = () => { dispatch(clearUser()); setBookingStep("details"); setSelectedPlan(null); setExistingBookingId(null); };

  useEffect(() => {
    if (user) setBookingForm((f) => ({ ...f, name: f.name || user.name || "", phone: f.phone || (user.country_code || "") + (user.phone || "") }));
  }, [user?.id]);

  // fmtPrice: used only for the unit listing price label in the header/sidebar
  // — rounded is fine here since it's a "list price" not a payment amount.
  const fmtPrice       = (val) => val ? `${currency} ${Number(val).toLocaleString("en-IN")}` : null;
  const getStatusColor = (s) => { const v = s?.toLowerCase(); return v === "available" ? "#22c55e" : v === "pre-booked" ? "#f59e0b" : "#ef4444"; };

  if (isFetching) return <div className="unit-loading-screen"><div style={{ fontSize: "48px" }}>🏠</div><div style={{ color: "white", fontSize: "18px" }}>Loading unit...</div><div className="loading-bar-track"><div className="loading-bar-fill" /></div></div>;
  if (fetchError || !unit) return <div className="unit-loading-screen"><div style={{ fontSize: "48px" }}>⚠️</div><h2 style={{ color: "white" }}>Unit Unavailable</h2><p style={{ color: "#666" }}>{fetchError || "Unit not found."}</p><button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>← Go Back</button></div>;

  const gallery     = unit.gallery_images || [];
  const hasPano     = !!unit.panorama_url;
  const hasGal      = gallery.length > 0;
  const hasRooms    = unit.rooms?.length > 0;
  const isAvail     = unit.status?.toLowerCase() === "available";
  const statusColor = getStatusColor(unit.status);
  const isWished    = wishedIds instanceof Set ? wishedIds.has(Number(plotId)) : false;
  const sym         = feeBreakdown?.currency_symbol || currency;

  return (
    <div className="unit-page">
      {loginModalOpen && (
        <>
          <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "linear-gradient(135deg,#0f1623,#111827)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "16px", padding: "28px 28px 24px", width: "min(400px, 90vw)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ color: "white", fontWeight: "800", fontSize: "17px" }}>
                {modalStep === "verify_email" ? "📧 Verify Email" : modalStep === "verify_phone" ? "📱 Verify Phone" : "❤️ Save to Wishlist"}
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "22px", cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            {modalStep === "verify_email" ? (
              <StepOtp key="modal-otp-email" type="email" onVerify={handleModalVerifyEmail} onResend={() => handleModalResendOtp("email")} loading={authLoading} error={modalAuthError} setError={setModalAuthError} />
            ) : modalStep === "verify_phone" ? (
              <StepOtp key="modal-otp-phone" type="phone" onVerify={handleModalVerifyPhone} onResend={() => handleModalResendOtp("phone")} loading={authLoading} error={modalAuthError} setError={setModalAuthError} />
            ) : (
              <>
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px" }}>
                  {["login", "register"].map((tab) => (
                    <button key={tab} onClick={() => { setModalStep(tab); setModalAuthError(""); }}
                      style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "700", background: modalStep === tab ? "linear-gradient(135deg,#c9a96e,#a07840)" : "transparent", color: modalStep === tab ? "#000" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }}>
                      {tab === "login" ? "Log In" : "Register"}
                    </button>
                  ))}
                </div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
                  {modalStep === "login" ? "Log in to save this unit to your wishlist." : "Create an account to save this unit to your wishlist."}
                </p>
                {modalStep === "login" ? (
                  <StepLogin form={loginForm} setForm={setLoginForm} onLogin={handleModalLogin} onSwitch={() => { setModalStep("register"); setModalAuthError(""); }} loading={authLoading} error={modalAuthError} />
                ) : (
                  <StepRegister form={registerForm} setForm={setRegisterForm} onRegister={handleModalRegister} onSwitch={() => { setModalStep("login"); setModalAuthError(""); }} loading={authLoading} error={modalAuthError} />
                )}
              </>
            )}
          </div>
        </>
      )}

      <div className="unit-header">
        <button className="unit-back-btn" onClick={handleBack}>← Floor</button>
        <div className="unit-info">
          <div className="unit-title-row">
            <span className="unit-name">Unit {unit.plot_number}</span>
            <span className="unit-status-badge" style={{ background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44` }}>{unit.status}</span>
          </div>
          <div className="unit-subtitle">{unit.plot_type} · {unit.plot_size} sqft{unit.direction ? ` · ${unit.direction}` : ""}</div>
        </div>
        <div className="unit-tabs">
          <button className={`unit-tab${activeTab === "details"  ? " active" : ""}`} onClick={switchToDetails}>📋 Details</button>
          {unit.payment_plans?.length > 0 && <button className={`unit-tab${activeTab === "payment" ? " active" : ""}`} onClick={() => { destroyViewer(); setActiveTab("payment"); }}>💳 Payment Plans</button>}
          {hasPano && <button className={`unit-tab${activeTab === "panorama" ? " active" : ""}`} onClick={switchToPanorama}>🌐 360°</button>}
          {hasGal  && <button className={`unit-tab${activeTab === "gallery"  ? " active" : ""}`} onClick={switchToGallery}>🖼 Gallery ({gallery.length})</button>}
        </div>
        <div className="unit-price-wrap">
          {user && (
            <button onClick={() => navigate("/dashboard")} title={`${user.name} — My Dashboard`}
              style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "20px", padding: "5px 12px 5px 6px", cursor: "pointer", color: "#c9a96e", fontSize: "12px", fontWeight: "700", marginRight: "8px", flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.12)")}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a96e,#a07840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#000", flexShrink: 0 }}>{user.name?.[0]?.toUpperCase()}</span>
              <span style={{ whiteSpace: "nowrap" }}>Dashboard</span>
            </button>
          )}
          <div className="unit-price-box">
            {unit.offer_price && <div className="unit-offer-price">{fmtPrice(unit.offer_price)}</div>}
            <div className="unit-actual-price" style={{ color: unit.offer_price ? "rgba(255,255,255,0.35)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "11px" : "14px" }}>{fmtPrice(unit.actual_price)}</div>
            {feeBreakdown?.tax_enabled && feeBreakdown?.tax_rate > 0 && (
              <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "2px" }}>
                +{feeBreakdown.tax_rate}% {feeBreakdown.tax_label || "Tax"}
              </div>
            )}
          </div>
          {isAvail && <button className="book-now-btn" onClick={openBooking}>Book Now</button>}
          {unit && (
            <button onClick={() => {
              if (!user?.token) { setPendingWishlist(true); setModalStep("login"); setModalAuthError(""); setLoginModalOpen(true); }
              else { const willAdd = !isWished; toggleWish(Number(plotId)); showToast(willAdd ? `❤️ Added to Wishlist — Unit ${unit.plot_number}` : `🤍 Removed from Wishlist — Unit ${unit.plot_number}`, willAdd ? "wishlist_add" : "wishlist_remove", 2800); }
            }}
              title={isWished ? "Remove from Wishlist" : "Save to Wishlist"}
              style={{ background: isWished ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${isWished ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.12)"}`, borderRadius: "8px", cursor: "pointer", padding: "6px 10px", fontSize: "18px", lineHeight: 1, transition: "all 0.2s", boxShadow: isWished ? "0 0 10px rgba(239,68,68,0.25)" : "none", transform: isWished ? "scale(1.08)" : "scale(1)", color: isWished ? "#ef4444" : "rgba(255,255,255,0.7)" }}>
              {isWished ? "❤️" : "🤍"}
            </button>
          )}
        </div>
      </div>

      <div className="unit-content-area">
        {activeTab === "details" && <UnitDetails unit={unit} currency={currency} fmtPrice={fmtPrice} statusColor={statusColor} />}
        {activeTab === "payment" && <PaymentPlansTab plans={unit.payment_plans || []} fmtPrice={fmtPrice} currency={currency} unitPrice={unit.offer_price || unit.actual_price} feeBreakdown={feeBreakdown} sym={sym} />}
        {activeTab === "panorama" && (
          <>
            <div ref={containerRef} className="psv-container-div" />
            <div className={`pano-loader${isLoaded ? " gone" : ""}`}>
              <div className="pano-loader-card">
                <div className="pano-loader-emoji">🏠</div>
                <div className="pano-loader-percent">{loadProgress}%</div>
                <div className="pano-loader-bar-track"><div className="pano-loader-bar-fill" style={{ width: `${loadProgress}%` }} /></div>
                <div className="pano-loader-text">{loadProgress < 40 ? "Preparing panorama..." : loadProgress < 80 ? "Loading image data..." : loadProgress < 100 ? "Almost ready..." : "✓ Ready"}</div>
              </div>
            </div>
            {isLoaded && hasRooms && (
              <div className="room-nav-strip">
                <span className="room-nav-label">Rooms</span>
                {unit.rooms.map((room) => (
                  <button key={room.id} className="room-thumb-btn" onClick={() => navigate(`/unit/${plotId}/room/${room.id}`)}>
                    {room.thumb_url ? <img src={room.thumb_url} alt={room.room_label} /> : <div className="room-thumb-placeholder">🚪</div>}
                    <span>{room.room_label}</span>
                  </button>
                ))}
              </div>
            )}
            <div ref={labelRef} className="marker-label" />
          </>
        )}
        {activeTab === "gallery" && hasGal && <GallerySlider gallery={gallery} plotId={plotId} navigate={navigate} />}
      </div>

      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className={`booking-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Book Unit {unit.plot_number}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "2px" }}>{unit.plot_type} · {unit.plot_size} sqft</div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <div className="sidebar-scroll">
          <div className="unit-detail-card">
            <div className="unit-detail-grid">
              {[["Unit No", unit.plot_number], ["Type", unit.plot_type], ["Area", unit.plot_size ? `${unit.plot_size} sqft` : "—"], ["Direction", unit.direction || "—"], ["Rooms", unit.rooms?.length || 0], ["Gallery", gallery.length]].map(([lbl, val]) => (
                <div key={lbl}><div className="unit-detail-item-label">{lbl}</div><div className="unit-detail-item-value">{val}</div></div>
              ))}
            </div>
            <div className="unit-price-row">
              <div>
                <div className="unit-price-label">Price</div>
                {unit.offer_price && <div className="unit-offer-price-lg">{fmtPrice(unit.offer_price)}</div>}
                <div style={{ color: unit.offer_price ? "rgba(255,255,255,0.3)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "12px" : "18px", fontWeight: "600" }}>{fmtPrice(unit.actual_price)}</div>
                {/* Grand total — exact 2dp so it matches what the gateway charges */}
                {feeBreakdown?.tax_enabled && feeBreakdown?.total_amount > 0 && (
                  <div style={{ marginTop: "6px", padding: "4px 8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "6px", display: "inline-block" }}>
                    <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "700" }}>
                      Grand Total (incl. {feeBreakdown.tax_label || "Tax"}): {fmtExact(feeBreakdown.total_amount, sym)}
                    </span>
                  </div>
                )}
              </div>
              <div className="unit-status-badge" style={{ background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44`, padding: "4px 12px", fontSize: "12px", fontWeight: "700" }}>{unit.status}</div>
            </div>
          </div>

          {bookingStep === "broker_inactive" ? <BrokerInactiveScreen onClose={() => setSidebarOpen(false)} />
           : bookingDone                     ? <BookingDone unit={unit} onClose={() => setSidebarOpen(false)} />
           : bookingStep === "details"        ? <StepDetails user={user} onBook={() => user ? (hasPlans ? setBookingStep("plan") : setBookingStep("form")) : setBookingStep("login")} onLogout={logout} />
           : bookingStep === "login"          ? <StepLogin form={loginForm} setForm={setLoginForm} onLogin={handleLogin} onSwitch={() => { setBookingStep("register"); setAuthError(""); }} loading={authLoading} error={authError} />
           : bookingStep === "register"       ? <StepRegister form={registerForm} setForm={setRegisterForm} onRegister={handleRegister} onSwitch={() => { setBookingStep("login"); setAuthError(""); }} loading={authLoading} error={authError} />
           : bookingStep === "verify_email"   ? <StepOtp key="otp-email" type="email" onVerify={handleVerifyEmail} onResend={() => handleResendOtp("email")} loading={authLoading} error={authError} setError={setAuthError} />
           : bookingStep === "verify_phone"   ? <StepOtp key="otp-phone" type="phone" onVerify={handleVerifyPhone} onResend={() => handleResendOtp("phone")} loading={authLoading} error={authError} setError={setAuthError} />
           : bookingStep === "plan"           ? <StepPlanSelect plans={unit.payment_plans || []} selected={selectedPlan} onSelect={setSelectedPlan} fmtPrice={fmtPrice} unitPrice={unit.actual_price} onNext={() => setBookingStep("form")} onBack={() => setBookingStep("details")} existingBookingId={existingBookingId} feeBreakdown={feeBreakdown} sym={sym} />
           : bookingStep === "form"           ? <StepBookingForm user={user} form={bookingForm} setForm={setBookingForm} onSubmit={handleBooking} loading={authLoading} error={authError} selectedPlan={selectedPlan} plans={unit.payment_plans || []} onBack={() => hasPlans ? setBookingStep("plan") : setBookingStep("details")} unit={unit} existingBookingId={existingBookingId} feeBreakdown={feeBreakdown} sym={sym} />
           : null}
        </div>
      </div>

      <div ref={overlayRef} className="page-fade-overlay" />
    </div>
  );
};

/* ── Sub-components ──────────────────────────────────────────────────────── */
const BrokerInactiveScreen = ({ onClose }) => (
  <div style={{ padding: "24px 0", textAlign: "center" }}>
    <div style={{ fontSize: "48px", marginBottom: "14px" }}>🔒</div>
    <div style={{ color: "white", fontWeight: "800", fontSize: "17px", marginBottom: "10px" }}>Account Inactive</div>
    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: "1.7", marginBottom: "20px" }}>Your broker account is currently <strong style={{ color: "#ef4444" }}>inactive</strong>. You cannot place bookings until your account is activated.</div>
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#fca5a5", textAlign: "left" }}>
      <div style={{ fontWeight: "700", marginBottom: "4px" }}>What to do next:</div>
      <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: "1.8" }}><li>Contact your project administrator</li><li>Ask them to activate your broker account</li><li>You'll be able to book once your status is active</li></ul>
    </div>
    <button onClick={onClose} style={{ width: "100%", padding: "11px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Close</button>
  </div>
);

const UnitDetails = ({ unit, currency, fmtPrice, statusColor }) => {
  const hasDims = unit.room_dimensions?.length > 0, hasAmenities = unit.amenities?.length > 0;
  const hasAreaData = unit.internal_area_sqft || unit.internal_area_sqm || unit.external_area_sqft;
  return (
    <div className="unit-details-page">
      <div className="ud-hero"><div className="ud-hero-inner">
        <div className="ud-stats">
          {unit.bedrooms  != null && <StatPill icon="🛏"  label="Bedrooms"  value={unit.bedrooms}  />}
          {unit.bathrooms != null && <StatPill icon="🚿"  label="Bathrooms" value={unit.bathrooms} />}
          {unit.ensuites  != null && <StatPill icon="🛁"  label="Ensuites"  value={unit.ensuites}  />}
          {unit.balconies != null && <StatPill icon="🌅"  label="Balconies" value={unit.balconies} />}
          {unit.bedrooms == null && unit.rooms?.length > 0 && unit.rooms.map((r) => <StatPill key={r.id} icon="🚪" label={r.room_label} value="→" />)}
        </div>
        <div className="ud-hero-price">
          {unit.offer_price && <div style={{ color: "#c9a96e", fontSize: "28px", fontWeight: "800" }}>{fmtPrice(unit.offer_price)}</div>}
          <div style={{ color: unit.offer_price ? "rgba(255,255,255,0.4)" : "white", textDecoration: unit.offer_price ? "line-through" : "none", fontSize: unit.offer_price ? "14px" : "26px", fontWeight: "700" }}>{fmtPrice(unit.actual_price)}</div>
          <div style={{ color: statusColor, fontSize: "12px", fontWeight: "600", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>● {unit.status}</div>
        </div>
      </div></div>
      <div className="ud-body">
        {hasAreaData && <Section title="📐 Floor Areas"><div className="ud-area-grid">
          {unit.internal_area_sqft && <AreaCard label="Internal Area" sqft={unit.internal_area_sqft} sqm={unit.internal_area_sqm} accent="#c9a96e" />}
          {unit.external_area_sqft && <AreaCard label="External Area" sqft={unit.external_area_sqft} sqm={unit.external_area_sqm} accent="#64748b" />}
          {unit.internal_area_sqft && unit.external_area_sqft && <AreaCard label="Total Area" sqft={(parseFloat(unit.internal_area_sqft) + parseFloat(unit.external_area_sqft)).toFixed(2)} sqm={unit.internal_area_sqm && unit.external_area_sqm ? (parseFloat(unit.internal_area_sqm) + parseFloat(unit.external_area_sqm)).toFixed(2) : null} accent="#22c55e" />}
        </div></Section>}
        {hasDims && <Section title="📏 Room Dimensions"><div className="ud-dims-list">{unit.room_dimensions.map((dim, i) => <DimRow key={i} dim={dim} />)}</div></Section>}
        {hasAmenities && <Section title="✨ Amenities"><div className="ud-amenities-grid">{unit.amenities.map((a, i) => <div key={i} className="ud-amenity-chip"><span className="ud-amenity-icon">{amenityIcon(a)}</span><span>{a}</span></div>)}</div></Section>}
        <Section title="ℹ️ Unit Info"><div className="ud-info-grid">
          {[["Unit Number", unit.plot_number], ["Type", unit.plot_type], ["Total Size", unit.plot_size ? `${unit.plot_size} sqft` : "—"], ["Direction", unit.direction || "—"], ["Project", unit.project_name || "—"], ["Rooms", unit.rooms?.length || "—"]].map(([lbl, val]) => (
            <div key={lbl} className="ud-info-item"><div className="ud-info-label">{lbl}</div><div className="ud-info-value">{val}</div></div>
          ))}
        </div></Section>
        {unit.floor_plan_image && <Section title="🗺️ Floor Plan"><img src={unit.floor_plan_image} alt="Floor Plan" style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }} /></Section>}
        {!hasAreaData && !hasDims && !hasAmenities && <div className="ud-empty"><div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px" }}>Detailed specifications coming soon.</div></div>}
      </div>
    </div>
  );
};
const Section  = ({ title, children }) => <div className="ud-section"><div className="ud-section-title">{title}</div>{children}</div>;
const StatPill = ({ icon, label, value }) => <div className="ud-stat-pill"><span className="ud-stat-icon">{icon}</span><div><div className="ud-stat-value">{value}</div><div className="ud-stat-label">{label}</div></div></div>;
const AreaCard = ({ label, sqft, sqm, accent }) => (<div className="ud-area-card" style={{ borderColor: accent + "33" }}><div className="ud-area-label">{label}</div><div className="ud-area-sqft" style={{ color: accent }}>{Number(sqft).toLocaleString()} <span>sq ft</span></div>{sqm && <div className="ud-area-sqm">{Number(sqm).toLocaleString()} sq m</div>}{!sqm && sqft && <div className="ud-area-sqm">{(sqft / 10.764).toFixed(1)} sq m</div>}</div>);
const DimRow   = ({ dim }) => {
  const u = dim.unit || "m", w = parseFloat(dim.width), l = parseFloat(dim.length);
  const wFt = u === "m" ? toFt(w) : w.toFixed(1), lFt = u === "m" ? toFt(l) : l.toFixed(1);
  const wM  = u === "ft" ? (w / 3.28084).toFixed(1) : w.toFixed(1), lM = u === "ft" ? (l / 3.28084).toFixed(1) : l.toFixed(1);
  const sqm = dim.area_sqm ? parseFloat(dim.area_sqm) : w && l ? u === "m" ? w * l : (w * l) / 10.7639 : null;
  const sqft = dim.area_sqft ? parseFloat(dim.area_sqft) : sqm ? sqm * 10.7639 : null;
  return <div className="ud-dim-row"><div className="ud-dim-label">{dim.label}</div><div className="ud-dim-measurements"><span className="ud-dim-primary">{wM} × {lM} m</span><span className="ud-dim-secondary">{wFt}' × {lFt}'</span>{sqm != null && <span className="ud-dim-area">{sqm.toFixed(1)} m² <span className="ud-dim-area-sep">/</span> {sqft.toFixed(1)} ft²</span>}</div></div>;
};

const TYPE_COLORS = { down_payment: { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" }, installment: { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" }, on_completion: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" }, on_handover: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" }, rental_guarantee: { bg: "#fce4ec", color: "#880e4f", border: "#f48fb1" }, custom: { bg: "#f5f5f5", color: "#424242", border: "#e0e0e0" } };
const TYPE_ICONS = { down_payment: "💰", installment: "🔄", on_completion: "🏗️", on_handover: "🔑", rental_guarantee: "📈", custom: "⭐" };

// ── PaymentPlansTab ───────────────────────────────────────────────────────────
// FIX: replaced all Math.round() calls with fmtExact() for amounts
//      displayed to users, including the "Total" and per-milestone lines.
const PaymentPlansTab = ({ plans, fmtPrice, currency, unitPrice, feeBreakdown, sym = "₹" }) => {
  const [activePlan, setActivePlan] = useState(0);
  if (!plans?.length) return <div style={{ padding: "60px 20px", textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>💳</div><div style={{ fontSize: "16px", fontWeight: "600", color: "#e0e8f0" }}>No payment plans available</div></div>;

  const basePrice = parseFloat(String(unitPrice || "0").replace(/[^0-9.]/g, "")) || 0;

  // calcAmt: base-only estimate (no tax) — used as a rough label, not a payment amount
  // We still show "≈" prefix to signal it's an estimate
  const calcAmtLabel = (pct) =>
    basePrice > 0 ? fmtExact((basePrice * parseFloat(pct)) / 100, sym) : null;

  const plan     = plans[activePlan];
  const totalPct = plan.milestones.reduce((s, m) => s + (parseFloat(m.percentage) || 0), 0);

  return (
    <div className="unit-details-page">
      <div style={{ padding: "20px 20px 40px", maxWidth: "680px", margin: "0 auto" }}>
        {plans.length > 1 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {plans.map((p, i) => (
              <button key={p.id} onClick={() => setActivePlan(i)} style={{ padding: "8px 18px", borderRadius: "24px", cursor: "pointer", border: i === activePlan ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.1)", background: i === activePlan ? "rgba(201,169,110,0.15)" : "transparent", color: i === activePlan ? "#c9a96e" : "#6b7f95", fontWeight: i === activePlan ? "700" : "500", fontSize: "13px" }}>{p.name}</button>
            ))}
          </div>
        )}

        <div style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "16px", padding: "20px 22px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#e8d5b0" }}>{plan.name}</div>
              {plan.description && <div style={{ fontSize: "13px", color: "#6b7f95", marginTop: "3px" }}>{plan.description}</div>}
            </div>
            {totalPct === 100 && <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: "20px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: "11px", fontWeight: "700" }}>✓ 100%</span>}
          </div>
        </div>

        {/* Grand total banner — exact */}
        {feeBreakdown?.tax_enabled && feeBreakdown?.total_amount > 0 && (
          <div style={{ marginBottom: "12px", padding: "10px 14px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#6b7f95" }}>
              Unit {fmtExact(basePrice, sym)} + {feeBreakdown.tax_label || "Tax"} ({feeBreakdown.tax_rate}%) + fees
            </span>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#f59e0b" }}>
              Grand Total: {fmtExact(feeBreakdown.total_amount, sym)}
            </span>
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" }}>
          {plan.milestones.map((m, i) => {
            const c    = TYPE_COLORS[m.type] || TYPE_COLORS.custom;
            const icon = TYPE_ICONS[m.type]  || "⭐";
            const isLast = i === plan.milestones.length - 1;

            // Base-only estimate label (≈ prefix already implies rounding)
            const displayAmtLabel = m.calculated_amount
              ? fmtExact(m.calculated_amount, sym)
              : m.percentage ? calcAmtLabel(m.percentage)
              : m.fixed_amount ? fmtExact(m.fixed_amount, sym)
              : null;

            const msTaxData = feeBreakdown && m.percentage
              ? computeMilestoneAmounts(m.percentage, feeBreakdown)
              : null;

            return (
              <div key={m.id || i} style={{ display: "flex", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "58px", flexShrink: 0, paddingTop: "18px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: c.color }}>{i + 1}</div>
                  {!isLast && <div style={{ width: "2px", flex: 1, background: "rgba(255,255,255,0.06)", minHeight: "24px", marginTop: "4px" }} />}
                </div>
                <div style={{ flex: 1, padding: "16px 18px 16px 0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                        <span style={{ fontSize: "16px" }}>{icon}</span>
                        <span style={{ padding: "2px 9px", borderRadius: "8px", fontSize: "10px", fontWeight: "700", background: c.bg, color: c.color, textTransform: "uppercase" }}>{m.type_label || m.type?.replace(/_/g, " ")}</span>
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#d8e6f0" }}>{m.label}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {m.percentage > 0 && <div style={{ fontSize: "24px", fontWeight: "900", color: "#c9a96e" }}>{m.percentage}%</div>}
                      {displayAmtLabel && (
                        <div style={{ fontSize: "12px", color: "#5a7a9a", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                          ≈ {displayAmtLabel}
                          {msTaxData && (msTaxData.tax > 0 || msTaxData.fees > 0) && (
                            <TaxBreakdownBadge milestonePercent={m.percentage} feeBreakdown={feeBreakdown} sym={sym} />
                          )}
                        </div>
                      )}
                      {/* Total with tax — exact */}
                      {msTaxData && msTaxData.total > 0 && (
                        <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "3px", fontWeight: "700" }}>
                          Total: {fmtExact(msTaxData.total, sym)}
                        </div>
                      )}
                    </div>
                  </div>
                  {(m.due_date || m.due_after_days) && <div style={{ marginTop: "6px", fontSize: "12px", color: "#5a7a9a" }}>📅 {m.due_date ? `Due by ${m.due_date}` : `Due ${m.due_after_days} days after booking`}</div>}
                  {m.note && <div style={{ marginTop: "7px", fontSize: "12px", color: "#7a90a4", fontStyle: "italic", padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", borderLeft: "2px solid rgba(201,169,110,0.3)" }}>{m.note}</div>}
                </div>
              </div>
            );
          })}

          <div style={{ padding: "14px 20px 14px 58px", background: "rgba(0,0,0,0.15)", borderTop: "1px solid rgba(201,169,110,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "13px", color: "#5a7a9a", fontWeight: "600" }}>Total payment mapped</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "18px", fontWeight: "800", color: totalPct === 100 ? "#22c55e" : totalPct > 100 ? "#ef4444" : "#c9a96e" }}>
                {totalPct.toFixed(0)}%{totalPct === 100 ? " ✓" : ""}
              </span>
              {/* Grand total footer — exact */}
              {feeBreakdown?.total_amount > 0 && (
                <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "2px" }}>
                  = {fmtExact(feeBreakdown.total_amount, sym)} (incl. all taxes &amp; fees)
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#3a4f62" }}>
          Amounts shown are estimates. Final figures confirmed at booking.
        </div>
      </div>
    </div>
  );
};

const GallerySlider = ({ gallery, plotId, navigate }) => {
  const [idx, setIdx] = useState(0);
  return (
    <div className="gallery-slider">
      <div className="gallery-main">
        <img src={gallery[idx]} alt={`Gallery ${idx + 1}`} className="gallery-img" />
        {gallery.length > 1 && <><button className="gallery-nav-btn prev" onClick={() => setIdx((i) => (i - 1 + gallery.length) % gallery.length)}>‹</button><button className="gallery-nav-btn next" onClick={() => setIdx((i) => (i + 1) % gallery.length)}>›</button></>}
        <div className="gallery-counter">{idx + 1} / {gallery.length}</div>
        <button className="gallery-360-btn" onClick={() => navigate(`/unit/${plotId}/gallery/${idx}`)}>🌐 View 360°</button>
      </div>
      {gallery.length > 1 && <div className="gallery-thumbs">{gallery.map((img, i) => <img key={i} src={img} alt="" className={`gallery-thumb ${i === idx ? "active" : "inactive"}`} onClick={() => setIdx(i)} />)}</div>}
    </div>
  );
};

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" }, { code: "+971", flag: "🇦🇪", name: "UAE" }, { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" }, { code: "+965", flag: "🇰🇼", name: "Kuwait" }, { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+968", flag: "🇴🇲", name: "Oman" }, { code: "+1", flag: "🇺🇸", name: "USA / Canada" }, { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "Australia" }, { code: "+65", flag: "🇸🇬", name: "Singapore" }, { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+86", flag: "🇨🇳", name: "China" }, { code: "+81", flag: "🇯🇵", name: "Japan" }, { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" }, { code: "+39", flag: "🇮🇹", name: "Italy" }, { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+7",  flag: "🇷🇺", name: "Russia" }, { code: "+55", flag: "🇧🇷", name: "Brazil" }, { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" }, { code: "+94", flag: "🇱🇰", name: "Sri Lanka" }, { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" }, { code: "+234", flag: "🇳🇬", name: "Nigeria" }, { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" }, { code: "+62", flag: "🇮🇩", name: "Indonesia" }, { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" }, { code: "+84", flag: "🇻🇳", name: "Vietnam" }, { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" }, { code: "+98", flag: "🇮🇷", name: "Iran" }, { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" }, { code: "+962", flag: "🇯🇴", name: "Jordan" },
];

const CountryCodePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false), [search, setSearch] = useState("");
  const selected = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];
  const filtered = search.trim() ? COUNTRY_CODES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)) : COUNTRY_CODES;
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => { setOpen((o) => !o); setSearch(""); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap", minWidth: "82px" }}>
        <span style={{ fontSize: "16px" }}>{selected.flag}</span><span>{selected.code}</span><span style={{ fontSize: "10px", opacity: 0.5 }}>▼</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999, background: "#1a2535", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", overflow: "hidden", minWidth: "220px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <input autoFocus type="text" placeholder="Search country..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "7px 10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {filtered.map((c) => (
              <div key={c.code + c.name} onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
                style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", background: c.code === value ? "rgba(201,169,110,0.15)" : "transparent", color: c.code === value ? "#c9a96e" : "rgba(255,255,255,0.8)" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseOut={(e)  => (e.currentTarget.style.background = c.code === value ? "rgba(201,169,110,0.15)" : "transparent")}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{c.flag}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                <span style={{ opacity: 0.5, fontSize: "12px", flexShrink: 0 }}>{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StepDetails = ({ user, onBook, onLogout }) => (
  <div>
    {user
      ? <div className="logged-in-card"><div><div className="logged-in-label">✓ Logged in as</div><div className="logged-in-name">{user.name}</div><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{user.email}</div></div><button className="logout-btn" onClick={onLogout}>Logout</button></div>
      : <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>To book this unit, please log in or create an account. Both email and phone will be verified.</p>}
    <button className="book-btn" onClick={onBook}>{user ? "Continue to Booking →" : "Login / Register to Book →"}</button>
  </div>
);

const StepLogin = ({ form, setForm, onLogin, onSwitch, loading, error }) => (
  <div>
    <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "16px" }}>Login to your account</div>
    {error && <ErrorBox msg={error} />}
    <input className="sidebar-input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
    <input className="sidebar-input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && onLogin()} style={{ marginBottom: "16px" }} />
    <button className="book-btn" onClick={onLogin} disabled={loading || !form.email || !form.password}>{loading ? "Logging in..." : "Login →"}</button>
    {onSwitch && <p style={{ textAlign: "center", marginTop: "14px", color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Don't have an account? <button className="auth-link" onClick={onSwitch}>Register</button></p>}
  </div>
);

const StepRegister = ({ form, setForm, onRegister, onSwitch, loading, error }) => {
  const [showPass, setShowPass] = useState(false);
  const strength = !form.password ? 0 : [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;
  const strengthColor = ["#ef4444","#f59e0b","#f59e0b","#22c55e","#22c55e"][strength];
  return (
    <div>
      <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Create an account</div>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "14px" }}>We'll verify your email and phone number</div>
      {error && <ErrorBox msg={error} />}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {[{ v: "user", label: "👤 Buyer" }, { v: "broker", label: "🤝 Broker" }].map(({ v, label }) => (
          <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, role: v }))} style={{ flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", border: form.role === v ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.1)", background: form.role === v ? "rgba(201,169,110,0.15)" : "transparent", color: form.role === v ? "#c9a96e" : "rgba(255,255,255,0.5)", fontWeight: form.role === v ? "700" : "400" }}>{label}</button>
        ))}
      </div>
      <input className="sidebar-input" type="text"  placeholder="Full Name *"      value={form.name}           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      {form.role === "broker" && <input className="sidebar-input" type="text" placeholder="Company / Agency Name" value={form.broker_company} onChange={(e) => setForm((f) => ({ ...f, broker_company: e.target.value }))} />}
      <input className="sidebar-input" type="email" placeholder="Email Address *"  value={form.email}          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <CountryCodePicker value={form.country_code} onChange={(v) => setForm((f) => ({ ...f, country_code: v }))} />
        <input style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px" }} type="tel" placeholder="Phone number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} />
      </div>
      <div style={{ position: "relative", marginBottom: "4px" }}>
        <input style={{ width: "100%", padding: "10px 40px 10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px", boxSizing: "border-box" }} type={showPass ? "text" : "password"} placeholder="Password (min 8 chars) *" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <button type="button" onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "14px" }}>{showPass ? "🙈" : "👁"}</button>
      </div>
      {form.password && <div style={{ marginBottom: "12px" }}><div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>{[1,2,3,4].map((i) => <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }} />)}</div><div style={{ fontSize: "11px", color: strengthColor }}>{["","Weak","Fair","Good","Strong"][strength]}</div></div>}
      <button className="book-btn" style={{ marginTop: "6px" }} onClick={onRegister} disabled={loading || !form.name || !form.email || !form.phone || !form.password || form.password.length < 8}>{loading ? "Creating account..." : "Register & Verify →"}</button>
      <p style={{ textAlign: "center", marginTop: "14px", color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Already have an account? <button className="auth-link" onClick={onSwitch}>Login</button></p>
    </div>
  );
};

const StepOtp = ({ type, onVerify, onResend, loading, error, setError }) => {
  const [otp, setOtp] = useState(["","","","","",""]);
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const isEmail = type === "email";
  const handleKey = (i, e) => { if (e.key === "Backspace") { if (otp[i]) { const n=[...otp]; n[i]=""; setOtp(n); } else if (i > 0) refs[i-1].current?.focus(); } };
  const handleChange = (i, val) => { const digit = val.replace(/\D/g,"").slice(-1), n = [...otp]; n[i] = digit; setOtp(n); if (digit && i < 5) refs[i+1].current?.focus(); if (digit && i === 5) { const full=[...n].join(""); if (full.length===6) { setError(""); onVerify(full); } } };
  const handlePaste = (e) => { const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6); if (p.length===6) { setOtp(p.split("")); refs[5].current?.focus(); setError(""); onVerify(p); } };
  const fullOtp = otp.join("");
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{isEmail ? "📧" : "📱"}</div>
        <div style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>Verify your {isEmail ? "email" : "phone"}</div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "6px" }}>Enter the 6-digit code sent to your {isEmail ? "email" : "phone"}.</div>
      </div>
      {error && <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "12px", background: error.startsWith("✓") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${error.startsWith("✓") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, color: error.startsWith("✓") ? "#22c55e" : "#fca5a5" }}>{error}</div>}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }} onPaste={handlePaste}>
        {otp.map((digit, i) => <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)} style={{ width: "44px", height: "52px", textAlign: "center", fontSize: "22px", fontWeight: "700", background: digit ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.07)", border: `2px solid ${digit ? "#c9a96e" : "rgba(255,255,255,0.12)"}`, borderRadius: "10px", color: "white", outline: "none" }} />)}
      </div>
      <button className="book-btn" onClick={() => { if (fullOtp.length===6) onVerify(fullOtp); }} disabled={loading || fullOtp.length < 6}>{loading ? "Verifying..." : "Verify Code →"}</button>
      <div style={{ textAlign: "center", marginTop: "16px" }}><span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Didn't receive the code? </span><button className="auth-link" onClick={() => { setOtp(["","","","","",""]); onResend(); }} disabled={loading}>Resend</button></div>
    </div>
  );
};

// ── StepPlanSelect ────────────────────────────────────────────────────────────
// FIX: all amount displays inside the expanded milestone view use fmtExact()
const StepPlanSelect = ({ plans, selected, onSelect, fmtPrice, unitPrice, onNext, onBack, existingBookingId, feeBreakdown, sym = "₹" }) => {
  const [expanded, setExpanded] = useState(null);
  const price = parseFloat(String(unitPrice || "0").replace(/,/g, "")) || 0;

  // Base-only label — shows "≈" to indicate it's pre-tax
  const calcAmtLabel = (pct) =>
    price > 0 ? fmtExact((price * parseFloat(pct)) / 100, sym) : null;

  return (
    <div>
      <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Choose a Payment Plan</div>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "14px" }}>Select how you'd like to pay for this unit</div>

      {feeBreakdown?.tax_enabled && feeBreakdown?.total_amount > 0 && (
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", fontSize: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#8899aa" }}>Unit Price</span>
            <span style={{ color: "#d0dce8" }}>{fmtExact(feeBreakdown.unit_price || price, sym)}</span>
          </div>
          {feeBreakdown.tax_amount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "#f59e0b" }}>{feeBreakdown.tax_label || "Tax"} ({feeBreakdown.tax_rate}%)</span>
              <span style={{ color: "#f59e0b" }}>{fmtExact(feeBreakdown.tax_amount, sym)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "5px", marginTop: "2px" }}>
            <span style={{ color: "#c9a96e", fontWeight: "700" }}>Grand Total</span>
            <span style={{ color: "#c9a96e", fontWeight: "800" }}>{fmtExact(feeBreakdown.total_amount, sym)}</span>
          </div>
        </div>
      )}

      {/* Full payment option */}
      <div onClick={() => onSelect(null)} style={{ padding: "12px 14px", borderRadius: "10px", marginBottom: "8px", cursor: "pointer", border: selected === null ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.08)", background: selected === null ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#e0e8f0", fontWeight: "600", fontSize: "13px" }}>Full Payment</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "2px" }}>
              Pay {feeBreakdown?.total_amount ? `${fmtExact(feeBreakdown.total_amount, sym)} (incl. taxes)` : "the full amount"} upfront
            </div>
          </div>
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: selected === null ? "#c9a96e" : "rgba(255,255,255,0.2)", background: selected === null ? "#c9a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {selected === null && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}
          </div>
        </div>
      </div>

      {plans.map((plan) => {
        const isSelected = selected === plan.id, isExpanded = expanded === plan.id;
        const totalPct   = plan.milestones.reduce((s, m) => s + (parseFloat(m.percentage) || 0), 0);
        return (
          <div key={plan.id} style={{ marginBottom: "8px" }}>
            <div onClick={() => { onSelect(plan.id); setExpanded(isExpanded ? null : plan.id); }} style={{ padding: "12px 14px", borderRadius: isExpanded ? "10px 10px 0 0" : "10px", cursor: "pointer", border: isSelected ? "2px solid #c9a96e" : "2px solid rgba(255,255,255,0.08)", background: isSelected ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#e0e8f0", fontWeight: "700", fontSize: "13px" }}>{plan.name}</div>
                  {plan.description && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>{plan.description}</div>}
                  {!isExpanded && (
                    <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {plan.milestones.slice(0,2).map((m,i) => <span key={i} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "8px", background: "rgba(201,169,110,0.15)", color: "#c9a96e", fontWeight: "600" }}>{m.label}{m.percentage ? ` · ${m.percentage}%` : ""}</span>)}
                      {plan.milestones.length > 2 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+{plan.milestones.length - 2} more</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: isSelected ? "#c9a96e" : "rgba(255,255,255,0.2)", background: isSelected ? "#c9a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{isSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}</div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : plan.id); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "11px", cursor: "pointer", padding: 0 }}>{isExpanded ? "▲ Less" : "▼ Details"}</button>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "0 0 10px 10px", border: "1px solid rgba(201,169,110,0.15)", borderTop: "none", paddingTop: "4px" }}>
                {plan.milestones.map((m, i) => {
                  const c    = TYPE_COLORS[m.type] || TYPE_COLORS.custom;
                  const icon = TYPE_ICONS[m.type]  || "⭐";
                  const amt  = m.calculated_amount ? fmtExact(m.calculated_amount, sym) : m.percentage ? calcAmtLabel(m.percentage) : null;
                  return (
                    <div key={i} style={{ padding: "10px 14px", borderBottom: i < plan.milestones.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                          <span style={{ fontSize: "16px" }}>{icon}</span>
                          <div>
                            <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "8px", background: c.bg, color: c.color, fontWeight: "700" }}>{m.type_label}</span>
                            <span style={{ color: "#d0dce8", fontSize: "12px", fontWeight: "600", marginLeft: "6px" }}>{m.label}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {m.percentage > 0 && <div style={{ color: "#c9a96e", fontWeight: "800", fontSize: "15px" }}>{m.percentage}%</div>}
                          {amt && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>≈ {amt}</div>}
                        </div>
                      </div>
                      {/* Per-milestone tax breakdown — exact */}
                      {feeBreakdown && m.percentage && <MilestoneTaxRow milestone={m} feeBreakdown={feeBreakdown} />}
                    </div>
                  );
                })}
                <div style={{ padding: "8px 14px", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.05)", flexWrap: "wrap", gap: "4px" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Total</span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ color: totalPct === 100 ? "#22c55e" : "#c9a96e", fontWeight: "700", fontSize: "13px" }}>{totalPct.toFixed(0)}%{totalPct === 100 ? " ✓" : ""}</span>
                    {feeBreakdown?.total_amount > 0 && (
                      <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "2px" }}>
                        = {fmtExact(feeBreakdown.total_amount, sym)} incl. taxes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button className="book-btn" onClick={onNext} style={{ marginTop: "12px" }}>{existingBookingId ? "Update Plan & Pay →" : "Continue →"}</button>
      <button type="button" onClick={onBack} style={{ display: "block", width: "100%", marginTop: "8px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.4)", padding: "10px", cursor: "pointer", fontSize: "13px" }}>← Back</button>
    </div>
  );
};

// ── StepBookingForm ───────────────────────────────────────────────────────────
const StepBookingForm = ({ user, form, setForm, onSubmit, loading, error, selectedPlan, plans, onBack, unit, existingBookingId, feeBreakdown, sym = "₹" }) => {
  const plan         = plans.find((p) => p.id === selectedPlan);
  const isBroker     = user?.role === "broker";
  const price        = parseFloat((unit?.offer_price || unit?.actual_price || "").toString().replace(/[^0-9.]/g, "")) || 0;
  const commissionRate = parseFloat(user?.commission_rate || 2);
  const commissionAmt  = price > 0 ? ((price * commissionRate) / 100).toFixed(2) : null;
  const canSubmit    = isBroker ? form.name && form.phone && form.client_name && form.client_phone : form.name && form.phone;

  return (
    <div>
      <div style={{ color: "white", fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>{existingBookingId ? "Update Payment Plan" : "Confirm Booking"}</div>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "12px" }}>
        {existingBookingId
          ? <span>Updating plan for booking <span style={{ color: "#c9a96e" }}>#{existingBookingId}</span></span>
          : isBroker
            ? <>Booking as broker <span style={{ color: "#c9a96e" }}>{user?.name}</span></>
            : <>Booking as <span style={{ color: "#c9a96e" }}>{user?.name}</span></>}
      </div>

      {plan && (
        <div style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px" }}>
          <div style={{ color: "#c9a96e", fontWeight: "700", marginBottom: "2px" }}>💳 {plan.name}</div>
          <div style={{ color: "rgba(255,255,255,0.45)" }}>Selected payment plan</div>
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "#8fa0b4", fontSize: "11px", padding: "0", marginTop: "4px", cursor: "pointer", textDecoration: "underline" }}>Change plan</button>
        </div>
      )}

      {/* Tax & fee summary — exact amounts */}
      <BookingSummaryTaxCard feeBreakdown={feeBreakdown} selectedPlan={selectedPlan} plans={plans} unit={unit} sym={sym} />

      {error && <ErrorBox msg={error} />}

      {isBroker ? (
        <>
          {commissionAmt && (
            <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px" }}>Your Commission</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Commission — exact */}
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#c9a96e" }}>{fmtExact(commissionAmt, sym)}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{commissionRate}% of price</div>
              </div>
            </div>
          )}
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", textTransform: "uppercase" }}>Your Contact Info</div>
          <input className="sidebar-input" type="text" placeholder="Your Name *"  value={form.name}  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="sidebar-input" type="tel"  placeholder="Your Phone *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", marginTop: "8px", textTransform: "uppercase" }}>Client Details</div>
          <input className="sidebar-input" type="text" placeholder="Client Full Name *" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} />
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <CountryCodePicker value={form.client_country_code} onChange={(v) => setForm((f) => ({ ...f, client_country_code: v }))} />
            <input style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", fontSize: "13px" }} type="tel" placeholder="Client Phone *" value={form.client_phone} onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value.replace(/\D/g, "") }))} />
          </div>
          <input className="sidebar-input" type="email" placeholder="Client Email (optional)" value={form.client_email} onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))} />
          <textarea className="sidebar-input" placeholder="Notes (optional)" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "none", marginBottom: "16px" }} />
        </>
      ) : (
        <>
          <input className="sidebar-input" type="text" placeholder="Your Name *"   value={form.name}  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="sidebar-input" type="tel"  placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <textarea className="sidebar-input" placeholder="Message / Notes (optional)" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "none", marginBottom: "16px" }} />
        </>
      )}

      <button className="book-btn" onClick={onSubmit} disabled={loading || !canSubmit}>
        {loading ? "Submitting..." : existingBookingId ? "✓ Update Plan & Proceed to Payment" : isBroker ? "✓ Submit Booking for Client" : "✓ Confirm Booking"}
      </button>
    </div>
  );
};

const BookingDone = ({ unit, onClose }) => (
  <div className="booking-done">
    <div className="booking-done-emoji">🎉</div>
    <div className="booking-done-title">Booking Received!</div>
    <div className="booking-done-text">Your enquiry for Unit {unit.plot_number} has been submitted.<br />Our team will contact you shortly.</div>
    <button className="book-btn" onClick={onClose}>Close</button>
  </div>
);

const ErrorBox = ({ msg }) => <div className="error-box">⚠️ {msg}</div>;

export default UnitPage;
