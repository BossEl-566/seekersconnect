import { z } from "zod";

export const requestSubmissionSchema = z.object({
  universityId: z.enum([
    "ucc",
    "uew",
    "ug",
    "knust",
  ]),

  serviceId: z.string().trim().min(1).max(100),

  applicant: z.object({
    firstName: z.string().trim().min(1).max(100),

    otherNames: z
      .string()
      .trim()
      .max(150),

    surname: z.string().trim().min(1).max(100),

    gender: z.enum([
      "Male",
      "Female",
    ]),

    phone: z
      .string()
      .trim()
      .min(8)
      .max(20),

    email: z
      .string()
      .trim()
      .email()
      .max(200),
  }),

  responses: z.record(
    z.string(),
    z.string().max(5000),
  ),

  delivery: z.object({
    required: z.boolean(),

    fullName: z.string().trim().max(200),
    houseNumber: z.string().trim().max(100),
    areaTown: z.string().trim().max(200),
    cityDistrict: z.string().trim().max(200),
    region: z.string().trim().max(200),
    digitalAddress: z.string().trim().max(100),

    phone: z.string().trim().max(20),

    email: z.union([
      z.literal(""),
      z.string().trim().email().max(200),
    ]),

    itemType: z.string().trim().max(200),

    emergencyContact: z
      .string()
      .trim()
      .max(20),
  }),

  paymentMethod: z.enum([
    "momo",
    "bank",
  ]),

  notes: z
    .string()
    .trim()
    .max(2000),
});

export type ValidatedRequestSubmission =
  z.infer<typeof requestSubmissionSchema>;