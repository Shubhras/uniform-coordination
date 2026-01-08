import ApiService from './ApiService'

export async function apiGetProfile(token) {
    return ApiService.fetchDataWithAxios({
        url: '/v1/userhub/profile/',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}
// export async function apiUpdateProfile(token,payload) {
//     console.log('api calll update ',payload);
    
//     return ApiService.fetchDataWithAxios({
//         url: '/v1/userhub/profile/update/',
//         method: 'put',
//         payload,
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     })
// }
export async function apiUpdateProfile(token, payload) {
    //console.log('qqq',payload);
    
    const formData = new FormData()
    formData.append('firstName', payload.firstName || '')
    formData.append('lastName', payload.lastName || '')
    formData.append('phone', payload.phone || '')

    // Only append file if it's a new File
   // if (payload.profileImage instanceof File) {
        formData.append('profileImage', payload.profileImage)
    //}

    return ApiService.fetchDataWithAxios({
        url: '/v1/userhub/profile/update/',
        method: 'put',
        data: formData,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    })
}



