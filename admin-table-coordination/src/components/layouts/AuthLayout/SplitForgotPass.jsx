// import { cloneElement } from "react";
// import { useRouter } from "next/navigation";
// const SplitForgotPassword = ({ children, content, ...rest }) => {
//   const router = useRouter();
//   const handleRedirectHome = () => {
//     router.push("/kireiz-form");
//     //router.push("/medical-form");
//   };
//   return (
//     <div className="flex flex-col lg:flex-row bg-gray h-full">
//       {/* LEFT SIDE */}
//       <div className="relative flex justify-center items-center w-full lg:w-[60%] bg-gray h-full">
//         {/* Logo */}
//         <div className="absolute top-6 left-21 z-20">
//           <img
//             src="/img/others/auth-logo.png"
//             alt="KIREIZ FORM"
//             className="md:h-12 h-10 w-auto cursor-pointer"
//             onClick={handleRedirectHome}
//           />
//         </div>
//         {/* Image container (push image down so it never overlaps logo) */}
//         <div className="flex-1 flex justify-center items-center z-0 mt-16">
//           <img
//             src="/img/others/new-auth-imgone.png"
//             //src="/img/others/table-image1.png"
//             className="object-contain object-center h-full max-h-[75vh] w-full"
//           />
//         </div>
//       </div>
//       {/* RIGHT SIDE */}
//       <div className="flex flex-col justify-center px-2 w-full lg:w-[40%] overflow-auto bg-white">
//         <div className="w-full max-w-2xl mx-auto">
//           <div className="mb-8">{content}</div>
//           {children ? cloneElement(children, { ...rest }) : null}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SplitForgotPassword;

import { cloneElement } from "react";
import { useRouter } from "next/navigation";

const SplitForgotPassword = ({ children, content, ...rest }) => {
  const router = useRouter();

  const handleRedirectHome = () => {
    router.push("/kireiz-form");
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray min-h-screen">
      {/* LEFT SIDE */}
      <div
        className="
          relative flex justify-center items-center
          w-full lg:w-[60%]
          bg-gray
          min-h-[40vh] lg:min-h-screen
        "
      >
        {/* Logo */}
        <div className="absolute top-[5%] left-[5%] z-20">
          <img
            // src="/img/others/auth-logo-small.png"
            src="/img/logo/sidebar-logo.png"
            alt="KIREIZ FORM SPACE"
            className="md:h-12 h-10 w-auto cursor-pointer"
            onClick={handleRedirectHome}
          />
        </div>

        {/* Image container */}
        <div
          className="
            flex-1 flex justify-center items-center z-0 mt-16
            max-h-[35vh] md:max-h-[45vh] lg:max-h-none
          "
        >
          <img
            src="/img/admin/signin.png"
            alt="Forgot Password Illustration"
            className="
              object-contain object-center
              w-full h-full
              max-h-[35vh] md:max-h-[45vh] lg:max-h-[75vh]
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
          min-h-[60vh] lg:min-h-screen
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

export default SplitForgotPassword;
