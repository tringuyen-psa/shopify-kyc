import {useEffect, useMemo, useState, useCallback} from 'react';
import {type StripeConnectInstance} from '@stripe/connect-js';
import {loadConnectAndInitialize} from '@stripe/connect-js';
import {useSettings} from '@/app/hooks/useSettings';
import {
  DarkTheme,
  defaultPrimaryColor,
  LightTheme,
} from '@/app/contexts/themes/ThemeConstants';
import { accountManager } from '@/lib/stripe-account';

export const useConnect = (demoOnboarding: boolean = false) => {
  const [hasError, setHasError] = useState(false);
  const [stripeConnectInstance, setStripeConnectInstance] =
    useState<StripeConnectInstance | null>(null);

  const settings = useSettings();
  const locale = settings.locale;
  const theme = settings.theme;
  const primaryColor = settings.primaryColor || defaultPrimaryColor;
  const [overlay, setOverlay] = useState(settings.overlay);
  const [localTheme, setTheme] = useState(settings.theme);
  const [localLocale, setLocalLocale] = useState(settings.locale);

  useEffect(() => {
    if (locale === localLocale) {
      return;
    }

    let newAccountSessionRequired: boolean = false;

    switch (locale) {
      case 'fr-FR':
        newAccountSessionRequired = true;
        break;
      case 'zh-Hant-HK':
      case 'en-GB':
        if (localLocale === 'zh-Hant-HK' || localLocale === 'en-GB') {
          // No need to get a new account session here
        } else {
          newAccountSessionRequired = true;
        }
        break;
      default:
        if (
          localLocale &&
          ['fr-FR', 'zh-Hant-HK', 'en-GB'].includes(localLocale)
        ) {
          // We need a new account session
          newAccountSessionRequired = true;
        }

        break;
    }

    if (locale !== localLocale) {
      setLocalLocale(locale);
    }

    if (theme !== localTheme) {
      setTheme(theme);
    }

    if (demoOnboarding && newAccountSessionRequired) {
      setStripeConnectInstance(null);
    }
  }, [locale, localLocale, demoOnboarding, theme, localTheme]);

  const fetchClientSecret = useCallback(async () => {
    const accountId = accountManager.getAccountId();

    if (!accountId) {
      throw new Error('No account found');
    }

    console.log('Fetching client secret for account:', accountId);

    // Always send accountId from localStorage (works for both demo and live accounts)
    const data = {
      accountId,
      locale,
    };

    // Fetch the AccountSession client secret
    const response = await fetch('/api/account/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Handle errors on the client side here
      const {error} = await response.json();
      console.warn('An error occurred: ', error);
      setHasError(true);
      throw new Error(error || 'Failed to fetch client secret');
    } else {
      const {client_secret: clientSecret} = await response.json();
      setHasError(false);
      return clientSecret;
    }
  }, [locale]);

  const appearanceVariables = useMemo(() => {
    const baseTheme = theme === 'dark' ? DarkTheme : LightTheme;

    // If we have a custom primary color, override the theme colors
    if (primaryColor && primaryColor !== defaultPrimaryColor) {
      return {
        ...baseTheme,
        colorPrimary: primaryColor,
        buttonPrimaryColorBackground: primaryColor,
      };
    }

    return baseTheme;
  }, [theme, primaryColor]);

  useEffect(() => {
    // If we are demoing onboarding, re-init to get a new secret
    if (stripeConnectInstance) {
      stripeConnectInstance.update({
        appearance: {
          overlays: overlay || 'dialog',
          variables: appearanceVariables || LightTheme,
        },
        locale,
      });
    } else {
      const instance = loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        appearance: {
          overlays: overlay || 'dialog',
          variables: appearanceVariables || LightTheme,
        },
        locale,
        fetchClientSecret: async () => {
          return await fetchClientSecret();
        },
        metaOptions: {
          flagOverrides: {
            // Hide testmode stuff
            enable_sessions_demo: true,
          },
        },
      } as any);

      setStripeConnectInstance(instance);
    }
  }, [
    stripeConnectInstance,
    locale,
    fetchClientSecret,
    demoOnboarding,
    appearanceVariables,
    overlay,
  ]);

  return {
    hasError,
    stripeConnectInstance,
  };
};