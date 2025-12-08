import { cloneElement } from 'react'

const Split = ({ children, content, ...rest }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white overflow-hidden">

      {/* Left – 60% */}
      <div className="relative flex justify-center items-center w-full lg:w-[60%] bg-white">

        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <img
            src="/img/others/auth-logo.png"
            alt="KIREIZ FORM"
            className="h-10 w-auto"
          />
        </div>

        {/* Illustration */}
        <div>
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
          </div>
      </div>

      {/* Right – 40% */}
      <div className="flex flex-col justify-center px-8 w-full lg:w-[40%] overflow-auto bg-white">
        <div className="w-full max-w-xl mx-auto">
          <div className="mb-8">{content}</div>
          {children ? cloneElement(children, { ...rest }) : null}
        </div>
      </div>

    </div>
  )
}

export default Split
