import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { BehaviorSubject,from,of,Observable } from "rxjs";
import { tap, switchMap } from "rxjs/operators";
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import { Utils } from "../tools/tools";

const REFRESH_TOKEN_KEY = 'my-refresh-token';

const TOKEN_KEY = 'my-token';
const USERID = 'my-userId';
const USER_ROLES = 'my-roles';
const CORE_SIM = 'my-core-sim';
const CORE_NAME = 'core-name';
const LOCATION = 'location';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  currentAccessToken: any;

  private  REST_API_SERVER = environment.db.server_url;
  collection : String;
  public roles:any;
  tokens : {token:'', refreshtoken:'', coreName:'',location:''};

  constructor(private http: HttpClient,
              private router: Router) { }

      // Load accessToken on startup
  async loadToken() {
    const token = await localStorage.getItem(TOKEN_KEY);    
    if (token) {
      this.currentAccessToken = token;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }


    // Sign in a user and store access and refres token
    login(credentials: {email:string, pwd:string}): Observable<any>{
      return this.http.post(`${this.REST_API_SERVER}api/auth/signin`, credentials)
      .pipe(
        switchMap(async tokens => (token:string, refreshtoken:string, coreName:string,location:string) =>{
          // console.log('DatabaseService tokens --> ', tokens);
  
          // this.currentAccessToken = tokens.token;
          this.currentAccessToken = tokens;
  
          // await localStorage.setItem(TOKEN_KEY,tokens['token']);
          // await localStorage.setItem(REFRESH_TOKEN_KEY,tokens['refreshtoken']);
          // await localStorage.setItem(LOCATION,tokens['location']);
  
          // const storeAccess = await localStorage.getItem(TOKEN_KEY);
          // const storeRefresh = await localStorage.getItem(REFRESH_TOKEN_KEY);

          const storeAccess = localStorage.getItem(TOKEN_KEY);
          const storeRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  
          return from(Observable.throw(Promise.all([storeAccess, storeRefresh])));
        }),
        tap(tokens => {
          this.isAuthenticated.next(true);
        })
      )
    }


    // Potentially perform a logout operation inside your API
// or simply remove all local tokens and navigate to login
logout() {
  console.log('YES send me to LOGOUT..!');
  return this.http.post(`${this.REST_API_SERVER}api/auth/logout`, {}).pipe(
    switchMap(_ => {
      this.currentAccessToken = null;
      // Remove all stored tokens
      const deleteAccess = localStorage.removeItem(TOKEN_KEY);
      const deleteRefresh = localStorage.removeItem(REFRESH_TOKEN_KEY);

      // const deleteAccess = this.storage.remove(TOKEN_KEY);
      // const deleteRefresh = this.storage.remove(REFRESH_TOKEN_KEY);

      return from(Promise.all([deleteAccess, deleteRefresh]));
    }),
    tap(_ => {
      this.isAuthenticated.next(false);
      this.router.navigateByUrl('/', { replaceUrl: true });
    })
  ).subscribe();
}


// Load the refresh token from storage
// then attach it as the header for one specific API call
getNewAccessToken() {
  const refreshToken = from(localStorage.getItem(REFRESH_TOKEN_KEY));
  return refreshToken.pipe(
    switchMap(token => {
      if (token) {

        console.log('getNewAccessToken --- > ', token);
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          })
        }
        return this.http.get(`${this.REST_API_SERVER}api/auth/refresh`, httpOptions);
      } else {
        // No stored refresh token
        return of(null);
      }
    })
  );
}



  // // Store a new access token
  // storeAccessToken(accessToken: Observable<string>) {
  //   this.currentAccessToken = accessToken;
  //   return from(localStorage.setItem('my-token', toString(accessToken)));
  //   // return from(this.storage.set(TOKEN_KEY, accessToken));
  // }

  // Store a new access token
  storeAccessToken(accessToken:any) {
    this.currentAccessToken = accessToken;
    return from(Observable.throw(localStorage.setItem('my-token', accessToken)));
    // return from(this.storage.set(TOKEN_KEY, accessToken));
  }



sendPostRequest(collecion:String,data:any) {
  console.log('json to post: ' + JSON.stringify(data));

      let headers = new HttpHeaders({
        'Accept':'application/json',
        'Content-Type': 'application/json'
    });

    

    let options = {
        headers: headers
    }

    this.http.post(this.REST_API_SERVER + collecion, JSON.stringify(data), options)
        .subscribe(data => {
            console.log(data);
    });



    // For pass blob in API 

//     return this.http.get("http://localhost:5000/api/newCode", { headers: new HttpHeaders({
//       'Authorization': '{data}',
//       'Content-Type': 'application/json',
//     }), responseType: 'blob'}).pipe (
//     tap (
//         // Log the result or error
//         data => console.log('You received data'),
//         error => console.log(error)
//       )
// );


}



//---- GET data from server  ------
getData_key(collection:String,data:any){
  // console.log('database.service getData collection --> ',collecion);
  // const token = Storage.get({key:'my-token'});
  console.log('database.service getData_key --> ', data);

 let  options = {
   headers : {
    'Accept': 'application/json',
    'content-type' :'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
     Authorization : data,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
   }
  }

   return this.http.get(this.REST_API_SERVER + collection, options);
}




 getData(collection:String) {
    return this.http.get(this.REST_API_SERVER + collection );
    // console.log('database.service postData --> ', token);
    // return this.http.get('/api/codes');
}

//--- POST data to server

 postData_noToken(collecion:String){
  //  console.log('postData_noToken url --> ', collecion);

  let  options = {
    headers : {
     'Accept': 'application/json',
     'content-type' :'application/json',
     'Access-Control-Allow-Headers': 'Content-Type',
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
    }
   }


  return this.http.post(this.REST_API_SERVER + collecion , options)
    // .subscribe(data => {
    //   console.log(data);
    
    // }, error => {
    //   console.log(error);
    // });
}

 post_pwdRST(url:string){
   const headers = new HttpHeaders({
    'Accept': 'application/json',
    'content-type' :'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
    });

  const params = new HttpParams().append('email','ricardogueta@hotmail.com');
  

     let options = {
      headers : headers,
      params : params
     }

     console.log('options --> ' + JSON.stringify(options));

     return this.http.post(this.REST_API_SERVER + url, options);
}

async postData_(collection:String,data:any){
  const token = await localStorage.getItem(REFRESH_TOKEN_KEY);
  // const token = await this.storage.get('my-token');
  console.log('postData --> ', token );

 let  options = {
     headers : {
    'Accept': 'application/json',
    'content-type' :'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    // 'Authorization' : 'Bearer ' + token.value,
    Authorization : token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
   }

  }

  // return this.http.post(this.REST_API_SERVER + collection , data, options);

   await this.http.post(this.REST_API_SERVER + collection , data, options)
    .subscribe(data => {
      console.log('http post success --> ',data);
      return data
    
    }, error => {
      console.log('http post error --> ',error);
    });    
}

async postData(collection:String,data:any){
  const token = await localStorage.getItem(REFRESH_TOKEN_KEY);
  // const token = await this.storage.get('my-token');
  console.log('postData --> ', token );

 let  options = {
     headers : {
    'Accept': 'application/json',
    'content-type' :'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    // 'Authorization' : 'Bearer ' + token.value,
    Authorization : token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
   }

  }

  // return this.http.post(this.REST_API_SERVER + collection , data, options);

   return new Promise((resolve, reject) => {this.http.post(this.REST_API_SERVER + collection , data, options)
    .subscribe(res => {
      console.log('http post success --> ',res);
      resolve(res);
    }, error => {
      reject(error)
      console.log('http post error --> ',error);
    });
  })    
}

async postRegisterData(url:String,data:any){
  // const token = await Storage.get({key : TOKEN_KEY});
  // const token = await this.storage.get('my-token');
  // console.log('token -- > ' + token);
  
 let  options = {
   headers : {
    'Accept': 'application/json',
    'content-type' :'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
   }
  }

    this.http.post(this.REST_API_SERVER + url , data, options)
    .subscribe(data => {
      console.log(data);
    
    }, error => {
      console.log(error);
    });
    

}

 postRegister(url:String,data:any){
  console.log('postRegister ------ ');
 let  options = {
   headers : {
    'Accept': 'application/json',
    'content-type' :'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
   }
  }

  return this.http.post(this.REST_API_SERVER + url , data, options)
}



//--- PUT data to server
async putData(collecion:String,data:any){
  const token = await localStorage.getItem(REFRESH_TOKEN_KEY);
  // const token = await Storage.get({key : TOKEN_KEY});

 let  options = {
   headers : {
    'Accept': 'application/json',
    'content-type' :'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    // 'x-access-token': token.value,
     Authorization :  token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
   }
  }

  this.http.put(this.REST_API_SERVER + collecion , data, options)
  .subscribe(data => {
    console.log('http put success --> ',data);
  
  }, error => {
    console.log('http post error --> ',error);
  });
}

  //--- DELETE data to server
  async deleteData(collecion:String,data:any){
    const token = await localStorage.getItem(TOKEN_KEY);
    // const token = await this.storage.get('my-token');
    // console.log('token -- > ' + JSON.stringify(token['value']))
    // console.log('url: --> ' + this.REST_API_SERVER + collecion + data + '\nDate:  ' + Utils.convDateToday());

    console.log('token -- > ' + JSON.stringify(token))
    console.log('url: --> ' + this.REST_API_SERVER + collecion + data + 
        '\nDate:  ' + Utils.convDateToday());


  let  options = {
    headers : {
      'Accept': 'application/json',
      'content-type' :'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      // 'x-access-token': token['value'],
      'x-access-token': token,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
    }
    }


      this.http.delete(this.REST_API_SERVER + collecion + data,options)
      .subscribe(data => {
        console.log(data);
      
      }, error => {
        console.log(error);
      });
      
  }
}

