type BannerServer = {
    eggImage?: string | null;
    eggName?: string | null;
    dockerImage?: string | null;
};

const bundledBanner = (name: string): string | undefined => {
    if (/minecraft|paper|purpur|spigot|forge|fabric|bedrock/.test(name)) return '/vantablack/banners/minecraft.webp';
    if (/lavalink/.test(name)) return '/vantablack/banners/lavalink.webp';
    if (/python|pycord|discord\.py/.test(name)) return '/vantablack/banners/python.png';
    if (/mongo/.test(name)) return '/vantablack/banners/mongodb.png';
    if (/node(?:\.js|js)?|npm|yarn|bun/.test(name)) return '/vantablack/banners/nodejs.jpg';
    if (/website|webserver|nginx|apache|caddy|php|wordpress|html/.test(name)) return '/vantablack/banners/website.avif';

    return undefined;
};

/**
 * Use the bundled service artwork for known eggs. This avoids a stale database
 * egg-image URL masking the banner selected for the actual server runtime.
 */
export const getEggBanner = ({ eggImage, eggName, dockerImage }: BannerServer): string => {
    const bundled = bundledBanner(`${eggName || ''} ${dockerImage || ''}`.toLowerCase());

    return bundled || eggImage?.trim() || '/vantablack/banners/minecraft.webp';
};