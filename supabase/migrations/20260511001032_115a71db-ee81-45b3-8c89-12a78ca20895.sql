-- Owner-scoped policies on the unused 'test' bucket so storage operations cannot
-- be performed anonymously and cross-user access is prevented.

CREATE POLICY "test bucket: owners can read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'test' AND owner = auth.uid());

CREATE POLICY "test bucket: authenticated can upload as self"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'test' AND owner = auth.uid());

CREATE POLICY "test bucket: owners can update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'test' AND owner = auth.uid())
WITH CHECK (bucket_id = 'test' AND owner = auth.uid());

CREATE POLICY "test bucket: owners can delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'test' AND owner = auth.uid());