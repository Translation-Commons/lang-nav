These files are organized using a feature-sliced design pattern.

Note: This is still a work in progress -- not all files have been moved to their final locations and there may be opportunities to improve the organization further.

## Folder Structure

Order from top-level to more specific:
- `app/`: Contains the root application component and global providers.
- `pages/`: Contains page-level components that represent different views in the application, such as data pages for languages, locales, etc. Each page may have its own subfolder for specific components related to that page.
- `features/`: Contains reusable features that can be shared across different parts of the application, such as data loading, filtering, sorting, and table components.
- `widgets/`: Contains shared UI components and widgets that are used throughout the application, such as navigation bars, modals, and controls.
- `entities/`: Contains domain-specific entities like languages, locales, territories, etc. Each entity has its own folder with components and logic related to that entity.
  - At the moment there are both generic folders like `entities/ui/` and type-specific folders like `entities/language/`.
- `shared/`: Contains shared utilities and components that are not specific to any single feature or entity, such as UI components like `HoverableEnumeration`.

They are available as modules in the code so instead of a relative import like:
```typescript
import LanguageDetails from '../../entities/language/LanguageDetails';
```
You would use a module import like:
```typescript
import LanguageDetails from '@entities/language/LanguageDetails';
```

## Nested Folders

Following this design approach, scripts and components may be in the same folder. For example, in `src/shared` you will find
- `ui/`: Contains UI components, like `LinkButton.tsx`.
- `lib/`: Contains utility functions like `setUtils.ts`.
- `hooks/`: Contains React hooks, like `useAutoAdjustedWidth.tsx`.