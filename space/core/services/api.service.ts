/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from "axios";
// store
// import { rootStore } from "@/lib/store-context";

export abstract class APIService {
  protected baseURL: string | undefined;
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string | undefined) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL: baseURL || "",
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // this.axiosInstance.interceptors.response.use(
    //   (response) => response,
    //   (error) => {
    //     const store = rootStore;
    //     if (error.response && error.response.status === 401 && store.user.data) store.user.reset();
    //     return Promise.reject(error);
    //   }
    // );
  }

  get(url: string, params = {}) {
    return this.axiosInstance.get(url, params);
  }

  post(url: string, data = {}, config = {}) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data = {}, config = {}) {
    return this.axiosInstance.put(url, data, config);
  }

  patch(url: string, data = {}, config = {}) {
    return this.axiosInstance.patch(url, data, config);
  }

  delete(url: string, data?: any, config = {}) {
    return this.axiosInstance.delete(url, { data, ...config });
  }

  request(config = {}) {
    return this.axiosInstance(config);
  }
}
