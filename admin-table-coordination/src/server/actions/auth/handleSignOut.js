'use server'

import { signOut } from '@/auth'
import appConfig from '@/configs/app.config'

const handleSignOut = async () => {
    try {
        await signOut({ redirect: false })
    } catch (e) {
        // ignore
    }
    return { success: true, redirectUrl: appConfig.unAuthenticatedEntryPath }
}

export default handleSignOut
