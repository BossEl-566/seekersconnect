begin;


-- =========================================================
-- COMPANY PROFILE
-- =========================================================

insert into public.system_settings (
  setting_key,
  setting_value,
  description
)
values (
  'company_profile',
  '{
    "name": "Seekers Connect 247 Enterprise",
    "shortName": "Seekers Connect 247",
    "website": "seekersconnect247.com",
    "email": "seekersconnect247@gmail.com",
    "whatsapp": "0249914968"
  }'::jsonb,
  'Public company identity and contact information.'
)
on conflict (setting_key)
do nothing;


-- =========================================================
-- PAYMENT DETAILS
-- =========================================================

insert into public.system_settings (
  setting_key,
  setting_value,
  description
)
values (
  'payment_details',
  '{
    "momoNumber": "0550414522",
    "momoAccountName": "Seekers Connect",
    "bankName": "Stanbic Bank",
    "bankAccountNumber": "9040014522640",
    "bankAccountName": "Seekers Connect"
  }'::jsonb,
  'Public payment instructions used during request submission.'
)
on conflict (setting_key)
do nothing;


-- =========================================================
-- SUPPORT CONTACTS
-- =========================================================

insert into public.system_settings (
  setting_key,
  setting_value,
  description
)
values (
  'support_contacts',
  '{
    "phones": [
      "0550414552",
      "0249914968",
      "0362297079"
    ],
    "supportEmail": "seekersconnect247@gmail.com"
  }'::jsonb,
  'Public customer-support contact details.'
)
on conflict (setting_key)
do nothing;


-- =========================================================
-- REQUEST NOTICES
-- =========================================================

insert into public.system_settings (
  setting_key,
  setting_value,
  description
)
values (
  'request_notices',
  '{
    "requestNotice": "Enter your information carefully to avoid delays in processing.",
    "paymentInstructions": "Make payment using the details provided, then upload a clear proof of payment.",
    "paymentProofNotice": "Ensure the payment proof clearly shows the successful transaction. Your request will not begin processing until payment has been verified.",
    "trackingNotice": "Keep your request number safe. Your tracking details will be issued after payment verification."
  }'::jsonb,
  'Customer-facing notices used during the academic request workflow.'
)
on conflict (setting_key)
do nothing;


commit;