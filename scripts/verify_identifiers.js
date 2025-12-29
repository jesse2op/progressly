const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    let output = '';

    output += '--- USER IDENTIFIERS ---\n';
    const users = await prisma.user.findMany({
        select: { id: true, name: true, username: true, role: true }
    });
    users.forEach(u => output += `User: ${u.name} | Role: ${u.role} | Username: ${u.username || 'BLANK'}\n`);

    output += '\n--- COACH CODES ---\n';
    const coaches = await prisma.coachProfile.findMany({
        select: { userId: true, code: true }
    });
    coaches.forEach(c => output += `Coach UserID: ${c.userId} | Code: ${c.code || 'BLANK'}\n`);

    output += '\n--- CLIENT CODES ---\n';
    const clients = await prisma.clientProfile.findMany({
        select: { userId: true, code: true }
    });
    clients.forEach(c => output += `Client UserID: ${c.userId} | Code: ${c.code || 'BLANK'}\n`);

    fs.writeFileSync('verification_output.txt', output);
    console.log('Results written to verification_output.txt');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
