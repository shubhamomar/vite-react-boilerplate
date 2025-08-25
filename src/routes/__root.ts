import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-4 flex gap-4 bg-background border-b shadow-sm">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/settings" className="[&.active]:font-bold">
          Settings
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  ),
});
