insert into storage.buckets (id, name, public) values ('lesson-pdfs', 'lesson-pdfs', true)
on conflict (id) do nothing;

create policy "Public read lesson pdfs"
on storage.objects for select
using (bucket_id = 'lesson-pdfs');

create policy "Admins and instructors upload lesson pdfs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'lesson-pdfs'
  and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'instructor'::app_role))
);

create policy "Admins and instructors update lesson pdfs"
on storage.objects for update to authenticated
using (
  bucket_id = 'lesson-pdfs'
  and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'instructor'::app_role))
)
with check (
  bucket_id = 'lesson-pdfs'
  and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'instructor'::app_role))
);

create policy "Admins and instructors delete lesson pdfs"
on storage.objects for delete to authenticated
using (
  bucket_id = 'lesson-pdfs'
  and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'instructor'::app_role))
);

-- Allow assigned instructors to insert/update/delete lessons in their courses
create policy "Instructors insert lessons in their courses"
on public.lessons for insert to authenticated
with check (public.is_course_instructor(auth.uid(), course_id));

create policy "Instructors update lessons in their courses"
on public.lessons for update to authenticated
using (public.is_course_instructor(auth.uid(), course_id))
with check (public.is_course_instructor(auth.uid(), course_id));

create policy "Instructors delete lessons in their courses"
on public.lessons for delete to authenticated
using (public.is_course_instructor(auth.uid(), course_id));