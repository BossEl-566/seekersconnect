-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13K
--
-- ABOUT
-- PRIVACY
-- TERMS
-- DISCLAIMER
-- TERMS ACCEPTANCE TRACKING
-- =========================================================


-- =========================================================
-- 1. SITE PAGES
-- =========================================================

create table if not exists public.site_pages (
  id uuid primary key
    default gen_random_uuid(),

  slug text not null unique,

  title text not null,

  eyebrow text,

  summary text,

  content text not null,

  metadata jsonb not null
    default '{}'::jsonb,

  status text not null
    default 'DRAFT'
    check (
      status in (
        'DRAFT',
        'PUBLISHED'
      )
    ),

  -- -------------------------------------------------------
  -- Version is especially important for Terms.
  --
  -- Whenever Terms materially change, the administrator
  -- should increase this number.
  -- -------------------------------------------------------

  version integer not null
    default 1,

  seo_title text,

  seo_description text,

  updated_by uuid
    references public.admin_profiles(id)
    on delete set null,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),


  constraint site_pages_slug_check
  check (
    slug =
      lower(slug)

    and slug ~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'

    and length(slug)
      between 1 and 100
  ),


  constraint site_pages_title_check
  check (
    length(
      btrim(
        title
      )
    ) between 1 and 250
  ),


  constraint site_pages_eyebrow_check
  check (
    eyebrow is null

    or length(
      eyebrow
    ) <=
    150
  ),


  constraint site_pages_summary_check
  check (
    summary is null

    or length(
      summary
    ) <=
    1500
  ),


  constraint site_pages_content_check
  check (
    length(
      btrim(
        content
      )
    ) >=
    1
  ),


  constraint site_pages_version_check
  check (
    version >=
    1
  ),


  constraint site_pages_seo_title_check
  check (
    seo_title is null

    or length(
      seo_title
    ) <=
    250
  ),


  constraint site_pages_seo_description_check
  check (
    seo_description is null

    or length(
      seo_description
    ) <=
    500
  )
);


-- =========================================================
-- 2. SITE PAGE INDEXES
-- =========================================================

create index if not exists
  site_pages_status_idx
on public.site_pages (
  status,
  slug
);


-- =========================================================
-- 3. UPDATED_AT
-- =========================================================

drop trigger if exists
  site_pages_set_updated_at
on public.site_pages;


create trigger
  site_pages_set_updated_at

before update
on public.site_pages

for each row

execute function
public.set_updated_at();


-- =========================================================
-- 4. ROW LEVEL SECURITY
--
-- Public rendering goes through the server application.
-- Admin editing also goes through the authenticated
-- server-side admin layer.
-- =========================================================

alter table public.site_pages
enable row level security;


-- =========================================================
-- 5. TERMS ACCEPTANCE ON REQUESTS
-- =========================================================

alter table public.requests
add column if not exists
  terms_version integer;


alter table public.requests
add column if not exists
  terms_accepted_at timestamptz;


-- =========================================================
-- 6. REQUEST TERMS CONSTRAINTS
--
-- Existing historical requests may have both values NULL.
--
-- New requests will populate both values together once
-- 13K-2 connects the request wizard.
-- =========================================================

alter table public.requests
drop constraint if exists
  requests_terms_acceptance_pair_check;


alter table public.requests
add constraint
  requests_terms_acceptance_pair_check
check (
  (
    terms_version is null
    and terms_accepted_at is null
  )

  or

  (
    terms_version is not null
    and terms_version >= 1
    and terms_accepted_at is not null
  )
);


-- =========================================================
-- 7. ABOUT PAGE
-- =========================================================

insert into public.site_pages (
  slug,
  title,
  eyebrow,
  summary,
  content,
  metadata,
  status,
  version,
  seo_title,
  seo_description
)
values (
  'about',

  'About Seekers Connect 247',

  'Who We Are',

  'Seekers Connect 247 Enterprise helps customers handle errands, deliveries, document services, academic requests and other support services through one structured platform.',

  $content$
Seekers Connect 247 Enterprise is a service-focused company created to make everyday requests easier to manage.

Our platform connects customers with practical support for errands, pickup and delivery, document processing, academic document requests, shopping assistance, printing, applications and other supported services.

Customers do not need to create an account before making a request. They select the service they need, provide the required information, complete the applicable payment process and follow the request using the tracking information issued by Seekers Connect.

Our goal is to reduce the time, uncertainty and inconvenience involved in completing important personal, academic and administrative tasks.

We continue to expand the platform carefully so that each service has a clear request process, appropriate documentation requirements, secure handling of customer information and transparent communication throughout the workflow.

Leadership

Seekers Connect 247 Enterprise is led by Hon. Djangmah Peter Nubuor.

The company is committed to building dependable service processes that help students, workers, families and other customers complete important tasks with greater convenience and visibility.
$content$,

  jsonb_build_object(
    'ceo_name',
      'Hon. Djangmah Peter Nubuor',

    'ceo_title',
      'Chief Executive Officer',

    'ceo_image_url',
      '/ceo-image.jpg'
  ),

  'PUBLISHED',

  1,

  'About Seekers Connect 247',

  'Learn about Seekers Connect 247 Enterprise, our services, leadership and commitment to making errands, deliveries, documents and applications easier.'
)
on conflict (
  slug
)
do nothing;


-- =========================================================
-- 8. PRIVACY POLICY
-- =========================================================

insert into public.site_pages (
  slug,
  title,
  eyebrow,
  summary,
  content,
  metadata,
  status,
  version,
  seo_title,
  seo_description
)
values (
  'privacy',

  'Privacy Policy',

  'Your Information',

  'This Privacy Policy explains how Seekers Connect 247 collects, uses, stores and protects information submitted while using our services.',

  $content$
Seekers Connect 247 Enterprise collects information that is necessary to receive, process, manage and complete customer service requests.

Information We May Collect

Depending on the service selected, we may collect your name, telephone number, email address, delivery information, academic information, employment information, identification details, application details, documents, payment evidence and other information required to process the selected service.

Some services may require more sensitive information. Examples include Government Worker Loan applications, legal documentation requests and application-support services.

We only request information that is reasonably required for the service being processed.

Sensitive Authentication Information

Seekers Connect does not require customers to provide bank PINs, mobile-money PINs, mandate PINs, passwords, one-time passwords, security codes or other authentication secrets.

You should never submit this information through any Seekers Connect form, upload, email or communication channel.

How We Use Information

Information submitted to Seekers Connect may be used to:

Process and manage your request.

Contact you regarding your request.

Verify payment information.

Prepare or submit documents where applicable.

Coordinate pickup or delivery.

Provide customer support.

Maintain request status and operational records.

Comply with applicable legal, administrative or regulatory requirements.

Documents and File Uploads

Customer files submitted as part of a request are treated as private request information and are not intended for public access.

Public website materials such as service images, blog images and downloadable forms are stored separately from private customer request documents.

Information Sharing

Seekers Connect may share relevant information with institutions, service providers, delivery partners, government bodies, financial institutions or other third parties where this is necessary to perform the service requested by the customer.

Only information reasonably necessary for that purpose should be shared.

Data Retention

Information may be retained for operational, legal, accounting, security and service-history purposes.

Retention periods may vary depending on the type of service and the sensitivity of the information.

Security

Seekers Connect uses technical and operational measures intended to protect customer information from unauthorized access, disclosure, alteration or loss.

No electronic system can guarantee absolute security. Customers should therefore avoid submitting information that has not been specifically requested.

Customer Responsibility

Customers are responsible for ensuring that information and documents submitted are accurate and that they have the authority to provide them.

Contact

Questions about privacy or personal information may be sent to seekersconnect247@gmail.com.
$content$,

  '{}'::jsonb,

  'PUBLISHED',

  1,

  'Privacy Policy | Seekers Connect 247',

  'Read how Seekers Connect 247 collects, uses and protects information submitted through our services.'
)
on conflict (
  slug
)
do nothing;


-- =========================================================
-- 9. TERMS AND CONDITIONS
-- =========================================================

insert into public.site_pages (
  slug,
  title,
  eyebrow,
  summary,
  content,
  metadata,
  status,
  version,
  seo_title,
  seo_description
)
values (
  'terms',

  'Terms and Conditions',

  'Service Terms',

  'These Terms govern requests submitted to Seekers Connect 247 Enterprise and explain important responsibilities relating to information, payment, processing, changes and refunds.',

  $content$
By submitting a request to Seekers Connect 247 Enterprise, you confirm that you have reviewed and accepted these Terms and Conditions.

1. Customer Information

You are responsible for reviewing all names, dates, telephone numbers, email addresses, identification information, delivery information, academic details, application details and other information before submitting your request.

Seekers Connect will process the request using the information supplied by you.

You must notify Seekers Connect as soon as possible if you discover an error.

2. Changes After Work Has Started

Seekers Connect is not responsible for consequences, additional costs, delays or unsuccessful outcomes caused by information or instructions changed by the customer after work has commenced.

Where a change is still possible, additional charges may apply depending on the work already completed and the requirements of the institution or third party involved.

3. Payment

Where payment is required before processing, work will not commence until the applicable payment has been submitted and confirmed.

For services requiring a quotation, the amount must first be confirmed before payment is made.

4. Refunds

Payments are non-refundable once work on the request has commenced or the requested service has been completed.

A customer who cancels a request after processing has commenced is not entitled to a refund for work already started, costs already incurred or services already performed.

Where Seekers Connect has not commenced work and no external cost has been incurred, any refund decision will depend on the circumstances of the request.

5. Third-Party Institutions and Processing Times

Some services depend on universities, government agencies, banks, delivery providers, examination bodies, legal processes or other third parties.

Seekers Connect may assist with the request but cannot guarantee a third party's processing time, approval decision, availability, policy or outcome.

6. Delivery

Customers requesting physical delivery are responsible for providing accurate recipient, location and contact information.

Seekers Connect is not responsible for delays caused by incorrect delivery information supplied by the customer.

7. Customer Documents

Customers must ensure that documents uploaded or supplied are correct, complete and lawful to use for the requested purpose.

Customers should not provide passwords, OTPs, bank PINs, mobile-money PINs, mandate PINs or other authentication secrets.

8. Academic Integrity

Seekers Connect does not write a thesis, dissertation or research project on behalf of a student. The service provides research guidance, topic development assistance, methodological support, review and academic consultation. The student remains responsible for producing and submitting their own academic work.

9. Service Availability

Seekers Connect may change, suspend or discontinue a service where necessary.

Service prices, requirements and processing procedures may also change where required by operational circumstances or third-party institutions.

10. Acceptance

Submitting a request after selecting the acceptance checkbox means that you agree to the version of these Terms displayed at the time of submission.

The version accepted and the acceptance timestamp may be stored with the request for operational and audit purposes.
$content$,

  jsonb_build_object(
    'requires_request_acceptance',
      true
  ),

  'PUBLISHED',

  1,

  'Terms and Conditions | Seekers Connect 247',

  'Read the service terms governing requests, payments, changes, refunds, third-party processing and customer responsibilities at Seekers Connect 247.'
)
on conflict (
  slug
)
do nothing;


-- =========================================================
-- 10. DISCLAIMER
-- =========================================================

insert into public.site_pages (
  slug,
  title,
  eyebrow,
  summary,
  content,
  metadata,
  status,
  version,
  seo_title,
  seo_description
)
values (
  'disclaimer',

  'Disclaimer',

  'Important Information',

  'Seekers Connect provides assistance and facilitation services but cannot guarantee decisions, outcomes or processing times controlled by third parties.',

  $content$
Seekers Connect 247 Enterprise provides assistance, facilitation, document handling, request management and related support services.

Third-Party Decisions

Some services involve universities, examination bodies, government institutions, financial institutions, delivery providers, legal processes or other independent third parties.

Seekers Connect cannot guarantee approval, acceptance, processing time, admission, placement, recruitment, loan approval, publication, verification or any other decision controlled by a third party.

Information supplied by Seekers Connect regarding external requirements should be treated as assistance based on the information available at the time.

Customers remain responsible for confirming important requirements where necessary.

Study Abroad

Study-abroad support may include institution search, programme search, application support and document guidance.

Seekers Connect does not guarantee university admission, scholarship awards or visa approval.

Loans and Financial Services

Seekers Connect may assist customers with Government Worker Loan applications and related documentation.

Final eligibility, affordability assessment, approval, interest terms, deductions, settlement requirements and disbursement decisions remain subject to the relevant financial institution, employer, Controller-related process or authorized provider.

Security Service and Other Applications

Application assistance does not guarantee recruitment, placement, invitation, selection or appointment.

Academic Research Support

Seekers Connect does not write a thesis, dissertation or research project on behalf of a student. The service provides research guidance, topic development assistance, methodological support, review and academic consultation. The student remains responsible for producing and submitting their own academic work.

Customer Responsibility

Customers are responsible for reviewing information before submission and for providing accurate documents and instructions.

Seekers Connect is not responsible for consequences caused by inaccurate information supplied by the customer or changes made by the customer after processing has commenced.
$content$,

  '{}'::jsonb,

  'PUBLISHED',

  1,

  'Disclaimer | Seekers Connect 247',

  'Read important limitations relating to third-party decisions, study abroad, loans, applications and academic research guidance.'
)
on conflict (
  slug
)
do nothing;


-- =========================================================
-- 11. COMMENTS
-- =========================================================

comment on table
public.site_pages
is
'Administrator-managed public informational and legal pages for Seekers Connect 247.';


comment on column
public.site_pages.version
is
'Published document version. Terms version is snapshotted when a customer submits a request.';


comment on column
public.site_pages.metadata
is
'Structured optional page-specific information such as CEO details and presentation settings.';


comment on column
public.requests.terms_version
is
'Version of the published Terms and Conditions accepted by the customer when the request was submitted.';


comment on column
public.requests.terms_accepted_at
is
'Timestamp recording when the customer accepted the applicable Terms and Conditions.';