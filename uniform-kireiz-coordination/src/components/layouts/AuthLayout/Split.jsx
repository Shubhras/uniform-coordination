import { cloneElement } from "react";

const Split = ({ children, content, ...rest }) => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray h-full">
      {/* LEFT SIDE */}
      <div className="relative flex justify-center items-center w-full lg:w-[60%] bg-gray h-full">
        {/* Logo */}
        <div className="absolute top-6 left-10 z-20">
          <img
            src="/img/others/auth-logo.png"
            alt="KIREIZ FORM"
            className="md:h-12 h-10 w-auto"
          />
        </div>

        {/* Image container (push image down so it never overlaps logo) */}
        <div className="flex-1 flex justify-center items-center z-0 pt-20">
          <img
            src="/img/others/uniform-signup-auth.png"
            className="object-contain object-center max-h-[80vh] w-full"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center px-2 w-full lg:w-[40%] overflow-auto bg-white">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8">{content}</div>
          {children ? cloneElement(children, { ...rest }) : null}
        </div>
      </div>
    </div>
  );
};

export default Split;
