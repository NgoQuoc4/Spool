import React from "react";

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const SpoolLogo: React.FC<IconProps> = ({
  size = 34,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Spool Logo"
    style={{
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
    }}
  >
    {/* Center spindle core dot */}
    <circle cx="128" cy="128" r="20" fill={color} />

    {/* Upper winding thread arm */}
    <path
      stroke={color}
      strokeWidth="26"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 56,128 A 72,72 0 0,1 200,128 C 200,168 168,198 128,198 C 98,198 74,178 74,152"
    />

    {/* Lower winding thread arm */}
    <path
      stroke={color}
      strokeWidth="26"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 200,128 A 72,72 0 0,1 56,128 C 56,88 88,58 128,58 C 158,58 182,78 182,104"
    />
  </svg>
);

export const ThreadsLogo = SpoolLogo;

export const SpoolFullLogo: React.FC<{
  className?: string;
  height?: number | string;
  width?: number | string;
  color?: string;
}> = ({
  className = "",
  height = 36,
  width = "auto",
  color = "currentColor",
}) => (
  <svg
    viewBox="0 0 1120 300"
    height={height}
    width={width}
    fill={color}
    role="img"
    aria-label="Spool"
    shapeRendering="geometricPrecision"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    {/* Spool Vortex Mark on Left */}
    <g
      transform="translate(36, 16)"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="134" cy="134" r="23" fill={color} stroke="none" />
      <path
        strokeWidth="29"
        d="M 52,134 A 82,82 0 0,1 216,134 C 216,178 180,212 134,212 C 100,212 73,189 73,159"
      />
      <path
        strokeWidth="29"
        d="M 216,134 A 82,82 0 0,1 52,134 C 52,90 88,56 134,56 C 168,56 195,79 195,109"
      />
    </g>
    {/* Dynamic Italic Wordmark matching Threads style */}
    <text
      x="350"
      y="222"
      fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      fontSize="192"
      fontWeight="800"
      fontStyle="italic"
      letterSpacing="-3.5"
    >
      spool
    </text>
  </svg>
);

export const ThreadsOfficialLogo: React.FC<{
  className?: string;
  height?: number | string;
  width?: number | string;
  color?: string;
}> = ({
  className = "",
  height = 36,
  width = "auto",
  color = "currentColor",
}) => (
  <svg
    aria-label="Threads"
    className={className}
    fill={color}
    role="img"
    shapeRendering="geometricPrecision"
    viewBox="0 0 1922 375.61"
    height={height}
    width={width}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M267.149,173.742c-.469-54.261-29.885-86.958-79.575-86.958-33.166,0-61.058,15.001-75.708,38.909l32.111,22.384c8.321-13.126,19.806-24.025,40.901-24.025,23.791,0,36.096,13.243,39.612,37.854-11.485-1.758-22.97-2.695-34.807-2.695-64.223,0-94.459,29.064-94.459,67.504,0,39.143,30.236,62.113,74.77,62.113,48.87,0,78.052-32.932,90.005-73.715,12.423,5.625,20.978,18.751,20.978,38.44,0,52.738-60.824,81.45-112.39,81.45-76.059,0-125.75-49.925-125.75-131.141,0-99.498,65.746-163.252,154.111-163.252,59.301,0,88.599,26.017,108.522,60.941l32.815-22.97C316.605,33.342,268.204.997,195.543.997,79.755.997,1,83.15,1,202.337c0,108.991,77.114,172.276,168.995,172.276,75.942,0,152.705-44.3,152.705-120.125,0-39.612-22.736-65.863-55.55-80.747ZM168.588,249.332c-16.759,0-31.525-7.969-31.525-22.619,0-23.087,28.361-30.119,56.136-30.119,10.548,0,20.861.703,30.002,2.696-6.563,30.002-26.017,50.042-54.613,50.042Z" />
    <g>
      <path d="M735.693,97.331c-33.518,0-65.395,18.517-80.982,56.839l20.157-113.679h-56.488l-52.034,294.627h56.605l22.619-128.328c7.969-46.292,33.869-61.058,57.425-61.058,24.142,0,38.088,14.884,38.088,37.034,0,4.219-.703,9.024-1.641,14.063l-24.259,138.29h56.488l28.01-159.385c1.055-5.86,2.109-12.305,2.109-19.337,0-40.198-30.939-59.066-66.098-59.066Z" />
      <polygon points="582.637 101.55 517.242 101.55 525.563 53.148 468.958 53.148 460.637 101.55 407.9 101.55 400.282 143.623 453.137 143.623 419.619 335.119 476.224 335.119 509.625 143.623 575.137 143.623 582.637 101.55" />
      <path d="M964.106,97.331c-35.158,0-58.246,28.713-69.965,56.839l9.141-52.62h-56.488l-41.135,233.569h56.605l23.087-131.258c6.797-38.323,26.837-56.839,50.276-56.839,10.899,0,20.509,2.813,29.299,9.024l33.049-48.167c-8.321-6.329-19.923-10.548-33.869-10.548Z" />
      <path d="M1105.325,96.628c-71.958,0-124.461,61.058-124.461,134.657,0,67.152,46.175,107.35,110.983,107.35,31.408,0,63.754-8.438,86.724-31.643l-26.838-38.557c-14.649,14.649-32.111,26.017-55.667,26.017-36.448,0-59.066-24.611-58.714-63.168h155.048c2.93-14.298,4.688-27.775,4.688-40.432,0-56.019-35.393-94.224-91.763-94.224ZM1142.945,193.43h-101.022c8.79-32.463,28.947-54.73,60.707-54.73,26.252,0,41.37,17.11,41.37,42.542,0,3.867-.352,7.969-1.055,12.188Z" />
      <path d="M1874.942,205.853l-37.737-23.204c-11.251-6.68-16.759-12.657-16.759-21.095,0-12.188,10.43-20.978,29.299-20.978,16.759,0,31.994,9.493,44.417,21.329l26.838-38.205c-12.54-14.767-37.854-27.306-71.254-27.306-48.167,0-85.904,25.666-85.904,71.489,0,31.525,16.759,49.222,39.026,62.348l40.549,23.908c8.907,5.625,12.657,10.665,12.657,18.985,0,12.657-12.657,21.095-31.525,21.095-16.29,0-38.791-10.782-52.738-25.431l-26.838,38.088c14.649,18.985,44.065,31.525,79.692,31.525,54.495,0,87.896-27.424,87.896-69.496,0-27.306-11.72-47.112-37.62-63.051Z" />
      <path d="M1414.368,149.717c-5.508-27.892-29.416-53.675-74.184-53.675-69.379,0-119.89,60.941-119.89,137,0,63.402,37.854,105.71,91.295,105.71,28.127,0,43.948-12.774,54.964-25.197l23.673-26.838-8.438,48.401h56.839l41.018-233.569h-56.722l-8.555,48.167ZM1334.675,292.225c-30.236,0-55.55-18.986-55.55-63.402,0-50.752,19.923-88.833,68.676-88.833,31.174,0,55.55,19.103,55.55,63.402s-23.556,88.833-68.676,88.833Z" />
      <path d="M1700.557,40.491l-19.22,109.225c-5.508-27.892-29.416-53.675-74.184-53.675-69.379,0-119.89,60.941-119.89,137,0,63.402,37.854,105.71,91.295,105.71,28.127,0,43.948-12.774,54.964-25.197l23.673-26.838-8.438,48.401h56.839l51.683-294.627h-56.722ZM1601.645,292.225c-30.236,0-55.55-18.986-55.55-63.402,0-40.198,19.923-88.833,68.676-88.833,31.174,0,55.55,19.103,55.55,63.402s-23.556,88.833-68.676,88.833Z" />
    </g>
  </svg>
);

export const HomeIcon: React.FC<IconProps & { active?: boolean }> = ({
  size = 24,
  active = false,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={active ? "0" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {active ? (
      <path d="M12 2.09961L1 12.0996H4V21.0996H10V15.0996H14V21.0996H20V12.0996H23L12 2.09961Z" />
    ) : (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    )}
  </svg>
);

export const SearchIcon: React.FC<IconProps & { active?: boolean }> = ({
  size = 24,
  active = false,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2.6" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const CreateIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="4" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const HeartIcon: React.FC<
  IconProps & { active?: boolean; filled?: boolean }
> = ({ size = 20, active = false, filled = false, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={active || filled ? "#ff3040" : "none"}
    stroke={active || filled ? "#ff3040" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const UserIcon: React.FC<IconProps & { active?: boolean }> = ({
  size = 24,
  active = false,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={active ? "0" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {active ? (
      <path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM12 14C7.58 14 2 16.24 2 20.67V22H22V20.67C22 16.24 16.42 14 12 14Z" />
    ) : (
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    )}
  </svg>
);

export const CommentIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const RepostIcon: React.FC<IconProps & { active?: boolean }> = ({
  size = 20,
  active = false,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#00ba7c" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

export const QuoteIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const MoreDotsIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export const VerifiedBadge: React.FC<IconProps> = ({
  size = 15,
  className = "",
  color = "#0095f6",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

export const VideoIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="15" height="14" x="2" y="5" rx="2" ry="2" />
    <polygon points="22 7 17 12 22 17 22 7" fill="currentColor" />
  </svg>
);

export const GifIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 8h3v2H8.5v4H7V8z" />
    <path d="M12 8v8" />
    <path d="M15 8h3v2h-1.5v1.5h1.5v2h-3V8z" />
  </svg>
);

export const PollIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

export const TagIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const ColumnsIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </svg>
);

export const MenuBarsIcon: React.FC<IconProps> = ({
  size = 22,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="9" y1="16" x2="21" y2="16" />
  </svg>
);

export const PinIcon: React.FC<IconProps> = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.77V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.77a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24Z" />
  </svg>
);

export const GoogleIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <rect
      width="20"
      height="20"
      x="2"
      y="2"
      rx="5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="6" r="1.2" fill="currentColor" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const MessageIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const InsightIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 16v-4" />
    <path d="M12 16V9" />
    <path d="M17 16v-7" />
  </svg>
);

export const BookmarkIcon: React.FC<
  IconProps & { active?: boolean; filled?: boolean }
> = ({ size = 20, className = "", active = false, filled = false, color }) => {
  const isFilled = active || filled;
  const activeColor = color || "var(--accent-blue, #0095f6)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? activeColor : "none"}
      stroke={isFilled ? activeColor : color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
};

export const GhostIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </svg>
);

export const ArchiveIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

export const SortIcon: React.FC<IconProps> = ({
  size = 16,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
  </svg>
);

export const ExpandIcon: React.FC<IconProps> = ({
  size = 16,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 3 6 6" />
    <path d="M9 21 3 15" />
    <path d="M21 3h-6" />
    <path d="M21 3v6" />
    <path d="M3 21h6" />
    <path d="M3 21v-6" />
  </svg>
);

export const AddColumnIcon: React.FC<IconProps> = ({
  size = 18,
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    style={{ color: "var(--icon-primary)" }}
  >
    <path d="M15 7.5a1 1 0 0 1 1 1V11h2.5a1 1 0 0 1 0 2H16v2.5a1 1 0 0 1-2 0V13h-2.5a1 1 0 1 1 0-2H14V8.5a1 1 0 0 1 1-1z"></path>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.1 1.007c.449.007.85.021 1.209.05.728.06 1.368.186 1.96.488l.175.094a5 5 0 0 1 2.011 2.091l.106.224c.227.53.33 1.1.381 1.737.059.718.058 1.606.058 2.71V15.6c0 1.103.001 1.991-.058 2.709-.052.637-.154 1.208-.381 1.737l-.106.224a4.998 4.998 0 0 1-2.01 2.091l-.175.094c-.593.302-1.233.428-1.961.487-.718.059-1.606.058-2.71.058H8.4l-.366-.002L8 23l-.043-.003c-.901 0-1.647-.004-2.266-.055-.637-.052-1.208-.154-1.737-.381l-.224-.106a5.001 5.001 0 0 1-2.092-2.01l-.093-.175c-.302-.593-.428-1.233-.487-1.961C.999 17.59 1 16.703 1 15.599V8.4c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96l.093-.175a5 5 0 0 1 2.091-2.011l.225-.106c.53-.227 1.1-.33 1.737-.381.619-.05 1.365-.055 2.266-.056L8 1l.034.001L8.4 1h7.2l1.5.007zM9 21h6.6c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277l.206-.115a3 3 0 0 0 1.105-1.196l.049-.103c.108-.251.184-.584.227-1.114C21 17.53 21 16.736 21 15.6V8.4c0-1.136 0-1.929-.05-2.546-.05-.604-.143-.952-.277-1.215a3.004 3.004 0 0 0-1.105-1.197l-.206-.115c-.263-.134-.611-.227-1.216-.276-.309-.025-.661-.038-1.079-.044L15.6 3H9v18zM7 3.006c-.447.006-.82.018-1.146.045-.529.043-.862.12-1.113.227l-.103.05a3 3 0 0 0-1.31 1.31c-.135.263-.228.612-.277 1.216C3 6.471 3 7.264 3 8.4v7.2c0 1.136 0 1.929.05 2.545.05.605.143.953.277 1.216l.115.207a3 3 0 0 0 1.196 1.105l.103.049c.251.108.584.184 1.113.227.325.027.699.038 1.146.044V3.006z"
    ></path>
  </svg>
);

export const RemoveColumnIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    role="img"
    style={{ color: "var(--icon-primary)" }}
    className={className}
  >
    <title>Gỡ cột</title>
    <path d="M16.5 11a1 1 0 1 1 0 2h-9a1 1 0 1 1 0-2h9z"></path>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1zm0 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"
    ></path>
  </svg>
);

export const UsersIcon: React.FC<IconProps & { active?: boolean }> = ({
  size = 20,
  active = false,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2.5" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const MoreHorizontalIcon: React.FC<
  IconProps & { onClick?: () => void }
> = ({ size = 20, className = "", onClick }) => (
  <div onClick={onClick}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      cursor="pointer"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  </div>
);

export const OptionsIcon = MoreHorizontalIcon;

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 16,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = 16,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const FileIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({
  size = 18,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const CalendarBeforeIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="14 19 11 16 14 13" />
    <line x1="11" y1="16" x2="18" y2="16" />
  </svg>
);

export const CalendarAfterIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="15 13 18 16 15 19" />
    <line x1="18" y1="16" x2="11" y2="16" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// --- SVG Icons matching screenshot ---
export const AccountsCenterIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 18.5c0-2.5 2.5-4 5-4s5 1.5 5 4" />
  </svg>
);

export const SupervisionIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
    <path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M9 16c0-2 1.5-3 3-3s3 1 3 3" />
  </svg>
);

export const PrivacyLockIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="11" width="16" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const ContentPreferencesIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="7" x2="20" y2="7" />
    <circle cx="9" cy="7" r="2.5" fill="var(--bg-card)" />
    <line x1="4" y1="17" x2="20" y2="17" />
    <circle cx="15" cy="17" r="2.5" fill="var(--bg-card)" />
  </svg>
);

export const AccountStatusIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const MoreSettingsIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="16" height="18" rx="3" />
    <path d="M9 8v8M9 8l-2 2M9 8l2 2" />
    <path d="M15 16V8M15 16l-2-2M15 16l2-2" />
  </svg>
);

export const HelpIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </svg>
);

export const TagsMentionsIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <circle cx="19" cy="11" r="2" />
    <path d="M21 11v1a1.5 1.5 0 0 1-3 0v-1a2.5 2.5 0 0 1 5 0" />
  </svg>
);

export const OnlineStatusIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 20a6 6 0 0 0-12 0" />
    <circle cx="12" cy="10" r="4" />
    <circle cx="19" cy="7" r="2.5" fill="#10b981" stroke="#10b981" />
  </svg>
);

export const MessagesIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

export const RestrictedProfilesIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="9" r="4" />
    <path d="M3 20a5 5 0 0 1 10 0" />
    <circle cx="17" cy="14" r="3.5" />
    <circle cx="19" cy="18" r="2.5" />
  </svg>
);

export const BlockedProfilesIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

export const PrivateLikesIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

export const ChevronRight = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Compose / Pencil Icon matching Threads UI
export const ComposeIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

// Paper airplane icon for empty state & send
export const DirectMessageIcon = ({ size = 38 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

// Trash / Delete Icon
export const TrashIcon = ({
  size = 16,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const ArrowDownIcon = ({
  size = 16,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronDownIcon = ArrowDownIcon;

export const InfoIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.6, cursor: "help", flexShrink: 0 }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
