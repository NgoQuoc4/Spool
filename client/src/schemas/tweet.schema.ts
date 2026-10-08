import z from "zod";

export const createTweetSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập nội dung")
      .max(280, "Nội dung không được vượt quá 280 ký tự"),
    imageUrl: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      (data.content && data.content.length > 0) ||
      (data.imageUrl && data.imageUrl.length > 0),
    {
      message: "Vui lòng nhập nội dung hoặc thêm ảnh",
      path: ["content"],
    },
  );

export type CreateTweetFormValues = z.infer<typeof createTweetSchema>;
