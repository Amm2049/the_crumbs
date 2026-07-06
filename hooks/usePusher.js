'use client'

import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'

let pusherInstance = null

function getPusherClient() {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
        console.warn('Pusher keys are missing in environment variables.');
        return null
    }

    if (!pusherInstance) {
        pusherInstance = new Pusher(key, {
            cluster,
            channelAuthorization: {
                endpoint: '/api/pusher/auth',
                transport: 'ajax'
            },
        })
    }

    return pusherInstance
}

export function usePusher() {
    const client = getPusherClient()
    const [connectionState, setConnectionState] = useState(() => 
        client ? client.connection.state : 'disconnected'
    )

    useEffect(() => {
        if (!client) return

        const handleStateChange = (states) => {
            setConnectionState(states.current)
        }

        client.connection.bind('state_change', handleStateChange)

        return () => {
            if (client) {
                client.connection.unbind('state_change', handleStateChange)
            }
        }
    }, [client])

    return { client, connectionState }
}