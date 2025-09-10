'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { GA_TRACKING_ID, pageview, initAnalytics } from '@/lib/analytics'

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (GA_TRACKING_ID) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      pageview(url)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Initialize all analytics tracking
    initAnalytics()
  }, [])

  if (!GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: false,
              custom_map: {
                'custom_parameter_1': 'user_engagement_score',
                'custom_parameter_2': 'portfolio_section'
              }
            });
          `,
        }}
      />
      <Script
        id="web-vitals"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Enhanced Web Vitals tracking with additional context
            window.addEventListener('load', function() {
              if ('web-vital' in window) return;
              window['web-vital'] = true;
              
              // Track First Input Delay with user interaction context
              function trackFID() {
                new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    const fid = entry.processingStart - entry.startTime;
                    gtag('event', 'FID', {
                      event_category: 'Web Vitals',
                      value: Math.round(fid),
                      non_interaction: true,
                      custom_parameter_1: entry.name || 'unknown'
                    });
                  }
                }).observe({type: 'first-input', buffered: true});
              }
              
              // Track Largest Contentful Paint with element context
              function trackLCP() {
                new PerformanceObserver((entryList) => {
                  const entries = entryList.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  const lcp = lastEntry.startTime;
                  gtag('event', 'LCP', {
                    event_category: 'Web Vitals',
                    value: Math.round(lcp),
                    non_interaction: true,
                    custom_parameter_1: lastEntry.element?.tagName || 'unknown'
                  });
                }).observe({type: 'largest-contentful-paint', buffered: true});
              }
              
              // Track Cumulative Layout Shift with affected elements
              function trackCLS() {
                let clsValue = 0;
                new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                      clsValue += entry.value;
                    }
                  }
                  gtag('event', 'CLS', {
                    event_category: 'Web Vitals',
                    value: Math.round(clsValue * 1000),
                    non_interaction: true,
                    custom_parameter_1: clsValue > 0.25 ? 'poor' : clsValue > 0.1 ? 'needs-improvement' : 'good'
                  });
                }).observe({type: 'layout-shift', buffered: true});
              }
              
              // Initialize tracking
              if (typeof PerformanceObserver !== 'undefined') {
                trackFID();
                trackLCP();
                trackCLS();
              }
            });
          `,
        }}
      />
    </>
  )
}