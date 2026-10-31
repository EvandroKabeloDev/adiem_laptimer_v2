 "use client";
import { useEffect, useMemo, useState } from "react";

type Row = Record<string, any>;
const modules = [
 {id:"overview",label:"Visão geral",icon:"◈"},
 {id:"telemetry",label:"Telemetria ao vivo",icon:"⌁"},
 {id:"events_v2",label:"Eventos e treinos",icon:"◷"},
 {id:"pilots_v2",label:"Pilotos",icon:"♙"},
 {id:"karts_v2",label:"Karts e manutenção",icon:"◉"},
 {id:"setups_v2",label:"Setups",icon:"⚙"},
 {id:"tracks_v2",label:"Pistas",icon:"⌘"},
 {id:"devices_v2",label:"Leitores e transponders",icon:"▦"},
 {id:"inventory_items_v2",label:"Estoque de peças",icon:"▤"},
 {id:"financial_entries_v2",label:"Financeiro e caixa",icon:"$"},
 {id:"clients_v2",label:"Clientes e equipes",icon:"♧"},
 {id:"reports",label:"Relatórios",icon:"▥"},
 {id:"admin_users_v2",label:"Administração",icon:"⚑"}
];
const config: Record<string,{title:string;desc:string;fields:string[]}> = {
 clients_v2:{title:"Clientes e equipes",desc:"Organizações, contato e personalização do portal.",fields:["name","email","phone","city","state","country","status","expires_at","company_name","brand_color"]},
 devices_v2:{title:"Leitores e transponders",desc:"Inventário de dispositivos e vínculo com cliente.",fields:["device_type","device_code","rasp_id","batch_code","registered_at","technology","client_id","status","last_seen_at","notes"]},
 pilots_v2:{title:"Pilotos",desc:"Cadastro esportivo e informações de equipe.",fields:["first_name","last_name","category","phone","email","birth_date","weight_kg","team_start_date","status","notes"]},
 karts_v2:{title:"Karts e manutenção",desc:"Cadastro de kart, histórico e acompanhamento de componentes.",fields:["number","chassis_name","chassis_model","chassis_year","engine_name","engine_model","engine_year","category","owner_name","status","notes"]},
 tracks_v2:{title:"Pistas",desc:"Kartódromos e pistas gerenciadas pela equipe.",fields:["name","country","state","city","kartodrome","is_default","status","notes"]},
 track_layouts_v2:{title:"Traçados",desc:"Configuração de cada traçado de pista.",fields:["track_id","name","length_m","direction","left_corners","right_corners","straights","sensor_main_location","sensor_s1_location","sensor_s2_location","sensor_s3_location","notes"]},
 events_v2:{title:"Eventos e treinos",desc:"Cenários, condições de pista e sessões.",fields:["name","event_date","track_id","layout_id","track_condition","ambient_temp_min","ambient_temp_max","track_temp_min","track_temp_max","status","notes"]},
 event_entries_v2:{title:"Participantes do evento",desc:"Associações de piloto, kart e transponder por evento.",fields:["event_id","pilot_id","kart_id","transponder_id","category","notes"]},
 setups_v2:{title:"Setups",desc:"Configurações versionadas do kart para comparação.",fields:["name","kart_id","event_id","setup_data","notes","created_by"]},
 maintenance_v2:{title:"Manutenção",desc:"Intervenções, componentes, responsáveis e custo.",fields:["kart_id","event_id","component","maintenance_date","usage_limit_hours","usage_limit_laps","details","parts_used","responsible","cost","status"]},
 inventory_items_v2:{title:"Estoque de peças",desc:"Peças, condição, valor e saldo.",fields:["name","manufacturer","technical_description","batch_code","entry_date","condition_percent","unit_cost","quantity","minimum_quantity","kart_id","payment_status","notes"]},
 inventory_movements_v2:{title:"Movimentações de estoque",desc:"Entradas, saídas, devoluções e consumo por kart.",fields:["item_id","movement_type","quantity","movement_date","kart_id","event_id","unit_cost","reason","notes"]},
 financial_entries_v2:{title:"Financeiro e caixa",desc:"Custos, receitas, pagamentos e pendências.",fields:["entry_type","description","category","amount","due_date","paid_at","payment_status","kart_id","event_id","supplier","notes"]},
 lap_notes_v2:{title:"Anotações de voltas",desc:"Observações associadas a uma volta da telemetria.",fields:["rt004_lap_id","session_id","note","pilot_name","kart_number"]},
 session_changes_v2:{title:"Alterações durante treino",desc:"Trocas de piloto/kart/transponder e alterações de setup.",fields:["session_id","change_type","pilot_id","kart_id","transponder_id","details","effective_lap_number"]},
 audit_log_v2:{title:"Auditoria",desc:"Registro de ações administrativas e alterações relevantes.",fields:["actor","action","entity_type","entity_id","details"]},
 admin_users_v2:{title:"Administração",desc:"Usuários internos e privilégios (sem login externo nesta etapa).",fields:["first_name","last_name","email","phone","city","state","country","role","status","expires_at"]}
};
const fieldLabels: Record<string,string> = {
 name:"Nome", email:"E-mail", phone:"Telefone", city:"Cidade", state:"Estado", country:"País",
 status:"Status", expires_at:"Data de expiração", company_name:"Nome da empresa", brand_color:"Cor da marca",
 device_type:"Tipo de dispositivo", device_code:"Código do dispositivo", rasp_id:"ID do Raspberry Pi", batch_code:"Lote",
 registered_at:"Data de cadastro", technology:"Tecnologia", client_id:"Cliente", last_seen_at:"Última comunicação",
 first_name:"Nome", last_name:"Sobrenome", category:"Categoria", birth_date:"Data de nascimento", weight_kg:"Peso (kg)",
 team_start_date:"Início na equipe", notes:"Observações", number:"Número", chassis_name:"Marca do chassi",
 chassis_model:"Modelo do chassi", chassis_year:"Ano do chassi", engine_name:"Marca do motor", engine_model:"Modelo do motor",
 engine_year:"Ano do motor", owner_name:"Proprietário", is_default:"Pista padrão", kartodrome:"Kartódromo",
 track_id:"Pista", length_m:"Comprimento (m)", direction:"Sentido", left_corners:"Curvas à esquerda",
 right_corners:"Curvas à direita", straights:"Retas", sensor_main_location:"Local do sensor principal",
 sensor_s1_location:"Local do sensor S1", sensor_s2_location:"Local do sensor S2", sensor_s3_location:"Local do sensor S3",
 event_date:"Data do evento", layout_id:"Traçado", track_condition:"Condição da pista", ambient_temp_min:"Temperatura ambiente mínima (°C)",
 ambient_temp_max:"Temperatura ambiente máxima (°C)", track_temp_min:"Temperatura da pista mínima (°C)",
 track_temp_max:"Temperatura da pista máxima (°C)", event_id:"Evento", pilot_id:"Piloto", kart_id:"Kart",
 transponder_id:"Transponder", setup_data:"Dados do setup (JSON)", created_by:"Criado por", component:"Componente",
 maintenance_date:"Data da manutenção", usage_limit_hours:"Limite de uso (horas)", usage_limit_laps:"Limite de uso (voltas)",
 details:"Detalhes", parts_used:"Peças utilizadas", responsible:"Responsável", cost:"Custo", manufacturer:"Fabricante",
 technical_description:"Descrição técnica", entry_date:"Data de entrada", condition_percent:"Condição (%)", unit_cost:"Custo unitário",
 quantity:"Quantidade", minimum_quantity:"Estoque mínimo", payment_status:"Situação do pagamento", item_id:"Item",
 movement_type:"Tipo de movimentação", movement_date:"Data da movimentação", reason:"Motivo", entry_type:"Tipo de lançamento",
 description:"Descrição", amount:"Valor", due_date:"Data de vencimento", paid_at:"Data do pagamento", supplier:"Fornecedor",
 rt004_lap_id:"ID da volta RT004", session_id:"Sessão", note:"Anotação", pilot_name:"Nome do piloto", kart_number:"Número do kart",
 change_type:"Tipo de alteração", effective_lap_number:"Volta efetiva", actor:"Responsável pela ação", action:"Ação",
 entity_type:"Tipo de registro", entity_id:"ID do registro", role:"Perfil de acesso",
};
const pretty=(s:string)=>fieldLabels[s] || s.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
function fmt(v:any){if(v===null||v===undefined||v==="")return "—"; if(typeof v==="object")return JSON.stringify(v); return String(v);}
export default function Home(){
 const [active,setActive]=useState("overview"),[rows,setRows]=useState<Row[]>([]),[laps,setLaps]=useState<Row[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(""),[showForm,setShowForm]=useState(false),[form,setForm]=useState<Row>({}),[search,setSearch]=useState("");
 const current=config[active];
 async function load(){
  setError("");setLoading(true);
  try{
   if(active==="telemetry"){const r=await fetch("/api/telemetry?limit=100",{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error);setLaps(j.data||[]);setRows([]);}
   else if(current){const r=await fetch(`/api/data?table=${active}&limit=200`,{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error);setRows(j.data||[]);setLaps([]);}
   else {setRows([]);setLaps([]);}
  }catch(e){setError(e instanceof Error?e.message:"Falha ao carregar dados");}finally{setLoading(false);}
 }
 useEffect(()=>{load();setShowForm(false);setSearch("");},[active]);
 const visible=useMemo(()=>rows.filter(r=>Object.values(r).some(v=>fmt(v).toLowerCase().includes(search.toLowerCase()))),[rows,search]);
 async function save(e:React.FormEvent){
  e.preventDefault();setError("");
  try{const r=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({table:active,record:form})});const j=await r.json();if(!r.ok)throw new Error(j.error);setShowForm(false);setForm({});load();}
  catch(e){setError(e instanceof Error?e.message:"Falha ao salvar");}
 }
 const statCards=[["Voltas registradas","rt004_laps"],["Pilotos","pilots_v2"],["Karts","karts_v2"],["Treinos/eventos","events_v2"]];
 return <main className="shell">
  <aside className="sidebar"><div className="brand"><div className="logo">A</div><div><b>ADIEM</b><small>MOTORSPORT SUITE <em>V2</em></small></div></div><div className="workspace"><span className="pulse"/> AMBIENTE DE OPERAÇÕES</div><nav>{modules.map(m=><button key={m.id} className={active===m.id?"nav active":"nav"} onClick={()=>setActive(m.id)}><span>{m.icon}</span>{m.label}</button>)}</nav><div className="sidebottom"><span className="pulse"/> Interface V2 · Supabase<br/><small>O acesso com autenticação será adicionado em uma etapa posterior.</small></div></aside>
  <section className="main"><header><div><div className="eyebrow">ADIEM / INTELIGÊNCIA DE COMPETIÇÃO</div><h1>{active==="overview"?"Painel de operação":active==="telemetry"?"Telemetria ao vivo":current?.title||"Relatórios"}</h1><p>{active==="overview"?"Uma visão integrada da operação, dos treinos e dos custos.":current?.desc|| (active==="telemetry"?"Tempos recentes registrados pelo backend atual RT004.":"Indicadores consolidados da operação.")}</p></div><div className="header-actions"><button className="btn ghost" onClick={load}>↻ Atualizar</button><span className="language">PT-BR⌄</span></div></header>
  {error&&<div className="alert"><b>Não foi possível concluir:</b> {error}<p>Confira se o SQL V2 foi executado e se as variáveis do Supabase estão configuradas no EasyPanel.</p></div>}
  {active==="overview"? <><div className="hero"><div><div className="eyebrow light">OPERAÇÃO DE CORRIDA · AMBIENTE AO VIVO</div><h2>Da pista à decisão.<br/><span>Todos os dados integrados.</span></h2><p>Telemetria, preparação do kart e custos em um só ambiente.</p><button className="btn white" onClick={()=>setActive("telemetry")}>Abrir telemetria <span>↗</span></button></div><div className="hero-orbit"><div className="orbit o1"/><div className="orbit o2"/><div className="orbit o3"/><div className="orbit-center">ADIEM<br/><small>NÚCLEO DE DADOS</small></div></div></div>
  <div className="stats">{statCards.map(([label,table],i)=><div className="stat" key={table}><div>{label}</div><strong>{i===0?"RT004": "—"}</strong><small>{i===0?"Fonte existente":"Disponível após configurar os dados da V2"}</small></div>)}</div>
  <div className="section-heading"><div><h2>Seu ambiente de trabalho</h2><p>Acesse os principais módulos da plataforma.</p></div></div><div className="tiles">{modules.filter(m=>!["overview","admin_users_v2"].includes(m.id)).map(m=><button className="tile" key={m.id} onClick={()=>setActive(m.id)}><span className="tile-icon">{m.icon}</span><b>{m.label}</b><small>{config[m.id]?.desc||"Indicadores e análises da operação."}</small><span className="arrow">↗</span></button>)}</div></>
  :active==="telemetry"?<><div className="toolbar"><div><span className="live-dot"/> <b>Dados RT004</b><small> · últimas 100 voltas registradas</small></div><button className="btn" onClick={load}>Atualizar voltas</button></div><div className="table-wrap"><table><thead><tr>{["Volta","Sessão","Kart RT004","Transponder","Tempo (ms)","Registrada em"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{laps.map((r,i)=><tr key={r.id||i}><td>{r.lap_number??r.id??"—"}</td><td className="mono">{fmt(r.session_id)}</td><td>{fmt(r.kart_id)}</td><td>{fmt(r.transponder_id)}</td><td className="time">{fmt(r.lap_time_ms??r.lap_time??r.duration_ms)}</td><td>{fmt(r.created_at)}</td></tr>)}</tbody></table>{!loading&&!laps.length&&<div className="empty">Nenhuma volta encontrada. A consulta utiliza `rt004_laps` sem alterar o sistema atual.</div>}</div><p className="hint">Nesta primeira entrega, a tabela exibe os registros existentes. A classificação ao vivo por piloto/kart, parciais e comparação de stint será conectada após confirmarmos os campos reais e a semântica dos tempos no banco.</p></>
  :current?<><div className="toolbar"><div><b>{visible.length}</b><small> registros carregados</small></div><div className="tools"><input className="search" placeholder="Buscar nos registros..." value={search} onChange={e=>setSearch(e.target.value)}/><button className="btn" onClick={()=>{setForm({});setShowForm(!showForm)}}>＋ Novo cadastro</button></div></div>
   {showForm&&<form className="form-card" onSubmit={save}><div className="form-title"><div><b>Novo cadastro</b><p>Preencha os campos aplicáveis. Os campos JSON devem conter um JSON válido.</p></div><button type="button" className="icon-btn" onClick={()=>setShowForm(false)}>×</button></div><div className="form-grid">{current.fields.map(f=><label key={f}>{pretty(f)}{f.endsWith("_data")||f==="setup_data"||f==="parts_used"||f==="details"?<textarea value={typeof form[f]==="string"?form[f]:""} onChange={e=>setForm({...form,[f]:e.target.value})} placeholder={f.includes("data")||f==="parts_used"||f==="details"?'Texto ou JSON':pretty(f)}/>:<input value={fmt(form[f]==null?"":form[f])} onChange={e=>setForm({...form,[f]:e.target.value})} placeholder={pretty(f)} />}</label>)}</div><div className="form-footer"><button type="button" className="btn ghost" onClick={()=>setShowForm(false)}>Cancelar</button><button className="btn" type="submit">Salvar cadastro</button></div></form>}
   <div className="table-wrap"><table><thead><tr>{(visible[0]?Object.keys(visible[0]):["id","name","status","created_at"]).slice(0,8).map(k=><th key={k}>{pretty(k)}</th>)}</tr></thead><tbody>{visible.map((r,i)=><tr key={r.id||i}>{Object.keys(visible[0]||{id:1,name:1,status:1,created_at:1}).slice(0,8).map(k=><td key={k} title={fmt(r[k])}>{fmt(r[k]).slice(0,90)}</td>)}</tr>)}</tbody></table>{!loading&&!visible.length&&<div className="empty">Nenhum registro encontrado. Use “Novo cadastro” para cadastrar o primeiro.</div>}</div><p className="hint">Os cadastros desta área usam tabelas com sufixo <code>_v2</code>. Esta versão inicial permite listar e inserir registros. Edição avançada, exclusão lógica e permissões serão implementadas nas próximas etapas.</p></>
  :<div className="report-grid"><div className="report-card"><div className="eyebrow">ANÁLISE</div><h2>Relatórios operacionais</h2><p>Os relatórios consolidados serão habilitados quando os dados de eventos, participantes, manutenção e financeiro estiverem sendo registrados.</p><button className="btn" onClick={()=>setActive("events_v2")}>Configurar eventos</button></div><div className="report-card"><div className="eyebrow">PRÓXIMAS MELHORIAS</div><h2>Resumo do treino</h2><p>Tempos por piloto e kart, melhores voltas, mudanças de setup, manutenções, peças utilizadas e custo estimado do treino.</p></div></div>}
  <footer>ADIEM MOTORSPORT SUITE V2 <span>·</span> Desenvolvido para preservar o sistema atual</footer>
  </section>
 </main>
}
