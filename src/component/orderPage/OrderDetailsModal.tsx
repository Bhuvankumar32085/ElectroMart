import { IOrder } from "@/model/order.model";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Loader2,
  LucideIcon,
  ShoppingBag,
  X,
} from "lucide-react";
import {  useState } from "react";

interface InfoRowProps {
  icon?: LucideIcon | null;
  label: string;
  value: string | number;
  uppercase?: boolean;
  simple?: boolean;
}

const OrderDetailsModal = ({
  order,
  onClose,
  setOrders,
}: {
  order: IOrder;
  onClose: () => void;
  setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
}) => {
  const item = order.products[0];
  const [cancleLoading, setCancleLoading] = useState(false);

  let diffInDays: number | null = null;
  let replacementDays: number | null = null;
  let daysLeft: number | null = null;
  let isReturnAllowed: boolean | null = null;

  if (order?.deliveryDate && item?.product.replacementDays !== undefined) {
    const deliveryDate = new Date(order.deliveryDate);
    const today = new Date();
    deliveryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffInMs = today.getTime() - deliveryDate.getTime();
    diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    replacementDays = item.product.replacementDays;
    isReturnAllowed = replacementDays > 0 && diffInDays <= replacementDays;
    daysLeft = isReturnAllowed ? replacementDays - diffInDays : 0;
  }

  console.log(item, order);

  const handleCancle = async () => {
    try {
      setCancleLoading(true);

      const res = await axios.post("/api/order/cancle-order", {
        orderId: order._id,
      });

      if (res.data?.success) {
        alert(res?.data?.message);
        setOrders((prev) =>
          prev?.map((o) =>
            o._id === order._id ? { ...o, orderStatus: "cancelled" } : o,
          ),
        );
        onClose();
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setCancleLoading(false);
    }
  };

  const handleReturn = async () => {
    try {
      setCancleLoading(true);

      const res = await axios.post("/api/order/return-order", {
        orderId: order._id,
      });

      if (res.data?.success) {
        alert(res?.data?.message);
        const updateData = res?.data?.order;
        setOrders((prev) =>
          prev?.map((o) => (o._id === order._id ? updateData : o)),
        );
        onClose();
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setCancleLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-[#0f1422] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[80vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/2">
          <div>
            <h2 className="text-xl font-bold text-white">Order Details</h2>
            <p className="text-xs text-white/40 font-mono mt-1">
              ID: {String(order._id)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Product</p>
              <p className="font-semibold text-white">{item.product.title}</p>
              <p className="text-xs text-white/40 mt-0.5">
                Qty: {item.quantity} • {order.productVendor?.shopName}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <InfoRow
              icon={Calendar}
              label="Order Date"
              value={new Date(order.createdAt!).toLocaleString()}
            />
            <InfoRow
              icon={CreditCard}
              label="Payment"
              value={order.paymentMethod}
              uppercase
            />
            <div className="h-px bg-white/10 my-2" />
            <InfoRow
              label="Subtotal"
              value={`₹${order.productsTotal}`}
              simple
            />
            <InfoRow
              label="Delivery"
              value={`₹${order.deliveryCharge}`}
              simple
            />
            <InfoRow
              label="Service Fee"
              value={`₹${order.serviceCharge}`}
              simple
            />
            {replacementDays !== null && order.orderStatus == "delivered" && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <InfoRow
                  label="Days since delivery"
                  value={`${diffInDays} day(s)`}
                  simple
                />
                <InfoRow
                  label="Replacement period"
                  value={`${replacementDays} day(s)`}
                  simple
                />
                <InfoRow
                  label="Days left for return"
                  value={`${daysLeft} day(s)`}
                  simple
                />
                <InfoRow
                  label="Return Status"
                  value={isReturnAllowed ? "Allowed" : "Not Allowed"}
                  simple
                />
              </div>
            )}
          </div>
          <div className="bg-linear-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-xl border border-cyan-500/20 flex justify-between items-center">
            <span className="font-medium text-cyan-200">Total Paid</span>
            <span className="text-xl font-bold text-cyan-400">
              ₹{order.totalAmount}
            </span>
          </div>

          {/* online payment notice */}
          {order.paymentMethod === "online" &&
            order.orderStatus != "delivered" && (
              <div
                className="
      bg-linear-to-r from-cyan-500/10 to-blue-500/10
      p-4 rounded-xl
      border border-cyan-500/20
      flex items-start gap-3
    "
              >
                <div className="text-cyan-400 text-xl">ℹ️</div>

                <div className="text-xs leading-relaxed">
                  <p className="text-cyan-300 font-medium">
                    Online Payment Notice
                  </p>
                  <p className="text-white/80 mt-1">
                    This order was paid using an{" "}
                    <span className="font-semibold text-white">
                      online payment method
                    </span>
                    . You cannot cancel this order. However, you may request a{" "}
                    <span className="font-semibold text-yellow-400">
                      return{" "}
                    </span>
                    if the product is delivered.
                  </p>
                </div>
              </div>
            )}

          {order.returnedAmount != undefined && order.returnedAmount != 0 && (
            <div className="bg-linear-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-xl border border-cyan-500/20 flex justify-between items-center">
              <span className="font-medium text-cyan-200">Returned amound</span>
              <span className="text-xl font-bold text-cyan-400">
                ₹{order.returnedAmount}
              </span>
            </div>
          )}

          {order.deliveryOtp && (
            <div className="bg-linear-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-xl border border-cyan-500/20 flex justify-between items-center">
              <span className="font-medium text-green-300">Otp</span>
              <span className="text-xl font-bold text-green-300">
                {order.deliveryOtp}
              </span>
            </div>
          )}
        </div>

        {order?.deliveryDate && (
          <div className=" flex justify-center text-xs mb-2">
            Delivered on : {new Date(order?.deliveryDate).toLocaleString()}
          </div>
        )}
        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          {order.orderStatus == "delivered" && isReturnAllowed ? (
            <button
              onClick={handleReturn}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-colors"
            >
              Return Order
            </button>
          ) : (
            order.orderStatus != "cancelled" &&
            order.orderStatus != "returned" &&
            order.paymentMethod != "online" && (
              <button
                onClick={handleCancle}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-colors"
              >
                {cancleLoading ? (
                  <Loader2 className=" animate-spin mx-auto" />
                ) : (
                  "Cancle Order"
                )}
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailsModal;

const InfoRow = ({
  icon: Icon = null,
  label,
  value,
  uppercase,
  simple,
}: InfoRowProps) => (
  <div
    className={`flex justify-between items-center ${simple ? "text-sm" : ""}`}
  >
    <div className="flex items-center gap-2 text-white/60">
      {Icon && <Icon size={14} />}
      <span className={simple ? "" : "text-sm"}>{label}</span>
    </div>
    <span className={`text-white font-medium ${uppercase ? "uppercase" : ""}`}>
      {value}
    </span>
  </div>
);
