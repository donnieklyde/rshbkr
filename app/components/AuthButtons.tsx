import { auth, signIn, signOut } from "@/auth"

export function SignIn() {
    return (
        <form
            action={async () => {
                "use server"
                await signIn("google")
            }}
        >
            <button type="submit" className="btn-primary">Sign in with Google</button>
        </form>
    )
}

export function SignOut() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <button type="submit" style={{ background: 'transparent', color: '#666', border: '1px solid #333', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Sign Out
            </button>
        </form>
    )
}
