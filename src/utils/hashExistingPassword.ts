import prisma from "../config/prisma";
import { hashPassword } from "./password";

async function hashExistingPasswords() {
    try {
        const users = await prisma.user.findMany();

        for (const user of users) {
            if (user.password && !user.password.startsWith('$2')) {
                console.log(`Hashing password for user: ${user.email}`);
                const hashedPassword = await hashPassword(user.password);

                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                });

                console.log(`Updated password for ${user.email}`);
            } else {
                console.log(`Password already hashed for ${user.email}`)
            }
        }

        console.log('\nAll passwords have been hashed successfully')
    } catch (error) {
        console.log('Error hashing passwords:', error);
    } finally {
        await prisma.$disconnect();
    }
}

hashExistingPasswords();