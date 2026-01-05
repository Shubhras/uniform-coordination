import ApiService from './ApiService'

export async function apiGetFaq(params = {}) {
  
    return ApiService.fetchDataWithAxios({
        url: '/v1/uniformAdmin/faqs/list/',
        method: 'get',
        params,
    })
}

// export async function apiGetFaqDetail(id) {
//       alert("Get Faq API called",id);
//   return ApiService.fetchDataWithAxios({
//     url: `/v1/uniformAdmin/blogs/detail/${id}/`,
//     method: "get",
//   });
// }