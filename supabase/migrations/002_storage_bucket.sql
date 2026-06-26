-- Worker document storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'worker-documents',
    'worker-documents',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Workers can upload to their own folder
CREATE POLICY "Workers can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'worker-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Workers can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'worker-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins view via service role in FastAPI; workers can update own files
CREATE POLICY "Workers can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'worker-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);