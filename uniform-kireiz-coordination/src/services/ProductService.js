// import ApiService from './ApiService'

// export async function apiGetProductList(params) {
//     return ApiService.fetchDataWithAxios({
//         url: '/products',
//         method: 'get',
//         params,
//     })
// }

// export async function apiGetProduct({ id, ...params }) {
//     return ApiService.fetchDataWithAxios({
//         url: `/products/${id}`,
//         method: 'get',
//         params,
//     })
// }


import ApiService from "./ApiService";

export async function apiGetProductById(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/list/?subcategoryId=${id}`,
    method: "get",
  });
}




