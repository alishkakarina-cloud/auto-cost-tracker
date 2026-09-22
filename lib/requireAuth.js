import { isAuthenticated } from './auth';

export function requireAuth(context) {
  if (!isAuthenticated(context.req)) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }
  return { props: {} };
}
