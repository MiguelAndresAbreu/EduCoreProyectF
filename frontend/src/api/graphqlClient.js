const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

const GRAPHQL_ENDPOINT = `${API_BASE}/graphql`;

export async function graphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    const errorMessage = payload.errors?.[0]?.message || payload.message || 'GraphQL request failed';
    throw new Error(errorMessage);
  }

  return payload.data;
}
