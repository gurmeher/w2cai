import { redirect } from 'next/navigation';

// Search now lives on the home page; keep old /search links working
export default function SearchPage() {
  redirect('/');
}
