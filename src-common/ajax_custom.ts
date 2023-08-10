// WARNING: THIS FILE WILL BE SHARED BY BOTH NODE.JS SERVER AND FRONTEND

export type AJAX_RESULT_OK = { status: number, responseText: string };
export type AJAX_RESULT_ERR = { status: number, responseText: string };
export function AJAX_GET(url: string): Promise<AJAX_RESULT_OK> {
   let promise: Promise<AJAX_RESULT_OK> = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
         if (xhr.status >= 200 && xhr.status < 300) {
            let res: AJAX_RESULT_OK = {
               status: xhr.status, responseText: xhr.responseText
            }
            resolve(res);
         } else {
            let res: AJAX_RESULT_ERR = {
               status: xhr.status, responseText: xhr.responseText
            };
            reject(res);
         }
      };
      xhr.onerror = function () {
         reject({ status: xhr.status, responseText: xhr.responseText })
      };
      xhr.send();
   });

   return promise;
}

export function AJAX_POST(url: string, body: string | null = null): Promise<AJAX_RESULT_OK> {
   const promise: Promise<AJAX_RESULT_OK> = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.onload = function () {
         if (xhr.status >= 200 && xhr.status < 300) {
            const res: AJAX_RESULT_OK = {
               status: xhr.status,
               responseText: xhr.responseText,
            };
            resolve(res);
         } else {
            const res: AJAX_RESULT_ERR = {
               status: xhr.status,
               responseText: xhr.responseText,
            };
            reject(res);
         }
      };
      xhr.onerror = function () {
         reject({ status: xhr.status, responseText: xhr.responseText });
      };
      xhr.send(body);
   });

   return promise;
}