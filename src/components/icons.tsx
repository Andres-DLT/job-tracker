import type { SVGProps } from "react";

// Iconos de trazo (estilo Lucide, licencia ISC), inline para no añadir dependencias.
function make(paths: React.ReactNode) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const PlusIcon = make(<><path d="M5 12h14" /><path d="M12 5v14" /></>);
export const BellIcon = make(
  <>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
  </>,
);
export const MapPinIcon = make(
  <>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </>,
);
export const ExternalLinkIcon = make(
  <>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </>,
);
export const TrashIcon = make(
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </>,
);
export const PencilIcon = make(
  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />,
);
export const ArrowLeftIcon = make(<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>);
export const BriefcaseIcon = make(
  <>
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </>,
);
export const ColumnsIcon = make(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </>,
);
export const ListIcon = make(
  <>
    <path d="M3 12h.01" /><path d="M3 18h.01" /><path d="M3 6h.01" />
    <path d="M8 12h13" /><path d="M8 18h13" /><path d="M8 6h13" />
  </>,
);
export const SearchIcon = make(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>);
export const CheckIcon = make(<path d="M20 6 9 17l-5-5" />);
export const CalendarIcon = make(
  <>
    <path d="M8 2v4" /><path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </>,
);
export const LogOutIcon = make(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>,
);
