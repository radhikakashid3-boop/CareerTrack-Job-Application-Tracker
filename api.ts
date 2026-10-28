export type ApplicationStatus = "Wishlist" | "Applied" | "Interview" | "Offer" | "Rejected";
export type Application = { id:number; company:string; role:string; location:string; job_url:string|null; status:ApplicationStatus; applied_date:string|null; notes:string; created_at:string; updated_at:string };
export type ApplicationInput = Omit<Application,"id"|"created_at"|"updated_at">;
export type User = {id:number; email:string; created_at:string};
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
let token = localStorage.getItem("careertrack_token") || "";
export function setToken(value:string) { token=value; if(value) localStorage.setItem("careertrack_token",value); else localStorage.removeItem("careertrack_token"); }
export function getToken() { return token; }
async function request<T>(path:string, options?:RequestInit):Promise<T> {
  const headers:Record<string,string>={"Content-Type":"application/json",...(options?.headers as Record<string,string>||{})};
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API}${path}`,{...options,headers});
  if(!response.ok){let message=`Request failed (${response.status})`;try{const body=await response.json();message=body.detail||message;}catch{} if(response.status===401){setToken("");window.dispatchEvent(new Event("careertrack:logout"));} throw new Error(message);}
  if(response.status===204)return undefined as T;
  return response.json() as Promise<T>;
}
export const auth={register:(email:string,password:string)=>request<{access_token:string;user:User}>("/auth/register",{method:"POST",body:JSON.stringify({email,password})}),login:(email:string,password:string)=>request<{access_token:string;user:User}>("/auth/login",{method:"POST",body:JSON.stringify({email,password})}),me:()=>request<User>("/auth/me")};
export const api={
 list:(search="",status="")=>{const p=new URLSearchParams();if(search)p.set("search",search);if(status)p.set("application_status",status);return request<Application[]>(`/applications?${p}`)},
 create:(data:ApplicationInput)=>request<Application>("/applications",{method:"POST",body:JSON.stringify(data)}),
 update:(id:number,data:ApplicationInput)=>request<Application>(`/applications/${id}`,{method:"PUT",body:JSON.stringify(data)}),
 remove:(id:number)=>request<void>(`/applications/${id}`,{method:"DELETE"}),
 stats:()=>request<{total:number;by_status:Record<ApplicationStatus,number>;interview_rate:number}>("/stats"),
 exportUrl:()=>`${API}/applications/export.csv`
};
