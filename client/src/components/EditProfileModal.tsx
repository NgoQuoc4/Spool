import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { usersApi } from "@/apis/users.api";
import { mediasApi } from "@/apis/medias.api";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/useAppStore";
import { ChevronRightIcon } from "./Icons";
import type { UpdateMeBody } from "@/types/user.types";

interface FormValues {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
}

const EditProfileModal = () => {
  const { profile, refreshProfile } = useAuth();
  const { showToast, isModalEditProfileOpen, closeEditProfileModal } =
    useAppStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      location: "",
      website: "",
    },
  });

  // Đồng bộ thông tin khi mở modal
  useEffect(() => {
    if (isModalEditProfileOpen && profile) {
      reset({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
      setAvatarUrl(profile.avatar || "");
    }
  }, [isModalEditProfileOpen, profile, reset]);

  if (!isModalEditProfileOpen) return null;

  // Xử lý upload avatar khi người dùng click vào ảnh
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploadingAvatar(true);
      const res = await mediasApi.uploadImage(formData);
      if (res?.data?.url?.[0]) {
        setAvatarUrl(res.data.url[0]);
        showToast("Avatar uploaded!");
      }
    } catch (error) {
      console.error("Upload avatar failed:", error);
      showToast("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const payload: UpdateMeBody = {
        name: values.name.trim(),
        username: values.username.trim(),
        bio: values.bio.trim(),
        location: values.location.trim(),
        website: values.website.trim(),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      };

      const res = await usersApi.updateMe(payload);
      if (res?.data?.data) {
        await refreshProfile();
        showToast("Profile updated successfully");
        closeEditProfileModal();
      }
    } catch (error) {
      console.error("Update profile failed:", error);
      showToast("Failed to update profile, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeEditProfileModal();
      }}
    >
      <div
        className="animate-modal"
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "var(--bg-modal, #181818)",
          borderRadius: "24px",
          border: "1px solid var(--border-color, #282828)",
          boxShadow: "var(--shadow-popup, 0 16px 40px rgba(0, 0, 0, 0.6))",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "24px 24px 20px",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Row 1: Name & Avatar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "14px",
              borderBottom: "1px solid var(--border-color, #282828)",
            }}
          >
            <div style={{ flex: 1, paddingRight: "16px" }}>
              <label
                htmlFor="name"
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-main)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                placeholder="+ Add name"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-main)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Avatar container */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "relative",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                cursor: "pointer",
                flexShrink: 0,
                overflow: "hidden",
                border: "1px solid var(--border-color, #282828)",
                backgroundColor: "var(--bg-card-hover, #222)",
              }}
              title="Click to change photo"
            >
              <img
                src={
                  avatarUrl ||
                  profile?.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"
                }
                alt="Avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: isUploadingAvatar ? 0.4 : 1,
                  transition: "opacity 0.2s",
                }}
              />
              {isUploadingAvatar && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                >
                  ⏳
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Row 2: Username */}
          <div
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--border-color, #282828)",
            }}
          >
            <label
              htmlFor="username"
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              placeholder="Username"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-main)",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Row 3: Bio */}
          <div
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--border-color, #282828)",
            }}
          >
            <label
              htmlFor="bio"
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-main)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Bio
            </label>
            <textarea
              id="bio"
              {...register("bio")}
              rows={2}
              placeholder="+ Write bio"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-main)",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                display: "block",
              }}
            />
          </div>

          {/* Row 4: Links / Website */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid var(--border-color, #282828)",
            }}
          >
            <div style={{ flex: 1, paddingRight: "12px" }}>
              <label
                htmlFor="website"
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-main)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Links
              </label>
              <input
                id="website"
                type="text"
                {...register("website")}
                placeholder="+ Add link"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-main)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <ChevronRightIcon size={16} color="var(--text-secondary)" />
          </div>

          {/* Row 5: Location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid var(--border-color, #282828)",
            }}
          >
            <div style={{ flex: 1, paddingRight: "12px" }}>
              <label
                htmlFor="location"
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-main)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                {...register("location")}
                placeholder="+ Add location"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-main)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <ChevronRightIcon size={16} color="var(--text-secondary)" />
          </div>

          {/* Row 6: Profile privacy switch */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-main)",
                  marginBottom: "2px",
                }}
              >
                Profile privacy
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  maxWidth: "340px",
                }}
              >
                If you switch to private, only approved followers can see your
                threads and replies.
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setIsPrivate((prev) => !prev)}
              style={{
                width: "44px",
                height: "26px",
                borderRadius: "9999px",
                backgroundColor: isPrivate ? "#ffffff" : "transparent",
                border: isPrivate
                  ? "2px solid #ffffff"
                  : "2px solid var(--text-secondary)",
                position: "relative",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: isPrivate ? "#000000" : "#ffffff",
                  position: "absolute",
                  top: "2px",
                  left: isPrivate ? "20px" : "2px",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </button>
          </div>

          {/* Row 7: Done button */}
          <button
            type="submit"
            disabled={isSubmitting || isUploadingAvatar}
            style={{
              width: "100%",
              height: "48px",
              marginTop: "16px",
              backgroundColor: "var(--accent-white, #ffffff)",
              color: "#000000",
              border: "none",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              transition: "opacity 0.2s, transform 0.1s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSubmitting ? "Saving..." : "Done"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
