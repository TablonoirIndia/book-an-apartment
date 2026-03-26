import { createSlice } from "@reduxjs/toolkit";

const stored = (() => {
  try { return JSON.parse(localStorage.getItem("unit_user") || "null"); }
  catch { return null; }
})();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: stored,   // { id, name, email, phone, country_code, role, commission_rate, token }
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem("unit_user", JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.user = null;
      localStorage.removeItem("unit_user");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export default authSlice.reducer;
