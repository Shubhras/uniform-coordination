'use client'

import Image from 'next/image'

/**
 * ChatbotSection - Floating AI assistant prompt widget.
 */
const ChatbotSection = () => {
    return (
        <section className="w-full bg-white mx-auto px-5 md:px-8 lg:px-12 py-5">
            <div className="mx-auto flex justify-end px-4">
                {/* Chat Container */}
                <div className="relative flex items-center gap-6">

                    {/* Message Bubble */}
                    <div className="relative bg-white px-8 py-4 rounded-xl shadow-lg max-w-lg">
                        <p className="text-[#1C2C56] md:text-lg text-base">
                            Need help with designs or orders? Ask me anything!
                        </p>

                        {/* Speech Bubble Tail */}
                        <div
                            className="
                                absolute
                                right-1
                                bottom-[-8px]
                                w-0 h-0
                                border-l-[12px] border-r-[12px] border-t-[12px]
                                border-l-transparent border-r-transparent border-t-white
                            "
                        />
                    </div>

                    {/* Chatbot Avatar */}
                    <div className="relative w-[100px] h-[100px]">
                        <Image
                            src="/img/table-form/table-chatbot.png"
                            alt="Chatbot"
                            fill
                            className="object-contain h-full w-full"
                        />
                    </div>

                </div>
            </div>
        </section>
    )
}

export default ChatbotSection

