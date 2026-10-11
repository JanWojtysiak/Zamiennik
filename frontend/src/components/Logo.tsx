export function Logo({ className = "size-[38px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 7.2 45.6 18.2a1.2 1.2 0 0 1 0 2.1L24 31.3 2.4 20.3a1.2 1.2 0 0 1 0-2.1L24 7.2Z" />
      <path d="M8.2 23.1v7.2c0 1.3.8 2.6 2.6 3.6 3.3 1.8 8.2 2.8 13.2 2.8s9.9-1 13.2-2.8c1.8-1 2.6-2.3 2.6-3.6v-7.2L24 31.3 8.2 23.1Z" />
      <path
        d="M41.2 20.8v9.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path d="M41.2 30.2c.1 2.4 3.2 3.4 3.2 6.1 0 .3-2.1-.2-3.2-.8-1.1.6-3.2 1.1-3.2.8 0-2.7 3.1-3.7 3.2-6.1Z" />
    </svg>
  );
}
