import AdminLayoutWrapper from './AdminLayoutWrapper'

const PublicPagesLayout = ({ children }) => {
    return (
        <AdminLayoutWrapper>
            {children}
        </AdminLayoutWrapper>
    )
}

export default PublicPagesLayout
