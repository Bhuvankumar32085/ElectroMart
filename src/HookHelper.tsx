"use client";

import { useEffect } from "react";
import { useGetAllProducts } from "./hooks/useGetAllProducts";
import { useGetAllVendors } from "./hooks/useGetAllVendors";
import { useGetLoggedUser } from "./hooks/useGetLoggedUser";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
  updateProduct,
  updateProductActive,
} from "./redux/selices/vendorSclice";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ["websocket"],
  reconnection: true, //frontend refresh pr bhi socketID fir banegi barna frontend refresh pr socketId nahi milti
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

const HookHelper = () => {
  const { loggedUser } = useAppSelector((state) => state.user);
  useEffect(() => {
    if (!loggedUser || !loggedUser?._id) return;

    const register = () => {
      socket.emit("user_id_with_socket", {
        userID: String(loggedUser._id),
        // socketId: socket.id, // koy jaraurt nahi h es ko dene ki backend to socketid deta bo same hoti frontend ki sockedId ke
      });
    };

    //  IMPORTANT PART
    if (socket.connected) {
      register();
      // Case A: Socket pehle connect hogaya , user baad me aaya redux(loggedUser) se to
      // t=0   socket.connected = true
      // t=1   loggedUser = undefined
      // t=2   loggedUser = { _id: "123" } // kuch der baad aara to use effect chalega
      // t=2   socket.connected === true → register()

      // Case B: User pehle, socket baad me
      // t=0   loggedUser = { _id: "123" }
      // t=1   socket.connected = false
      // t=2   socket connects → "connect" event → register() 🔥
    }

    // first connect
    socket.on("connect", register);

    //  server restart pr bhi aotomatic connection bane ga haya server ki baat karraha hu socket server ki frontend ki nahi
    socket.io.on("reconnect", register);

    return () => {
      socket.off("connect", register);
      socket.io.off("reconnect", register);
    };
  }, [loggedUser]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    socket.on("product-updated", ({ product }) => {
      if (!product?._id) return;

      dispatch(updateProduct(product)); //  ONE LINE
    });

    return () => {
      socket.off("product-updated");
    };
  }, [dispatch]);

  useEffect(() => {
    socket.on("product-active-updated", ({ product }) => {
      if (!product?._id) return;

      dispatch(updateProductActive(product));
    });

    return () => {
      socket.off("product-active-updated");
    };
  }, [dispatch]);

  useGetLoggedUser();
  useGetAllVendors();
  useGetAllProducts();

  return null;
};
export default HookHelper;
