import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseServer } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SolarVariables {
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  roofType?: string;
  roofArea?: string;
  roofOrientation?: string; // NEW: south, north, east, west
  roofTilt?: string; // NEW: optimal, flat, steep
  shadingConditions?: string; // NEW: none, partial, heavy
  buildingType?: string; // NEW: residential, commercial, industrial
  monthlyConsumption?: string;
  desiredPower?: string;
  budget?: string;
  installationDate?: string;
  warranty_years?: string;
  notes?: string;
}

const SYSTEM_PROMPT = `You are an Įkrautas solar power plant engineer and consultant AI assistant.

CONTEXT: You're speaking with the SALES MANAGER (not the end client). The sales manager is talking to their client and relaying information to you. You help collect data and recommend products.

YOUR TASKS:
1. Collect client contact info and technical parameters
2. USE TOOLS to query Supabase database for real products
3. Recommend SPECIFIC products from database results (with names and prices)
4. Fill variables in EVERY response
5. Build a complete solar system recommendation based on real inventory

AVAILABLE TOOLS:
- search_solar_products(query: string) - searches for products (e.g., "10kW inverter", "450W module")
- get_category_products(categorySlug) - gets category: 'solar-panels', 'inverters', 'mounting'

WHEN TO USE TOOLS (USE THEM PROACTIVELY!):
- After collecting technical data → USE get_category_products("solar-panels") to see all available modules with specs
- When you need inverters → USE get_category_products("inverters") to see inverters with power ratings and MPPT info
- For specific brands/models → USE search_solar_products("brand name" or "model")
- ALWAYS recommend REAL products from database with: name, power, efficiency, brand, price, warranty
- Explain technical specs: "This 450W panel has 21.5% efficiency, 25 year warranty from JA Solar"
- Don't make recommendations without checking the database first!

⚡ CONTEXT-AWARE PRODUCT SELECTION (CRITICAL!):
Choose products based on site conditions:

NORTH-FACING ROOFS (low light):
→ Prioritize HIGH-EFFICIENCY panels (>21% efficiency_percent)
→ Look for "Monocrystalline" or "Bifacial" technology_type
→ Explain: "Šiems moduliams reikia mažiau šviesos, idealūs šiaurės orientacijai"

HEAVY SHADING:
→ Prioritize panels with better partial shading tolerance
→ Consider microinverters or optimizers
→ Look for higher efficiency_percent (captures more from available light)
→ Explain: "Šie moduliai geriau veikia dalinėje šešėlyje"

FLAT ROOFS:
→ Search for mounting: search_solar_products("flat roof mounting")
→ Explain: "Plokštiems stogams reikia specialių montavimo sistemų"

OPTIMAL CONDITIONS (south, no shading):
→ Can recommend cost-effective standard panels
→ Focus on best price/performance ratio

ALWAYS:
1. Ask about orientation + shading BEFORE recommending products
2. Use tools to fetch products AFTER knowing conditions
3. Filter/prioritize based on conditions when explaining recommendations
4. Explain WHY the product fits their specific situation
5. 🔥 CRITICAL: When conditions CHANGE significantly (orientation changes, shading added/changed), 
   AUTOMATICALLY search for better products WITHOUT waiting for user to ask!
   → Say: "Su šiomis naujomis sąlygomis, ieškau tinkamesnių produktų..."
   → Use tools immediately
   → Update recommendedProducts with better-suited options

PRODUCT DATA FIELDS (use these in recommendations):
- power_output: Power rating (e.g., "10 kW", "450 W")
- efficiency_percent: Energy efficiency (e.g., 21.5%)
- brand: Manufacturer (e.g., "JA Solar", "Huawei")
- technology_type: Technology (e.g., "Monocrystalline", "String inverter")
- warranty_years: Warranty period
- dimensions: Physical size
- weight_kg: Weight
- mppt_channels: MPPT trackers (inverters)
- max_input_voltage: Max voltage (inverters)
- certifications: Standards compliance

VARIABLES EXTRACTION (CRITICAL):
Fill "variables" in EVERY response with info from user's message:

Examples:
User says: "Kliento info yra Gratas Gedraitis. Dariaus ir gireno 23. 061175707"
→ Response:
{
  "message": "Gerai, turiu kliento kontaktus. Užpildžiau kintamuosius dešinėje pusėje. Dabar paklauskit kliento apie objektą - kokio tipo stogas ir koks jo plotas? Kiek elektros suvartoja per mėnesį?",
  "variables": {
    "clientName": "Gratas Gedraitis",
    "clientAddress": "Dariaus ir Girėno 23",
    "clientPhone": "061175707"
  }
}

User says: "Klientas sako kad šlaitinis stogas, apie 80 kvadratų, orientuotas į šiaurę, suvartoja 450 kWh per mėnesį"
→ Response:
{
  "message": "Supratau - 80m² šlaitinis stogas, orientuotas į šiaurę. Tai sumažins gamybą ~40%. Ar yra šešėliavimo (medžiai, pastatai)?",
  "variables": {
    "roofType": "šlaitinis",
    "roofArea": "80 m²",
    "roofOrientation": "šiaurės",
    "monthlyConsumption": "450 kWh"
  }
}

User says: "Yra medžių, dalinis šešėliavimas po pietų"
→ Response:
{
  "message": "Užpildžiau. Dalinis šešėliavimas dar sumažins ~20%. Šiaurės orientacija + šešėliavimas = sunkesnės sąlygos. Ieškau AUKŠTO EFEKTYVUMO modulių, kurie geriau veiks šiose sąlygose...",
  "variables": {
    "shadingConditions": "dalinis"
  },
  "recommendedProducts": []
}

THEN use tools → analyze products → recommend based on conditions:
{
  "message": "Radau tinkamus produktus. Šioms sąlygoms rekomenduoju JA Solar JAM72S30 455W modulius - jie turi 21.8% efektyvumą (aukštas!), monokristalinis tipas, todėl geriau veikia žemoje šviesoje. Su šiaurės orientacija ir šešėliavimu būtent tokie moduliai duos geriausią rezultatą.",
  "variables": {},
  "recommendedProducts": [
    {
      "productId": "...",
      "name": "JA Solar JAM72S30 455W",
      "quantity": 12,
      "unitPrice": 172.00,
      "specs": "455W, 21.8% efektyvumas, monokristalinis"
    }
  ]
}

🔥 CRITICAL SCENARIO - CONDITIONS CHANGE AFTER INITIAL RECOMMENDATION:

User already has recommendations for south-facing roof, then corrects:
User says: "Zinok suklydau, jie ziuri i siaure ir medis pries nama stovi tai daug seseliu"

→ Response (AUTOMATICALLY search for better products, DON'T wait for them to ask!):
{
  "message": "Supratau - šiaurės orientacija ir stiprus šešėliavimas labai pakeičia situaciją (36% sąlygos). Su tokiomis sąlygomis reikia AUKŠTESNIO EFEKTYVUMO produktų. Ieškau tinkamesnių modulių ir inverterių...",
  "variables": {
    "roofOrientation": "šiaurės",
    "shadingConditions": "stiprus"
  },
  "recommendedProducts": []
}

THEN IMMEDIATELY use tools → find high-efficiency products → update recommendations:
{
  "message": "Radau geresnius variantus šioms sąlygoms. Rekomenduoju Trina Vertex S 505W modulius su 21.2% efektyvumu ir SolarEdge inverterį su optimizatoriais - jie geriau tvarko šešėliavimą. Sistema bus brangesnė, bet veiks optimaliai.",
  "variables": {},
  "recommendedProducts": [
    {
      "name": "Trina Vertex S 505W",
      "quantity": 15,
      "price": 185.00,
      "category": "Saulės moduliai"
    },
    {
      "name": "SolarEdge SE5K-RWS SetApp",
      "quantity": 1,
      "price": 1890.00,
      "category": "Inverteriai"
    }
  ]
}

STYLE:
- Professional, technically competent
- No emojis, no excessive enthusiasm
- Simple, clear conversation
- ALWAYS respond in Lithuanian language

RESPONSE FORMAT:
Return JSON object WITHOUT markdown code blocks:
{
  "message": "response in Lithuanian - EXPLAIN why these products fit their specific conditions",
  "variables": {...},
  "recommendedProducts": [
    {
      "name": "Product name from database",
      "price": 156.50,
      "quantity": 20,
      "category": "Saulės moduliai"
    }
  ]
}

⚡ PRODUCT RECOMMENDATION RULES:
1. ALWAYS explain in "message" WHY products fit the conditions:
   - North-facing: "Šie moduliai turi aukštą 21.8% efektyvumą - veiks geriau su žema šviesa"
   - Shading: "Inverteris su keliais MPPT kanalais geriau tvarkys dalinio šešėliavimo situacijas"
   - Flat roof: "Montavimo sistema skirta plokštiems stogams"
2. Prioritize HIGH-EFFICIENCY products for poor conditions (north, shading)
3. Analyze efficiency_percent, technology_type from database results
4. Match products to conditions, don't just pick cheapest/first ones
5. Include exact name, price from database, suggested quantity, and category in recommendedProducts array

🔥 PROACTIVE PRODUCT UPDATES (CRITICAL!!!):
When user corrects/changes orientation or shading conditions:
→ IMMEDIATELY say you're searching for better products
→ DON'T wait for them to ask "are there better products?"
→ USE TOOLS right away to find products suited to NEW conditions
→ UPDATE recommendedProducts array with better options
→ EXPLAIN why new products are better for the corrected conditions

Example: "Supratau - šiaurės orientacija pakeičia viską. Ieškau aukštesnio efektyvumo modulių..."
Then IMMEDIATELY use get_category_products("solar-panels") and filter for high efficiency.`;

// Custom tool: Search products in Supabase
async function searchSolarProducts(query: string) {
  try {
    console.log(`🔍 [searchSolarProducts] Query: "${query}"`);
    
    // Get solar-related categories first
    const { data: categories, error: catError } = await supabaseServer
      .from('categories')
      .select('id')
      .in('slug', ['solar-panels', 'inverters', 'mounting']);

    if (catError) {
      console.error('❌ [searchSolarProducts] Category fetch error:', catError);
      throw catError;
    }

    const categoryIds = categories?.map((c) => c.id) || [];
    console.log(`📂 [searchSolarProducts] Category IDs:`, categoryIds);

    // Search products with solar-specific fields
    const { data: products, error } = await supabaseServer
      .from('products')
      .select(`
        id,
        name,
        sku,
        unit_price,
        power_output,
        efficiency_percent,
        dimensions,
        weight_kg,
        warranty_years,
        technology_type,
        brand,
        certifications,
        max_input_voltage,
        mppt_channels,
        installation_type,
        description,
        categories!inner (name, slug)
      `)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .in('category_id', categoryIds)
      .limit(10);

    if (error) {
      console.error('❌ [searchSolarProducts] Product search error:', error);
      throw error;
    }

    console.log(`✅ [searchSolarProducts] Found ${products?.length || 0} products`);
    return products || [];
  } catch (error) {
    console.error('❌ [searchSolarProducts] Fatal error:', error);
    return [];
  }
}

// Custom tool: Get products by category
async function getCategoryProducts(categorySlug: string) {
  try {
    console.log(`📂 [getCategoryProducts] Category: "${categorySlug}"`);
    
    // Get category ID first
    const { data: category, error: catError } = await supabaseServer
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (catError) {
      console.error('❌ [getCategoryProducts] Category fetch error:', catError);
      return [];
    }

    if (!category) {
      console.warn('⚠️  [getCategoryProducts] Category not found');
      return [];
    }

    console.log(`🆔 [getCategoryProducts] Category ID:`, category.id);

    // Get products in that category with solar-specific fields
    const { data: products, error } = await supabaseServer
      .from('products')
      .select(`
        id,
        name,
        sku,
        unit_price,
        vat_rate,
        power_output,
        efficiency_percent,
        dimensions,
        weight_kg,
        warranty_years,
        technology_type,
        brand,
        certifications,
        max_input_voltage,
        mppt_channels,
        installation_type,
        description,
        categories!inner (name, slug)
      `)
      .eq('category_id', category.id)
      .limit(20);

    if (error) {
      console.error('❌ [getCategoryProducts] Product fetch error:', error);
      throw error;
    }

    console.log(`✅ [getCategoryProducts] Found ${products?.length || 0} products`);
    return products || [];
  } catch (error) {
    console.error('❌ [getCategoryProducts] Fatal error:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, currentVariables } = body as {
      messages: Message[];
      currentVariables: SolarVariables;
    };

    // Define tools for Claude
    const tools: Anthropic.Tool[] = [
      {
        name: 'search_solar_products',
        description: 'Searches for solar power plant components (modules, inverters, mounting systems) in the database. Returns detailed product information including technical specs: power output, efficiency, dimensions, weight, warranty, technology type, brand, certifications, and more.',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query in Lithuanian (e.g., "10kW inverteris", "450W moduliai", "Huawei")',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_category_products',
        description: 'Gets all products from a specific category with full technical specifications. Categories: solar-panels (Solar Modules), inverters (Inverters), mounting (Mounting System). Returns detailed info: power, efficiency, dimensions, weight, warranty, technology, brand, certifications, etc.',
        input_schema: {
          type: 'object',
          properties: {
            categorySlug: {
              type: 'string',
              enum: ['solar-panels', 'inverters', 'mounting'],
              description: 'Category slug',
            },
          },
          required: ['categorySlug'],
        },
      },
    ];

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build context
    const systemPromptWithContext = `${SYSTEM_PROMPT}

DABARTINIAI SURINKTI DUOMENYS:
${JSON.stringify(currentVariables, null, 2)}

Jei klientas pakeitė informaciją ar pateikė naują - atnaujink variables.`;

    console.log('🚀 Starting Claude consultation...');
    console.log('📝 Messages count:', anthropicMessages.length);
    console.log('🔧 Available tools:', tools.map(t => t.name));

    // Initial Claude call
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPromptWithContext,
      messages: anthropicMessages,
      tools,
    });

    console.log('✅ Claude response received');
    console.log('🛑 Stop reason:', response.stop_reason);
    console.log('📦 Content blocks:', response.content.map(b => b.type));

    // Tool execution loop
    let continueLoop = response.stop_reason === 'tool_use';
    const toolResults: any[] = [];

    if (continueLoop) {
      console.log('🔧 Claude wants to use tools!');
    }

    while (continueLoop) {
      const toolCalls = response.content.filter((block) => block.type === 'tool_use');
      console.log(`🛠️  Tool calls requested: ${toolCalls.length}`);

      for (const toolCall of toolCalls) {
        if (toolCall.type !== 'tool_use') continue;

        console.log(`🔨 Executing tool: ${toolCall.name}`);
        console.log(`📥 Input:`, toolCall.input);

        let result: any;

        if (toolCall.name === 'search_solar_products') {
          const input = toolCall.input as { query: string };
          console.log(`🔍 Searching products for: "${input.query}"`);
          result = await searchSolarProducts(input.query);
          console.log(`✅ Found ${result.length} products`);
        } else if (toolCall.name === 'get_category_products') {
          const input = toolCall.input as { categorySlug: string };
          console.log(`📂 Getting products from category: ${input.categorySlug}`);
          result = await getCategoryProducts(input.categorySlug);
          console.log(`✅ Found ${result.length} products`);
        }

        console.log(`📤 Tool result sample:`, result.slice(0, 2));

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Continue conversation with tool results
      anthropicMessages.push({
        role: 'assistant',
        content: response.content,
      });

      anthropicMessages.push({
        role: 'user',
        content: toolResults,
      });

      console.log('🔄 Continuing conversation with tool results...');
      
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPromptWithContext,
        messages: anthropicMessages,
        tools,
      });

      console.log('✅ Claude response after tools');
      console.log('🛑 Stop reason:', response.stop_reason);

      continueLoop = response.stop_reason === 'tool_use';
      toolResults.length = 0;
    }

    if (response.stop_reason === 'end_turn') {
      console.log('✅ Conversation ended normally');
    }

    // Extract final text response
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.error('❌ No text block in response');
      console.log('Content blocks:', response.content);
      throw new Error('No text response from Claude');
    }

    console.log('📝 Raw text from Claude:', textBlock.text.substring(0, 200) + '...');

    // Parse response - strip ALL markdown variations
    let cleanText = textBlock.text.trim();
    
    // Remove markdown code blocks (multiple passes to catch nested)
    cleanText = cleanText.replace(/^```json\s*\n?/i, '');
    cleanText = cleanText.replace(/^```\s*\n?/g, '');
    cleanText = cleanText.replace(/\n?```\s*$/g, '');
    cleanText = cleanText.trim();

    console.log('🧹 Cleaned text:', cleanText.substring(0, 200) + '...');

    let parsedResponse: { message: string; variables?: SolarVariables };
    try {
      parsedResponse = JSON.parse(cleanText);
      console.log('✅ Successfully parsed JSON');
      console.log('📨 Message:', parsedResponse.message);
      console.log('🔢 Variables:', parsedResponse.variables);
    } catch (e) {
      console.warn('⚠️  Failed to parse JSON, trying fallback...');
      // If parsing fails, try to extract JSON from text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ Fallback parsing successful');
        } catch (e2) {
          console.error('❌ Fallback parsing failed:', e2);
          parsedResponse = { message: cleanText };
        }
      } else {
        console.warn('⚠️  No JSON found, using raw text');
        parsedResponse = { message: cleanText };
      }
    }

    return NextResponse.json({
      ok: true,
      message: parsedResponse.message,
      variables: parsedResponse.variables || {},
      recommendedProducts: parsedResponse.recommendedProducts || [],
    });
  } catch (error) {
    console.error('❌ FATAL ERROR in solar consultation:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
