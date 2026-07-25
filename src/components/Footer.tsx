/**
 * Global site footer. Rendered once in the root layout so it appears on every
 * page. Hidden when the app runs as an installed PWA (`display-mode: standalone`)
 * — footer chrome belongs to the website, not the installed app.
 *
 * Server component: the year is computed at request time (the root layout is
 * force-dynamic), so it stays current without any client JS.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule [@media(display-mode:standalone)]:hidden">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-6 py-6 text-sm text-slate sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Gevork Manukyan</p>
        <a
          href="https://gevorkmanukyan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-ink"
        >
          Built by Gevork Manukyan →
        </a>
      </div>
    </footer>
  );
}
