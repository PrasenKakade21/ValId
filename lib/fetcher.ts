export async function fetcher(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    throw new Error(
      data.error || "Failed to fetch data"
    );
  }

  return res.json();
}