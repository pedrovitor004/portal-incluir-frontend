type IconName = "book" | "scales" | "shield" | "accessibility" | "bell" | "students";

const paths: Record<IconName, string> = {
  book: "M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1ZM12 5v15",
  scales: "M12 3v18M7 21h10M4 6h16M5 6l-3 7h6L5 6ZM19 6l-3 7h6l-3-7ZM2 13a3 3 0 0 0 6 0M16 13a3 3 0 0 0 6 0",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3ZM8 12l3 3 5-6",
  accessibility: "M12 3v1M4 8l8 2 8-2M12 10v5M12 15l-4 6M12 15l4 6",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  students: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-4M16 3a4 4 0 0 1 0 8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
};

export default function ResourceIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
