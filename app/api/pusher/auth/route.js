import { auth } from '@/lib/auth';
import db from '@/lib/db';
import pusher from '@/lib/pusher';
import { response } from '@/lib/api-helper';

// To validate private channel requests (Admin & Order)
export async function POST(request) {
    try {
        // General authentication
        const session = await auth()
        if (!session) return response({ error: "Unauthorized" }, 401)

        // Parse data from requests
        const data = await request.formData()
        const socketId = data.get('socket_id')
        const channelName = data.get('channel_name')

        if (!socketId || !channelName) return response({ error: "Missing socket_id or channel_name" })

        // 1. Authorize Admin Channel
        if (channelName === 'private-admin') {
            if (session.user.role !== 'ADMIN') return response({ error: 'Forbidden' }, 403)

            const authResponse = pusher.authorizeChannel(socketId, channelName)
            return response(authResponse)
        }

        // 2. Authorize Customer User Channel (private-user-{userId})
        if (channelName.startsWith('private-user-')) {
            const targetUserId = channelName.replace('private-user-', '')

            const isSelf = targetUserId === session.user.id
            const isAdmin = session.user.role === 'ADMIN'

            if (!isSelf && !isAdmin) return response({ error: 'Forbidden' }, 403)

            const authResponse = pusher.authorizeChannel(socketId, channelName)
            return response(authResponse)
        }

        // If channel name format is not supported
        return response({ error: 'Unsupported channel name' }, 400);

    } catch (error) {
        console.error('Pusher Auth Endpoint Error:', error)
        return response({ error: 'Internal Server Error' })
    }
}