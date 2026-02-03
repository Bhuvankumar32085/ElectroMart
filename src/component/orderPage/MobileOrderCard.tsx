import { IOrder } from "@/model/order.model";
import { motion } from "framer-motion";
import {
  Loader2,
  LucideIcon,
  Package,
  ShoppingBag,
  Check,
  Truck,
  X,
} from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const map: Record<
    OrderStatus,
    { text: string; className: string; icon: LucideIcon }
  > = {
    pending: {
      text: "Pending",
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      icon: Loader2,
    },
    confirmed: {
      text: "Confirmed",
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      icon: Package,
    },
    shipped: {
      text: "Shipped",
      className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: Truck,
    },
    delivered: {
      text: "Delivered",
      className: "bg-green-500/10 text-green-400 border-green-500/20",
      icon: Package,
    },
    cancelled: {
      text: "Cancelled",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: X,
    },
    returned: {
      text: "Returned",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: Check,
    },
  };

  const config = map[status];
  const Icon = config.icon;

  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon size={12} className={status === "pending" ? "animate-spin" : ""} />
      {config.text}
    </span>
  );
};

const MobileOrderCard = ({
  order,
  onView,
}: {
  order: IOrder;
  onView: () => void;
}) => {
  const item = order.products[0];

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md active:scale-[0.99] transition-transform"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-white/10 to-transparent flex items-center justify-center text-cyan-400">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white/90 line-clamp-1">
              {item.product.title}
            </h3>
            <p className="text-xs text-white/50">
              #{String(order._id)?.slice(-6)} •{" "}
              {new Date(order.createdAt!).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge status={order.orderStatus as OrderStatus} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <p className="text-xs text-white/40">Total Amount</p>
          <p className="text-lg font-bold text-cyan-400">
            ₹{order.totalAmount}
          </p>
        </div>
        <button
          onClick={onView}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
        >
          Details
        </button>
      </div>
    </motion.div>
  );
};

export default MobileOrderCard;
