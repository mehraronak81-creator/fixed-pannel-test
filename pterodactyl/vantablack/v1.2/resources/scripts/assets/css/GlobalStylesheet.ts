import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
    body {
        ${tw`bg-neutral-800 text-neutral-200`};
        font-family: var(--fontFamily), sans-serif;
        letter-spacing: 0.015em;
    }

    body {
        min-height: 100vh;
        background-color: #070918;
        background-image:
            radial-gradient(circle at 8% -10%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 32%),
            radial-gradient(circle at 92% 8%, rgba(59, 130, 246, .12), transparent 28%),
            linear-gradient(145deg, #090b1b 0%, #11142a 52%, #080a17 100%);
        background-attachment: fixed;
    }

    body::before {
        position: fixed;
        z-index: -1;
        inset: 0;
        pointer-events: none;
        content: '';
        opacity: .28;
        background-image: linear-gradient(rgba(255, 255, 255, .018) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .014) 1px, transparent 1px);
        background-size: 36px 36px;
        mask-image: linear-gradient(to bottom, black, transparent 75%);
    }

    body[data-card-style='glass'] .backdrop {
        background-image: linear-gradient(135deg, rgba(255, 255, 255, .045), transparent 46%) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .055), 0 18px 46px rgba(0, 0, 0, .17);
        backdrop-filter: blur(20px) saturate(1.12);
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

    /* Scroll Bar Style */
    ::-webkit-scrollbar {
        background: none;
        width: 16px;
        height: 16px;
    }

    ::-webkit-scrollbar-thumb {
        border: solid 0 rgb(0 0 0 / 0%);
        border-right-width: 4px;
        border-left-width: 4px;
        -webkit-border-radius: 9px 4px;
        -webkit-box-shadow: inset 0 0 0 1px hsl(211, 10%, 53%), inset 0 0 0 4px hsl(209deg 18% 30%);
    }

    ::-webkit-scrollbar-track-piece {
        margin: 4px 0;
    }

    ::-webkit-scrollbar-thumb:horizontal {
        border-right-width: 0;
        border-left-width: 0;
        border-top-width: 4px;
        border-bottom-width: 4px;
        -webkit-border-radius: 4px 9px;
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

    body[data-card-style='glass'] .backdrop {
        border-color: color-mix(in srgb, var(--gray400) 45%, transparent) !important;
        background-color: color-mix(in srgb, var(--gray700-default) 72%, transparent) !important;
        box-shadow: var(--vh-card-shadow);
        backdrop-filter: blur(18px) saturate(1.12);
    }

    @media (prefers-reduced-motion: reduce) {
        .page-content-shell {
            transition-duration: 0.01ms;
        }
    }
`;
