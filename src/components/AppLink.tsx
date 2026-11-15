import { Link, NavLink } from "react-router"
import type { LinkProps, NavLinkProps } from "react-router"

export function AppLink({ prefetch = "none", discover = "none", ...props }: LinkProps) {
  return <Link prefetch={prefetch} discover={discover} {...props} />
}

export function AppNavLink({
  prefetch = "none",
  discover = "none",
  ...props
}: NavLinkProps) {
  return <NavLink prefetch={prefetch} discover={discover} {...props} />
}
