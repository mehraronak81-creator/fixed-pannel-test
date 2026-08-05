// Curated, user-friendly definitions for the most common Minecraft server.properties
// keys. Anything not listed here is preserved verbatim on save so we never clobber
// an operator's custom configuration.

export type SettingType = 'boolean' | 'select' | 'text' | 'number' | 'password';

export interface SettingDefinition {
    key: string;
    label: string;
    description: string;
    type: SettingType;
    // For 'select'
    options?: { value: string; label: string }[];
    // For 'number'
    min?: number;
    max?: number;
    default: string;
}

export interface SettingSection {
    title: string;
    settings: SettingDefinition[];
}

const bool = (
    key: string,
    label: string,
    description: string,
    def = 'false'
): SettingDefinition => ({ key, label, description, type: 'boolean', default: def });

export const SETTING_SECTIONS: SettingSection[] = [
    {
        title: 'Gameplay',
        settings: [
            {
                key: 'gamemode',
                label: 'Default gamemode',
                description: 'Mode applied to players when they first join.',
                type: 'select',
                default: 'survival',
                options: [
                    { value: 'survival', label: 'Survival' },
                    { value: 'creative', label: 'Creative' },
                    { value: 'adventure', label: 'Adventure' },
                    { value: 'spectator', label: 'Spectator' },
                ],
            },
            {
                key: 'difficulty',
                label: 'Difficulty',
                description: 'World difficulty for hostile mobs and hunger.',
                type: 'select',
                default: 'easy',
                options: [
                    { value: 'peaceful', label: 'Peaceful' },
                    { value: 'easy', label: 'Easy' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'hard', label: 'Hard' },
                ],
            },
            bool('hardcore', 'Hardcore mode', 'Players are banned on death and difficulty is locked to hard.'),
            bool('pvp', 'PvP', 'Allow players to deal damage to each other.', 'true'),
            bool('force-gamemode', 'Force gamemode', 'Force players into the default gamemode on every join.'),
            bool('allow-flight', 'Allow flight', 'Permit flight mods on survival (anti-cheat may kick otherwise).'),
        ],
    },
    {
        title: 'Access & security',
        settings: [
            bool('white-list', 'Whitelist', 'Only whitelisted players may join the server.'),
            bool('enforce-whitelist', 'Enforce whitelist', 'Kick non-whitelisted players immediately when the whitelist reloads.'),
            bool('online-mode', 'Online mode', 'Verify players against Mojang auth. Disable only for offline/cracked networks.', 'true'),
            bool('prevent-proxy-connections', 'Block proxy connections', 'Reject players connecting through a VPN/proxy as reported by Mojang.'),
            {
                key: 'max-players',
                label: 'Max players',
                description: 'Maximum simultaneous players allowed on the server.',
                type: 'number',
                min: 1,
                max: 2147483647,
                default: '20',
            },
            {
                key: 'spawn-protection',
                label: 'Spawn protection radius',
                description: 'Block radius around spawn that non-ops cannot edit (0 disables).',
                type: 'number',
                min: 0,
                max: 10000,
                default: '16',
            },
        ],
    },
    {
        title: 'World',
        settings: [
            bool('allow-nether', 'Allow Nether', 'Enable travel to the Nether dimension.', 'true'),
            bool('spawn-monsters', 'Spawn monsters', 'Allow hostile mobs to spawn.', 'true'),
            bool('spawn-npcs', 'Spawn NPCs', 'Allow villagers and other NPCs to spawn.', 'true'),
            bool('spawn-animals', 'Spawn animals', 'Allow passive animals to spawn.', 'true'),
            bool('generate-structures', 'Generate structures', 'Generate villages, temples, strongholds, etc.', 'true'),
            {
                key: 'level-type',
                label: 'Level type',
                description: 'World generation preset applied when the world is first created.',
                type: 'select',
                default: 'minecraft:normal',
                options: [
                    { value: 'minecraft:normal', label: 'Normal' },
                    { value: 'minecraft:flat', label: 'Flat' },
                    { value: 'minecraft:large_biomes', label: 'Large biomes' },
                    { value: 'minecraft:amplified', label: 'Amplified' },
                ],
            },
            {
                key: 'view-distance',
                label: 'View distance',
                description: 'Chunks sent to clients (higher is heavier on the server).',
                type: 'number',
                min: 3,
                max: 32,
                default: '10',
            },
            {
                key: 'simulation-distance',
                label: 'Simulation distance',
                description: 'Chunk radius the server actively ticks around each player.',
                type: 'number',
                min: 3,
                max: 32,
                default: '10',
            },
        ],
    },
    {
        title: 'Commands & server info',
        settings: [
            bool('enable-command-block', 'Command blocks', 'Allow command blocks to run in the world.'),
            {
                key: 'motd',
                label: 'MOTD',
                description: 'Message shown in the multiplayer server list.',
                type: 'text',
                default: 'A Minecraft Server',
            },
            bool('allow-cheats', 'Allow cheats', 'Some distributions read this to allow op-only commands.', 'false'),
        ],
    },
];

// Flat lookup of every managed key -> definition.
export const MANAGED_SETTINGS: Record<string, SettingDefinition> = SETTING_SECTIONS.reduce(
    (acc, section) => {
        section.settings.forEach((setting) => {
            acc[setting.key] = setting;
        });
        return acc;
    },
    {} as Record<string, SettingDefinition>
);
