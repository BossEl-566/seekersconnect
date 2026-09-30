-- =========================================================
-- MIGRATE LEGACY REQUEST FORM DEFINITIONS INTO SUPABASE
--
-- Source:
--   src/constants/request-services.ts
--   src/constants/request-fields.ts
--
-- This migration intentionally targets ONLY the original
-- services that existed before the dynamic admin system.
--
-- Manually-created services such as UDS are NOT modified.
-- =========================================================

begin;


-- =========================================================
-- SAFETY CHECK
--
-- We expect exactly:
--
-- UCC   = 7 services
-- UEW   = 1 service
-- UG    = 1 service
-- KNUST = 1 service
--
-- Total = 10
-- =========================================================

do $$
declare
  v_service_count integer;
begin

  select count(*)
  into v_service_count

  from public.services s

  join public.universities u
    on u.id = s.university_id

  where
    (
      u.code = 'UCC'
      and s.slug in (
        'degree-transcript',
        'distance-transcript',
        'distance-proficiency',
        'distance-attestation',
        'college-transcript',
        'college-proficiency',
        'college-attestation'
      )
    )

    or
    (
      u.code in (
        'UEW',
        'UG',
        'KNUST'
      )
      and s.slug =
        'academic-transcript'
    );


  if v_service_count <> 10 then

    raise exception
      'Expected 10 legacy services but found %. Migration stopped.',
      v_service_count;

  end if;

end;
$$;



-- =========================================================
-- SERVICE → LEGACY FORM TYPE MAPPING
-- =========================================================

with target_services as (

  select
    s.id as service_id,

    u.code as university_code,

    s.slug,

    case

      -- ---------------------------------------------------
      -- UCC DEGREE
      -- ---------------------------------------------------

      when
        u.code = 'UCC'
        and s.slug =
          'degree-transcript'

      then
        'ucc-degree'


      -- ---------------------------------------------------
      -- UCC DISTANCE
      -- ---------------------------------------------------

      when
        u.code = 'UCC'
        and s.slug in (
          'distance-transcript',
          'distance-proficiency',
          'distance-attestation'
        )

      then
        'ucc-distance'


      -- ---------------------------------------------------
      -- UCC COLLEGE
      -- ---------------------------------------------------

      when
        u.code = 'UCC'
        and s.slug in (
          'college-transcript',
          'college-proficiency',
          'college-attestation'
        )

      then
        'ucc-college'


      -- ---------------------------------------------------
      -- GENERIC
      -- ---------------------------------------------------

      when
        u.code in (
          'UEW',
          'UG',
          'KNUST'
        )
        and s.slug =
          'academic-transcript'

      then
        'generic'

    end as legacy_form_type

  from public.services s

  join public.universities u
    on u.id =
      s.university_id

  where

    (
      u.code = 'UCC'
      and s.slug in (
        'degree-transcript',
        'distance-transcript',
        'distance-proficiency',
        'distance-attestation',
        'college-transcript',
        'college-proficiency',
        'college-attestation'
      )
    )

    or

    (
      u.code in (
        'UEW',
        'UG',
        'KNUST'
      )
      and s.slug =
        'academic-transcript'
    )

),



-- =========================================================
-- LEGACY FIELD DEFINITIONS
-- =========================================================

field_definitions (
  legacy_form_type,
  sort_order,
  field_key,
  label,
  field_type,
  required,
  placeholder,
  options
) as (

  values


  -- =======================================================
  -- UCC DEGREE / REGULAR / SANDWICH
  -- =======================================================

  (
    'ucc-degree',
    10,
    'programPursued',
    'Programme Pursued',
    'text',
    true,
    'e.g. BSc Computer Science',
    null::jsonb
  ),

  (
    'ucc-degree',
    20,
    'indexNumber',
    'Registration / Index Number',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-degree',
    30,
    'dateOfEnrollment',
    'Date / Year of Enrollment',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-degree',
    40,
    'dateOfCompletion',
    'Date / Year of Completion',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-degree',
    50,
    'postalAddress',
    'Delivery Postal Address',
    'textarea',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-degree',
    60,
    'destinationInstitution',
    'Destination Institution',
    'text',
    false,
    'Where should the transcript be sent?',
    null::jsonb
  ),

  (
    'ucc-degree',
    70,
    'destinationEmail',
    'Destination Institution Email',
    'email',
    false,
    null,
    null::jsonb
  ),



  -- =======================================================
  -- UCC DISTANCE
  -- =======================================================

  (
    'ucc-distance',
    10,
    'applicantAddress',
    'Applicant Address',
    'textarea',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    20,
    'studyCentre',
    'Study Centre',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    30,
    'yearOfEntry',
    'Year of Entry',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    40,
    'yearOfCompletion',
    'Year of Completion',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    50,
    'indexNumber',
    'Index Number',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    60,
    'programOfStudy',
    'Programme of Study',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    70,
    'destinationStudyCentre',
    'Destination / Study Centre',
    'text',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    80,
    'reasonForApplication',
    'Reason for Application',
    'textarea',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    90,
    'internationalApplicant',
    'International Applicant?',
    'select',
    false,
    null,
    '[
      "No",
      "Yes"
    ]'::jsonb
  ),

  (
    'ucc-distance',
    100,
    'destinationInstitution',
    'Destination Institution',
    'text',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    110,
    'destinationInstitutionEmail',
    'Destination Institution Email',
    'email',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-distance',
    120,
    'deliveryMethod',
    'Preferred Delivery Method',
    'select',
    false,
    null,
    '[
      "EMS Delivery",
      "Email / Electronic Delivery",
      "Institution Delivery",
      "Other"
    ]'::jsonb
  ),

  (
    'ucc-distance',
    130,
    'additionalInformation',
    'Additional Information Relevant to Academic Records',
    'textarea',
    false,
    null,
    null::jsonb
  ),



  -- =======================================================
  -- UCC COLLEGE OF EDUCATION
  -- =======================================================

  (
    'ucc-college',
    10,
    'applicantAddress',
    'Applicant Address',
    'textarea',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    20,
    'collegeAttended',
    'College Attended',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    30,
    'yearOfEntry',
    'Year of Entry',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    40,
    'yearOfCompletion',
    'Year of Completion',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    50,
    'collegeIndexNumber',
    'College Index Number',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    60,
    'classObtained',
    'Class Obtained',
    'text',
    false,
    'Not applicable to Cert-A applicants',
    null::jsonb
  ),

  (
    'ucc-college',
    70,
    'externalExams',
    'External Examinations Written',
    'textarea',
    false,
    'Old programme Part 1 / Part 2, Diploma in Education, etc.',
    null::jsonb
  ),

  (
    'ucc-college',
    80,
    'referredPapers',
    'Referred Paper(s), If Any',
    'textarea',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    90,
    'yearReferred',
    'Year Referred',
    'text',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    100,
    'finalResultsYear',
    'Year of Release of Final Results',
    'text',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    110,
    'supplementaryResult',
    'Released as a Supplementary Result?',
    'select',
    false,
    null,
    '[
      "No",
      "Yes"
    ]'::jsonb
  ),

  (
    'ucc-college',
    120,
    'teacherRegistrationNumber',
    'Teacher Registration Number',
    'text',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    130,
    'previousAttestationApplication',
    'Month / Year of Previous Application for Attestation',
    'text',
    false,
    null,
    null::jsonb
  ),

  (
    'ucc-college',
    140,
    'additionalInformation',
    'Additional Information Relevant to Academic Records',
    'textarea',
    false,
    null,
    null::jsonb
  ),



  -- =======================================================
  -- GENERIC
  --
  -- UEW / UG / KNUST
  -- =======================================================

  (
    'generic',
    10,
    'programOfStudy',
    'Programme of Study',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'generic',
    20,
    'indexNumber',
    'Student / Index Number',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'generic',
    30,
    'yearOfEntry',
    'Year of Entry',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'generic',
    40,
    'yearOfCompletion',
    'Year of Completion',
    'text',
    true,
    null,
    null::jsonb
  ),

  (
    'generic',
    50,
    'destinationInstitution',
    'Destination Institution',
    'text',
    false,
    null,
    null::jsonb
  ),

  (
    'generic',
    60,
    'destinationEmail',
    'Destination Email',
    'email',
    false,
    null,
    null::jsonb
  ),

  (
    'generic',
    70,
    'reasonForApplication',
    'Reason for Request',
    'textarea',
    false,
    null,
    null::jsonb
  )

)


-- =========================================================
-- INSERT / SYNCHRONIZE FORM FIELDS
--
-- Existing matching field keys are updated rather than
-- duplicated.
-- =========================================================

insert into public.service_form_fields (
  service_id,
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order,
  active
)

select
  ts.service_id,

  fd.field_key,

  fd.label,

  fd.field_type,

  fd.placeholder,

  fd.required,

  fd.options,

  fd.sort_order,

  true

from target_services ts

join field_definitions fd
  on fd.legacy_form_type =
     ts.legacy_form_type


on conflict (
  service_id,
  field_key
)

do update set

  label =
    excluded.label,

  field_type =
    excluded.field_type,

  placeholder =
    excluded.placeholder,

  required =
    excluded.required,

  options =
    excluded.options,

  sort_order =
    excluded.sort_order,

  active =
    true;



commit;