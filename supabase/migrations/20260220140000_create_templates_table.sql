-- Templates table for editable document templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('contract', 'pp_act_dynamic', 'pp_act_standard', 'samata')),
    content TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_template_updated_at();

-- Insert default templates
INSERT INTO templates (name, type, content, description) VALUES
('Sutartis', 'contract', '
<div>
    <div style="clear:both;">
        <p style="margin-top:0pt; margin-bottom:0pt; line-height:normal;"><img src="{{logo}}" width="186" height="63" alt="Logo"/></p>
    </div>
    <p style="margin-top:0pt; margin-right:0.2pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><strong><span style="font-family:Arial;">Ozo g. 1, Vilnius</span></strong><br><strong><span style="font-family:Arial;">UAB Įkrautas</span></strong></p>
    <p style="margin-top:0pt; margin-right:0.2pt; margin-bottom:0pt; line-height:115%; font-size:10pt;"><strong><span style="font-family:Arial;">Elektromobilių įkrovimo stotelių pardavimo ir įrengimo sutartis Nr. </span></strong><strong><span style="font-family:Arial; color:#548dd4;">{{offerNo}}</span></strong><strong><span style="font-family:Arial;">, Data: {{date}}</span></strong></p>
    <p style="margin-top:0pt; margin-right:0.2pt; margin-bottom:0pt; line-height:115%; font-size:8pt;"><strong><span style="font-family:Arial;">Klientas:</span></strong><span style="font-family:Arial;">&nbsp;</span><span style="font-family:Arial; color:#548dd4;">{{clientName}}</span><span style="font-family:Arial;">,&nbsp;</span><span style="font-family:Arial; color:#548dd4;">{{clientBirthDate}}</span><span style="font-family:Arial;">,&nbsp;</span><span style="font-family:Arial; color:#548dd4;">{{clientEmail}}</span><span style="font-family:Arial;">,&nbsp;</span><span style="font-family:Arial; color:#548dd4;">{{clientPhone}}</span><span style="font-family:Arial;">,&nbsp;</span><span style="font-family:Arial; color:#548dd4;">{{clientAddress}}</span><span style="font-family:Arial;">,</span></p>
    <p style="margin-top:0pt; margin-right:0.2pt; margin-bottom:0pt;"><strong><span style="line-height:115%; font-family:Arial; font-size:8pt;">Rangovas:</span></strong><span style="line-height:115%; font-family:Arial; font-size:8pt;">&nbsp;</span><strong><span style="line-height:115%; font-family:Arial; font-size:8pt;">UAB Įkrautas</span></strong><span style="line-height:115%; font-family:Arial; font-size:8pt;">, 305604922, LT100013332910, Ozo g. 3, LT-08200 Vilnius, el. paštas:&nbsp;</span><a href="mailto:info@ikrautas.lt" style="text-decoration:none;"><u><span style="line-height:115%; font-family:Arial; font-size:8pt; color:#0000ff;">info@ikrautas.lt</span></u></a><span style="line-height:115%; font-family:Arial; font-size:8pt;">, +37064700009, Banko A/S LT687044090100753403, SEB Bankas,</span></p>
    <ol type="1" style="margin:0pt; padding-left:0pt;">
        <li style="margin-right:0.2pt; margin-left:25.87pt; line-height:115%; padding-left:6.33pt; font-family:Arial; font-size:8pt; font-weight:bold;">Elektromobilių įkrovimo stotelės (-ių) montavimas ir rangos darbų sąmata:</li>
    </ol>
    <p style="margin-top:0pt; margin-right:0.2pt; margin-bottom:0pt; line-height:115%; font-size:8pt;"><span style="font-family:Arial;">&nbsp;</span></p>
    {{productsTable}}
    <ol start="2" type="1" style="margin:0pt; padding-left:0pt;">
        <li style="margin-top:13.15pt; margin-right:13.85pt; margin-left:25.87pt; line-height:115%; padding-left:6.33pt; font-family:Arial; font-size:8pt; font-weight:bold;">Atsiskaitymo tvarka: <span style="font-weight:normal;">Už perduotas Prekes ir atliktus Darbus Klientas Rangovui įsipareigoja sumokėti Kainą, lygią&nbsp;</span><span style="font-weight:normal; color:#548dd4;">{{finalTotal}}</span><span style="font-weight:normal;">&nbsp;EUR (su PVM).&nbsp;</span>
            <ol type="1" style="margin-right:0pt; margin-left:0pt; padding-left:0pt;">
                <li style="margin-left:29.67pt; padding-left:6.33pt; font-weight:normal;">50% Kainos, t.y. <span style="color:#548dd4;">{{advancePayment}}</span> EUR, per 5 kalendorines dienas nuo Sutarties pasirašymo dienos (avansinis mokėjimas). <strong>Atliekant avansinį mokėjimą būtina nurodyti mokėjimo numerį:&nbsp;</strong><strong><span style="color:#548dd4;">{{paymentReference}}</span></strong><strong>.</strong></li>
                <li style="margin-right:0.2pt; margin-left:29.67pt; padding-left:6.33pt; font-weight:normal;">50% Kainos, t.y. <span style="color:#548dd4;">{{finalPayment}}</span> EUR, sumokama per 7 kalendorines dienas nuo Rangovo Atliktų darbų priėmimo - perdavimo akto pasirašymo datos (pagal Rangovo išrašytą PVM sąskaitą-faktūrą).</li>
            </ol>
        </li>
        <li style="margin-right:0.2pt; margin-left:25.87pt; line-height:115%; padding-left:6.33pt; font-family:Arial; font-size:8pt; font-weight:bold;">Darbų atlikimo terminai ir kita svarbi informacija:<ol type="1" style="margin-right:0pt; margin-left:0pt; padding-left:0pt;">
                <li style="margin-right:0.2pt; margin-left:29.67pt; padding-left:6.33pt; font-weight:normal;"><strong>Garantija (išimtys sutarties bendrojoje dalyje 8.6. punkte)</strong>
                    <ol type="1" style="margin-right:0pt; margin-left:0pt; padding-left:0pt;">
                        <li style="margin-right:0.2pt; margin-left:10.52pt; padding-left:6.33pt;">Stotelei – <span style="color:#548dd4;">{{warrantyYears}}</span> metų;</li>
                        <li style="margin-right:0.2pt; margin-left:10.52pt; padding-left:6.33pt;">Atliktiems darbams – 2 metai;</li>
                        <li style="margin-right:0.2pt; margin-left:10.52pt; padding-left:6.33pt;">Sumontuotoms medžiagom – 2 metai;</li>
                    </ol>
                </li>
                <li style="margin-right:0.2pt; margin-left:29.67pt; padding-left:6.33pt; font-weight:normal;">Rangovas įsipareigoja atlikti Elektromobilių įkrovimo stotelės (toliau – Stotelė) įrengimo darbus per 8 savaites nuo Sutarties įsigaliojimo dienos.</li>
                <li style="margin-right:0.2pt; margin-left:29.67pt; padding-left:6.33pt; font-weight:normal;">Prekės pristatomos ir Darbai atliekami Statybos aikštelėje, esančioje: <span style="color:#548dd4;">{{clientAddress}}</span></li>
            </ol>
        </li>
        <li style="margin-right:0.2pt; margin-left:25.87pt; line-height:115%; padding-left:6.33pt; font-family:Arial; font-size:8pt; font-weight:bold;">Sutarties sąlygos: Sutarties bendrąsias sąlygas rasite paspaudę ant šios nuorodos: <a href="https://ikrautas.lt/wp-content/uploads/2024/09/Ikrovimo-irangos-pardavimo-ir-irengimo-salygos_Bendroji-dalis.pdf" style="text-decoration:none;"><u><span style="color:#0000ff;">NUORODA</span></u></a>
            <ol type="1" style="margin-right:0pt; margin-left:0pt; padding-left:0pt;">
                <li style="margin-right:0.2pt; margin-left:29.67pt; padding-left:6.33pt; font-weight:normal;">Šalys pasirašydamos sutinka su sutarties sąlygomis ir duomenų tvarkymu;</li>
            </ol>
        </li>
    </ol>
    {{signatureTable}}
</div>
', 'Default contract template'),

('PP Aktas su DGV', 'pp_act_dynamic', '
<div>
    <p><strong>PRIĖMIMO-PERDAVIMO AKTAS</strong></p>
    <p>Data: {{date}}</p>
    <p>Klientas: {{clientName}}</p>
    <p>Projekto vadovas: {{projectManagerName}}</p>
    <p>Adresas: {{clientAddress}}</p>
    <p>Šis aktas skirti elektromobilių įkrovimo stotelei su <strong>DINAMINIO GALIOS VALDIKLIO</strong> funkcija.</p>
    {{productsTable}}
    {{signatureTable}}
</div>
', 'PP Act template with dynamic power controller'),

('PP Aktas be DGV', 'pp_act_standard', '
<div>
    <p><strong>PRIĖMIMO-PERDAVIMO AKTAS</strong></p>
    <p>Data: {{date}}</p>
    <p>Klientas: {{clientName}}</p>
    <p>Projekto vadovas: {{projectManagerName}}</p>
    <p>Adresas: {{clientAddress}}</p>
    {{productsTable}}
    {{signatureTable}}
</div>
', 'PP Act template without dynamic power controller')

ON CONFLICT (name) DO NOTHING;

-- Add comments
COMMENT ON TABLE templates IS 'Stores editable document templates for offers, contracts, and acts';
COMMENT ON COLUMN templates.type IS 'Type of template: contract, pp_act_dynamic, pp_act_standard, samata';
COMMENT ON COLUMN templates.content IS 'HTML template content with {{variables}}';
