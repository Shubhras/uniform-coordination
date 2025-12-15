"use client";
import Alert from "@/components/ui/Alert";
import SignUpForm from "./SignUpForm";
import ActionLink from "@/components/shared/ActionLink";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import useTheme from "@/utils/hooks/useTheme";
import OauthSignIn from "../SignIn/OauthSignIn";

export const SignUp = ({ onSignUp, signInUrl = "/sign-in", onOauthSignIn }) => {
  const [message, setMessage] = useTimeOutMessage();

  const mode = useTheme((state) => state.mode);

  return (
    <>
      <div className="mx-4">
        <div className="mb-4">
          <h2 className="font-[Plus Jakarta Sans]  font-medium text-[24px] tracking-[0.18px] text-[#1C2C56] mb-1">
            Join KIREIZ Today!
          </h2>
          <p className="font-[Plus Jakarta Sans] font-medium text-sm  tracking-[0.15px] text-[#4C4E64AD]">
            Design Professional Uniforms & Beautiful Events
          </p>
        </div>
        {message && (
          <Alert showIcon className="mb-2" type="danger">
            <span className="break-all">{message}</span>
          </Alert>
        )}
        {message && (
          <Alert showIcon className="mb-2" type="danger">
            <span className="break-all">{message}</span>
          </Alert>
        )}
        <SignUpForm
          onSignUp={onSignUp}
          setMessage={setMessage}
          termConditionHint={
            <>
              <div className="mb-6 mt-0 flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary cursor-pointer"
                  />
                  <p>
                    I Agree to privacy
                    <span className="text-blue-400"> policy & terms</span>
                  </p>
                </label>
              </div>
            </>
          }
        />

        <div className="mt-2 text-center text-base">
          <span>Already have an account? </span>
          <ActionLink
            href={signInUrl}
            className="heading-text  text-blue-400"
            themeColor={false}
          >
            Sign in Instead
          </ActionLink>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-5 mb-2">
            <div className="border-t border-gray-200 dark:border-gray-800 flex-1 " />
            <p className="text-base">or</p>
            <div className="border-t border-gray-200 dark:border-gray-800 flex-1 " />
          </div>
          <OauthSignIn setMessage={setMessage} onOauthSignIn={onOauthSignIn} />
        </div>
      </div>
    </>
  );
};

export default SignUp;
