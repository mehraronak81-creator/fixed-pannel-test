import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
    :root {
        --liquid-glass-bg: rgba(12, 12, 16, 0.6);
        --liquid-glass-border: rgba(255, 255, 255, 0.08);
        --liquid-glass-border-highlight: rgba(255, 255, 255, 0.15);
        --liquid-glass-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
        --sidebar-glass-bg: rgba(6, 6, 8, 0.8);
        --terminal-glass-bg: rgba(12, 12, 16, 0.6);
    }

    body,
    #app,
    .app-wrapper {
        ${tw`text-neutral-200`};
        font-family: var(--fontFamily), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        letter-spacing: 0.015em;
        min-height: 100vh;
        background: #000000 !important;
        background-color: #000000 !important;
        background-image: radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.04) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.03) 0%, transparent 40%) !important;
        background-attachment: fixed !important;
    }

    /* Extreme Liquid Glass Cards & Containers */
    .liquid-glass, .box, .card, div[class*="bg-"], .admin-card {
      background: rgba(12, 12, 16, 0.6) !important;
      backdrop-filter: blur(24px) saturate(200%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1) !important;
      border-radius: 14px !important;
    }

    .liquid-glass:hover {
        border-color: rgba(255, 255, 255, 0.18) !important;
        box-shadow: 0 16px 48px 0 rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.2) !important;
    }

    /* Transparent Navigation Sidebar with Liquid Glass effect */
    .sidebar-glass {
        background-color: rgba(6, 6, 8, 0.8) !important;
        backdrop-filter: blur(24px) saturate(200%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.07) !important;
        box-shadow: 4px 0 30px rgba(0, 0, 0, 0.7) !important;
    }

    /* Transparent Terminal & Console Area with Liquid Glass effect */
    .terminal-glass {
        background: rgba(12, 12, 16, 0.6) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
        box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(24px) saturate(200%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
        border-radius: 14px !important;
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
