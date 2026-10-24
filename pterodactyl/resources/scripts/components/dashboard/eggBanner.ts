import minecraftBanner from '@/assets/images/banners/minecraft.png';
import lavalinkBanner from '@/assets/images/banners/lavalink.png';
import mongoDbBanner from '@/assets/images/banners/mongodb.png';
import nodeJsBanner from '@/assets/images/banners/nodejs.jpg';
import pythonBanner from '@/assets/images/banners/python.png';
import websiteBanner from '@/assets/images/banners/website.png';

type BannerServer = {
    eggImage?: string | null;
    eggName?: string | null;
    dockerImage?: string | null;
};

const bundledBanner = (name: string): string | undefined => {
    if (/minecraft|paper|purpur|spigot|forge|fabric|bedrock/.test(name)) return minecraftBanner;
    if (/lavalink/.test(name)) return lavalinkBanner;
    if (/python|pycord|discord\.py/.test(name)) return pythonBanner;
    if (/mongo/.test(name)) return mongoDbBanner;
    if (/node(?:\.js|js)?|npm|yarn|bun/.test(name)) return nodeJsBanner;
    if (/website|webserver|nginx|apache|caddy|php|wordpress|html/.test(name)) return websiteBanner;

    return undefined;
};

/**
 * Known runtimes use webpack-emitted local assets, avoiding database image URLs
 * and web-server static path rules. A custom egg image remains a fallback for
 * unsupported runtimes.
 */
export const getEggBanner = ({ eggImage, eggName, dockerImage }: BannerServer): string => {
    const bundled = bundledBanner(`${eggName || ''} ${dockerImage || ''}`.toLowerCase());

    return bundled || eggImage?.trim() || minecraftBanner;
};