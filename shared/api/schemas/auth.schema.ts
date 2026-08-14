import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
