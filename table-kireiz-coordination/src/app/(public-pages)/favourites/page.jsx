import React from 'react'
import FavouritesHome from './components/FavouritesHome'

export const metadata = {
    title: 'My Favorites | Kireiz Space',
    description: 'View and manage your favorite products and table themes.',
}

const FavouritesPage = () => {
    return (
        <div>
            <FavouritesHome />
        </div>
    )
}

export default FavouritesPage

