import { z } from "zod";

const editProfileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "username minimal 3 karakter" })
    .max(16, { message: "username minimal 16 karakter" }),
  bio: z.string().optional(),
});

export type EditProfileFormSchema = z.infer<typeof editProfileFormSchema>;
