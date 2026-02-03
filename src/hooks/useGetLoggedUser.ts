"use client";

import { useEffect } from "react";
import axios from "axios";
import { setLoggedUser } from "@/redux/selices/userSclice";
import { useAppDispatch } from "@/redux/hooks";

export const useGetLoggedUser = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user/get-curr-user");
        if (res.data?.success) {
          dispatch(setLoggedUser(res.data.user));
        }
      } catch (error) {
        console.error(error);
        dispatch(setLoggedUser(null));
      }
    };

    fetchUser();
  }, [dispatch]);
};
