import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
    :root {
        --liquid-glass-bg: rgba(15, 23, 42, 0.55);
        --liquid-glass-border: rgba(255, 255, 255, 0.08);
        --liquid-glass-border-highlight: rgba(255, 255, 255, 0.15);
        --liquid-glass-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        --sidebar-glass-bg: rgba(10, 14, 26, 0.45);
        --terminal-glass-bg: rgba(8, 12, 22, 0.52);
    }

    body {
        ${tw`bg-neutral-800 text-neutral-200`};
        font-family: var(--fontFamily), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        letter-spacing: 0.015em;
        min-height: 100vh;
        background-color: #0b0f19;
        background-image:
            radial-gradient(ellipse 90% 60% at 50% -20%, rgba(99, 102, 241, 0.12), transparent 70%),
            radial-gradient(circle at 5% 30%, rgba(56, 189, 248, 0.06), transparent 35%),
            radial-gradient(circle at 95% 70%, rgba(139, 92, 246, 0.06), transparent 40%),
            linear-gradient(180deg, #0b0f19 0%, #0d121f 45%, #080c14 100%);
        background-attachment: fixed;
    }

    /* Subtle ambient micro-mesh overlay for depth */
    body::before {
        position: fixed;
        z-index: -1;
        inset: 0;
        pointer-events: none;
        content: '';
        opacity: .18;
        background-image: 
            linear-gradient(rgba(255, 255, 255, .015) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255, 255, 255, .012) 1px, transparent 1px);
        background-size: 32px 32px;
        mask-image: linear-gradient(to bottom, black 30%, transparent 95%);
    }

    /* High-End Liquid Glass for containers, cards, and panels */
    .liquid-glass,
    .backdrop,
    body[data-card-style='glass'] .backdrop {
        background-color: var(--liquid-glass-bg) !important;
        background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 45%, rgba(0, 0, 0, 0.25) 100%) !important;
        border: 1px solid var(--liquid-glass-border) !important;
        border-top: 1px solid var(--liquid-glass-border-highlight) !important;
        box-shadow: var(--liquid-glass-shadow) !important;
        backdrop-filter: blur(24px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
        transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
    }

    /* Transparent Navigation Sidebar with Liquid Glass effect */
    .sidebar-glass {
        background-color: var(--sidebar-glass-bg) !important;
        background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.07) !important;
        box-shadow: 4px 0 30px rgba(0, 0, 0, 0.35) !important;
        backdrop-filter: blur(24px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    }

    /* Transparent Terminal & Console Area with Liquid Glass effect */
    .terminal-glass {
        background-color: var(--terminal-glass-bg) !important;
        background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 40%, rgba(0, 0, 0, 0.35) 100%) !important;
        border: 1px solid rgba(255, 255, 255, 0.09) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(28px) saturate(190%) !important;
        -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
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

