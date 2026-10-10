import {
  z,
} from "zod";


// =========================================================
// SHARED IDENTIFIERS
// =========================================================

const uuidField =
  z
    .string()
    .trim()
    .uuid(
      "Invalid identifier.",
    );


const optionalUniversityId =
  z
    .union([
      z.literal(""),

      z
        .string()
        .trim()
        .uuid(
          "Invalid institution identifier.",
        ),
    ]);


const optionalPricingOptionId =
  z
    .union([
      z.literal(""),

      z
        .string()
        .trim()
        .uuid(
          "Invalid pricing option identifier.",
        ),
    ])
    .default(
      "",
    );


// =========================================================
// REQUEST SUBMISSION
// =========================================================

export const requestSubmissionSchema =
  z.object({
    universityId:
      optionalUniversityId,


    serviceId:
      uuidField,


    /**
     * Required by the server only when the selected service
     * currently has active usable pricing options.
     *
     * Leaving this empty remains valid at schema level so
     * services without pricing options preserve their old
     * behaviour.
     */
    pricingOptionId:
      optionalPricingOptionId,


    /**
     * Required by the server only when the selected service
     * uses PER_UNIT pricing.
     */
    pricingQuantity:
      z
        .string()
        .trim()
        .max(
          40,
          "Pricing quantity is invalid.",
        )
        .default(
          "",
        ),


    applicant:
      z.object({
        firstName:
          z
            .string()
            .trim()
            .min(
              1,
              "First name is required.",
            )
            .max(
              100,
              "First name is too long.",
            ),


        otherNames:
          z
            .string()
            .trim()
            .max(
              150,
              "Other names are too long.",
            ),


        surname:
          z
            .string()
            .trim()
            .min(
              1,
              "Surname is required.",
            )
            .max(
              100,
              "Surname is too long.",
            ),


        gender:
          z.enum([
            "Male",
            "Female",
          ]),


        phone:
          z
            .string()
            .trim()
            .min(
              8,
              "Enter a valid phone number.",
            )
            .max(
              20,
              "Phone number is too long.",
            ),


        email:
          z
            .string()
            .trim()
            .email(
              "Enter a valid email address.",
            )
            .max(
              200,
              "Email address is too long.",
            ),
      }),


    responses:
      z.record(
        z.string(),

        z
          .string()
          .max(
            5000,
            "Service response is too long.",
          ),
      ),


    delivery:
      z.object({
        required:
          z.boolean(),


        fullName:
          z
            .string()
            .trim()
            .max(
              200,
            ),


        houseNumber:
          z
            .string()
            .trim()
            .max(
              100,
            ),


        areaTown:
          z
            .string()
            .trim()
            .max(
              200,
            ),


        cityDistrict:
          z
            .string()
            .trim()
            .max(
              200,
            ),


        region:
          z
            .string()
            .trim()
            .max(
              200,
            ),


        digitalAddress:
          z
            .string()
            .trim()
            .max(
              100,
            ),


        phone:
          z
            .string()
            .trim()
            .max(
              20,
            ),


        email:
          z.union([
            z.literal(""),

            z
              .string()
              .trim()
              .email()
              .max(
                200,
              ),
          ]),


        itemType:
          z
            .string()
            .trim()
            .max(
              200,
            ),


        emergencyContact:
          z
            .string()
            .trim()
            .max(
              20,
            ),
      }),


    /**
     * FREE / QUOTE / STARTING_FROM / MANUAL requests do
     * not necessarily make an immediate payment.
     *
     * The server decides whether payment is required.
     */
    paymentMethod:
      z.union([
        z.enum([
          "momo",
          "bank",
        ]),

        z.literal(""),
      ]),


    notes:
      z
        .string()
        .trim()
        .max(
          2000,
          "Notes are too long.",
        ),
  });


export type ValidatedRequestSubmission =
  z.infer<
    typeof requestSubmissionSchema
  >;