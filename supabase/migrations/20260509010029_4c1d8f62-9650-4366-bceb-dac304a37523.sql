insert into storage.buckets (id, name, public) values ('course-briefs', 'course-briefs', true)
on conflict (id) do nothing;

create policy "Public read course briefs"
on storage.objects for select
using (bucket_id = 'course-briefs');

create policy "Admins upload course briefs"
on storage.objects for insert to authenticated
with check (bucket_id = 'course-briefs' and public.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins update course briefs"
on storage.objects for update to authenticated
using (bucket_id = 'course-briefs' and public.has_role(auth.uid(), 'admin'::app_role))
with check (bucket_id = 'course-briefs' and public.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins delete course briefs"
on storage.objects for delete to authenticated
using (bucket_id = 'course-briefs' and public.has_role(auth.uid(), 'admin'::app_role));