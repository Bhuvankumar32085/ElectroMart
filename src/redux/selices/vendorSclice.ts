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
    updateProduct: (state, action) => {
      const updated = action.payload;

      const index = state.allProducts.findIndex((p) => p._id === updated._id);

      if (index !== -1) {
        state.allProducts[index] = updated;
      }
    },
    updateProductActive: (state, action) => {
      const updated = action.payload;

      const index = state.allProducts.findIndex((p) => p._id === updated._id);

      if (index !== -1) {
        state.allProducts[index].isActive = updated.isActive;
      }
    },
    // vendorSlice.ts
  },
});

export const {
  setAllVendorData,
  setAllProducts,
  addProduct,
  updateProductActive,
  updateProduct,
} = vendorSlice.actions;
export default vendorSlice.reducer;
