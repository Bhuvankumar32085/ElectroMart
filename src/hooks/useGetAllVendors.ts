"use client";

import { setAllVendorData } from "@/redux/selices/vendorSclice";
import { AppDispatch } from "./../redux/store";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useGetAllVendors = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/vendor/get-vendors");
        if (res?.data?.success) {
          dispatch(setAllVendorData(res?.data?.vendors));
        }
      } catch (error) {
        console.error(error);
        dispatch(setAllVendorData([]));
      }
    };

    fetchData();
  }, [dispatch]);
};
