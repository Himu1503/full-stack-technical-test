# Assets Folder

Place your logo image file here (e.g., `logo.png`, `logo.svg`, `logo.jpg`).

## Usage

Update the Logo component in `src/components/Logo.tsx` to use your image:

```tsx
<Logo src="/assets/logo.png" size="lg" />
```

Or import it directly:

```tsx
import logoImage from '/assets/logo.png';
<Logo src={logoImage} size="lg" />
```

Supported formats: PNG, SVG, JPG, WebP

