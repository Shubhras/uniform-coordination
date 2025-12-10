import { cloneElement } from 'react'

const Split = ({ children, content, ...rest }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white overflow-hidden">
        {/* Left – 60% */}
        <div className="relative flex justify-center items-center w-full lg:w-[60%] bg-white overflow-hidden">

            {/* Logo */}
            <div className="absolute top-8 left-8 z-50">
                <img
                src="/img/others/auth-logo.png"
                alt="KIREIZ FORM"
                className="md:h-20 h-10 w-auto"
                />
            </div>

            {/* Graphic group container */}
            <div className="relative w-full h-full">
                {/* Left Column */}
                <img
                    src="/img/others/ColumnLeft.png"
                    alt="KIREIZ FORM"
                    className="absolute left-[5%] top-[20%] w-[20%] max-w-[260px]"
                />

                {/* Right Column */}
                <img
                    src="/img/others/ColumnRight.png"
                    alt="KIREIZ FORM"
                    className="absolute right-[8%] top-[40%] w-[18%] max-w-[200px] z-20"
                />

                {/* Center / Front */}
                <img
                    src="/img/others/Front.png"
                    alt="KIREIZ FORM"
                    className="absolute right-[25%] top-[32%] w-[30%] max-w-[350px] z-10"
                />

                {/* BG */}
                <img
                    src="/img/others/BgIllustration.png"
                    alt="KIREIZ FORM"
                    className="absolute bottom-[5%] right-[3%] w-[100%] max-w-4xl z-10"
                />
            </div>

            {/* Illustration */}
            {/* <div>
                <div className='absolute top-0 left-0 '>
                    <img
                    src="/img/others/IllustrationTop.png"
                    alt="Uniform"
                    className="object-contain w-auto h-[50%] "
                    />
                </div>
                <div className='absolute bottom-0 left-0'>
                    <img
                    src="/img/others/BgIllustration.png"
                    alt="Uniform"
                    className="object-contain w-full"
                    />
                </div>
            </div> */}

            {/* <div className='w-full h-screen'>
            <img
                src="/img/others/Illustration.png"
                alt="KIREIZ FORM"
                className="object-cover w-full max-h-screen" 
                />
            </div> */}
        </div>

        {/* Right – 40% */}
        <div className="flex flex-col justify-center px-2 w-full lg:w-[40%] overflow-auto bg-white">
            <div className="w-full max-w-2xl mx-auto">
            <div className="mb-8">{content}</div>
            {children ? cloneElement(children, { ...rest }) : null}
            </div>
        </div>
    </div>
  )
}

export default Split
