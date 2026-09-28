-- =========================================================
-- UNIVERSITIES
-- =========================================================

insert into public.universities (
  code,
  name,
  location
)
values
  (
    'UCC',
    'University of Cape Coast',
    'Cape Coast'
  ),
  (
    'UEW',
    'University of Education, Winneba',
    'Winneba'
  ),
  (
    'UG',
    'University of Ghana',
    'Legon, Accra'
  ),
  (
    'KNUST',
    'Kwame Nkrumah University of Science and Technology',
    'Kumasi'
  );

-- =========================================================
-- UCC SERVICES
-- =========================================================

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'degree-transcript',
  'Degree / Regular / Sandwich Transcript',
  'Degree Transcript',
  'Transcript request for UCC degree, regular and sandwich applicants.',
  'transcript',
  'ucc-degree'
from public.universities
where code = 'UCC';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'distance-transcript',
  'Distance Transcript',
  'Distance Transcript',
  'Academic transcript request for UCC distance education applicants.',
  'transcript',
  'ucc-distance'
from public.universities
where code = 'UCC';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'distance-proficiency',
  'Distance English Proficiency Letter',
  'English Proficiency',
  'English proficiency request for UCC distance applicants.',
  'proficiency',
  'ucc-distance'
from public.universities
where code = 'UCC';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'distance-attestation',
  'Distance Attestation',
  'Attestation',
  'Attestation request for eligible UCC distance applicants.',
  'attestation',
  'ucc-distance'
from public.universities
where code = 'UCC';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'college-transcript',
  'College of Education Transcript',
  'College Transcript',
  'Transcript request for eligible College of Education applicants.',
  'transcript',
  'ucc-college'
from public.universities
where code = 'UCC';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'college-proficiency',
  'College of Education English Proficiency Letter',
  'English Proficiency',
  'English proficiency request for College of Education applicants.',
  'proficiency',
  'ucc-college'
from public.universities
where code = 'UCC';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'college-attestation',
  'College of Education Attestation',
  'Attestation',
  'Attestation request for eligible College of Education applicants.',
  'attestation',
  'ucc-college'
from public.universities
where code = 'UCC';

-- =========================================================
-- OTHER UNIVERSITIES - INITIAL TRANSCRIPT SERVICES
-- =========================================================

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'academic-transcript',
  'Academic Transcript',
  'Transcript',
  'Academic transcript request for UEW applicants.',
  'transcript',
  'generic'
from public.universities
where code = 'UEW';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'academic-transcript',
  'Academic Transcript',
  'Transcript',
  'Academic transcript request for University of Ghana applicants.',
  'transcript',
  'generic'
from public.universities
where code = 'UG';

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type
)
select
  id,
  'academic-transcript',
  'Academic Transcript',
  'Transcript',
  'Academic transcript request for KNUST applicants.',
  'transcript',
  'generic'
from public.universities
where code = 'KNUST';