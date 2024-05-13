import { configureStore } from '@reduxjs/toolkit'
import Walletslice from './walletslice'
import DetailSlice from './detailslice'

export default configureStore({
    reducer: {
        wallet : Walletslice,
        detail : DetailSlice
    },
})