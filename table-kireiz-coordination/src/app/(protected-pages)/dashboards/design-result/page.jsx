import AdaptiveCard from "@/components/shared/AdaptiveCard"
import DesignResultPage from "./_components/DesignResultPage"

const Page = () => {

    return (<>
        <AdaptiveCard className="h-full mt-12">
            <div className="flex flex-auto h-full">
                <DesignResultPage />
            </div>
        </AdaptiveCard>
    </>
    )

}

export default Page
