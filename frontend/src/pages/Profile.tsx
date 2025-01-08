import { ChangeEvent, useState } from "react";
import { useAuthStore } from "../store/authStore/useAuthStore"
import { Camera, User } from "lucide-react";
import { motion } from "framer-motion";

const routeVariants = {
  initial: {
      scale: 0.9,
      opacity: 0,
  },
  final: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        type: "spring",
        ease: "easeInOut"
      }
  },
  exit: {
    scale:0.9,
    opacity:0
  }
}


export const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const handleImageUpload = async (e:  ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result as string;
      setSelectedImg(base64Image);
      
      await updateProfile({ profilePic: base64Image });
    };
   
  };

  return (
    <motion.div className="h-full pt-20 mr-1 "
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="max-w-2xl mx-auto p-2 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePicture || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.username}</p>
            </div>

            {/* <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail  className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div> */}
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.toString().split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
