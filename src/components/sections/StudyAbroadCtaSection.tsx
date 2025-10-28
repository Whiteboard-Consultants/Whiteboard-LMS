
import CtaSection from "./CtaSection";

interface StudyAbroadCtaSectionProps {
    headline?: string;
}

export default function StudyAbroadCtaSection({ headline }: StudyAbroadCtaSectionProps) {
    return (
        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <CtaSection headline={headline} />
        </section>
    );
}
