import ApiService from "./ApiService";
 
export async function apiSaveDesign(data) {
    return ApiService.fetchDataWithAxios({
        url: "/v1/userhub/customupdatemodels/create/",
        method: "post",
        data,
    });
}
 