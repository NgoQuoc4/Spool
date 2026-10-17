import { useForm } from "react-hook-form";
import type { BotItem, FormSetting } from ".";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { botsApi } from "@/apis/bots.api";
import { useAppStore } from "@/stores/useAppStore";

interface BotSettingFormProps {
  bot: BotItem;
}

interface FormValues {
  rssUrl: string;
  intervalMinutes: number;
  postLimit: number;
  isActive: string;
}

const BotSettingForm = ({ bot }: BotSettingFormProps) => {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialValues = (bot: BotItem): FormValues => ({
    rssUrl:
      bot.botSettings?.rssUrl ||
      "https://vnexpress.net/rss/so-hoa.rss",
    intervalMinutes:
      bot.botSettings?.intervalMinutes ??
      30,
    postLimit:
      bot.botSettings?.postLimit ??
      1,
    isActive: String(
      bot.botSettings?.isActive ??
      true,
    ),
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: getInitialValues(bot),
  });

  // Tự động cập nhật dữ liệu vào form khi prop bot thay đổi
  useEffect(() => {
    reset(getInitialValues(bot));
  }, [bot, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const payload: FormSetting = {
        rssUrl: values.rssUrl.trim(),
        intervalMinutes: Number(values.intervalMinutes) || 30,
        postLimit: Number(values.postLimit) || 1,
        isActive: values.isActive === "true",
      };
      await botsApi.updateSettingBot(bot.id, payload);
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      showToast("Cập nhật cấu hình bot thành công!");
    } catch (error) {
      console.error("Update bot settings failed:", error);
      showToast("Cập nhật cấu hình bot thất bại!");
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
          required
          {...register("rssUrl", { required: true })}
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
          min={1}
          {...register("intervalMinutes", { valueAsNumber: true })}
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
          min={1}
          max={10}
          {...register("postLimit", { valueAsNumber: true })}
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
          {...register("isActive")}
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
          disabled={isSubmitting}
          style={{
            width: "100%",
            background: "var(--text-main)",
            color: "var(--bg-main)",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) e.currentTarget.style.opacity = "1";
          }}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </div>
    </form>
  );
};

export default BotSettingForm;
