-- Create storage bucket for source files
INSERT INTO storage.buckets (id, name, public)
VALUES ('source-files', 'source-files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'source-files');

-- Allow users to read their own files
CREATE POLICY "Allow users to read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'source-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'source-files' AND (storage.foldername(name))[1] = auth.uid()::text);
