import { useEffect, useState } from "react";

const SESSION_URL =
    "/api/sessions?items=profile.isAuthenticated,profile.firstName,profile.email,store.channel"

export function useSession() {
    const [session, setSession] = useState({
        isAuthenticated: false,
        nameExibition: undefined,
        email: undefined,
        channel: undefined,
    })

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(SESSION_URL)
                const data = await res.json()

                const email = data?.namespaces?.profile?.email?.value
                const firstName = data?.namespaces?.profile?.firstName?.value
                const channel = data?.namespaces?.store?.channel?.value

                if (!email) throw new Error("Usuário não logado")

                const nameExibition = firstName || email.split("@")[0]

                setSession({
                    isAuthenticated: true,
                    nameExibition,
                    email,
                    channel,
                })
            } catch (err) {
                setSession({
                    isAuthenticated: false,
                    nameExibition: undefined,
                    email: undefined,
                    channel: undefined,
                })
            }
        }

        fetchSession()
    }, [])

    return session
}
