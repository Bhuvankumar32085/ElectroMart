"use client";

import { useGetAllProducts } from "./hooks/useGetAllProducts";
import { useGetAllVendors } from "./hooks/useGetAllVendors";
import { useGetLoggedUser } from "./hooks/useGetLoggedUser";

const HookHelper = () => {
  useGetLoggedUser();
  useGetAllVendors();
  useGetAllProducts();
  return null
};
export default HookHelper;
