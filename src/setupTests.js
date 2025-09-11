import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: jest.fn(),
    pathname: '/',
    locale: 'en'
  })
}));

// Mock next-translate
jest.mock('next-translate/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => key,
    lang: 'en'
  })
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        token: 'mock-token'
      }
    },
    status: 'authenticated'
  })
}));

// Mock @apollo/client
jest.mock('@apollo/client', () => ({
  useQuery: () => ({
    loading: false,
    error: null,
    data: null,
    refetch: jest.fn()
  }),
  useMutation: () => [
    jest.fn(),
    {
      loading: false,
      error: null,
      data: null
    }
  ],
  gql: (strings, ...values) => {
    return strings.reduce((result, string, i) => {
      return result + string + (values[i] || '');
    }, '');
  }
}));

// Mock window.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);
