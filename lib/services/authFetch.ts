export class FeatureNotAvailableError extends Error {
  public feature: string;
  constructor(feature: string, message: string) {
    super(message);
    this.name = 'FeatureNotAvailableError';
    this.feature = feature;
  }
}

export async function authFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mediflux_jwt_token') : null;

  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mediflux:unauthorized'));
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Sessão expirada. Faça login novamente.');
  }

  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.blocked && errorData.feature) {
      throw new FeatureNotAvailableError(
        errorData.feature,
        errorData.error || 'Este recurso de inteligência artificial não está incluso no plano da clínica.'
      );
    }
    throw new Error(errorData.error || 'Acesso negado: permissão insuficiente.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro na requisição (${response.status})`);
  }

  return response.json() as Promise<T>;
}
