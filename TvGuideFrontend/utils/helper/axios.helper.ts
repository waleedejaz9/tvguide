import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import Constants from "./constants";
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
/**
 * This Helper Class is responsible to wrap axios functionality and expose only needed methods.
 */
export default class AxiosHelper {
  private endPoint: string = "";

  /**
   * @param endPoint This will be different for every endpoint.
   */
  constructor(endPoint: string) {
    this.endPoint = endPoint;
    console.log("Axios Helper Here ", publicRuntimeConfig.apiURL)
    axios.defaults.baseURL = publicRuntimeConfig.apiURL;
  }


  public get(config?: AxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.endPoint, config)
        .then((value: AxiosResponse) => {
          //console.log("success");
          resolve(value.data);
        })
        .catch((error: AxiosError) => {
          console.log("error");
          // TODO: This has to be done... Ahmed
          reject(error);
        });
    });
  }

  public async post<T>(requestPayload: T, config?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      axios
        .post(this.endPoint, requestPayload, config)
        .then((value: AxiosResponse) => {
          resolve(value.data);
        })
        .catch((error: AxiosError) => {
          // TODO: This has to be done... Ahmed
          reject(error);
        });
    });
  }

  public async put<T>(id: string, requestPayload: T, config?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      axios
        .put(`${this.endPoint}`, requestPayload, config)
        .then((value: AxiosResponse) => {
          resolve(value.data);
        })
        .catch((error: AxiosError) => {
          // TODO: This has to be done... Ahmed
          reject(error);
        });
    });
  }
  public async delete<T>(id: string, requestPayload: T): Promise<T> {
    return new Promise((resolve, reject) => {
      axios
        .delete(`${this.endPoint}`, { data: requestPayload })
        .then((value: AxiosResponse) => {
          resolve(value.data);
        })
        .catch((error: AxiosError) => {
          // TODO: This has to be done... Ahmed
          reject(error);
        });
    });
  }
}
