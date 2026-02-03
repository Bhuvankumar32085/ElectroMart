import { IUser } from "@/model/user.model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  loggedUser: IUser | null;
}

const initialState: AuthState = {
  loggedUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoggedUser(state, action: PayloadAction<IUser | null>) {
      state.loggedUser = action.payload;
    },
  },
});

export const { setLoggedUser } = userSlice.actions;
export default userSlice.reducer;
