import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  authAPI, customerAPI, entryAPI, paymentAPI, priceAPI,
  getToken, setToken, clearToken,
} from "./api";

// ── Fonts & CSS ───────────────────────────────────────────────────────────────
const FL = document.createElement("link");
FL.rel = "stylesheet";
FL.href = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap";
document.head.appendChild(FL);

const S = document.createElement("style");
S.textContent = `
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --gold:#F59E0B;--gold-l:#FDE68A;--gold-d:#B45309;
    --cream:#FFFBF0;--cream2:#FEF3C7;
    --brown:#3D1C02;--brown2:#78350F;
    --green:#059669;--green-l:#D1FAE5;
    --red:#DC2626;--red-l:#FEE2E2;
    --blue:#2563EB;--blue-l:#DBEAFE;
    --orange:#EA580C;--orange-l:#FFEDD5;
    --gray:#6B7280;--gray-l:#F3F4F6;--white:#FFFFFF;
    --sh:0 2px 12px rgba(61,28,2,.10);--sh-lg:0 8px 32px rgba(61,28,2,.16);--r:16px;
  }
  body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--brown)}
  .app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--cream);position:relative;overflow-x:hidden}
  h1,h2,h3,h4{font-family:'Baloo 2',cursive}
  @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .slide-up{animation:slideUp .3s cubic-bezier(.22,.68,0,1.2) both}
  .fade-in{animation:fadeIn .18s ease both}
  .shake{animation:shake .35s ease}
  .spin{animation:spin .8s linear infinite;display:inline-block}

  .bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;
    background:var(--brown);display:flex;border-radius:24px 24px 0 0;
    box-shadow:0 -4px 24px rgba(61,28,2,.25);z-index:100;overflow:hidden}
  .nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:10px 4px 14px;gap:3px;background:transparent;border:none;cursor:pointer;
    transition:all .18s;color:rgba(253,230,138,.45);font-family:'Nunito',sans-serif;
    font-size:10px;font-weight:600;position:relative}
  .nav-btn.active{color:var(--gold)}
  .nav-btn .icon{font-size:22px;line-height:1;transition:transform .18s}
  .nav-btn.active .icon{transform:scale(1.18)}

  .card{background:#fff;border-radius:var(--r);box-shadow:var(--sh);overflow:hidden}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 20px;
    border-radius:12px;border:none;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;font-size:15px;transition:all .15s}
  .btn:active{transform:scale(.96)}
  .btn:disabled{opacity:.5;cursor:not-allowed}
  .btn-gold{background:var(--gold);color:var(--brown)}.btn-gold:hover:not(:disabled){background:var(--gold-d);color:#fff}
  .btn-green{background:var(--green);color:#fff}
  .btn-red{background:var(--red);color:#fff}
  .btn-outline{background:transparent;border:2px solid var(--gold);color:var(--gold-d)}
  .btn-ghost{background:var(--gray-l);color:var(--gray)}
  .btn-sm{padding:7px 14px;font-size:13px;border-radius:9px}
  .btn-lg{padding:16px 28px;font-size:16px;border-radius:14px;width:100%}

  .input{width:100%;padding:13px 16px;border:2px solid #E5E7EB;border-radius:12px;
    font-family:'Nunito',sans-serif;font-size:15px;color:var(--brown);background:#fff;
    transition:border-color .15s;outline:none}
  .input:focus{border-color:var(--gold)}
  .input-label{font-family:'Baloo 2',cursive;font-weight:600;font-size:13px;color:var(--brown2);margin-bottom:5px}

  .date-input{width:100%;padding:11px 14px;border:2px solid rgba(253,230,138,.4);border-radius:12px;
    font-family:'Baloo 2',cursive;font-size:15px;font-weight:700;color:var(--brown);
    background:rgba(254,243,199,.3);outline:none;cursor:pointer;transition:border-color .15s}
  .date-input:focus{border-color:var(--gold);background:var(--cream2)}

  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:12px;font-weight:700}
  .badge-gold{background:var(--cream2);color:var(--gold-d)}.badge-green{background:var(--green-l);color:var(--green)}
  .badge-red{background:var(--red-l);color:var(--red)}.badge-blue{background:var(--blue-l);color:var(--blue)}
  .badge-gray{background:var(--gray-l);color:var(--gray)}.badge-orange{background:var(--orange-l);color:var(--orange)}

  .stepper{display:flex;align-items:center;background:var(--gray-l);border-radius:10px;overflow:hidden}
  .stepper-btn{width:40px;height:40px;border:none;background:transparent;cursor:pointer;font-size:22px;color:var(--brown2);
    display:flex;align-items:center;justify-content:center;font-weight:800;transition:background .1s;flex-shrink:0}
  .stepper-btn:active{background:var(--cream2)}
  .stepper-num{min-width:48px;text-align:center;border:none;background:transparent;outline:none;
    font-family:'Baloo 2',cursive;font-size:18px;font-weight:800;color:var(--brown)}

  .scroll-area{overflow-y:auto;padding-bottom:90px}.scroll-area::-webkit-scrollbar{width:0}

  .header{background:linear-gradient(135deg,var(--brown) 0%,var(--brown2) 100%);padding:18px 20px 16px;color:var(--cream)}
  .header-title{font-family:'Baloo 2',cursive;font-size:22px;font-weight:800;color:var(--gold)}
  .header-sub{font-size:13px;color:rgba(253,230,138,.7);font-weight:500}

  .stat-card{background:#fff;border-radius:var(--r);padding:16px;box-shadow:var(--sh)}
  .stat-val{font-family:'Baloo 2',cursive;font-size:26px;font-weight:800;color:var(--brown)}
  .stat-label{font-size:12px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.5px}

  .modal-backdrop{position:fixed;inset:0;background:rgba(61,28,2,.5);z-index:200;
    display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .15s}
  .modal{background:var(--cream);border-radius:24px 24px 0 0;padding:24px 20px 36px;
    width:100%;max-width:430px;animation:slideUp .28s cubic-bezier(.22,.68,0,1.2);max-height:92vh;overflow-y:auto}
  .modal-handle{width:40px;height:4px;background:#D1D5DB;border-radius:4px;margin:0 auto 20px}

  .chip{padding:7px 13px;border-radius:100px;border:2px solid #E5E7EB;background:#fff;
    font-family:'Nunito',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .15s;color:var(--gray)}
  .chip.selected{background:var(--gold);border-color:var(--gold);color:var(--brown)}

  .milk-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;
    background:var(--cream2);border-radius:8px;font-size:12px;font-weight:700;color:var(--brown2)}

  .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--brown);color:var(--gold-l);
    padding:12px 22px;border-radius:100px;font-family:'Baloo 2',cursive;font-size:14px;font-weight:600;
    z-index:999;white-space:nowrap;box-shadow:var(--sh-lg);animation:slideUp .2s ease}

  .progress{height:6px;background:#E5E7EB;border-radius:6px;overflow:hidden}
  .progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-d));border-radius:6px;transition:width .5s cubic-bezier(.22,.68,0,1.2)}

  .section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .section-title{font-family:'Baloo 2',cursive;font-size:17px;font-weight:700;color:var(--brown)}

  .search-wrap{position:relative}
  .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;color:var(--gray)}
  .search-input{padding-left:40px}

  .cust-row{display:flex;align-items:stretch;background:#fff;border-radius:14px;box-shadow:var(--sh);
    margin-bottom:10px;overflow:hidden;cursor:pointer;transition:transform .14s,box-shadow .14s}
  .cust-row:active{transform:scale(.98);box-shadow:none}
  .cust-row-bar{width:5px;flex-shrink:0}
  .cust-row-body{flex:1;padding:13px 12px;min-width:0}
  .cust-row-right{padding:12px 14px 12px 8px;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:5px}

  .login-page{min-height:100vh;display:flex;flex-direction:column;
    background:linear-gradient(160deg,var(--brown) 0%,var(--brown2) 55%,#5C2007 100%)}
  .login-card{background:var(--cream);border-radius:28px 28px 0 0;padding:32px 24px 48px;margin-top:auto;animation:slideUp .4s cubic-bezier(.22,.68,0,1.2)}

  .xl-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 18px;border-radius:12px;
    border:2px solid #1D6F42;background:#1D6F42;color:#fff;cursor:pointer;font-family:'Nunito',sans-serif;
    font-weight:700;font-size:14px;transition:all .15s;width:100%}
  .xl-btn:active{transform:scale(.97)}.xl-btn:hover{background:#145a32}

  .price-banner{background:var(--orange-l);border:1.5px solid var(--orange);border-radius:10px;padding:8px 12px;
    display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--orange);font-weight:600}

  .loader{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px}
  .spinner{width:40px;height:40px;border:4px solid var(--cream2);border-top-color:var(--gold);border-radius:50%;animation:spin .7s linear infinite}
  .err-box{background:var(--red-l);border:1.5px solid var(--red);border-radius:12px;padding:14px 16px;
    margin:16px;font-size:14px;color:var(--red);font-weight:600;text-align:center}
`;
document.head.appendChild(S);

// ── Types ─────────────────────────────────────────────────────────────────────
type MilkType   = "Gold"|"Shakti"|"Taza"|"TSP"|"Buttermilk";
type Prices     = Record<MilkType,number>;
type MilkDist   = Partial<Record<MilkType,number>>;
type DetailView = "customer-detail"|"monthly-report"|null;
type Screen     = "login"|"app";

interface MilkItem    { type:MilkType; qty:number; price:number }
interface DefaultMilk { type:MilkType; qty:number }
interface Customer    { id:string; name:string; phone:string; address:string; advance:number; defaultMilk:DefaultMilk[] }
interface MilkEntry   { id:string; customerId:string; date:string; milkItems:MilkItem[]; pettyExpense:number; delivered:boolean }
interface DraftEntry  { milkItems:MilkItem[]; pettyExpense:number; saved:boolean; skipped:boolean }
interface Payment     { id:string; customerId:string; amount:number; date:string }
interface MonthlyBill { milkTotals:MilkDist; milkAmount:number; pettyTotal:number; total:number; paid:number; pending:number }
interface PriceSnapshot { date:string; prices:Prices; changedFrom:Partial<Prices> }

// ── Constants ─────────────────────────────────────────────────────────────────
const MILK_TYPES: MilkType[] = ["Gold","Shakti","Taza","TSP","Buttermilk"];
const MILK_COLORS: Record<MilkType,string> = {
  Gold:"#F59E0B", Shakti:"#3B82F6", Taza:"#10B981", TSP:"#8B5CF6", Buttermilk:"#F97316",
};
const INIT_PRICES: Prices = { Gold:34, Shakti:30, Taza:28, TSP:26, Buttermilk:16 };

// ── Normalizers (MongoDB _id → id) ────────────────────────────────────────────
const nc  = (c: any): Customer   => ({ ...c, id: c._id ?? c.id });
const ne  = (e: any): MilkEntry  => ({ ...e, id: e._id ?? e.id, customerId: String(e.customerId) });
const np  = (p: any): Payment    => ({ ...p, id: p._id ?? p.id, customerId: String(p.customerId) });
const nph = (h: any): PriceSnapshot => ({
  date: h.date,
  prices:      h.prices instanceof Map ? Object.fromEntries(h.prices) : h.prices,
  changedFrom: h.changedFrom instanceof Map ? Object.fromEntries(h.changedFrom) : h.changedFrom,
} as PriceSnapshot);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getToday   = () => new Date().toISOString().split("T")[0];
const currMonth  = () => new Date().toISOString().slice(0,7);
const fmtDate    = (d:string) => new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
const fmtDay     = (d:string) => new Date(d+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
const fmtRupee   = (n:number) => "₹"+Number(n).toLocaleString("en-IN");
const getGreeting = () => { const h=new Date().getHours(); return h<12?"Good Morning!":h<17?"Good Afternoon!":"Good Evening!"; };

function calcMonthlyBill(cId:string, entries:MilkEntry[], payments:Payment[]): MonthlyBill {
  const ce=entries.filter(e=>e.customerId===cId);
  const milkTotals:MilkDist={};
  let milkAmount=0, pettyTotal=0;
  ce.forEach(e=>{
    e.milkItems.forEach(m=>{ milkTotals[m.type]=(milkTotals[m.type]??0)+m.qty; milkAmount+=m.qty*m.price; });
    pettyTotal+=e.pettyExpense??0;
  });
  const paid=payments.filter(p=>p.customerId===cId).reduce((a,p)=>a+p.amount,0);
  const total=milkAmount+pettyTotal;
  return { milkTotals, milkAmount, pettyTotal, total, paid, pending:total-paid };
}

function buildDrafts(customers:Customer[], prices:Prices, entries:MilkEntry[], date:string): Record<string,DraftEntry> {
  const m:Record<string,DraftEntry>={};
  customers.forEach(c=>{
    const existing = entries.find(e=>e.customerId===c.id && e.date===date);
    if (existing) {
      m[c.id]={ milkItems:existing.milkItems.map(x=>({...x})),
        pettyExpense:existing.pettyExpense, saved:true,
        skipped:existing.milkItems.every(x=>x.qty===0) };
    } else {
      m[c.id]={ milkItems:c.defaultMilk.map(dm=>({type:dm.type,qty:dm.qty,price:prices[dm.type]})),
        pettyExpense:0, saved:false, skipped:false };
    }
  });
  return m;
}

function hasPriceChanged(items:MilkItem[], prices:Prices) { return items.some(m=>m.price!==prices[m.type]); }

// ── Toast ─────────────────────────────────────────────────────────────────────
let _tt: ReturnType<typeof setTimeout>;
function useToast() {
  const [msg,setMsg]=useState("");
  const show=(m:string)=>{ setMsg(m); clearTimeout(_tt); _tt=setTimeout(()=>setMsg(""),2600); };
  return { msg, show };
}

// ── Excel helpers ─────────────────────────────────────────────────────────────
function downloadExcel(customers:Customer[],entries:MilkEntry[],payments:Payment[],priceHistory:PriceSnapshot[],prices:Prices,monthLabel:string) {
  const wb=XLSX.utils.book_new();
  const mp=new Date().toISOString().slice(0,7);
  const me=entries.filter(e=>e.date.startsWith(mp));

  // Sheet 1: Monthly Summary
  const sumRows:(string|number)[][]=[[`Dhanlaxmi Parlour – Monthly Summary: ${monthLabel}`],[],
    ["Customer","Phone",...MILK_TYPES.map(t=>`${t} (qty)`),...MILK_TYPES.map(t=>`${t} (₹)`),"Milk (₹)","Extra (₹)","Total (₹)","Paid (₹)","Pending (₹)"]];
  let [sm,sp,st,spd,sn]=[0,0,0,0,0];
  customers.forEach(c=>{
    const bill=calcMonthlyBill(c.id,me,payments);
    const qm:Partial<Record<MilkType,number>>={}, am:Partial<Record<MilkType,number>>={};
    me.filter(e=>e.customerId===c.id).forEach(e=>e.milkItems.forEach(m=>{qm[m.type]=(qm[m.type]??0)+m.qty;am[m.type]=(am[m.type]??0)+m.qty*m.price;}));
    sumRows.push([c.name,c.phone,...MILK_TYPES.map(t=>qm[t]??0),...MILK_TYPES.map(t=>am[t]??0),bill.milkAmount,bill.pettyTotal,bill.total,bill.paid,bill.pending]);
    sm+=bill.milkAmount;sp+=bill.pettyTotal;st+=bill.total;spd+=bill.paid;sn+=bill.pending;
  });
  sumRows.push(["TOTAL","",...MILK_TYPES.map(()=>""),...MILK_TYPES.map(()=>""),sm,sp,st,spd,sn]);
  const ws1=XLSX.utils.aoa_to_sheet(sumRows);
  ws1["!cols"]=[{wch:22},{wch:14},...Array(13).fill({wch:13})];
  XLSX.utils.book_append_sheet(wb,ws1,"Monthly Summary");

  // Sheet 2: Daily Entries
  const entRows:(string|number)[][]=[[`Dhanlaxmi Parlour – Daily Entries (${monthLabel})`],[],
    ["Date","Customer","Milk Type","Qty","Rate (₹)","Amount (₹)","Extra (₹)"]];
  [...me].sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{
    const cust=customers.find(c=>c.id===e.customerId);
    const nm=e.milkItems.every(m=>m.qty===0)||e.milkItems.length===0;
    if(nm){ entRows.push([fmtDate(e.date),cust?.name??"","No milk",0,"—",0,0]); }
    else { e.milkItems.filter(m=>m.qty>0).forEach((m,i)=>entRows.push([i===0?fmtDate(e.date):"",i===0?(cust?.name??""):"",m.type,m.qty,m.price,m.qty*m.price,i===0?e.pettyExpense:0])); }
  });
  const ws2=XLSX.utils.aoa_to_sheet(entRows);
  ws2["!cols"]=[{wch:16},{wch:22},{wch:12},{wch:8},{wch:10},{wch:12},{wch:10}];
  XLSX.utils.book_append_sheet(wb,ws2,"Daily Entries");

  // Sheet 3: Customers
  const custRows:(string|number)[][]=[[`Dhanlaxmi Parlour – Customer Master`],[],
    ["Name","Phone","Address","Advance (₹)","Default Milk","Month Total (₹)","Paid (₹)","Pending (₹)"]];
  customers.forEach(c=>{
    const bill=calcMonthlyBill(c.id,me,payments);
    custRows.push([c.name,c.phone,c.address,c.advance,c.defaultMilk.map(m=>`${m.type}×${m.qty}`).join(", "),bill.total,bill.paid,bill.pending]);
  });
  const ws3=XLSX.utils.aoa_to_sheet(custRows);
  ws3["!cols"]=[{wch:22},{wch:14},{wch:24},{wch:12},{wch:30},{wch:14},{wch:12},{wch:12}];
  XLSX.utils.book_append_sheet(wb,ws3,"Customers");

  // Sheet 4: Price History
  const phRows:(string|number)[][]=[[`Dhanlaxmi Parlour – Price History`],[],["Date","Milk Type","Old (₹)","New (₹)","Change"]];
  priceHistory.length===0 ? phRows.push(["No changes recorded","","","",""]) :
    priceHistory.slice().reverse().forEach(s=>{
      (Object.entries(s.changedFrom) as [MilkType,number][]).forEach(([t,op])=>
        phRows.push([fmtDate(s.date),t,op,s.prices[t],s.prices[t]>op?`↑ +₹${s.prices[t]-op}`:`↓ -₹${op-s.prices[t]}`]));
    });
  phRows.push([],[`Current Prices – ${fmtDate(getToday())}`,""]);
  MILK_TYPES.forEach(t=>phRows.push([t,prices[t]]));
  const ws4=XLSX.utils.aoa_to_sheet(phRows);
  ws4["!cols"]=[{wch:16},{wch:14},{wch:12},{wch:12},{wch:14}];
  XLSX.utils.book_append_sheet(wb,ws4,"Price History");

  XLSX.writeFile(wb,`Dairy_${monthLabel.replace(/\s/g,"_")}.xlsx`);
}

function downloadCustomerExcel(customer:Customer,entries:MilkEntry[],payments:Payment[],prices:Prices,monthLabel:string) {
  const mp=new Date().toISOString().slice(0,7);
  const ce=entries.filter(e=>e.customerId===customer.id&&e.date.startsWith(mp)).sort((a,b)=>a.date.localeCompare(b.date));
  const bill=calcMonthlyBill(customer.id,ce,payments);
  const wb=XLSX.utils.book_new();
  const rows:(string|number)[][]=[[`Milk Bill – ${customer.name} – ${monthLabel}`],[`Phone: ${customer.phone}   Address: ${customer.address}`],[],
    ["Date","Milk Type","Qty","Rate (₹)","Amount (₹)","Extra (₹)"]];
  ce.forEach(e=>{
    const nm=e.milkItems.every(m=>m.qty===0)||e.milkItems.length===0;
    if(nm){ rows.push([fmtDate(e.date),"No milk",0,"—",0,0]); }
    else { e.milkItems.filter(m=>m.qty>0).forEach((m,i)=>rows.push([i===0?fmtDate(e.date):"",m.type,m.qty,m.price,m.qty*m.price,i===0?e.pettyExpense:0])); }
  });
  rows.push([],[],[],["","","","Milk Total",bill.milkAmount,""],["","","","Extra Expenses",bill.pettyTotal,""],
    ["","","","Grand Total",bill.total,""],["","","","Paid",bill.paid,""],["","","","Pending",bill.pending,""]);
  const ws=XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:5}},{s:{r:1,c:0},e:{r:1,c:5}}];
  ws["!cols"]=[{wch:16},{wch:14},{wch:8},{wch:10},{wch:12},{wch:10}];
  XLSX.utils.book_append_sheet(wb,ws,"Monthly Bill");
  XLSX.writeFile(wb,`Bill_${customer.name.replace(/\s/g,"_")}_${monthLabel.replace(/\s/g,"_")}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,setScreen]           = useState<Screen>(()=>getToken()?"app":"login");
  const [tab,setTab]                 = useState("home");
  const [customers,setCustomers]     = useState<Customer[]>([]);
  const [prices,setPrices]           = useState<Prices>(INIT_PRICES);
  const [priceHistory,setPriceHistory] = useState<PriceSnapshot[]>([]);
  const [entries,setEntries]         = useState<MilkEntry[]>([]);
  const [payments,setPayments]       = useState<Payment[]>([]);
  const [selCust,setSelCust]         = useState<Customer|null>(null);
  const [detailView,setDetailView]   = useState<DetailView>(null);
  const [loading,setLoading]         = useState(false);
  const [appError,setAppError]       = useState("");
  const { msg:toastMsg, show:showToast } = useToast();

  const [entryDate,setEntryDate]     = useState(getToday());
  const [drafts,setDrafts]           = useState<Record<string,DraftEntry>>({});

  const monthLabel = new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"});

  // ── Load all data ───────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true); setAppError("");
    try {
      const [custs, priceData, phist, ents, pays] = await Promise.all([
        customerAPI.list(),
        priceAPI.getCurrent(),
        priceAPI.getHistory(),
        entryAPI.byMonth(currMonth()),
        paymentAPI.byMonth(currMonth()),
      ]);
      const c = custs.map(nc);
      const p = priceData.prices as Prices;
      const e = ents.map(ne);
      setCustomers(c);
      setPrices(p);
      setPriceHistory(phist.map(nph));
      setEntries(e);
      setPayments(pays.map(np));
      setDrafts(buildDrafts(c, p, e, getToday()));
    } catch(err: any) {
      setAppError(err.message ?? "Failed to load data. Is the backend running?");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (screen==="app") loadAll(); }, [screen, loadAll]);

  // Rebuild drafts when date changes
  const handleDateChange = useCallback(async (d:string) => {
    setEntryDate(d);
    // If different month, fetch entries for that date
    if (!d.startsWith(currMonth())) {
      try {
        const dateEntries = await entryAPI.byDate(d);
        setDrafts(buildDrafts(customers, prices, dateEntries.map(ne), d));
      } catch { setDrafts(buildDrafts(customers, prices, [], d)); }
    } else {
      setDrafts(buildDrafts(customers, prices, entries, d));
    }
  }, [customers, prices, entries]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const saveEntry = async (cId:string, draft:DraftEntry) => {
    try {
      const saved = await entryAPI.save({
        customerId: cId, date: entryDate,
        milkItems: draft.milkItems.filter(m=>m.qty>0),
        pettyExpense: draft.pettyExpense,
        delivered: !draft.skipped,
      });
      const newE = ne(saved);
      setEntries(prev=>[...prev.filter(e=>!(e.customerId===cId&&e.date===entryDate)), newE]);
      setDrafts(prev=>({...prev,[cId]:{...draft,saved:true}}));
      showToast("Entry saved ✓");
    } catch(err:any) { showToast("❌ "+err.message); }
  };

  const saveEntryForDate = async (cId:string, date:string, draft:DraftEntry) => {
    try {
      const saved = await entryAPI.save({
        customerId: cId, date,
        milkItems: draft.milkItems.filter(m=>m.qty>0),
        pettyExpense: draft.pettyExpense,
        delivered: !draft.skipped,
      });
      const newE = ne(saved);
      setEntries(prev=>[...prev.filter(e=>!(e.customerId===cId&&e.date===date)), newE]);
      if (date === entryDate) setDrafts(prev=>({...prev,[cId]:{...draft,saved:true}}));
      showToast("Entry updated ✓");
    } catch(err:any) { showToast("❌ "+err.message); }
  };

  const handlePriceUpdate = async (newPrices:Prices) => {
    try {
      const res = await priceAPI.update(newPrices);
      const updated = res.prices as Prices;
      if (Object.keys(res.changed ?? {}).length > 0) {
        const snap = await priceAPI.getHistory();
        setPriceHistory(snap.map(nph));
      }
      setPrices(updated);
      showToast("Prices updated ✓ — applies from today's entries");
    } catch(err:any) { showToast("❌ "+err.message); }
  };

  const addCustomer = async (data:Omit<Customer,"id">) => {
    try {
      const c = nc(await customerAPI.create(data));
      setCustomers(prev=>[...prev,c]);
      setDrafts(prev=>({...prev,[c.id]:{
        milkItems:c.defaultMilk.map(m=>({type:m.type,qty:m.qty,price:prices[m.type]})),
        pettyExpense:0,saved:false,skipped:false}}));
      showToast("Customer added 🎉");
    } catch(err:any) { showToast("❌ "+err.message); }
  };

  const updateCustomer = async (id:string, data:Partial<Customer>) => {
    try {
      const c = nc(await customerAPI.update(id, data));
      setCustomers(prev=>prev.map(x=>x.id===id?c:x));
      showToast("Updated ✓");
    } catch(err:any) { showToast("❌ "+err.message); }
  };

  const deleteCustomer = async (id:string) => {
    try {
      await customerAPI.delete(id);
      setCustomers(prev=>prev.filter(c=>c.id!==id));
      showToast("Customer removed");
    } catch(err:any) { showToast("❌ "+err.message); }
  };

  const addPayment = async (cId:string, amount:number) => {
    try {
      const p = np(await paymentAPI.create({ customerId:cId, amount, date:getToday() }));
      setPayments(prev=>[...prev,p]);
      showToast(`Payment: ${fmtRupee(amount)} ✓`);
    } catch(err:any) { showToast("❌ "+err.message); }
  };

  const savedCount = Object.values(drafts).filter(d=>d.saved).length;
  const handleTabChange = (t:string) => { setTab(t); setDetailView(null); setSelCust(null); };
  const handleLogout = () => { clearToken(); setScreen("login"); setCustomers([]); setEntries([]); setPayments([]); };
  const handleExportAll = () => { downloadExcel(customers,entries,payments,priceHistory,prices,monthLabel); showToast("📥 Excel downloaded!"); };

  if (screen==="login") return <LoginScreen onLogin={(token)=>{ setToken(token); setScreen("app"); }}/>;

  if (loading) return (
    <div className="app"><div className="loader">
      <div className="spinner"/><div style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:"var(--brown2)"}}>Loading dairy data…</div>
    </div></div>
  );

  return (
    <div className="app">
      {toastMsg && <div className="toast">{toastMsg}</div>}
      {appError && (
        <div className="err-box">
          {appError}
          <button className="btn btn-red btn-sm" style={{marginTop:12,width:"100%"}} onClick={loadAll}>Retry</button>
        </div>
      )}

      {detailView==="customer-detail"&&selCust&&(
        <CustomerDetailPage customer={selCust} entries={entries} payments={payments} prices={prices}
          onBack={()=>setDetailView(null)} onMonthly={()=>setDetailView("monthly-report")}
          onPayment={amt=>addPayment(selCust.id,amt)}
          onExport={()=>{ downloadCustomerExcel(selCust,entries,payments,prices,monthLabel); showToast("📥 Bill downloaded!"); }}/>
      )}
      {detailView==="monthly-report"&&selCust&&(
        <MonthlyReportPage customer={selCust} entries={entries} payments={payments} prices={prices}
          onBack={()=>setDetailView("customer-detail")} showToast={showToast}
          onExport={()=>{ downloadCustomerExcel(selCust,entries,payments,prices,monthLabel); showToast("📥 Bill downloaded!"); }}
          onEditEntry={saveEntryForDate}/>
      )}

      {!detailView&&(
        <>
          {tab==="home"      &&<DashboardScreen customers={customers} entries={entries} savedCount={savedCount} totalCustomers={customers.length} onGoEntry={()=>setTab("entry")}/>}
          {tab==="entry"     &&<DailyEntryScreen customers={customers} prices={prices} drafts={drafts} entryDate={entryDate} onDateChange={handleDateChange} onSaveEntry={saveEntry} setDrafts={setDrafts}/>}
          {tab==="customers" &&<CustomersScreen customers={customers} entries={entries} payments={payments} prices={prices} onAdd={addCustomer} onUpdate={updateCustomer} onDelete={deleteCustomer} onDetail={c=>{setSelCust(c);setDetailView("customer-detail");}} onReport={c=>{setSelCust(c);setDetailView("monthly-report");}} showToast={showToast}/>}
          {tab==="report"    &&<ReportsScreen customers={customers} entries={entries} payments={payments} prices={prices} onCustomerReport={c=>{setSelCust(c);setDetailView("monthly-report");}} setSelectedCustomer={setSelCust} onExportAll={handleExportAll}/>}
          {tab==="settings"  &&<SettingsScreen prices={prices} priceHistory={priceHistory} onSave={handlePriceUpdate} showToast={showToast} onLogout={handleLogout} onExportAll={handleExportAll}/>}
          <BottomNav tab={tab} setTab={handleTabChange} savedCount={savedCount} total={customers.length}/>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({onLogin}:{onLogin:(token:string)=>void}) {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [error,setError]=useState("");
  const [shaking,setShaking]=useState(false);
  const [loading,setLoading]=useState(false);

  const shake=()=>{ setShaking(true); setTimeout(()=>setShaking(false),400); };

  const handleLogin=async()=>{
    if(!username||!password){ setError("Enter username and password"); shake(); return; }
    setLoading(true); setError("");
    try {
      const { token } = await authAPI.login(username.trim(), password);
      onLogin(token);
    } catch(err:any) { shake(); setError(err.message ?? "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div style={{padding:"56px 24px 24px",textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:16,lineHeight:1}}>🥛</div>
        <div style={{fontFamily:"'Baloo 2',cursive",fontSize:34,fontWeight:800,color:"var(--gold)"}}>Dhanlaxmi Parlour</div>
        <div style={{fontSize:14,color:"rgba(253,230,138,.65)",marginTop:6,fontWeight:500}}>Milk Delivery Management</div>
      </div>

      <div className={`login-card ${shaking?"shake":""}`}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:"var(--brown)"}}>Welcome back 👋</div>
          <div style={{fontSize:13,color:"var(--gray)",marginTop:4}}>Sign in to your dairy account</div>
        </div>

        <div style={{marginBottom:14}}>
          <div className="input-label">Username</div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>👤</span>
            <input className="input" value={username} autoCapitalize="none"
              onChange={e=>{setUsername(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter username" style={{paddingLeft:44}}/>
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <div className="input-label">Password</div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🔒</span>
            <input className="input" type={showPass?"text":"password"} value={password}
              onChange={e=>{setPassword(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter password" style={{paddingLeft:44,paddingRight:50}}/>
            <button onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",fontSize:18,color:"var(--gray)"}}>
              {showPass?"🙈":"👁️"}
            </button>
          </div>
        </div>

        {error&&<div style={{background:"var(--red-l)",border:"1.5px solid var(--red)",borderRadius:10,padding:"10px 14px",textAlign:"center",fontSize:13,fontWeight:700,color:"var(--red)",marginBottom:16}}>⚠️ {error}</div>}

        <button className="btn btn-gold btn-lg" onClick={handleLogin} disabled={loading}>
          {loading?<><span className="spin">⏳</span> Signing in…</>:"Sign In →"}
        </button>

        <div style={{marginTop:20,padding:"12px 16px",background:"var(--cream2)",borderRadius:12,fontSize:12,color:"var(--brown2)",textAlign:"center",lineHeight:1.8}}>
          First time? Create admin account via:<br/>
          <code style={{fontSize:11,background:"rgba(0,0,0,.07)",padding:"2px 6px",borderRadius:4}}>
            POST /api/auth/register
          </code><br/>
          <span style={{fontSize:11,color:"var(--gray)"}}>See README.md for details</span>
        </div>
      </div>
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({tab,setTab,savedCount,total}:{tab:string;setTab:(t:string)=>void;savedCount:number;total:number}) {
  return (
    <nav className="bottom-nav">
      {[{id:"home",label:"Home",icon:"🏠"},{id:"entry",label:"Entry",icon:"🥛"},
        {id:"customers",label:"Customers",icon:"👥"},{id:"report",label:"Reports",icon:"📊"},{id:"settings",label:"Settings",icon:"⚙️"}].map(it=>(
        <button key={it.id} className={`nav-btn ${tab===it.id?"active":""}`} onClick={()=>setTab(it.id)}>
          <span className="icon">{it.icon}</span><span>{it.label}</span>
          {it.id==="entry"&&<span style={{position:"absolute",top:6,fontSize:9,background:savedCount>=total&&total>0?"var(--green)":"#DC2626",color:"#fff",padding:"1px 5px",borderRadius:100,fontWeight:700}}>
            {savedCount>=total&&total>0?"✓":`${savedCount}/${total}`}
          </span>}
        </button>
      ))}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY ENTRY SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
interface DEProps { customers:Customer[];prices:Prices;drafts:Record<string,DraftEntry>;entryDate:string;
  onDateChange:(d:string)=>void;onSaveEntry:(cId:string,d:DraftEntry)=>Promise<void>;
  setDrafts:React.Dispatch<React.SetStateAction<Record<string,DraftEntry>>>; }

function DailyEntryScreen({customers,prices,drafts,entryDate,onDateChange,onSaveEntry}:DEProps) {
  const [openId,setOpenId]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const savedCount=Object.values(drafts).filter(d=>d.saved).length;
  const skippedCount=Object.values(drafts).filter(d=>d.saved&&d.skipped).length;
  const pct=customers.length>0?(savedCount/customers.length)*100:0;
  const openCust=openId?customers.find(c=>c.id===openId):undefined;

  const handleSave=async(draft:DraftEntry)=>{
    if(!openId) return;
    setSaving(true);
    await onSaveEntry(openId,draft);
    setSaving(false); setOpenId(null);
  };

  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div className="header">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div><div className="header-title">🥛 Daily Entry</div><div className="header-sub">Tap a customer to enter pouches</div></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color:"var(--gold)"}}>{savedCount}/{customers.length}</div>
            <div style={{fontSize:10,color:"rgba(253,230,138,.65)",fontWeight:600}}>SAVED</div>
          </div>
        </div>
        <div className="progress" style={{marginBottom:14}}><div className="progress-fill" style={{width:`${pct}%`}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,.15)",borderRadius:14,padding:"10px 14px"}}>
          <span style={{fontSize:20}}>📅</span>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:"rgba(253,230,138,.65)",fontWeight:700,letterSpacing:".8px",marginBottom:4}}>ENTRY DATE</div>
            <input type="date" className="date-input" value={entryDate} max={getToday()} onChange={e=>onDateChange(e.target.value)}/>
          </div>
          <div style={{textAlign:"center",borderLeft:"1px solid rgba(255,255,255,.15)",paddingLeft:12}}>
            <div style={{fontSize:10,color:"rgba(253,230,138,.65)",fontWeight:600}}>NO MILK</div>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:"rgba(253,230,138,.8)"}}>{skippedCount}</div>
          </div>
        </div>
      </div>

      <div style={{padding:"10px 16px 4px",display:"flex",gap:8,flexWrap:"wrap"}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"var(--green-l)",borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:700,color:"var(--green)"}}>✓ {savedCount} saved</span>
        <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"var(--cream2)",borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:700,color:"var(--gold-d)"}}>⏳ {customers.length-savedCount} pending</span>
        {skippedCount>0&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"var(--gray-l)",borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:700,color:"var(--gray)"}}>✗ {skippedCount} no milk</span>}
      </div>

      <div className="scroll-area" style={{paddingTop:"8px",paddingLeft:"16px",paddingRight:"16px"}}>
        {customers.map((c,i)=>{
          const d=drafts[c.id]??{milkItems:c.defaultMilk.map(m=>({type:m.type,qty:m.qty,price:prices[m.type]})),pettyExpense:0,saved:false,skipped:false};
          const status=!d.saved?"pending":d.skipped?"skipped":"saved";
          const barColor=status==="saved"?"var(--green)":status==="skipped"?"#D1D5DB":"var(--gold)";
          const total=d.milkItems.reduce((a,m)=>a+m.qty*m.price,0)+(d.pettyExpense??0);
          return (
            <div key={c.id} className="cust-row slide-up" style={{animationDelay:`${i*.04}s`}} onClick={()=>setOpenId(c.id)}>
              <div className="cust-row-bar" style={{background:barColor}}/>
              <div className="cust-row-body">
                <div style={{fontFamily:"'Baloo 2',cursive",fontSize:16,fontWeight:700,color:"var(--brown)",marginBottom:5}}>{c.name}</div>
                {status==="pending"&&(<div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                  {c.defaultMilk.map((m,j)=><span key={j} className="milk-tag" style={{borderLeft:`3px solid ${MILK_COLORS[m.type]}`,fontSize:11}}>{m.type} × {m.qty}</span>)}
                  <span style={{fontSize:11,color:"var(--gray)"}}>default</span>
                </div>)}
                {status==="saved"&&!d.skipped&&(<div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                  {d.milkItems.filter(m=>m.qty>0).map((m,j)=><span key={j} className="milk-tag" style={{borderLeft:`3px solid ${MILK_COLORS[m.type]}`,fontSize:11}}>{m.type}×{m.qty} @₹{m.price}</span>)}
                  {d.pettyExpense>0&&<span className="badge badge-blue" style={{fontSize:11}}>+{fmtRupee(d.pettyExpense)}</span>}
                </div>)}
                {status==="skipped"&&<span style={{fontSize:12,color:"var(--gray)",fontWeight:600}}>No milk today</span>}
                {d.saved&&!d.skipped&&hasPriceChanged(d.milkItems,prices)&&(
                  <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,background:"var(--orange-l)",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700,color:"var(--orange)"}}>⚡ Entry uses old rate</div>
                )}
              </div>
              <div className="cust-row-right">
                <span style={{background:status==="saved"?"var(--green-l)":status==="skipped"?"var(--gray-l)":"var(--cream2)",color:status==="saved"?"var(--green)":status==="skipped"?"var(--gray)":"var(--gold-d)",padding:"3px 9px",borderRadius:100,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                  {status==="saved"?"✓ Saved":status==="skipped"?"No milk":"Tap →"}
                </span>
                {status==="saved"&&!d.skipped&&total>0&&<span style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:14,color:"var(--brown2)"}}>{fmtRupee(total)}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {openId&&openCust&&(
        <EntryModal customer={openCust} draft={drafts[openId]??{milkItems:openCust.defaultMilk.map(m=>({type:m.type,qty:m.qty,price:prices[m.type]})),pettyExpense:0,saved:false,skipped:false}} prices={prices} date={entryDate} saving={saving}
          onSave={handleSave} onClose={()=>setOpenId(null)}/>
      )}
    </div>
  );
}

// ── Entry Modal ───────────────────────────────────────────────────────────────
function EntryModal({customer,draft,prices,date,saving,onSave,onClose}:{
  customer:Customer;draft:DraftEntry;prices:Prices;date:string;saving:boolean;
  onSave:(d:DraftEntry)=>void;onClose:()=>void;
}) {
  const [items,setItems]           = useState<MilkItem[]>(draft.milkItems.map(m=>({...m})));
  const [petty,setPetty]           = useState(draft.pettyExpense);
  const [addingMilk,setAddingMilk] = useState(false);
  const [newType,setNewType]       = useState<MilkType>("Gold");

  useEffect(()=>{ if(!draft.saved) setItems(draft.milkItems.map(m=>({...m,price:prices[m.type]}))); },[]);

  const updateQty   =(i:number,d:number)=>setItems(p=>{const u=[...p];u[i]={...u[i],qty:Math.max(0,u[i].qty+d)};return u;});
  const setQty      =(i:number,v:number)=>setItems(p=>{const u=[...p];u[i]={...u[i],qty:Math.max(0,v)};return u;});
  const overrideType=(i:number,t:MilkType)=>setItems(p=>{const u=[...p];u[i]={...u[i],type:t,price:prices[t]};return u;});
  const addItem=()=>{ const ex=items.findIndex(m=>m.type===newType); if(ex>=0) updateQty(ex,1); else setItems(p=>[...p,{type:newType,qty:1,price:prices[newType]}]); setAddingMilk(false); };

  const allZero=items.every(m=>m.qty===0);
  const milkAmt=items.reduce((a,m)=>a+m.qty*m.price,0);
  const grandTotal=milkAmt+petty;

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&!saving&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:19,fontWeight:800,color:"var(--brown)"}}>{customer.name}</div>
            <div style={{fontSize:12,color:"var(--gray)",marginTop:2}}>📅 {fmtDay(date)} &nbsp;·&nbsp; 📞 {customer.phone}</div>
          </div>
          <button onClick={onClose} disabled={saving} style={{background:"var(--gray-l)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:15,color:"var(--gray)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        <div style={{fontFamily:"'Baloo 2',cursive",fontSize:13,fontWeight:700,color:"var(--brown2)",marginBottom:8}}>🥛 MILK POUCHES</div>

        {items.map((m,i)=>{
          const cp=prices[m.type];
          return (
            <div key={i} style={{background:"var(--gray-l)",borderRadius:14,padding:"12px 14px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{width:11,height:11,borderRadius:"50%",background:MILK_COLORS[m.type],display:"inline-block"}}/>
                  <span style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:16}}>{m.type}</span>
                  <span style={{fontSize:12,color:"var(--gray)"}}>@ {fmtRupee(m.price)}</span>
                  {cp>m.price&&<span className="badge-orange badge" style={{fontSize:10}}>↑ now ₹{cp}</span>}
                  {cp<m.price&&<span className="badge-green badge" style={{fontSize:10}}>↓ now ₹{cp}</span>}
                </div>
                <span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,fontSize:14,color:m.qty===0?"var(--gray)":"var(--brown2)"}}>{m.qty===0?"—":fmtRupee(m.qty*m.price)}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div className="stepper" style={{flex:1}}>
                  <button className="stepper-btn" onClick={()=>updateQty(i,-1)}>−</button>
                  <input className="stepper-num" type="number" min={0} value={m.qty} onChange={e=>setQty(i,parseInt(e.target.value)||0)} style={{flex:1,width:0}}/>
                  <button className="stepper-btn" onClick={()=>updateQty(i,+1)}>+</button>
                </div>
                {m.qty===0&&<span style={{fontSize:11,color:"var(--gray)",fontWeight:600,background:"#fff",padding:"4px 8px",borderRadius:8,border:"1px solid #E5E7EB",whiteSpace:"nowrap"}}>0 = no milk</span>}
              </div>
              <div>
                <div style={{fontSize:10,color:"var(--gray)",fontWeight:700,letterSpacing:".5px",marginBottom:5}}>SWITCH TYPE:</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {MILK_TYPES.map(t=><button key={t} className={`chip ${m.type===t?"selected":""}`} style={{fontSize:11,padding:"4px 10px"}} onClick={()=>overrideType(i,t)}>{t}</button>)}
                </div>
              </div>
            </div>
          );
        })}

        {!addingMilk?(<button className="btn btn-outline" style={{width:"100%",marginBottom:12}} onClick={()=>setAddingMilk(true)}>＋ Add Extra Milk</button>):(
          <div style={{background:"var(--cream2)",borderRadius:14,padding:14,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:"var(--brown2)"}}>Select type:</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {MILK_TYPES.map(t=><button key={t} className={`chip ${newType===t?"selected":""}`} onClick={()=>setNewType(t)}>{t} <span style={{fontSize:11,opacity:.7}}>₹{prices[t]}</span></button>)}
            </div>
            <div style={{display:"flex",gap:8}}><button className="btn btn-green" style={{flex:1}} onClick={addItem}>Add</button><button className="btn btn-ghost" onClick={()=>setAddingMilk(false)}>Cancel</button></div>
          </div>
        )}

        <div style={{marginBottom:14}}>
          <div className="input-label">Extra Expense (Curd / Paneer / Butter) ₹</div>
          <input className="input" type="number" value={petty||""} placeholder="0" onChange={e=>setPetty(Number(e.target.value)||0)}/>
        </div>

        <div style={{background:allZero?"var(--gray-l)":"var(--cream2)",borderRadius:14,padding:"14px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:"var(--gray)",fontWeight:700,letterSpacing:".5px",marginBottom:2}}>TOTAL AMOUNT</div>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color:allZero?"var(--gray)":"var(--gold-d)"}}>{allZero?"₹ 0  (No milk)":fmtRupee(grandTotal)}</div>
          </div>
          {!allZero&&(<div style={{textAlign:"right",fontSize:12,color:"var(--gray)",lineHeight:1.7}}>
            {items.filter(m=>m.qty>0).map((m,i)=><div key={i}>{m.type}: {m.qty}×₹{m.price}</div>)}
            {petty>0&&<div>Extra: {fmtRupee(petty)}</div>}
          </div>)}
        </div>

        <div style={{display:"grid",gap:10,gridTemplateColumns:allZero?"1fr":"1fr 1fr"}}>
          {!allZero&&<button className="btn btn-gold btn-lg" disabled={saving} onClick={()=>onSave({milkItems:items,pettyExpense:petty,saved:true,skipped:false})}>
            {saving?<><span className="spin">⏳</span> Saving…</>:"✓ Save Entry"}
          </button>}
          <button className={`btn btn-lg ${allZero?"btn-gold":"btn-ghost"}`} disabled={saving} style={{color:allZero?"var(--brown)":"var(--gray)"}}
            onClick={()=>onSave({milkItems:items.map(m=>({...m,qty:0})),pettyExpense:0,saved:true,skipped:true})}>
            {allZero?"✓ No Milk Today":"No milk today"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardScreen({customers,entries,savedCount,totalCustomers,onGoEntry}:{customers:Customer[];entries:MilkEntry[];savedCount:number;totalCustomers:number;onGoEntry:()=>void;}) {
  const ts=getToday(), mp=new Date().toISOString().slice(0,7);
  const te=entries.filter(e=>e.date===ts), me=entries.filter(e=>e.date.startsWith(mp));
  const tr=te.reduce((a,e)=>a+e.milkItems.reduce((s,m)=>s+m.qty*m.price,0),0);
  const mr=me.reduce((a,e)=>a+e.milkItems.reduce((s,m)=>s+m.qty*m.price,0),0);
  const md:MilkDist={};te.forEach(e=>e.milkItems.forEach(m=>{md[m.type]=(md[m.type]??0)+m.qty;}));
  const mmd:MilkDist={};me.forEach(e=>e.milkItems.forEach(m=>{mmd[m.type]=(mmd[m.type]??0)+m.qty;}));
  const tp=Object.values(mmd).reduce((a,v)=>a+(v??0),0);
  const pct=totalCustomers>0?savedCount/totalCustomers:0;
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div className="header">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div className="header-title">🥛 Dhanlaxmi Parlour</div><div className="header-sub">{fmtDate(ts)} · {getGreeting()}</div></div>
          <div style={{background:"rgba(245,158,11,.18)",borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontFamily:"'Baloo 2',cursive",fontSize:22,fontWeight:800,color:"var(--gold)"}}>{savedCount}/{totalCustomers}</div>
            <div style={{fontSize:10,color:"rgba(253,230,138,.65)",fontWeight:600}}>TODAY</div>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:12,color:"rgba(253,230,138,.75)",fontWeight:600}}>Today's progress</span>
            <span style={{fontSize:12,color:"var(--gold)",fontWeight:700}}>{Math.round(pct*100)}%</span>
          </div>
          <div className="progress"><div className="progress-fill" style={{width:`${pct*100}%`}}/></div>
        </div>
      </div>
      <div style={{padding:"16px 16px 90px"}}>
        {savedCount<totalCustomers&&<button className="btn btn-gold btn-lg slide-up" style={{marginBottom:16}} onClick={onGoEntry}>🚀 Start Today's Entry</button>}
        {savedCount===totalCustomers&&totalCustomers>0&&(<div style={{background:"var(--green-l)",border:"2px solid var(--green)",borderRadius:14,padding:16,marginBottom:16,textAlign:"center"}}><div style={{fontSize:24}}>✅</div><div style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:"var(--green)"}}>All entries done for today!</div></div>)}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {[{icon:"👥",l:"Customers",v:customers.length,c:"var(--blue)"},{icon:"💰",l:"Today's Rev.",v:fmtRupee(tr),c:"var(--green)"},
            {icon:"📅",l:"Month Rev.",v:fmtRupee(mr),c:"var(--gold-d)"},{icon:"🥛",l:"Month Pouches",v:tp,c:"var(--brown2)"}].map(s=>(
            <div key={s.l} className="stat-card slide-up" style={{borderTop:`3px solid ${s.c}`}}><div style={{fontSize:22,marginBottom:4}}>{s.icon}</div><div className="stat-val">{s.v}</div><div className="stat-label">{s.l}</div></div>
          ))}
        </div>
        {Object.keys(md).length>0&&(<div className="card slide-up" style={{padding:16,marginBottom:16}}>
          <div className="section-title" style={{marginBottom:12}}>Today's Milk</div>
          {(Object.entries(md) as [MilkType,number][]).map(([t,q])=><MilkBar key={t} type={t} qty={q} max={Math.max(...Object.values(md).map(v=>v??0))}/>)}
        </div>)}
        {tp>0&&(<div className="card slide-up" style={{padding:16,marginBottom:16}}>
          <div className="section-title" style={{marginBottom:12}}>This Month</div>
          {(Object.entries(mmd) as [MilkType,number][]).map(([t,q])=>(
            <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:10,height:10,borderRadius:"50%",background:MILK_COLORS[t],display:"inline-block"}}/><span style={{fontWeight:600,fontSize:14}}>{t}</span></div>
              <span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700}}>{q} pouches</span>
            </div>
          ))}
        </div>)}
      </div>
    </div>
  );
}
function MilkBar({type,qty,max}:{type:MilkType;qty:number;max:number}) {
  return (<div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:13,fontWeight:600}}>{type}</span><span style={{fontSize:13,fontWeight:700,color:"var(--brown2)"}}>{qty}</span></div><div className="progress"><div className="progress-fill" style={{width:`${max>0?(qty/max)*100:0}%`,background:MILK_COLORS[type]}}/></div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════
function CustomersScreen({customers,entries,payments,prices,onAdd,onUpdate,onDelete,onDetail,onReport,showToast}:{customers:Customer[];entries:MilkEntry[];payments:Payment[];prices:Prices;onAdd:(d:Omit<Customer,"id">)=>void;onUpdate:(id:string,d:Partial<Customer>)=>void;onDelete:(id:string)=>void;onDetail:(c:Customer)=>void;onReport:(c:Customer)=>void;showToast:(m:string)=>void;}) {
  const [search,setSearch]=useState(""); const [addModal,setAdd]=useState(false); const [editModal,setEdit]=useState<Customer|null>(null);
  const filtered=customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div className="header">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div className="header-title">👥 Customers</div><div className="header-sub">{customers.length} registered</div></div><button className="btn btn-gold btn-sm" onClick={()=>setAdd(true)}>＋ Add</button></div>
        <div className="search-wrap" style={{marginTop:12}}><span className="search-icon">🔍</span><input className="input search-input" placeholder="Search name or phone…" value={search} onChange={e=>setSearch(e.target.value)} style={{background:"rgba(255,255,255,.12)",color:"var(--cream)",border:"none"}}/></div>
      </div>
      <div className="scroll-area" style={{paddingTop:"12px",paddingLeft:"16px",paddingRight:"16px"}}>
        {filtered.map((c,i)=>{
          const bill=calcMonthlyBill(c.id,entries,payments);
          return (<div key={c.id} className="card slide-up" style={{marginBottom:12,animationDelay:`${i*.04}s`}}>
            <div style={{padding:"14px 14px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,cursor:"pointer"}} onClick={()=>onDetail(c)}>
                  <div style={{fontFamily:"'Baloo 2',cursive",fontSize:16,fontWeight:700}}>{c.name}</div>
                  <div style={{fontSize:12,color:"var(--gray)",marginTop:2}}>📞 {c.phone}</div>
                  <div style={{fontSize:12,color:"var(--gray)"}}>📍 {c.address}</div>
                </div>
                <div className={`badge ${bill.pending>0?"badge-red":bill.pending<0?"badge-green":"badge-gold"}`}>{bill.pending>0?`Due ${fmtRupee(bill.pending)}`:bill.pending<0?`Cr ${fmtRupee(-bill.pending)}`:"Clear"}</div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{c.defaultMilk.map((m,j)=><span key={j} className="milk-tag" style={{borderLeft:`3px solid ${MILK_COLORS[m.type]}`}}>{m.type} × {m.qty}</span>)}</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-gold btn-sm" style={{flex:1}} onClick={()=>onDetail(c)}>Details</button>
                <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={()=>onReport(c)}>📊 Bill</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setEdit(c)}>✏️</button>
                <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={()=>{if(confirm(`Delete ${c.name}?`))onDelete(c.id);}}>🗑️</button>
              </div>
            </div>
          </div>);
        })}
      </div>
      {addModal&&<CustomerFormModal title="Add Customer" prices={prices} onSave={d=>{onAdd(d);setAdd(false);}} onClose={()=>setAdd(false)}/>}
      {editModal&&<CustomerFormModal title="Edit Customer" initial={editModal} prices={prices} onSave={d=>{onUpdate(editModal.id,d);setEdit(null);}} onClose={()=>setEdit(null)}/>}
    </div>
  );
}

function CustomerFormModal({title,initial,prices,onSave,onClose}:{title:string;initial?:Customer;prices:Prices;onSave:(d:Omit<Customer,"id">)=>void;onClose:()=>void;}) {
  const [name,setName]=useState(initial?.name??"");const [phone,setPhone]=useState(initial?.phone??"");const [addr,setAddr]=useState(initial?.address??"");const [adv,setAdv]=useState(initial?.advance??0);const [dm,setDM]=useState<DefaultMilk[]>(initial?.defaultMilk??[{type:"Gold",qty:1}]);
  const upM=(i:number,f:keyof DefaultMilk,v:string|number)=>setDM(p=>{const u=[...p];u[i]={...u[i],[f]:v};return u;});
  const valid=name.trim()&&phone.trim();
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal"><div className="modal-handle"/>
        <div style={{fontFamily:"'Baloo 2',cursive",fontSize:18,fontWeight:700,marginBottom:16}}>{title}</div>
        <div className="input-label">Name *</div><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Customer name" style={{marginBottom:12}}/>
        <div className="input-label">Phone *</div><input className="input" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile" style={{marginBottom:12}}/>
        <div className="input-label">Address</div><input className="input" value={addr} onChange={e=>setAddr(e.target.value)} placeholder="Address" style={{marginBottom:12}}/>
        <div className="input-label">Advance Balance (₹)</div><input className="input" type="number" value={adv||""} onChange={e=>setAdv(Number(e.target.value)||0)} placeholder="0" style={{marginBottom:16}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="section-title">Default Milk</div>
          <button className="btn btn-gold btn-sm" onClick={()=>setDM(p=>[...p,{type:"Shakti",qty:1}])}>＋ Add</button>
        </div>
        {dm.map((m,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <select className="input" style={{flex:2,padding:"10px 12px"}} value={m.type} onChange={e=>upM(i,"type",e.target.value as MilkType)}>{MILK_TYPES.map(t=><option key={t}>{t}</option>)}</select>
          <div className="stepper" style={{flex:1}}><button className="stepper-btn" onClick={()=>upM(i,"qty",Math.max(1,m.qty-1))}>−</button><span className="stepper-num" style={{display:"block"}}>{m.qty}</span><button className="stepper-btn" onClick={()=>upM(i,"qty",m.qty+1)}>+</button></div>
          {dm.length>1&&<button className="btn btn-ghost btn-sm" style={{width:36,height:36,borderRadius:50}} onClick={()=>setDM(p=>p.filter((_,j)=>j!==i))}>✕</button>}
        </div>))}
        <div style={{marginTop:16}}><button className="btn btn-gold btn-lg" disabled={!valid} style={{opacity:valid?1:.5}} onClick={()=>onSave({name,phone,address:addr,advance:adv,defaultMilk:dm})}>Save Customer</button></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER DETAIL
// ═══════════════════════════════════════════════════════════════════════════════
function CustomerDetailPage({customer,entries,payments,prices,onBack,onMonthly,onPayment,onExport}:{customer:Customer;entries:MilkEntry[];payments:Payment[];prices:Prices;onBack:()=>void;onMonthly:()=>void;onPayment:(a:number)=>void;onExport:()=>void;}) {
  const [payModal,setPayModal]=useState(false);const [payAmt,setPayAmt]=useState("");
  const bill=calcMonthlyBill(customer.id,entries,payments);
  const cE=entries.filter(e=>e.customerId===customer.id).slice().reverse();
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div className="header"><div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.15)",border:"none",color:"var(--gold)",fontSize:20,padding:"6px 10px",borderRadius:10,cursor:"pointer"}}>←</button>
        <div><div className="header-title">{customer.name}</div><div className="header-sub">📞 {customer.phone}</div></div>
      </div></div>
      <div className="scroll-area" style={{paddingTop:"16px",paddingLeft:"16px",paddingRight:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <div className="card" style={{padding:14,borderTop:"3px solid var(--gold)"}}><div style={{fontSize:12,color:"var(--gray)",fontWeight:600,marginBottom:4}}>MONTH MILK</div><div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800}}>{fmtRupee(bill.milkAmount)}</div></div>
          <div className="card" style={{padding:14,borderTop:`3px solid ${bill.pending>0?"var(--red)":"var(--green)"}`}}><div style={{fontSize:12,color:"var(--gray)",fontWeight:600,marginBottom:4}}>{bill.pending>0?"PENDING":"CREDIT"}</div><div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:bill.pending>0?"var(--red)":"var(--green)"}}>{fmtRupee(Math.abs(bill.pending))}</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <button className="btn btn-gold" onClick={onMonthly}>📊 Monthly Bill</button>
          <button className="btn btn-green" onClick={()=>setPayModal(true)}>💰 Record Payment</button>
        </div>
        <button className="xl-btn" style={{marginBottom:16}} onClick={onExport}><span style={{fontSize:18}}>📥</span> Download Bill as Excel</button>
        <div className="section-hdr"><div className="section-title">Recent Entries</div></div>
        {cE.slice(0,15).map((e,i)=>{
          const amt=e.milkItems.reduce((a,m)=>a+m.qty*m.price,0)+(e.pettyExpense??0);
          const priceOld=e.milkItems.some(m=>m.price!==prices[m.type]);
          return (<div key={e.id} className="card slide-up" style={{marginBottom:8,padding:"12px 14px",animationDelay:`${i*.03}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontFamily:"'Baloo 2',cursive",fontWeight:600,fontSize:14}}>{fmtDay(e.date)}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>{priceOld&&<span style={{fontSize:10,color:"var(--orange)",fontWeight:700}}>old rate</span>}<span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:"var(--brown2)"}}>{fmtRupee(amt)}</span></div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {e.milkItems.length===0||e.milkItems.every(m=>m.qty===0)?<span className="badge badge-gray">No milk</span>:e.milkItems.map((m,j)=><span key={j} className="milk-tag" style={{fontSize:12,borderLeft:`2px solid ${MILK_COLORS[m.type]}`}}>{m.type}×{m.qty} @₹{m.price}</span>)}
              {e.pettyExpense>0&&<span className="badge badge-blue" style={{fontSize:11}}>+{fmtRupee(e.pettyExpense)}</span>}
            </div>
          </div>);
        })}
      </div>
      {payModal&&(<div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setPayModal(false)}>
        <div className="modal"><div className="modal-handle"/>
          <div style={{fontFamily:"'Baloo 2',cursive",fontSize:18,fontWeight:700,marginBottom:4}}>Record Payment</div>
          <div style={{fontSize:13,color:"var(--gray)",marginBottom:16}}>Pending: {fmtRupee(Math.max(0,bill.pending))}</div>
          <div className="input-label">Amount (₹)</div>
          <input className="input" type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder="Enter amount" style={{marginBottom:16}}/>
          <button className="btn btn-green btn-lg" disabled={!payAmt} onClick={()=>{onPayment(Number(payAmt));setPayModal(false);setPayAmt("");}}>💰 Record Payment</button>
        </div>
      </div>)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONTHLY REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function MonthlyReportPage({customer,entries,payments,prices,onBack,showToast,onExport,onEditEntry}:{customer:Customer;entries:MilkEntry[];payments:Payment[];prices:Prices;onBack:()=>void;showToast:(m:string)=>void;onExport:()=>void;onEditEntry:(cId:string,date:string,draft:DraftEntry)=>Promise<void>;}) {
  const now=new Date(), mp=now.toISOString().slice(0,7);
  const monthName=now.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const bill=calcMonthlyBill(customer.id,entries,payments);
  const me=entries.filter(e=>e.customerId===customer.id&&e.date.startsWith(mp)).sort((a,b)=>a.date.localeCompare(b.date));
  const hasMixed=me.some(e=>e.milkItems.some(m=>m.price!==prices[m.type]));
  const handleWA=()=>{
    const lines=(Object.entries(bill.milkTotals) as [MilkType,number][]).map(([t,q])=>{const a=me.reduce((s,e)=>s+e.milkItems.filter(m=>m.type===t).reduce((x,m)=>x+m.qty*m.price,0),0);return `${t}: ${q} pouches = ₹${a}`;}).join("\n");
    window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(`*Monthly Milk Bill - ${monthName}*\nCustomer: ${customer.name}\n\n${lines}${bill.pettyTotal>0?`\nExtra: ₹${bill.pettyTotal}`:""}\n\n*Total: ₹${bill.total}*\nPaid: ₹${bill.paid}\n*Pending: ₹${Math.max(0,bill.pending)}*\n\nDhanlaxmi Parlour`)}`,"_blank");
  };
  const rows:[string,string,string,boolean][]=[["Milk Amount",fmtRupee(bill.milkAmount),"var(--brown)",false],["Extra Expenses",fmtRupee(bill.pettyTotal),"var(--blue)",false],["Total",fmtRupee(bill.total),"var(--brown)",true],["Paid",fmtRupee(bill.paid),"var(--green)",false],[bill.pending>0?"Pending":"Credit",fmtRupee(Math.abs(bill.pending)),bill.pending>0?"var(--red)":"var(--green)",true]];
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div className="header"><div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.15)",border:"none",color:"var(--gold)",fontSize:20,padding:"6px 10px",borderRadius:10,cursor:"pointer"}}>←</button>
        <div><div className="header-title">{customer.name}</div><div className="header-sub">📅 {monthName}</div></div>
      </div></div>
      <div className="scroll-area" style={{paddingTop:"16px",paddingLeft:"16px",paddingRight:"16px"}}>
        {hasMixed&&(<div className="price-banner" style={{marginBottom:14}}><span style={{fontSize:18,flexShrink:0}}>⚡</span><div><div style={{fontWeight:700}}>Price changed mid-month</div><div style={{fontWeight:500,marginTop:2}}>Each day uses the rate active on that day.</div></div></div>)}
        <div className="card" style={{padding:16,marginBottom:12}}>
          <div className="section-title" style={{marginBottom:12}}>🥛 Milk Breakdown</div>
          {Object.keys(bill.milkTotals).length===0?<div style={{color:"var(--gray)",textAlign:"center",padding:"12px 0"}}>No entries this month</div>:(Object.entries(bill.milkTotals) as [MilkType,number][]).map(([t,q])=>{
            const a=me.reduce((s,e)=>s+e.milkItems.filter(m=>m.type===t).reduce((x,m)=>x+m.qty*m.price,0),0);
            return (<div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--gray-l)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:12,height:12,borderRadius:"50%",background:MILK_COLORS[t],display:"inline-block"}}/><span style={{fontWeight:600}}>{t}</span><span style={{fontSize:11,color:"var(--gray)"}}>{q} pouches</span></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,fontSize:15}}>{fmtRupee(a)}</div>{hasMixed&&<div style={{fontSize:10,color:"var(--orange)"}}>mixed rate</div>}</div>
            </div>);
          })}
        </div>
        <DayByDay entries={me} customer={customer} prices={prices} onEditEntry={onEditEntry}/>
        <div className="card" style={{padding:16,marginBottom:12}}>
          <div className="section-title" style={{marginBottom:12}}>💰 Bill Summary</div>
          {rows.map(([label,val,color,bold],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<4?"1px solid var(--gray-l)":"none"}}>
            <span style={{fontWeight:bold?700:500,fontSize:bold?16:14}}>{label}</span>
            <span style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:bold?20:15,color}}>{val}</span>
          </div>))}
        </div>
        <div style={{display:"grid",gap:10}}>
          <button className="xl-btn" onClick={onExport}><span style={{fontSize:18}}>📥</span> Download Bill as Excel</button>
          <button className="btn btn-green btn-lg" onClick={handleWA}>💬 Share on WhatsApp</button>
          <button className="btn btn-outline btn-lg" onClick={()=>{navigator.clipboard?.writeText(`Monthly Bill - ${monthName}\n${customer.name}\nTotal: ₹${bill.total}\nPaid: ₹${bill.paid}\nPending: ₹${Math.max(0,bill.pending)}`).catch(()=>{});showToast("📋 Copied!");}}>📋 Copy Report</button>
        </div>
      </div>
    </div>
  );
}

function DayByDay({entries,customer,prices,onEditEntry}:{entries:MilkEntry[];customer:Customer;prices:Prices;onEditEntry:(cId:string,date:string,draft:DraftEntry)=>Promise<void>}) {
  const [open,setOpen]=useState(false);
  const [editEntry,setEditEntry]=useState<MilkEntry|null>(null);
  const [saving,setSaving]=useState(false);

  const handleSave=async(draft:DraftEntry)=>{
    if(!editEntry) return;
    setSaving(true);
    await onEditEntry(customer.id,editEntry.date,draft);
    setSaving(false); setEditEntry(null);
  };

  return (
    <div className="card" style={{marginBottom:12,overflow:"visible"}}>
      <button onClick={()=>setOpen(p=>!p)} style={{width:"100%",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Baloo 2',cursive",fontSize:15,fontWeight:700,color:"var(--brown)"}}>
        <span>📆 Day-by-Day Breakdown</span>
        <span style={{fontSize:18,color:"var(--gray)",transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
      </button>
      {open&&(<div style={{borderTop:"1px solid var(--gray-l)"}}>
        {entries.map((e,i)=>{
          const amt=e.milkItems.reduce((a,m)=>a+m.qty*m.price,0)+(e.pettyExpense??0);
          const nm=e.milkItems.every(m=>m.qty===0)||e.milkItems.length===0;
          return (<div key={e.id} onClick={()=>setEditEntry(e)} style={{padding:"10px 16px",borderBottom:i<entries.length-1?"1px solid var(--gray-l)":"none",background:nm?"var(--gray-l)":"transparent",cursor:"pointer",transition:"background .12s"}}
            onMouseEnter={el=>(el.currentTarget.style.background=nm?"#e9eaec":"var(--cream2)")}
            onMouseLeave={el=>(el.currentTarget.style.background=nm?"var(--gray-l)":"transparent")}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Baloo 2',cursive",fontWeight:600,fontSize:13,color:nm?"var(--gray)":"var(--brown)"}}>{fmtDay(e.date)}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {nm?<span style={{fontSize:12,color:"var(--gray)",fontWeight:600}}>No milk</span>:<span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:"var(--brown2)",fontSize:13}}>{fmtRupee(amt)}</span>}
                <span style={{fontSize:11,color:"var(--gray)",fontWeight:600}}>✏️</span>
              </div>
            </div>
            {!nm&&(<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
              {e.milkItems.filter(m=>m.qty>0).map((m,j)=><span key={j} style={{fontSize:11,background:"var(--cream2)",borderRadius:6,padding:"2px 7px",fontWeight:600,color:"var(--brown2)",borderLeft:`2px solid ${MILK_COLORS[m.type]}`}}>{m.type}×{m.qty} @₹{m.price}</span>)}
              {e.pettyExpense>0&&<span style={{fontSize:11,background:"var(--blue-l)",borderRadius:6,padding:"2px 7px",fontWeight:600,color:"var(--blue)"}}>+{fmtRupee(e.pettyExpense)}</span>}
            </div>)}
          </div>);
        })}
      </div>)}
      {editEntry&&(<EntryModal customer={customer} draft={{milkItems:editEntry.milkItems.map(m=>({...m})),pettyExpense:editEntry.pettyExpense??0,saved:true,skipped:editEntry.milkItems.every(m=>m.qty===0)||editEntry.milkItems.length===0}} prices={prices} date={editEntry.date} saving={saving} onSave={handleSave} onClose={()=>setEditEntry(null)}/>)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function ReportsScreen({customers,entries,payments,prices,onCustomerReport,setSelectedCustomer,onExportAll}:{customers:Customer[];entries:MilkEntry[];payments:Payment[];prices:Prices;onCustomerReport:(c:Customer)=>void;setSelectedCustomer:(c:Customer)=>void;onExportAll:()=>void;}) {
  const now=new Date(),mp=now.toISOString().slice(0,7),mn=now.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const me=entries.filter(e=>e.date.startsWith(mp));
  const mr=me.reduce((a,e)=>a+e.milkItems.reduce((s,m)=>s+m.qty*m.price,0),0);
  const bills=customers.map(c=>({...c,bill:calcMonthlyBill(c.id,entries,payments)})).sort((a,b)=>b.bill.pending-a.bill.pending);
  const tp=bills.reduce((a,c)=>a+Math.max(0,c.bill.pending),0);
  const md:MilkDist={};me.forEach(e=>e.milkItems.forEach(m=>{md[m.type]=(md[m.type]??0)+m.qty;}));
  const mx=Math.max(...Object.values(md).map(v=>v??0),1);
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div className="header"><div className="header-title">📊 Reports</div><div className="header-sub">{mn}</div></div>
      <div className="scroll-area" style={{paddingTop:"16px",paddingLeft:"16px",paddingRight:"16px"}}>
        <button className="xl-btn" style={{marginBottom:16}} onClick={onExportAll}><span style={{fontSize:20}}>📥</span><div style={{textAlign:"left"}}><div>Download Full Monthly Report</div><div style={{fontSize:11,fontWeight:500,opacity:.8}}>All customers · Daily entries · Price history</div></div></button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <div className="card" style={{padding:14,borderTop:"3px solid var(--gold)"}}><div style={{fontSize:11,color:"var(--gray)",fontWeight:600,marginBottom:4}}>MONTH REVENUE</div><div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800}}>{fmtRupee(mr)}</div></div>
          <div className="card" style={{padding:14,borderTop:"3px solid var(--red)"}}><div style={{fontSize:11,color:"var(--gray)",fontWeight:600,marginBottom:4}}>TOTAL PENDING</div><div style={{fontFamily:"'Baloo 2',cursive",fontSize:20,fontWeight:800,color:"var(--red)"}}>{fmtRupee(tp)}</div></div>
        </div>
        <div className="card" style={{padding:16,marginBottom:16}}>
          <div className="section-title" style={{marginBottom:12}}>Milk Distribution (Month)</div>
          {(Object.entries(md) as [MilkType,number][]).map(([t,q])=>(<div key={t} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:"50%",background:MILK_COLORS[t],display:"inline-block"}}/><span style={{fontWeight:600,fontSize:14}}>{t}</span></div><span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,fontSize:14}}>{q} pouches</span></div>
            <div className="progress"><div className="progress-fill" style={{width:`${(q/mx)*100}%`,background:MILK_COLORS[t]}}/></div>
          </div>))}
          {Object.keys(md).length===0&&<div style={{color:"var(--gray)",textAlign:"center",padding:"12px 0"}}>No data this month</div>}
        </div>
        <div className="section-hdr"><div className="section-title">Customer Bills</div></div>
        {bills.map((c,i)=>(<div key={c.id} className="card slide-up" style={{marginBottom:8,padding:"12px 14px",animationDelay:`${i*.03}s`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700}}>{c.name}</span><span className={`badge ${c.bill.pending>0?"badge-red":c.bill.pending<0?"badge-green":"badge-gold"}`}>{c.bill.pending>0?`Due ${fmtRupee(c.bill.pending)}`:c.bill.pending<0?`Cr ${fmtRupee(-c.bill.pending)}`:"Clear"}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--gray)"}}><span>Total: {fmtRupee(c.bill.total)}</span><span>Paid: {fmtRupee(c.bill.paid)}</span></div>
          <button className="btn btn-outline btn-sm" style={{width:"100%",marginTop:8}} onClick={()=>{setSelectedCustomer(c);onCustomerReport(c);}}>View Full Bill</button>
        </div>))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsScreen({prices,priceHistory,onSave,showToast,onLogout,onExportAll}:{prices:Prices;priceHistory:PriceSnapshot[];onSave:(p:Prices)=>void;showToast:(m:string)=>void;onLogout:()=>void;onExportAll:()=>void;}) {
  const [local,setLocal]=useState<Prices>({...prices});const [showHist,setShowHist]=useState(false);
  const hasChanges=(Object.keys(local) as MilkType[]).some(t=>local[t]!==prices[t]);
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div className="header"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div className="header-title">⚙️ Settings</div><div className="header-sub">Prices & account</div></div><button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={onLogout}>Logout 🚪</button></div></div>
      <div className="scroll-area" style={{paddingTop:"16px",paddingLeft:"16px",paddingRight:"16px"}}>
        <button className="xl-btn" style={{marginBottom:16}} onClick={onExportAll}><span style={{fontSize:20}}>📥</span><div style={{textAlign:"left"}}><div>Export Full Report to Excel</div><div style={{fontSize:11,fontWeight:500,opacity:.8}}>Monthly summary · Entries · Customers · Prices</div></div></button>
        <div style={{background:"var(--blue-l)",border:"1.5px solid var(--blue)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:13,color:"var(--blue)"}}>
          <div style={{fontWeight:700,marginBottom:4}}>ℹ️ How price changes work</div>
          <div style={{fontWeight:500,lineHeight:1.6}}>Prices are locked at entry time. If Gold goes ₹34→₹36 on the 15th, days 1–14 bill at ₹34 and days 15–31 at ₹36. Monthly totals are always accurate.</div>
        </div>
        <div className="card" style={{padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div className="section-title">🥛 Milk Prices</div>{hasChanges&&<span className="badge badge-orange">Unsaved</span>}</div>
          {MILK_TYPES.map(t=>(<div key={t} style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:12,height:12,borderRadius:"50%",background:MILK_COLORS[t],display:"inline-block"}}/><span className="input-label" style={{margin:0}}>{t}</span></div>
              {local[t]!==prices[t]&&<span style={{fontSize:11,color:"var(--orange)",fontWeight:700}}>was ₹{prices[t]} → now ₹{local[t]}</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,fontSize:15,color:"var(--gray)"}}>₹</span><input className="input" type="number" value={local[t]} onChange={e=>setLocal(p=>({...p,[t]:Number(e.target.value)||0}))}/></div>
          </div>))}
          <button className="btn btn-gold btn-lg" style={{marginTop:8,opacity:hasChanges?1:.6}} disabled={!hasChanges} onClick={()=>onSave(local)}>Save New Prices</button>
          {!hasChanges&&<div style={{textAlign:"center",fontSize:12,color:"var(--gray)",marginTop:8}}>No changes to save</div>}
        </div>
        {priceHistory.length>0&&(<div className="card" style={{marginBottom:16,overflow:"visible"}}>
          <button onClick={()=>setShowHist(p=>!p)} style={{width:"100%",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Baloo 2',cursive",fontSize:15,fontWeight:700,color:"var(--brown)"}}>
            <span>📋 Price Change History ({priceHistory.length})</span>
            <span style={{fontSize:18,color:"var(--gray)",transform:showHist?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
          </button>
          {showHist&&(<div style={{borderTop:"1px solid var(--gray-l)"}}>
            {priceHistory.slice().reverse().map((snap,i)=>(<div key={i} style={{padding:"12px 16px",borderBottom:i<priceHistory.length-1?"1px solid var(--gray-l)":"none"}}>
              <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:600,fontSize:14,color:"var(--brown)",marginBottom:6}}>{fmtDate(snap.date)}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {(Object.entries(snap.changedFrom) as [MilkType,number][]).map(([t,op])=>(<div key={t} style={{display:"flex",alignItems:"center",gap:4,background:"var(--orange-l)",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700}}><span style={{width:8,height:8,borderRadius:"50%",background:MILK_COLORS[t],display:"inline-block"}}/><span style={{color:"var(--orange)"}}>{t}: ₹{op} → ₹{snap.prices[t]}</span></div>))}
              </div>
            </div>))}
          </div>)}
        </div>)}
        <div className="card" style={{padding:16,textAlign:"center",marginBottom:16}}><div style={{fontSize:40,marginBottom:8}}>🥛</div><div style={{fontFamily:"'Baloo 2',cursive",fontSize:18,fontWeight:700,color:"var(--brown)"}}>Dhanlaxmi Parlour Manager</div><div style={{fontSize:13,color:"var(--gray)",marginTop:4}}>v1.0 · Made for small dairy owners</div></div>
        <button className="btn btn-red btn-lg" onClick={onLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
