import { Clock, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/seo';

export function OfficeNap() {
  const { contact } = siteConfig;
  const telHref = `tel:+${contact.phone.replace(/\D/g, '')}`;

  return (
    <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
      <h2 className="text-2xl font-bold tracking-tight font-headline sm:text-3xl">
        Visit our Kolkata office
      </h2>
      <p className="mt-2 text-muted-foreground">
        Same name, address, and phone as our Google Business Profile — Park Street, Kolkata.
      </p>
      <ul className="mt-6 space-y-4 text-foreground">
        <li className="flex gap-3">
          <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-semibold">Address</p>
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary hover:underline dark:hover:text-white"
            >
              {contact.address}
            </a>
          </div>
        </li>
        <li className="flex gap-3">
          <Phone className="h-5 w-5 mt-0.5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-semibold">Phone</p>
            <a
              href={telHref}
              className="text-muted-foreground hover:text-primary hover:underline dark:hover:text-white"
            >
              {contact.phone}
            </a>
          </div>
        </li>
        <li className="flex gap-3">
          <Clock className="h-5 w-5 mt-0.5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-semibold">Hours</p>
            <p className="text-muted-foreground">Monday–Friday {contact.hoursWeekdayOpens}–{contact.hoursWeekdayCloses}</p>
            <p className="text-muted-foreground">Saturday {contact.hoursSaturdayOpens}–{contact.hoursSaturdayCloses}</p>
          </div>
        </li>
      </ul>
    </div>
  );
}
