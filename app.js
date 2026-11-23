'use strict';

/*
  LUPUSCOPE — student research prototype
  - All research records are linked to their PubMed / PMC source.
  - New records are marked as candidate additions, not screened inclusions.
  - No patient-level data are used by the research analysis.
  - The default assistant is a local guided demo. For real AI, configure a secure
    server endpoint in window.LUPUSCOPE_CONFIG.assistantEndpoint. Never place an
    AI provider secret/API key in this front-end file.
*/

const CATEGORIES = [
  { id: 'overview', label: 'Overview & reviews', short: 'Overview', description: 'Broad clinical context and international perspectives.', image:'assets/domain-overview.svg' },
  { id: 'genetics', label: 'Genetics & molecular pathways', short: 'Genetics', description: 'Inherited susceptibility, rare variants, and immune pathways.', image:'assets/domain-genetics.svg' },
  { id: 'kidney', label: 'Kidney / lupus nephritis', short: 'Kidney', description: 'Renal manifestations, remission, and long-term outcomes.', image:'assets/domain-kidney.svg' },
  { id: 'cardiorespiratory', label: 'Heart & lungs', short: 'Heart & lungs', description: 'Cardiac, vascular, and pulmonary involvement.', image:'assets/domain-heart-lungs.svg' },
  { id: 'neuro', label: 'Brain & nervous system', short: 'Neuropsychiatric', description: 'Neurological and neuropsychiatric manifestations.', image:'assets/domain-neuro.svg' },
  { id: 'immune', label: 'Immunology & biomarkers', short: 'Immunology', description: 'Interferon signatures, autoantibodies, and biomarkers.', image:'assets/domain-immunology.svg' },
  { id: 'msk', label: 'Musculoskeletal & mucocutaneous', short: 'MSK & skin', description: 'Joint, muscle, skin, and mucosal manifestations.', image:'assets/domain-msk-skin.svg' }
];

const STUDY_TYPES = {
  meta: { label: 'Systematic review / meta-analysis', weight: 1.0 },
  review: { label: 'Narrative review', weight: 0.4 },
  cohort: { label: 'Cohort / cross-sectional', weight: 0.6 },
  casecontrol: { label: 'Case-control / genetic association', weight: 0.6 }
};

const STUDIES = [
  // Original 18 records from the uploaded Lupuscope prototype. Identifiers are retained; see ORIGINAL_REFERENCE.txt for the untouched source.
  { id:'PMC5604682', title:'Differences in clinical features between childhood-onset and adult-onset SLE: a systematic review and meta-analysis', year:2017, type:'meta', category:'overview', tags:['clinical','kidney','blood','brain'], summary:'Compares clinical features of childhood- and adult-onset lupus across published studies, including kidney, blood and seizure outcomes.', source:'PMC', original:true },
  { id:'PMC11377481', title:'Childhood-Onset Systemic Lupus Erythematosus (cSLE): An International Perspective', year:2024, type:'review', category:'overview', tags:['global','care'], summary:'Discusses international differences and challenges in cSLE research and care.', source:'PMC', original:true },
  { id:'PMC11332533', title:'Revisiting Childhood-Onset Systemic Lupus Erythematosus', year:2024, type:'review', category:'overview', tags:['clinical','laboratory'], summary:'Reviews current understanding of clinical and laboratory features of cSLE.', source:'PMC', original:true },
  { id:'PMC5996073', title:'Insights Gained From the Study of Pediatric Systemic Lupus Erythematosus', year:2018, type:'review', category:'genetics', tags:['genetics','complement','interferon','autoantibodies'], summary:'Explains how rare single-gene forms of lupus in children, cytokine profiles, and autoantibodies clarify disease development.', source:'PMC', original:true },
  { id:'PMC3489560', title:'Monogenic forms of systemic lupus erythematosus: new insights into SLE pathogenesis', year:2012, type:'review', category:'genetics', tags:['genetics','complement','interferon'], summary:'Reviews single-gene causes of lupus, including complement deficiencies, excess interferon-alpha, and defects in clearing dying cells.', source:'PMC', original:true },
  { id:'PMC7616038', title:'Review of genes and molecular pathways in monogenic lupus', year:null, type:'review', category:'genetics', tags:['genetics','complement','interferon'], summary:'Overview of genes behind monogenic lupus and implications for genetic testing and therapy.', source:'PMC', original:true, needsTitleCheck:true },
  { id:'PMC8084759', title:'Kidney outcomes for children with lupus nephritis', year:2020, type:'review', category:'kidney', tags:['kidney','outcomes','clinical'], summary:'Summarizes long-term kidney outcomes in childhood lupus nephritis and where care could improve.', source:'PMC', original:true },
  { id:'PMC10461610', title:'Principles of Pediatric Lupus Nephritis in a Prospective Contemporary Multi-Center Cohort', year:2021, type:'cohort', category:'kidney', tags:['kidney','outcomes','clinical'], summary:'Combines a literature review with a multi-center cohort to describe principles of pediatric lupus nephritis.', source:'PMC', original:true },
  { id:'PMC9831948', title:'Long-Term Outcomes of Children and Adolescents With Biopsy-Proven Childhood-Onset Lupus Nephritis', year:2022, type:'cohort', category:'kidney', tags:['kidney','outcomes','clinical'], summary:'Hong Kong cohort following children with biopsy-proven lupus nephritis for long-term kidney outcomes.', source:'PMC', original:true },
  { id:'PMC6207474', title:'Child-onset SLE is associated with a higher incidence of myopericardial manifestations compared to adult-onset disease', year:2018, type:'cohort', category:'cardiorespiratory', tags:['heart','clinical'], summary:'Compares rates of acute heart involvement in child-onset and adult-onset lupus.', source:'PMC', original:true },
  { id:'PMC6878620', title:'Pediatric SLE patients in South Africa have high prevalence and severity of cardiac and vascular manifestations', year:2019, type:'cohort', category:'cardiorespiratory', tags:['heart','clinical','outcomes'], summary:'South African cohort reporting frequent heart and vascular involvement and mortality differences.', source:'PMC', original:true },
  { id:'PMC3282137', title:'Extent of Subclinical Pulmonary Involvement in Childhood Onset SLE in the Sultanate of Oman', year:2012, type:'cohort', category:'cardiorespiratory', tags:['lungs','clinical','disease-activity'], summary:'Tests lung function in children to look for lung involvement without symptoms and relates it to disease measures.', source:'PMC', original:true },
  { id:'PMC5996412', title:'Neuropsychiatric Involvement in Juvenile-Onset Systemic Lupus Erythematosus', year:2018, type:'cohort', category:'neuro', tags:['brain','clinical'], summary:'Iranian patient series describing nervous-system and psychiatric manifestations of juvenile lupus.', source:'PMC', original:true },
  { id:'PMC8649437', title:'Neuropsychiatric involvement in juvenile-onset SLE: data from the UK JSLE Cohort Study', year:2021, type:'cohort', category:'neuro', tags:['brain','clinical','disease-activity'], summary:'UK cohort reporting nervous-system involvement and how it relates to overall disease activity and damage.', source:'PMC', original:true },
  { id:'PMC10412509', title:'Neuropsychiatric involvement in juvenile-onset systemic lupus erythematosus (jSLE)', year:2023, type:'review', category:'neuro', tags:['brain','clinical','interferon'], summary:'Reviews frequency, mechanisms, and treatment of neuropsychiatric involvement in juvenile lupus.', source:'PMC', original:true },
  { id:'PMC4980820', title:'Biomarkers for Childhood-Onset Systemic Lupus Erythematosus', year:2015, type:'review', category:'immune', tags:['biomarkers','kidney','autoantibodies','brain','interferon'], summary:'Reviews promising cSLE biomarkers, such as urinary proteins and complement products, and their limits.', source:'PMC', original:true },
  { id:'PMC7183668', title:'Higher interferon score and normal complement levels may identify a distinct clinical subset in children with SLE', year:2020, type:'cohort', category:'immune', tags:['interferon','complement','biomarkers'], summary:'Measures an interferon signature in children with lupus and asks whether combining it with complement levels separates patient groups.', source:'PMC', original:true },
  { id:'PMC8282643', title:'Cross-sectional study of plasma Axl, ferritin, IGFBP-4 and sTNFR2 as biomarkers of disease activity in childhood-onset SLE', year:2021, type:'cohort', category:'immune', tags:['biomarkers','disease-activity','kidney'], summary:'Tests four blood proteins for detecting disease activity, including kidney activity, in childhood lupus.', source:'PMC', original:true },

  // 14 newly identified candidate records. They remain candidates until formal screening is complete.
  { id:'PMID38747320', pmid:'38747320', title:'Updates in the care and management of children and adolescents with systemic lupus erythematosus', year:2024, type:'review', category:'overview', tags:['clinical','management','treat-to-target','pediatric'], summary:'A narrative review summarising recent developments in the care and management of children and adolescents with cSLE, including disease monitoring, treat-to-target concepts, and remaining evidence gaps.', population:'Narrative review of recent paediatric SLE literature', n:'Review article', finding:'Highlights current management themes and the continuing shortage of paediatric-specific randomized trials.', source:'PubMed', candidate:true, doi:'10.1097/BOR.0000000000001026' },
  { id:'PMC9038612', pmid:'34825516', pmc:'PMC9038612', title:'Epidemiology of Childhood-Onset Systemic Lupus Erythematosus: A Population-Based Study: A Lupus Midwest Network (LUMEN) Study', year:2022, type:'cohort', category:'overview', tags:['epidemiology','incidence','prevalence','population-based'], summary:'A population-based study using medical-record review in an eight-county US region to estimate childhood-onset SLE incidence and prevalence.', population:'Eight-county region in the United States; cases identified from 1976 to 2018', n:'13 incident cSLE cases identified during the study period', finding:'The adjusted incidence estimate was 0.7 per 100,000 children (95% CI 0.2–1.1); the authors emphasised the need for more population-based data.', source:'PubMed / PMC', candidate:true },

  { id:'PMC6668194', pmid:'31362757', pmc:'PMC6668194', title:'Whole exome sequencing in childhood-onset lupus frequently detects single gene etiologies', year:2019, type:'cohort', category:'genetics', tags:['genetics','whole-exome-sequencing','monogenic','rare-variants'], summary:'A clinical sequencing series using whole-exome sequencing in children with severe or atypical childhood-onset lupus to investigate monogenic causes.', population:'15 newly diagnosed childhood-onset SLE cases assessed at one paediatric centre', n:'15 cases; potentially causal variants reported in four subjects', finding:'The authors identified candidate single-gene causes involving C1QC, SLC7A7, MAN2B1, PTEN, and STAT1; confirm the variant-level details in the full text.', source:'PubMed / PMC', candidate:true },
  { id:'PMID40356234', pmid:'40356234', title:'Genetics of Childhood-Onset Systemic Lupus Erythematosus', year:2025, type:'casecontrol', category:'genetics', tags:['genetics','GWAS','HLA','risk-variants','ancestry'], summary:'A genome-wide association study examining genetic variants associated with age at SLE diagnosis and childhood-onset SLE.', population:'GWAS included 346 patients with cSLE and 4,080 children/adolescents without SLE in the case-control analysis', n:'346 cSLE cases; 4,080 controls in the GWAS comparison', finding:'The study reported a cSLE-associated locus near TSBP1-AS1 and HLA-DQA1; assess ancestry, study design, and replication when interpreting these signals.', source:'PubMed', candidate:true },

  { id:'PMC11985274', pmid:'38148127', pmc:'PMC11985274', title:'Long-term outcomes and associated prognostic risk factors of childhood-onset lupus nephritis', year:2025, type:'cohort', category:'kidney', tags:['kidney','lupus-nephritis','outcomes','chronic-kidney-disease'], summary:'A retrospective multicentre cohort from South Korea examining long-term kidney outcomes and prognostic factors in histologically diagnosed childhood-onset lupus nephritis.', population:'216 patients from 13 paediatric nephrology centres in South Korea', n:'216 patients; mean follow-up approximately 7.8 years', finding:'Advanced chronic kidney disease was reported in 14.8% at the last follow-up. Check the full paper for the definitions and adjusted prognostic analyses.', source:'PubMed / PMC', candidate:true, note:'Verify publication-date details and all extracted outcome figures in the original article.' },
  { id:'DOI-10.1093-rheumatology-keaf151', doi:'10.1093/rheumatology/keaf151', title:'How have the clinical, laboratory, treatment features and outcomes in children with lupus nephritis progressed over the last 30 years?', year:2025, type:'cohort', category:'kidney', tags:['kidney','lupus-nephritis','treatment','longitudinal-era-comparison'], summary:'A retrospective review of paediatric-onset lupus nephritis records comparing clinical, laboratory, treatment, and outcome features across two diagnosis eras.', population:'103 patients with paediatric-onset lupus nephritis at one centre', n:'103 patients', finding:'Compares patients diagnosed in 1993–2005 with those diagnosed in 2006–2023 to explore changes over time. Review the full text for group sizes and outcome definitions.', source:'DOI / Oxford Academic', candidate:true },

  { id:'PMID36912463', pmid:'36912463', title:'A 5-year follow-up of pulmonary function tests in childhood-onset systemic lupus erythematosus: a single-center retrospective study', year:2023, type:'cohort', category:'cardiorespiratory', tags:['lungs','pulmonary','pulmonary-function-tests','longitudinal'], summary:'A single-centre retrospective study describing pulmonary-function-test findings over five years in patients with childhood-onset SLE.', population:'42 patients with cSLE followed at one US centre', n:'42 patients', finding:'Ten of 42 patients (23.8%) had abnormal pulmonary-function tests. The paper describes restrictive patterns and diffusion impairment.', source:'PubMed', candidate:true, doi:'10.1177/09612033231163831' },
  { id:'PMID41238312', pmid:'41238312', title:'Exploring the prevalence of pulmonary involvement in juvenile-onset systemic lupus erythematosus: Data from the UK JSLE Cohort Study', year:2025, type:'cohort', category:'cardiorespiratory', tags:['lungs','pulmonary','UK-cohort','organ-involvement'], summary:'An analysis of pulmonary manifestations in the UK JSLE Cohort Study, considering involvement at diagnosis and during follow-up.', population:'480 patients in the UK JSLE Cohort Study', n:'480 patients', finding:'Pulmonary manifestations were reported in 24.8% overall. The abstract describes pulmonary serositis as the most common manifestation.', source:'PubMed', candidate:true, doi:'10.1016/j.reumae.2025.501975' },

  { id:'PMID36858168', pmid:'36858168', title:'Neuropsychiatric involvement in juvenile-onset systemic lupus erythematosus: A multicenter study', year:2023, type:'cohort', category:'neuro', tags:['brain','neuropsychiatric','multicenter','clinical'], summary:'A Turkish multicentre study examining neuropsychiatric manifestations, clinical patterns, and neurological sequelae in juvenile-onset SLE.', population:'1,107 patients from 24 referral centres in Turkey', n:'1,107 patients; 149 had neuropsychiatric involvement', finding:'Neuropsychiatric involvement was reported in 13.5% of the cohort. Check the paper for its case definitions and subgroup analyses.', source:'PubMed', candidate:true },
  { id:'PMC10922196', pmid:'37901986', pmc:'PMC10922196', title:'Implications of Inflammatory Processes on a Developing Central Nervous System in Childhood-onset Systemic Lupus Erythematosus', year:2024, type:'review', category:'neuro', tags:['brain','neuroinflammation','cognition','mood'], summary:'A review discussing inflammatory processes and possible mechanisms relevant to central nervous system manifestations in childhood-onset SLE.', population:'Narrative review of paediatric-onset SLE and central nervous system research', n:'Review article', finding:'Discusses neuroinflammation, ischaemia, and the possible role of central nervous system barriers; mechanistic hypotheses should not be mistaken for proven causal pathways.', source:'PubMed / PMC', candidate:true },

  { id:'PMC11200921', pmid:'38927451', pmc:'PMC11200921', title:'IFN-I Score and Rare Genetic Variants in Children with Systemic Lupus Erythematosus', year:2024, type:'cohort', category:'immune', tags:['interferon','immune-signature','genetic-variants','biomarkers'], summary:'A study evaluating type I interferon scores and SLE-associated genetic variants in a cohort of children with SLE.', population:'80 patients with childhood-onset SLE', n:'80 patients', finding:'The study evaluates the relationship between interferon activity and rare genetic variants. Review assay methods and the strength of any associations in the full text.', source:'PubMed / PMC', candidate:true },
  { id:'PMC11269505', pmid:'38914753', pmc:'PMC11269505', title:'Type I interferon pathway in pediatric systemic lupus erythematosus', year:2024, type:'review', category:'immune', tags:['interferon','innate-immunity','TLR','biomarkers'], summary:'A review of type I interferon signalling in paediatric SLE, including immune-cell sources and pathways discussed in the literature.', population:'Narrative review of paediatric SLE interferon research', n:'Review article', finding:'Summarises evidence for increased type I interferon signalling in paediatric SLE and discusses pathways requiring further investigation.', source:'PubMed / PMC', candidate:true },

  { id:'PMC11330147', pmid:'39152510', pmc:'PMC11330147', title:'Musculoskeletal manifestations in childhood-onset systemic lupus erythematosus: an in-depth exploration', year:2024, type:'cohort', category:'msk', tags:['musculoskeletal','arthritis','arthralgia','joint-pain'], summary:'A retrospective tertiary-centre study describing the spectrum and sequelae of musculoskeletal involvement in childhood-onset SLE.', population:'321 patients with cSLE treated at a tertiary centre in Thailand', n:'321 patients; musculoskeletal manifestations were recorded in 134', finding:'Musculoskeletal manifestations were reported in 41.7%; the paper describes arthralgia, arthritis, joint distribution, and avascular necrosis.', source:'PubMed / PMC', candidate:true },
  { id:'PMID24692572', pmid:'24692572', title:'Mucocutaneous manifestations in a UK national cohort of juvenile-onset systemic lupus erythematosus patients', year:2014, type:'cohort', category:'msk', tags:['mucocutaneous','skin','oral-ulcers','alopecia','UK-cohort'], summary:'A UK national cohort study examining mucocutaneous features at diagnosis and their relationship with major-organ involvement in juvenile-onset SLE.', population:'241 patients from 15 UK centres; juvenile-onset SLE meeting at least four ACR classification criteria', n:'241 patients; 179 (74%) had ACR-defined skin involvement', finding:'The abstract reports ACR-defined skin involvement in 74% of the cohort and describes additional skin lesions identified using the paediatric BILAG index. Review the full text for definitions and follow-up analyses.', source:'PubMed', candidate:true, doi:'10.1093/rheumatology/keu137' }

];

const GLOSSARY = [
  ['Autoimmune','A condition in which the immune system mistakenly targets the body’s own healthy tissues.'],
  ['Flare','A period when disease activity increases. Only the care team can assess whether symptoms represent a flare.'],
  ['Remission','A state in which disease activity is low or absent according to clinical assessment and defined criteria.'],
  ['Nephritis','Inflammation of the kidneys. In lupus, kidney involvement is called lupus nephritis.'],
  ['Autoantibody','An antibody that recognizes a target from the body’s own tissues.'],
  ['ANA','Antinuclear antibody: a blood test that may be positive in lupus, but is not specific enough to diagnose lupus by itself.'],
  ['Complement','A group of proteins that support immune functions; C3 and C4 are among the proteins measured in lupus care and research.'],
  ['Biopsy','A tissue sample examined by specialists, sometimes used to classify kidney involvement.'],
  ['Biomarker','A measurable feature that may reflect a biological process or disease state.'],
  ['Interferon signature','A pattern of activity in genes regulated by interferons; it is studied as part of immune-system research.'],
  ['Odds ratio','A measure comparing the odds of an outcome between two groups in a study.'],
  ['Confidence interval','A range expressing statistical uncertainty around an estimate.'],
  ['Heterogeneity','Differences between studies, populations, methods, or effects being combined.'],
  ['Cohort study','An observational design that follows or compares groups sharing defined characteristics.']
];

const EXTRACTION_SEED = {
  // Only preserve facts already present in the original prototype's abstract-level extraction sheet.
  PMC3282137:{n:'42',pop:'Children with cSLE, one university hospital in Oman',f:'8 of 42 (19%) had clinical lung involvement; the others were screened with lung function tests',l:'Single centre'},
  PMC5996412:{n:'41',pop:'Juvenile SLE with neuropsychiatric symptoms, Iran',f:'Manifestations classified with the 1999 ACR case definitions',l:''},
  PMC8649437:{n:'',pop:'UK JSLE Cohort Study',f:'About 25% had neuropsychiatric involvement; linked to higher overall disease activity and damage',l:''},
  PMC6878620:{n:'',pop:'Children with SLE, South Africa',f:'Cardiac and vascular involvement was frequent; reported mortality differed by involvement status',l:''},
  PMC9831948:{n:'',pop:'Biopsy-proven childhood-onset lupus nephritis, Hong Kong',f:'The abstract reports 83 children (90%) with proliferative lupus nephritis (class III/IV ± V)',l:'Verify denominator and exact outcome definitions in the full text'},
  PMC8084759:{n:'N/A',pop:'Review of childhood lupus nephritis',f:'Narrative review of childhood lupus nephritis outcomes',l:'Narrative review'},
  PMC10461610:{n:'',pop:'Multi-centre cohort plus a review of 15 studies (1992–2019)',f:'Identified six principles of lupus nephritis in cSLE',l:''},
  PMC8282643:{n:'',pop:'Childhood-onset SLE, Pediatric Nephrology Research Consortium',f:'Plasma ferritin and Axl were reported to outperform traditional measures for detecting activity',l:'Cross-sectional study'},
  PMC5604682:{n:'',pop:'Meta-analysis; searched MEDLINE, EMBASE, Cochrane Library, ClinicalTrials.gov',f:'Compares childhood- versus adult-onset SLE features',l:'Systematic review / meta-analysis'}
};

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const safe = (value='') => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const categoryOf = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
const getStudy = id => STUDIES.find(s => s.id === id);
const pmcUrl = id => `https://pmc.ncbi.nlm.nih.gov/articles/${encodeURIComponent(id)}/`;
const pubmedUrl = id => `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(id.replace('PMID',''))}/`;
const primaryUrl = s => s.pmc ? pmcUrl(s.pmc) : s.source === 'PMC' ? pmcUrl(s.id) : s.pmid ? pubmedUrl(s.pmid) : s.doi ? `https://doi.org/${s.doi}` : pubmedUrl(s.id);
const pmcLink = s => s.pmc ? pmcUrl(s.pmc) : (s.source === 'PMC' ? pmcUrl(s.id) : '');
const store = {
  get(key, fallback){ try { const value=localStorage.getItem(key); return value===null?fallback:JSON.parse(value); } catch { return fallback; } },
  set(key,value){ try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* local demo storage may be unavailable */ } },
  del(key){ try { localStorage.removeItem(key); } catch { /* no-op */ } }
};

let currentPage = 'home';
let activeCategory = '';
let libraryView = 'browse';
let compareIds = [];
let role = store.get('ls_ai_role', 'researcher');
let toastTimer;

function toast(message){
  const el=$('#toast'); if(!el) return;
  el.textContent=UI_TRANSLATIONS?.[currentInterfaceLanguage]?.[message] || message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
}

function showPage(page){
  if(!$('#page-'+page)) return;
  currentPage=page;
  $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
  $$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  const titleMap={home:'Overview',library:'Research library',analysis:'Evidence analysis',compare:'Compare studies',assistant:'Lupuscope AI',parents:'Parents’ guide',care:'Find care',community:'Community demo',about:'About & privacy'};
  $('#topTitle').textContent=titleMap[page]||'Lupuscope';
  $('#breadcrumb').textContent='WORKSPACE / '+(titleMap[page]||page).toUpperCase();
  $('#assistantContext').textContent=titleMap[page]||page;
  $('#sidebar').classList.remove('open');
  if(page==='library') renderLibrary();
  if(page==='analysis') renderAnalysis();
  if(page==='compare') renderCompare();
  if(page==='parents') renderGlossary();
  if(page==='community') renderCommunity();
  if(page==='assistant') $('#chatInput').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'smooth'});
}

function setRole(nextRole){
  role=nextRole; store.set('ls_ai_role',role);
  $('#roleChip').textContent=role==='parent'?'Parent / guardian view':'Researcher view';
  $('#roleModal').classList.add('hidden');
  updateSuggestedPrompts();
  toast(role==='parent'?'Parent / guardian view selected':'Researcher view selected');
}
function openRoleModal(){ $('#roleModal').classList.remove('hidden'); }

function renderHome(){
  $('#metricStudies').textContent=STUDIES.length;
  $('#metricDomains').textContent=CATEGORIES.length;
  $('#homeDomains').innerHTML=CATEGORIES.map(cat=>{
    const n=STUDIES.filter(s=>s.category===cat.id).length;
    const pct=Math.max(6,n/STUDIES.length*100);
    return `<button class="domain-row domain-image-row" data-domain="${safe(cat.id)}" title="Open ${safe(cat.label)}"><img src="${safe(cat.image)}" alt="" loading="lazy"><span class="domain-card-copy"><span class="domain-name">${safe(cat.short)}</span><small>${safe(cat.description)}</small><span class="domain-track"><span class="domain-fill" style="display:block;width:${pct}%"></span></span></span><span class="domain-count">${n}</span></button>`;
  }).join('');
  const newOnes=STUDIES.filter(s=>s.candidate).sort((a,b)=>(b.year||0)-(a.year||0)).slice(0,3);
  $('#recentStudies').innerHTML=newOnes.map(s=>`<article class="recent-item"><span class="candidate-badge">NEW CANDIDATE</span><strong>${safe(s.title)}</strong><small>${safe(s.year||'Year to verify')} · ${safe(categoryOf(s.category).short)} · ${safe(s.id)}</small></article>`).join('');
}

function renderCategoryButtons(){
  const counts=CATEGORIES.map(cat=>({...cat,count:STUDIES.filter(s=>s.category===cat.id).length}));
  $('#categoryButtons').innerHTML=`<button class="category-button ${activeCategory===''?'selected':''}" data-category="">All domains <small>${STUDIES.length}</small></button>`+counts.map(cat=>`<button class="category-button ${activeCategory===cat.id?'selected':''}" data-category="${safe(cat.id)}">${safe(cat.label)} <small>${cat.count}</small></button>`).join('');
}

function renderLibrary(){
  renderCategoryButtons();
  if(libraryView!=='browse'){ renderLibraryToolView(); return; }
  const query=($('#studySearch')?.value||'').trim().toLowerCase();
  const type=$('#typeFilter')?.value||'';
  const sort=$('#yearSort')?.value||'newest';
  let records=STUDIES.filter(s=>{
    const matchesCategory=!activeCategory||s.category===activeCategory;
    const matchesType=!type||s.type===type;
    const searchable=[s.title,s.summary,s.id,s.pmid,s.pmc,s.doi,s.tags.join(' '),categoryOf(s.category).label].filter(Boolean).join(' ').toLowerCase();
    return matchesCategory&&matchesType&&(!query||searchable.includes(query));
  });
  if(sort==='oldest') records.sort((a,b)=>(a.year||9999)-(b.year||9999));
  else if(sort==='az') records.sort((a,b)=>a.title.localeCompare(b.title));
  else records.sort((a,b)=>(b.year||0)-(a.year||0));
  $('#libraryResultCount').textContent=records.length;
  $('#activeFilterLabel').textContent=activeCategory?categoryOf(activeCategory).label:'All research domains';
  $('#studyGrid').innerHTML=records.map(renderStudyCard).join('');
  $('#emptyStudies').classList.toggle('hidden',records.length!==0);
  $('#studyGrid').classList.toggle('hidden',records.length===0);
}

function renderStudyCard(s){
  const cat=categoryOf(s.category);
  const type=STUDY_TYPES[s.type]?.label||s.type;
  return `<article class="study-card">
    <div class="study-card-top"><span class="${s.candidate?'candidate-badge':'original-badge'}">${s.candidate?'CANDIDATE ADDITION':'ORIGINAL RECORD'}</span><span class="study-type-badge">${safe(type)}</span></div>
    <h3>${safe(s.title)}</h3><p>${safe(s.summary)}</p>
    <div class="study-meta"><span class="study-type-badge">${safe(cat.short)}</span><span class="study-type-badge">${safe(s.year||'Year to verify')}</span></div>
    <div class="study-footer"><span class="study-id">${safe(s.id)}</span><div class="study-actions"><button class="mini-button" data-study-detail="${safe(s.id)}">Details</button><button class="mini-button" data-compare="${safe(s.id)}">${compareIds.includes(s.id)?'✓ Added':'+ Compare'}</button></div></div>
  </article>`;
}

function showStudyDetails(id){
  const s=getStudy(id); if(!s) return;
  const cat=categoryOf(s.category);
  const link=primaryUrl(s);
  const secondary=pmcLink(s);
  $('#studyModalContent').innerHTML=`
    <div class="study-card-top"><span class="${s.candidate?'candidate-badge':'original-badge'}">${s.candidate?'CANDIDATE ADDITION':'ORIGINAL PROTOTYPE RECORD'}</span><span class="study-type-badge">${safe(STUDY_TYPES[s.type]?.label||s.type)}</span></div>
    <h2 class="modal-study-title" id="studyModalTitle">${safe(s.title)}</h2>
    <p class="modal-study-summary">${safe(s.summary)}</p>
    <div class="detail-grid">
      <div class="detail-box"><span>Research domain</span><strong>${safe(cat.label)}</strong></div>
      <div class="detail-box"><span>Publication year</span><strong>${safe(s.year||'Needs verification')}</strong></div>
      <div class="detail-box"><span>Record identifier</span><strong>${safe(s.id)}</strong></div>
      <div class="detail-box"><span>Study type</span><strong>${safe(STUDY_TYPES[s.type]?.label||s.type)}</strong></div>
      ${s.population?`<div class="detail-box"><span>Population / setting</span><strong>${safe(s.population)}</strong></div>`:''}
      ${s.n?`<div class="detail-box"><span>Sample information</span><strong>${safe(s.n)}</strong></div>`:''}
    </div>
    ${s.finding?`<div class="resource-callout"><strong>Abstract-level finding</strong><span>${safe(s.finding)}</span></div>`:''}
    ${s.note?`<p class="panel-copy"><strong>Bibliographic note:</strong> ${safe(s.note)}</p>`:''}
    ${s.needsTitleCheck?`<p class="flow-warning">The title shown in the original prototype is a short description; verify the exact bibliographic title at the source.</p>`:''}
    ${s.candidate?`<div class="warning-banner"><strong>Candidate status</strong><span>Not yet confirmed as an included study. Check eligibility, duplicates, full text, and extraction accuracy before using it in the final evidence synthesis.</span></div>`:''}
    <div class="modal-links"><a href="${safe(link)}" target="_blank" rel="noopener noreferrer">Open source ↗</a>${secondary&&secondary!==link?`<a href="${safe(secondary)}" target="_blank" rel="noopener noreferrer">Open PMC full text ↗</a>`:''}${s.doi?`<a href="https://doi.org/${safe(s.doi)}" target="_blank" rel="noopener noreferrer">Open DOI ↗</a>`:''}<button class="mini-button" data-compare="${safe(s.id)}">${compareIds.includes(s.id)?'✓ In comparison':'Add to comparison'}</button></div>`;
  $('#studyModal').classList.remove('hidden');
}

function addCompare(id){
  if(compareIds.includes(id)){ compareIds=compareIds.filter(x=>x!==id); toast('Removed from comparison'); }
  else if(compareIds.length>=3){ toast('You can compare up to three studies'); return; }
  else { compareIds.push(id); toast('Study added to comparison'); }
  $('#compareCount').textContent=compareIds.length;
  renderLibrary(); renderCompare();
}
function renderCompare(){
  $('#compareCount').textContent=compareIds.length;
  const selected=compareIds.map(getStudy).filter(Boolean);
  if(!selected.length){ $('#compareView').innerHTML='<div class="compare-empty"><strong>No studies selected yet</strong>Go to the research library and choose “+ Compare” on up to three records.</div>'; return; }
  const fields=[['Title',s=>s.title],['Domain',s=>categoryOf(s.category).label],['Year',s=>s.year||'Needs verification'],['Study type',s=>STUDY_TYPES[s.type]?.label||s.type],['Population / setting',s=>s.population||'Not extracted yet'],['Sample information',s=>s.n||'Not extracted yet'],['Abstract-level summary',s=>s.summary],['Record ID',s=>s.id]];
  $('#compareView').innerHTML=`<table class="compare-table"><thead><tr><th>Comparison field</th>${selected.map(s=>`<th>${safe(s.id)}<br><button class="remove-compare" data-remove-compare="${safe(s.id)}">Remove</button></th>`).join('')}</tr></thead><tbody>${fields.map(([label,get])=>`<tr><td>${safe(label)}</td>${selected.map(s=>`<td>${safe(get(s))}</td>`).join('')}</tr>`).join('')}<tr><td>Original source</td>${selected.map(s=>`<td><a href="${safe(primaryUrl(s))}" target="_blank" rel="noopener noreferrer">Open source ↗</a></td>`).join('')}</tr></tbody></table>`;
}

function renderAnalysis(){
  const values=CATEGORIES.map(cat=>{
    const rows=STUDIES.filter(s=>s.category===cat.id);
    const weight=rows.reduce((sum,s)=>sum+(STUDY_TYPES[s.type]?.weight||0),0);
    return {cat,n:rows.length,weight};
  });
  const max=Math.max(...values.map(x=>x.weight),1);
  $('#weightChart').innerHTML=values.map(x=>`<div class="weight-row"><span class="weight-label">${safe(x.cat.short)}</span><span class="weight-track"><span class="weight-fill" style="display:block;width:${x.weight/max*100}%"></span></span><span class="weight-value">${x.weight.toFixed(1)}</span></div><div class="weight-row-note" hidden></div>`).join('');
  const typeCounts=Object.keys(STUDY_TYPES).map(key=>({key,label:STUDY_TYPES[key].label,n:STUDIES.filter(s=>s.type===key).length}));
  $('#typeBreakdown').innerHTML=typeCounts.map(x=>`<div class="type-row"><div class="type-row-head"><strong>${safe(x.label)}</strong><span>${x.n}</span></div><div class="type-bar"><span style="width:${(x.n/STUDIES.length*100).toFixed(1)}%"></span></div></div>`).join('');
  const pairs=[];
  for(let i=0;i<STUDIES.length;i++) for(let j=i+1;j<STUDIES.length;j++){
    const a=STUDIES[i],b=STUDIES[j]; if(a.category===b.category) continue;
    const shared=a.tags.filter(t=>b.tags.includes(t)); if(!shared.length) continue;
    const union=new Set([...a.tags,...b.tags]).size; pairs.push({a,b,score:shared.length/union,shared});
  }
  pairs.sort((a,b)=>b.score-a.score);
  $('#similarityRows').innerHTML=pairs.slice(0,8).map(p=>`<tr><td>${safe(p.a.title.slice(0,75))}${p.a.title.length>75?'…':''}</td><td>${safe(p.b.title.slice(0,75))}${p.b.title.length>75?'…':''}</td><td>${p.score.toFixed(2)}</td><td>${safe(p.shared.join(', '))}</td></tr>`).join('')||'<tr><td colspan="4">No shared tags found.</td></tr>';
  renderEvidenceMatrix(); renderResearchTimeline(); renderPotentialGaps(values); renderBiasTracker();
}
function renderEvidenceMatrix(){
  const holder=$('#evidenceMatrix'); if(!holder) return;
  const keys=Object.keys(STUDY_TYPES);
  holder.innerHTML=`<div class="matrix-scroll"><table class="matrix-table"><thead><tr><th>Domain</th>${keys.map(k=>`<th>${safe(STUDY_TYPES[k].label.replace(' / ','/').replace('Case-control / genetic association','Case-control'))}</th>`).join('')}<th>Total</th></tr></thead><tbody>${CATEGORIES.map(cat=>{
    const counts=keys.map(k=>STUDIES.filter(s=>s.category===cat.id&&s.type===k).length);
    const total=counts.reduce((a,b)=>a+b,0);
    return `<tr><th>${safe(cat.short)}</th>${counts.map((n,i)=>`<td><button class="matrix-cell ${n?'has-records':'zero-records'}" data-matrix-domain="${safe(cat.id)}" data-matrix-type="${keys[i]}" title="Filter ${safe(cat.short)} · ${safe(STUDY_TYPES[keys[i]].label)}">${n}</button></td>`).join('')}<td><strong>${total}</strong></td></tr>`;
  }).join('')}</tbody></table></div><div class="matrix-legend"><span>0 records</span><span>More records = darker cell</span></div>`;
}
function renderResearchTimeline(){
  const holder=$('#researchTimeline'); if(!holder) return;
  const counts={}; STUDIES.filter(s=>Number.isFinite(Number(s.year))).forEach(s=>counts[s.year]=(counts[s.year]||0)+1);
  const years=Object.keys(counts).map(Number).sort((a,b)=>a-b);
  if(!years.length){holder.textContent='No publication-year data available.';return;}
  const max=Math.max(...years.map(y=>counts[y]),1);
  holder.innerHTML=years.map(y=>`<div class="timeline-row"><span>${y}</span><span class="timeline-track"><i style="width:${counts[y]/max*100}%"></i></span><b>${counts[y]}</b></div>`).join('');
}
function renderPotentialGaps(domainValues){
  const holder=$('#gapDetector'); if(!holder) return;
  const sorted=[...domainValues].sort((a,b)=>a.n-b.n);
  holder.innerHTML=sorted.slice(0,4).map(x=>`<article class="gap-item"><div><strong>${safe(x.cat.short)}</strong><span>${x.n} records · weight ${x.weight.toFixed(1)}</span></div><p>${x.n===0?'No records are currently tagged to this domain in this library.':'Lower representation in this curated library; inspect topic coverage and search strategy before calling this a research gap.'}</p><button class="text-action" data-domain="${safe(x.cat.id)}">Explore records ↗</button></article>`).join('');
}
function renderBiasTracker(){
  const holder=$('#biasTracker'); if(!holder) return;
  const assessed=STUDIES.filter(s=>s.riskOfBias && s.riskOfBias!=='not-assessed').length;
  holder.innerHTML=`<div class="bias-stat"><strong>${assessed}</strong><span>assessed records</span></div><div class="bias-stat"><strong>${STUDIES.length-assessed}</strong><span>not yet assessed</span></div><div class="bias-progress"><i style="width:${assessed/STUDIES.length*100}%"></i></div><p class="panel-copy">Assessment status only. No quality score is inferred from study type.</p>`;
}

let metaRows = [
  {name:'Study A',or:'2.0',lo:'1.1',hi:'3.6'},
  {name:'Study B',or:'1.6',lo:'0.9',hi:'2.8'}
];
function drawMetaRows(){
  const holder=$('#metaRows'); if(!holder) return;
  holder.innerHTML=metaRows.map((row,index)=>`<div class="meta-row" data-meta-row="${index}"><label>Study label<input data-meta-field="name" value="${safe(row.name)}" placeholder="Study name"></label><label>Odds ratio<input data-meta-field="or" type="number" min="0.000001" step="any" value="${safe(row.or)}" placeholder="OR"></label><label>Lower 95% CI<input data-meta-field="lo" type="number" min="0.000001" step="any" value="${safe(row.lo)}" placeholder="Lower CI"></label><label>Upper 95% CI<input data-meta-field="hi" type="number" min="0.000001" step="any" value="${safe(row.hi)}" placeholder="Upper CI"></label><button type="button" class="meta-remove" data-meta-remove="${index}" aria-label="Remove study row">×</button></div>`).join('');
}
function calculateMetaAnalysis(){
  const out=$('#metaOutput'); if(!out) return;
  const rows=metaRows.map(r=>({name:r.name||'Unnamed study',or:Number(r.or),lo:Number(r.lo),hi:Number(r.hi),complete:Boolean(String(r.or).trim()&&String(r.lo).trim()&&String(r.hi).trim())}));
  if(rows.some(r=>!r.complete||!Number.isFinite(r.or)||!Number.isFinite(r.lo)||!Number.isFinite(r.hi)||r.or<=0||r.lo<=0||r.hi<=r.lo)){
    $('#forestPlot').innerHTML=''; out.textContent='Complete every study row. OR and both confidence limits must be positive, and upper CI must be greater than lower CI.';return;
  }
  if(rows.length<2){out.textContent='Enter at least two complete studies. OR, lower CI, and upper CI must be positive, with upper CI greater than lower CI.';return;}
  const yi=rows.map(r=>Math.log(r.or));
  const sei=rows.map(r=>(Math.log(r.hi)-Math.log(r.lo))/3.92);
  if(sei.some(x=>!Number.isFinite(x)||x<=0)){out.textContent='One or more confidence intervals could not be converted. Check the entered values.';return;}
  const wi=sei.map(x=>1/(x*x));
  const sumW=wi.reduce((a,b)=>a+b,0);
  const meanFixed=yi.reduce((sum,y,i)=>sum+wi[i]*y,0)/sumW;
  const seFixed=Math.sqrt(1/sumW);
  const k=rows.length;
  const q=yi.reduce((sum,y,i)=>sum+wi[i]*(y-meanFixed)**2,0);
  const df=k-1;
  const i2=q>0?Math.max(0,((q-df)/q))*100:0;
  const sumW2=wi.reduce((sum,w)=>sum+w*w,0);
  const denom=sumW-(sumW2/sumW);
  const tau2=denom>0?Math.max(0,(q-df)/denom):0;
  const wr=sei.map(x=>1/(x*x+tau2));
  const sumWR=wr.reduce((a,b)=>a+b,0);
  const meanRandom=yi.reduce((sum,y,i)=>sum+wr[i]*y,0)/sumWR;
  const seRandom=Math.sqrt(1/sumWR);
  const format=(mean,se)=>{const estimate=Math.exp(mean),lower=Math.exp(mean-1.96*se),upper=Math.exp(mean+1.96*se);return `${estimate.toFixed(2)} (95% CI ${lower.toFixed(2)}–${upper.toFixed(2)})`;};
  renderForestPlot(rows);
  const leaveOneOut=rows.map((r,omit)=>{
    const keep=rows.map((_,i)=>i).filter(i=>i!==omit);
    if(keep.length<2) return `${r.name}: not calculated (fewer than two studies remain)`;
    const sw=keep.reduce((sum,i)=>sum+wi[i],0);
    const m=keep.reduce((sum,i)=>sum+wi[i]*yi[i],0)/sw;
    const se=Math.sqrt(1/sw);
    return `${r.name}: OR ${Math.exp(m).toFixed(2)} (95% CI ${Math.exp(m-1.96*se).toFixed(2)}–${Math.exp(m+1.96*se).toFixed(2)})`;
  });
  const ar=currentInterfaceLanguage==='ar';
  out.textContent=ar
    ? [`عدد الدراسات المدمجة: ${k}`,`نسبة الأرجحية المجمعة بالتأثير الثابت: ${format(meanFixed,seFixed)}`,`نسبة الأرجحية المجمعة بالتأثيرات العشوائية: ${format(meanRandom,seRandom)}`,`إحصائية Cochran Q: ${q.toFixed(2)} · درجات الحرية: ${df}`,`I²: ${i2.toFixed(1)}% · τ²: ${tau2.toFixed(4)}`,'','تحليل الحساسية (استبعاد دراسة واحدة في كل مرة):',...leaveOneOut,'',i2>50?'التغاير بين الدراسات مرتفع في هذا المثال. افحص قابلية المقارنة ومصادر الاختلاف.':'لا يظهر تغاير مرتفع وفق حساب I² هذا، لكن ما زال تقييم قابلية المقارنة ضروريًا.','', 'هذا عرض توضيحي للحساب فقط. لا يكون التقدير المجمع ذا معنى إلا عند وجود قدر كافٍ من التشابه بين السكان وتعريفات النتائج وتصميمات الدراسات ومقاييس التأثير. الارتباط لا يعني السببية.'].join('\n')
    : [`Studies pooled: ${k}`,`Fixed-effect pooled OR: ${format(meanFixed,seFixed)}`,`Random-effects pooled OR: ${format(meanRandom,seRandom)}`,`Cochran Q: ${q.toFixed(2)} · df: ${df}`,`I²: ${i2.toFixed(1)}% · τ²: ${tau2.toFixed(4)}`,'','Sensitivity analysis (leave one study out):',...leaveOneOut,'',i2>50?'Heterogeneity is substantial in this example. Examine study comparability and sources of variation.':'Heterogeneity is not high by this I² calculation, but comparability still needs assessment.','', 'Calculation demo only. A pooled estimate is meaningful only when populations, outcome definitions, study designs, and effect measures are sufficiently comparable. Association is not causation.'].join('\n');
}
function renderForestPlot(rows){
  const holder=$('#forestPlot'); if(!holder)return;
  const min=Math.min(...rows.map(r=>r.lo),1)*0.85, max=Math.max(...rows.map(r=>r.hi),1)*1.15;
  const lo=Math.log(min), hi=Math.log(max), x=v=>36+(Math.log(v)-lo)/(hi-lo)*560, rowH=31, y0=28;
  const marks=rows.map((r,i)=>{const y=y0+i*rowH;return `<text x="0" y="${y+4}" class="forest-label">${safe(r.name)}</text><line x1="${x(r.lo)}" x2="${x(r.hi)}" y1="${y}" y2="${y}" class="forest-ci"/><line x1="${x(r.lo)}" x2="${x(r.lo)}" y1="${y-5}" y2="${y+5}" class="forest-cap"/><line x1="${x(r.hi)}" x2="${x(r.hi)}" y1="${y-5}" y2="${y+5}" class="forest-cap"/><rect x="${x(r.or)-4}" y="${y-4}" width="8" height="8" class="forest-point"/><text x="610" y="${y+4}" class="forest-value">${r.or.toFixed(2)} (${r.lo.toFixed(2)}–${r.hi.toFixed(2)})</text>`;}).join('');
  const h=y0+rows.length*rowH+28;
  holder.innerHTML=`<div class="forest-heading"><strong>Forest plot preview</strong><span>Log scale · OR and 95% CI</span></div><div class="forest-scroll"><svg viewBox="0 0 820 ${h}" role="img" aria-label="Forest plot of entered odds ratios and confidence intervals"><line x1="${x(1)}" x2="${x(1)}" y1="10" y2="${h-18}" class="forest-null"/><text x="${x(1)+4}" y="12" class="forest-axis-label">OR = 1</text>${marks}<line x1="36" x2="596" y1="${h-17}" y2="${h-17}" class="forest-axis"/><text x="36" y="${h-3}" class="forest-axis-label">${min.toFixed(2)}</text><text x="570" y="${h-3}" class="forest-axis-label">${max.toFixed(2)}</text></svg></div><p class="forest-note">Individual study estimates only. Review comparability and the pooled output before drawing conclusions.</p>`;
}
function loadMetaExample(){
  metaRows=[{name:'Invented study A',or:'2.0',lo:'1.1',hi:'3.6'},{name:'Invented study B',or:'1.6',lo:'0.9',hi:'2.8'},{name:'Invented study C',or:'2.4',lo:'1.3',hi:'4.4'}];
  drawMetaRows(); $('#metaOutput').textContent='These are invented teaching values, not published study results. Press Calculate to see the method.';
}
function bindMetaCalculator(){
  drawMetaRows();
  $('#metaRows')?.addEventListener('input',event=>{
    const row=event.target.closest('[data-meta-row]'); const field=event.target.dataset.metaField;
    if(row&&field){const index=Number(row.dataset.metaRow); if(metaRows[index]) metaRows[index][field]=event.target.value;}
  });
  $('#metaRows')?.addEventListener('click',event=>{
    const btn=event.target.closest('[data-meta-remove]'); if(!btn) return;
    if(metaRows.length<=2){toast('Keep at least two rows for pooling');return;}
    metaRows.splice(Number(btn.dataset.metaRemove),1);drawMetaRows();
  });
  $('#addMetaRow')?.addEventListener('click',()=>{metaRows.push({name:`Study ${metaRows.length+1}`,or:'',lo:'',hi:''});drawMetaRows();});
  $('#loadMetaExample')?.addEventListener('click',loadMetaExample);
  $('#runMeta')?.addEventListener('click',calculateMetaAnalysis);
}

function updateSuggestedPrompts(){
  const prompts=role==='parent' ? [
    ['What is childhood-onset lupus in simple language?','Explain a medical term in simple language.'],
    ['Where can I find the Parents’ Guide?','Help me find the Parents’ Guide.'],
    ['What should families ask the care team?','Suggest general questions for a doctor appointment.'],
    ['How can I search for a paediatric specialist?','Show me how to use Find Care.']
  ] : [
    ['Help me find studies about lupus nephritis in children.','Help me find studies about lupus nephritis in children.'],
    ['Explain odds ratio and a 95% confidence interval in simple terms.','Explain odds ratio and a 95% confidence interval in simple terms.'],
    ['How do I use the extraction sheet?','How do I use the extraction sheet?'],
    ['Show me candidate studies about interferon biomarkers.','Show candidate studies about interferon biomarkers.']
  ];
  $$('.prompt-button').forEach((btn,i)=>{ if(prompts[i]){ btn.textContent=prompts[i][0]+'  ↗'; btn.dataset.prompt=prompts[i][1]; } });
}

function appendChat(roleName,text,links=[]){
  const holder=document.createElement('div'); holder.className='chat-message '+(roleName==='user'?'user':'assistant');
  const avatar=document.createElement('div'); avatar.className='chat-avatar'; avatar.textContent=roleName==='user'?'F':'✳';
  const body=document.createElement('div'); body.className='message-body';
  const strong=document.createElement('strong'); strong.textContent=roleName==='user'?'You':'Lupuscope AI';
  const p=document.createElement('p'); p.textContent=text;
  const isArabic=/[\u0600-\u06FF]/.test(text); holder.dir=isArabic?'rtl':'ltr';
  body.append(strong,p);
  if(links.length){
    const linkWrap=document.createElement('div'); linkWrap.className='message-links';
    links.forEach(item=>{
      if(item.page){
        const button=document.createElement('button'); button.className='mini-button'; button.dataset.go=item.page;
        if(item.view) button.dataset.view=item.view;
        button.textContent=item.label; linkWrap.append(button);
      } else if(item.url){
        const a=document.createElement('a'); a.href=item.url; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent=item.label; linkWrap.append(a);
      }
    });
    body.append(linkWrap);
  }
  holder.append(avatar,body); $('#chatMessages').append(holder); $('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;
}

function localAssistantReply(question){
  const q=question.toLowerCase().trim();
  const arabic=detectReplyLanguage(question)==='ar';
  const links=[];
  if(/^(hi|hello|hey|good morning|good afternoon|good evening|how are you|مرحبا|مرحبًا|اهلا|أهلا|أهلًا|السلام عليكم|سلام|هاي|هلا)[!.؟?\s]*$/i.test(q)){
    return {text:detectReplyLanguage(question)==='ar'
      ? 'أهلًا بيك! 🌷 أنا مساعد لوبوسكوب. نقدر نتكلم عن أبحاث الذئبة عند الأطفال، أو أساعدك تلاقي دراسات في المكتبة، أو أشرح مصطلح بحثي. تحبي نبدأ بإيه؟'
      : 'Hi! 😊 I’m Lupuscope AI. I can help explore childhood-lupus research, find studies in our library, or explain research terms. What would you like to look into?',links};
  }
  const addStudies=(category,limit=4)=>{
    const rows=STUDIES.filter(s=>s.category===category).slice(0,limit);
    rows.forEach(s=>links.push({label:`${s.id} · ${String(s.year||'').trim()}`,url:primaryUrl(s)}));
    return rows;
  };
  if(/diagnos|does .* have lupus|is it lupus|symptom|rash|pain|medicine|medication|treatment|dose|flare in my|my child|my daughter|my son|تشخيص|أعراض|طفلي|طفلة|علاج|دواء|ألم/.test(q)){
    return {text:arabic?'أستطيع تقديم معلومات تثقيفية عامة، لكن لا يمكنني تقييم حالة طفل بعينه أو تشخيص الذئبة أو تفسير أعراض أو نتائج فحوصات شخصية أو التوصية بعلاج. يُرجى مناقشة أي مخاوف صحية مع فريق الرعاية المختص. إذا كانت الأعراض طارئة أو تتفاقم بسرعة، تواصلوا مع خدمات الطوارئ المحلية أو الفريق المعالج.':'I can provide general educational information, but I cannot assess an individual child, diagnose lupus, interpret personal symptoms or test results, or recommend treatment. Please discuss health concerns with the child’s qualified care team. If there are urgent or rapidly worsening symptoms, contact local emergency services or the treating team promptly.',links};
  }
  if(/overview|epidemiology|incidence|prevalence|general c.sle|general childhood lupus|نظرة عامة|وبائيات|انتشار|الذئبة لدى الأطفال/.test(q)){
    addStudies('overview',5);
    return {text:arabic?'يضم قسم النظرة العامة والمراجعات مراجعات واسعة وأبحاثًا سكانية عن الذئبة التي تبدأ في الطفولة. توفر هذه السجلات سياقًا عامًا، لكنها لا تغني عن الفرز المنهجي الخاص بسؤال البحث.':'The Overview & Reviews section contains broad cSLE reviews and population-level research. These records provide context; they are not a substitute for topic-specific screening.',links};
  }
  if(/kidney|nephritis|renal|الكلى|كلوي|التهاب الكلى/.test(q)){
    const found=addStudies('kidney',5);
    return {text:arabic?`وجدت ${STUDIES.filter(s=>s.category==='kidney').length} سجلات عن الكلى والتهاب الكلى الذئبي في المكتبة الحالية. تشمل القائمة مراجعات ودراسات أترابية وسجلات دولية مرشحة. افتح الورقة الأصلية قبل الاعتماد على أي نتيجة مستخرجة.`:`I found ${STUDIES.filter(s=>s.category==='kidney').length} kidney / lupus-nephritis records in the current library. The list includes reviews, cohort studies, and candidate international studies. Open the original paper before relying on an extracted result.`,links};
  }
  if(/genetic|gene|monogenic|variant|وراثة|جينات|جيني/.test(q)){
    addStudies('genetics',5);
    return {text:arabic?'يتضمن مجال الوراثة والمسارات الجزيئية مراجعات عن الذئبة أحادية الجين وأبحاثًا أحدث عن الفحوصات الجينية والتسلسل. السجلات الجديدة مرشحة للفرز وليست دراسات مشمولة مؤكدة.':'The Genetics & Molecular Pathways category includes reviews of monogenic lupus and newer genetic-panel / sequencing research. The new records are candidates for screening, not confirmed inclusions.',links};
  }
  if(/brain|neuro|seizure|psychiatr|الدماغ|عصبي|نفسي|تشنج/.test(q)){
    addStudies('neuro',5);
    return {text:arabic?'يتضمن مجال الدماغ والجهاز العصبي مراجعات ودراسات رصدية عن المظاهر العصبية والنفسية. راجع تعريفات الحالات والسكان في كل ورقة، لأنها قد تختلف بين الدراسات.':'The Brain & Nervous System category includes neuropsychiatric reviews and observational cohorts. Check each paper’s definitions and population, because neuropsychiatric case definitions can differ between studies.',links};
  }
  if(/interferon|biomarker|complement|autoantibod|immune|مناعة|مؤشر حيوي|متممة|إنترفيرون/.test(q)){
    addStudies('immune',5);
    return {text:arabic?'يحتوي مجال المناعة والمؤشرات الحيوية على دراسات عن المتممة والأجسام المضادة الذاتية وبصمات الإنترفيرون والمؤشرات الحيوية المرشحة. الارتباط في مجموعة بحثية لا يعني أن المؤشر اختبار سريري معتمد بمفرده.':'The Immunology & Biomarkers category contains studies on complement, autoantibodies, interferon signatures, and candidate biomarkers. An association in a research cohort does not mean a marker is a validated standalone clinical test.',links};
  }
  if(/heart|cardiac|lung|pulmonary|chest|القلب|الرئة|الرئتين|صدر/.test(q)){
    addStudies('cardiorespiratory',5);
    return {text:arabic?'وجدت سجلات في مجال القلب والرئتين. يجمع هذا المجال دراسات القلب والأوعية الدموية والرئة؛ وعند المقارنة، تحقق مما إذا كانت النتيجة تتعلق بالقلب أو الرئة أو كليهما.':'I found records in the Heart & Lungs category. It combines cardiac, vascular, and pulmonary studies; when comparing them, check whether the outcome is cardiac, pulmonary, or combined cardio-pulmonary involvement.',links};
  }
  if(/joint|muscle|skin|rash|mucocutaneous|arthritis|arthralgia|مفاصل|عضلات|جلد|طفح/.test(q)){
    addStudies('msk',5);
    return {text:arabic?'يجمع مجال العضلات والمفاصل والجلد والأغشية المخاطية المظاهر المتعلقة بالمفاصل والعضلات والجلد والأغشية المخاطية. يحتوي حاليًا على سجلين مرشحين ويحتاج إلى مزيد من فرز الأدبيات.':'The new Musculoskeletal & Mucocutaneous category brings together joint / muscle and skin / mucosal manifestations. It currently contains two candidate records and needs further literature screening.',links};
  }
  if(/odds ratio|\bor\b|confidence interval|95%|heterogeneity|i²|i2|tau|meta.analysis|نسبة الأرجحية|فاصل الثقة|تحليل تلوي/.test(q)){
    return {text:arabic?'تقارن نسبة الأرجحية (OR) أرجحية حدوث نتيجة بين مجموعتين. ويعبّر فاصل الثقة 95% عن عدم اليقين حول التقدير. يصف I² مقدار التباين المرتبط بالاختلاف بين الدراسات بدلًا من خطأ المعاينة. يجب التأكد من قابلية مقارنة المجموعات وتعريفات النتائج قبل دمج الدراسات.':'An odds ratio (OR) compares the odds of an outcome between two groups. A 95% confidence interval (CI) expresses uncertainty around the estimate. I² describes the proportion of variability across study results that is associated with between-study heterogeneity rather than sampling error. These statistics need comparable study populations and outcome definitions before pooling.',links:[{label:'Open Evidence Analysis',page:'analysis'}]};
  }
  if(/extract|screen|prisma|full text|full-text|استخراج|فرز|النص الكامل/.test(q)){
    return {text:arabic?'افتح مكتبة الأبحاث واختر «جدول استخراج البيانات» لتسجيل حجم العينة والسكان أو بيئة الدراسة والنتائج والقيود. استخدم «مخطط الفرز» لإدخال الأعداد الفعلية من بحثك الموثق. السجلات الـ14 الجديدة مرشحة، ولا تُعد دراسات مشمولة قبل إكمال الفرز.':'Open Research Library and choose “Extraction sheet” to record sample size, population / setting, findings, and limitations. Use “Screening flow” for real counts from your documented search. The 14 new records are candidate records and should not be counted as included studies until you complete screening.',links:[{label:'Open Extraction Sheet',page:'library',view:'extract'}]};
  }
  if(/parent|guardian|family|care|glossary|أولياء|أسرة|رعاية|مسرد/.test(q)){
    return {text:arabic?'يحتوي دليل أولياء الأمور على معلومات تثقيفية مبسطة ومسرد للمصطلحات وأسئلة عامة يمكن للأسرة مناقشتها مع الطبيب. يفتح قسم البحث عن الرعاية بحثًا خارجيًا على الخريطة، ولا يتحقق لوبوسكوب من الجهات الظاهرة أو يوصي بها.':'The Parents’ Guide contains plain-language educational information, a glossary, and general questions families may wish to discuss with a clinician. Find Care opens an external map search; listings are not verified or endorsed by Lupuscope.',links:[{label:'Parents’ Guide',page:'parents'},{label:'Find Care',page:'care'}]};
  }
  if(/where|navigate|page|website|how do i use|guide me|أين|كيف أستخدم|الموقع|التنقل/.test(q)){
    return {text:arabic?'يمكنك استخدام قائمة التنقل الجانبية لفتح مكتبة الأبحاث وتحليل الأدلة ومقارنة الدراسات ومساعد لوبوسكوب ودليل أولياء الأمور والبحث عن الرعاية ونموذج المجتمع ومعلومات المشروع. في مكتبة الأبحاث، استخدم علامات التبويب لتصفح الدراسات أو استخراج البيانات أو إدخال أعداد الفرز أو البحث المباشر في PubMed.':'You can use the left navigation to open the Research Library, Evidence Analysis, Compare Studies, Lupuscope AI, Parents’ Guide, Find Care, Community Demo, and About & Privacy. In Research Library, use the tabs to browse studies, edit the extraction sheet, enter screening counts, or search PubMed live.',links:[{label:'Research Library',page:'library'},{label:'Parents’ Guide',page:'parents'}]};
  }
  const tokens=q.split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>2);
  const matches=STUDIES.filter(s=>tokens.some(t=>(s.title+' '+s.summary+' '+s.tags.join(' ')).toLowerCase().includes(t))).slice(0,4);
  matches.forEach(s=>links.push({label:`${s.id} · ${s.year||'year?'}`,url:primaryUrl(s)}));
  if(matches.length) return {text:arabic?`وجدت ${matches.length} سجلات قد تكون ذات صلة في المكتبة الحالية. هذه مطابقة بالكلمات المفتاحية وليست تقييمًا بالذكاء الاصطناعي أو بحثًا منهجيًا. راجع الأوراق الأصلية ومعايير الفرز.`:`I found ${matches.length} potentially relevant records in the current library. These are keyword matches, not an AI appraisal or a systematic search. Review the original papers and screening criteria.`,links};
  return {text:arabic?'أعمل حاليًا في الوضع التجريبي الإرشادي؛ يمكنني المساعدة في التنقل وشرح المصطلحات البحثية والعثور على سجلات موجودة في المكتبة. اسأل عن مجال بحثي أو OR وفواصل الثقة أو جدول استخراج البيانات أو دليل أولياء الأمور. يتطلب تشغيل نموذج ذكاء اصطناعي متصل خادمًا آمنًا.':'I’m running in guided demo mode, so I can help with navigation, explain common research terms, and find records already in this library. Try asking about a research domain, OR / confidence intervals, the extraction sheet, or the Parents’ Guide. A connected model would require a secure backend.',links};
}

let chatHistory = [];
function detectReplyLanguage(text){
  return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
}
function relevantLibraryRecords(question, limit=18){
  const tokens=question.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>2);
  const scored=STUDIES.map(s=>{
    const text=(s.title+' '+s.summary+' '+(s.tags||[]).join(' ')+' '+(s.finding||'')).toLowerCase();
    return {s,score:tokens.reduce((n,t)=>n+(text.includes(t)?1:0),0)};
  }).sort((a,b)=>b.score-a.score);
  const selected=scored.filter(x=>x.score>0).slice(0,limit).map(x=>x.s);
  return (selected.length?selected:STUDIES.slice(0,limit)).map(s=>({id:s.id,title:s.title,year:s.year,type:s.type,category:categoryOf(s.category).label,tags:s.tags,summary:s.summary,population:s.population||'',n:s.n||'',finding:s.finding||'',candidate:Boolean(s.candidate),url:primaryUrl(s)}));
}
function showTyping(){
  const holder=document.createElement('div');holder.className='chat-message assistant typing-message';holder.id='chatTyping';
  const avatar=document.createElement('div');avatar.className='chat-avatar';avatar.textContent='✳';
  const body=document.createElement('div');body.className='message-body';body.innerHTML='<strong>Lupuscope AI</strong><p class="typing-dots">Thinking…</p>';
  holder.append(avatar,body);$('#chatMessages').append(holder);$('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;
}
function removeTyping(){ $('#chatTyping')?.remove(); }
async function sendChat(textOverride){
  const input=$('#chatInput');
  const question=(textOverride||input.value).trim();
  if(!question) return;
  appendChat('user',question); input.value='';
  if(/^(hi|hello|hey|good morning|good afternoon|good evening|how are you|مرحبا|مرحبًا|اهلا|أهلا|أهلًا|السلام عليكم|سلام|هاي|هلا)[!.؟?\s]*$/i.test(question)){
    const greeting=localAssistantReply(question);
    appendChat('assistant',greeting.text);
    chatHistory.push({role:'user',content:question},{role:'assistant',content:greeting.text});
    chatHistory=chatHistory.slice(-12);
    return;
  }
  const endpoint=window.LUPUSCOPE_CONFIG?.assistantEndpoint;
  if(!endpoint){
    const reply=localAssistantReply(question);
    const lang=detectReplyLanguage(question);
    const localArabic = {
      'The Overview & Reviews section contains broad cSLE reviews and population-level research. These records provide context; they are not a substitute for topic-specific screening.':'يضم قسم النظرة العامة والمراجعات مراجعات واسعة وأبحاثًا سكانية عن الذئبة التي تبدأ في الطفولة. توفر هذه السجلات سياقًا عامًا، لكنها لا تغني عن الفرز المنهجي الخاص بسؤال البحث.',
      'An odds ratio (OR) compares the odds of an outcome between two groups. A 95% confidence interval (CI) expresses uncertainty around the estimate. I² describes the proportion of variability across study results that is associated with between-study heterogeneity rather than sampling error. These statistics need comparable study populations and outcome definitions before pooling.':'تقارن نسبة الأرجحية (OR) أرجحية حدوث نتيجة بين مجموعتين. ويعبّر فاصل الثقة 95% عن عدم اليقين حول التقدير. يصف I² مقدار التباين المرتبط بالاختلاف بين الدراسات بدلًا من خطأ المعاينة. يجب التأكد من قابلية مقارنة المجموعات وتعريفات النتائج قبل دمج الدراسات.',
      'Open Research Library and choose “Extraction sheet” to record sample size, population / setting, findings, and limitations. Use “Screening flow” for real counts from your documented search. The 14 new records are candidate records and should not be counted as included studies until you complete screening.':'افتح مكتبة الأبحاث واختر «جدول استخراج البيانات» لتسجيل حجم العينة والسكان أو بيئة الدراسة والنتائج والقيود. استخدم «مخطط الفرز» لإدخال الأعداد الفعلية من بحثك الموثق. السجلات الـ14 الجديدة مرشحة، ولا تُعد دراسات مشمولة قبل إكمال الفرز.',
      'The Parents’ Guide contains plain-language educational information, a glossary, and general questions families may wish to discuss with a clinician. Find Care opens an external map search; listings are not verified or endorsed by Lupuscope.':'يحتوي دليل أولياء الأمور على معلومات تثقيفية مبسطة ومسرد للمصطلحات وأسئلة عامة يمكن للأسرة مناقشتها مع الطبيب. يفتح قسم البحث عن الرعاية بحثًا خارجيًا على الخريطة، ولا يتحقق لوبوسكوب من الجهات الظاهرة أو يوصي بها.',
      'I’m running in guided demo mode, so I can help with navigation, explain common research terms, and find records already in this library. Try asking about a research domain, OR / confidence intervals, the extraction sheet, or the Parents’ Guide. A connected model would require a secure backend.':'أعمل حاليًا في الوضع التجريبي الإرشادي؛ يمكنني المساعدة في التنقل وشرح المصطلحات البحثية والعثور على سجلات موجودة في المكتبة. يمكنك السؤال عن أحد المجالات البحثية أو نسب الأرجحية وفواصل الثقة أو جدول استخراج البيانات أو دليل أولياء الأمور. يتطلب تشغيل نموذج ذكاء اصطناعي متصل خادمًا آمنًا.'
    };
    let responseText = lang === 'ar' ? (localArabic[reply.text] || reply.text) : reply.text;
    const notice=lang==='ar'
      ? 'تنبيه: يعمل الوضع المحلي التجريبي فقط؛ لم يتم توصيل نموذج ذكاء اصطناعي. '
      : 'Notice: local demo mode is active; no AI model is connected. ';
    responseText = notice + responseText;
    appendChat('assistant',responseText,reply.links);
    chatHistory.push({role:'user',content:question},{role:'assistant',content:responseText});
    chatHistory=chatHistory.slice(-12);
    return;
  }
  showTyping();
  try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      question,language:detectReplyLanguage(question),role,currentPage,
      history:chatHistory.slice(-10),
      library:relevantLibraryRecords([question, ...chatHistory.slice(-4).map(m=>m.content)].join(' ')),
      policy:'Research education only. Do not diagnose, predict, or recommend treatment. Clearly label candidate records and abstract-level information. Cite only the supplied study records. Answer in the same language as the user message.'
    })});
    if(!response.ok){const err=await response.json().catch(()=>({}));throw new Error(err.error||`HTTP ${response.status}`);}
    const data=await response.json();
    removeTyping();
    const reply=String(data.reply||'No response text was returned.');
    const sources=Array.isArray(data.sources)?data.sources.filter(x=>x.url&&x.label).slice(0,5):[];
    appendChat('assistant',reply,sources);
    chatHistory.push({role:'user',content:question},{role:'assistant',content:reply});
    chatHistory=chatHistory.slice(-12);
  }catch(err){
    removeTyping();
    const lang=detectReplyLanguage(question);
    appendChat('assistant',lang==='ar'
      ? 'تعذر الاتصال بخدمة الذكاء الاصطناعي. تأكدي أن الخادم شغال وأن endpoint مضبوط. لم أستبدل الرد بإجابة مزيفة. تفاصيل الخطأ: '+err.message
      : 'Could not connect to the AI service. Check that the backend is running and the endpoint is configured. I will not pretend the AI responded. Error: '+err.message);
  }
}

function setLibraryView(view){
  libraryView=view;
  $$('.library-tab').forEach(b=>b.classList.toggle('active',b.dataset.libraryView===view));
  $('#libraryBrowseView').classList.toggle('hidden',view!=='browse');
  $('#libraryExtractView').classList.toggle('hidden',view!=='extract');
  $('#libraryScreenView').classList.toggle('hidden',view!=='screen');
  $('#libraryPubmedView').classList.toggle('hidden',view!=='pubmed');
  if(view==='browse') renderLibrary(); else renderLibraryToolView();
}

function renderLibraryToolView(){
  if(libraryView==='extract') renderExtraction();
  if(libraryView==='screen') renderScreening();
  if(libraryView==='pubmed') renderPubMedPanel();
}

function extractionData(id){
  const saved=store.get('ls_ai_extraction',{});
  const study=getStudy(id);
  const fallback=study ? {n:study.n||'',pop:study.population||'',f:study.finding||study.summary||'',l:study.candidate?'Candidate record; abstract-level details require full-text verification.':(study.note||'')} : {};
  return {...fallback,...(EXTRACTION_SEED[id]||{}),...(saved[id]||{})};
}
function renderExtraction(){
  const rows=STUDIES.map(s=>{
    const d=extractionData(s.id);
    return `<tr><td><a href="${safe(primaryUrl(s))}" target="_blank" rel="noopener noreferrer">${safe(s.id)} ↗</a><br><small>${safe(s.title.slice(0,62))}${s.title.length>62?'…':''}</small></td><td>${safe(STUDY_TYPES[s.type]?.label||s.type)}</td><td>${safe(s.year||'')}</td>${['n','pop','f','l'].map(field=>`<td><input data-extract-id="${safe(s.id)}" data-extract-field="${field}" value="${safe(d[field]||'')}" aria-label="${safe(field)} for ${safe(s.id)}"></td>`).join('')}</tr>`;
  }).join('');
  $('#libraryExtractView').innerHTML=`<div class="warning-banner"><strong>Verification</strong><span>Pre-filled candidate values are abstract-level notes, not completed full-text extraction. Verify every field in the original paper. Blank means “not extracted,” not zero.</span></div><div class="extract-toolbar"><span class="muted-note">${STUDIES.length} records · edits saved in this browser</span><button class="btn btn-primary" id="exportExtraction">Export extraction CSV ↓</button></div><div class="table-wrap"><table class="extract-table"><thead><tr><th>Study / source</th><th>Type</th><th>Year</th><th>Sample size</th><th>Population / setting</th><th>Main reported finding</th><th>Limitations / notes</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function saveExtractionInput(target){
  const saved=store.get('ls_ai_extraction',{}); const id=target.dataset.extractId,field=target.dataset.extractField;
  if(!saved[id]) saved[id]={}; saved[id][field]=target.value; store.set('ls_ai_extraction',saved);
}
function exportExtraction(){
  const headings=['Record ID','Title','Type','Year','Sample size','Population / setting','Main reported finding','Limitations / notes','Source URL'];
  const rows=STUDIES.map(s=>{const d=extractionData(s.id);return [s.id,s.title,STUDY_TYPES[s.type]?.label||s.type,s.year||'',d.n||'',d.pop||'',d.f||'',d.l||'',primaryUrl(s)];});
  downloadCSV('lupuscope_extraction.csv',[headings,...rows]);
}
function renderScreening(){
  const saved=store.get('ls_ai_screen',{});
  $('#libraryScreenView').innerHTML=`<div class="panel-card"><div class="eyebrow">PRISMA-STYLE SCREENING COUNTS</div><h3>Enter counts from your documented search</h3><p class="screen-summary">Do not use the size of this prototype library as a substitute for the total records identified. Enter counts only after completing and documenting database searches and screening decisions.</p><div class="screen-grid">${[['identified','Records identified'],['duplicates','Duplicates removed'],['titleExcluded','Excluded after title / abstract'],['fullTextExcluded','Excluded after full-text review']].map(([key,label])=>`<label>${label}<input id="screen_${key}" type="number" min="0" step="1" value="${safe(saved[key]??'')}" placeholder="Enter real count"></label>`).join('')}<label style="grid-column:1/-1">Full-text exclusion reasons<textarea id="screen_reasons" rows="3" placeholder="Record reasons according to your protocol">${safe(saved.reasons||'')}</textarea></label></div><div class="flow-result" id="flowResult"></div><div class="flow-warning" id="flowWarning"></div></div>`;
  ['identified','duplicates','titleExcluded','fullTextExcluded','reasons'].forEach(key=>{const el=$('#screen_'+key);el.addEventListener('input',()=>{const all=store.get('ls_ai_screen',{});all[key]=el.value;store.set('ls_ai_screen',all);updateFlowResult();});});
  updateFlowResult();
}
function updateFlowResult(){
  const v=key=>{const raw=$('#screen_'+key)?.value;return raw===''||raw==null?null:Number(raw);};
  const id=v('identified'),dup=v('duplicates'),title=v('titleExcluded'),full=v('fullTextExcluded');
  if([id,dup,title,full].some(x=>x===null)){$('#flowResult').innerHTML='<div class="flow-step"><span>Waiting for real search counts</span></div>';$('#flowWarning').textContent=currentInterfaceLanguage==='ar'?'أكمل حقول الأعداد الأربعة لحساب المخطط. لا تقدّر القيم المفقودة.':'Complete all four count fields to calculate the flow. Do not estimate missing values.';return;}
  if([id,dup,title,full].some(x=>!Number.isInteger(x)||x<0)){$('#flowResult').innerHTML='';$('#flowWarning').textContent=currentInterfaceLanguage==='ar'?'أدخل أعدادًا صحيحة أكبر من أو تساوي صفرًا في جميع الحقول.':'Enter whole numbers greater than or equal to zero in every count field.';return;}
  const screened=id-dup,fullText=screened-title,included=fullText-full;
  const values=[id,dup,screened,fullText,included];
  const inconsistent=values.some(x=>x<0)||dup>id||title>screened||full>fullText;
  const flowLabels=currentInterfaceLanguage==='ar'?['تم العثور عليها','تم فحصها','تم تقييم النص الكامل','مشمولة']:['Identified','Screened','Full text assessed','Included'];
  $('#flowResult').innerHTML=[[flowLabels[0],id],[flowLabels[1],screened],[flowLabels[2],fullText],[flowLabels[3],included]].map(([label,n])=>`<div class="flow-step"><strong>${n}</strong><span>${label}</span></div>`).join('');
  $('#flowWarning').textContent=inconsistent?(currentInterfaceLanguage==='ar'?'الأعداد غير متسقة. تحقق من أن عدد الاستبعادات لا يتجاوز السجلات المتاحة في تلك المرحلة.':'The counts are inconsistent. Check that exclusions do not exceed the records available at that stage.'):(currentInterfaceLanguage==='ar'?`عدد السجلات المشمولة المحسوب: ${included}. تأكد من مطابقته لمجموعة الدراسات النهائية بعد فحوص الأهلية.`:`Calculated records included: ${included}. Confirm this equals your final included-study set after eligibility checks.`);
}

function renderPubMedPanel(){
  $('#libraryPubmedView').innerHTML=`<div class="panel-card"><div class="eyebrow">NCBI PUBMED SEARCH</div><h3>Find newer literature</h3><p class="panel-copy">This live search retrieves publication records only. Results are not screened, verified for eligibility, or added to the curated library automatically.</p><form class="pubmed-form" id="pubmedForm"><input id="pubmedQuery" value='("childhood-onset"[tiab] OR pediatric[tiab] OR juvenile[tiab]) AND "systemic lupus erythematosus"[tiab]' aria-label="PubMed search query"><button class="btn btn-primary" type="submit">Search PubMed ↗</button></form><div id="pubmedStatus" class="muted-note">Search PubMed to retrieve recent matching records.</div><div id="pubmedResults" class="pubmed-results"></div></div>`;
  $('#pubmedForm').addEventListener('submit',event=>{event.preventDefault();runPubMedSearch($('#pubmedQuery').value.trim());});
}
async function runPubMedSearch(term){
  if(!term){toast('Enter a PubMed search query');return;}
  $('#pubmedStatus').textContent='Searching NCBI PubMed…'; $('#pubmedResults').innerHTML='';
  try{
    const base='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
    const searchUrl=base+'esearch.fcgi?db=pubmed&retmode=json&retmax=8&sort=date&term='+encodeURIComponent(term);
    const sRes=await fetch(searchUrl); if(!sRes.ok) throw new Error('Search request failed');
    const sData=await sRes.json(); const ids=sData.esearchresult?.idlist||[]; const count=sData.esearchresult?.count||'0';
    if(!ids.length){$('#pubmedStatus').textContent=`No PubMed records found. Total matching records: ${count}.`;return;}
    const sumRes=await fetch(base+'esummary.fcgi?db=pubmed&retmode=json&id='+ids.join(',')); if(!sumRes.ok) throw new Error('Summary request failed');
    const summary=await sumRes.json();
    const items=ids.map(id=>summary.result?.[id]).filter(Boolean);
    $('#pubmedStatus').textContent=`PubMed reports ${count} matching records. Showing up to ${items.length} newest results. All are UNSCREENED.`;
    $('#pubmedResults').innerHTML=items.map(x=>`<article class="pubmed-result"><span class="candidate-badge">UNSCREENED RESULT</span><strong>${safe(x.title||'Untitled record')}</strong><small>${safe(x.source||'Journal not listed')} · ${safe(x.pubdate||'Date not listed')} · PMID ${safe(x.uid)}</small><br><a href="https://pubmed.ncbi.nlm.nih.gov/${safe(x.uid)}/" target="_blank" rel="noopener noreferrer">Open PubMed record ↗</a></article>`).join('');
  }catch(error){$('#pubmedStatus').textContent='Could not reach PubMed. Check the internet connection and try again. You can still use the curated library.';}
}

function renderGlossary(){
  const q=($('#glossarySearch')?.value||'').trim().toLowerCase();
  const list=GLOSSARY.filter(([term,definition])=>(term+' '+definition).toLowerCase().includes(q));
  $('#glossaryGrid').innerHTML=list.map(([term,definition])=>`<article class="glossary-item"><strong>${safe(term)}</strong><p>${safe(definition)}</p></article>`).join('')||'<div class="empty-state">No matching terms.</div>';
}
function saveDiaryDemo(){
  const note=$('#diaryNote').value.trim(); if(!note){toast('Add a short demo note first');return;}
  const items=store.get('ls_ai_diary_demo',[]); items.unshift({date:$('#diaryDate').value||new Date().toISOString().slice(0,10),note}); store.set('ls_ai_diary_demo',items.slice(0,8));
  $('#diaryNote').value=''; renderDiaryDemo(); $('#diaryStatus').textContent='Demo note saved locally in this browser. Do not enter patient-identifying or medical details.';
}
function renderDiaryDemo(){
  const items=store.get('ls_ai_diary_demo',[]);
  $('#diaryNotes').innerHTML=items.map(item=>`<span class="diary-note-pill">${safe(item.date)} · ${safe(item.note)}</span>`).join('');
}
function showCareMap(lat,lng,label){
  const type=$('#careSpecialty').value, d=0.08;
  const bbox=[lng-d,lat-d,lng+d,lat+d].join('%2C'), marker=`${lat}%2C${lng}`;
  const osm=`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  const external=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(type)}&center=${lat}%2C${lng}`;
  $('#careMap').innerHTML=`<iframe title="Map centered near ${safe(label)}" src="${osm}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="map-location-caption">${safe(label)} · Searching nearby for ${safe(type)}</div><a class="map-open-link" href="${external}" target="_blank" rel="noopener noreferrer">Find ${safe(type)} nearby in Google Maps ↗</a>`;
}
function careSearch(){
  const type=$('#careSpecialty').value, location=$('#careLocation').value.trim();
  if(!location){toast('Enter a city or area, or use current location');return;}
  const query=`${type} in ${location}`, external='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
  $('#careMap').innerHTML=`<iframe title="External map search for ${safe(query)}" src="https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><a class="map-open-link" href="${safe(external)}" target="_blank" rel="noopener noreferrer">Open the search in Google Maps ↗</a>`;
}
function useMyCurrentLocation(){
  const status=$('#locationStatus');
  if(!navigator.geolocation){status.textContent='Geolocation is not supported by this browser. Enter a city or area instead.';return;}
  status.textContent='Requesting permission to access your location…';
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude,longitude,accuracy}=pos.coords;
    status.textContent=`Location found (accuracy about ${Math.round(accuracy)} m). Coordinates are used to center this map in this browser session.`;
    showCareMap(latitude,longitude,'Your current location');
  },err=>{
    const msg={1:'Location permission denied. Allow access in browser settings or enter an area manually.',2:'Location unavailable. Try again or enter an area manually.',3:'Location request timed out. Please try again.'};
    status.textContent=msg[err.code]||'Could not access location. Enter an area manually.';
  },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
}
function renderCommunity(){
  const posts=store.get('ls_ai_community_demo',[]);
  $('#communityPosts').innerHTML=posts.length?posts.map(p=>`<article class="community-post"><strong>${safe(p.title)}</strong><p>${safe(p.message)}</p><small>Local demo post · ${safe(p.date)}</small></article>`).join(''):'<div class="empty-state">No local demo posts yet.</div>';
}
function downloadCSV(filename,rows){
  const csv=rows.map(row=>row.map(cell=>'"'+String(cell??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function exportRIS(){
  const records=compareIds.length?compareIds.map(getStudy).filter(Boolean):STUDIES;
  const ris=records.map(s=>[
    'TY  - JOUR',`TI  - ${s.title}`,`PY  - ${s.year||''}`,`AN  - ${s.pmid||s.id}`,`UR  - ${primaryUrl(s)}`,'ER  -',''
  ].join('\n')).join('\n');
  const blob=new Blob([ris],{type:'application/x-research-info-systems;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='lupuscope_references.ris';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}

// Global event delegation keeps buttons inside dynamically rendered study cards functional.
document.addEventListener('change',event=>{
  if(['typeFilter','yearSort'].includes(event.target.id)) renderLibrary();
});

document.addEventListener('click',event=>{
  if(event.target.classList?.contains('modal-backdrop')){event.target.classList.add('hidden');return;}
  const nav=event.target.closest('[data-page]'); if(nav){showPage(nav.dataset.page);return;}
  const go=event.target.closest('[data-go]'); if(go){showPage(go.dataset.go);if(go.dataset.view)setLibraryView(go.dataset.view);return;}
  const domain=event.target.closest('[data-domain]'); if(domain){activeCategory=domain.dataset.domain;showPage('library');renderLibrary();return;}
  const cat=event.target.closest('[data-category]'); if(cat){activeCategory=cat.dataset.category;renderLibrary();return;}
  const matrix=event.target.closest('[data-matrix-domain]'); if(matrix){activeCategory=matrix.dataset.matrixDomain;showPage('library');const tf=$('#typeFilter');if(tf)tf.value=matrix.dataset.matrixType;renderLibrary();return;}
  const detail=event.target.closest('[data-study-detail]'); if(detail){showStudyDetails(detail.dataset.studyDetail);return;}
  const compare=event.target.closest('[data-compare]'); if(compare){addCompare(compare.dataset.compare);return;}
  const remove=event.target.closest('[data-remove-compare]'); if(remove){addCompare(remove.dataset.removeCompare);return;}
  const prompt=event.target.closest('[data-prompt]'); if(prompt){showPage('assistant');sendChat(prompt.dataset.prompt);return;}
  const tab=event.target.closest('[data-library-view]'); if(tab){setLibraryView(tab.dataset.libraryView);return;}
  if(event.target.closest('[data-close-modal]')){event.target.closest('.modal-backdrop').classList.add('hidden');return;}
  const roleButton=event.target.closest('[data-role]'); if(roleButton){setRole(roleButton.dataset.role);return;}
});

document.addEventListener('input',event=>{
  if(['studySearch','typeFilter','yearSort'].includes(event.target.id)) renderLibrary();
  if(event.target.matches('[data-extract-id]')) saveExtractionInput(event.target);
  if(event.target.id==='glossarySearch') renderGlossary();
});

document.addEventListener('keydown',event=>{if(event.key==='Escape') $$('.modal-backdrop').forEach(modal=>modal.classList.add('hidden'));});
$('#switchRole').addEventListener('click',openRoleModal);
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#topAssistant').addEventListener('click',()=>showPage('assistant'));
$('#clearCompare').addEventListener('click',()=>{compareIds=[];renderCompare();renderLibrary();toast('Comparison cleared');});
$('#sendChat').addEventListener('click',()=>sendChat());
$('#chatInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}});
$('#clearChat').addEventListener('click',()=>{chatHistory=[];$('#chatMessages').innerHTML='';appendChat('assistant',currentInterfaceLanguage==='ar'?'تم مسح المحادثة. تحبي نبدأ بإيه؟':'Conversation cleared. What would you like to explore?');});
$('#exportReferences').addEventListener('click',exportRIS);
$('#saveDiary').addEventListener('click',saveDiaryDemo);
$('#careSearch').addEventListener('click',careSearch);
$('#useMyLocation')?.addEventListener('click',useMyCurrentLocation);
$('#communityForm').addEventListener('submit',event=>{
  event.preventDefault(); const title=$('#communityTitle').value.trim(),message=$('#communityMessage').value.trim(); if(!title||!message)return;
  const posts=store.get('ls_ai_community_demo',[]);posts.unshift({title,message,date:new Date().toLocaleDateString()});store.set('ls_ai_community_demo',posts.slice(0,12));$('#communityTitle').value='';$('#communityMessage').value='';renderCommunity();toast('Demo post saved in this browser');
});

document.addEventListener('click',event=>{
  if(event.target.id==='exportExtraction') exportExtraction();
});

// Initialise the prototype.
const assistantEndpointConfigured = Boolean(window.LUPUSCOPE_CONFIG?.assistantEndpoint);
$('#assistantMode').textContent = assistantEndpointConfigured
  ? 'Backend configured · checking connection…'
  : 'AI not connected · local demo responses only. Configure the backend to enable live AI.';
if (assistantEndpointConfigured) {
  fetch('/api/health').then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
    .then(status => {
      const ar=document.documentElement.lang==='ar';
      $('#assistantMode').textContent = status.configured
        ? (ar ? `الخادم متاح · ${status.model} · العربية / الإنجليزية` : `Backend available · ${status.model} · Arabic / English`)
        : (ar ? 'الخادم متاح، لكن لم يتم إعداد OPENAI_API_KEY.' : 'Backend available, but OPENAI_API_KEY is not configured.');
    })
    .catch(() => { $('#assistantMode').textContent = document.documentElement.lang==='ar'?'الخادم غير متاح · ستظهر رسالة خطأ عند طلب الذكاء الاصطناعي.':'Backend unreachable · AI requests will show a connection error.'; });
}
renderHome();
renderCategoryButtons();
renderCompare();
renderGlossary();
renderDiaryDemo();
renderCommunity();
bindMetaCalculator();
$('#compareCount').textContent=compareIds.length;
$('#roleChip').textContent=role==='parent'?'Parent / guardian view':'Researcher view';
updateSuggestedPrompts();
if(!store.get('ls_ai_role',null)) openRoleModal();

/* ---------------- Interface language: English / Arabic ----------------
   The interface is translated locally. Study titles and source quotations stay
   in their original language to preserve citation accuracy. */
const UI_TRANSLATIONS = {
  ar: {
  'WORKSPACE':'مساحة العمل','PEOPLE & RESOURCES':'الأشخاص والموارد','Overview':'نظرة عامة','Research library':'مكتبة الأبحاث',
  'Evidence analysis':'تحليل الأدلة','Compare studies':'مقارنة الدراسات','Lupuscope AI':'مساعد لوبوسكوب الذكي','Parents’ guide':'دليل أولياء الأمور',
  'Find care':'البحث عن الرعاية','Community demo':'نموذج المجتمع','About & privacy':'عن المشروع والخصوصية',
  'Research prototype':'نموذج بحثي تجريبي','Not a medical device':'ليس جهازًا طبيًا','Switch user view':'تغيير واجهة المستخدم',
  'Researcher view':'واجهة الباحث','Parent / guardian view':'واجهة ولي الأمر','A CHILDHOOD LUPUS EVIDENCE WORKSPACE':'مساحة بحثية للأدلة المتعلقة بالذئبة لدى الأطفال',
  'Turn published evidence':'حوّل الأدلة المنشورة','into clearer questions.':'إلى أسئلة بحثية أوضح.','Organize research on childhood-onset systemic lupus erythematosus, compare published findings, and explore where the evidence is still limited.':'نظّم الأبحاث المنشورة عن الذئبة الحمامية الجهازية ذات البداية في الطفولة، وقارن النتائج، واستكشف المجالات التي ما زالت أدلتها محدودة.',
  'Explore research':'استكشف الأبحاث','Ask Lupuscope AI':'اسأل مساعد لوبوسكوب','Association is not causation.':'الارتباط لا يعني السببية.','Every claim should be traceable to its source.':'يجب أن يكون لكل معلومة مصدر يمكن الرجوع إليه.','Missing data stays missing.':'تظل البيانات غير المتاحة غير متاحة.',
  'YOUR RESEARCH SNAPSHOT':'لمحة عن أبحاثك','Evidence at a glance':'نظرة سريعة على الأدلة','Curated starting library · 32 records':'مكتبة أولية منظمة · 32 سجلًا','Study records':'سجلات الدراسات','Research domains':'المجالات البحثية','Including musculoskeletal & mucocutaneous':'بما يشمل العضلات والمفاصل والجلد والأغشية المخاطية','New candidate records':'سجلات مرشحة جديدة','Require formal screening and verification':'تحتاج إلى فحص منهجي وتحقق','User pathways':'مسارات المستخدمين','Researcher / clinician and parent / guardian':'الباحث أو الطبيب وولي الأمر',
  'EVIDENCE MAP':'خريطة الأدلة','Explore by research domain':'استكشف حسب المجال البحثي','View library ↗':'عرض المكتبة ↗','YOUR RESEARCH COMPANION':'رفيقك البحثي','Meet Lupuscope AI':'تعرّف على مساعد لوبوسكوب','A guided assistant that helps users navigate the platform, understand research terms, and locate relevant studies in this library.':'مساعد إرشادي يساعد المستخدمين على التنقل في المنصة وفهم المصطلحات البحثية والوصول إلى الدراسات المناسبة في المكتبة.','Start a conversation':'ابدأ محادثة','Guided demo mode · A real AI model needs a secure backend.':'وضع إرشادي تجريبي · يتطلب الذكاء الاصطناعي الحقيقي خادمًا آمنًا.',
  'RECENTLY ADDED':'أُضيفت مؤخرًا','New candidate studies':'دراسات مرشحة جديدة','Browse all 32 ↗':'تصفح السجلات الـ32 ↗','Important research boundary':'حدود المشروع البحثية','Lupuscope describes and organizes published literature. It does not diagnose, predict disease, recommend treatment, or replace a qualified clinician.':'يعرض لوبوسكوب الأبحاث المنشورة وينظمها. لا يشخّص المرض أو يتنبأ به أو يوصي بعلاج، ولا يحل محل الطبيب المختص.',
  'PUBLISHED LITERATURE':'الأبحاث المنشورة','Browse the curated starter set by topic, study type, or keyword. Open the original source before using any result in a report.':'تصفح المجموعة الأولية حسب الموضوع أو نوع الدراسة أو الكلمات المفتاحية. افتح المصدر الأصلي قبل استخدام أي نتيجة في تقرير.','records shown':'سجلًا معروضًا','Browse studies':'تصفح الدراسات','Extraction sheet':'جدول استخراج البيانات','Screening flow':'مخطط الفرز','Latest on PubMed':'أحدث المنشورات على PubMed','Search titles, topics, tags, or IDs…':'ابحث بالعناوين أو الموضوعات أو الوسوم أو المعرّفات…','All study types':'كل أنواع الدراسات','Systematic review / meta-analysis':'مراجعة منهجية / تحليل تلوي','Narrative review':'مراجعة سردية','Cohort / cross-sectional':'دراسة أترابية / مقطعية','Case-control / genetic association':'حالة وشاهد / ارتباط جيني','Newest first':'الأحدث أولًا','Oldest first':'الأقدم أولًا','Title A–Z':'العنوان من أ إلى ي','Export references ↓':'تصدير المراجع ↓','RESEARCH DOMAINS':'المجالات البحثية','Original prototype record':'سجل من النموذج الأصلي','New candidate record':'سجل مرشح جديد','All research domains':'كل المجالات البحثية','No records match this search. Try another term or clear the filters.':'لا توجد سجلات تطابق البحث. جرّب كلمة أخرى أو امسح عوامل التصفية.','Screening status:':'حالة الفرز:','The 14 new records are candidate additions identified from PubMed / PubMed Central records. Their presence here does not mean they have passed your final inclusion criteria, duplicate checks, risk-of-bias assessment, or full-text review.':'السجلات الـ14 الجديدة إضافات مرشحة عُثر عليها في PubMed أو PubMed Central. وجودها هنا لا يعني أنها اجتازت معايير الاشتمال أو فحص التكرار أو تقييم خطر التحيز أو مراجعة النص الكامل.',
  'LIBRARY-LEVEL ANALYSIS':'تحليل على مستوى المكتبة','Explore how records are distributed across the current library. These indicators describe this curated set only, not the entire cSLE literature.':'استكشف توزيع السجلات داخل المكتبة الحالية. تصف هذه المؤشرات المجموعة المنظمة فقط، ولا تمثل جميع أبحاث cSLE.','No patient-level data':'لا توجد بيانات على مستوى المرضى','A · COVERAGE':'أ · التغطية','Evidence weight by domain':'وزن الأدلة حسب المجال','A simple prototype heuristic assigns different weights to study types. It is not a validated quality score.':'يمنح مقياس تجريبي بسيط أوزانًا مختلفة لأنواع الدراسات، لكنه ليس مقياسًا معتمدًا لجودة الأدلة.','B · STUDY MIX':'ب · أنواع الدراسات','Record types':'أنواع السجلات','Interpret carefully':'فسّر النتائج بحذر','Study design alone does not establish quality. Sample size, methods, population, risk of bias, and outcome definitions still require appraisal.':'تصميم الدراسة وحده لا يحدد جودتها. ما زال حجم العينة والمنهجية والسكان وخطر التحيز وتعريف النتائج بحاجة إلى تقييم.','C · SHARED TOPICS':'ج · الموضوعات المشتركة','Cross-domain tag connections':'الروابط بين وسوم المجالات المختلفة','D · META-ANALYSIS CALCULATOR':'د · حاسبة التحليل التلوي','Pool odds ratios with 95% confidence intervals':'اجمع نسب الأرجحية مع فواصل الثقة 95%','Statistical demo':'عرض إحصائي تجريبي','Calculate':'احسب','Comparison cleared':'تم مسح المقارنة',
  'SIDE-BY-SIDE REVIEW':'مراجعة جنبًا إلى جنب','Select up to three records from the library to compare their type, population, findings, and source details.':'اختر حتى ثلاثة سجلات من المكتبة لمقارنة النوع والسكان والنتائج والمصادر.','Up to 3 studies':'حتى 3 دراسات','YOUR SHORTLIST':'قائمتك المختصرة','Selected studies':'الدراسات المختارة','Clear selection':'مسح الاختيار',
  'GUIDE · EXPLAIN · EXPLORE':'إرشاد · شرح · استكشاف','Your guided companion for navigating the platform and exploring the published-study library.':'مساعدك الإرشادي للتنقل في المنصة واستكشاف مكتبة الدراسات المنشورة.','Guided demo mode':'وضع إرشادي تجريبي','Conversation':'المحادثة','Answers are generated by the local guided demo.':'تُنشأ الإجابات بواسطة الدليل الإرشادي المحلي التجريبي.','Ask about the library, research methods, or website tools…':'اسأل عن المكتبة أو مناهج البحث أو أدوات الموقع…','Send message':'إرسال الرسالة','Do not enter names, contact details, medical records, or other private information.':'لا تُدخل أسماء أو بيانات اتصال أو سجلات طبية أو أي معلومات خاصة.',
  'FAMILY EDUCATION':'تثقيف الأسرة','General educational information to help families understand terms and prepare for conversations with their child\'s care team.':'معلومات تثقيفية عامة لمساعدة الأسر على فهم المصطلحات والاستعداد للتحدث مع فريق رعاية الطفل.','Educational only':'للتثقيف فقط','START HERE':'ابدأ من هنا','What is childhood-onset lupus?':'ما الذئبة التي تبدأ في الطفولة؟','PREPARE FOR AN APPOINTMENT':'استعد للموعد الطبي','Questions families may ask':'أسئلة يمكن للأسرة طرحها','PLAIN-LANGUAGE GLOSSARY':'مسرد مبسط للمصطلحات','Understand the terminology':'افهم المصطلحات','Find a term…':'ابحث عن مصطلح…','LOCAL DEMO TOOL':'أداة تجريبية محلية','Symptom diary layout preview':'معاينة سجل الأعراض','Save demo note':'احفظ الملاحظة التجريبية',
  'CARE DIRECTORY GUIDE':'دليل البحث عن الرعاية','Search a map for a relevant healthcare specialty or children\'s hospital. Listings are not verified or endorsed by Lupuscope.':'ابحث على الخريطة عن تخصص طبي مناسب أو مستشفى للأطفال. لا يتحقق لوبوسكوب من الجهات الظاهرة ولا يوصي بها.','External map search':'بحث خارجي على الخريطة','START A LOCAL SEARCH':'ابدأ بحثًا محليًا','Choose a specialty and location':'اختر التخصص والموقع','Specialty':'التخصص','City or area':'المدينة أو المنطقة','Search map ↗':'ابحث على الخريطة ↗','Before relying on a listing':'قبل الاعتماد على أي نتيجة','Your map search will appear here':'سيظهر البحث على الخريطة هنا','Enter a city or area to open matching locations in Google Maps.':'أدخل مدينة أو منطقة لعرض الأماكن المطابقة على خرائط Google.',
  'COMMUNITY CONCEPT':'تصور المجتمع','A visual preview of how a moderated information space could work. This is not a live community forum.':'معاينة توضيحية لكيفية عمل مساحة معلومات خاضعة للإشراف. هذا ليس منتدى مجتمعيًا مباشرًا.','Local-only demo':'نموذج محلي فقط','Prototype limitation':'حدود النموذج التجريبي','Posts remain in this browser only. There is no verified clinician moderation, server-side account system, or secure messaging. Do not submit health information or personal details.':'تظل المنشورات في هذا المتصفح فقط. لا توجد مراجعة من أطباء موثّقين أو حسابات على خادم أو مراسلات آمنة. لا ترسل معلومات صحية أو بيانات شخصية.','Share a general resource question':'شارك سؤالًا عامًا عن الموارد','Topic title':'عنوان الموضوع','Message':'الرسالة','Add demo post':'أضف منشورًا تجريبيًا','LOCAL DEMO POSTS':'منشورات تجريبية محلية',
  'PROJECT INFORMATION':'معلومات المشروع','From evidence to insight — a student research prototype for organizing published research on childhood-onset systemic lupus erythematosus.':'من الأدلة إلى الفهم — نموذج بحثي طلابي لتنظيم الأبحاث المنشورة عن الذئبة الحمامية الجهازية التي تبدأ في الطفولة.','Student research prototype':'نموذج بحثي طلابي','PURPOSE':'الهدف','What Lupuscope is designed to do':'ما الذي صُمم لوبوسكوب من أجله','SOURCES':'المصادر','Where records come from':'مصادر السجلات','PRIVACY & LIMITATIONS':'الخصوصية والحدود','What this prototype does not provide':'ما الذي لا يقدمه هذا النموذج','Data protection':'حماية البيانات',
  'WELCOME TO LUPUSCOPE':'مرحبًا بك في لوبوسكوب','Choose your workspace':'اختر مساحة العمل المناسبة','Doctor · Researcher · Scientist':'طبيب · باحث · عالم','Parent or guardian':'ولي أمر أو وصي','Research library, study comparison, and analysis tools':'مكتبة الأبحاث ومقارنة الدراسات وأدوات التحليل','Plain-language guide, glossary, and care-search guidance':'دليل مبسط ومسرد للمصطلحات وإرشادات البحث عن الرعاية','Demo only · No account or personal information required.':'نموذج تجريبي فقط · لا يتطلب حسابًا أو معلومات شخصية.',
  'Overview & reviews':'نظرة عامة ومراجعات','Genetics & molecular pathways':'الوراثة والمسارات الجزيئية','Kidney / lupus nephritis':'الكلى / التهاب الكلى الذئبي','Heart & lungs':'القلب والرئتان','Brain & nervous system':'الدماغ والجهاز العصبي','Immunology & biomarkers':'المناعة والمؤشرات الحيوية','Musculoskeletal & mucocutaneous':'العضلات والمفاصل والجلد والأغشية المخاطية',
  'Details':'التفاصيل','+ Compare':'+ مقارنة','Lupuscope':'لوبوسكوب','FROM EVIDENCE TO INSIGHT':'من الأدلة إلى الفهم','WORKSPACE / OVERVIEW':'مساحة العمل / نظرة عامة','English':'الإنجليزية','evidence':'الأدلة','GENETICS':'الوراثة','CLINICAL':'سريري','IMMUNOLOGY':'المناعة','+14 added':'أُضيفت 14 دراسة','Original library plus new candidate records':'المكتبة الأصلية بالإضافة إلى سجلات مرشحة جديدة','7 domains':'7 مجالات','Abstract-stage':'مرحلة الملخص','Guided demo':'عرض إرشادي','Current prototype formula':'المعادلة التجريبية الحالية','Meta-analysis = 1.0 · Cohort / cross-sectional / case-control = 0.6 · Narrative review = 0.4':'التحليل التلوي = 1.0 · الأترابية / المقطعية / الحالة والشاهد = 0.6 · المراجعة السردية = 0.4','A higher G indicates lower weighted representation within this library, not a proven research gap.':'تشير قيمة G الأعلى إلى تمثيل موزون أقل داخل هذه المكتبة، وليس إلى فجوة بحثية مثبتة.','The table shows pairs of studies with overlapping tags. It is a reading aid, not evidence that the studies establish a biological relationship.':'يعرض الجدول أزواج الدراسات التي تتشارك الوسوم. وهو أداة مساعدة للقراءة، وليس دليلًا على وجود علاقة بيولوجية مثبتة.','Similarity':'التشابه','Shared tags':'الوسوم المشتركة','Enter values copied and checked from original studies. This calculator demonstrates fixed-effect and DerSimonian–Laird random-effects calculations. It does not decide whether studies are scientifically comparable.':'أدخل القيم المنقولة والمتحقق منها من الدراسات الأصلية. توضح الحاسبة حسابات التأثير الثابت والتأثيرات العشوائية بطريقة DerSimonian–Laird، لكنها لا تحدد ما إذا كانت الدراسات قابلة للمقارنة علميًا.','y = ln(OR) · SE = [ln(upper CI) − ln(lower CI)] / 3.92 · weight = 1 / SE²':'y = ln(OR) · SE = [ln(الحد الأعلى) − ln(الحد الأدنى)] / 3.92 · الوزن = 1 / SE²','Enter at least two studies. Use only verified OR and 95% CI values.':'أدخل دراستين على الأقل. استخدم قيم OR وفاصل الثقة 95% التي تم التحقق منها فقط.','Interpretation boundary':'حدود التفسير','Do not pool studies merely because they report an OR. Check population, outcome definitions, effect measures, study design, and risk of bias. A pooled association is not proof of causation.':'لا تدمج الدراسات لمجرد أنها تعرض OR. تحقق من السكان وتعريف النتائج ومقاييس التأثير وتصميم الدراسة وخطر التحيز. الارتباط المجمع لا يثبت السببية.','Ask naturally in Arabic or English. When connected, the assistant uses the Lupuscope research library and cites relevant records.':'اسأل بطريقتك وبالعربية أو الإنجليزية. عند الاتصال، يستخدم المساعد مكتبة أبحاث لوبوسكوب ويستشهد بالسجلات ذات الصلة.','AI connection status':'حالة اتصال الذكاء الاصطناعي','YOUR CURRENT VIEW':'عرضك الحالي','SUGGESTED PROMPTS':'أسئلة مقترحة',"This demo does not diagnose, interpret an individual child's symptoms, or recommend treatment. It uses the site's curated content and general educational explanations.":'هذا النموذج لا يشخّص الحالات ولا يفسر أعراض طفل بعينه ولا يوصي بالعلاج. ويستخدم المحتوى المنظم في الموقع والشروحات التثقيفية العامة.','AI connection status will appear here.':'ستظهر حالة اتصال الذكاء الاصطناعي هنا.','Hi! I’m Lupuscope AI. Ask me naturally about childhood lupus research, studies in our library, or research terms. Let’s explore together.':'مرحبًا! أنا مساعد لوبوسكوب. اسألني عن أبحاث الذئبة لدى الأطفال أو الدراسات في مكتبتنا أو المصطلحات البحثية. يسعدني استكشافها معك.',"General educational information to help families understand terms and prepare for conversations with their child's care team.":'معلومات تثقيفية عامة لمساعدة الأسر على فهم المصطلحات والاستعداد للتحدث مع فريق رعاية الطفل.','Systemic lupus erythematosus (SLE) is an autoimmune condition. In childhood-onset SLE, the disease begins before age 18. It can affect different body systems, and experiences vary from one person to another.':'الذئبة الحمامية الجهازية (SLE) حالة مناعية ذاتية. في الذئبة التي تبدأ في الطفولة، يبدأ المرض قبل سن 18 عامًا. وقد يؤثر في أجهزة مختلفة من الجسم، وتختلف التجربة من شخص لآخر.','Remember':'تذكّر','Symptoms and test results need to be assessed by a qualified clinician. This website cannot tell whether a child has lupus.':'يجب أن يقيّم الطبيب المختص الأعراض ونتائج الفحوصات. لا يستطيع هذا الموقع تحديد ما إذا كان الطفل مصابًا بالذئبة.',"What does this test result mean in my child's situation?":'ماذا تعني نتيجة هذا الفحص في حالة طفلي؟','Which changes should prompt us to contact the care team?':'ما التغيرات التي تستدعي التواصل مع فريق الرعاية؟','Who should we contact outside clinic hours?':'بمن نتواصل خارج ساعات العيادة؟','What should we know about the medicines prescribed?':'ما الذي ينبغي أن نعرفه عن الأدوية الموصوفة؟',"Which specialists are involved in my child's care?":'ما التخصصات المشاركة في رعاية طفلي؟','The original prototype included a browser-local diary. This preview is intentionally not a medical record system. Do not enter real patient details or identifiable health information.':'تضمن النموذج الأصلي سجلًا محليًا في المتصفح. هذه المعاينة ليست نظامًا للسجلات الطبية. لا تدخل بيانات مرضى حقيقية أو معلومات صحية تكشف الهوية.','Stored only in this browser for demonstration.':'يُحفظ هذا لأغراض العرض في هذا المتصفح فقط.',"Search a map for a relevant healthcare specialty or children's hospital. Listings are not verified or endorsed by Lupuscope.":'ابحث على الخريطة عن تخصص رعاية صحية مناسب أو مستشفى للأطفال. لا يتحقق لوبوسكوب من الجهات الظاهرة ولا يوصي بها.','Pediatric rheumatologist':'طبيب روماتيزم أطفال','Pediatric nephrologist':'طبيب كلى أطفال',"Children's hospital":'مستشفى أطفال','Pediatric clinic':'عيادة أطفال',"Confirm the clinician's specialty, age range served, availability, and appointment process directly with the healthcare provider.":'تحقق مباشرة من مقدم الرعاية من تخصص الطبيب والفئة العمرية التي يستقبلها ومواعيده وطريقة حجز الزيارة.','About Lupuscope':'عن لوبوسكوب','Lupuscope aims to organize published cSLE studies, compare findings, and help identify areas of the literature that may need further investigation.':'يهدف لوبوسكوب إلى تنظيم الدراسات المنشورة عن cSLE ومقارنة نتائجها والمساعدة في تحديد المجالات التي قد تحتاج إلى مزيد من البحث.','Its current library-level analysis uses study metadata and topic tags. It does not analyze patient-level records.':'يستخدم التحليل الحالي على مستوى المكتبة البيانات الوصفية للدراسات والوسوم الموضوعية، ولا يحلل سجلات على مستوى المرضى.','The starter library contains PubMed / PubMed Central records and official health-information links. The 14 additions are candidate records for the next screening round.':'تحتوي المكتبة الأولية على سجلات من PubMed وPubMed Central وروابط رسمية للمعلومات الصحية. والإضافات الـ14 سجلات مرشحة لجولة الفرز التالية.','Open the original article and verify each detail before citing it or adding it to the final evidence set.':'افتح المقال الأصلي وتحقق من كل تفصيل قبل الاستشهاد به أو إضافته إلى مجموعة الأدلة النهائية.','No secure server-side authentication or verified professional credentials.':'لا يوجد نظام مصادقة آمن على الخادم أو تحقق من المؤهلات المهنية.','No encrypted patient database or secure medical-record storage.':'لا توجد قاعدة بيانات مرضى مشفرة أو مساحة آمنة لحفظ السجلات الطبية.','No diagnosis, disease prediction, treatment recommendation, or clinical decision support.':'لا يوجد تشخيص أو تنبؤ بالمرض أو توصية علاجية أو دعم لاتخاذ قرار سريري.','No real clinician moderation of community posts.':'لا توجد مراجعة فعلية لمنشورات المجتمع بواسطة أطباء.','No clinically validated AI. The default assistant is a guided local demo.':'لا يوجد ذكاء اصطناعي معتمد سريريًا. المساعد الافتراضي عرض إرشادي محلي.','Machine translation and automatically generated summaries may contain errors and require human review.':'قد تحتوي الترجمة الآلية والملخصات المُنشأة تلقائيًا على أخطاء وتتطلب مراجعة بشرية.','Do not enter real patient information. Local browser storage is not a secure medical-data environment. A public launch would require specialist, security, privacy, and legal review.':'لا تدخل معلومات مرضى حقيقية. التخزين المحلي في المتصفح ليس بيئة آمنة للبيانات الطبية. يتطلب الإطلاق العام مراجعة متخصصة وأمنية ومتعلقة بالخصوصية والقانون.','© Lupuscope · Educational research prototype':'© لوبوسكوب · نموذج بحثي تثقيفي','Association is not causation · No diagnosis or treatment advice':'الارتباط لا يعني السببية · لا تشخيص أو نصيحة علاجية',"This choice only adjusts the guide prompts and does not verify a user's identity or professional status.":'يغيّر هذا الاختيار الأسئلة الإرشادية فقط ولا يتحقق من هوية المستخدم أو صفته المهنية.','Overview':'نظرة عامة','Research library':'مكتبة الأبحاث','Evidence analysis':'تحليل الأدلة','Compare studies':'مقارنة الدراسات','Parents’ guide':'دليل أولياء الأمور','Find care':'البحث عن الرعاية','Community demo':'نموذج المجتمع','About & privacy':'عن المشروع والخصوصية',
  'Study A':'الدراسة أ','Study B':'الدراسة ب','Study label':'اسم الدراسة','Odds ratio':'نسبة الأرجحية','Lower 95% CI':'الحد الأدنى لفاصل الثقة 95%','Upper 95% CI':'الحد الأعلى لفاصل الثقة 95%','+ Add study':'إضافة دراسة +','Load invented example':'تحميل مثال افتراضي','Calculate':'احسب','Remove study row':'حذف صف الدراسة','No studies selected yet':'لم يتم اختيار دراسات بعد','Remove':'إزالة','Original source':'المصدر الأصلي','Research domain':'المجال البحثي','Publication year':'سنة النشر','Record identifier':'معرّف السجل','Study type':'نوع الدراسة','Population / setting':'السكان / بيئة الدراسة','Sample information':'معلومات العينة','Abstract-level finding':'نتيجة مستخلصة من الملخص','Candidate status':'حالة الدراسة المرشحة','Open source ↗':'افتح المصدر ↗','Open PMC full text ↗':'افتح النص الكامل على PMC ↗','Open DOI ↗':'افتح DOI ↗','Add to comparison':'أضف إلى المقارنة','✓ Added':'✓ تمت الإضافة','✓ In comparison':'✓ ضمن المقارنة','Removed from comparison':'تمت الإزالة من المقارنة','Study added to comparison':'تمت إضافة الدراسة إلى المقارنة','You can compare up to three studies':'يمكنك مقارنة ثلاث دراسات كحد أقصى','Keep at least two rows for pooling':'احتفظ بصفين على الأقل لإجراء الدمج','Enter at least two complete studies. OR, lower CI, and upper CI must be positive, with upper CI greater than lower CI.':'أدخل دراستين مكتملتين على الأقل. يجب أن تكون نسبة الأرجحية وحدود فاصل الثقة موجبة، وأن يكون الحد الأعلى أكبر من الحد الأدنى.','Records identified':'السجلات التي تم العثور عليها','Duplicates removed':'السجلات المكررة المستبعدة','Excluded after title / abstract':'المستبعد بعد العنوان / الملخص','Excluded after full-text review':'المستبعد بعد مراجعة النص الكامل','Full-text exclusion reasons':'أسباب الاستبعاد بعد مراجعة النص الكامل','Search PubMed ↗':'ابحث في PubMed ↗','Search map ↗':'ابحث على الخريطة ↗','Save demo note':'احفظ الملاحظة التجريبية','Add demo post':'أضف منشورًا تجريبيًا','Topic title':'عنوان الموضوع','Message':'الرسالة','Date':'التاريخ','General note':'ملاحظة عامة','Specialty':'التخصص','City or area':'المدينة أو المنطقة','Close':'إغلاق','Welcome!':'مرحبًا!','You':'أنت','Lupuscope AI':'مساعد لوبوسكوب الذكي','Conversation':'المحادثة','Safety boundary':'حدود الأمان','Evidence-aware guide':'مساعد يستند إلى الأدلة','Find kidney studies':'اعثر على دراسات الكلى','Explain OR and 95% CI':'اشرح OR وفاصل الثقة 95%','Guide me through extraction':'أرشدني في استخراج البيانات','Show parent resources':'اعرض موارد أولياء الأمور','ORIGINAL RECORD':'سجل أصلي','CANDIDATE ADDITION':'إضافة مرشحة','CANDIDATE':'مرشح','UNSCREENED RESULT':'نتيجة لم تخضع للفرز','No matching records.':'لا توجد سجلات مطابقة.','No local demo posts yet.':'لا توجد منشورات تجريبية محلية بعد.','No matching terms.':'لا توجد مصطلحات مطابقة.','Open original source ↗':'افتح المصدر الأصلي ↗','Search PubMed ↗':'ابحث في PubMed ↗','Enter a PubMed search query':'أدخل عبارة بحث في PubMed','Searching NCBI PubMed…':'جارٍ البحث في NCBI PubMed…','Could not reach PubMed. Check the internet connection and try again. You can still use the curated library.':'تعذر الوصول إلى PubMed. تحقق من اتصال الإنترنت وحاول مجددًا. يمكنك الاستمرار في استخدام المكتبة المنظمة.','D · EVIDENCE MAP':'د · خريطة الأدلة','Domain × study type matrix':'مصفوفة المجال × نوع الدراسة','Select a cell to filter the library. Counts describe records currently in this curated set.':'اختاري خلية لتصفية المكتبة. الأعداد تصف السجلات الموجودة في هذه المجموعة الحالية.','E · RESEARCH TIMELINE':'هـ · الخط الزمني للأبحاث','Records by publication year':'السجلات حسب سنة النشر','Only records with a recorded publication year are included.':'تُدرج السجلات التي لها سنة نشر مسجلة فقط.','F · POTENTIAL GAPS':'و · الفجوات المحتملة','Topics with lower representation':'موضوعات ذات تمثيل أقل','G · APPRAISAL STATUS':'ز · حالة التقييم المنهجي','Risk-of-bias assessment tracker':'متابعة تقييم خطر التحيز','H · META-ANALYSIS CALCULATOR':'ح · حاسبة التحليل التلوي','Use my current location':'استخدم موقعي الحالي','Your location is only requested after you press the button. Browser permission is required.':'لن يُطلب موقعك إلا بعد الضغط على الزر، ويلزم السماح من المتصفح.','Your map search will appear here':'سيظهر البحث على الخريطة هنا','Search by area or allow location access to center the map near you.':'ابحث باسم منطقة أو اسمح بالوصول للموقع لتوسيط الخريطة بالقرب منك.'
  }
};
const LANGUAGE_CONFIG = { en: { dir: 'ltr' }, ar: { dir: 'rtl' } };

const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();
let currentInterfaceLanguage = 'en';
function translateTextNode(node, language) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const original = originalTextNodes.get(node) ?? node.nodeValue;
  if (!originalTextNodes.has(node)) originalTextNodes.set(node, original);
  if (language === 'en') { node.nodeValue = original; return; }
  const trimmed = original.trim();
  if (!trimmed) return;
  const translated = UI_TRANSLATIONS[language]?.[trimmed];
  if (translated) {
    const start = original.match(/^\s*/)?.[0] || '';
    const end = original.match(/\s*$/)?.[0] || '';
    node.nodeValue = start + translated + end;
  }
}
function translateElementAttributes(element, language) {
  const attrs = ['placeholder','aria-label','title'];
  attrs.forEach(attr => {
    if (!element.hasAttribute?.(attr)) return;
    let saved = originalAttributes.get(element);
    if (!saved) { saved = {}; originalAttributes.set(element, saved); }
    if (!(attr in saved)) saved[attr] = element.getAttribute(attr);
    const original = saved[attr];
    element.setAttribute(attr, UI_TRANSLATIONS[language]?.[original] || original);
  });
}
function translateSubtree(root, language) {
  if (!root) return;
  const walk = node => {
    if (node.nodeType === Node.TEXT_NODE) { translateTextNode(node, language); return; }
    if (node.nodeType !== Node.ELEMENT_NODE && node !== document) return;
    if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node, language);
    for (const child of node.childNodes) walk(child);
  };
  walk(root);
}
function setInterfaceLanguage(language) {
  const supported = ['en', ...Object.keys(UI_TRANSLATIONS)];
  currentInterfaceLanguage = supported.includes(language) ? language : 'en';
  const direction = LANGUAGE_CONFIG[currentInterfaceLanguage]?.dir || 'ltr';
  document.documentElement.lang = currentInterfaceLanguage;
  document.documentElement.dir = direction;
  document.documentElement.dataset.language = currentInterfaceLanguage;
  document.title = currentInterfaceLanguage === 'ar' ? 'لوبوسكوب | من الأدلة إلى الفهم' : 'Lupuscope | From Evidence to Insight';
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = currentInterfaceLanguage === 'ar'
    ? 'لوبوسكوب — مساحة بحثية لتنظيم الأدلة المنشورة حول الذئبة الحمامية الجهازية التي تبدأ في الطفولة.'
    : 'Lupuscope — a research workspace for published evidence on childhood-onset systemic lupus erythematosus.';
  const selector = document.getElementById('languageSelect');
  if (selector) selector.value = currentInterfaceLanguage;
  try { localStorage.setItem('ls_lupuscope_language', currentInterfaceLanguage); } catch (_) {}
  translateSubtree(document.documentElement, currentInterfaceLanguage);
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.dir = 'auto';
}

const languageSelector = document.getElementById('languageSelect');
if (languageSelector) languageSelector.addEventListener('change', event => setInterfaceLanguage(event.target.value));
const savedLanguage = (() => {
  try { return localStorage.getItem('ls_lupuscope_language') || 'en'; }
  catch (_) { return 'en'; }
})();
setInterfaceLanguage(savedLanguage);

// Translate newly rendered cards, modal content and tool panels as well.
const languageObserver = new MutationObserver(records => {
  if (currentInterfaceLanguage === 'en') return;
  records.forEach(record => record.addedNodes.forEach(node => translateSubtree(node, currentInterfaceLanguage)));
});
languageObserver.observe(document.body, { childList: true, subtree: true });
