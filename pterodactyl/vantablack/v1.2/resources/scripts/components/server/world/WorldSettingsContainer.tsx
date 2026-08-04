import React, { useCallback, useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useFlashKey } from '@/plugins/useFlash';
import http from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { GlobeAltIcon, LightningBoltIcon, ShieldCheckIcon, CogIcon, SparklesIcon, LockClosedIcon } from '@heroicons/react/outline';
import styles from './style.module.css';

interface ServerProperties {
    [key: string]: string;
}

const WORLD_PROPERTIES: { key: string; label: string; desc: string; type: 'toggle' | 'select' | 'text' | 'number'; options?: string[] }[] = [
    { key: 'difficulty', label: 'Difficulty', desc: 'Server difficulty level', type: 'select', options: ['peaceful', 'easy', 'normal', 'hard'] },
    { key: 'gamemode', label: 'Default Gamemode', desc: 'Default player gamemode', type: 'select', options: ['survival', 'creative', 'adventure', 'spectator'] },
    { key: 'pvp', label: 'PvP', desc: 'Enable player vs player combat', type: 'toggle' },
    { key: 'max-players', label: 'Max Players', desc: 'Maximum players allowed', type: 'number' },
    { key: 'view-distance', label: 'View Distance', desc: 'Render distance in chunks', type: 'number' },
    { key: 'spawn-monsters', label: 'Spawn Monsters', desc: 'Allow hostile mobs to spawn', type: 'toggle' },
    { key: 'spawn-animals', label: 'Spawn Animals', desc: 'Allow passive mobs to spawn', type: 'toggle' },
    { key: 'spawn-npcs', label: 'Spawn NPCs', desc: 'Allow NPC villagers to spawn', type: 'toggle' },
    { key: 'allow-flight', label: 'Allow Flight', desc: 'Allow players to fly in survival', type: 'toggle' },
    { key: 'allow-nether', label: 'Allow Nether', desc: 'Enable the Nether dimension', type: 'toggle' },
    { key: 'enable-command-block', label: 'Command Blocks', desc: 'Allow command blocks to execute', type: 'toggle' },
    { key: 'force-gamemode', label: 'Force Gamemode', desc: 'Force default gamemode on join', type: 'toggle' },
    { key: 'hardcore', label: 'Hardcore Mode', desc: 'Players get banned on death', type: 'toggle' },
    { key: 'motd', label: 'Server MOTD', desc: 'Message displayed in server list', type: 'text' },
    { key: 'level-seed', label: 'World Seed', desc: 'Seed for world generation', type: 'text' },
    { key: 'level-type', label: 'World Type', desc: 'World generation type', type: 'select', options: ['default', 'flat', 'largeBiomes', 'amplified'] },
    { key: 'online-mode', label: 'Online Mode', desc: 'Authenticate players with Mojang', type: 'toggle' },
    { key: 'white-list', label: 'Whitelist', desc: 'Only allow whitelisted players', type: 'toggle' },
];

const CRACK_PROPERTIES: { key: string; label: string; desc: string; type: 'toggle' | 'text'; dangerous?: boolean }[] = [
    { key: 'online-mode', label: 'Crack Mode (Offline)', desc: 'Disable Mojang authentication — allows cracked clients to join. WARNING: This disables all account verification.', type: 'toggle', dangerous: true },
    { key: 'enforce-secure-profile', label: 'Enforce Secure Profile', desc: 'Require signed chat — disable for crack compatibility', type: 'toggle' },
    { key: 'prevent-proxy-connections', label: 'Prevent Proxy Connections', desc: 'Block VPN/proxy connections', type: 'toggle' },
];

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const serverName = ServerContext.useStoreState((state) => state.server.data!.name);
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlashKey('world-settings');
    const [properties, setProperties] = useState<ServerProperties>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'world' | 'crack' | 'performance'>('world');

    const loadProperties = useCallback(async () => {
        clearFlashes();
        setLoading(true);
        try {
            const { data } = await http.get(`/api/client/servers/${uuid}/files/contents`, {
                params: { file: '/server.properties' },
            });

            const props: ServerProperties = {};
            String(data).split('\n').forEach((line: string) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx === -1) return;
                props[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
            });
            setProperties(props);
        } catch (error) {
            clearAndAddHttpError(error instanceof Error ? error : null);
        } finally {
            setLoading(false);
        }
    }, [uuid, clearFlashes, clearAndAddHttpError]);

    useEffect(() => {
        void loadProperties();
    }, [loadProperties]);

    const saveProperties = async () => {
        clearFlashes();
        setSaving(true);
        try {
            const content = Object.entries(properties)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');

            await http.post(`/api/client/servers/${uuid}/files/write`, content, {
                params: { file: '/server.properties' },
                headers: { 'Content-Type': 'text/plain' },
            });

            addFlash({
                key: 'world-settings',
                type: 'success',
                title: 'Settings saved',
                message: 'Server properties updated. Restart the server for changes to take effect.',
            });
        } catch (error) {
            clearAndAddHttpError(error instanceof Error ? error : null);
        } finally {
            setSaving(false);
        }
    };

    const updateProp = (key: string, value: string) => {
        setProperties((prev) => ({ ...prev, [key]: value }));
    };

    const toggleProp = (key: string) => {
        setProperties((prev) => ({
            ...prev,
            [key]: prev[key] === 'true' ? 'false' : 'true',
        }));
    };

    const renderProperty = (prop: typeof WORLD_PROPERTIES[0]) => {
        const value = properties[prop.key] ?? '';

        return (
            <div className={styles.settingCard} key={prop.key}>
                <div className={styles.settingInfo}>
                    <h4>{prop.label}</h4>
                    <p>{prop.desc}</p>
                </div>
                <div className={styles.settingControl}>
                    {prop.type === 'toggle' && (
                        <button
                            type={'button'}
                            className={`${styles.toggleSwitch} ${value === 'true' ? styles.toggleOn : ''}`}
                            onClick={() => toggleProp(prop.key)}
                        >
                            <span className={styles.toggleKnob} />
                        </button>
                    )}
                    {prop.type === 'select' && (
                        <select
                            value={value}
                            onChange={(e) => updateProp(prop.key, e.target.value)}
                            className={styles.settingSelect}
                        >
                            {prop.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                    {prop.type === 'text' && (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(e) => updateProp(prop.key, e.target.value)}
                            className={styles.settingInput}
                            placeholder={`Enter ${prop.label.toLowerCase()}`}
                        />
                    )}
                    {prop.type === 'number' && (
                        <input
                            type={'number'}
                            value={value}
                            onChange={(e) => updateProp(prop.key, e.target.value)}
                            className={styles.settingInput}
                            min={0}
                        />
                    )}
                </div>
            </div>
        );
    };

    const renderCrackProperty = (prop: typeof CRACK_PROPERTIES[0]) => {
        const value = properties[prop.key] ?? '';
        const isCrackToggle = prop.key === 'online-mode';
        const isEnabled = isCrackToggle ? value === 'false' : value === 'true';

        return (
            <div className={`${styles.settingCard} ${prop.dangerous ? styles.dangerCard : ''}`} key={prop.key}>
                <div className={styles.settingInfo}>
                    <h4>
                        {prop.dangerous && <LockClosedIcon className={'w-4 h-4 inline mr-1.5 text-red-400'} />}
                        {prop.label}
                    </h4>
                    <p>{prop.desc}</p>
                </div>
                <div className={styles.settingControl}>
                    <button
                        type={'button'}
                        className={`${styles.toggleSwitch} ${isEnabled ? (prop.dangerous ? styles.toggleDanger : styles.toggleOn) : ''}`}
                        onClick={() => {
                            if (isCrackToggle) {
                                updateProp(prop.key, value === 'true' ? 'false' : 'true');
                            } else {
                                toggleProp(prop.key);
                            }
                        }}
                    >
                        <span className={styles.toggleKnob} />
                    </button>
                </div>
            </div>
        );
    };

    const PERF_PROPERTIES: typeof WORLD_PROPERTIES = [
        { key: 'view-distance', label: 'View Distance', desc: 'Lower = better TPS (recommended: 8-10)', type: 'number' },
        { key: 'simulation-distance', label: 'Simulation Distance', desc: 'Entity processing range (recommended: 6-8)', type: 'number' },
        { key: 'max-tick-time', label: 'Max Tick Time (ms)', desc: 'Crash watchdog timeout (-1 to disable)', type: 'number' },
        { key: 'network-compression-threshold', label: 'Network Compression', desc: 'Packet compression threshold in bytes', type: 'number' },
        { key: 'entity-broadcast-range-percentage', label: 'Entity Broadcast Range %', desc: 'Reduce to lower bandwidth (default: 100)', type: 'number' },
        { key: 'rate-limit', label: 'Rate Limit', desc: 'Max packets per second per player (0 = off)', type: 'number' },
    ];

    return (
        <ServerContentBlock title={'World Settings'} icon={GlobeAltIcon}>
            <FlashMessageRender byKey={'world-settings'} css={tw`mb-4`} />

            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>
                        <SparklesIcon className={'w-3.5 h-3.5'} /> World Manager
                    </span>
                    <h2>Server Configuration</h2>
                    <p>Manage world settings, crack mode, and performance tuning for <strong>{serverName}</strong></p>
                </div>
                <div className={styles.heroActions}>
                    <Button type={'button'} onClick={saveProperties} disabled={saving || loading}>
                        {saving ? 'Saving…' : 'Save All Changes'}
                    </Button>
                    <Button.Text variant={Button.Variants.Secondary} onClick={loadProperties} disabled={loading}>
                        Reload
                    </Button.Text>
                </div>
            </div>

            <div className={styles.tabBar}>
                <button
                    type={'button'}
                    className={`${styles.tab} ${activeTab === 'world' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('world')}
                >
                    <GlobeAltIcon className={'w-4 h-4'} /> World
                </button>
                <button
                    type={'button'}
                    className={`${styles.tab} ${activeTab === 'crack' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('crack')}
                >
                    <LockClosedIcon className={'w-4 h-4'} /> Crack Mode
                </button>
                <button
                    type={'button'}
                    className={`${styles.tab} ${activeTab === 'performance' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('performance')}
                >
                    <LightningBoltIcon className={'w-4 h-4'} /> Performance
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p>Loading server.properties…</p>
                </div>
            ) : (
                <>
                    {activeTab === 'world' && (
                        <div className={styles.settingsGrid}>
                            {WORLD_PROPERTIES.map(renderProperty)}
                        </div>
                    )}

                    {activeTab === 'crack' && (
                        <div>
                            <div className={styles.warningBanner}>
                                <ShieldCheckIcon className={'w-5 h-5'} />
                                <div>
                                    <strong>Security Warning</strong>
                                    <p>Enabling crack mode disables Mojang authentication. Only use this if you know what you&apos;re doing. Your server will be vulnerable to impersonation attacks.</p>
                                </div>
                            </div>
                            <div className={styles.settingsGrid}>
                                {CRACK_PROPERTIES.map(renderCrackProperty)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className={styles.settingsGrid}>
                            {PERF_PROPERTIES.map(renderProperty)}
                        </div>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};
