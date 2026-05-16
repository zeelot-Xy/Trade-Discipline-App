import { Link } from "react-router-dom";

const authTextLinkClassName =
  "font-medium text-sky-300 underline decoration-sky-400/60 underline-offset-4 transition hover:text-sky-200 hover:decoration-sky-300";

export default function AuthTextLink({ to, children, className = "" }) {
  return (
    <Link to={to} className={`${authTextLinkClassName} ${className}`.trim()}>
      {children}
    </Link>
  );
}

