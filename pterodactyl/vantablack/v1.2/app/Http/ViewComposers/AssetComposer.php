<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Pterodactyl\Services\Helpers\AssetHashService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class AssetComposer
{
    /**
     * AssetComposer constructor.
     */
    public function __construct(private AssetHashService $assetHashService, private SettingsRepositoryInterface $settings)
    {
    }

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('asset', $this->assetHashService);
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Pterodactyl',
            'vantablack' => [
                'logo' => $this->settings->get('settings::vantablack:logo', '/vantablack/Vantablack.png'),
                'fullLogo' => $this->settings->get('settings::vantablack:fullLogo', false),
                'logoHeight' => $this->settings->get('settings::vantablack:logoHeight', '32px'),

                /* SOCIALS */ 
                'discord' => $this->settings->get('settings::vantablack:discord', 'none'),
                'support' => $this->settings->get('settings::vantablack:support', 'https://discord.gg/2vx6tCXmr4'),
                'status' => $this->settings->get('settings::vantablack:status', ''),
                'billing' => $this->settings->get('settings::vantablack:billing', ''),

                'announcementType' => $this->settings->get('settings::vantablack:announcementType', 'party'),
                'announcementCloseable' => $this->settings->get('settings::vantablack:announcementCloseable', false),
                'announcementMessage' => $this->settings->get('settings::vantablack:announcementMessage', 'We have a brand new game panel design!'),

                /* MAIL */
                'mail_color' => $this->settings->get('settings::vantablack:mail_color', '#4a35cf'),
                'mail_backgroundColor' => $this->settings->get('settings::vantablack:mail_backgroundColor', '#F5F5FF'),
                'mail_logo' => $this->settings->get('settings::vantablack:mail_logo', '/vantablack/Vantablack.png'),
                'mail_logoFull' => $this->settings->get('settings::vantablack:mail_logoFull', false),
                'mail_mode' => $this->settings->get('settings::vantablack:mail_mode', 'light'),

                'mail_discord' => $this->settings->get('settings::vantablack:mail_discord', 'https://discord.gg/2vx6tCXmr4'),
                'mail_twitter' => $this->settings->get('settings::vantablack:mail_twitter', 'https://x.com'),
                'mail_facebook' => $this->settings->get('settings::vantablack:mail_facebook', 'https://facebook.com'),
                'mail_instagram' => $this->settings->get('settings::vantablack:mail_instagram', 'https://instagram.com'),
                'mail_linkedin' => $this->settings->get('settings::vantablack:mail_linkedin', 'https://linkedin.com'),
                'mail_youtube' => $this->settings->get('settings::vantablack:mail_youtube', 'https://youtube.com'),

                'mail_status' => $this->settings->get('settings::vantablack:mail_status', ''),
                'mail_billing' => $this->settings->get('settings::vantablack:mail_billing', ''),
                'mail_support' => $this->settings->get('settings::vantablack:mail_support', 'https://discord.gg/2vx6tCXmr4'),

                /* COMPONENTS */
                'serverRow' => $this->settings->get('settings::vantablack:serverRow', 1),
                'socialButtons' => $this->settings->get('settings::vantablack:socialButtons', false),
                'discordBox' => $this->settings->get('settings::vantablack:discordBox', true),
                'modsInstaller' => $this->settings->get('settings::vantablack:modsInstaller', true),
                'modsDefaultLoader' => $this->settings->get('settings::vantablack:modsDefaultLoader', 'fabric'),
                'modsDefaultVersion' => $this->settings->get('settings::vantablack:modsDefaultVersion', ''),

                'statsCards' => $this->settings->get('settings::vantablack:statsCards', 1),
                'sideGraphs' => $this->settings->get('settings::vantablack:sideGraphs', 2),
                'graphs' => $this->settings->get('settings::vantablack:graphs', 2),
                
                'slot1' => $this->settings->get('settings::vantablack:slot1', 'disabled'),
                'slot2' => $this->settings->get('settings::vantablack:slot2', 'disabled'),
                'slot3' => $this->settings->get('settings::vantablack:slot3', 'disabled'),
                'slot4' => $this->settings->get('settings::vantablack:slot4', 'disabled'),
                'slot5' => $this->settings->get('settings::vantablack:slot5', 'disabled'),
                'slot6' => $this->settings->get('settings::vantablack:slot6', 'disabled'),
                'slot7' => $this->settings->get('settings::vantablack:slot7', 'disabled'),

                /* LAYOUT */
                'layout' => $this->settings->get('settings::vantablack:layout', 1),
                'searchComponent' => $this->settings->get('settings::vantablack:searchComponent', 1),
                'logoPosition' => $this->settings->get('settings::vantablack:logoPosition', 1),
                'socialPosition' => $this->settings->get('settings::vantablack:socialPosition', 1),
                'loginLayout' => $this->settings->get('settings::vantablack:loginLayout', 1),

                /* STYLING */
                'backgroundImage' => $this->settings->get('settings::vantablack:backgroundImage', 'none'),
                'backgroundImageLight' => $this->settings->get('settings::vantablack:backgroundImageLight', 'none'),
                'backdrop' => $this->settings->get('settings::vantablack:backdrop', false),
                'backdropPercentage' => $this->settings->get('settings::vantablack:backdropPercentage', '100%'),
                'defaultMode' => $this->settings->get('settings::vantablack:defaultMode', 'darkmode'),
                'copyright' => $this->settings->get('settings::vantablack:copyright', 'VantaHost - Built by Vantablack, a Void Development company.'),
                'radiusInput' => $this->settings->get('settings::vantablack:radiusInput', '7px'),
                'borderInput' => $this->settings->get('settings::vantablack:borderInput', true),
                'radiusBox' => $this->settings->get('settings::vantablack:radiusBox', '10px'),
                'flashMessage' => $this->settings->get('settings::vantablack:flashMessage', 1),
                'pageTitle' => $this->settings->get('settings::vantablack:pageTitle', true),
                'loginBackground' => $this->settings->get('settings::vantablack:loginBackground', '/vantablack/background-login.png'),
                'loginGradient' => $this->settings->get('settings::vantablack:loginGradient', false),

                /* META DATA */
                'meta_color' => $this->settings->get('settings::vantablack:meta_color', '#4a35cf'),
                'meta_title' => $this->settings->get('settings::vantablack:meta_title', 'VantaHost - Game Server Hosting'),
                'meta_description' => $this->settings->get('settings::vantablack:meta_description', 'VantaHost game server hosting, powered by Vantablack and Void Development.'),
                'meta_image' => $this->settings->get('settings::vantablack:meta_image', '/vantablack/meta-tags.png'),
                'meta_favicon' => $this->settings->get('settings::vantablack:meta_favicon', '/vantablack/Vantablack.png'),

                /* ADVANCED */
                'font' => $this->settings->get('settings::vantablack:font', 'Roboto'),
                'profileType' => $this->settings->get('settings::vantablack:profileType', 'gravatar'),
                'modeToggler' => $this->settings->get('settings::vantablack:modeToggler', true),
                'langSwitch' => $this->settings->get('settings::vantablack:langSwitch', true),
                'ipFlag' => $this->settings->get('settings::vantablack:ipFlag', true),
                'lowResourcesAlert' => $this->settings->get('settings::vantablack:lowResourcesAlert', false),

                /* COLORS */
                'primary' => $this->settings->get('settings::vantablack:primary', '#4A35CF'),
                
                'successText' => $this->settings->get('settings::vantablack:successText', '#E1FFD8'),
                'successBorder' => $this->settings->get('settings::vantablack:successBorder', '#56AA2B'),
                'successBackground' => $this->settings->get('settings::vantablack:successBackground', '#3D8F1F'),

                'dangerText' => $this->settings->get('settings::vantablack:dangerText', '#FFD8D8'),
                'dangerBorder' => $this->settings->get('settings::vantablack:dangerBorder', '#AA2A2A'),
                'dangerBackground' => $this->settings->get('settings::vantablack:dangerBackground', '#8F1F20'),

                'secondaryText' => $this->settings->get('settings::vantablack:secondaryText', '#B2B2C1'),
                'secondaryBorder' => $this->settings->get('settings::vantablack:secondaryBorder', '#42425B'),
                'secondaryBackground' => $this->settings->get('settings::vantablack:secondaryBackground', '#2B2B40'),

                'gray50' => $this->settings->get('settings::vantablack:gray50', '#F4F4F4'),
                'gray100' => $this->settings->get('settings::vantablack:gray100', '#D5D5DB'),
                'gray200' => $this->settings->get('settings::vantablack:gray200', '#B2B2C1'),
                'gray300' => $this->settings->get('settings::vantablack:gray300', '#8282A4'),
                'gray400' => $this->settings->get('settings::vantablack:gray400', '#5E5E7F'),
                'gray500' => $this->settings->get('settings::vantablack:gray500', '#42425B'),
                'gray600' => $this->settings->get('settings::vantablack:gray600', '#2B2B40'),
                'gray700' => $this->settings->get('settings::vantablack:gray700', '#1D1D37'),
                'gray800' => $this->settings->get('settings::vantablack:gray800', '#0B0D2A'),
                'gray900' => $this->settings->get('settings::vantablack:gray900', '#040519'),

                /* COLORS LIGHTMODE */
                'lightmode_primary' => $this->settings->get('settings::vantablack:lightmode_primary', '#4A35CF'),
                
                'lightmode_successText' => $this->settings->get('settings::vantablack:lightmode_successText', '#E1FFD8'),
                'lightmode_successBorder' => $this->settings->get('settings::vantablack:lightmode_successBorder', '#56AA2B'),
                'lightmode_successBackground' => $this->settings->get('settings::vantablack:lightmode_successBackground', '#3D8F1F'),

                'lightmode_dangerText' => $this->settings->get('settings::vantablack:lightmode_dangerText', '#FFD8D8'),
                'lightmode_dangerBorder' => $this->settings->get('settings::vantablack:lightmode_dangerBorder', '#AA2A2A'),
                'lightmode_dangerBackground' => $this->settings->get('settings::vantablack:lightmode_dangerBackground', '#8F1F20'),

                'lightmode_secondaryText' => $this->settings->get('settings::vantablack:lightmode_secondaryText', '#46464D'),
                'lightmode_secondaryBorder' => $this->settings->get('settings::vantablack:lightmode_secondaryBorder', '#C0C0D3'),
                'lightmode_secondaryBackground' => $this->settings->get('settings::vantablack:lightmode_secondaryBackground', '#A6A7BD'),

                'lightmode_gray50' => $this->settings->get('settings::vantablack:lightmode_gray50', '#141415'),
                'lightmode_gray100' => $this->settings->get('settings::vantablack:lightmode_gray100', '#27272C'),
                'lightmode_gray200' => $this->settings->get('settings::vantablack:lightmode_gray200', '#46464D'),
                'lightmode_gray300' => $this->settings->get('settings::vantablack:lightmode_gray300', '#626272'),
                'lightmode_gray400' => $this->settings->get('settings::vantablack:lightmode_gray400', '#757689'),
                'lightmode_gray500' => $this->settings->get('settings::vantablack:lightmode_gray500', '#A6A7BD'),
                'lightmode_gray600' => $this->settings->get('settings::vantablack:lightmode_gray600', '#C0C0D3'),
                'lightmode_gray700' => $this->settings->get('settings::vantablack:lightmode_gray700', '#E7E7EF'),
                'lightmode_gray800' => $this->settings->get('settings::vantablack:lightmode_gray800', '#F0F1F5'),
                'lightmode_gray900' => $this->settings->get('settings::vantablack:lightmode_gray900', '#FFFFFF'),
            ],
            'locale' => config('app.locale') ?? 'en',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
        ]);
    }
}
