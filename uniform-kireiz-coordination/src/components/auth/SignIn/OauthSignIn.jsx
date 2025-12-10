'use client'
import Button from '@/components/ui/Button'

const OauthSignIn = ({ onOauthSignIn, setMessage }) => {
    // const handleGoogleSignIn = async () => {
    //     onOauthSignIn?.({ type: 'google', setMessage })
    // }

    // const handleGithubSignIn = async () => {
    //     onOauthSignIn?.({ type: 'github', setMessage })
    // }


    const handleClick = (type) => {
        onOauthSignIn?.({ type, setMessage })
    }

    const providers = [
        { type: 'facebook', img: '/img/others/facebook.png' },
        { type: 'twitter',  img: '/img/others/twitter.png' },
        { type: 'github',   img: '/img/others/github.png' },
        { type: 'google',   img: '/img/others/google.png' },
    ]


    return (
        // <div className="flex items-center gap-2">
        //     <Button
        //         className="flex-1"
        //         type="button"
        //         onClick={handleGoogleSignIn}
        //     >
        //         <div className="flex items-center justify-center gap-2">
        //             <img
        //                 className="h-[25px] w-[25px]"
        //                 src="/img/others/google.png"
        //                 alt="Google sign in"
        //             />
        //             <span>Google</span>
        //         </div>
        //     </Button>
        //     <Button
        //         className="flex-1"
        //         type="button"
        //         onClick={handleGithubSignIn}
        //     >
        //         <div className="flex items-center justify-center gap-2">
        //             <img
        //                 className="h-[25px] w-[25px]"
        //                 src="/img/others/github.png"
        //                 alt="Google sign in"
        //             />
        //             <span>Github</span>
        //         </div>
        //     </Button>
        // </div>

        <div className="flex items-center justify-center">
            {providers.map(({ type, img }) => (
                <Button
                    key={type}
                    // className="flex-1"
                    type="button"
                    onClick={() => handleClick(type)}
                >
                    <div className="flex items-center justify-center">
                        <img
                            className="h-[20px] object-contain"
                            src={img}
                            alt={type}
                        />
                    </div>
                </Button>
            ))}
        </div>
    )
}

export default OauthSignIn
