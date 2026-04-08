// import { useState, useEffect, useCallback } from "react";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// export function useWishlist(token) {
//   const [wishlist,  setWishlist]  = useState([]);
//   const [wishedIds, setWishedIds] = useState(new Set());
//   const [loading,   setLoading]   = useState(false);

//   const fetchWishlist = useCallback(async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const res  = await fetch(`${API_BASE}/wishlist`, {
//         headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//       });
//       const data = await res.json();
//       if (data.wishlists) {
//         setWishlist(data.wishlists);
//         setWishedIds(new Set(data.plot_ids.map(Number)));
//       }
//     } catch (e) {
//       console.error("Wishlist fetch error", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchWishlist();
//   }, [fetchWishlist]);

//   // Optimistic toggle: flip state immediately, then sync with server
//   // const toggle = useCallback(async (plotId) => {
//   //   if (!token) return;
//   //   const id = Number(plotId);

//   //   // Optimistic update
//   //   setWishedIds((prev) => {
//   //     const next = new Set(prev);
//   //     next.has(id) ? next.delete(id) : next.add(id);
//   //     return next;
//   //   });

//   //   try {
//   //     const res  = await fetch(`${API_BASE}/wishlist/toggle`, {
//   //       method:  "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization:  `Bearer ${token}`,
//   //         Accept:         "application/json",
//   //       },
//   //       body: JSON.stringify({ plot_id: id }),
//   //     });
//   //     const data = await res.json();

//   //     // Sync authoritative state from server
//   //     setWishedIds((prev) => {
//   //       const next = new Set(prev);
//   //       data.wishlisted ? next.add(id) : next.delete(id);
//   //       return next;
//   //     });

//   //     // Refresh full list so WishlistTab is up to date
//   //     fetchWishlist();
//   //   } catch (e) {
//   //     // Revert optimistic update on error
//   //     setWishedIds((prev) => {
//   //       const next = new Set(prev);
//   //       next.has(id) ? next.delete(id) : next.add(id);
//   //       return next;
//   //     });
//   //     console.error("Wishlist toggle error", e);
//   //   }
//   // }, [token, fetchWishlist]);

//   const toggle = useCallback(async (plotId, forceAdd = false) => {
//   const isCurrentlyWished = wishedIds.has(plotId);
//   const shouldAdd = forceAdd ? true : !isCurrentlyWished;

//   // optimistic UI update
//   setWishedIds(prev => {
//     const next = new Set(prev);
//     shouldAdd ? next.add(plotId) : next.delete(plotId);
//     return next;
//   });

//   try {
//     if (shouldAdd) {
//       await fetch(`${API_BASE}/wishlist`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify({ plot_id: plotId }),
//       });
//     } else {
//       await fetch(`${API_BASE}/wishlist/${plotId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//     }
//   } catch (e) {
//     // revert optimistic update on error
//     setWishedIds(prev => {
//       const next = new Set(prev);
//       shouldAdd ? next.delete(plotId) : next.add(plotId);
//       return next;
//     });
//   }
// }, [wishedIds, token]);

//   const remove = useCallback(async (wishlistRowId, plotId) => {
//     if (!token) return;
//     try {
//       await fetch(`${API_BASE}/wishlist/${wishlistRowId}`, {
//         method:  "DELETE",
//         headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//       });
//       setWishedIds((prev) => { const n = new Set(prev); n.delete(Number(plotId)); return n; });
//       setWishlist((prev) => prev.filter((w) => w.id !== wishlistRowId));
//     } catch (e) {
//       console.error("Wishlist remove error", e);
//     }
//   }, [token]);

//   return { wishlist, wishedIds, loading, toggle, remove, refresh: fetchWishlist };
// }

import { useState, useEffect, useCallback } from "react";

import { apiUrl, imgUrl } from "../apiUrl";

const API_BASE = `${apiUrl}/api`;

export function useWishlist(token) {
  const [wishlist,  setWishlist]  = useState([]);
  const [wishedIds, setWishedIds] = useState(new Set());
  const [loading,   setLoading]   = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (data.wishlists) {
        setWishlist(data.wishlists);
        setWishedIds(new Set(data.plot_ids.map(Number)));
      }
    } catch (e) {
      console.error("Wishlist fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ── Toggle: always hits /wishlist/toggle, backend decides add vs remove ──
  // forceAdd = true skips the stale wishedIds check (used after login when
  // wishedIds hasn't re-fetched yet with the new token)
  const toggle = useCallback(async (plotId, forceAdd = false) => {
    if (!token) return;

    const id = Number(plotId);
    const isCurrentlyWished = wishedIds.has(id);
    const shouldAdd = forceAdd ? true : !isCurrentlyWished;

    // Optimistic update — flip immediately so UI feels instant
    setWishedIds(prev => {
      const next = new Set(prev);
      shouldAdd ? next.add(id) : next.delete(id);
      return next;
    });

    try {
      const res = await fetch(`${API_BASE}/wishlist/toggle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ plot_id: id }),
      });

      const data = await res.json();

      // Sync to authoritative server state
      setWishedIds(prev => {
        const next = new Set(prev);
        data.wishlisted ? next.add(id) : next.delete(id);
        return next;
      });

      // Refresh full wishlist so WishlistTab shows correct items
      fetchWishlist();
    } catch (e) {
      // Revert optimistic update on network/server error
      setWishedIds(prev => {
        const next = new Set(prev);
        shouldAdd ? next.delete(id) : next.add(id);
        return next;
      });
      console.error("Wishlist toggle error", e);
    }
  }, [wishedIds, token, fetchWishlist]);

  // ── Remove by wishlist row ID (used from WishlistTab) ────────────────────
  const remove = useCallback(async (wishlistRowId, plotId) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/wishlist/${wishlistRowId}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      setWishedIds(prev => { const n = new Set(prev); n.delete(Number(plotId)); return n; });
      setWishlist(prev => prev.filter(w => w.id !== wishlistRowId));
    } catch (e) {
      console.error("Wishlist remove error", e);
    }
  }, [token]);

  return { wishlist, wishedIds, loading, toggle, remove, refresh: fetchWishlist };
}