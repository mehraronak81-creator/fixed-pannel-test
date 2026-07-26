import { css } from 'styled-components';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const breakpoints: Record<Breakpoint, number> = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
};

/** Styled-components breakpoint helper kept local to avoid the obsolete v3 helper package. */
export const breakpoint = (name: Breakpoint) => (strings: TemplateStringsArray, ...interpolations: any[]) => css`
    @media (min-width: ${breakpoints[name]}px) {
        ${css(strings, ...interpolations)}
    }
`;