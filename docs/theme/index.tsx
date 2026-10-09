import {
  normalizeHrefInRuntime,
  removeBase,
  useLocation,
  usePage,
  withBase,
} from '@rspress/core/runtime';
import { Layout as DefaultLayout } from '@rspress/core/theme-original';

export * from '@rspress/core/theme-original';

export function Layout() {
  const { page } = usePage();
  const { pathname } = useLocation();
  const isKorean = page.lang === 'ko';
  const path = page.pageType === '404' ? '/' : removeBase(pathname);
  const target = isKorean
    ? path.replace(/^\/ko(?=\/|$)/, '') || '/'
    : `/ko${path}`;
  const lang = isKorean ? 'en' : 'ko';

  return (
    <DefaultLayout
      afterNavMenu={
        // The default language menu cannot receive keyboard focus in Rspress 2.0.23.
        <a
          href={withBase(normalizeHrefInRuntime(target))}
          hrefLang={lang}
          lang={lang}
          rel="alternate"
          className="rp-nav-menu__item__container"
        >
          {isKorean ? 'English' : '한국어'}
        </a>
      }
    />
  );
}
