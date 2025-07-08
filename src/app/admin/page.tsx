import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // The main entry for the admin section should be user management.
  redirect('/admin/super-admin');
}
