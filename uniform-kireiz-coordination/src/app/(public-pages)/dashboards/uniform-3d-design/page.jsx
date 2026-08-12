import React from 'react'
import SimulationProductPicker from './_components/SimulationProductPicker'

/*
 * No product id in the URL, so there is nothing to customise yet — show the products the
 * admin enabled for simulation and let the shopper pick one. The customiser itself lives
 * at ./[id], which this hands off to.
 */
const Page = () => {
    return (
        <div><SimulationProductPicker /></div>
    )
}

export default Page
