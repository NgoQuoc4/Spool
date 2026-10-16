import { useForm } from "react-hook-form";
import type { BotItem, FormSetting } from ".";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { botsApi } from "@/apis/bots.api";
import { useAppStore } from "@/stores/useAppStore";

interface BotSettingFormProps {
  bot: BotItem;
}

const BotSettingForm = ({ bot }: BotSettingFormProps) => {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit } = useForm<FormSetting>({
    defaultValues: {
      rss_url:
        bot.botSettings?.rss_url || "https://vnexpress.net/rss/so-hoa.rss",
      interval_minutes: bot.botSettings?.interval_minutes || 30,
      post_limit: bot.botSettings?.post_limit || 1,
      is_active: bot.botSettings?.is_active ?? true,
    },
  });

  const onSubmit = async (values: FormSetting) => {
    try {
      const payload: FormSetting = {
        rss_url: values.rss_url.trim(),
        interval_minutes: Number(values.interval_minutes),
        post_limit: Number(values.post_limit),
        is_active: String(values.is_active) === "true",
      };
      const res = await botsApi.updateSettingBot(bot.id, payload);
      console.log("res", res);
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      showToast("Cập nhật cấu hình bot thành công!");
    } catch (error) {
      console.error("Update profile failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
      }}
    >
      {/* RSS URL */}
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-secondary)",
          }}
        >
          RSS Feed URL
        </label>
        <input
          type="url"
          {...register("rss_url")}
          placeholder="https://vnexpress.net/rss/so-hoa.rss"
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "var(--text-main)",
            fontSize: "13px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Interval Minutes */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-secondary)",
          }}
        >
          Tần suất quét (phút)
        </label>
        <input
          type="number"
          {...register("interval_minutes")}
          min={1}
          defaultValue={30}
          placeholder="30"
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "var(--text-main)",
            fontSize: "13px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Post Limit */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-secondary)",
          }}
        >
          Số bài tối đa mỗi lần
        </label>
        <input
          type="number"
          {...register("post_limit")}
          min={1}
          max={10}
          defaultValue={1}
          placeholder="1"
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "var(--text-main)",
            fontSize: "13px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Active Status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-secondary)",
          }}
        >
          Trạng thái
        </label>
        <select
          {...register("is_active")}
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "var(--text-main)",
            fontSize: "13px",
            outline: "none",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <option value="true">🟢 Đang hoạt động (Active)</option>
          <option value="false">⚪ Tạm dừng (Inactive)</option>
        </select>
      </div>

      {/* Action Button */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <button
          type="submit"
          style={{
            width: "100%",
            background: "var(--text-main)",
            color: "var(--bg-main)",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Lưu cấu hình
        </button>
      </div>
    </form>
  );
};

export default BotSettingForm;
