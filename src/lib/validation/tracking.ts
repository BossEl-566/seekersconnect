import { z } from "zod";

export const trackingLookupSchema = z.object({
  trackingNumber: z
    .string()
    .trim()
    .min(8)
    .max(100)
    .transform((value) =>
      value.toUpperCase(),
    ),

  trackingPin: z
    .string()
    .trim()
    .regex(
      /^\d{6}$/,
      "Tracking PIN must contain 6 digits.",
    ),
});

export type TrackingLookupInput =
  z.infer<
    typeof trackingLookupSchema
  >;