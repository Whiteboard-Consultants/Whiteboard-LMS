'use client';

import { useEffect, useRef } from 'react';

interface DarkModeHtmlWrapperProps {
  html: string;
  className?: string;
}

export function DarkModeHtmlWrapper({ html, className = '' }: DarkModeHtmlWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const fixDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      if (!isDarkMode || !containerRef.current) return;

      // Colors for dark mode
      const darkBg = '#1e293b'; // Very dark blue-gray
      const lightText = '#f1f5f9'; // Very light
      const darkCard = '#0f172a'; // Almost black
      const darkMuted = '#1e293b'; // Muted dark
      const darkBorder = '#334155'; // Dark border

      // Fix all images
      containerRef.current.querySelectorAll('img').forEach((img) => {
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        img.style.maxWidth = '100%';
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.margin = '1rem auto';
        img.style.backgroundColor = darkBg;
        img.style.borderRadius = '0.5rem';
        img.style.padding = '0.5rem';
      });

      // Fix all tables
      containerRef.current.querySelectorAll('table').forEach((table) => {
        (table as HTMLElement).style.backgroundColor = darkCard;
        (table as HTMLElement).style.color = lightText;
        (table as HTMLElement).style.borderCollapse = 'collapse';
        (table as HTMLElement).style.width = '100%';

        table.querySelectorAll('thead').forEach((thead) => {
          (thead as HTMLElement).style.backgroundColor = darkMuted;
          (thead as HTMLElement).style.color = lightText;
        });

        table.querySelectorAll('th').forEach((th) => {
          (th as HTMLElement).style.backgroundColor = darkMuted;
          (th as HTMLElement).style.color = lightText;
          (th as HTMLElement).style.border = `1px solid ${darkBorder}`;
          (th as HTMLElement).style.padding = '0.75rem';
        });

        table.querySelectorAll('td').forEach((td) => {
          (td as HTMLElement).style.backgroundColor = darkCard;
          (td as HTMLElement).style.color = lightText;
          (td as HTMLElement).style.border = `1px solid ${darkBorder}`;
          (td as HTMLElement).style.padding = '0.75rem';
        });
      });

      // Fix hidden elements
      containerRef.current.querySelectorAll('[style]').forEach((el) => {
        const style = (el as HTMLElement).getAttribute('style') || '';
        if (style.includes('display: none') || style.includes('visibility: hidden') || style.includes('opacity: 0')) {
          (el as HTMLElement).style.display = 'block';
          (el as HTMLElement).style.visibility = 'visible';
          (el as HTMLElement).style.opacity = '1';
        }
      });

      // Fix all text colors to light
      containerRef.current.querySelectorAll('*').forEach((el) => {
        const computed = window.getComputedStyle(el as HTMLElement);
        const bgColor = computed.backgroundColor;
        
        // If background is white/light, make it dark
        if (bgColor.includes('rgb(255') || bgColor.includes('rgb(240') || bgColor.includes('rgb(245') || bgColor === 'rgb(255, 255, 255)') {
          (el as HTMLElement).style.backgroundColor = darkCard;
        }
      });
    };

    // Apply fixes
    fixDarkMode();

    // Reapply on delays
    const timer1 = setTimeout(fixDarkMode, 50);
    const timer2 = setTimeout(fixDarkMode, 200);
    const timer3 = setTimeout(fixDarkMode, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [html]);

  return (
    <div 
      ref={containerRef}
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
