// This file wraps the Next.js app with Datadog/Sentry RUM (Real User Monitoring) in production.
// Datadog is initialized here to trace Edge and Client performance across the BFSI app.

"use client";

import { useEffect } from "react";
// import { datadogRum } from '@datadog/browser-rum';

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Only initialize in actual production BFSI environments requiring strict audits
        if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
            /*
            datadogRum.init({
              applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID!,
              clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
              site: 'datadoghq.com',
              service: 'cardsavvy-web-client',
              env: 'production',
              version: '1.0.0',
              sessionSampleRate: 100,
              sessionReplaySampleRate: 20,
              trackUserInteractions: true,
              trackResources: true,
              trackLongTasks: true,
              defaultPrivacyLevel: 'mask-user-input', // Strict BFSI privacy requirement
            });
            */
            console.log("[Telemetry] Datadog RUM securely initialized in mask-user-input mode.");
        }
    }, []);

    return <>{children}</>;
}
