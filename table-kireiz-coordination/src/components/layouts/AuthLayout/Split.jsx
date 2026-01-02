import { cloneElement } from "react";
import Link from "next/link";

const Split = ({ children, content, ...rest }) => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray min-h-[100svh]">

      {/* LEFT SIDE */}
      <div
        className="
          relative flex justify-center items-center
          w-full lg:w-[60%]
          bg-gray
          min-h-[35vh] sm:min-h-[40vh] lg:min-h-[100svh]
        "
      >
        {/* Logo */}
        <div className="absolute top-[5%] left-[5%] z-20">
          <Link href="/table-form">
            <img
              src="/img/others/auth-logo.png"
              alt="KIREIZ FORM"
              className="md:h-12 h-10 w-auto"
            />
          </Link>
        </div>

        {/* Image */}
        <div
          className="
            flex-1 flex justify-center items-center z-0
            mt-16
            max-h-[35vh] md:max-h-[45vh] lg:max-h-none
          "
        >
          <img
            src="/img/others/table-image1.png"
            alt="Auth Image"
            className="
              object-contain object-center
              w-full h-full
              max-h-[30vh] sm:max-h-[35vh] md:max-h-[45vh] lg:max-h-[75vh]
            "
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="
          flex flex-col justify-center
          px-2 w-full lg:w-[40%]
          bg-white
          overflow-visible lg:overflow-auto
          flex-1 lg:min-h-screen
        "
      >
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8">{content}</div>
          {children ? cloneElement(children, { ...rest }) : null}
        </div>
      </div>
    </div>
  );
};

export default Split;
