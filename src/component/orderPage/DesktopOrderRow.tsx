import { IOrder } from "@/model/order.model";
import { motion } from "framer-motion";
import {
  Check,
  Eye,
  Loader2,
  LucideIcon,
  Package,
  ShoppingBag,
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
const DesktopOrderRow = ({
  order,
  onView,
}: {
  order: IOrder;
  onView: () => void;
}) => {
  const item = order.products[0];
  return (
    <motion.tr
      variants={itemVariants}
      className="hover:bg-white/2 transition-colors group"
    >
      <td className="p-5 text-white/60 font-mono">
        #{String(order._id)?.slice(-6)}
      </td>
      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50">
            <ShoppingBag size={14} />
          </div>
          <div>
            <p className="font-medium text-white/90 truncate max-w-37.5">
              {item.product.title}
            </p>
            <p className="text-xs text-white/40">
              {order.productVendor?.shopName}
            </p>
          </div>
        </div>
      </td>
      <td className="p-5 text-white/60">
        {new Date(order.createdAt!).toLocaleDateString()}
      </td>
      <td className="p-5">
        <StatusBadge status={order.orderStatus as OrderStatus} />
      </td>
      <td className="p-5 font-semibold text-cyan-400">₹{order.totalAmount}</td>
      <td className="p-5 text-right">
        <button
          onClick={onView}
          className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/60 transition-all active:scale-95"
        >
          <Eye size={16} />
        </button>
      </td>
    </motion.tr>
  );
};

export default DesktopOrderRow;
