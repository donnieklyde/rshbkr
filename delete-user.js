
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'donnieklyde@gmail.com'
    console.log(`Attempting to delete user with email: ${email}...`)

    try {
        const user = await prisma.user.delete({
            where: { email: email },
        })
        console.log('Deleted user:', user)
    } catch (e) {
        if (e.code === 'P2025') {
            console.log('User not found (already deleted or never existed).')
        } else {
            console.error('Error deleting user:', e)
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()
