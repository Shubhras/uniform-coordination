import AdaptiveCard from "@/components/shared/AdaptiveCard"
import DeliveryRequestForm from "../_components/DeliveryRequestForm"

const Page = () => {

    return (<>
        <AdaptiveCard className="h-full mt-15">
            <div className="flex flex-auto h-full">
                <DeliveryRequestForm />
            </div>
        </AdaptiveCard>
    </>
    )

}

export default Page
