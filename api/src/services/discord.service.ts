import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';

interface DiscordEmbed {
    title: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
    footer?: { text: string };
}

export async function sendDiscordWebhook(
    eventType: string,
    embed: DiscordEmbed,
): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return; // Discord not configured

    const payload = {
        embeds: [{ ...embed, timestamp: embed.timestamp ?? new Date().toISOString() }],
        username: '⚔️ IronCrown Admin',
    };

    // Log the attempt in DB
    const log = await prisma.discordWebhookLog.create({
        data: { eventType, payload, status: 'pending' },
    });

    try {
        await axios.post(webhookUrl, payload, { timeout: 5000 });
        await prisma.discordWebhookLog.update({
            where: { id: log.id },
            data: { status: 'sent', sentAt: new Date() },
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`[Discord] Webhook failed for ${eventType}: ${msg}`);
        await prisma.discordWebhookLog.update({
            where: { id: log.id },
            data: { status: 'failed', errorMsg: msg },
        });
    }
}

// ── Pre-built embed helpers ───────────────────────────

export const DISCORD_COLORS = {
    BAN: 0xc0392b,
    WARN: 0xe67e22,
    KICK: 0xf39c12,
    UNBAN: 0x27ae60,
    WAR: 0x8e44ad,
    INFO: 0x2c3e50,
};

export function buildPunishmentEmbed(
    type: string,
    adminName: string,
    playerName: string,
    reason: string,
): DiscordEmbed {
    const colorMap: Record<string, number> = {
        BAN: DISCORD_COLORS.BAN,
        TEMP_BAN: DISCORD_COLORS.BAN,
        KICK: DISCORD_COLORS.KICK,
        WARN: DISCORD_COLORS.WARN,
    };
    return {
        title: `⚔️ ${type} — ${playerName}`,
        color: colorMap[type] ?? DISCORD_COLORS.INFO,
        fields: [
            { name: 'Admin', value: adminName, inline: true },
            { name: 'Player', value: playerName, inline: true },
            { name: 'Reason', value: reason },
        ],
        footer: { text: 'IronCrown Admin System' },
    };
}

export function buildWarEmbed(warName: string, status: string): DiscordEmbed {
    return {
        title: `⚔️ War — ${warName}`,
        description: `Status changed to **${status}**`,
        color: DISCORD_COLORS.WAR,
        footer: { text: 'IronCrown Admin System' },
    };
}
