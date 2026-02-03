"use client";

import { setAllProducts } from "@/redux/selices/vendorSclice";
import { AppDispatch } from "../redux/store";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useGetAllProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/vendor/get-products");
        if (res?.data?.success) {
          dispatch(setAllProducts(res?.data?.products));
        }
      } catch (error) {
        console.error(error);
        dispatch(setAllProducts([]));
      }
    };

    fetchData();
  }, [dispatch]);
};
