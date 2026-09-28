import type { RequestService } from "@/types/request";

export const REQUEST_SERVICES: RequestService[] = [
  {
    id: "ucc-degree-transcript",
    universityId: "ucc",
    name: "Degree / Regular / Sandwich Transcript",
    shortName: "Degree Transcript",
    description:
      "Transcript request for UCC degree, regular and sandwich applicants.",
    category: "transcript",
    formType: "ucc-degree",
    active: true,
  },

  {
    id: "ucc-distance-transcript",
    universityId: "ucc",
    name: "Distance Transcript",
    shortName: "Distance Transcript",
    description:
      "Academic transcript request for UCC distance education applicants.",
    category: "transcript",
    formType: "ucc-distance",
    active: true,
  },

  {
    id: "ucc-distance-proficiency",
    universityId: "ucc",
    name: "Distance English Proficiency Letter",
    shortName: "English Proficiency",
    description:
      "English proficiency letter request for UCC distance applicants.",
    category: "proficiency",
    formType: "ucc-distance",
    active: true,
  },

  {
    id: "ucc-distance-attestation",
    universityId: "ucc",
    name: "Distance Attestation",
    shortName: "Attestation",
    description:
      "Attestation request for eligible UCC distance applicants.",
    category: "attestation",
    formType: "ucc-distance",
    active: true,
  },

  {
    id: "ucc-college-transcript",
    universityId: "ucc",
    name: "College of Education Transcript",
    shortName: "College Transcript",
    description:
      "Academic transcript request for eligible College of Education applicants.",
    category: "transcript",
    formType: "ucc-college",
    active: true,
  },

  {
    id: "ucc-college-proficiency",
    universityId: "ucc",
    name: "College of Education English Proficiency Letter",
    shortName: "English Proficiency",
    description:
      "English proficiency letter for College of Education applicants.",
    category: "proficiency",
    formType: "ucc-college",
    active: true,
  },

  {
    id: "ucc-college-attestation",
    universityId: "ucc",
    name: "College of Education Attestation",
    shortName: "Attestation",
    description:
      "Attestation request for eligible College of Education applicants.",
    category: "attestation",
    formType: "ucc-college",
    active: true,
  },

  {
    id: "uew-transcript",
    universityId: "uew",
    name: "Academic Transcript",
    shortName: "Transcript",
    description: "Academic transcript request for UEW applicants.",
    category: "transcript",
    formType: "generic",
    active: true,
  },

  {
    id: "ug-transcript",
    universityId: "ug",
    name: "Academic Transcript",
    shortName: "Transcript",
    description: "Academic transcript request for University of Ghana applicants.",
    category: "transcript",
    formType: "generic",
    active: true,
  },

  {
    id: "knust-transcript",
    universityId: "knust",
    name: "Academic Transcript",
    shortName: "Transcript",
    description: "Academic transcript request for KNUST applicants.",
    category: "transcript",
    formType: "generic",
    active: true,
  },
];