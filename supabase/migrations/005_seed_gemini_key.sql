-- Seed compatible Gemini settings records without hardcoding secrets.
-- Admin UI / API should set the real key in system_settings after deployment.

INSERT INTO public.system_settings (key, value)
VALUES ('gemini_api_key', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_settings (key, value)
VALUES (
    'ai_provider_config',
    '{"provider":"gemini","model":"gemini-2.5-flash","apiKey":"","baseUrl":"https://generativelanguage.googleapis.com/v1beta"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
