import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'

const TermsAndConditionsPopup = ({ isOpen, onClose }) => {

    const onDialogOk = () => {
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
           className="min-w-[800px] max-w-[800px] w-full"
            >
            <div className="flex w-full flex-col h-full justify-between">
                <div className="flex justify-between items-center px-2 pt-6 pb-4 ">
                    <h2 className="text-xl font-semibold text-center w-full">
                        Terms & Conditions
                    </h2>
                    <span className="absolute right-8 text-sm text-gray-500">
                        Last Updated: December 1, 2025
                    </span>
                </div>
                <div className="min-h-100 max-h-150 overflow-y-auto">
                  <h5 className="font-medium mt-3 mb-3"> 1. AGREEMENT TO TERMS</h5>   
                    <p>
                        
                        By placing an order for custom uniforms through KIREIZU UNIFORM, you acknowledge.
                    </p>
                    
                </div>
                <div className="text-right mt-6">
                    <Button className="ltr:mr-2 rtl:ml-2" variant="plain" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="solid"  className="bg-[#2A2FA8] text-white px-10 py-2 rounded-md" onClick={onDialogOk}>
                        I Agree
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

export default TermsAndConditionsPopup

