import { redirect } from 'next/navigation';

export default async function PaymentRedirectPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (typeof value === 'string') {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    }
  }
  const queryString = query.toString();
  const target = queryString ? `/pay-to-use?${queryString}` : '/pay-to-use';
  redirect(target);
}
