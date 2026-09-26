// A 2×2 matrix in the quadrants' colours, in matrix order. Decorative: the
// link around it carries the name
export const Logo = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 shrink-0">
    <rect x="2" y="2" width="9" height="9" rx="2" className="fill-red-500" />
    <rect
      x="13"
      y="2"
      width="9"
      height="9"
      rx="2"
      className="fill-yellow-500"
    />
    <rect x="2" y="13" width="9" height="9" rx="2" className="fill-blue-500" />
    <rect
      x="13"
      y="13"
      width="9"
      height="9"
      rx="2"
      className="fill-green-500"
    />
  </svg>
);
