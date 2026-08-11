const BIBLE_API_BASE = 'https://bibliaapi.com.br/api/v2';
const API_KEY = 'bapi_rooa4nj660z6pvfidl0gryqgrvzlroe4gppbadvlq7iextro';

export async function fetchBible<T>(path: string): Promise<T> {
  const res = await fetch(`${BIBLE_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Bible API error: ${res.status}`);
  }

  return res.json();
}
