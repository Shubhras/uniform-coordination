import ApiService from "./ApiService";

export async function apiGetCartList(token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/list/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function apiGetCartSummary(token) {
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/item-summary/`,
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function apiAddToCart(token, product_id, quantity = 1) {
  const payload = {
    product_id: product_id,
    quantity: quantity,
  };
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/add/`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
}
export async function apiUpdateItemQuantity(token, itemId, count) {
  const payload = {
    // item_id: itemId,
    quantity: count,
  };
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/item/${itemId}/update/`,
    method: "patch",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
}

export async function apiDeleteItem(token, itemId) {
  const payload = {
    item_id: itemId,
  };
  return ApiService.fetchDataWithAxios({
    url: `/v1/space/userhub/cart/item/${itemId}/delete/`,
    method: "delete",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });
}
