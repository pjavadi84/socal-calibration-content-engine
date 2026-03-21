-- Create a public storage bucket for author images and other assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true);

-- Allow public read access
CREATE POLICY "Public read access on assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Allow authenticated uploads (service role will handle this)
CREATE POLICY "Service role upload on assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets');

-- Allow service role updates
CREATE POLICY "Service role update on assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets');
