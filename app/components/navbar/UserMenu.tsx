"use client";

import { useCallback, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useRentModal from "@/app/hooks/useRentModal";
import { SafeUser } from "@/app/types";

import MenuItem from "./MenuItem";
import Avatar from "../Avatar";

interface UserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => setIsOpen((value) => !value), []);
  const onRent = useCallback(() => {
    if (!currentUser) return loginModal.onOpen();
    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal]);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <div
          onClick={onRent}
          className="
            hidden md:block
            text-sm font-semibold 
            py-3 px-4 
            rounded-full 
            hover:bg-neutral-100 
            transition 
            cursor-pointer
            border-[1px] shadow-md
          "
        >
          Rent your stuff
        </div>

        <div
          onClick={toggleOpen}
          className="
            p-3 md:py-2 md:px-3
            border-2 border-gray-200
            flex flex-row items-center
            hover:bg-gradient-to-r hover:from-brand/5 hover:to-brand-dark/5
            hover:border-brand/30
            gap-3 rounded-2xl cursor-pointer
            shadow-md hover:shadow-xl transition-all duration-300
            group
          "
        >
          <AiOutlineMenu className="text-gray-600 group-hover:text-brand transition-colors" />
          <div className="hidden md:block">
            <Avatar src={currentUser?.image} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="
          absolute rounded-3xl shadow-2xl
          w-[85vw] sm:w-[65vw] md:w-[450px]
          bg-white/95 backdrop-blur-md overflow-hidden border border-gray-200/50
          right-0 top-14 text-sm
          animate-in slide-in-from-top-2 duration-300
        ">
          <div className="px-6 py-4 bg-gradient-to-r from-brand via-brand-dark to-brand text-white font-bold text-lg rounded-t-3xl">Your Menu</div>
          <div className="flex flex-col cursor-pointer">
            {currentUser ? (
              <>
                <MenuItem label="📅 My bookings" onClick={() => router.push("/bookings")} />
                <MenuItem label="❤️ My favorites" onClick={() => router.push("/favorites")} />
                <MenuItem label="🏠 My Rentals" onClick={() => router.push("/reservations")} />
                <MenuItem label="🏢 My properties" onClick={() => router.push("/properties")} />
                <MenuItem label="📍 My Address" onClick={() => router.push("/address")} />
                <MenuItem label="🚚 My Deliveries" onClick={() => router.push("/delivery")} />
                <MenuItem label="💰 Rent your stuff" onClick={rentModal.onOpen} />
                <MenuItem label="🤖 Help (AI Assistant)" onClick={() => router.push("/help")} />

                {/* Admin Dashboard */}
                {currentUser.role === "admin" && (
                  <MenuItem label="⚙️ Admin Dashboard" onClick={() => router.push("/admin")} />
                )}

                {/* Delivery Verification (only for unverified delivery person) */}
                {currentUser.role === "delivery" && !currentUser.isVerified && (
                  <MenuItem
                    label="✅ Delivery Verification"
                    onClick={() => router.push("/delivery/verify")}
                  />
                )}

                {/* Delivery Dashboard */}
                {(currentUser.role === "delivery" || currentUser.role === "admin") && (
                  <MenuItem
                    label="📦 Delivery Dashboard"
                    onClick={() => {
                      if (currentUser.role === "delivery" && !currentUser.isVerified) {
                        alert("Please complete verification first!");
                        router.push("/delivery/verify");
                      } else {
                        router.push("/delivery-dashboard");
                      }
                    }}
                  />
                )}

                <hr className="my-2 border-gray-200" />
                <MenuItem
                  label="🚪 Logout"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 hover:bg-red-50"
                />
              </>
            ) : (
              <>
                <MenuItem label="🔐 Login" onClick={loginModal.onOpen} />
                <MenuItem label="✨ Sign up" onClick={registerModal.onOpen} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
