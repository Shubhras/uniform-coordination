'use client';

import { useState, useEffect } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FormItem } from '@/components/ui/Form';
import { toast } from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { FiMail, FiSend, FiX } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { apiContactSupport } from '@/services/SupportService';

const ComposeEmailModal = ({
    isOpen,
    onClose,
    recipientEmail = 'support@kireiz.jp',
    recipientName = 'Support Team',
    initialSubject = '',
}) => {
    const { data: session } = useSession();
    const accessToken = session?.accessToken || session?.user?.accessToken;

    const [toEmail, setToEmail] = useState('support@kireiz.jp');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setToEmail(recipientEmail || 'support@kireiz.jp');
            setSubject(initialSubject || '');
            setMessage('');
            setError('');
        }
    }, [isOpen, recipientEmail, initialSubject]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!toEmail.trim()) {
            setError('Recipient email is required.');
            return;
        }

        if (!subject.trim()) {
            setError('Subject is required.');
            return;
        }

        if (!message.trim()) {
            setError('Message body cannot be empty.');
            return;
        }

        setSending(true);

        try {
            const response = await apiContactSupport(
                {
                    to_email: toEmail.trim(),
                    subject: subject.trim(),
                    message: message.trim(),
                    from_email: session?.user?.email || '',
                },
                accessToken,
            );

            if (response && response.status === false) {
                setError(response.message || 'Failed to send email.');
                return;
            }

            toast.push(
                <Notification title="Email Sent" type="success">
                    {response?.message || `Your email was sent to ${toEmail} successfully.`}
                </Notification>,
            );

            onClose();
        } catch (err) {
            console.error('Send email error:', err);
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    'Failed to send email. Please try again.',
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={560}
            className="w-full md:min-w-[560px] mx-auto"
        >
            <form onSubmit={handleSend} className="flex flex-col bg-white rounded-2xl overflow-hidden">
                {/* Header matching Screenshot 3 */}
                <div className="border-b border-[#F1F5F9] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1C4FA8] flex items-center justify-center shrink-0">
                            <FiMail size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-[#1C2C56]">
                                Compose Email
                            </h3>
                            <p className="text-xs text-[#64748B]">
                                To: {recipientName ? `${recipientName} (${toEmail})` : toEmail}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                        title="Close"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Body Fields */}
                <div className="p-5 space-y-4">
                    <FormItem label="To">
                        <Input
                            type="email"
                            value={toEmail}
                            disabled
                            className="bg-gray-50 text-gray-600 cursor-not-allowed"
                            required
                        />
                    </FormItem>

                    <FormItem label="Subject">
                        <Input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter email subject"
                            required
                        />
                    </FormItem>

                    <FormItem label="Message">
                        <textarea
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56] resize-y"
                            required
                        />
                    </FormItem>
                </div>

                {/* Footer */}
                <div className="border-t border-[#F1F5F9] px-6 py-4 flex justify-end gap-3 bg-gray-50">
                    <Button
                        type="button"
                        variant="plain"
                        size="sm"
                        onClick={onClose}
                        disabled={sending}
                        className="bg-white hover:bg-gray-100 border border-[#E2E8F0] rounded-lg text-sm text-[#475569]"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="solid"
                        size="sm"
                        loading={sending}
                        icon={<FiSend className="mr-1" />}
                        className="bg-[#1C4FA8] hover:bg-[#163f86] text-white px-5 rounded-lg text-sm font-medium"
                    >
                        Send Email
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

export default ComposeEmailModal;
