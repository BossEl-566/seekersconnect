import type { RequestField } from "@/types/request";

const uccDegreeFields: RequestField[] = [
  {
    key: "programPursued",
    label: "Programme Pursued",
    type: "text",
    required: true,
    placeholder: "e.g. BSc Computer Science",
  },
  {
    key: "indexNumber",
    label: "Registration / Index Number",
    type: "text",
    required: true,
  },
  {
    key: "dateOfEnrollment",
    label: "Date / Year of Enrollment",
    type: "text",
    required: true,
  },
  {
    key: "dateOfCompletion",
    label: "Date / Year of Completion",
    type: "text",
    required: true,
  },
  {
    key: "postalAddress",
    label: "Delivery Postal Address",
    type: "textarea",
  },
  {
    key: "destinationInstitution",
    label: "Destination Institution",
    type: "text",
    placeholder: "Where should the transcript be sent?",
  },
  {
    key: "destinationEmail",
    label: "Destination Institution Email",
    type: "email",
  },
];

const uccDistanceFields: RequestField[] = [
  {
    key: "applicantAddress",
    label: "Applicant Address",
    type: "textarea",
    required: true,
  },
  {
    key: "studyCentre",
    label: "Study Centre",
    type: "text",
    required: true,
  },
  {
    key: "yearOfEntry",
    label: "Year of Entry",
    type: "text",
    required: true,
  },
  {
    key: "yearOfCompletion",
    label: "Year of Completion",
    type: "text",
    required: true,
  },
  {
    key: "indexNumber",
    label: "Index Number",
    type: "text",
    required: true,
  },
  {
    key: "programOfStudy",
    label: "Programme of Study",
    type: "text",
    required: true,
  },
  {
    key: "destinationStudyCentre",
    label: "Destination / Study Centre",
    type: "text",
  },
  {
    key: "reasonForApplication",
    label: "Reason for Application",
    type: "textarea",
    required: true,
  },
  {
    key: "internationalApplicant",
    label: "International Applicant?",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    key: "destinationInstitution",
    label: "Destination Institution",
    type: "text",
  },
  {
    key: "destinationInstitutionEmail",
    label: "Destination Institution Email",
    type: "email",
  },
  {
    key: "deliveryMethod",
    label: "Preferred Delivery Method",
    type: "select",
    options: [
      "EMS Delivery",
      "Email / Electronic Delivery",
      "Institution Delivery",
      "Other",
    ],
  },
  {
    key: "additionalInformation",
    label: "Additional Information Relevant to Academic Records",
    type: "textarea",
  },
];

const uccCollegeFields: RequestField[] = [
  {
    key: "applicantAddress",
    label: "Applicant Address",
    type: "textarea",
    required: true,
  },
  {
    key: "collegeAttended",
    label: "College Attended",
    type: "text",
    required: true,
  },
  {
    key: "yearOfEntry",
    label: "Year of Entry",
    type: "text",
    required: true,
  },
  {
    key: "yearOfCompletion",
    label: "Year of Completion",
    type: "text",
    required: true,
  },
  {
    key: "collegeIndexNumber",
    label: "College Index Number",
    type: "text",
    required: true,
  },
  {
    key: "classObtained",
    label: "Class Obtained",
    type: "text",
    placeholder: "Not applicable to Cert-A applicants",
  },
  {
    key: "externalExams",
    label: "External Examinations Written",
    type: "textarea",
    placeholder:
      "Old programme Part 1 / Part 2, Diploma in Education, etc.",
  },
  {
    key: "referredPapers",
    label: "Referred Paper(s), If Any",
    type: "textarea",
  },
  {
    key: "yearReferred",
    label: "Year Referred",
    type: "text",
  },
  {
    key: "finalResultsYear",
    label: "Year of Release of Final Results",
    type: "text",
  },
  {
    key: "supplementaryResult",
    label: "Released as a Supplementary Result?",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    key: "teacherRegistrationNumber",
    label: "Teacher Registration Number",
    type: "text",
  },
  {
    key: "previousAttestationApplication",
    label: "Month / Year of Previous Application for Attestation",
    type: "text",
  },
  {
    key: "additionalInformation",
    label: "Additional Information Relevant to Academic Records",
    type: "textarea",
  },
];

const genericFields: RequestField[] = [
  {
    key: "programOfStudy",
    label: "Programme of Study",
    type: "text",
    required: true,
  },
  {
    key: "indexNumber",
    label: "Student / Index Number",
    type: "text",
    required: true,
  },
  {
    key: "yearOfEntry",
    label: "Year of Entry",
    type: "text",
    required: true,
  },
  {
    key: "yearOfCompletion",
    label: "Year of Completion",
    type: "text",
    required: true,
  },
  {
    key: "destinationInstitution",
    label: "Destination Institution",
    type: "text",
  },
  {
    key: "destinationEmail",
    label: "Destination Email",
    type: "email",
  },
  {
    key: "reasonForApplication",
    label: "Reason for Request",
    type: "textarea",
  },
];

export const REQUEST_FIELDS = {
  "ucc-degree": uccDegreeFields,
  "ucc-distance": uccDistanceFields,
  "ucc-college": uccCollegeFields,
  generic: genericFields,
};