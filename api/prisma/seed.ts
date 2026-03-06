import { PrismaClient, ItemRarity, ItemType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding IronCrown database...');

    // ── Admin Users ───────────────────────────────────────
    const superHash = await bcrypt.hash('superadmin123', 12);
    const adminHash = await bcrypt.hash('admin123456', 12);
    const modHash = await bcrypt.hash('moderator123', 12);

    const superadmin = await prisma.user.upsert({
        where: { email: 'superadmin@ironcrown.local' },
        update: {},
        create: { email: 'superadmin@ironcrown.local', username: 'SuperAdmin', passwordHash: superHash, role: 'SUPERADMIN' },
    });
    const admin = await prisma.user.upsert({
        where: { email: 'admin@ironcrown.local' },
        update: {},
        create: { email: 'admin@ironcrown.local', username: 'AdminUser', passwordHash: adminHash, role: 'ADMIN' },
    });
    const mod = await prisma.user.upsert({
        where: { email: 'mod@ironcrown.local' },
        update: {},
        create: { email: 'mod@ironcrown.local', username: 'ModUser', passwordHash: modHash, role: 'MODERATOR' },
    });

    console.log('✅ Users seeded:', superadmin.username, admin.username, mod.username);

    // ── Kingdoms ──────────────────────────────────────────
    const ironKeep = await prisma.kingdom.upsert({
        where: { id: 'kingdom-iron-keep' },
        update: {},
        create: {
            id: 'kingdom-iron-keep', name: 'Iron Keep', colorHex: '#D4AF37',
            description: 'The ancient warring kingdom of the north.',
            mapZone: { x: 100, y: 200, width: 400, height: 300 },
        },
    });
    const stonewall = await prisma.kingdom.upsert({
        where: { id: 'kingdom-stonewall' },
        update: {},
        create: {
            id: 'kingdom-stonewall', name: 'Stonewall', colorHex: '#8B9467',
            description: 'A fortified merchant kingdom with strong walls.',
            mapZone: { x: 600, y: 150, width: 350, height: 280 },
        },
    });
    const ashvale = await prisma.kingdom.upsert({
        where: { id: 'kingdom-ashvale' },
        update: {},
        create: {
            id: 'kingdom-ashvale', name: 'Ashvale', colorHex: '#C0392B',
            description: 'The scorched kingdom, known for its fierce warriors.',
            mapZone: { x: 300, y: 600, width: 420, height: 350 },
        },
    });

    console.log('✅ Kingdoms seeded');

    // ── Villages ──────────────────────────────────────────
    await prisma.village.upsert({
        where: { id: 'village-blackthorn' },
        update: {},
        create: {
            id: 'village-blackthorn', name: 'Blackthorn', kingdomId: ironKeep.id,
            mapZone: { x: 150, y: 250, width: 80, height: 80 }, population: 12,
        },
    });
    await prisma.village.upsert({
        where: { id: 'village-millcrest' },
        update: {},
        create: {
            id: 'village-millcrest', name: 'Millcrest', kingdomId: stonewall.id,
            mapZone: { x: 620, y: 200, width: 60, height: 60 }, population: 8,
        },
    });
    await prisma.village.upsert({
        where: { id: 'village-cinderfen' },
        update: {},
        create: {
            id: 'village-cinderfen', name: 'Cinderfen', kingdomId: ashvale.id,
            mapZone: { x: 330, y: 650, width: 70, height: 70 }, population: 15,
        },
    });

    console.log('✅ Villages seeded');

    // ── Demo Players ──────────────────────────────────────
    const player1 = await prisma.player.upsert({
        where: { steamId: '76561198000000001' },
        update: {},
        create: {
            steamId: '76561198000000001', playerName: 'KnightSlayer', isOnline: true,
            lastPositionX: 150, lastPositionY: 0, lastPositionZ: 260,
            kingdomId: ironKeep.id, villageId: 'village-blackthorn',
        },
    });
    const player2 = await prisma.player.upsert({
        where: { steamId: '76561198000000002' },
        update: {},
        create: {
            steamId: '76561198000000002', playerName: 'SilverArrow', isOnline: false,
            lastSeen: new Date(Date.now() - 3600_000),
            kingdomId: stonewall.id,
        },
    });
    const player3 = await prisma.player.upsert({
        where: { steamId: '76561198000000003' },
        update: {},
        create: {
            steamId: '76561198000000003', playerName: 'AshWarden', isOnline: true,
            lastPositionX: 340, lastPositionY: 0, lastPositionZ: 670,
            kingdomId: ashvale.id,
        },
    });

    console.log('✅ Players seeded');

    // ── Item Catalog ──────────────────────────────────────
    const itemCatalog = [
        { itemId: 363, guid: '0884db0bb5e04ab3bc0a15ba86f1498c', name: 'Eaglefire', rarity: 'RARE' as ItemRarity, type: 'WEAPON' as ItemType },
        { itemId: 4, guid: 'de37f92b9b6b4a7893c45d3b56e78901', name: 'Zubeknakov', rarity: 'UNCOMMON' as ItemRarity, type: 'WEAPON' as ItemType },
        { itemId: 17, guid: 'f9d39e84cded4bc0b7a8c12345678901', name: 'Schofield', rarity: 'COMMON' as ItemRarity, type: 'WEAPON' as ItemType },
        { itemId: 16, guid: 'a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d', name: 'Military Knife', rarity: 'COMMON' as ItemRarity, type: 'WEAPON' as ItemType },
        { itemId: 1, guid: 'b1c2d3e4f5061a2b3c4d5e6f7a8b9c0d', name: 'Maple Syrup', rarity: 'COMMON' as ItemRarity, type: 'FOOD' as ItemType },
        { itemId: 13, guid: 'c2d3e4f5a6071b2c3d4e5f6a7b8c9d0e', name: 'Canned Beans', rarity: 'COMMON' as ItemRarity, type: 'FOOD' as ItemType },
        { itemId: 23, guid: 'd3e4f5a6b7081c2d3e4f5a6b7c8d9e0f', name: 'Medkit', rarity: 'UNCOMMON' as ItemRarity, type: 'MEDICAL' as ItemType },
        { itemId: 15, guid: 'e4f5a6b7c8091d2e3f4a5b6c7d8e9f0a', name: 'Bandage', rarity: 'COMMON' as ItemRarity, type: 'MEDICAL' as ItemType },
        { itemId: 253, guid: 'f5a6b7c8d90a1e2f3a4b5c6d7e8f9a0b', name: 'Police Vest', rarity: 'UNCOMMON' as ItemRarity, type: 'CLOTHING' as ItemType },
        { itemId: 277, guid: 'a6b7c8d9e0ab1f2a3b4c5d6e7f8a9b0c', name: 'Ghillie Top', rarity: 'RARE' as ItemRarity, type: 'CLOTHING' as ItemType },
        { itemId: 330, guid: 'b7c8d9e0f1bc2a3b4c5d6e7f8a9b0c1d', name: 'Military Backpack', rarity: 'EPIC' as ItemRarity, type: 'CLOTHING' as ItemType },
        { itemId: 469, guid: 'c8d9e0f1a2cd3b4c5d6e7f8a9b0c1d2e', name: 'Teleporter', rarity: 'LEGENDARY' as ItemRarity, type: 'MISC' as ItemType },
    ];

    for (const item of itemCatalog) {
        await prisma.itemCatalog.upsert({
            where: { itemId: item.itemId },
            update: item,
            create: item,
        });
    }

    console.log('✅ Item catalog seeded:', itemCatalog.length, 'items');

    // ── Demo Wars ─────────────────────────────────────────
    const war = await prisma.war.upsert({
        where: { id: 'war-great-iron-conflict' },
        update: {},
        create: {
            id: 'war-great-iron-conflict',
            name: 'The Great Iron Conflict',
            description: 'Iron Keep vs Ashvale — battle for the Eastern Plains',
            status: 'ACTIVE',
            startTime: new Date(Date.now() - 7200_000),
            zone: { x: 250, y: 400, radius: 300 },
            sides: {
                create: [
                    { name: 'Iron Keep Forces', kingdomId: ironKeep.id },
                    { name: 'Ashvale Raiders', kingdomId: ashvale.id },
                ],
            },
        },
        include: { sides: true },
    });

    await prisma.war.upsert({
        where: { id: 'war-merchant-dispute' },
        update: {},
        create: {
            id: 'war-merchant-dispute',
            name: 'Merchant Dispute of Millcrest',
            description: 'Stonewall vs Iron Keep trade route conflict',
            status: 'PENDING',
            sides: {
                create: [
                    { name: 'Stonewall Merchants', kingdomId: stonewall.id },
                    { name: 'Iron Keep Guard', kingdomId: ironKeep.id },
                ],
            },
        },
    });

    console.log('✅ Wars seeded');

    // ── Demo Punishments ──────────────────────────────────
    await prisma.punishment.create({
        data: {
            playerId: player2.id, adminId: admin.id, type: 'WARN',
            reason: 'Inappropriate roleplay behavior', isActive: true,
        },
    });
    await prisma.punishment.create({
        data: {
            playerId: player1.id, adminId: superadmin.id, type: 'TEMP_BAN',
            reason: 'RDM (Random Deathmatch) 3 times in 1 hour',
            expiresAt: new Date(Date.now() + 24 * 3600_000),
            isActive: false,
            unbannedById: superadmin.id,
            unbannedAt: new Date(Date.now() - 3600_000),
        },
    });

    console.log('✅ Punishments seeded');

    // ── Demo Inventory Snapshot ───────────────────────────
    await prisma.playerInventorySnapshot.create({
        data: {
            playerId: player1.id,
            isLatest: true,
            items: {
                create: [
                    { itemId: 363, amount: 1, durability: 87, quality: 100, container: 'primary', gridX: 0, gridY: 0 },
                    { itemId: 16, amount: 1, durability: 100, quality: 100, container: 'hotbar', gridX: 0, gridY: 0 },
                    { itemId: 23, amount: 2, durability: 100, quality: 100, container: 'backpack', gridX: 2, gridY: 0 },
                    { itemId: 15, amount: 5, durability: 100, quality: 100, container: 'backpack', gridX: 0, gridY: 0 },
                    { itemId: 253, amount: 1, durability: 95, quality: 100, container: 'clothing', gridX: 0, gridY: 0 },
                    { itemId: 330, amount: 1, durability: 100, quality: 100, container: 'clothing', gridX: 0, gridY: 1 },
                ],
            },
        },
    });

    console.log('✅ Inventory snapshot seeded');

    // ── Demo Admin Action Logs ────────────────────────────
    await prisma.adminActionLog.createMany({
        data: [
            { adminId: admin.id, adminName: 'AdminUser', playerId: player2.id, playerName: 'SilverArrow', actionType: 'warn', actionData: { reason: 'Inappropriate roleplay behavior' }, result: 'success' },
            { adminId: superadmin.id, adminName: 'SuperAdmin', playerId: player1.id, playerName: 'KnightSlayer', actionType: 'temp_ban', actionData: { reason: 'RDM x3', duration: 1440 }, result: 'success' },
            { adminId: superadmin.id, adminName: 'SuperAdmin', playerId: player1.id, playerName: 'KnightSlayer', actionType: 'unban', actionData: {}, result: 'success' },
            { adminId: admin.id, adminName: 'AdminUser', playerId: player3.id, playerName: 'AshWarden', actionType: 'give_item', actionData: { itemId: 23, amount: 3, quality: 100 }, result: 'pending' },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Action logs seeded');

    // ── Plugin Event Logs ─────────────────────────────────
    await prisma.pluginEventLog.createMany({
        data: [
            { eventType: 'PLAYER_JOIN', steamId: player1.steamId, playerName: 'KnightSlayer' },
            { eventType: 'PLAYER_JOIN', steamId: player3.steamId, playerName: 'AshWarden' },
            { eventType: 'PLAYER_DEATH', steamId: player2.steamId, playerName: 'SilverArrow', metadata: { killer: 'KnightSlayer', weapon: 'Eaglefire' } },
            { eventType: 'ITEM_PICKUP', steamId: player1.steamId, playerName: 'KnightSlayer', metadata: { itemId: 363, itemName: 'Eaglefire' } },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Event logs seeded');

    // ── War participants ──────────────────────────────────
    if (war.sides.length >= 2) {
        await prisma.warParticipant.upsert({
            where: { warSideId_playerId: { warSideId: war.sides[0].id, playerId: player1.id } },
            update: {},
            create: { warSideId: war.sides[0].id, playerId: player1.id, role: 'captain' },
        });
        await prisma.warParticipant.upsert({
            where: { warSideId_playerId: { warSideId: war.sides[1].id, playerId: player3.id } },
            update: {},
            create: { warSideId: war.sides[1].id, playerId: player3.id, role: 'soldier' },
        });
    }

    console.log('✅ War participants seeded');
    console.log('\n🏰 IronCrown seed complete!');
    console.log('📋 Demo logins:');
    console.log('   superadmin@ironcrown.local / superadmin123 (SUPERADMIN)');
    console.log('   admin@ironcrown.local / admin123456 (ADMIN)');
    console.log('   mod@ironcrown.local / moderator123 (MODERATOR)');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
