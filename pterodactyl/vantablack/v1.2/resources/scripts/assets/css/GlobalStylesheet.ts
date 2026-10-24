import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
    :root {
        --liquid-glass-bg: rgba(8, 8, 10, 0.72);
        --liquid-glass-border: rgba(255, 255, 255, 0.08);
        --liquid-glass-border-highlight: rgba(255, 255, 255, 0.15);
        --liquid-glass-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        --sidebar-glass-bg: rgba(6, 6, 8, 0.8);
        --terminal-glass-bg: rgba(8, 8, 10, 0.72);
    }

    body,
    #app {
        ${tw`text-neutral-200`};
        font-family: var(--fontFamily), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        letter-spacing: 0.015em;
        min-height: 100vh;
        background-color: #000000 !important;
        background: #000000 !important;
        background-image: none !important;
    }

    /* High-End Liquid Glass utility for Sidebar, Console, and Cards */
    .liquid-glass,
    .backdrop,
    body[data-card-style='glass'] .backdrop {
        background-color: rgba(8, 8, 10, 0.72) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6) !important;
        border-radius: 0.75rem !important;
        transition: all 250ms ease !important;
    }

    .liquid-glass:hover {
        background-color: rgba(14, 14, 18, 0.82) !important;
        border-color: rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85) !important;
    }

    /* Transparent Navigation Sidebar with Liquid Glass effect */
    .sidebar-glass {
        background-color: rgba(6, 6, 8, 0.8) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.07) !important;
        box-shadow: 4px 0 30px rgba(0, 0, 0, 0.7) !important;
    }

    /* Transparent Terminal & Console Area with Liquid Glass effect */
    .terminal-glass {
        background-color: rgba(8, 8, 10, 0.72) !important;
        background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 40%, rgba(0, 0, 0, 0.6) 100%) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
        backdrop-filter: blur(24px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
    }

    h1, h2, h3, h4, h5, h6 {
        ${tw`font-medium tracking-normal font-header`};
    }

    p {
        ${tw`text-neutral-200 leading-snug`};
        font-family: var(--fontFamily), sans-serif;
    }

    form {
        ${tw`m-0`};
    }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    /* Sleek Modern Scrollbar */
    ::-webkit-scrollbar {
        background: transparent;
        width: 10px;
        height: 10px;
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.14);
        border: 2px solid transparent;
        background-clip: padding-box;
        border-radius: 999px;
        transition: background 200ms ease;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.28);
        border: 2px solid transparent;
        background-clip: padding-box;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }

    .page-content-shell {
        padding-right: var(--vh-content-padding) !important;
        padding-left: var(--vh-content-padding) !important;
        transition: padding 180ms ease;
    }

    body[data-card-style='flat'] .backdrop {
        box-shadow: none !important;
        backdrop-filter: none;
    }

    body[data-card-style='elevated'] .backdrop {
        box-shadow: var(--vh-card-shadow);
    }

    @media (prefers-reduced-motion: reduce) {
        .page-content-shell {
            transition-duration: 0.01ms;
        }
    }
`;

