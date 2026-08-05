
import Side from '@/components/layouts/AuthLayout/Side'
import Split from '@/components/layouts/AuthLayout/Split'
import HaederPage from '@/app/(public-pages)/header/HaederPage'
const Layout = ({ children }) => {
    return (
        <div className="flex flex-auto flex-col h-[100vh]">
            {/* <Split>{children}</Split> */}
            <HaederPage />
            {children}
        </div>
    )
}

export default Layout
