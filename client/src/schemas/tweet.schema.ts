import z from "zod";

export const createTweetSchema = z.object({
  content: z
    .string()
    .trim()
    .max(280, "Nội dung không được vượt quá 280 ký tự"),
  imageUrl: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
});

export type CreateTweetFormValues = z.infer<typeof createTweetSchema>;
