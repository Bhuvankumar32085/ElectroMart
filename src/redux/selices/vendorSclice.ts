import { IProduct } from "@/model/product.model";
import { IUser } from "@/model/user.model";
import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  allVendorData: IUser[];
  allProducts: IProduct[];
}

const initialState: AuthState = {
  allVendorData: [],
  allProducts: [],
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setAllVendorData(state, action) {
      state.allVendorData = action.payload;
    },
    setAllProducts(state, action) {
      state.allProducts = action.payload;
    },
    addProduct(state, action) {
      state.allProducts.push(action.payload); 
    },
  },
});

export const { setAllVendorData, setAllProducts, addProduct } =
  vendorSlice.actions;
export default vendorSlice.reducer;
