# 🎯 CONTEXT-AWARE PRODUCT RECOMMENDATIONS

## What Changed

Claude AI now **intelligently adapts product recommendations** based on site conditions! It doesn't just recommend random panels - it picks the BEST products for each specific situation.

---

## 🧠 SMART PRODUCT SELECTION

### Before (Dumb):
```
User: "Šiaurės orientacija, daug šešėliavimo"
Claude: "Rekomenduoju standartinį 400W modulį" ❌
→ Not optimized for low light!
```

### After (Smart):
```
User: "Šiaurės orientacija, daug šešėliavimo"
Claude: 
1. Recognizes DIFFICULT conditions
2. Searches for HIGH-EFFICIENCY panels (>21%)
3. Prioritizes monocrystalline/bifacial technology
4. Explains: "Šie 455W moduliai turi 21.8% efektyvumą - 
   veiks GERIAU su žema šviesa negu standartiniai" ✅
```

---

## 📋 CONDITION-BASED RECOMMENDATIONS

### 1. 🧭 North-Facing Roofs (Low Light)

**What Claude Does:**
- Prioritizes **high-efficiency panels** (>21% efficiency_percent)
- Looks for **"Monocrystalline"** or **"Bifacial"** technology_type
- Filters out lower-efficiency budget panels

**Example Message:**
```
"Šiems sąlygoms rekomenduoju JA Solar JAM72S30 455W modulius - 
 jie turi 21.8% efektyvumą (aukštas!), monokristalinis tipas, 
 todėl geriau veikia žemoje šviesoje. Su šiaurės orientacija 
 būtent tokie moduliai duos geriausią rezultatą."
```

**Why It Matters:**
- North-facing = 40% less light
- Need MAXIMUM efficiency to compensate
- Wrong panel choice = even worse ROI

---

### 2. 🌳 Heavy Shading

**What Claude Does:**
- Prioritizes **high-efficiency panels** (capture more from available light)
- Considers **microinverters or optimizers**
- Looks for panels with better partial shading tolerance
- Recommends inverters with **multiple MPPT channels**

**Example Message:**
```
"Dėl šešėliavimo rekomenduoju Fronius inverterį su 2 MPPT kanalais - 
 jis geriau tvarkys situacijas, kai dalis modulių šešėlyje. 
 Taip pat aukšto efektyvumo 455W modulius, kad maksimaliai 
 išnaudotų prieinamą šviesą."
```

**Why It Matters:**
- Shading = uneven production across panels
- Standard inverter = all panels limited by worst performer
- Multiple MPPT = each string optimized independently

---

### 3. 📐 Flat Roofs

**What Claude Does:**
- Searches specifically: `search_solar_products("flat roof mounting")`
- Recommends **flat roof mounting systems**
- Explains installation considerations

**Example Message:**
```
"Plokščiam stogui reikia specialių montavimo sistemų su 
 balastais arba tvirtinimais. Rekomenduoju..."
```

**Why It Matters:**
- Can't use standard mounting (needs angle adjustment)
- Weight distribution critical
- Wind load considerations

---

### 4. ☀️ Optimal Conditions (South, No Shading)

**What Claude Does:**
- Can recommend **cost-effective standard panels**
- Focuses on **best price/performance ratio**
- Doesn't over-engineer

**Example Message:**
```
"Jūsų sąlygos idealios! Galime rinktis ekonomiškesnius 
 variantus. Rekomenduoju 430W modulius - geras santykis 
 kaina/galia."
```

**Why It Matters:**
- Don't overpay for features you don't need
- Standard panels work great in optimal conditions
- Better ROI with smart budgeting

---

## 🔄 DECISION FLOW

Claude now follows this intelligent flow:

```
1. COLLECT CONDITIONS FIRST
   ↓ "Ar stogas orientuotas į pietus, rytus, vakarus ar šiaurę?"
   ↓ "Ar yra šešėliavimo?"
   
2. ANALYZE CONDITIONS
   ↓ North + Shading = DIFFICULT (48% production factor)
   ↓ South + No shading = OPTIMAL (100%)
   
3. SEARCH WITH INTENT
   ↓ get_category_products("solar-panels")
   ↓ Reviews ALL available products with specs
   
4. FILTER & PRIORITIZE
   ↓ Difficult conditions → filter for efficiency_percent >21%
   ↓ Optimal conditions → balance price vs performance
   
5. RECOMMEND WITH JUSTIFICATION
   ↓ "Rekomenduoju X, nes turi Y efektyvumą, 
      kuris IDEALIAI tinka jūsų Z sąlygoms"
   
6. UPDATE RECOMMENDED PRODUCTS
   ↓ recommendedProducts array → shows in UI with price
```

---

## 💬 EXAMPLE CONVERSATIONS

### Scenario 1: North + Shading (Worst Case)

```
User: "500 kWh/mėn, šiaurės orientacija"
Claude: "Supratau. Šiaurės orientacija sumažins ~40%. Ar yra šešėliavimo?"

User: "Taip, daug medžių"
Claude: "Užpildžiau. Sunkios sąlygos (36% faktorius). 
        Ieškau AUKŠTO EFEKTYVUMO produktų..."

[Claude uses tools → finds products → analyzes specs]

Claude: "Radau tinkamus produktus. Šioms sąlygoms rekomenduoju:
        
        JA Solar JAM72S30 455W modulius:
        - 21.8% efektyvumas (AUKŠTAS!)
        - Monokristalinis tipas
        - Veikia geriau žemoje šviesoje
        
        Fronius Primo 5.0-1 inverterį:
        - 2 MPPT kanalai
        - Geriau tvarko šešėliavimą
        
        Su šiais produktais sistema veiks OPTIMALIAI 
        jūsų sąlygoms, nors atsiperkamumas bus ilgesnis."

→ recommendedProducts updated with these items
→ Calculator shows realistic 13-year payback
→ Client sees HONEST, SMART recommendation
```

### Scenario 2: Perfect Conditions

```
User: "600 kWh/mėn, pietų orientacija, be šešėliavimo"
Claude: "Puikios sąlygos! 100% faktorius. Galime rinktis 
        ekonomiškesnius variantus su puikiu ROI..."

[Claude uses tools → prioritizes value]

Claude: "Rekomenduoju standartinių 430W modulių sistemą:
        - Gera kaina
        - 20.5% efektyvumas (pakanka su jūsų šviesumu)
        - Atsiperkamumas tik 6 metai
        - 25 metų pelnas: +22,000 EUR"

→ Doesn't over-engineer
→ Best ROI
→ Client happy with value
```

---

## 🛠️ TECHNICAL IMPLEMENTATION

### Updated Prompt Sections:

1. **New "CONTEXT-AWARE PRODUCT SELECTION" block:**
   - Explicit rules for each condition type
   - Examples of what to prioritize
   - Sample explanations in Lithuanian

2. **Updated Examples:**
   - Shows condition collection → product search → recommendation flow
   - Demonstrates justification language

3. **New "PRODUCT RECOMMENDATION RULES":**
   - 5 specific rules Claude must follow
   - Emphasizes EXPLAINING choices
   - Mandates analyzing product specs (efficiency_percent, technology_type)

### Key Instructions Added:

```typescript
⚡ CONTEXT-AWARE PRODUCT SELECTION (CRITICAL!):
Choose products based on site conditions:

NORTH-FACING ROOFS (low light):
→ Prioritize HIGH-EFFICIENCY panels (>21% efficiency_percent)
→ Look for "Monocrystalline" or "Bifacial" technology_type
→ Explain: "Šiems moduliams reikia mažiau šviesos..."

HEAVY SHADING:
→ Prioritize panels with better partial shading tolerance
→ Consider microinverters or optimizers
→ Look for higher efficiency_percent
→ Explain: "Šie moduliai geriau veikia dalinėje šešėlyje"

[etc...]

ALWAYS:
1. Ask about orientation + shading BEFORE recommending
2. Use tools to fetch products AFTER knowing conditions
3. Filter/prioritize based on conditions
4. Explain WHY the product fits their situation
```

---

## ✅ TESTING SCRIPT

### Test 1: North + Shading

```bash
1. Start conversation
2. Provide: "500 kWh/mėn, šiaurės orientacija, dalinis šešėliavimas"
3. Verify:
   ✓ Claude asks about conditions FIRST
   ✓ Searches products AFTER conditions known
   ✓ Recommends HIGH-EFFICIENCY panels (>21%)
   ✓ EXPLAINS: "veikia geriau žemoje šviesoje"
   ✓ Mentions monocrystalline/technology type
   ✓ recommendedProducts array populated
   ✓ Calculator shows realistic (worse) numbers
```

### Test 2: Perfect Conditions

```bash
1. New conversation
2. Provide: "600 kWh/mėn, pietų orientacija, be šešėliavimo"
3. Verify:
   ✓ Claude recognizes optimal conditions
   ✓ Recommends cost-effective options
   ✓ Focuses on price/performance
   ✓ Doesn't over-engineer
   ✓ Mentions good ROI
```

### Test 3: Changing Conditions

```bash
1. Start with: "500 kWh/mėn"
2. Say: "Pietų orientacija" → See standard recommendations
3. Say: "Atsiprašau, ne pietus, šiaurė" 
4. Verify:
   ✓ Claude IMMEDIATELY acknowledges impact
   ✓ Offers to REVISE product recommendations
   ✓ Explains NEW products better for north
   ✓ recommendedProducts updates
   ✓ Calculator adjusts
```

---

## 🎯 IMPACT

### For Demo:
- **Shows AI intelligence** - not just random recommendations
- **Educates clients** - they understand WHY certain products
- **Builds trust** - honest about difficult conditions
- **Professional** - technical knowledge demonstrated

### For Real Use:
- **Better outcomes** - clients get RIGHT products for their site
- **Fewer complaints** - realistic expectations set upfront
- **Higher satisfaction** - system performs as promised
- **Competitive advantage** - consultative selling vs transactional

---

## 🚀 FUTURE ENHANCEMENTS

Potential additions:
1. **Budget-aware** recommendations (premium vs economy)
2. **Brand preferences** (client loyalty programs)
3. **Availability** filtering (in-stock products)
4. **Installation complexity** scoring
5. **Warranty comparison** tool
6. **Performance guarantees** for conditions

---

**Status:** ✅ COMPLETE - Claude now thinks like a solar engineer!
