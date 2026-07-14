"use client";
import Alert from "@/components/ui/Alert";
import SignUpForm from "./SignUpForm";
import ActionLink from "@/components/shared/ActionLink";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import useTheme from "@/utils/hooks/useTheme";
import OauthSignIn from "../SignIn/OauthSignIn";
import SplitSignup from "@/components/layouts/AuthLayout/SplitSignup";

export const SignUp = ({ onSignUp, signInUrl = "/sign-in", onOauthSignIn }) => {
  const [message, setMessage] = useTimeOutMessage();
  const mode = useTheme((state) => state.mode);

  return (
    <>
      <SplitSignup>
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
                    <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-[#003562] checked:border-[#003562] cursor-pointer transition-all m-0"
                      />
                      <svg
                        className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p>
                      I Agree to privacy
                      <span className="text-[#87CEEB]"> policy & terms</span>
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
              className="heading-text  text-[#87CEEB]"
              themeColor={false}
            >
              Sign in Instead
            </ActionLink>
          </div>
          {/* <div className="mt-4">
            <div className="flex items-center gap-5 mb-2">
              <div className="border-t border-gray-200 dark:border-gray-800 flex-1 " />
              <p className="text-base">or</p>
              <div className="border-t border-gray-200 dark:border-gray-800 flex-1 " />
            </div>
            <OauthSignIn setMessage={setMessage} onOauthSignIn={onOauthSignIn} />
          </div> */}
        </div>
      </SplitSignup>
    </>
  );
};

export default SignUp;
