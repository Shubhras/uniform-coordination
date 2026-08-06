'use client'

import Image from 'next/image'

/**
 * ChatbotSection Component.
 * Displays a fixed/floating AI assistant widget banner prompt.
 *
 * @returns {JSX.Element} Chatbot callout section UI component.
 */
const ChatbotSection = () => {
    return (
        <section className="w-full bg-white  sm:px-6 md:px-8 ">
            <div className=" mx-auto flex justify-end px-4">
                <div className="relative flex items-center gap-6">
                    <div className="relative bg-white px-8 py-4 rounded-xl shadow-lg max-w-lg">
                        <p className="text-[#1C2C56] text-lg ">
                            Need help with designs or orders? Ask me anything!
                        </p>
                        <div
                            className="
                                absolute
                                right-1
                                bottom-[-8px]
                                w-0 h-0
                                border-l-[12px] border-r-[12px] border-t-[12px]
                                border-l-transparent border-r-transparent border-t-white
                            "/>
                    </div>
                    <div className="relative w-[100px] h-[100px]">
                        <Image
                            src="/img/logo/chatbot.png"
                            alt="Chatbot"
                            fill
                            className="object-contain h-full w-full "
                        />
                    </div>
                </div>
            </div>
        </section >
    )
}

export default ChatbotSection
