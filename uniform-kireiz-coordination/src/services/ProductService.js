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

// export async function apiGetProductById(id) {
//   return ApiService.fetchDataWithAxios({
//     url: `/v1/uniformAdmin/product/list/?subcategoryId=${id}&productType=uniform`,
//     method: "get",
//   });
// }
export async function apiGetProductById(params) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/list/`,
    method: "get",
    params,
  });
}

export async function apiGetProductDetailsById(id) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/uniformAdmin/product/get/${id}/`,
    method: "get",
  });
}
