type BannerServer = {
    eggImage?: string | null;
    eggName?: string | null;
    dockerImage?: string | null;
};

const bundledBanner = (name: string): string => {
    if (/minecraft|paper|purpur|spigot|forge|fabric|bedrock/.test(name)) return '/vantablack/banners/minecraft.webp';
    if (/lavalink/.test(name)) return '/vantablack/banners/lavalink.webp';
    if (/python|pycord|discord\.py/.test(name)) return '/vantablack/banners/python.png';
    if (/mongo/.test(name)) return '/vantablack/banners/mongodb.png';
    if (/node(?:\.js|js)?|npm|yarn|bun/.test(name)) return '/vantablack/banners/nodejs.jpg';
    if (/website|webserver|nginx|apache|caddy|php|wordpress|html/.test(name)) return '/vantablack/banners/website.avif';

    return '/vantablack/banners/minecraft.webp';
};

/** An egg image has priority; bundled art covers stock eggs without one. */
export const getEggBanner = ({ eggImage, eggName, dockerImage }: BannerServer): string => {
    if (eggImage?.trim()) return eggImage;

    return bundledBanner(`${eggName || ''} ${dockerImage || ''}`.toLowerCase());
};