-- Platform legal identity and public-facing settings.
-- Used by legal pages, footers, and the admin "Identity" tab.
CREATE TABLE IF NOT EXISTS platform_identity (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name TEXT NOT NULL DEFAULT '',
  company_country TEXT NOT NULL DEFAULT '',
  company_number TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT 'contact@yourrank.site',
  affiliate_disclosure TEXT NOT NULL DEFAULT 'Some links and offers on this site are affiliate links. We may earn a commission if you sign up or deposit through them, at no extra cost to you.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_identity (id, company_name, company_country, company_number, support_email, affiliate_disclosure)
VALUES (1, '', '', '', 'contact@yourrank.site', 'Some links and offers on this site are affiliate links. We may earn a commission if you sign up or deposit through them, at no extra cost to you.')
ON CONFLICT (id) DO NOTHING;
