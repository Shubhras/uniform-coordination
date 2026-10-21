"use client";

import { useState, useEffect } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { FiMail, FiSend } from "react-icons/fi";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiSendEmail } from "@/services/EmailService";

const ComposeEmailModal = ({
  isOpen,
  onClose,
  recipientEmail = "",
  recipientName = "",
}) => {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setToEmail(recipientEmail || "");
      setSubject("");
      setMessage("");
      setError("");
    }
  }, [isOpen, recipientEmail]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!toEmail.trim()) {
      setError("Recipient email is required.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!message.trim()) {
      setError("Message body cannot be empty.");
      return;
    }

    setSending(true);

    try {
      const response = await apiSendEmail(accessToken, {
        to_email: toEmail.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (response && response.status === false) {
        setError(response.message || "Failed to send email");
        return;
      }

      toast.push(
        <Notification title="Email Sent" type="success">
          {response?.message || `Email sent successfully to ${toEmail}`}
        </Notification>
      );

      onClose();
    } catch (err) {
      console.error("Send email error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send email. Please check your SMTP settings."
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
      <form onSubmit={handleSend} className="flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1C4FA8] flex items-center justify-center">
              <FiMail size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1C2C56]">
                Compose Email
              </h3>
              {recipientName && (
                <p className="text-xs text-gray-400">
                  To: {recipientName} ({toEmail})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="p-5 space-y-4">
          <FormItem label="To">
            <Input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="recipient@example.com"
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
              className="w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2C56] resize-y"
              required
            />
          </FormItem>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <Button
            type="button"
            variant="plain"
            size="sm"
            onClick={onClose}
            disabled={sending}
            className="bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="solid"
            size="sm"
            loading={sending}
            icon={<FiSend />}
            className="bg-[#1C4FA8] hover:bg-[#163f86] text-white px-5 rounded-md"
          >
            Send Email
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ComposeEmailModal;
