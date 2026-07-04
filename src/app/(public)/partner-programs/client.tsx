'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  HeartHandshake,
  Shield,
  Users,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProgramGrid } from './program-grid';
import { ProgramMegaMenu } from './program-mega-menu';
import { degreeChipClass } from './degree-chips';
import {
  categoryMeta,
  degreeTypeLabel,
  degreeTypeOptions,
  filterPrograms,
  getAvailableDegreeTypes,
  parseCategoryParam,
  parseDegreeTypeParam,
  supportsDegreeTypeFilter,
  type ProgramFilter,
} from './programs-index';
import type { DegreeType } from './types';

export default function PartnerProgramsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = parseCategoryParam(searchParams.get('category'));
  const degreeTypeFromUrl = parseDegreeTypeParam(searchParams.get('degreeType'));
  const [activeCategory, setActiveCategory] =
    useState<ProgramFilter>(categoryFromUrl);
  const [activeDegreeType, setActiveDegreeType] =
    useState<DegreeType | null>(degreeTypeFromUrl);

  useEffect(() => {
    setActiveCategory(categoryFromUrl);
    if (!supportsDegreeTypeFilter(categoryFromUrl)) {
      setActiveDegreeType(null);
      return;
    }
    const available = getAvailableDegreeTypes(categoryFromUrl);
    setActiveDegreeType(
      degreeTypeFromUrl && available.includes(degreeTypeFromUrl)
        ? degreeTypeFromUrl
        : null
    );
  }, [categoryFromUrl, degreeTypeFromUrl]);

  const availableDegreeTypes = useMemo(
    () => getAvailableDegreeTypes(activeCategory),
    [activeCategory]
  );

  const filteredPrograms = useMemo(
    () =>
      filterPrograms(activeCategory, {
        degreeType: supportsDegreeTypeFilter(activeCategory)
          ? activeDegreeType
          : null,
      }),
    [activeCategory, activeDegreeType]
  );

  const { title, description } = categoryMeta[activeCategory];
  const gridTitle = activeDegreeType
    ? `${title} · ${degreeTypeLabel(activeDegreeType)}`
    : title;

  const selectCategory = useCallback(
    (category: ProgramFilter, degreeType?: DegreeType | null) => {
      setActiveCategory(category);

      let nextDegreeType: DegreeType | null = null;
      if (supportsDegreeTypeFilter(category)) {
        if (degreeType !== undefined) {
          nextDegreeType = degreeType;
        } else {
          const available = getAvailableDegreeTypes(category);
          nextDegreeType =
            activeDegreeType && available.includes(activeDegreeType)
              ? activeDegreeType
              : null;
        }

        const available = getAvailableDegreeTypes(category);
        if (nextDegreeType && !available.includes(nextDegreeType)) {
          nextDegreeType = null;
        }
      }

      setActiveDegreeType(nextDegreeType);

      const params = new URLSearchParams(searchParams.toString());
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }

      if (nextDegreeType) {
        params.set('degreeType', nextDegreeType);
      } else {
        params.delete('degreeType');
      }

      const query = params.toString();
      router.replace(query ? `?${query}` : '/partner-programs', {
        scroll: false,
      });

      document
        .getElementById('programs-grid')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [router, searchParams, activeDegreeType]
  );

  const selectDegreeType = useCallback(
    (degreeType: DegreeType | null) => {
      selectCategory(activeCategory, degreeType);
    },
    [selectCategory, activeCategory]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-base font-semibold text-primary uppercase tracking-wide">
                Partner Programs
              </p>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Leading Platform for{' '}
                <span className="text-primary dark:text-white">
                  Comparing Online Courses
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Compare Thousands of Courses
                <br />
                Trusted by Millions of Learners
                <br />
                Exclusive Scholarships & Discounts
              </p>
              <div className="mt-10">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="dark:bg-slate-dark dark:text-white dark:border dark:border-white"
                  >
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/images/courses/Partner-Programs.png"
                alt="Partner Programs Platform"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint="partner programs platform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs catalogue */}
      <section id="programs-grid" className="py-16 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Partner Programs</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover exclusive opportunities through our strategic partnerships
              with world-class institutions powered by RiseUpp
            </p>
          </div>

          <div className="py-6 px-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 sticky top-0 z-40 border border-slate-200 dark:border-slate-800 shadow-md rounded-xl mb-12">
            <ProgramMegaMenu
              activeCategory={activeCategory}
              activeDegreeType={activeDegreeType}
              onSelectCategory={selectCategory}
            />
          </div>

          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-3">{gridTitle}</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {description}
            </p>

            {availableDegreeTypes.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <span className="text-sm text-muted-foreground mr-1">
                  Degree level:
                </span>
                <button
                  type="button"
                  className={degreeChipClass('all', activeDegreeType === null)}
                  onClick={() => selectDegreeType(null)}
                >
                  All
                </button>
                {availableDegreeTypes.map((degreeType) => (
                  <button
                    key={degreeType}
                    type="button"
                    className={degreeChipClass(
                      degreeType,
                      activeDegreeType === degreeType
                    )}
                    onClick={() => selectDegreeType(degreeType)}
                  >
                    {degreeTypeOptions.find((o) => o.value === degreeType)
                      ?.label ?? degreeTypeLabel(degreeType)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ProgramGrid
            programs={filteredPrograms}
            filterKey={`${activeCategory}-${activeDegreeType ?? 'all'}`}
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Our Partner Programs?
            </h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Exclusive Access</h3>
                <p className="text-muted-foreground">
                  Get guaranteed admission and special benefits not available
                  through direct applications.
                </p>
              </div>

              <div className="text-center">
                <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
                <p className="text-muted-foreground">
                  Personal guidance from application to arrival at your chosen
                  institution.
                </p>
              </div>

              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Streamlined Process
                </h3>
                <p className="text-muted-foreground">
                  Simplified applications with faster processing times and
                  higher success rates.
                </p>
              </div>

              <div className="text-center">
                <HeartHandshake className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Cost Savings</h3>
                <p className="text-muted-foreground">
                  Special tuition rates and scholarship opportunities through
                  our partnerships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Contact our advisors to find the perfect partner program for your
            academic goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="tel:+918583035656">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-primary-foreground/90"
              >
                <Users className="mr-2 h-4 w-4" />
                Speak with Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
