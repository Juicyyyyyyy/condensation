import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
const AUTH_URL = process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

async function getUserId(token: string): Promise<number | null> {
  // #region agent log
  fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H2",location:"app/api/balance/route.ts:getUserId:start",message:"Calling auth user endpoint",data:{authUrl:AUTH_URL,hasToken:Boolean(token)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    const res = await fetch(`${AUTH_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    // #region agent log
    fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H2",location:"app/api/balance/route.ts:getUserId:authResponse",message:"Auth endpoint response status",data:{status:res.status,ok:res.ok},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!res.ok) return null;
    const user = await res.json();
    // #region agent log
    fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H3",location:"app/api/balance/route.ts:getUserId:parsedUser",message:"Parsed auth user payload",data:{idType:typeof user?.id,hasId:user?.id !== undefined},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return typeof user.id === "number" ? user.id : null;
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H2",location:"app/api/balance/route.ts:getUserId:catch",message:"Auth user fetch threw",data:{error:error instanceof Error ? error.message : "unknown"},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  // #region agent log
  fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H1",location:"app/api/balance/route.ts:GET:start",message:"Balance route invoked",data:{hasAccessToken:Boolean(token),backendUrl:BACKEND_URL,authUrl:AUTH_URL},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userid = await getUserId(token);
  // #region agent log
  fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H3",location:"app/api/balance/route.ts:GET:userid",message:"Resolved user id from auth",data:{userId:userid},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND_URL}/api/balance?userid=${userid}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    // #region agent log
    fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H4",location:"app/api/balance/route.ts:GET:backendResponse",message:"Backend balance response status",data:{status:res.status,ok:res.ok},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!res.ok) return NextResponse.json({ error: "Backend error" }, { status: 502 });
    const data = await res.json();
    return NextResponse.json({ balance: data.balance });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7628/ingest/9e172e59-005f-42c5-8495-33ff4a65b5e0",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"64280d"},body:JSON.stringify({sessionId:"64280d",runId:"initial",hypothesisId:"H5",location:"app/api/balance/route.ts:GET:catch",message:"Backend balance fetch threw",data:{error:error instanceof Error ? error.message : "unknown"},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
