import { cloneElement } from 'react'

const Split = ({ children, content, ...rest }) => {
    return (
        <div className="grid lg:grid-cols-2 min-h-screen bg-white">
            {/* Left Side – Image + Stats */}
            <div className="relative flex flex-col justify-center items-center overflow-hidden">
                {/* Logo - positioned at top left */}
                <div className="absolute top-8 left-13 z-10">
                    <img
                        src="/img/others/auth-logo.png"
                        alt="KIREIZ FORM"
                        className="h-10 w-auto"
                    />
                </div>

                {/* Uniform Image */}
                <img
                    src="/img/others/Illustration.png"
                    alt="Uniform"
                    className="h-full w-auto object-contain"
                />
            </div>

            {/* Right Side – Login Section */}
            <div className="flex flex-col justify-center items-start px-8">
                <div className="w-full max-w-sm">
                    <div className="mb-8">{content}</div>
                    {children ? cloneElement(children, { ...rest }) : null}
                </div>
            </div>
        </div>
    )
}

export default Split
