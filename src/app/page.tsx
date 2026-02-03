import { auth } from "@/auth";
import AdminDashBoard from "@/component/admin/AdminDashBoard";
import EditRoleAndPhone from "@/component/EditRoleAndPhone";
import Footer from "@/component/Footer";
import Nav from "@/component/Nav";
import UserDashBoard from "@/component/user/UserDashBoard";
import EditVendorDetails from "@/component/vendor/EditVendorDetails";
import VendorApprovalPending from "@/component/vendor/VendorApprovalPending ";
import VendorDashBoard from "@/component/vendor/VendorDashBoard";
import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { redirect } from "next/navigation";

export default async function Home() {
  await connectDB();
  const session = await auth();
  const user = JSON.parse(
    JSON.stringify(await User.findOne({ email: session?.user?.email })),
  );
  console.log("user:", user);
  if (!user) {
    redirect("/sign-in");
  }

  const incomplete =
    !user.role || !user.phone || (!user.phone && user.role == "user");
  if (incomplete) return <EditRoleAndPhone />;

  if (user.role === "vendor") {
    // 2️⃣ vendor details missing
    const vendorDetailsMissing =
      !user.shopName || !user.shopAddress || !user.gstNumber;

    if (vendorDetailsMissing) {
      return <EditVendorDetails />;
    }

    // 3️⃣ rejected by admin
    if (user.verificationStatus === "rejected") {
      return (
        <VendorApprovalPending
          user={user}
          status="rejected"
          reason={user.rejectedReason}
        />
      );
    }

    // 4️⃣ waiting for approval
    if (user.verificationStatus === "pending") {
      return <VendorApprovalPending user={user} status="pending" />;
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center 
                  bg-linear-to-br from-[#0b0f1a] via-[#12172a] to-[#0b0f1a]
                  text-cyan-400 font-sans flex-col animate-fadeIn"
    >
      <Nav />

      {user?.role == "user" ? (
        <UserDashBoard />
      ) : user?.role == "admin" ? (
        <AdminDashBoard />
      ) : (
        <VendorDashBoard />
      )}
      <Footer user={user} />
    </div>
  );
}
