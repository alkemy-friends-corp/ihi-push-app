# i18next Setup Documentation

This project uses i18next for internationalization with support for English and Japanese.

## Setup

The i18next configuration is located in `src/contexts/i18n.ts` and is automatically initialized when the app starts.

## Translation Files

Translation files are located in `src/locales/`:
- `en.json` - English translations
- `ja.json` - Japanese translations

## Usage

### Basic Translation

```tsx
import { useTranslations } from "@/hooks/useTranslations";

function MyComponent() {
  const { t } = useTranslations();
  
  return <h1>{t('common.welcome')}</h1>;
}
```

### Language Switching

```tsx
import { useLanguage } from "@/hooks/useLanguage";

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <button onClick={() => setLanguage('ja')}>
      Switch to Japanese
    </button>
  );
}
```

### Using the Language Switcher Component

The `FloatingLanguageSelector` component is already set up and ready to use:

```tsx
import { FloatingLanguageSelector } from "@/components/shared/language-switcher";

function App() {
  return (
    <div>
      <FloatingLanguageSelector />
      {/* Your app content */}
    </div>
  );
}
```

## Translation Structure

The translation files are organized by feature:

```json
{
  "common": {
    "welcome": "Welcome",
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "signIn": "Sign In",
    "email": "Email"
  },
  "navigation": {
    "home": "Home",
    "about": "About"
  }
}
```

## Adding New Languages

1. Create a new translation file in `src/locales/` (e.g., `fr.json`)
2. Add the language to the `LANGUAGES` array in the language switcher
3. Import and add the translation to the resources in `src/contexts/i18n.ts`

## Features

- Automatic language detection from browser
- Language persistence in localStorage
- Type-safe translations with TypeScript
- Fallback to English for missing translations
- Debug mode in development 